/**
 * Config Workspace API Routes
 *
 * REST API for managing configuration workspaces (GTM-style staging system).
 */

import { Router, Request, Response, NextFunction } from 'express';
import { protectedRoute } from '../../modules/auth/middleware.js';
import {
  createWorkspace,
  getWorkspace,
  listWorkspaces,
  deleteWorkspace,
  submitForReview,
  approveWorkspace,
  rejectWorkspace,
  addChange,
  listChanges,
  removeChange,
  previewWorkspace,
  generateWorkspaceSummary,
  applyWorkspace,
  rollbackWorkspace,
  getVersionHistory,
  restoreToVersion,
} from '../../modules/config_workspace/index.js';
import { CONFIG_TYPES, validateConfigData, getConfigType, ConfigTypeSlug } from '../../core/config_registry.js';

const router = Router();

// ============================================================================
// Workspace CRUD
// ============================================================================

/**
 * GET /api/workspaces
 * List all workspaces with optional filters
 */
router.get('/', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { account_id, status, limit } = req.query;

    const workspaces = listWorkspaces({
      account_id: account_id as string,
      status: status as any,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    res.json({ data: workspaces });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workspaces
 * Create a new workspace
 */
router.post('/', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { account_id, name, description } = req.body;

    if (!account_id || !name) {
      res.status(400).json({ error: 'account_id and name are required' });
      return;
    }

    const workspace = createWorkspace({
      account_id,
      name,
      description,
      created_by: (req as any).user?.id,
    });

    res.status(201).json({ data: workspace });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workspaces/:id
 * Get a single workspace with its changes
 */
router.get('/:id', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = getWorkspace(req.params.id);

    if (!workspace) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }

    const changes = listChanges({ workspace_id: req.params.id });

    res.json({
      data: {
        ...workspace,
        changes: changes.map(c => ({
          id: c.id,
          config_type: c.config_type,
          operation: c.operation,
          target_id: c.target_id,
          target_slug: c.target_slug,
          status: c.status,
          validation_result: c.validation_result,
          safety_result: c.safety_result,
          created_at: c.created_at,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/workspaces/:id
 * Delete a workspace (only draft or rejected)
 */
router.delete('/:id', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = deleteWorkspace(req.params.id);

    if (!deleted) {
      res.status(400).json({ error: 'Workspace not found or cannot be deleted (must be draft or rejected)' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// Workspace Status Transitions
// ============================================================================

/**
 * POST /api/workspaces/:id/submit
 * Submit workspace for review
 */
router.post('/:id/submit', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = submitForReview(req.params.id);

    if (!workspace) {
      res.status(400).json({ error: 'Cannot submit workspace (must be in draft status with changes)' });
      return;
    }

    res.json({ data: workspace });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workspaces/:id/approve
 * Approve workspace for application
 */
router.post('/:id/approve', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = approveWorkspace(req.params.id);

    if (!workspace) {
      res.status(400).json({ error: 'Cannot approve workspace (must be in review status)' });
      return;
    }

    res.json({ data: workspace });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workspaces/:id/reject
 * Reject workspace
 */
router.post('/:id/reject', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspace = rejectWorkspace(req.params.id);

    if (!workspace) {
      res.status(400).json({ error: 'Cannot reject workspace (must be in review status)' });
      return;
    }

    res.json({ data: workspace });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workspaces/:id/preview
 * Preview workspace changes
 */
router.post('/:id/preview', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const preview = previewWorkspace(req.params.id);
    const summary = generateWorkspaceSummary(preview);

    res.json({
      data: {
        canApply: preview.canApply,
        blockingReasons: preview.blockingReasons,
        stats: preview.stats,
        validationErrors: preview.validationErrors,
        safetyConcerns: preview.safetyConcerns,
        dependencyImpact: preview.dependencyImpact,
        summary,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workspaces/:id/apply
 * Apply all changes in workspace
 */
router.post('/:id/apply', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const result = await applyWorkspace(req.params.id, userId);

    if (!result.success) {
      res.status(400).json({
        error: 'Failed to apply workspace',
        details: result.errors,
        appliedChanges: result.appliedChanges,
      });
      return;
    }

    res.json({
      data: {
        workspace: result.workspace,
        appliedChanges: result.appliedChanges.length,
        versionsCreated: result.versionsCreated,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workspaces/:id/rollback
 * Rollback all changes from an applied workspace
 */
router.post('/:id/rollback', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const result = await rollbackWorkspace(req.params.id, userId);

    if (!result.success) {
      res.status(400).json({
        error: 'Failed to rollback workspace',
        details: result.errors,
        rolledBackChanges: result.rolledBackChanges,
      });
      return;
    }

    res.json({
      data: {
        workspace: result.workspace,
        rolledBackChanges: result.rolledBackChanges.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// Change Management
// ============================================================================

/**
 * POST /api/workspaces/:id/changes
 * Add a change to a workspace
 */
router.post('/:id/changes', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { config_type, operation, target_id, target_slug, payload } = req.body;

    if (!config_type || !operation || !payload) {
      res.status(400).json({ error: 'config_type, operation, and payload are required' });
      return;
    }

    if (!CONFIG_TYPES.includes(config_type)) {
      res.status(400).json({ error: `Invalid config_type. Must be one of: ${CONFIG_TYPES.join(', ')}` });
      return;
    }

    if (!['create', 'update', 'delete'].includes(operation)) {
      res.status(400).json({ error: 'operation must be create, update, or delete' });
      return;
    }

    const change = addChange({
      workspace_id: req.params.id,
      config_type: config_type as ConfigTypeSlug,
      operation,
      target_id,
      target_slug,
      payload,
    });

    res.status(201).json({
      data: {
        id: change.id,
        config_type: change.config_type,
        operation: change.operation,
        validation_result: change.validation_result,
        safety_result: change.safety_result,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/workspaces/:id/changes
 * List all changes in a workspace
 */
router.get('/:id/changes', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const changes = listChanges({ workspace_id: req.params.id });

    res.json({ data: changes });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/workspaces/:workspaceId/changes/:changeId
 * Remove a change from a workspace
 */
router.delete('/:workspaceId/changes/:changeId', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const removed = removeChange(req.params.changeId);

    if (!removed) {
      res.status(404).json({ error: 'Change not found' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// Config Types Metadata
// ============================================================================

/**
 * GET /api/workspaces/config-types
 * List all available config types
 */
router.get('/config-types', (req: Request, res: Response, next: NextFunction) => {
  try {
    const types = CONFIG_TYPES.map(slug => {
      const def = getConfigType(slug);
      return {
        slug,
        displayName: def.displayName,
        description: def.description,
        entityType: def.entityType,
      };
    });

    res.json({ data: types });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workspaces/validate
 * Validate config data against schema
 */
router.post('/validate', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { config_type, data } = req.body;

    if (!config_type || !data) {
      res.status(400).json({ error: 'config_type and data are required' });
      return;
    }

    if (!CONFIG_TYPES.includes(config_type)) {
      res.status(400).json({ error: `Invalid config_type. Must be one of: ${CONFIG_TYPES.join(', ')}` });
      return;
    }

    const result = validateConfigData(config_type as ConfigTypeSlug, data);

    res.json({
      data: {
        valid: result.success,
        errors: result.success ? [] : result.errors?.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// Version History
// ============================================================================

/**
 * GET /api/workspaces/versions/:configType/:configId
 * Get version history for a config
 */
router.get('/versions/:configType/:configId', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { configType, configId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const versions = getVersionHistory(configType, configId, limit);

    res.json({ data: versions });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/workspaces/versions/:configType/:configId/restore
 * Restore a config to a specific version
 */
router.post('/versions/:configType/:configId/restore', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { configType, configId } = req.params;
    const { version } = req.body;
    const userId = (req as any).user?.id;

    if (!version || typeof version !== 'number') {
      res.status(400).json({ error: 'version (number) is required' });
      return;
    }

    const newVersion = await restoreToVersion(configType, configId, version, userId);

    res.json({
      data: {
        restoredTo: version,
        newVersion: newVersion.version,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
