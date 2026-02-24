// Single Source of Truth for Entity Types
export const ENTITY_TYPES = ['object_def', 'field_def', 'activity_def', 'view', 'derivation', 'metric', 'rule', 'validation_constraint', 'account', 'contact', 'product', 'feature', 'solution', 'useCase', 'persona', 'asset', 'page', 'brand', 'user', 'role', 'activity', 'opportunity', 'subscription', 'campaign', 'tenant', 'pipeline', 'assetGroup', 'workflow', 'workflow_step', 'workflow_step_type', 'workflow_enrollment', 'content', 'pipeline_stage', 'qualifier_def', 'assignment_pool', 'health_config'] as const;

export type EntityType = typeof ENTITY_TYPES[number];

export const ACTIVITY_TYPES = ['data', 'asset', 'engagement', 'admin'] as const;
export type ActivityType = typeof ACTIVITY_TYPES[number];

export const OPPORTUNITY_STAGES = ['mql', 'sql', 'ftp', 'rtp'] as const;
export type OpportunityStage = typeof OPPORTUNITY_STAGES[number];

// Pipeline types for the Activity Generation system
export const PIPELINE_TYPES = ['b2b', 'b2c', 'employment', 'partnership', 'reseller', 'investment'] as const;
export type PipelineType = typeof PIPELINE_TYPES[number];

export interface OpportunityItem {
    id: string;
    product_id: string; // Original Reference
    name: string;      // Snapshot
    sku?: string;      // Snapshot
    price: number;     // Snapshot
    currency: string;  // Snapshot
    quantity: number;
    added_at: string;
}

export type FieldInputType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'currency'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'image'
  | 'url'
  | 'boolean'
  | 'boolean'
  | 'ref' // Legacy
  | 'Record'; // Canonical Invariant

export interface Property {
  value: string | number | boolean | null;
  metadata?: Record<string, unknown>;
}

export interface Field {
  name: string;
  inputType: FieldInputType;
  value?: string | number | boolean | null; // Simplified from Property for now, easier for UI
  options?: string[]; // For select/multiselect
  required?: boolean;
}

export interface EntityData {
  fieldGroups: FieldGroupStruct[];
  // Loose props allowed for legacy/migration support, but prefer structured access via fieldGroups
  [key: string]: any; 
}

export interface DimensionStruct {
    id?: string;
    dimension: string;
    slug: string;
    label: string;
    parent_id?: string;
    metadata?: Record<string, any>;
    source?: string;
    brand_id?: string;
}

export interface DataRecord {
  id: string; // UUID
  type: EntityType; // Keep EntityType for now or rename to RecordType? User didn't request Type Enum rename.
  slug: string; // Globally unique within Account
  name: string;
  summary?: string;
  description?: string;
  data: EntityData; // Flexible schema-driven data
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  content_hash?: string; // For idempotency
  account_id: string; // Multi-tenant scoping
  activity_type?: ActivityType; // Phase 11
  opportunity_stage?: OpportunityStage; // Phase 12
}

export interface DataRecordInput {
  id?: string; // Optional for reseeding/staging
  type: EntityType;
  slug: string;
  name: string;
  summary?: string;
  description?: string;
  data?: EntityData;
  account_id: string;
  activity_type?: ActivityType; // Phase 11
  opportunity_stage?: OpportunityStage; // Phase 12
}

export interface RecordRelationship {
  id: string; // UUID
  from_record_id: string;
  to_record_id: string;
  relationship_type: string; // e.g., 'offers', 'has_feature'
  data: Record<string, any>; // JSON (e.g., order)
  created_at: string;
}

export interface RecordRelationshipInput {
  id?: string; // Optional for reseeding/staging
  from_record_id: string; // Renamed from from_entity_id
  to_record_id: string;   // Renamed from to_entity_id
  relationship_type: string;
  data?: Record<string, any>;
}

export type BuildStatus = 'pending' | 'success' | 'error';

export interface BuildState {
  record_id: string; // Renamed from entity_id
  content_hash: string;
  status: BuildStatus;
  last_built_at?: string;
}

// --- EAV / Homoiconic Structures (RecordStruct) ---
// Canonical definition based on invariant_data_model.md

export interface RecordSnapshotStruct {
  idRefRecord: string; // The authoritative identity of the target
  data: Record<string, any>;
  created_at: string;
}

export interface PropertyStruct {
  // Scalar value (string/number/boolean) OR Reference ID (string) if inputType='Record'
  valueProperty: string | number | boolean | null;
  // Optional embedded snapshot of the target record
  recordSnapshotStruct?: RecordSnapshotStruct; 
}

export interface FieldStruct {
  idRefFieldRecord: string; // Points to the Field Definition Record
  nameField: string;        // Allow cached name lookup (Denormalized)
  inputType: FieldInputType; // Use the strict union type
  displayPosition: number;
  isSelectMany: boolean;
  isSystem: boolean;
  propertyStructs: PropertyStruct[];
  // Additional properties from seed format (used by UI and seeding)
  required?: boolean;       // Field validation
  ref_target?: string;      // Target object type for Record/ref fields
  dimension?: string;       // Dimension slug for dimension-based fields
  options?: string[];       // Predefined options for select/multiselect
  value?: string | number | boolean | null | string[]; // Direct value storage (alternative to propertyStructs)
}

export interface FieldGroupStruct {
  idRefFieldGroupRecord: string;
  nameFieldGroup: string;
  fieldStructs: FieldStruct[];
}

export interface ObjectStruct {
  idRefObjectRecord: string; // Points to the Object Definition Record
  typeObject: string;        // "Contact", "Product", etc.
  fieldGroupStructs: FieldGroupStruct[];
}

export interface RecordStruct {
  idRecord: string;
  account_id: string; // System-level multi-tenancy
  objectStruct: ObjectStruct;
}

// --- Phase 11: Physics of Time & Workflows ---

export interface DurationStruct {
    default_duration_minutes: number; // Theoretical
    baseline_duration_minutes?: number; // Statistical
    actual_duration_seconds?: number; // Measured
}

export interface WorkflowStep {
    id: string;
    sequence_id: string;
    asset_id?: string;
    action_type: ActivityType;
    required_qualifiers: string[];
}

// --- Activity Generation System (Chain Reaction) ---

export type QualifierOperator = '=' | '>' | '<' | '!=' | '>=' | '<=' | 'Non-Null';

export interface OblioQualifier {
    qualifier: string;  // Path: "object : fieldGroup : field"
    qualifierOperator: QualifierOperator;
    qualifierValue: string | number | boolean;
    qualifierType?: 'Data' | 'Engagement' | 'Asset' | 'Admin';
    qualifierRequired?: boolean;
    qualifierPipeline?: string;  // e.g., "B2B - MQL"
    qualifierActivity?: string;  // Optional activity condition
    activityCondition?: QualifierOperator;
    activityValue?: string;
    // Runtime evaluation state
    _evaluated?: boolean;
    _result?: boolean;
    _evaluatedAt?: string;
}

export interface RequiredActivityConfig {
    activity_def_slug: string;
    auto_generate: boolean;
    assignment_rule?: 'auto' | 'owner' | 'round_robin';
    default_qualifiers?: OblioQualifier[];
}

// ============================================================================
// Data-Driven Validation Constraints (ConstraintEngine)
// ============================================================================

export type ConstraintType =
    | 'required_field'
    | 'required_fields'
    | 'exists_in'
    | 'max_length'
    | 'min_value'
    | 'max_value'
    | 'relationship_exists'
    | 'pattern'
    | 'trigger_activity';

export type ConstraintTrigger = 'pre_create' | 'pre_update' | 'validation_endpoint';
export type ConstraintSeverity = 'error' | 'warning';

export interface ValidationConstraintData extends EntityData {
    entity_type: EntityType | '*';  // '*' matches all entity types
    trigger: ConstraintTrigger;
    constraint_type: ConstraintType;
    severity?: ConstraintSeverity;
    field?: string;
    fields?: string[];
    validation?: string;           // For exists_in: 'exists_in_pipeline_stages', etc.
    max_length?: number;
    min_value?: number;
    max_value?: number;
    condition?: { field: string; op: string; value: any };
    relationship_type?: string;
    power_level_minimum?: number;
    pattern?: string;              // Regex pattern for 'pattern' constraint
    allow_empty?: boolean;         // For 'pattern': pass validation if field is empty/null
    activity_def_slug?: string;    // For 'trigger_activity' constraint
    error_code: string;
    error_message: string;
}

export interface AssignmentPoolData extends EntityData {
    scope: 'account' | 'pipeline_type';
    pipeline_type?: PipelineType | string;
    member_ids: string[];           // Contact IDs in the pool
    last_assigned_index: number;    // Cursor position (-1 = none assigned yet)
    last_assigned_at: string | null;
}

export interface PipelineStageConfig {
    pipeline_type: PipelineType;
    stage: OpportunityStage;
    sequence: number;
    anchor_type?: 'account' | 'contact';  // B2C anchors to contact, B2B to account
    description?: string;
    required_activities: RequiredActivityConfig[];
    exit_qualifiers: OblioQualifier[];
    next_stage: OpportunityStage | null;
}

// ============================================================================
// Workflow Engine Types
// ============================================================================

export const WORKFLOW_STEP_TYPES = ['wait', 'send', 'update', 'branch', 'complete'] as const;
export type WorkflowStepType = typeof WORKFLOW_STEP_TYPES[number];

export const WORKFLOW_ENROLLMENT_STATUSES = ['active', 'paused', 'completed', 'exited'] as const;
export type WorkflowEnrollmentStatus = typeof WORKFLOW_ENROLLMENT_STATUSES[number];

export interface WorkflowStepConfig {
    step_type: WorkflowStepType;
    delay_hours?: number;
    activity_def_slug?: string;
    field_updates?: Record<string, any>;
    conditions?: Record<string, any>[];  // Uses same structure as RuleCondition
    next_step_slug?: string;
    branch_step_slug?: string;
    exit_conditions?: OblioQualifier[];
    activation_energy?: number;
}

export interface WorkflowData extends EntityData {
    trigger_type: 'manual' | 'event' | 'segment';
    trigger_event?: string;
    trigger_segment?: string;
    first_step_slug: string;
    pipeline_type?: PipelineType;
    is_active: boolean;
}

export interface WorkflowEnrollmentData extends EntityData {
    workflow_id: string;
    contact_id: string;
    current_step_id: string;
    status: WorkflowEnrollmentStatus;
    enrolled_at: string;
    next_step_due_at?: string;
    exit_reason?: 'win' | 'loss' | 'manual';
}

// ============================================================================
// Health/Decay Types
// ============================================================================

export interface HealthConfigData extends EntityData {
    entity_type: EntityType;
    base_health: number;
    decay_formula: 'linear' | 'exponential';
    base_decay_rate: number;
    min_health: number;
    max_health: number;
    health_thresholds: HealthThreshold[];
}

export interface HealthThreshold {
    name: string;
    min_value: number;
    max_value: number;
    action_on_enter?: string;
}

// Union type for the 'data' column in entities table
// It can be a simple JSON (legacy/seed) OR a full RecordStruct
// The Inflation Layer converts JSON -> RecordStruct
export type UniversalRecordData = RecordStruct | Record<string, any>;

// ============================================================================
// Page Asset Types (Webbuilder Integration)
// ============================================================================

/**
 * Asset attribution fields aligned with Oblio model.
 * Website pages are assets where channel='website' and medium='page'.
 */
export interface AssetAttribution {
  channel: 'website' | 'social' | 'display' | 'search' | 'email' | 'call' | 'event';
  medium: 'page' | 'article' | 'video' | 'post' | 'document' | 'dynamic_ad' | 'message';
  source: string;           // Root referring URL (e.g., 'brand.co')
  referralType: 'organic' | 'paid';
  version: string;          // e.g., 'V.01'
}

/**
 * Page-specific configuration within an asset record.
 * References webbuilder types via JSON structure.
 */
export interface PageConfig {
  schemaVersion: 1;
  pageContext: { kind: 'detail' | 'index' };
  pageSubject: { target: string; cardinality: 'one' | 'many' };
  templateKey?: string;     // Reference to page_templates.key
  sectionOverrides?: Record<string, Record<string, unknown>>;
}

/**
 * PageAssetData extends EntityData for page records.
 * Used when record.type === 'page'.
 */
export interface PageAssetData extends EntityData {
  attribution: AssetAttribution;
  pageConfig: PageConfig;
  sections?: unknown[];     // SectionInstance[] serialized
}

