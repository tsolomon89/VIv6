/**
 * @deprecated This middleware is deprecated. Use the ODAC auth middleware instead.
 * @see src/modules/auth/middleware.ts - protectedRoute, loadODAC
 *
 * Migration: Replace `requireTenancy` with `...protectedRoute` from '@/modules/auth/middleware.js'
 * The new ODAC system uses `req.user` and `req.odac` instead of `req.context`
 *
 * This file is kept for backwards compatibility but should not be used in new code.
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../../core/db.js';
import { SYSTEM_ACCOUNT_ID } from '../../core/constants.js';

// Extend Request definition to include context
/** @deprecated Use req.user and req.odac from ODAC middleware instead */
declare global {
  namespace Express {
    interface Request {
      context?: {
        userId: string;
        accountId: string;
        permissionLevel: string;
        roleOverrides: Record<string, any>;
      };
    }
  }
}

export const requireTenancy = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[DEBUG] requireTenancy called for ${req.method} ${req.path}`);
  const userId = req.headers['x-user-id'] as string;
  const accountId = (req.query.account_id as string) || (req.headers['x-account-id'] as string);

  // 0. Admin Bypass
  if (res.locals.isAdmin) {
      req.context = {
          userId: userId || 'admin',
          accountId: accountId || 'admin',
          permissionLevel: 'admin',
          roleOverrides: {}
      };
      return next();
  }

  // 1. Missing Identity or Context
  if (!userId) {
    // For now, if we are in dev mode and no user provided, maybe we default?
    // But the goal is *Enforced* Tenancy. So we should probably block or require it.
    // However, existing "Tier 0" tests might break if we strictly enforce X-User-Id immediately without updating them.
    // Let's enforce it strictly for this phase as per plan.
    return res.status(401).json({ error: 'Unauthorized: Missing X-User-Id header' });
  }

  if (!accountId) {
    // Some routes might not need account_id (e.g. listing all accessible accounts?)
    // But for /records, we generally need it.
    // If param is missing, we might skip *Contextual* check and rely on downstream logic to catch it?
    // Or we assume this middleware is ONLY used on routes that REQUIRE account scope.
    return res.status(400).json({ error: 'Context Error: Missing account_id query parameter' });
  }

  try {
    // 2. Verify Account Exists (Simplified tenancy for dev testing)
    // NOTE: Full implementation would check user→account membership via a user_accounts table
    // For now, we verify the account exists and trust the authenticated user_id header
    const isSystemAccount = accountId === SYSTEM_ACCOUNT_ID;

    if (!isSystemAccount) {
      // Check if account exists as a record OR if any records exist for this account_id
      const accountStmt = db.prepare(`
        SELECT 1 FROM records
        WHERE (id = ? AND type = 'account') OR account_id = ?
        LIMIT 1
      `);
      const accountExists = accountStmt.get(accountId, accountId);

      if (!accountExists) {
        console.warn(`[Tenancy] Denied: Account ${accountId} does not exist`);
        return res.status(403).json({ error: 'Forbidden: Account not found.' });
      }
    }

    // Default role based on auth status (simplified for dev)
    const role = res.locals.isAdmin ? 'admin' : 'viewer';

    // 3. Attach Context
    req.context = {
      userId,
      accountId,
      permissionLevel: role,
      roleOverrides: {}
    };

    console.log(`[Tenancy] Granted: User ${userId} accessing account ${accountId} as ${role}`);
    next();
  } catch (err) {
    console.error('Tenancy check failed:', err);
    res.status(500).json({ error: 'Internal Server Error during tenancy check' });
  }
};
