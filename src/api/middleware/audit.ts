
import { Request, Response, NextFunction } from 'express';
import { db } from '../../core/db.js';
import { randomUUID } from 'crypto';
import { SYSTEM_ACCOUNT_ID } from '../../core/constants.js';

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only audit mutating methods
  if (req.method === 'GET' || req.method === 'OPTIONS' || req.method === 'HEAD') {
    return next();
  }

  // Hook into response finish to capture status
  res.on('finish', () => {
    // DECISION: Only log successful operations (2xx) for "Ledger of Truth".
    // Rationale: Failed requests (4xx/5xx) don't change state and are logged
    // via error handling middleware. Audit trail focuses on actual data changes.
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logActivity(req, res.statusCode);
    }
  });

  next();
};

function logActivity(req: Request, status: number) {
  try {
    // Use ODAC pattern: req.user for authenticated user, req.odac for account context
    const userId = req.user?.userId;
    const accountId = req.odac?.accountId || req.headers['x-account-id'] as string || SYSTEM_ACCOUNT_ID;

    // Minimal data to log
    const activity = {
      id: randomUUID(),
      account_id: accountId,
      contact_id: userId,
      activity_type: 'system_audit',
      data: JSON.stringify({
        method: req.method,
        path: req.path,
        status: status,
        // diff: ... (Hard to capture generic diff without hacking res.send)
        // For now, log the fact it happened.
        timestamp: new Date().toISOString()
      }),
      occurred_at: new Date().toISOString()
    };

    // Fire and forget (async insert)
    // Use setImmediate to not block? 
    // better-sqlite3 is sync, so it will block slightly.
    // Given low volume, it's fine.
    
    // Fire and forget (async insert)
    const stmt = db.prepare(`
      INSERT INTO records (id, slug, name, type, account_id, data, created_at, updated_at)
      VALUES (@id, @slug, @name, 'activity', @account_id, @data, @occurred_at, @occurred_at)
    `);

    stmt.run({
        id: activity.id,
        slug: `audit-${activity.id}`,
        name: 'System Audit',
        account_id: activity.account_id,
        data: JSON.stringify({
            ...JSON.parse(activity.data as string),
            activity_type: activity.activity_type,
            user_id: activity.contact_id
        }),
        occurred_at: activity.occurred_at
    });

  } catch (err) {
    console.error('[Audit] Failed to log activity:', err);
    // Do not crash the request
  }
}
