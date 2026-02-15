import { Router, Request, Response, NextFunction } from 'express';
import { derivePage } from '../compiler.js';

const router = Router();

// GET /api/derive/:entitySlug - Derive page for an entity
router.get('/:entitySlug', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entitySlug } = req.params;
    const segment = typeof req.query.segment === 'string' ? req.query.segment : undefined;
    const domainType = typeof req.query.domain_type === 'string' ? req.query.domain_type : undefined;

    const derived = derivePage(entitySlug as string, segment, domainType);

    if (!derived) {
      res.status(404).json({
        error: `Entity not found: ${entitySlug}`,
        status: 404,
      });
      return;
    }

    res.json(derived);
  } catch (err) {
    next(err);
  }
});

export default router;
