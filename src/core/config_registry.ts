/**
 * Config Type Registry - Central registry for all soft-coded configuration types
 *
 * This registry provides:
 * - Zod validation schemas for each config type
 * - Dependency specifications (what each config depends on)
 * - Preview/dry-run handlers
 * - Safety validators
 *
 * Used by the Workspace system to validate, preview, and apply configuration changes.
 */

import { z, ZodSchema } from 'zod';
import { EntityType, ENTITY_TYPES, ConstraintType, ConstraintTrigger, OPPORTUNITY_STAGES, PIPELINE_TYPES } from './types.js';
import { TriggerEvent, RuleCondition, RuleAction, ActionType } from '../modules/ops/rules.js';
import { AggregationFunction } from '../modules/ops/metrics.js';
import { DerivationReturnType } from '../modules/ops/derivations.js';

// ============================================================================
// Config Types
// ============================================================================

export const CONFIG_TYPES = [
  'rule',
  'derivation',
  'validation_constraint',
  'metric',
  'view',
  'state_machine',
  'interpreter_pipeline',
  'interpreter_executor_def',
  'workflow',
  'workflow_step',
  'workflow_step_type',
  'pipeline_stage',
  'object_def',
  'field_def',
  'field_group',
  'activity_def',
  'health_config',
  'access_policy',
  'persona',
] as const;

export type ConfigTypeSlug = typeof CONFIG_TYPES[number];

// ============================================================================
// Shared Schema Components
// ============================================================================

// Entity type enum schema
const EntityTypeSchema = z.enum(ENTITY_TYPES);

// Filter operators (used by views, metrics, rules)
const FilterOpSchema = z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'in', 'not_in']);

// Condition operators (rules have additional ops)
const ConditionOpSchema = z.enum([
  'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
  'contains', 'in', 'not_in',
  'exists', 'not_exists',
  'changed', 'changed_to', 'has'
]);

// Field input types
const FieldInputTypeSchema = z.enum([
  'text', 'textarea', 'number', 'currency', 'date',
  'select', 'multiselect', 'image', 'url', 'boolean',
  'ref', 'Record', 'dimension', 'email', 'phone', 'percentage', 'richtext', 'virtual'
]);

// ============================================================================
// Rule Schema
// ============================================================================

const RuleConditionSchema = z.object({
  field: z.string().min(1),
  op: ConditionOpSchema,
  value: z.any().optional(),
});

const RuleActionSchema = z.object({
  type: z.enum(['set_field', 'create_record', 'create_relationship', 'delete_relationship', 'emit_event', 'log', 'allow', 'deny', 'compute_derivation']),
  target: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
});

export const RuleDataSchema = z.object({
  triggerEvent: z.enum(['pre_read', 'pre_create', 'post_create', 'pre_update', 'post_update', 'pre_delete', 'post_delete', 'scheduled']),
  triggerEntityType: EntityTypeSchema,
  conditions: z.array(RuleConditionSchema).optional(),
  actions: z.array(RuleActionSchema).min(1),
  priority: z.number().int().min(0).max(1000).default(100),
  isActive: z.boolean().default(true),
});

// ============================================================================
// Derivation Schema
// ============================================================================

export const DerivationDataSchema = z.object({
  targetEntityType: EntityTypeSchema,
  fieldName: z.string().min(1),
  expression: z.string().min(1),
  returnType: z.enum(['text', 'number', 'boolean', 'date', 'currency']),
  dependencies: z.array(z.string()).optional(),
});

// ============================================================================
// Validation Constraint Schema
// ============================================================================

export const ConstraintDataSchema = z.object({
  entity_type: z.union([EntityTypeSchema, z.literal('*')]),
  trigger: z.enum(['pre_create', 'pre_update', 'validation_endpoint']),
  constraint_type: z.enum([
    'required_field', 'required_fields', 'exists_in',
    'max_length', 'min_value', 'max_value',
    'relationship_exists', 'pattern', 'trigger_activity'
  ]),
  severity: z.enum(['error', 'warning']).default('error'),
  field: z.string().optional(),
  fields: z.array(z.string()).optional(),
  validation: z.string().optional(),
  max_length: z.number().int().positive().optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  condition: z.object({
    field: z.string(),
    op: z.string(),
    value: z.any(),
  }).optional(),
  relationship_type: z.string().optional(),
  power_level_minimum: z.number().optional(),
  pattern: z.string().optional(),
  allow_empty: z.boolean().optional(),
  activity_def_slug: z.string().optional(),
  error_code: z.string().min(1),
  error_message: z.string().min(1),
});

// ============================================================================
// Metric Schema
// ============================================================================

const MetricFilterSchema = z.object({
  field: z.string().min(1),
  op: FilterOpSchema,
  value: z.any(),
});

export const MetricDataSchema = z.object({
  sourceEntityType: EntityTypeSchema,
  targetEntityType: EntityTypeSchema,
  sourceField: z.string().min(1),
  targetField: z.string().min(1),
  aggregation: z.enum(['sum', 'count', 'avg', 'min', 'max']),
  relationshipPath: z.string().optional(),
  filters: z.array(MetricFilterSchema).optional(),
  trackLineage: z.boolean().default(false),
});

// ============================================================================
// View Schema
// ============================================================================

const ViewFilterSchema = z.object({
  field: z.string().min(1),
  op: FilterOpSchema,
  value: z.any(),
});

const ViewSortSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc']),
});

const ViewContextParamSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['string', 'number', 'boolean', 'date', 'record_id']),
  required: z.boolean().optional(),
});

export const ViewDataSchema = z.object({
  sourceType: z.enum(['record', 'relationship', 'aggregate']),
  targetEntityType: EntityTypeSchema,
  filters: z.array(ViewFilterSchema).optional(),
  sort: z.array(ViewSortSchema).optional(),
  limit: z.number().int().positive().optional(),
  contextParams: z.array(ViewContextParamSchema).optional(),
  outputSchema: z.record(z.string(), z.string()).optional(),
});

// ============================================================================
// State Machine Schema
// ============================================================================

const StateTransitionConditionSchema = z.object({
  field: z.string().min(1),
  op: ConditionOpSchema,
  value: z.any().optional(),
});

const StateTransitionSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  action: z.string().optional(),
  conditions: z.array(StateTransitionConditionSchema).optional(),
});

export const StateMachineDataSchema = z.object({
  targetEntityType: EntityTypeSchema,
  stateField: z.string().min(1).default('status'),
  states: z.array(z.string().min(1)).min(1),
  transitions: z.array(StateTransitionSchema),
  initialState: z.string().min(1),
}).superRefine((value, ctx) => {
  if (!value.states.includes(value.initialState)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['initialState'],
      message: 'initialState must be included in states',
    });
  }

  value.transitions.forEach((transition, index) => {
    if (!value.states.includes(transition.from)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['transitions', index, 'from'],
        message: `Unknown from-state "${transition.from}"`,
      });
    }
    if (!value.states.includes(transition.to)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['transitions', index, 'to'],
        message: `Unknown to-state "${transition.to}"`,
      });
    }
  });
});

// ============================================================================
// Interpreter Pipeline Schema
// ============================================================================

const InterpreterEventSchema = z.enum([
  'pre_create',
  'post_create',
  'pre_update',
  'post_update',
  'pre_delete',
  'post_delete',
]);

export const BUILTIN_INTERPRETER_EXECUTORS = [
  'constraints',
  'state_machine',
  'code_hooks',
  'rules',
] as const;

const InterpreterStageExecutorSchema = z.string().trim().min(1);

const InterpreterPipelineStageSchema = z.object({
  key: z.string().min(1).optional(),
  executor: InterpreterStageExecutorSchema,
  order: z.number().int().min(0),
  enabled: z.boolean().default(true),
  blocking: z.boolean().optional(),
  appliesToEntityTypes: z.array(EntityTypeSchema).optional(),
  options: z.record(z.string(), z.any()).optional(),
});

export const InterpreterPipelineDataSchema = z.object({
  event: InterpreterEventSchema,
  stages: z.array(InterpreterPipelineStageSchema).min(1),
  is_active: z.boolean().default(true),
}).superRefine((value, ctx) => {
  const seenOrders = new Set<number>();
  for (const [index, stage] of value.stages.entries()) {
    if (seenOrders.has(stage.order)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stages', index, 'order'],
        message: `Duplicate stage order: ${stage.order}`,
      });
    }
    seenOrders.add(stage.order);
  }
});

// ============================================================================
// Interpreter Executor Definition Schema
// ============================================================================

const InterpreterExecutorOptionsContractSchema = z.object({
  required: z.array(z.string().min(1)).optional(),
  allowed: z.array(z.string().min(1)).optional(),
  allow_additional: z.boolean().optional(),
});

const InterpreterExecutorRuntimeRegistrationSchema = z.object({
  module: z.string().trim().min(1),
  export: z.string().trim().min(1).optional(),
  enabled: z.boolean().optional(),
});

const InterpreterExecutorMetadataSchema = z.object({
  runtime_registration: InterpreterExecutorRuntimeRegistrationSchema.optional(),
  runtimeRegistration: InterpreterExecutorRuntimeRegistrationSchema.optional(),
}).catchall(z.any());

export const InterpreterExecutorDefDataSchema = z.object({
  key: z.string().trim().min(1),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  supported_events: z.array(InterpreterEventSchema).optional(),
  supported_entity_types: z.array(EntityTypeSchema).optional(),
  options_contract: InterpreterExecutorOptionsContractSchema.optional(),
  metadata: InterpreterExecutorMetadataSchema.optional(),
});

// ============================================================================
// Workflow Schema
// ============================================================================

// Must match WORKFLOW_STEP_TYPES in types.ts
const WorkflowStepTypeSchema = z.enum(['wait', 'send', 'update', 'branch', 'complete', 'query', 'advance_stage', 'generate_activities']);

export const WorkflowDataSchema = z.object({
  trigger_type: z.enum(['manual', 'event', 'segment']),
  trigger_event: z.string().optional(),
  trigger_segment: z.string().optional(),
  first_step_slug: z.string().min(1),
  pipeline_type: z.enum(PIPELINE_TYPES).optional(),
  is_active: z.boolean().default(true),
});

export const WorkflowStepDataSchema = z.object({
  workflow_slug: z.string().min(1),
  sequence: z.number().int().min(0),
  step_type: WorkflowStepTypeSchema,
  delay_hours: z.number().nonnegative().optional(),
  activity_def_slug: z.string().optional(),
  field_updates: z.record(z.string(), z.any()).optional(),
  conditions: z.array(z.record(z.string(), z.any())).optional(),
  next_step_slug: z.string().optional(),
  branch_step_slug: z.string().optional(),
  exit_conditions: z.array(z.any()).optional(),
  activation_energy: z.number().optional(),
});

export const WorkflowStepTypeDataSchema = z.object({
  handler: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  config_schema: z.record(z.string(), z.any()).optional(),
});

// ============================================================================
// Pipeline Stage Schema
// ============================================================================

const OblioQualifierSchema = z.object({
  qualifier: z.string().min(1),
  qualifierOperator: z.enum(['=', '>', '<', '!=', '>=', '<=', 'Non-Null']),
  qualifierValue: z.union([z.string(), z.number(), z.boolean()]),
  qualifierType: z.enum(['Data', 'Engagement', 'Asset', 'Admin']).optional(),
  qualifierRequired: z.boolean().optional(),
  qualifierPipeline: z.string().optional(),
  qualifierActivity: z.string().optional(),
  activityCondition: z.enum(['=', '>', '<', '!=', '>=', '<=', 'Non-Null']).optional(),
  activityValue: z.string().optional(),
});

const RequiredActivityConfigSchema = z.object({
  activity_def_slug: z.string().min(1),
  auto_generate: z.boolean(),
  assignment_rule: z.enum(['auto', 'owner', 'round_robin']).optional(),
  default_qualifiers: z.array(OblioQualifierSchema).optional(),
});

export const PipelineStageDataSchema = z.object({
  pipeline_type: z.enum(PIPELINE_TYPES),
  stage: z.enum(OPPORTUNITY_STAGES),
  sequence: z.number().int().min(0),
  probability: z.number().min(0).max(1).optional(), // Stage probability (e.g., 0.1 for MQL)
  anchor_type: z.enum(['account', 'contact']).optional(),
  description: z.string().optional(),
  required_activities: z.array(RequiredActivityConfigSchema),
  exit_qualifiers: z.array(OblioQualifierSchema),
  next_stage: z.enum(OPPORTUNITY_STAGES).nullable(),
});

// ============================================================================
// Object/Field Definition Schemas
// ============================================================================

const FieldDefSchema = z.object({
  name: z.string().min(1),
  canonical_name: z.string().regex(/^[a-z][a-z0-9_]*$/).optional(), // For code references
  type: FieldInputTypeSchema.optional(),
  inputType: FieldInputTypeSchema.optional(),
  required: z.boolean().optional(),
  ref_target: z.string().optional(),
  dimension: z.string().optional(),
  options: z.array(z.string()).optional(),
  description: z.string().optional(),
});

const FieldGroupDefSchema = z.object({
  name: z.string().min(1),
  fields: z.array(FieldDefSchema),
});

export const ObjectDefDataSchema = z.object({
  fieldGroups: z.array(FieldGroupDefSchema),
});

export const FieldDefRecordDataSchema = z.object({
  name: z.string().min(1),
  canonical_name: z.string().regex(/^[a-z][a-z0-9_]*$/).optional(),
  inputType: FieldInputTypeSchema,
  required: z.boolean().optional(),
  ref_target: z.string().optional(),
  dimension: z.string().optional(),
  options: z.array(z.string()).optional(),
  description: z.string().optional(),
  default_value: z.any().optional(),
});

// ============================================================================
// Activity Definition Schema
// ============================================================================

export const ActivityDefDataSchema = z.object({
  archetype: z.enum(['data', 'asset', 'engagement', 'admin']),
  category: z.string().optional(),
  default_duration_minutes: z.number().int().positive().optional(),
  energy_amount: z.number().optional(),
  is_system: z.boolean().default(false),
  assignment_rules: z.record(z.string(), z.any()).optional(),
});

// ============================================================================
// Health Config Schema
// ============================================================================

const HealthThresholdSchema = z.object({
  name: z.string().min(1),
  min_value: z.number(),
  max_value: z.number(),
  action_on_enter: z.string().optional(),
});

export const HealthConfigDataSchema = z.object({
  entity_type: EntityTypeSchema,
  base_health: z.number().min(0).max(100),
  decay_formula: z.enum(['linear', 'exponential']),
  base_decay_rate: z.number().min(0),
  min_health: z.number().min(0),
  max_health: z.number().max(100),
  health_thresholds: z.array(HealthThresholdSchema),
});

// ============================================================================
// Access Policy Schema
// ============================================================================

export const AccessPolicyDataSchema = z.object({
  resource_type: EntityTypeSchema,
  role: z.string().min(1),
  permissions: z.array(z.enum(['create', 'read', 'update', 'delete', 'list'])),
  conditions: z.array(RuleConditionSchema).optional(),
  is_active: z.boolean().default(true),
});

// ============================================================================
// Persona Schema (for dimension_values metadata)
// ============================================================================

export const PersonaMetadataSchema = z.object({
  power_level: z.number().int().min(1).max(10),
  health_score: z.number().min(0).max(100),
  routing_target: z.string().optional(),
  kinetic_routing: z.object({
    routing_target: z.string(),
    priority: z.number().optional(),
  }).optional(),
});

// ============================================================================
// Dependency Specification
// ============================================================================

export interface DependencySpec {
  configType: ConfigTypeSlug;
  field: string; // Field path that references the dependency
  required: boolean;
}

// ============================================================================
// Preview & Safety Result Types
// ============================================================================

export interface PreviewResult {
  success: boolean;
  preview: any; // Computed result or simulated effect
  warnings: string[];
  errors: string[];
}

export interface SafetyResult {
  safe: boolean;
  hasBreakingChanges: boolean;
  concerns: SafetyConcern[];
}

export interface SafetyConcern {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  affectedItems?: string[];
}

// ============================================================================
// Config Type Definition
// ============================================================================

export interface ConfigTypeDefinition {
  slug: ConfigTypeSlug;
  entityType: EntityType;
  displayName: string;
  description: string;
  schema: ZodSchema;
  dependencies: DependencySpec[];
  dependents: DependencySpec[];
  // Optional handlers (can be registered later)
  previewHandler?: (config: any, context: any) => Promise<PreviewResult>;
  validateSafety?: (config: any, existing: any[]) => Promise<SafetyResult>;
}

// ============================================================================
// Config Type Registry
// ============================================================================

export const CONFIG_REGISTRY: Record<ConfigTypeSlug, ConfigTypeDefinition> = {
  rule: {
    slug: 'rule',
    entityType: 'rule',
    displayName: 'Business Rule',
    description: 'Automation rules triggered by record events',
    schema: RuleDataSchema,
    dependencies: [
      { configType: 'object_def', field: 'triggerEntityType', required: true },
      { configType: 'activity_def', field: 'actions.*.data.activity_def_slug', required: false },
    ],
    dependents: [],
  },

  derivation: {
    slug: 'derivation',
    entityType: 'derivation',
    displayName: 'Computed Field',
    description: 'Formula-based calculated fields',
    schema: DerivationDataSchema,
    dependencies: [
      { configType: 'object_def', field: 'targetEntityType', required: true },
      { configType: 'field_def', field: 'fieldName', required: true },
    ],
    dependents: [],
  },

  validation_constraint: {
    slug: 'validation_constraint',
    entityType: 'validation_constraint',
    displayName: 'Validation Constraint',
    description: 'Data validation rules for records',
    schema: ConstraintDataSchema,
    dependencies: [
      { configType: 'object_def', field: 'entity_type', required: true },
      { configType: 'activity_def', field: 'activity_def_slug', required: false },
    ],
    dependents: [],
  },

  metric: {
    slug: 'metric',
    entityType: 'metric',
    displayName: 'Rollup Metric',
    description: 'Aggregation rules across related records',
    schema: MetricDataSchema,
    dependencies: [
      { configType: 'object_def', field: 'sourceEntityType', required: true },
      { configType: 'object_def', field: 'targetEntityType', required: true },
    ],
    dependents: [],
  },

  view: {
    slug: 'view',
    entityType: 'view',
    displayName: 'Data View',
    description: 'Query definitions for data retrieval',
    schema: ViewDataSchema,
    dependencies: [
      { configType: 'object_def', field: 'targetEntityType', required: true },
    ],
    dependents: [],
  },

  state_machine: {
    slug: 'state_machine',
    entityType: 'state_machine',
    displayName: 'State Machine',
    description: 'Entity lifecycle state transitions',
    schema: StateMachineDataSchema,
    dependencies: [
      { configType: 'object_def', field: 'targetEntityType', required: true },
    ],
    dependents: [],
  },

  interpreter_pipeline: {
    slug: 'interpreter_pipeline',
    entityType: 'interpreter_pipeline',
    displayName: 'Interpreter Pipeline',
    description: 'Lifecycle stage ordering for record interpreter events',
    schema: InterpreterPipelineDataSchema,
    dependencies: [],
    dependents: [],
  },

  interpreter_executor_def: {
    slug: 'interpreter_executor_def',
    entityType: 'interpreter_executor_def',
    displayName: 'Interpreter Executor Definition',
    description: 'Declarative catalog entries for lifecycle stage executors',
    schema: InterpreterExecutorDefDataSchema,
    dependencies: [],
    dependents: [],
  },

  workflow: {
    slug: 'workflow',
    entityType: 'workflow',
    displayName: 'Workflow',
    description: 'Multi-step automation sequences',
    schema: WorkflowDataSchema,
    dependencies: [
      { configType: 'workflow_step', field: 'first_step_slug', required: true },
    ],
    dependents: [
      { configType: 'workflow_step', field: 'workflow_slug', required: true },
    ],
  },

  workflow_step: {
    slug: 'workflow_step',
    entityType: 'workflow_step',
    displayName: 'Workflow Step',
    description: 'Individual step in a workflow',
    schema: WorkflowStepDataSchema,
    dependencies: [
      { configType: 'workflow', field: 'workflow_slug', required: true },
      { configType: 'workflow_step_type', field: 'step_type', required: true },
      { configType: 'activity_def', field: 'activity_def_slug', required: false },
    ],
    dependents: [],
  },

  workflow_step_type: {
    slug: 'workflow_step_type',
    entityType: 'workflow_step_type',
    displayName: 'Workflow Step Type',
    description: 'Step type definitions with handler mappings',
    schema: WorkflowStepTypeDataSchema,
    dependencies: [],
    dependents: [
      { configType: 'workflow_step', field: 'step_type', required: true },
    ],
  },

  pipeline_stage: {
    slug: 'pipeline_stage',
    entityType: 'pipeline_stage',
    displayName: 'Pipeline Stage',
    description: 'Opportunity stage configuration with activities and qualifiers',
    schema: PipelineStageDataSchema,
    dependencies: [
      { configType: 'activity_def', field: 'required_activities.*.activity_def_slug', required: true },
    ],
    dependents: [],
  },

  object_def: {
    slug: 'object_def',
    entityType: 'object_def',
    displayName: 'Object Definition',
    description: 'Entity schema definitions',
    schema: ObjectDefDataSchema,
    dependencies: [
      { configType: 'field_def', field: 'fieldGroups.*.fields.*.ref_target', required: false },
    ],
    dependents: [
      { configType: 'rule', field: 'triggerEntityType', required: true },
      { configType: 'derivation', field: 'targetEntityType', required: true },
      { configType: 'validation_constraint', field: 'entity_type', required: true },
      { configType: 'state_machine', field: 'targetEntityType', required: true },
      { configType: 'metric', field: 'sourceEntityType', required: true },
      { configType: 'metric', field: 'targetEntityType', required: true },
      { configType: 'view', field: 'targetEntityType', required: true },
    ],
  },

  field_def: {
    slug: 'field_def',
    entityType: 'field_def',
    displayName: 'Field Definition',
    description: 'Field schema definitions',
    schema: FieldDefRecordDataSchema,
    dependencies: [],
    dependents: [
      { configType: 'derivation', field: 'fieldName', required: true },
      { configType: 'derivation', field: 'dependencies.*', required: false },
    ],
  },

  field_group: {
    slug: 'field_group',
    entityType: 'object_def', // Field groups are embedded in object_def
    displayName: 'Field Group',
    description: 'Grouping of fields within an object definition',
    schema: FieldGroupDefSchema,
    dependencies: [],
    dependents: [],
  },

  activity_def: {
    slug: 'activity_def',
    entityType: 'activity_def',
    displayName: 'Activity Definition',
    description: 'Activity type definitions with energy and assignment rules',
    schema: ActivityDefDataSchema,
    dependencies: [],
    dependents: [
      { configType: 'rule', field: 'actions.*.data.activity_def_slug', required: false },
      { configType: 'workflow_step', field: 'activity_def_slug', required: false },
      { configType: 'pipeline_stage', field: 'required_activities.*.activity_def_slug', required: true },
      { configType: 'validation_constraint', field: 'activity_def_slug', required: false },
    ],
  },

  health_config: {
    slug: 'health_config',
    entityType: 'health_config',
    displayName: 'Health Configuration',
    description: 'Health/decay settings per entity type',
    schema: HealthConfigDataSchema,
    dependencies: [
      { configType: 'object_def', field: 'entity_type', required: true },
    ],
    dependents: [],
  },

  access_policy: {
    slug: 'access_policy',
    entityType: 'rule', // Access policies are a type of rule
    displayName: 'Access Policy',
    description: 'Role-based access control rules',
    schema: AccessPolicyDataSchema,
    dependencies: [
      { configType: 'object_def', field: 'resource_type', required: true },
    ],
    dependents: [],
  },

  persona: {
    slug: 'persona',
    entityType: 'persona',
    displayName: 'Persona',
    description: 'Buyer persona definitions with routing and scoring metadata',
    schema: PersonaMetadataSchema,
    dependencies: [],
    dependents: [],
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get a config type definition by slug
 */
export function getConfigType(slug: ConfigTypeSlug): ConfigTypeDefinition {
  const configType = CONFIG_REGISTRY[slug];
  if (!configType) {
    throw new Error(`Unknown config type: ${slug}`);
  }
  return configType;
}

/**
 * Validate config data against its schema
 */
export function validateConfigData(slug: ConfigTypeSlug, data: unknown): { success: boolean; data?: any; errors?: z.ZodError } {
  const configType = getConfigType(slug);
  const result = configType.schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Get all config types that depend on a given type
 */
export function getDependents(slug: ConfigTypeSlug): ConfigTypeSlug[] {
  const configType = getConfigType(slug);
  return configType.dependents.map(d => d.configType);
}

/**
 * Get all config types that a given type depends on
 */
export function getDependencies(slug: ConfigTypeSlug): ConfigTypeSlug[] {
  const configType = getConfigType(slug);
  return [...new Set(configType.dependencies.map(d => d.configType))];
}

/**
 * Check if a config type is valid
 */
export function isValidConfigType(slug: string): slug is ConfigTypeSlug {
  return CONFIG_TYPES.includes(slug as ConfigTypeSlug);
}

/**
 * Get all config type slugs
 */
export function getAllConfigTypes(): ConfigTypeSlug[] {
  return [...CONFIG_TYPES];
}

/**
 * Get config types that are directly editable (have UI support)
 */
export function getEditableConfigTypes(): ConfigTypeSlug[] {
  return [
    'rule',
    'derivation',
    'validation_constraint',
    'metric',
    'view',
    'state_machine',
    'interpreter_pipeline',
    'interpreter_executor_def',
    'workflow',
    'workflow_step',
    'workflow_step_type',
    'pipeline_stage',
    'object_def',
    'field_def',
    'field_group',
    'activity_def',
    'health_config',
    'access_policy',
    'persona',
  ];
}
