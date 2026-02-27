import { Router, Request, Response, NextFunction } from 'express';
import {
  createRecord,
  getRecord,
  getRecordBySlug,
  updateRecord,
  deleteRecord,
  listRecords,
  getRelationshipsFrom,
} from '../../core/records.js';
import { checkIdempotency } from '../../core/idempotency.js';
import { validate, validateQuery } from '../middleware/validation.js';
import {
  RecordInputSchema,
  RecordUpdateSchema,
  RecordQuerySchema,
} from '../schemas.js';
import { ObjectType } from '../../core/types.js'; // Keep ObjectType as mostly internal enum
import { protectedRoute } from '../../modules/auth/middleware.js';
import { Reader } from '../../contracts/Reader.js';
import { db } from '../../core/db.js'; // Direct DB access for routing logic
import { hooks } from '../../core/hooks.js'; // Tier-0 Hooks
import { validateConstraints } from '../../modules/ops/constraints.js';
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import { parsePagination, paginatedResponse } from '../middleware/pagination.js';

const router = Router();

// GET /api/records - List all records
router.get(
  '/',
  validateQuery(RecordQuerySchema),
  ...protectedRoute, // ODAC: allowApiKeyBypass, parseSession, requireSession, loadODAC
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = (req as any).validatedQuery || {};
      const type = validatedQuery.type as ObjectType | undefined;
      const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;
      const pagination = parsePagination(req);

      const records = listRecords(accountId, type);

      // Apply pagination
      const total = records.length;
      const paginatedRecords = records.slice(pagination.offset, pagination.offset + pagination.limit);

      // return structured RecordData (FieldGroups) for Admin UI
      const projected = paginatedRecords.map(r => ({
          ...r,
          data: Reader.toEntityData(r.data)
      }));

      res.json(paginatedResponse(projected, total, pagination));
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
    
    // structured RecordData for Admin UI
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

// POST /api/records/validate/product - Validate product (data-driven via ConstraintEngine)
// Uses validation_constraint records with trigger='validation_endpoint'
router.post('/validate/product', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      res.status(400).json({ error: 'product_id is required', code: 'MISSING_PRODUCT_ID' });
      return;
    }

    const product = getRecord(product_id);

    if (!product || product.type !== 'product') {
      res.status(404).json({ error: 'Product not found', code: 'PRODUCT_NOT_FOUND' });
      return;
    }

    // Run data-driven constraints for validation_endpoint trigger
    const constraintResults = validateConstraints({
      record: product,
      trigger: 'validation_endpoint'
    });

    // Collect failures
    const errors = constraintResults.filter(r => !r.passed && r.severity === 'error');
    const warnings = constraintResults.filter(r => !r.passed && r.severity === 'warning');

    // For B2B products, also gather detailed persona information for the response
    const productType = product.data?.product_type;
    let linkedPersonaSlugs: string[] = [];
    let missingPersonas: Array<{ slug: string; label: string }> = [];

    if (productType === 'B2B') {
      // Get linked personas for detailed response
      const relationships = getRelationshipsFrom(product_id, 'targets_persona');
      for (const rel of relationships) {
        const persona = getRecord(rel.to_record_id);
        if (persona) {
          const personaSlug = persona.slug || persona.data?.persona_type;
          if (personaSlug) {
            linkedPersonaSlugs.push(personaSlug);
          }
        }
      }

      // Query required personas for detailed missing report
      const requiredPersonas = db.prepare(`
        SELECT slug, label FROM dimension_values
        WHERE dimension = 'persona'
        AND json_extract(metadata, '$.power_level') >= 3
      `).all() as Array<{ slug: string; label: string }>;

      missingPersonas = requiredPersonas.filter(p => !linkedPersonaSlugs.includes(p.slug));
    }

    if (errors.length > 0) {
      res.status(400).json({
        valid: false,
        errors: errors.map(e => ({
          code: e.errorCode,
          message: e.errorMessage,
          constraint: e.constraintSlug
        })),
        warnings: warnings.map(w => ({
          code: w.errorCode,
          message: w.errorMessage,
          constraint: w.constraintSlug
        })),
        product_type: productType,
        linked_personas: linkedPersonaSlugs,
        missing_personas: missingPersonas.map(p => p.slug)
      });
      return;
    }

    res.json({
      valid: true,
      product_type: productType,
      linked_personas: linkedPersonaSlugs,
      warnings: warnings.map(w => ({
        code: w.errorCode,
        message: w.errorMessage,
        constraint: w.constraintSlug
      }))
    });
  } catch (err) {
    next(err);
  }
});

export default router;

