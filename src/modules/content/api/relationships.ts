import { Router, Request, Response, NextFunction } from 'express';
import {
  createRelationship,
  getRelationship,
  getRelationshipsFrom,
  getRelationshipsTo,
  listAllRelationships,
  deleteRelationship,
} from '../services.js';
import { validate } from '../../../api/middleware/validation.js';
import { RecordRelationshipInputSchema } from '../../../api/schemas.js';
import { protectedRoute } from '../../auth/middleware.js';

const router = Router();

// Helper to map DB format to API format
const mapRelationship = (r: any) => ({
  id: r.id,
  from_id: r.from_record_id,
  to_id: r.to_record_id,
  type: r.relationship_type,
  properties: r.data,
  created_at: r.created_at
});

// GET /api/relationships - List relationships
router.get('/', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from_id, to_id, type } = req.query;

    let relationships: any[] = [];

    if (from_id && typeof from_id === 'string') {
      relationships = getRelationshipsFrom(from_id, typeof type === 'string' ? type : undefined);
    } else if (to_id && typeof to_id === 'string') {
      relationships = getRelationshipsTo(to_id, typeof type === 'string' ? type : undefined);
    } else {
      relationships = listAllRelationships(typeof type === 'string' ? type : undefined);
    }
    
    res.json(relationships.map(mapRelationship));
  } catch (err) {
    next(err);
  }
});

// GET /api/relationships/:id - Get single relationship
router.get('/:id', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    if (typeof id !== 'string') {
      res.status(400).json({ status: 400, error: 'Invalid ID format' });
      return;
    }

    const relationship = getRelationship(id);
    
    if (!relationship) {
      res.status(404).json({
        error: 'Relationship not found',
        status: 404,
      });
      return;
    }
    
    res.json(mapRelationship(relationship));
  } catch (err) {
    next(err);
  }
});

// POST /api/relationships - Create relationship
router.post(
  '/',
  ...protectedRoute,
  validate(RecordRelationshipInputSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from_id, to_id, type, properties } = req.body;
      const relationship = await createRelationship({
        from_record_id: from_id,
        to_record_id: to_id,
        relationship_type: type,
        data: properties
      });
      res.status(201).json(mapRelationship(relationship));
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/relationships/:id - Delete relationship
router.delete('/:id', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (typeof id !== 'string') {
      res.status(400).json({ status: 400, error: 'Invalid ID format' });
      return;
    }

    const deleted = deleteRelationship(id);
    
    if (!deleted) {
      res.status(404).json({
        error: 'Relationship not found',
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
