/**
 * Config Changes - Stage and validate configuration changes
 *
 * Changes are staged within a workspace and validated before application.
 */

import { randomUUID } from 'crypto';
import { db } from '../../core/db.js';
import { getRecord } from '../content/services.js';
import {
  CONFIG_REGISTRY,
  ConfigTypeSlug,
  validateConfigData,
  getConfigType,
  isValidConfigType,
} from '../../core/config_registry.js';
import {
  ConfigChange,
  AddChangeInput,
  ChangeQuery,
  ValidationResult,
  SafetyCheckResult,
  ChangeStatus,
  ChangeOperation,
} from './types.js';
import { getWorkspace } from './workspace.js';
import { runSafetyChecks } from './safety.js';

// ============================================================================
// Change CRUD
// ============================================================================

/**
 * Add a change to a workspace
 */
export function addChange(input: AddChangeInput): ConfigChange {
  // Validate workspace exists and is editable
  const workspace = getWorkspace(input.workspace_id);
  if (!workspace) {
    throw new Error(`Workspace not found: ${input.workspace_id}`);
  }

  if (workspace.status !== 'draft') {
    throw new Error(`Cannot add changes to workspace in status: ${workspace.status}`);
  }

  // Validate config type
  if (!isValidConfigType(input.config_type)) {
    throw new Error(`Invalid config type: ${input.config_type}`);
  }

  // Validate operation requirements
  if (input.operation === 'update' || input.operation === 'delete') {
    if (!input.target_id) {
      throw new Error(`${input.operation} operation requires target_id`);
    }
  }

  // Validate payload against schema
  const validationResult = validatePayload(input.config_type, input.payload);

  // Get previous state for update/delete
  let previousState: Record<string, any> | undefined;
  if (input.target_id && (input.operation === 'update' || input.operation === 'delete')) {
    const existingRecord = getRecord(input.target_id);
    if (existingRecord) {
      previousState = existingRecord.data;
    }
  }

  // Run safety checks
  const safetyResult = runSafetyChecks({
    config_type: input.config_type,
    operation: input.operation,
    target_id: input.target_id,
    payload: input.payload,
    previous_state: previousState,
  });

  // Get next order index
  const maxIndex = db.prepare(`
    SELECT MAX(order_index) as max_idx FROM config_changes WHERE workspace_id = ?
  `).get(input.workspace_id) as { max_idx: number | null };

  const orderIndex = (maxIndex.max_idx ?? -1) + 1;

  const id = randomUUID();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO config_changes (
      id, workspace_id, config_type, operation, target_id, target_slug,
      payload, previous_state, validation_result, safety_result,
      order_index, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `);

  stmt.run(
    id,
    input.workspace_id,
    input.config_type,
    input.operation,
    input.target_id || null,
    input.target_slug || null,
    JSON.stringify(input.payload),
    previousState ? JSON.stringify(previousState) : null,
    JSON.stringify(validationResult),
    JSON.stringify(safetyResult),
    orderIndex,
    now
  );

  return getChange(id)!;
}

/**
 * Get a change by ID
 */
export function getChange(id: string): ConfigChange | null {
  const stmt = db.prepare('SELECT * FROM config_changes WHERE id = ?');
  const row = stmt.get(id) as any;

  if (!row) return null;

  return parseChangeRow(row);
}

/**
 * List changes with optional filtering
 */
export function listChanges(query: ChangeQuery = {}): ConfigChange[] {
  let sql = 'SELECT * FROM config_changes WHERE 1=1';
  const params: any[] = [];

  if (query.workspace_id) {
    sql += ' AND workspace_id = ?';
    params.push(query.workspace_id);
  }

  if (query.config_type) {
    if (Array.isArray(query.config_type)) {
      sql += ` AND config_type IN (${query.config_type.map(() => '?').join(', ')})`;
      params.push(...query.config_type);
    } else {
      sql += ' AND config_type = ?';
      params.push(query.config_type);
    }
  }

  if (query.operation) {
    if (Array.isArray(query.operation)) {
      sql += ` AND operation IN (${query.operation.map(() => '?').join(', ')})`;
      params.push(...query.operation);
    } else {
      sql += ' AND operation = ?';
      params.push(query.operation);
    }
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

  sql += ' ORDER BY order_index ASC';

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params) as any[];

  return rows.map(parseChangeRow);
}

/**
 * Update a change
 */
export function updateChange(
  id: string,
  payload: Record<string, any>
): ConfigChange | null {
  const change = getChange(id);
  if (!change) return null;

  // Check workspace is still editable
  const workspace = getWorkspace(change.workspace_id);
  if (!workspace || workspace.status !== 'draft') {
    throw new Error('Cannot modify changes in a non-draft workspace');
  }

  // Re-validate payload
  const validationResult = validatePayload(change.config_type, payload);

  // Re-run safety checks
  const safetyResult = runSafetyChecks({
    config_type: change.config_type,
    operation: change.operation,
    target_id: change.target_id,
    payload,
    previous_state: change.previous_state,
  });

  const stmt = db.prepare(`
    UPDATE config_changes
    SET payload = ?, validation_result = ?, safety_result = ?
    WHERE id = ?
  `);

  stmt.run(
    JSON.stringify(payload),
    JSON.stringify(validationResult),
    JSON.stringify(safetyResult),
    id
  );

  return getChange(id);
}

/**
 * Remove a change from a workspace
 */
export function removeChange(id: string): boolean {
  const change = getChange(id);
  if (!change) return false;

  // Check workspace is still editable
  const workspace = getWorkspace(change.workspace_id);
  if (!workspace || workspace.status !== 'draft') {
    throw new Error('Cannot remove changes from a non-draft workspace');
  }

  const stmt = db.prepare('DELETE FROM config_changes WHERE id = ?');
  const result = stmt.run(id);

  // Re-order remaining changes
  if (result.changes > 0) {
    reorderChanges(change.workspace_id);
  }

  return result.changes > 0;
}

/**
 * Reorder changes in a workspace
 */
export function reorderChanges(workspaceId: string, newOrder?: string[]): void {
  if (newOrder) {
    // Use provided order
    const updateStmt = db.prepare('UPDATE config_changes SET order_index = ? WHERE id = ?');
    const transaction = db.transaction(() => {
      newOrder.forEach((id, index) => {
        updateStmt.run(index, id);
      });
    });
    transaction();
  } else {
    // Just compact the order indices
    const changes = listChanges({ workspace_id: workspaceId });
    const updateStmt = db.prepare('UPDATE config_changes SET order_index = ? WHERE id = ?');
    const transaction = db.transaction(() => {
      changes.forEach((change, index) => {
        if (change.order_index !== index) {
          updateStmt.run(index, change.id);
        }
      });
    });
    transaction();
  }
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate payload against config type schema
 */
function validatePayload(configType: ConfigTypeSlug, payload: Record<string, any>): ValidationResult {
  const result = validateConfigData(configType, payload);

  if (result.success) {
    return { valid: true };
  }

  return {
    valid: false,
    errors: result.errors?.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  };
}

/**
 * Re-validate all changes in a workspace
 */
export function revalidateWorkspace(workspaceId: string): void {
  const changes = listChanges({ workspace_id: workspaceId });

  const updateStmt = db.prepare(`
    UPDATE config_changes SET validation_result = ?, safety_result = ? WHERE id = ?
  `);

  const transaction = db.transaction(() => {
    for (const change of changes) {
      const validationResult = validatePayload(change.config_type, change.payload);
      const safetyResult = runSafetyChecks({
        config_type: change.config_type,
        operation: change.operation,
        target_id: change.target_id,
        payload: change.payload,
        previous_state: change.previous_state,
      });

      updateStmt.run(
        JSON.stringify(validationResult),
        JSON.stringify(safetyResult),
        change.id
      );
    }
  });

  transaction();
}

// ============================================================================
// Change Status Updates
// ============================================================================

/**
 * Mark a change as applied
 */
export function markChangeApplied(id: string, recordId: string): void {
  const stmt = db.prepare(`
    UPDATE config_changes
    SET status = 'applied', target_id = ?, applied_at = ?
    WHERE id = ?
  `);
  stmt.run(recordId, new Date().toISOString(), id);
}

/**
 * Mark a change as failed
 */
export function markChangeFailed(id: string, errorMessage: string): void {
  const stmt = db.prepare(`
    UPDATE config_changes
    SET status = 'failed', error_message = ?
    WHERE id = ?
  `);
  stmt.run(errorMessage, id);
}

/**
 * Mark a change as rolled back
 */
export function markChangeRolledBack(id: string): void {
  const stmt = db.prepare(`
    UPDATE config_changes
    SET status = 'rolled_back'
    WHERE id = ?
  `);
  stmt.run(id);
}

// ============================================================================
// Helpers
// ============================================================================

function parseChangeRow(row: any): ConfigChange {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    config_type: row.config_type as ConfigTypeSlug,
    operation: row.operation as ChangeOperation,
    target_id: row.target_id,
    target_slug: row.target_slug,
    payload: JSON.parse(row.payload),
    previous_state: row.previous_state ? JSON.parse(row.previous_state) : undefined,
    validation_result: row.validation_result ? JSON.parse(row.validation_result) : undefined,
    safety_result: row.safety_result ? JSON.parse(row.safety_result) : undefined,
    order_index: row.order_index,
    status: row.status as ChangeStatus,
    error_message: row.error_message,
    created_at: row.created_at,
    applied_at: row.applied_at,
  };
}
