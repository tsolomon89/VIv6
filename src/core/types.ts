// Single Source of Truth for Entity Types
export const ENTITY_TYPES = ['object_def', 'field_def', 'activity_def', 'view', 'derivation', 'metric', 'rule', 'account', 'contact', 'product', 'feature', 'solution', 'useCase', 'persona', 'asset', 'page', 'brand', 'user', 'role', 'activity', 'opportunity', 'subscription', 'campaign', 'tenant', 'pipeline', 'assetGroup', 'workflow', 'content'] as const;

export type EntityType = typeof ENTITY_TYPES[number];

export const ACTIVITY_TYPES = ['data', 'asset', 'engagement', 'admin'] as const;
export type ActivityType = typeof ACTIVITY_TYPES[number];

export const OPPORTUNITY_STAGES = ['mql', 'sql', 'ftp', 'rtp'] as const;
export type OpportunityStage = typeof OPPORTUNITY_STAGES[number];

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

// Union type for the 'data' column in entities table
// It can be a simple JSON (legacy/seed) OR a full RecordStruct
// The Inflation Layer converts JSON -> RecordStruct
export type UniversalRecordData = RecordStruct | Record<string, any>;

