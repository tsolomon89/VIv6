/**
 * Workspace Preview - Generate preview of changes before applying
 *
 * Provides detailed analysis of what will happen when a workspace is applied.
 */

import { db } from '../../core/db.js';
import { getRecord, listRecords } from '../content/services.js';
import { getConfigType, CONFIG_REGISTRY, SafetyConcern } from '../../core/config_registry.js';
import {
  ConfigWorkspace,
  ConfigChange,
  WorkspacePreview,
  ChangePreview,
  DependencyImpact,
  ValidationResult,
} from './types.js';
import { getWorkspace, getWorkspaceChangeCount } from './workspace.js';
import { listChanges, revalidateWorkspace } from './changes.js';
import { buildDependencyGraph } from './safety.js';

// ============================================================================
// Preview Generation
// ============================================================================

/**
 * Generate a full preview of a workspace
 */
export function previewWorkspace(workspaceId: string): WorkspacePreview {
  const workspace = getWorkspace(workspaceId);
  if (!workspace) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  // Re-validate all changes to ensure current state
  revalidateWorkspace(workspaceId);

  const changes = listChanges({ workspace_id: workspaceId });
  const stats = getWorkspaceChangeCount(workspaceId);

  // Generate previews for each change
  const changePreviews: ChangePreview[] = changes.map(change => previewChange(change));

  // Collect all validation errors
  const validationErrors: WorkspacePreview['validationErrors'] = [];
  for (const change of changes) {
    if (change.validation_result && !change.validation_result.valid) {
      validationErrors.push({
        changeId: change.id,
        errors: change.validation_result.errors,
      });
    }
  }

  // Collect all dependency impacts
  const allDependencyImpacts: DependencyImpact[] = [];
  for (const preview of changePreviews) {
    allDependencyImpacts.push(...preview.dependencyImpact);
  }

  // Collect all safety concerns
  const allSafetyConcerns: SafetyConcern[] = [];
  for (const preview of changePreviews) {
    allSafetyConcerns.push(...preview.safetyConcerns);
  }

  // Determine if workspace can be applied
  const blockingReasons: string[] = [];

  if (validationErrors.length > 0) {
    blockingReasons.push(`${validationErrors.length} change(s) have validation errors`);
  }

  const blockingConcerns = allSafetyConcerns.filter(c => c.severity === 'error');
  if (blockingConcerns.length > 0) {
    blockingReasons.push(`${blockingConcerns.length} blocking safety concern(s)`);
  }

  const willBreak = allDependencyImpacts.filter(i => i.impactType === 'will_break');
  if (willBreak.length > 0) {
    blockingReasons.push(`${willBreak.length} config(s) will break`);
  }

  return {
    workspace,
    changes: changePreviews,
    stats,
    validationErrors,
    dependencyImpact: allDependencyImpacts,
    safetyConcerns: allSafetyConcerns,
    canApply: blockingReasons.length === 0,
    blockingReasons,
  };
}

/**
 * Generate a preview for a single change
 */
function previewChange(change: ConfigChange): ChangePreview {
  const dependencyImpact: DependencyImpact[] = [];
  const safetyConcerns: SafetyConcern[] = [];

  // Add safety concerns from the change's safety result
  if (change.safety_result) {
    safetyConcerns.push(...change.safety_result.concerns);
  }

  // Analyze dependency impact
  if (change.operation === 'delete' && change.target_id) {
    const impacts = analyzeDeleteImpact(change);
    dependencyImpact.push(...impacts);
  }

  if (change.operation === 'update' && change.target_id) {
    const impacts = analyzeUpdateImpact(change);
    dependencyImpact.push(...impacts);
  }

  // Generate preview result (what the change will produce)
  let previewResult: any;
  if (change.operation === 'create') {
    previewResult = {
      willCreate: {
        type: change.config_type,
        slug: change.target_slug || change.payload.slug,
        data: change.payload,
      },
    };
  } else if (change.operation === 'update' && change.target_id) {
    const existing = getRecord(change.target_id);
    previewResult = {
      before: existing?.data,
      after: change.payload,
      diff: generateDiff(existing?.data || {}, change.payload),
    };
  } else if (change.operation === 'delete' && change.target_id) {
    const existing = getRecord(change.target_id);
    previewResult = {
      willDelete: {
        type: change.config_type,
        slug: existing?.slug,
        data: existing?.data,
      },
    };
  }

  return {
    change,
    previewResult,
    dependencyImpact,
    safetyConcerns,
  };
}

// ============================================================================
// Impact Analysis
// ============================================================================

/**
 * Analyze the impact of deleting a config
 */
function analyzeDeleteImpact(change: ConfigChange): DependencyImpact[] {
  const impacts: DependencyImpact[] = [];
  const configDef = getConfigType(change.config_type);

  const record = change.target_id ? getRecord(change.target_id) : null;
  if (!record) return impacts;

  // Check each config type that depends on this one
  for (const depSpec of configDef.dependents) {
    // Find records that reference this one
    const depRecords = findReferencingRecords(
      depSpec.configType,
      depSpec.field,
      record.slug
    );

    for (const depRecord of depRecords) {
      impacts.push({
        configType: depSpec.configType,
        configId: depRecord.id,
        configSlug: depRecord.slug,
        impactType: depSpec.required ? 'will_break' : 'may_affect',
        reason: `References ${change.config_type}:${record.slug} via ${depSpec.field}`,
      });
    }
  }

  return impacts;
}

/**
 * Analyze the impact of updating a config
 */
function analyzeUpdateImpact(change: ConfigChange): DependencyImpact[] {
  const impacts: DependencyImpact[] = [];

  // Check if any key fields are changing
  const criticalFieldChanges = findCriticalFieldChanges(change);

  if (criticalFieldChanges.length === 0) {
    return impacts; // No critical changes
  }

  const configDef = getConfigType(change.config_type);
  const record = change.target_id ? getRecord(change.target_id) : null;
  if (!record) return impacts;

  // Check dependents for each critical field change
  for (const fieldChange of criticalFieldChanges) {
    for (const depSpec of configDef.dependents) {
      if (!depSpec.field.includes(fieldChange.field)) continue;

      const depRecords = findReferencingRecords(
        depSpec.configType,
        depSpec.field,
        fieldChange.oldValue
      );

      for (const depRecord of depRecords) {
        impacts.push({
          configType: depSpec.configType,
          configId: depRecord.id,
          configSlug: depRecord.slug,
          impactType: 'needs_update',
          reason: `References ${fieldChange.field} value "${fieldChange.oldValue}" which is changing to "${fieldChange.newValue}"`,
        });
      }
    }
  }

  return impacts;
}

/**
 * Find records that reference a specific value
 */
function findReferencingRecords(
  configType: string,
  field: string,
  value: string
): Array<{ id: string; slug: string }> {
  // Simplified implementation - queries records table
  // In production, would use more sophisticated querying

  const configDef = CONFIG_REGISTRY[configType as keyof typeof CONFIG_REGISTRY];
  if (!configDef) return [];

  const records = listRecords('00000000-0000-0000-0000-000000000000', configDef.entityType);

  return records
    .filter(r => {
      const fieldValue = getNestedValue(r.data, field);
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(value);
      }
      return fieldValue === value;
    })
    .map(r => ({ id: r.id, slug: r.slug }));
}

/**
 * Find changes to critical fields (slug, type references, etc.)
 */
function findCriticalFieldChanges(change: ConfigChange): Array<{
  field: string;
  oldValue: any;
  newValue: any;
}> {
  const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

  if (!change.previous_state) return changes;

  const criticalFields = ['slug', 'triggerEntityType', 'targetEntityType', 'entity_type'];

  for (const field of criticalFields) {
    const oldValue = change.previous_state[field];
    const newValue = change.payload[field];

    if (oldValue !== undefined && newValue !== undefined && oldValue !== newValue) {
      changes.push({ field, oldValue, newValue });
    }
  }

  return changes;
}

// ============================================================================
// Diff Generation
// ============================================================================

interface DiffEntry {
  path: string;
  type: 'added' | 'removed' | 'changed';
  oldValue?: any;
  newValue?: any;
}

/**
 * Generate a diff between two objects
 */
function generateDiff(before: Record<string, any>, after: Record<string, any>): DiffEntry[] {
  const diff: DiffEntry[] = [];

  // Find added and changed
  for (const [key, newValue] of Object.entries(after)) {
    const oldValue = before[key];

    if (oldValue === undefined) {
      diff.push({ path: key, type: 'added', newValue });
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      diff.push({ path: key, type: 'changed', oldValue, newValue });
    }
  }

  // Find removed
  for (const key of Object.keys(before)) {
    if (after[key] === undefined) {
      diff.push({ path: key, type: 'removed', oldValue: before[key] });
    }
  }

  return diff;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (part === '*') {
      // For wildcard paths, return the current array
      return current;
    }
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }

  return current;
}

// ============================================================================
// Preview Utilities
// ============================================================================

/**
 * Generate a human-readable summary of a workspace
 */
export function generateWorkspaceSummary(preview: WorkspacePreview): string {
  const lines: string[] = [];

  lines.push(`Workspace: ${preview.workspace.name}`);
  lines.push(`Status: ${preview.workspace.status}`);
  lines.push('');
  lines.push(`Changes: ${preview.stats.total} total`);
  lines.push(`  - Create: ${preview.stats.created}`);
  lines.push(`  - Update: ${preview.stats.updated}`);
  lines.push(`  - Delete: ${preview.stats.deleted}`);
  lines.push('');

  if (preview.validationErrors.length > 0) {
    lines.push(`Validation Errors: ${preview.validationErrors.length}`);
    for (const err of preview.validationErrors) {
      lines.push(`  - Change ${err.changeId}: ${err.errors?.map(e => e.message).join(', ')}`);
    }
    lines.push('');
  }

  if (preview.safetyConcerns.length > 0) {
    const errors = preview.safetyConcerns.filter(c => c.severity === 'error');
    const warnings = preview.safetyConcerns.filter(c => c.severity === 'warning');

    if (errors.length > 0) {
      lines.push(`Blocking Errors: ${errors.length}`);
      for (const err of errors) {
        lines.push(`  - [${err.code}] ${err.message}`);
      }
      lines.push('');
    }

    if (warnings.length > 0) {
      lines.push(`Warnings: ${warnings.length}`);
      for (const warn of warnings) {
        lines.push(`  - [${warn.code}] ${warn.message}`);
      }
      lines.push('');
    }
  }

  if (preview.dependencyImpact.length > 0) {
    lines.push(`Dependency Impact: ${preview.dependencyImpact.length} affected`);
    for (const impact of preview.dependencyImpact) {
      lines.push(`  - ${impact.configType}:${impact.configSlug} (${impact.impactType}): ${impact.reason}`);
    }
    lines.push('');
  }

  lines.push(`Can Apply: ${preview.canApply ? 'Yes' : 'No'}`);
  if (!preview.canApply) {
    lines.push('Blocking Reasons:');
    for (const reason of preview.blockingReasons) {
      lines.push(`  - ${reason}`);
    }
  }

  return lines.join('\n');
}

/**
 * Get a change-by-change breakdown
 */
export function getChangeBreakdown(preview: WorkspacePreview): Array<{
  id: string;
  operation: string;
  configType: string;
  target: string;
  status: 'ok' | 'warning' | 'error';
  issues: string[];
}> {
  return preview.changes.map(cp => {
    const issues: string[] = [];

    if (cp.change.validation_result && !cp.change.validation_result.valid) {
      issues.push(...(cp.change.validation_result.errors?.map(e => e.message) || []));
    }

    issues.push(...cp.safetyConcerns.filter(c => c.severity !== 'info').map(c => c.message));

    const status = cp.safetyConcerns.some(c => c.severity === 'error')
      ? 'error'
      : issues.length > 0
        ? 'warning'
        : 'ok';

    return {
      id: cp.change.id,
      operation: cp.change.operation,
      configType: cp.change.config_type,
      target: cp.change.target_slug || cp.change.target_id || 'new',
      status,
      issues,
    };
  });
}
