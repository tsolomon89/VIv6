import { Router, Request, Response, NextFunction } from 'express';
import { createDomain, listDomains, getDomain, getDomainByHostname, updateDomain, deleteDomain } from '../domains.js';
import { protectedRoute } from '../../auth/middleware.js';

const router = Router();

// GET /api/domains?brand_id=X
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const brandId = typeof req.query.brand_id === 'string' ? req.query.brand_id : undefined;
    res.json(listDomains(brandId));
  } catch (err) {
    next(err);
  }
});

// GET /api/domains/resolve/:hostname
router.get('/resolve/:hostname', (req: Request, res: Response, next: NextFunction) => {
  try {
    const domain = getDomainByHostname(req.params.hostname as string);
    if (!domain) {
      res.status(404).json({ error: 'Domain not found', status: 404 });
      return;
    }
    res.json(domain);
  } catch (err) {
    next(err);
  }
});

// GET /api/domains/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const domain = getDomain(req.params.id as string);
    if (!domain) {
      res.status(404).json({ error: 'Not found', status: 404 });
      return;
    }
    res.json(domain);
  } catch (err) {
    next(err);
  }
});

// POST /api/domains
router.post('/', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { brand_id, hostname, type, is_primary, config, entity_types, status } = req.body;
    if (!brand_id || !hostname) {
      res.status(400).json({ error: 'brand_id and hostname are required', status: 400 });
      return;
    }
    // Map brand_id to account_id (the domain module uses account_id internally)
    const domain = createDomain({ account_id: brand_id, hostname, type, is_primary, config, entity_types, status });
    res.status(201).json(domain);
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint')) {
      res.status(409).json({ error: `Domain hostname already exists: ${req.body.hostname}`, status: 409 });
      return;
    }
    next(err);
  }
});

// PUT /api/domains/:id
router.put('/:id', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = updateDomain(req.params.id as string, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Not found', status: 404 });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint')) {
      res.status(409).json({ error: `Domain hostname already exists: ${req.body.hostname}`, status: 409 });
      return;
    }
    next(err);
  }
});

// DELETE /api/domains/:id
router.delete('/:id', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!deleteDomain(req.params.id as string)) {
      res.status(404).json({ error: 'Not found', status: 404 });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
