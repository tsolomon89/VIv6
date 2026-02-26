/**
 * Config Workspace Types
 *
 * Defines the data structures for the GTM-style workspace system.
 */

import { ConfigTypeSlug, SafetyConcern } from '../../core/config_registry.js';
import { EntityType } from '../../core/types.js';

// ============================================================================
// Workspace Types
// ============================================================================

export type WorkspaceStatus = 'draft' | 'review' | 'approved' | 'applied' | 'rejected' | 'rolled_back';

export interface ConfigWorkspace {
  id: string;
  account_id: string;
  name: string;
  description?: string;
  status: WorkspaceStatus;
  created_by?: string;
  reviewed_by?: string;
  applied_by?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  applied_at?: string;
  rolled_back_at?: string;
}

export interface CreateWorkspaceInput {
  account_id: string;
  name: string;
  description?: string;
  created_by?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  status?: WorkspaceStatus;
  reviewed_by?: string;
  applied_by?: string;
}

// ============================================================================
// Change Types
// ============================================================================

export type ChangeOperation = 'create' | 'update' | 'delete';
export type ChangeStatus = 'pending' | 'applied' | 'rolled_back' | 'failed';

export interface ConfigChange {
  id: string;
  workspace_id: string;
  config_type: ConfigTypeSlug;
  operation: ChangeOperation;
  target_id?: string;
  target_slug?: string;
  payload: Record<string, any>;
  previous_state?: Record<string, any>;
  validation_result?: ValidationResult;
  safety_result?: SafetyCheckResult;
  order_index: number;
  status: ChangeStatus;
  error_message?: string;
  created_at: string;
  applied_at?: string;
}

export interface AddChangeInput {
  workspace_id: string;
  config_type: ConfigTypeSlug;
  operation: ChangeOperation;
  target_id?: string;
  target_slug?: string;
  payload: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    path: string;
    message: string;
    code: string;
  }>;
}

export interface SafetyCheckResult {
  safe: boolean;
  hasBreakingChanges: boolean;
  concerns: SafetyConcern[];
}

// ============================================================================
// Version Types
// ============================================================================

export interface ConfigVersion {
  id: string;
  config_type: ConfigTypeSlug;
  config_id: string;
  version: number;
  data: Record<string, any>;
  changed_by?: string;
  workspace_id?: string;
  change_summary?: string;
  created_at: string;
}

// ============================================================================
// Preview Types
// ============================================================================

export interface ChangePreview {
  change: ConfigChange;
  previewResult?: any;
  dependencyImpact: DependencyImpact[];
  safetyConcerns: SafetyConcern[];
}

export interface DependencyImpact {
  configType: ConfigTypeSlug;
  configId: string;
  configSlug: string;
  impactType: 'will_break' | 'may_affect' | 'needs_update';
  reason: string;
}

export interface WorkspacePreview {
  workspace: ConfigWorkspace;
  changes: ChangePreview[];
  stats: {
    created: number;
    updated: number;
    deleted: number;
    total: number;
  };
  validationErrors: Array<{
    changeId: string;
    errors: ValidationResult['errors'];
  }>;
  dependencyImpact: DependencyImpact[];
  safetyConcerns: SafetyConcern[];
  canApply: boolean;
  blockingReasons: string[];
}

// ============================================================================
// Apply/Rollback Types
// ============================================================================

export interface ApplyResult {
  success: boolean;
  workspace: ConfigWorkspace;
  appliedChanges: Array<{
    changeId: string;
    recordId: string;
    success: boolean;
    error?: string;
  }>;
  errors: string[];
  versionsCreated: number;
}

export interface RollbackResult {
  success: boolean;
  workspace: ConfigWorkspace;
  rolledBackChanges: Array<{
    changeId: string;
    recordId: string;
    success: boolean;
    error?: string;
  }>;
  errors: string[];
}

// ============================================================================
// Query Types
// ============================================================================

export interface WorkspaceQuery {
  account_id?: string;
  status?: WorkspaceStatus | WorkspaceStatus[];
  created_by?: string;
  limit?: number;
  offset?: number;
}

export interface ChangeQuery {
  workspace_id?: string;
  config_type?: ConfigTypeSlug | ConfigTypeSlug[];
  operation?: ChangeOperation | ChangeOperation[];
  status?: ChangeStatus | ChangeStatus[];
}

export interface VersionQuery {
  config_type?: ConfigTypeSlug;
  config_id?: string;
  workspace_id?: string;
  limit?: number;
  offset?: number;
}
