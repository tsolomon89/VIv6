/**
 * Safety Checks - Prevent breaking changes
 *
 * Validates configuration changes to prevent:
 * - Orphaning dependents (deleting config that others depend on)
 * - Circular dependencies (e.g., derivation referencing itself)
 * - Type compatibility issues
 * - Breaking required field changes
 */

import { db } from '../../core/db.js';
import { listRecords } from '../content/services.js';
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import {
  ConfigTypeSlug,
  getConfigType,
  CONFIG_REGISTRY,
  SafetyConcern,
  BUILTIN_INTERPRETER_EXECUTORS,
} from '../../core/config_registry.js';
import { SafetyCheckResult, ChangeOperation } from './types.js';
import { hasInterpreterExecutor } from '../ops/interpreter_executor_registry.js';
import { getInterpreterExecutorDefinition } from '../ops/interpreter_executor_definitions.js';

// ============================================================================
// Types
// ============================================================================

export interface SafetyCheckInput {
  config_type: ConfigTypeSlug;
  operation: ChangeOperation;
  target_id?: string;
  payload: Record<string, any>;
  previous_state?: Record<string, any>;
}

interface SafetyCheck {
  name: string;
  severity: 'error' | 'warning' | 'info';
  appliesTo: ChangeOperation[];
  check: (input: SafetyCheckInput) => SafetyConcern | null;
}

// ============================================================================
// Safety Check Implementations
// ============================================================================

const SAFETY_CHECKS: SafetyCheck[] = [
  // Orphan Prevention - don't delete config that others depend on
  {
    name: 'orphan_prevention',
    severity: 'error',
    appliesTo: ['delete'],
    check: (input) => {
      if (!input.target_id) return null;

      const dependents = findDependents(input.config_type, input.target_id);
      if (dependents.length > 0) {
        return {
          severity: 'error',
          code: 'HAS_DEPENDENTS',
          message: `Cannot delete: ${dependents.length} config(s) depend on this ${input.config_type}`,
          affectedItems: dependents.map(d => `${d.type}:${d.slug}`),
        };
      }
      return null;
    },
  },

  // Circular Dependency Detection for Derivations
  {
    name: 'circular_derivation',
    severity: 'error',
    appliesTo: ['create', 'update'],
    check: (input) => {
      if (input.config_type !== 'derivation') return null;

      const expression = input.payload.expression as string;
      const fieldName = input.payload.fieldName as string;
      const targetType = input.payload.targetEntityType as string;

      if (!expression || !fieldName) return null;

      // Simple check: does the expression reference its own field?
      if (expression.includes(fieldName)) {
        return {
          severity: 'error',
          code: 'CIRCULAR_DERIVATION',
          message: `Derivation "${fieldName}" cannot reference itself in the expression`,
        };
      }

      // TODO: Check for indirect circular references through other derivations
      return null;
    },
  },

  // Rule Trigger Validation
  {
    name: 'valid_rule_trigger',
    severity: 'error',
    appliesTo: ['create', 'update'],
    check: (input) => {
      if (input.config_type !== 'rule') return null;

      const triggerType = input.payload.triggerEntityType as string;
      if (!triggerType) return null;

      // Check if the entity type exists
      const objectDef = db.prepare(`
        SELECT id FROM records
        WHERE type = 'object_def' AND slug = ?
        LIMIT 1
      `).get(triggerType);

      // Also allow built-in types
      const BUILTIN_TYPES = [
        'contact', 'account', 'opportunity', 'activity', 'product',
        'feature', 'solution', 'campaign', 'subscription', 'pipeline'
      ];

      if (!objectDef && !BUILTIN_TYPES.includes(triggerType)) {
        return {
          severity: 'warning',
          code: 'UNKNOWN_ENTITY_TYPE',
          message: `Rule triggers on unknown entity type "${triggerType}" - verify it exists`,
        };
      }
      return null;
    },
  },

  // Field Type Change Warning
  {
    name: 'field_type_change',
    severity: 'warning',
    appliesTo: ['update'],
    check: (input) => {
      if (input.config_type !== 'field_def') return null;
      if (!input.previous_state) return null;

      const oldType = input.previous_state.inputType;
      const newType = input.payload.inputType;

      if (oldType && newType && oldType !== newType) {
        // Count affected records
        const affectedCount = countRecordsUsingField(input.target_id);

        return {
          severity: 'warning',
          code: 'FIELD_TYPE_CHANGE',
          message: `Changing field type from "${oldType}" to "${newType}" may affect ${affectedCount} records`,
        };
      }
      return null;
    },
  },

  // Required Field Addition Warning
  {
    name: 'required_field_addition',
    severity: 'warning',
    appliesTo: ['create', 'update'],
    check: (input) => {
      if (input.config_type !== 'field_def') return null;

      const isNowRequired = input.payload.required === true;
      const wasRequired = input.previous_state?.required === true;

      if (isNowRequired && !wasRequired) {
        return {
          severity: 'warning',
          code: 'REQUIRED_FIELD_ADDED',
          message: 'Adding a required field may cause validation failures for existing records',
        };
      }
      return null;
    },
  },

  // Constraint Pattern Validation
  {
    name: 'valid_constraint_pattern',
    severity: 'error',
    appliesTo: ['create', 'update'],
    check: (input) => {
      if (input.config_type !== 'validation_constraint') return null;

      const pattern = input.payload.pattern as string;
      if (!pattern) return null;

      try {
        new RegExp(pattern);
        return null;
      } catch {
        return {
          severity: 'error',
          code: 'INVALID_REGEX',
          message: `Invalid regex pattern: "${pattern}"`,
        };
      }
    },
  },

  // Derivation Expression Validation
  {
    name: 'valid_derivation_expression',
    severity: 'error',
    appliesTo: ['create', 'update'],
    check: (input) => {
      if (input.config_type !== 'derivation') return null;

      const expression = input.payload.expression as string;
      if (!expression) return null;

      // Basic syntax checks
      const balanced = checkBalancedParens(expression);
      if (!balanced) {
        return {
          severity: 'error',
          code: 'UNBALANCED_EXPRESSION',
          message: 'Expression has unbalanced parentheses',
        };
      }

      // Check for obviously invalid patterns
      if (/[\+\-\*\/]\s*$/.test(expression.trim())) {
        return {
          severity: 'error',
          code: 'INCOMPLETE_EXPRESSION',
          message: 'Expression ends with an operator',
        };
      }

      return null;
    },
  },

  // Workflow Step Order Validation
  {
    name: 'valid_workflow_step_order',
    severity: 'warning',
    appliesTo: ['create', 'update'],
    check: (input) => {
      if (input.config_type !== 'workflow_step') return null;

      const nextStepSlug = input.payload.next_step_slug as string;
      const currentSlug = input.payload.slug as string;

      if (nextStepSlug && nextStepSlug === currentSlug) {
        return {
          severity: 'error',
          code: 'WORKFLOW_SELF_REFERENCE',
          message: 'Workflow step cannot reference itself as next step',
        };
      }

      return null;
    },
  },

  // Pipeline Stage Sequence Validation
  {
    name: 'pipeline_stage_sequence',
    severity: 'warning',
    appliesTo: ['create', 'update'],
    check: (input) => {
      if (input.config_type !== 'pipeline_stage') return null;

      const pipelineType = input.payload.pipeline_type;
      const sequence = input.payload.sequence;

      // Check for duplicate sequence in same pipeline
      const existing = db.prepare(`
        SELECT slug FROM records
        WHERE type = 'pipeline_stage'
        AND JSON_EXTRACT(data, '$.pipeline_type') = ?
        AND JSON_EXTRACT(data, '$.sequence') = ?
        AND id != ?
      `).get(pipelineType, sequence, input.target_id || '');

      if (existing) {
        return {
          severity: 'warning',
          code: 'DUPLICATE_SEQUENCE',
          message: `Pipeline "${pipelineType}" already has a stage at sequence ${sequence}`,
        };
      }

      return null;
    },
  },

  // Interpreter executor registration check
  {
    name: 'known_interpreter_executors',
    severity: 'warning',
    appliesTo: ['create', 'update'],
    check: (input) => {
      if (input.config_type !== 'interpreter_pipeline') return null;

      const stages = Array.isArray(input.payload.stages) ? input.payload.stages : [];
      const unknown: string[] = [];
      const invalidOptions: string[] = [];
      const unsupportedEvents: string[] = [];
      const unsupportedEntityTypes: string[] = [];
      const pipelineEvent = typeof input.payload.event === 'string' ? input.payload.event : undefined;

      for (const stage of stages) {
        const executor = typeof stage?.executor === 'string' ? stage.executor.trim() : '';
        if (!executor) continue;
        if (BUILTIN_INTERPRETER_EXECUTORS.includes(executor as any)) continue;

        const definition = getInterpreterExecutorDefinition(executor, DEFAULT_ACCOUNT_ID);
        if (!definition) {
          if (!hasInterpreterExecutor(executor)) {
            unknown.push(executor);
          }
          continue;
        }

        if (pipelineEvent && definition.supported_events && definition.supported_events.length > 0) {
          if (!definition.supported_events.includes(pipelineEvent as any)) {
            unsupportedEvents.push(`${executor}:${pipelineEvent}`);
          }
        }

        const stageTypes = Array.isArray(stage?.appliesToEntityTypes)
          ? stage.appliesToEntityTypes.filter((value: unknown): value is string => typeof value === 'string')
          : [];
        if (stageTypes.length > 0 && definition.supported_entity_types && definition.supported_entity_types.length > 0) {
          const supported = new Set(definition.supported_entity_types);
          for (const entityType of stageTypes) {
            if (!supported.has(entityType as any)) {
              unsupportedEntityTypes.push(`${executor}:${entityType}`);
            }
          }
        }

        const options = stage?.options && typeof stage.options === 'object'
          ? stage.options as Record<string, any>
          : {};
        const contract = definition.options_contract;
        if (contract) {
          const required = contract.required || [];
          for (const key of required) {
            if (!(key in options)) {
              invalidOptions.push(`${executor}:missing:${key}`);
            }
          }

          const allowAdditional = contract.allow_additional ?? (contract.allowed ? false : true);
          if (!allowAdditional) {
            const allowed = new Set<string>([
              ...(contract.allowed || []),
              ...(contract.required || []),
            ]);
            for (const key of Object.keys(options)) {
              if (!allowed.has(key)) {
                invalidOptions.push(`${executor}:unsupported:${key}`);
              }
            }
          }
        }
      }

      if (unknown.length > 0) {
        return {
          severity: 'warning',
          code: 'UNKNOWN_INTERPRETER_EXECUTOR',
          message: `Unregistered interpreter executor(s): ${Array.from(new Set(unknown)).join(', ')}`,
        };
      }

      if (unsupportedEvents.length > 0) {
        return {
          severity: 'warning',
          code: 'UNSUPPORTED_INTERPRETER_EVENT',
          message: `Executor event mismatch: ${Array.from(new Set(unsupportedEvents)).join(', ')}`,
        };
      }

      if (unsupportedEntityTypes.length > 0) {
        return {
          severity: 'warning',
          code: 'UNSUPPORTED_INTERPRETER_ENTITY',
          message: `Executor entity type mismatch: ${Array.from(new Set(unsupportedEntityTypes)).join(', ')}`,
        };
      }

      if (invalidOptions.length > 0) {
        return {
          severity: 'warning',
          code: 'INVALID_INTERPRETER_OPTIONS',
          message: `Executor options mismatch: ${Array.from(new Set(invalidOptions)).join(', ')}`,
        };
      }

      return null;
    },
  },
];

// ============================================================================
// Main Safety Check Runner
// ============================================================================

/**
 * Run all applicable safety checks
 */
export function runSafetyChecks(input: SafetyCheckInput): SafetyCheckResult {
  const concerns: SafetyConcern[] = [];

  for (const check of SAFETY_CHECKS) {
    if (!check.appliesTo.includes(input.operation)) continue;

    try {
      const concern = check.check(input);
      if (concern) {
        concerns.push(concern);
      }
    } catch (err) {
      // Log but don't fail on check errors
      console.warn(`Safety check "${check.name}" failed:`, err);
    }
  }

  const hasBlockingError = concerns.some(c => c.severity === 'error');

  return {
    safe: !hasBlockingError,
    hasBreakingChanges: hasBlockingError,
    concerns,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

interface DependentInfo {
  type: ConfigTypeSlug;
  id: string;
  slug: string;
}

/**
 * Find all configs that depend on a given config
 */
function findDependents(configType: ConfigTypeSlug, configId: string): DependentInfo[] {
  const configDef = getConfigType(configType);
  const dependents: DependentInfo[] = [];

  // Get the record to know its slug
  const record = db.prepare('SELECT slug, type FROM records WHERE id = ?').get(configId) as any;
  if (!record) return [];

  const slug = record.slug;

  // Check each config type that might depend on this one
  for (const depSpec of configDef.dependents) {
    const depType = depSpec.configType;
    const field = depSpec.field;
    const depConfigDef = CONFIG_REGISTRY[depType];
    if (!depConfigDef) continue;

    // Query records of the dependent type using the entity type
    const depRecords = listRecords('00000000-0000-0000-0000-000000000000', depConfigDef.entityType as any);

    for (const depRecord of depRecords) {
      // Check if this record references our target
      if (checkFieldReference(depRecord.data, field, slug)) {
        dependents.push({
          type: depType,
          id: depRecord.id,
          slug: depRecord.slug,
        });
      }
    }
  }

  return dependents;
}

/**
 * Check if a record's data references a value at the given field path
 */
function checkFieldReference(data: any, fieldPath: string, targetValue: string): boolean {
  const parts = fieldPath.split('.');
  let current: any = data;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part === '*') {
      // Wildcard - check all elements of array
      if (Array.isArray(current)) {
        const remainingPath = parts.slice(i + 1).join('.');
        return current.some(item =>
          remainingPath ? checkFieldReference(item, remainingPath, targetValue) : item === targetValue
        );
      }
      return false;
    }

    if (current === null || current === undefined) return false;
    current = current[part];
  }

  if (Array.isArray(current)) {
    return current.includes(targetValue);
  }

  return current === targetValue;
}

/**
 * Count records using a field definition
 */
function countRecordsUsingField(fieldId?: string): number {
  if (!fieldId) return 0;

  // This is a simplified count - in reality would need to check
  // all object_defs that reference this field_def
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM records
    WHERE JSON_EXTRACT(data, '$.fieldGroups') LIKE ?
  `).get(`%${fieldId}%`) as { count: number };

  return result.count;
}

/**
 * Check if parentheses are balanced
 */
function checkBalancedParens(expr: string): boolean {
  let count = 0;
  for (const char of expr) {
    if (char === '(') count++;
    if (char === ')') count--;
    if (count < 0) return false;
  }
  return count === 0;
}

// ============================================================================
// Dependency Graph (for future use)
// ============================================================================

export interface DependencyNode {
  configType: ConfigTypeSlug;
  configId: string;
  slug: string;
}

export interface DependencyEdge {
  from: DependencyNode;
  to: DependencyNode;
  field: string;
}

/**
 * Build a dependency graph for an account's configuration
 * (Useful for impact analysis and visualization)
 */
export function buildDependencyGraph(accountId: string): {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
} {
  const nodes: DependencyNode[] = [];
  const edges: DependencyEdge[] = [];

  // Get all config records
  for (const [slug, configDef] of Object.entries(CONFIG_REGISTRY)) {
    const records = listRecords(accountId, configDef.entityType);

    for (const record of records) {
      const node: DependencyNode = {
        configType: slug as ConfigTypeSlug,
        configId: record.id,
        slug: record.slug,
      };
      nodes.push(node);

      // Check dependencies
      for (const depSpec of configDef.dependencies) {
        // Extract referenced value from record data
        const refValue = getFieldValue(record.data, depSpec.field);
        if (!refValue) continue;

        const refValues = Array.isArray(refValue) ? refValue : [refValue];

        for (const ref of refValues) {
          // Find the target node
          const targetType = CONFIG_REGISTRY[depSpec.configType];
          if (!targetType) continue;

          const targetRecord = db.prepare(`
            SELECT id, slug FROM records
            WHERE type = ? AND slug = ?
            LIMIT 1
          `).get(targetType.entityType, ref) as any;

          if (targetRecord) {
            edges.push({
              from: node,
              to: {
                configType: depSpec.configType,
                configId: targetRecord.id,
                slug: targetRecord.slug,
              },
              field: depSpec.field,
            });
          }
        }
      }
    }
  }

  return { nodes, edges };
}

/**
 * Get field value from nested path
 */
function getFieldValue(data: any, path: string): any {
  const parts = path.split('.');
  let current = data;

  for (const part of parts) {
    if (part === '*') {
      // Stop at wildcards for simple extraction
      return current;
    }
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }

  return current;
}
