/**
 * Config Workspace Module
 *
 * GTM-style staging system for configuration changes.
 *
 * Usage:
 * 1. Create a workspace: createWorkspace({ account_id, name })
 * 2. Add changes: addChange({ workspace_id, config_type, operation, payload })
 * 3. Preview: previewWorkspace(workspaceId)
 * 4. Submit for review: submitForReview(workspaceId)
 * 5. Approve: approveWorkspace(workspaceId)
 * 6. Apply: applyWorkspace(workspaceId)
 * 7. Rollback if needed: rollbackWorkspace(workspaceId)
 */

// Types
export * from './types.js';

// Workspace CRUD
export {
  createWorkspace,
  getWorkspace,
  listWorkspaces,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceChangeCount,
  canApplyWorkspace,
  submitForReview,
  approveWorkspace,
  rejectWorkspace,
  reopenWorkspace,
} from './workspace.js';

// Change Management
export {
  addChange,
  getChange,
  listChanges,
  updateChange,
  removeChange,
  reorderChanges,
  revalidateWorkspace,
} from './changes.js';

// Safety Checks
export {
  runSafetyChecks,
  buildDependencyGraph,
} from './safety.js';

// Preview
export {
  previewWorkspace,
  generateWorkspaceSummary,
  getChangeBreakdown,
} from './preview.js';

// Apply & Rollback
export {
  applyWorkspace,
  rollbackWorkspace,
  getVersionHistory,
  getVersion,
  restoreToVersion,
} from './apply.js';
