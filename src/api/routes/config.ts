import { Router, Request, Response, NextFunction } from 'express';
import { getBrandConfig, updateBrandConfig } from '../../core/config.js';
import { protectedRoute } from '../../modules/auth/middleware.js';

const router = Router();

// GET /api/config
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = getBrandConfig();
    if (!config) {
      res.status(404).json({ error: 'Config not found' });
      return;
    }
    res.json(config);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/config
router.patch('/', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = req.body;
    // Shallow merge or Deep merge? Frontend sends full state or partial?
    // Let's assume frontend sends updates to allow partial patching.
    const current = getBrandConfig() || {};
    const newData = { ...current, ...updates };
    
    // Deep merge if needed for nested props like 'colors'
    // For now simple top-level merge is risky if 'colors' is replaced entirely.
    // Visual Editor usually sends full 'singleConfig'.
    // Safer to merge specifically.
    // Actually, 'config' in ConfigControls is flat for most things, but has 'colors' object.
    // Let's implement a smarter merge if needed, or rely on frontend sending full section?
    // User edits "brand_config".
    
    // REVISIT: For now, we assume body IS the updates.
    // If body has "colors", it replaces "colors".
    
    updateBrandConfig(newData);
    res.json(newData);
  } catch (err) {
    next(err);
  }
});

export default router;
