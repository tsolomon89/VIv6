import { Router, Request, Response, NextFunction } from 'express';
import {
  createRecord,
  getRecord,
  getRecordBySlug,
  updateRecord,
  deleteRecord,
  listRecords,
} from '../../core/records.js';
import { checkIdempotency } from '../../core/idempotency.js';
import { validate, validateQuery } from '../middleware/validation.js';
import {
  RecordInputSchema,
  RecordUpdateSchema,
  RecordQuerySchema,
} from '../schemas.js';
import { EntityType } from '../../core/types.js'; // Keep EntityType as mostly internal enum
import { protectedRoute } from '../../modules/auth/middleware.js';
import { Reader } from '../../contracts/Reader.js';
import { db } from '../../core/db.js'; // Direct DB access for routing logic
import { hooks } from '../../core/hooks.js'; // Tier-0 Hooks
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';

const router = Router();

// GET /api/records - List all records
router.get(
  '/',
  validateQuery(RecordQuerySchema),
  ...protectedRoute, // ODAC: allowApiKeyBypass, parseSession, requireSession, loadODAC
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = (req as any).validatedQuery || {};
      const type = validatedQuery.type as EntityType | undefined;
      const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;
      
      const records = listRecords(accountId, type);
      
      // return structured EntityData (FieldGroups) for Admin UI
      const projected = records.map(r => ({
          ...r,
          data: Reader.toEntityData(r.data)
      }));

      res.json(projected);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/records/:id - Get single record
router.get('/:id', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Try by ID first, then by slug
    let record = getRecord(id as string);
    
    if (!record) {
      record = getRecordBySlug(DEFAULT_ACCOUNT_ID, id as string);
    }
    
    if (!record) {
      res.status(404).json({
        error: 'Record not found',
        status: 404,
      });
      return;
    }
    
    // structured EntityData for Admin UI
    const projected = {
        ...record,
        data: Reader.toEntityData(record.data)
    };

    res.json(projected);
  } catch (err) {
    next(err);
  }
});

// POST /api/records - Create new record
router.post(
  '/',
  ...protectedRoute,
  validate(RecordInputSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`[DEBUG] POST /records handler reached. Body: ${JSON.stringify(req.body).substring(0, 50)}...`);
      const input = req.body;
      
      // Inject account_id from context if not provided in body (critical for User entity creation)
      if (!input.account_id) {
          input.account_id = (req.query.account_id as string) || (req.headers['x-account-id'] as string) || DEFAULT_ACCOUNT_ID;
      }
      
      // Check idempotency
      const idempotencyResult = checkIdempotency(input);
      if (idempotencyResult === 'skip') {
        const existing = getRecordBySlug(DEFAULT_ACCOUNT_ID, input.slug);
        if (existing) {
             res.status(200).json({
                ...existing,
                data: Reader.toEntityData(existing.data),
                _idempotency: 'skipped',
            });
            return;
        }
      }
      
      if (idempotencyResult === 'update') {
        const existing = getRecordBySlug(DEFAULT_ACCOUNT_ID, input.slug);
        if (existing) {
          const updated = await updateRecord(existing.id, input);
          if (updated) {
               res.status(200).json({
                ...updated,
                data: Reader.toEntityData(updated.data),
                _idempotency: 'updated',
              });
              return;
          }
        }
      }
      
      // In records.ts (route handler)
      // Check idempotency... (same)
       
      // --- TIER-0 HOOKS handled by createRecord now ---
      
      // Create new record
      // Pass req as context for security hooks
      const record = await createRecord(input, req);
      
      res.status(201).json({
        ...record,
        data: Reader.toEntityData(record.data),
        _idempotency: 'created',
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/records/:id - Update record
router.put(
  '/:id',
  ...protectedRoute,
  validate(RecordUpdateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const updates = req.body;
      
      const record = await updateRecord(id, updates, req);
      if (!record) {
        res.status(404).json({
          error: 'Record not found',
          status: 404,
        });
        return;
      }
      
      res.json({
          ...record,
          data: Reader.toEntityData(record.data)
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/records/:id - Delete record
router.delete('/:id', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await deleteRecord(id as string, req);
    
    if (!deleted) {
      res.status(404).json({
        error: 'Record not found',
        status: 404,
      });
      return;
    }
    
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
