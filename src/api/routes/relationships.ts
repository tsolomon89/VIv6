import { Router, Request, Response, NextFunction } from 'express';
import {
  createRelationship,
  getRelationship,
  getRelationshipsFrom,
  getRelationshipsTo,
  listAllRelationships,
  deleteRelationship,
} from '../../core/relationships.js';
import { validate } from '../middleware/validation.js';
import { RecordRelationshipInputSchema } from '../schemas.js';

const router = Router();

// GET /api/relationships - List relationships
router.get('/', (req: Request, res: Response, next: NextFunction) => {
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
    
    res.json(relationships);
  } catch (err) {
    next(err);
  }
});

// GET /api/relationships/:id - Get single relationship
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const relationship = getRelationship(id as string);
    
    if (!relationship) {
      res.status(404).json({
        error: 'Relationship not found',
        status: 404,
      });
      return;
    }
    
    res.json(relationship);
  } catch (err) {
    next(err);
  }
});

// POST /api/relationships - Create relationship
router.post(
  '/',
  validate(RecordRelationshipInputSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body;
      const relationship = await createRelationship(input);
      res.status(201).json(relationship);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/relationships/:id - Delete relationship
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await deleteRelationship(id as string);
    
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
