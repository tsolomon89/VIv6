/**
 * MCP Handlers for Config Workspace
 *
 * Provides tools for AI agents to manage configuration workspaces.
 */

import { z } from 'zod';
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

// ============================================================================
// Input Schemas (as plain objects for MCP registration)
// ============================================================================

export const CreateWorkspaceSchema = {
  account_id: z.string().uuid().describe('Account ID for the workspace'),
  name: z.string().min(1).describe('Workspace name'),
  description: z.string().optional().describe('Optional description'),
};

export const GetWorkspaceSchema = {
  workspace_id: z.string().uuid().describe('Workspace ID'),
};

export const ListWorkspacesSchema = {
  account_id: z.string().uuid().optional().describe('Filter by account'),
  status: z.enum(['draft', 'review', 'approved', 'applied', 'rejected', 'rolled_back'])
    .optional()
    .describe('Filter by status'),
  limit: z.number().int().positive().optional().describe('Max results'),
};

export const AddChangeSchema = {
  workspace_id: z.string().uuid().describe('Workspace ID'),
  config_type: z.enum(CONFIG_TYPES).describe('Type of configuration'),
  operation: z.enum(['create', 'update', 'delete']).describe('Operation type'),
  target_id: z.string().uuid().optional().describe('Target record ID (required for update/delete)'),
  target_slug: z.string().optional().describe('Target slug (for reference)'),
  payload: z.record(z.string(), z.any()).describe('Configuration data'),
};

export const RemoveChangeSchema = {
  change_id: z.string().uuid().describe('Change ID to remove'),
};

export const PreviewWorkspaceSchema = {
  workspace_id: z.string().uuid().describe('Workspace ID to preview'),
};

export const ApplyWorkspaceSchema = {
  workspace_id: z.string().uuid().describe('Workspace ID to apply'),
  user_id: z.string().uuid().optional().describe('User ID performing the action'),
};

export const RollbackWorkspaceSchema = {
  workspace_id: z.string().uuid().describe('Workspace ID to rollback'),
  user_id: z.string().uuid().optional().describe('User ID performing the action'),
};

export const VersionHistorySchema = {
  config_type: z.enum(CONFIG_TYPES).describe('Config type'),
  config_id: z.string().uuid().describe('Config record ID'),
  limit: z.number().int().positive().optional().describe('Max versions to return'),
};

export const RestoreVersionSchema = {
  config_type: z.enum(CONFIG_TYPES).describe('Config type'),
  config_id: z.string().uuid().describe('Config record ID'),
  version: z.number().int().positive().describe('Version number to restore'),
  user_id: z.string().uuid().optional().describe('User ID performing the action'),
};

export const ValidateConfigSchema = {
  config_type: z.enum(CONFIG_TYPES).describe('Config type to validate'),
  data: z.record(z.string(), z.any()).describe('Configuration data to validate'),
};

// ============================================================================
// Handlers
// ============================================================================

export async function createWorkspaceHandler(args: any) {
  try {
    const workspace = createWorkspace({
      account_id: args.account_id,
      name: args.name,
      description: args.description,
    });
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(workspace, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error creating workspace: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function getWorkspaceHandler(args: any) {
  try {
    const workspace = getWorkspace(args.workspace_id);
    if (!workspace) {
      return {
        content: [{ type: 'text' as const, text: `Workspace not found: ${args.workspace_id}` }],
        isError: true,
      };
    }

    const changes = listChanges({ workspace_id: args.workspace_id });

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          workspace,
          changeCount: changes.length,
          changes: changes.map(c => ({
            id: c.id,
            config_type: c.config_type,
            operation: c.operation,
            target: c.target_slug || c.target_id,
            status: c.status,
          })),
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function listWorkspacesHandler(args: any) {
  try {
    const workspaces = listWorkspaces({
      account_id: args.account_id,
      status: args.status,
      limit: args.limit,
    });
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(workspaces, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function deleteWorkspaceHandler(args: any) {
  try {
    const deleted = deleteWorkspace(args.workspace_id);
    return {
      content: [{ type: 'text' as const, text: deleted ? 'Workspace deleted successfully' : 'Workspace not found or not deletable' }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function addChangeHandler(args: any) {
  try {
    const change = addChange({
      workspace_id: args.workspace_id,
      config_type: args.config_type as ConfigTypeSlug,
      operation: args.operation,
      target_id: args.target_id,
      target_slug: args.target_slug,
      payload: args.payload,
    });
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          change_id: change.id,
          config_type: change.config_type,
          operation: change.operation,
          validation: change.validation_result,
          safety: change.safety_result,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error adding change: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function removeChangeHandler(args: any) {
  try {
    const removed = removeChange(args.change_id);
    return {
      content: [{ type: 'text' as const, text: removed ? 'Change removed successfully' : 'Change not found' }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function previewWorkspaceHandler(args: any) {
  try {
    const preview = previewWorkspace(args.workspace_id);
    const summary = generateWorkspaceSummary(preview);

    return {
      content: [{
        type: 'text' as const,
        text: `${summary}\n\n---\n\nFull Preview:\n${JSON.stringify({
          canApply: preview.canApply,
          blockingReasons: preview.blockingReasons,
          stats: preview.stats,
          validationErrors: preview.validationErrors,
          safetyConcerns: preview.safetyConcerns,
          dependencyImpact: preview.dependencyImpact,
        }, null, 2)}`,
      }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function submitForReviewHandler(args: any) {
  try {
    const workspace = submitForReview(args.workspace_id);
    return {
      content: [{ type: 'text' as const, text: workspace ? `Workspace submitted for review. Status: ${workspace.status}` : 'Failed to submit' }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function approveWorkspaceHandler(args: any) {
  try {
    const workspace = approveWorkspace(args.workspace_id);
    return {
      content: [{ type: 'text' as const, text: workspace ? `Workspace approved. Status: ${workspace.status}` : 'Failed to approve' }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function rejectWorkspaceHandler(args: any) {
  try {
    const workspace = rejectWorkspace(args.workspace_id);
    return {
      content: [{ type: 'text' as const, text: workspace ? `Workspace rejected. Status: ${workspace.status}` : 'Failed to reject' }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function applyWorkspaceHandler(args: any) {
  try {
    const result = await applyWorkspace(args.workspace_id, args.user_id);
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: result.success,
          status: result.workspace?.status,
          appliedChanges: result.appliedChanges.length,
          versionsCreated: result.versionsCreated,
          errors: result.errors,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function rollbackWorkspaceHandler(args: any) {
  try {
    const result = await rollbackWorkspace(args.workspace_id, args.user_id);
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: result.success,
          status: result.workspace?.status,
          rolledBackChanges: result.rolledBackChanges.length,
          errors: result.errors,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function getVersionHistoryHandler(args: any) {
  try {
    const versions = getVersionHistory(args.config_type, args.config_id, args.limit);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(versions, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function restoreVersionHandler(args: any) {
  try {
    const version = await restoreToVersion(args.config_type, args.config_id, args.version, args.user_id);
    return {
      content: [{
        type: 'text' as const,
        text: `Restored to version ${args.version}. New version: ${version.version}`,
      }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function validateConfigHandler(args: any) {
  try {
    const result = validateConfigData(args.config_type as ConfigTypeSlug, args.data);
    const configDef = getConfigType(args.config_type as ConfigTypeSlug);

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          valid: result.success,
          configType: args.config_type,
          displayName: configDef.displayName,
          errors: result.success ? [] : result.errors?.issues.map(i => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}

export async function listConfigTypesHandler() {
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

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(types, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}
