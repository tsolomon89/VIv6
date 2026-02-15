import { Router, Request, Response, NextFunction } from 'express';
import {
  createEntity,
  getEntity,
  getEntityBySlug,
  updateEntity,
  deleteEntity,
  listEntities,
} from '../services.js';
import { checkIdempotency } from '../../../core/idempotency.js';
import { validate, validateQuery } from '../../../api/middleware/validation.js';
import {
  EntityInputSchema,
  EntityUpdateSchema,
  EntityQuerySchema,
} from '../../../api/schemas.js';
import { EntityType } from '../../../core/types.js';
import { requireAuth } from '../../../api/middleware/auth.js';

const router = Router();

// GET /api/entities - List all entities
router.get(
  '/',
  validateQuery(EntityQuerySchema),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = (req as any).validatedQuery || {};
      const type = validatedQuery.type as EntityType | undefined;
      // Also grab brandId from raw query if validated schema doesn't have it yet, 
      // or we update the schema too. Let's just grab from req.query to be quick.
      const brandId = req.query.brandId as string | undefined;
      
      const entities = listEntities(type, brandId);
      res.json(entities);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/entities/:id - Get single entity
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Try by ID first, then by slug
    let entity = getEntity(id as string);
    if (!entity) {
      entity = getEntityBySlug(id as string);
    }
    
    if (!entity) {
      res.status(404).json({
        error: 'Entity not found',
        status: 404,
      });
      return;
    }
    
    res.json(entity);
  } catch (err) {
    next(err);
  }
});

// POST /api/entities - Create new entity
router.post(
  '/',
  requireAuth,
  validate(EntityInputSchema),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body;
      
      // Check idempotency
      const idempotencyResult = checkIdempotency(input);
      if (idempotencyResult === 'skip') {
        const existing = getEntityBySlug(input.slug);
        res.status(200).json({
          ...existing,
          _idempotency: 'skipped',
        });
        return;
      }
      
      if (idempotencyResult === 'update') {
        const existing = getEntityBySlug(input.slug);
        if (existing) {
          const updated = updateEntity(existing.id, input);
          res.status(200).json({
            ...updated,
            _idempotency: 'updated',
          });
          return;
        }
      }
      
      // Create new entity
      const entity = createEntity(input);
      res.status(201).json({
        ...entity,
        _idempotency: 'created',
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/entities/:id - Update entity
router.put(
  '/:id',
  requireAuth,
  validate(EntityUpdateSchema),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const updates = req.body;
      
      const entity = updateEntity(id, updates);
      if (!entity) {
        res.status(404).json({
          error: 'Entity not found',
          status: 404,
        });
        return;
      }
      
      res.json(entity);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/entities/:id - Delete entity
router.delete('/:id', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = deleteEntity(id as string);
    
    if (!deleted) {
      res.status(404).json({
        error: 'Entity not found',
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
