import { Router, Request, Response, NextFunction } from 'express';
import { getBrandConfig, updateBrandConfig } from '../../core/config.js';
import { protectedRoute } from '../../modules/auth/middleware.js';

const router = Router();

/**
 * Deep merge objects recursively.
 * Arrays are replaced, not merged.
 * Null values are preserved (allowing explicit nullification).
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key];
    const targetValue = target[key];

    // If source value is explicitly undefined, skip it
    if (sourceValue === undefined) {
      continue;
    }

    // If source value is null, preserve it (explicit nullification)
    if (sourceValue === null) {
      result[key] = null as any;
      continue;
    }

    // If source value is an array, replace it entirely
    if (Array.isArray(sourceValue)) {
      result[key] = sourceValue as any;
      continue;
    }

    // If both values are plain objects, recursively merge
    if (
      typeof sourceValue === 'object' &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue as Record<string, any>, sourceValue as Record<string, any>) as any;
      continue;
    }

    // Otherwise, replace the value
    result[key] = sourceValue as any;
  }

  return result;
}

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

// PATCH /api/config - Deep merge updates into existing config
router.patch('/', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = req.body;
    const current = getBrandConfig() || {};

    // Deep merge allows partial updates to nested objects like 'colors'
    // Example: PATCH { colors: { primary: 'blue' } }
    // Will merge with existing colors, not replace them entirely
    const newData = deepMerge(current, updates);

    updateBrandConfig(newData);
    res.json(newData);
  } catch (err) {
    next(err);
  }
});

export default router;
