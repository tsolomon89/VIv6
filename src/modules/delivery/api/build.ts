import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../../core/db.js';
import { derivePage } from '../compiler.js';
import { getRecord } from '../../content/services.js'; // Cross-module import
import { createHash } from 'crypto';
import { protectedRoute } from '../../auth/middleware.js';

const router = Router();

interface BuildStateRow {
  entity_id: string;
  content_hash: string;
  status: string;
  last_built_at: string | null;
  error: string | null;
}

// GET /api/builds - List build states
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT bs.*, e.slug as entity_slug, e.name as entity_name, e.type as entity_type
      FROM build_state bs
      JOIN entities e ON e.id = bs.entity_id
    `;
    const args: string[] = [];

    if (status && typeof status === 'string') {
      query += ' WHERE bs.status = ?';
      args.push(status);
    }

    query += ' ORDER BY bs.last_built_at DESC';

    const rows = db.prepare(query).all(...args);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/builds/summary - Build status counts
router.get('/summary', (req: Request, res: Response, next: NextFunction) => {
  try {
    const counts = db.prepare(`
      SELECT status, COUNT(*) as count FROM build_state GROUP BY status
    `).all() as Array<{ status: string; count: number }>;

    const summary: Record<string, number> = { pending: 0, success: 0, error: 0 };
    for (const row of counts) {
      summary[row.status] = row.count;
    }
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// POST /api/builds/:entityId - Trigger build for a single entity
router.post('/:entityId', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entityId } = req.params;
    const entity = getRecord(entityId as string);

    if (!entity) {
      res.status(404).json({ error: 'Entity not found', status: 404 });
      return;
    }

    // Mark as pending
    db.prepare(`
      INSERT INTO build_state (entity_id, content_hash, status, last_built_at)
      VALUES (?, '', 'pending', ?)
      ON CONFLICT(entity_id) DO UPDATE SET status = 'pending', last_built_at = excluded.last_built_at
    `).run(entityId, new Date().toISOString());

    // Derive page
    const derived = derivePage(entity.slug);

    if (!derived) {
      db.prepare(`
        UPDATE build_state SET status = 'error', error = 'No derivation output' WHERE entity_id = ?
      `).run(entityId);

      res.json({ status: 'error', error: 'No derivation output' });
      return;
    }

    const contentHash = createHash('md5').update(JSON.stringify(derived)).digest('hex');

    // Mark as success
    db.prepare(`
      UPDATE build_state SET status = 'success', content_hash = ?, error = NULL, last_built_at = ? WHERE entity_id = ?
    `).run(contentHash, new Date().toISOString(), entityId);

    res.json({
      status: 'success',
      entity_slug: entity.slug,
      sections: derived.sections.length,
      segment_pages: derived.segmentPages.length,
    });
  } catch (err) {
    // Mark as error
    const { entityId } = req.params;
    db.prepare(`
      UPDATE build_state SET status = 'error', error = ? WHERE entity_id = ?
    `).run(String(err), entityId);
    next(err);
  }
});

export default router;
