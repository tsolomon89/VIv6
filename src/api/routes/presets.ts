/**
 * Presets API Routes
 *
 * CRUD operations for presentation presets.
 * Presets are reusable visual templates for page sections.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { protectedRoute } from '../../modules/auth/middleware.js';
import {
  getPreset,
  listPresets,
  listCompatiblePresets,
  createPreset,
  updatePreset,
  deletePreset,
  clonePreset,
  presetExists,
  type PresetInput,
  type PresetFilter,
} from '../../modules/webbuilder/presets.js';
import type { Binding, BindingSignature } from '../../modules/webbuilder/types.js';

const router = Router();

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /api/presets - List all presets
 */
router.get('/', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: PresetFilter = {};

    if (req.query.signature_kind) {
      filter.signatureKind = req.query.signature_kind as 'self' | 'related';
    }

    if (req.query.target) {
      filter.target = req.query.target as string;
    }

    if (req.query.cardinality) {
      filter.cardinality = req.query.cardinality as 'one' | 'many';
    }

    if (req.query.account_id) {
      filter.accountId = req.query.account_id as string;
    }

    const presets = listPresets(filter);
    res.json(presets);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/presets/compatible - List presets compatible with a binding
 */
router.get('/compatible', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { binding_kind, target, cardinality, account_id } = req.query;

    if (!binding_kind) {
      res.status(400).json({
        error: 'binding_kind is required',
        status: 400,
      });
      return;
    }

    // Construct binding from query params
    let binding: Binding;
    if (binding_kind === 'self') {
      binding = { kind: 'self' };
    } else if (binding_kind === 'related') {
      if (!target || !cardinality) {
        res.status(400).json({
          error: 'target and cardinality are required for related bindings',
          status: 400,
        });
        return;
      }
      binding = {
        kind: 'related',
        target: target as any,
        cardinality: cardinality as 'one' | 'many',
      };
    } else {
      res.status(400).json({
        error: 'Invalid binding_kind',
        status: 400,
      });
      return;
    }

    const presets = listCompatiblePresets(binding, account_id as string | undefined);
    res.json(presets);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/presets/:key - Get preset by key
 */
router.get('/:key', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.params.key as string;
    const preset = getPreset(key);

    if (!preset) {
      res.status(404).json({
        error: 'Preset not found',
        status: 404,
      });
      return;
    }

    res.json(preset);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/presets - Create preset
 */
router.post('/', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, name, signature, config, account_id } = req.body;

    if (!key || !name || !signature || !config) {
      res.status(400).json({
        error: 'key, name, signature, and config are required',
        status: 400,
      });
      return;
    }

    if (presetExists(key)) {
      res.status(409).json({
        error: 'Preset with this key already exists',
        status: 409,
      });
      return;
    }

    const input: PresetInput = {
      key,
      name,
      signature: signature as BindingSignature,
      config,
      accountId: account_id,
    };

    const preset = createPreset(input);
    res.status(201).json(preset);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/presets/:key - Update preset
 */
router.put('/:key', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.params.key as string;
    const updates = req.body;

    const preset = updatePreset(key, updates);
    if (!preset) {
      res.status(404).json({
        error: 'Preset not found',
        status: 404,
      });
      return;
    }

    res.json(preset);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/presets/:key - Delete preset
 */
router.delete('/:key', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.params.key as string;
    const deleted = deletePreset(key);

    if (!deleted) {
      res.status(404).json({
        error: 'Preset not found',
        status: 404,
      });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/presets/:key/clone - Clone preset
 */
router.post('/:key/clone', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.params.key as string;
    const { new_key, account_id } = req.body;

    if (!new_key) {
      res.status(400).json({
        error: 'new_key is required',
        status: 400,
      });
      return;
    }

    if (presetExists(new_key)) {
      res.status(409).json({
        error: 'Preset with this key already exists',
        status: 409,
      });
      return;
    }

    const preset = clonePreset(key, new_key, account_id);
    if (!preset) {
      res.status(404).json({
        error: 'Source preset not found',
        status: 404,
      });
      return;
    }

    res.status(201).json(preset);
  } catch (err) {
    next(err);
  }
});

export default router;
