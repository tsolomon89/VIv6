import { Router, Request, Response, NextFunction } from 'express';
import {
  createRecord,
  getRecord,
  getRecordBySlug,
  updateRecord,
  deleteRecord,
  listRecords,
} from '../services.js';
import { checkIdempotency } from '../../../core/idempotency.js';
import { validate, validateQuery } from '../../../api/middleware/validation.js';
import {
  RecordInputSchema,
  RecordUpdateSchema,
  RecordQuerySchema,
} from '../../../api/schemas.js';
import type { ObjectType } from '../../../core/types.js';
import { protectedRoute } from '../../auth/middleware.js';
import { DEFAULT_ACCOUNT_ID } from '../../../core/constants.js';

const router = Router();

// Compatibility shim for legacy /api/entities consumers.
router.get(
  '/',
  validateQuery(RecordQuerySchema),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = (req as any).validatedQuery || {};
      const type = validatedQuery.type as ObjectType | undefined;
      const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;
      const records = listRecords(accountId, type);
      res.json(records);
    } catch (err) {
      next(err);
    }
  }
);

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;
    const record = getRecord(id) || getRecordBySlug(accountId, id);

    if (!record) {
      res.status(404).json({ error: 'Record not found', status: 404 });
      return;
    }

    res.json(record);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  ...protectedRoute,
  validate(RecordInputSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body;
      if (!input.account_id) {
        input.account_id = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;
      }

      const idempotencyResult = checkIdempotency(input);
      if (idempotencyResult === 'skip') {
        const existing = getRecordBySlug(input.account_id, input.slug);
        if (existing) {
          res.status(200).json({ ...existing, _idempotency: 'skipped' });
          return;
        }
      }

      if (idempotencyResult === 'update') {
        const existing = getRecordBySlug(input.account_id, input.slug);
        if (existing) {
          const updated = await updateRecord(existing.id, input, req);
          if (updated) {
            res.status(200).json({ ...updated, _idempotency: 'updated' });
            return;
          }
        }
      }

      const record = await createRecord(input, req);
      res.status(201).json({ ...record, _idempotency: 'created' });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  ...protectedRoute,
  validate(RecordUpdateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const record = await updateRecord(id, req.body, req);
      if (!record) {
        res.status(404).json({ error: 'Record not found', status: 404 });
        return;
      }
      res.json(record);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await deleteRecord(req.params.id, req);
    if (!deleted) {
      res.status(404).json({ error: 'Record not found', status: 404 });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
