/**
 * Workspace Apply & Rollback
 *
 * Applies or rolls back workspace changes atomically.
 * Creates version records for history tracking.
 */

import { randomUUID } from 'crypto';
import { db } from '../../core/db.js';
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import { createRecord, updateRecord, deleteRecord, getRecord } from '../content/services.js';
import { getConfigType } from '../../core/config_registry.js';
import { loadInterpreterExecutorPlugins } from '../ops/interpreter_executor_plugin_loader.js';
import {
  ConfigWorkspace,
  ConfigChange,
  ApplyResult,
  RollbackResult,
  ConfigVersion,
} from './types.js';
import { getWorkspace, updateWorkspace, canApplyWorkspace } from './workspace.js';
import { listChanges, markChangeApplied, markChangeFailed, markChangeRolledBack } from './changes.js';
import { previewWorkspace } from './preview.js';

// ============================================================================
// Apply Workspace
// ============================================================================

/**
 * Apply all changes in a workspace atomically
 */
export async function applyWorkspace(workspaceId: string, userId?: string): Promise<ApplyResult> {
  const workspace = getWorkspace(workspaceId);
  if (!workspace) {
    return {
      success: false,
      workspace: null as any,
      appliedChanges: [],
      errors: ['Workspace not found'],
      versionsCreated: 0,
    };
  }

  // Check if workspace can be applied
  const canApply = canApplyWorkspace(workspaceId);
  if (!canApply.canApply) {
    return {
      success: false,
      workspace,
      appliedChanges: [],
      errors: canApply.reasons,
      versionsCreated: 0,
    };
  }

  // Get preview to double-check
  const preview = previewWorkspace(workspaceId);
  if (!preview.canApply) {
    return {
      success: false,
      workspace,
      appliedChanges: [],
      errors: preview.blockingReasons,
      versionsCreated: 0,
    };
  }

  const changes = listChanges({ workspace_id: workspaceId });
  const appliedChanges: ApplyResult['appliedChanges'] = [];
  const errors: string[] = [];
  let versionsCreated = 0;

  // Apply changes sequentially (async operations can't use sync transactions)
  for (const change of changes) {
    try {
      const result = await applyChange(change, workspaceId, userId);
      appliedChanges.push({
        changeId: change.id,
        recordId: result.recordId,
        success: true,
      });

      // Mark change as applied
      markChangeApplied(change.id, result.recordId);

      // Create version record
      if (result.versionCreated) {
        versionsCreated++;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push(`Change ${change.id}: ${errorMessage}`);
      appliedChanges.push({
        changeId: change.id,
        recordId: '',
        success: false,
        error: errorMessage,
      });

      markChangeFailed(change.id, errorMessage);

      // Return partial result on error
      return {
        success: false,
        workspace: getWorkspace(workspaceId)!,
        appliedChanges,
        errors,
        versionsCreated,
      };
    }
  }

  // Update workspace status
  updateWorkspace(workspaceId, {
    status: 'applied',
    applied_by: userId,
  });

  const touchedExecutorDefs = changes.some(change => change.config_type === 'interpreter_executor_def');
  if (touchedExecutorDefs) {
    try {
      const pluginLoad = await loadInterpreterExecutorPlugins(DEFAULT_ACCOUNT_ID, { force: true });
      if (pluginLoad.errors.length > 0 || pluginLoad.missing.length > 0) {
        console.warn('[ConfigWorkspace] Interpreter executor plugin reconcile completed with issues:', {
          loaded: pluginLoad.loaded.length,
          skipped: pluginLoad.skipped.length,
          unloaded: pluginLoad.unloaded.length,
          missing: pluginLoad.missing,
          errors: pluginLoad.errors,
        });
      }
    } catch (error) {
      // Non-blocking during transition: workspace apply stays successful even if plugin reload fails.
      console.error('[ConfigWorkspace] Interpreter executor plugin reload failed:', error);
    }
  }

  return {
    success: true,
    workspace: getWorkspace(workspaceId)!,
    appliedChanges,
    errors,
    versionsCreated,
  };
}

/**
 * Apply a single change
 */
async function applyChange(
  change: ConfigChange,
  workspaceId: string,
  userId?: string
): Promise<{ recordId: string; versionCreated: boolean }> {
  const configDef = getConfigType(change.config_type);

  switch (change.operation) {
    case 'create': {
      // Create the record
      const record = await createRecord({
        type: configDef.entityType as any,
        slug: change.target_slug || change.payload.slug,
        name: change.payload.name || change.payload.slug,
        data: change.payload as any,
        account_id: '00000000-0000-0000-0000-000000000000', // System account for config
      });

      // Create initial version
      createVersion({
        config_type: change.config_type,
        config_id: record.id,
        version: 1,
        data: change.payload,
        changed_by: userId,
        workspace_id: workspaceId,
        change_summary: `Created ${change.config_type}: ${record.slug}`,
      });

      return { recordId: record.id, versionCreated: true };
    }

    case 'update': {
      if (!change.target_id) {
        throw new Error('Update requires target_id');
      }

      // Get current version number
      const currentVersion = getLatestVersion(change.config_type, change.target_id);
      const nextVersion = (currentVersion?.version || 0) + 1;

      // Update the record
      await updateRecord(change.target_id, {
        data: change.payload as any,
      });

      // Create version
      createVersion({
        config_type: change.config_type,
        config_id: change.target_id,
        version: nextVersion,
        data: change.payload,
        changed_by: userId,
        workspace_id: workspaceId,
        change_summary: `Updated ${change.config_type}`,
      });

      return { recordId: change.target_id, versionCreated: true };
    }

    case 'delete': {
      if (!change.target_id) {
        throw new Error('Delete requires target_id');
      }

      // Create final version marking deletion
      const currentVersion = getLatestVersion(change.config_type, change.target_id);
      const nextVersion = (currentVersion?.version || 0) + 1;

      createVersion({
        config_type: change.config_type,
        config_id: change.target_id,
        version: nextVersion,
        data: { _deleted: true, _previous: change.previous_state },
        changed_by: userId,
        workspace_id: workspaceId,
        change_summary: `Deleted ${change.config_type}`,
      });

      // Delete the record
      await deleteRecord(change.target_id);

      return { recordId: change.target_id, versionCreated: true };
    }

    default:
      throw new Error(`Unknown operation: ${change.operation}`);
  }
}

// ============================================================================
// Rollback Workspace
// ============================================================================

/**
 * Rollback all changes in a workspace
 */
export async function rollbackWorkspace(workspaceId: string, userId?: string): Promise<RollbackResult> {
  const workspace = getWorkspace(workspaceId);
  if (!workspace) {
    return {
      success: false,
      workspace: null as any,
      rolledBackChanges: [],
      errors: ['Workspace not found'],
    };
  }

  if (workspace.status !== 'applied') {
    return {
      success: false,
      workspace,
      rolledBackChanges: [],
      errors: [`Cannot rollback workspace in status: ${workspace.status}`],
    };
  }

  const changes = listChanges({
    workspace_id: workspaceId,
    status: 'applied',
  });

  // Reverse order for rollback
  const reversedChanges = [...changes].reverse();

  const rolledBackChanges: RollbackResult['rolledBackChanges'] = [];
  const errors: string[] = [];

  // Rollback changes sequentially (async operations can't use sync transactions)
  for (const change of reversedChanges) {
    try {
      await rollbackChange(change, workspaceId, userId);
      rolledBackChanges.push({
        changeId: change.id,
        recordId: change.target_id || '',
        success: true,
      });

      markChangeRolledBack(change.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push(`Change ${change.id}: ${errorMessage}`);
      rolledBackChanges.push({
        changeId: change.id,
        recordId: change.target_id || '',
        success: false,
        error: errorMessage,
      });

      // Return partial result on error
      return {
        success: false,
        workspace: getWorkspace(workspaceId)!,
        rolledBackChanges,
        errors,
      };
    }
  }

  // Update workspace status
  updateWorkspace(workspaceId, { status: 'rolled_back' });

  return {
    success: true,
    workspace: getWorkspace(workspaceId)!,
    rolledBackChanges,
    errors,
  };
}

/**
 * Rollback a single change
 */
async function rollbackChange(change: ConfigChange, workspaceId: string, userId?: string): Promise<void> {
  const configDef = getConfigType(change.config_type);

  switch (change.operation) {
    case 'create': {
      // Delete the created record
      if (change.target_id) {
        deleteRecord(change.target_id);
      }
      break;
    }

    case 'update': {
      if (!change.target_id || !change.previous_state) {
        throw new Error('Cannot rollback update without target_id and previous_state');
      }

      // Restore previous state
      const currentVersion = getLatestVersion(change.config_type, change.target_id);
      const nextVersion = (currentVersion?.version || 0) + 1;

      await updateRecord(change.target_id, {
        data: change.previous_state as any,
      });

      // Create rollback version
      createVersion({
        config_type: change.config_type,
        config_id: change.target_id,
        version: nextVersion,
        data: change.previous_state,
        changed_by: userId,
        workspace_id: workspaceId,
        change_summary: `Rolled back ${change.config_type}`,
      });
      break;
    }

    case 'delete': {
      if (!change.previous_state) {
        throw new Error('Cannot rollback delete without previous_state');
      }

      // Recreate the record
      const record = await createRecord({
        id: change.target_id, // Preserve original ID
        type: configDef.entityType as any,
        slug: change.target_slug || '',
        name: change.previous_state.name || change.target_slug || '',
        data: change.previous_state as any,
        account_id: '00000000-0000-0000-0000-000000000000',
      });

      // Create restore version
      createVersion({
        config_type: change.config_type,
        config_id: record.id,
        version: 1,
        data: change.previous_state,
        changed_by: userId,
        workspace_id: workspaceId,
        change_summary: `Restored ${change.config_type} (rollback)`,
      });
      break;
    }
  }
}

// ============================================================================
// Version Management
// ============================================================================

interface CreateVersionInput {
  config_type: string;
  config_id: string;
  version: number;
  data: Record<string, any>;
  changed_by?: string;
  workspace_id?: string;
  change_summary?: string;
}

/**
 * Create a version record
 */
function createVersion(input: CreateVersionInput): ConfigVersion {
  const id = randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO config_versions (
      id, config_type, config_id, version, data,
      changed_by, workspace_id, change_summary, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    input.config_type,
    input.config_id,
    input.version,
    JSON.stringify(input.data),
    input.changed_by || null,
    input.workspace_id || null,
    input.change_summary || null,
    now
  );

  return {
    id,
    config_type: input.config_type as any,
    config_id: input.config_id,
    version: input.version,
    data: input.data,
    changed_by: input.changed_by,
    workspace_id: input.workspace_id,
    change_summary: input.change_summary,
    created_at: now,
  };
}

/**
 * Get the latest version of a config
 */
function getLatestVersion(configType: string, configId: string): ConfigVersion | null {
  const stmt = db.prepare(`
    SELECT * FROM config_versions
    WHERE config_type = ? AND config_id = ?
    ORDER BY version DESC
    LIMIT 1
  `);

  const row = stmt.get(configType, configId) as any;
  if (!row) return null;

  return {
    id: row.id,
    config_type: row.config_type,
    config_id: row.config_id,
    version: row.version,
    data: JSON.parse(row.data),
    changed_by: row.changed_by,
    workspace_id: row.workspace_id,
    change_summary: row.change_summary,
    created_at: row.created_at,
  };
}

/**
 * Get version history for a config
 */
export function getVersionHistory(
  configType: string,
  configId: string,
  limit: number = 10
): ConfigVersion[] {
  const stmt = db.prepare(`
    SELECT * FROM config_versions
    WHERE config_type = ? AND config_id = ?
    ORDER BY version DESC
    LIMIT ?
  `);

  const rows = stmt.all(configType, configId, limit) as any[];

  return rows.map(row => ({
    id: row.id,
    config_type: row.config_type,
    config_id: row.config_id,
    version: row.version,
    data: JSON.parse(row.data),
    changed_by: row.changed_by,
    workspace_id: row.workspace_id,
    change_summary: row.change_summary,
    created_at: row.created_at,
  }));
}

/**
 * Get a specific version
 */
export function getVersion(
  configType: string,
  configId: string,
  version: number
): ConfigVersion | null {
  const stmt = db.prepare(`
    SELECT * FROM config_versions
    WHERE config_type = ? AND config_id = ? AND version = ?
  `);

  const row = stmt.get(configType, configId, version) as any;
  if (!row) return null;

  return {
    id: row.id,
    config_type: row.config_type,
    config_id: row.config_id,
    version: row.version,
    data: JSON.parse(row.data),
    changed_by: row.changed_by,
    workspace_id: row.workspace_id,
    change_summary: row.change_summary,
    created_at: row.created_at,
  };
}

/**
 * Restore a config to a specific version
 */
export async function restoreToVersion(
  configType: string,
  configId: string,
  targetVersion: number,
  userId?: string
): Promise<ConfigVersion> {
  const version = getVersion(configType, configId, targetVersion);
  if (!version) {
    throw new Error(`Version ${targetVersion} not found for ${configType}:${configId}`);
  }

  // Update the record
  await updateRecord(configId, {
    data: version.data as any,
  });

  // Create new version marking the restore
  const latest = getLatestVersion(configType, configId);
  const nextVersion = (latest?.version || 0) + 1;

  return createVersion({
    config_type: configType,
    config_id: configId,
    version: nextVersion,
    data: version.data,
    changed_by: userId,
    change_summary: `Restored to version ${targetVersion}`,
  });
}
