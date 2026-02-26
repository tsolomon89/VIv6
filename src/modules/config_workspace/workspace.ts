/**
 * Workspace CRUD Operations
 *
 * Manages configuration workspaces - the container for staged changes.
 */

import { randomUUID } from 'crypto';
import { db } from '../../core/db.js';
import {
  ConfigWorkspace,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  WorkspaceQuery,
  WorkspaceStatus,
} from './types.js';

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new workspace
 */
export function createWorkspace(input: CreateWorkspaceInput): ConfigWorkspace {
  const id = randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO config_workspaces (id, account_id, name, description, status, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'draft', ?, ?, ?)
  `);

  stmt.run(
    id,
    input.account_id,
    input.name,
    input.description || null,
    input.created_by || null,
    now,
    now
  );

  return getWorkspace(id)!;
}

/**
 * Get a workspace by ID
 */
export function getWorkspace(id: string): ConfigWorkspace | null {
  const stmt = db.prepare('SELECT * FROM config_workspaces WHERE id = ?');
  const row = stmt.get(id) as any;

  if (!row) return null;

  return {
    id: row.id,
    account_id: row.account_id,
    name: row.name,
    description: row.description,
    status: row.status as WorkspaceStatus,
    created_by: row.created_by,
    reviewed_by: row.reviewed_by,
    applied_by: row.applied_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reviewed_at: row.reviewed_at,
    applied_at: row.applied_at,
    rolled_back_at: row.rolled_back_at,
  };
}

/**
 * List workspaces with optional filtering
 */
export function listWorkspaces(query: WorkspaceQuery = {}): ConfigWorkspace[] {
  let sql = 'SELECT * FROM config_workspaces WHERE 1=1';
  const params: any[] = [];

  if (query.account_id) {
    sql += ' AND account_id = ?';
    params.push(query.account_id);
  }

  if (query.status) {
    if (Array.isArray(query.status)) {
      sql += ` AND status IN (${query.status.map(() => '?').join(', ')})`;
      params.push(...query.status);
    } else {
      sql += ' AND status = ?';
      params.push(query.status);
    }
  }

  if (query.created_by) {
    sql += ' AND created_by = ?';
    params.push(query.created_by);
  }

  sql += ' ORDER BY created_at DESC';

  if (query.limit) {
    sql += ' LIMIT ?';
    params.push(query.limit);
  }

  if (query.offset) {
    sql += ' OFFSET ?';
    params.push(query.offset);
  }

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params) as any[];

  return rows.map(row => ({
    id: row.id,
    account_id: row.account_id,
    name: row.name,
    description: row.description,
    status: row.status as WorkspaceStatus,
    created_by: row.created_by,
    reviewed_by: row.reviewed_by,
    applied_by: row.applied_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    reviewed_at: row.reviewed_at,
    applied_at: row.applied_at,
    rolled_back_at: row.rolled_back_at,
  }));
}

/**
 * Update a workspace
 */
export function updateWorkspace(id: string, input: UpdateWorkspaceInput): ConfigWorkspace | null {
  const workspace = getWorkspace(id);
  if (!workspace) return null;

  // Validate status transitions
  if (input.status) {
    validateStatusTransition(workspace.status, input.status);
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    params.push(input.name);
  }

  if (input.description !== undefined) {
    updates.push('description = ?');
    params.push(input.description);
  }

  if (input.status !== undefined) {
    updates.push('status = ?');
    params.push(input.status);

    // Set timestamp based on status change
    if (input.status === 'review') {
      updates.push('reviewed_at = ?');
      params.push(new Date().toISOString());
      if (input.reviewed_by) {
        updates.push('reviewed_by = ?');
        params.push(input.reviewed_by);
      }
    } else if (input.status === 'applied') {
      updates.push('applied_at = ?');
      params.push(new Date().toISOString());
      if (input.applied_by) {
        updates.push('applied_by = ?');
        params.push(input.applied_by);
      }
    } else if (input.status === 'rolled_back') {
      updates.push('rolled_back_at = ?');
      params.push(new Date().toISOString());
    }
  }

  if (updates.length === 0) {
    return workspace;
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());
  params.push(id);

  const stmt = db.prepare(`UPDATE config_workspaces SET ${updates.join(', ')} WHERE id = ?`);
  stmt.run(...params);

  return getWorkspace(id);
}

/**
 * Delete a workspace (only drafts can be deleted)
 */
export function deleteWorkspace(id: string): boolean {
  const workspace = getWorkspace(id);
  if (!workspace) return false;

  if (workspace.status !== 'draft' && workspace.status !== 'rejected') {
    throw new Error(`Cannot delete workspace in status: ${workspace.status}. Only draft or rejected workspaces can be deleted.`);
  }

  // Changes are deleted via CASCADE
  const stmt = db.prepare('DELETE FROM config_workspaces WHERE id = ?');
  const result = stmt.run(id);

  return result.changes > 0;
}

/**
 * Get workspace change count
 */
export function getWorkspaceChangeCount(workspaceId: string): { created: number; updated: number; deleted: number; total: number } {
  const stmt = db.prepare(`
    SELECT
      operation,
      COUNT(*) as count
    FROM config_changes
    WHERE workspace_id = ?
    GROUP BY operation
  `);

  const rows = stmt.all(workspaceId) as Array<{ operation: string; count: number }>;

  const counts = {
    created: 0,
    updated: 0,
    deleted: 0,
    total: 0,
  };

  for (const row of rows) {
    if (row.operation === 'create') counts.created = row.count;
    else if (row.operation === 'update') counts.updated = row.count;
    else if (row.operation === 'delete') counts.deleted = row.count;
    counts.total += row.count;
  }

  return counts;
}

// ============================================================================
// Status Management
// ============================================================================

const VALID_TRANSITIONS: Record<WorkspaceStatus, WorkspaceStatus[]> = {
  draft: ['review', 'rejected'],
  review: ['approved', 'rejected', 'draft'],
  approved: ['applied', 'rejected', 'draft'],
  applied: ['rolled_back'],
  rejected: ['draft'],
  rolled_back: [], // Terminal state
};

/**
 * Validate a status transition
 */
function validateStatusTransition(current: WorkspaceStatus, next: WorkspaceStatus): void {
  const validNext = VALID_TRANSITIONS[current];
  if (!validNext.includes(next)) {
    throw new Error(`Invalid status transition: ${current} -> ${next}. Valid transitions: ${validNext.join(', ')}`);
  }
}

/**
 * Check if workspace can be applied
 */
export function canApplyWorkspace(workspaceId: string): { canApply: boolean; reasons: string[] } {
  const workspace = getWorkspace(workspaceId);
  if (!workspace) {
    return { canApply: false, reasons: ['Workspace not found'] };
  }

  const reasons: string[] = [];

  // Check status
  if (workspace.status !== 'approved') {
    reasons.push(`Workspace must be approved to apply (current status: ${workspace.status})`);
  }

  // Check for pending validation errors
  const errorCount = db.prepare(`
    SELECT COUNT(*) as count
    FROM config_changes
    WHERE workspace_id = ?
    AND JSON_EXTRACT(validation_result, '$.valid') = 0
  `).get(workspaceId) as { count: number };

  if (errorCount.count > 0) {
    reasons.push(`${errorCount.count} change(s) have validation errors`);
  }

  // Check for blocking safety concerns
  const blockingCount = db.prepare(`
    SELECT COUNT(*) as count
    FROM config_changes
    WHERE workspace_id = ?
    AND JSON_EXTRACT(safety_result, '$.safe') = 0
  `).get(workspaceId) as { count: number };

  if (blockingCount.count > 0) {
    reasons.push(`${blockingCount.count} change(s) have blocking safety concerns`);
  }

  return {
    canApply: reasons.length === 0,
    reasons,
  };
}

/**
 * Submit workspace for review
 */
export function submitForReview(workspaceId: string, reviewedBy?: string): ConfigWorkspace | null {
  return updateWorkspace(workspaceId, {
    status: 'review',
    reviewed_by: reviewedBy,
  });
}

/**
 * Approve a workspace
 */
export function approveWorkspace(workspaceId: string, approvedBy?: string): ConfigWorkspace | null {
  // First check if all changes are valid
  const validation = canApplyWorkspace(workspaceId);

  // We allow approval even with validation errors (for review purposes)
  // The actual apply will be blocked

  return updateWorkspace(workspaceId, {
    status: 'approved',
    reviewed_by: approvedBy,
  });
}

/**
 * Reject a workspace
 */
export function rejectWorkspace(workspaceId: string): ConfigWorkspace | null {
  return updateWorkspace(workspaceId, { status: 'rejected' });
}

/**
 * Reopen a rejected workspace for editing
 */
export function reopenWorkspace(workspaceId: string): ConfigWorkspace | null {
  return updateWorkspace(workspaceId, { status: 'draft' });
}
