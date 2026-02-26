const API_BASE = 'http://localhost:11306/api';

// Matches src/core/types.ts
export type FieldInputType = 
  | 'text' | 'textarea' | 'number' | 'currency' | 'date' 
  | 'select' | 'multiselect' | 'image' | 'url' | 'richtext' | 'boolean'
  | 'Record' | 'ref';

export interface Field {
  name: string;
  inputType: FieldInputType;
  value?: string | number | boolean | null | string[];
  options?: string[];
  required?: boolean;
  maxChars?: number;
  typographyRole?: string;
  readonly?: boolean;
  description?: string;
  ref_target?: string;
  // Phase 4: Dimension field properties for cascading pick-lists
  dimension?: string;           // Dimension slug, e.g., "department", "industry"
  dependsOn?: string[];         // Field names this depends on, e.g., ["Sector"] for Industry
  // Canonical format alternatives (for dual-format support)
  nameField?: string;           // Canonical: field name
  type?: string;                // Seed format: field type (alias for inputType)
}

export interface FieldGroup {
  name: string;
  fields: Field[];
  // Canonical format alternatives (for dual-format support)
  nameFieldGroup?: string;   // Canonical: group name
  fieldStructs?: Field[];    // Canonical: field array
}

export interface EntityData {
  fieldGroups: FieldGroup[];
  personas?: {
    DM?: Record<string, string[]>;
    EU?: Record<string, string[]>;
    IN?: Record<string, string[]>;
  };
}

export interface Entity {
  id: string;
  type: string;
  slug: string;
  name: string;
  description?: string;
  data: EntityData;
  created_at: string;
  updated_at: string;
  content_hash?: string;
  _idempotency?: 'created' | 'updated' | 'skipped';
  brand_id?: string;
  account_id?: string;
}

export interface EntityInput {
  type: string;
  slug: string;
  name: string;
  description?: string;
  data?: EntityData;
  brand_id?: string;
  account_id?: string;
}

export interface Relationship {
  id: string;
  from_id: string;
  from_type: string;
  to_id: string;
  to_type: string;
  type: string;
  properties: Record<string, unknown>;
  created_at: string;
}

export interface RelationshipInput {
  from_id: string;
  to_id: string;
  type: string;
  properties?: Record<string, unknown>;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
  status: number;
}

// --- Auth Types ---

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthAccount {
  id: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  accounts: AuthAccount[];
}

export interface MeResponse {
  user: AuthUser;
  accounts: AuthAccount[];
}

// --- Dimension Values ---

export interface DimensionValue {
  id: string;
  dimension: string;
  slug: string;
  label: string;
  parent_id: string | null;
  metadata: Record<string, unknown> | null;
  source: string;
  source_ref: string | null;
  brand_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DimensionType {
  dimension: string;
  count: number;
}

// Phase 4: Filtered dimension response for cascading pick-lists
export interface FilteredDimensionResponse {
  dimension: string;
  values: Array<{
    id: string;
    slug: string;
    label: string;
    parentId: string | null;
    metadata: Record<string, unknown>;
  }>;
  filtered: boolean;
  filterApplied?: Record<string, string>;
}

export interface DimensionDependency {
  id: string;
  source_dimension: string;
  source_value_id: string;
  source_slug: string;
  source_label: string;
  target_dimension: string;
  target_value_id: string;
  target_slug: string;
  target_label: string;
  bidirectional: number;
  weight: number;
}

// --- Config Workspaces (GTM-style staging) ---

export type WorkspaceStatus = 'draft' | 'review' | 'approved' | 'applied' | 'rejected' | 'rolled_back';
export type ConfigTypeSlug =
  | 'rule' | 'derivation' | 'validation_constraint' | 'metric' | 'view'
  | 'interpreter_pipeline'
  | 'interpreter_executor_def'
  | 'workflow' | 'workflow_step' | 'workflow_step_type' | 'pipeline_stage'
  | 'object_def' | 'field_def' | 'field_group' | 'activity_def' | 'health_config'
  | 'access_policy' | 'persona' | 'state_machine';

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

export interface ConfigChange {
  id: string;
  workspace_id: string;
  config_type: ConfigTypeSlug;
  operation: 'create' | 'update' | 'delete';
  target_id?: string;
  target_slug?: string;
  payload: Record<string, unknown>;
  previous_state?: Record<string, unknown>;
  validation_result?: {
    valid: boolean;
    errors?: Array<{ path: string; message: string }>;
  };
  safety_result?: {
    safe: boolean;
    concerns?: Array<{ severity: string; code: string; message: string }>;
  };
  status: 'pending' | 'applied' | 'rolled_back' | 'failed';
  created_at: string;
}

export interface WorkspaceWithChanges extends ConfigWorkspace {
  changes: ConfigChange[];
}

export interface WorkspacePreview {
  canApply: boolean;
  blockingReasons: string[];
  stats: { created: number; updated: number; deleted: number };
  validationErrors: Array<{ changeId: string; errors: string[] }>;
  safetyConcerns: Array<{ severity: string; code: string; message: string }>;
  dependencyImpact: Array<{ configType: string; id: string; slug: string }>;
  summary: string;
}

export interface ConfigVersion {
  id: string;
  config_type: ConfigTypeSlug;
  config_id: string;
  version: number;
  data: Record<string, unknown>;
  changed_by?: string;
  workspace_id?: string;
  change_summary?: string;
  created_at: string;
}

export interface ConfigTypeInfo {
  slug: ConfigTypeSlug;
  displayName: string;
  description: string;
  entityType: string;
}

export type InterpreterEvent =
  | 'pre_create'
  | 'post_create'
  | 'pre_update'
  | 'post_update'
  | 'pre_delete'
  | 'post_delete';

export interface InterpreterExecutorInfo {
  key: string;
  isBuiltin: boolean;
  isRegistered: boolean;
  hasDefinition: boolean;
  isActive: boolean | null;
  supportedEvents: string[];
  supportedEntityTypes: string[];
  optionsContract: {
    required?: string[];
    allowed?: string[];
    allow_additional?: boolean;
  } | null;
  description: string | null;
}

export interface InterpreterStageValidationInput {
  account_id?: string;
  event: InterpreterEvent;
  entity_type: string;
  stage: {
    executor: string;
    order?: number;
    options?: Record<string, unknown>;
  };
}

export interface InterpreterStageValidationResult {
  valid: boolean;
  errors: string[];
  executor: {
    key: string;
    isBuiltin: boolean;
    isRegistered: boolean;
    hasDefinition: boolean;
    definition: Record<string, unknown> | null;
  };
}

// --- Builds ---

export interface BuildEntry {
  entity_id: string;
  entity_name?: string;
  entity_type?: string;
  entity_slug?: string;
  status: 'pending' | 'success' | 'error';
  content_hash: string | null;
  error_message: string | null;
  built_at: string | null;
}

export interface BuildSummary {
  pending: number;
  success: number;
  error: number;
  total: number;
}

// --- Templates ---

export interface TemplateSection {
  schemaVersion?: number;
  id: string;
  placement: { slot: string; order?: number };
  binding: { kind: string; target?: string; cardinality?: string };
  presentationKey: string;
  overrides?: Record<string, unknown>;
}

export interface PageTemplate {
  key: string;
  name: string;
  description?: string;
  subject_target: string;
  subject_cardinality: string;
  sections: TemplateSection[];
}

// --- Derived Pages ---

export interface DerivedSection {
  id: string;
  binding: { kind: string; target?: string; cardinality?: string; relationKey?: string };
  presentationKey: string | null;
  placement: { slot: string; order: number };
  config: Record<string, unknown>;
  entities: Array<{ id: string; slug: string; name: string; type: string; data: Record<string, unknown> }>;
}

export interface DerivedPage {
  entityId: string;
  entitySlug: string;
  entityType: string;
  entityName: string;
  route: string;
  sections: DerivedSection[];
  segmentPages: Array<{ path: string; entity: string; template: string | null; segment?: string }>;
}

// --- Page Assets (New Webbuilder System) ---

export interface Binding {
  kind: 'self' | 'related' | 'view';
  target?: string;
  cardinality?: 'one' | 'many';
  relationKey?: string;
  scope?: {
    filter?: Record<string, unknown>;
    sort?: string;
    limit?: number;
  };
}

export interface BindingSignature {
  kind: 'self' | 'related';
  target?: string;
  cardinality?: 'one' | 'many';
}

export interface SectionInstance {
  schemaVersion?: number;
  id: string;
  binding: Binding;
  presentationKey: string;
  placement: { slot: 'start' | 'end' | 'free'; order?: number };
  overrides?: Record<string, unknown>;
}

export interface AssetAttribution {
  channel: 'website' | 'social' | 'display' | 'search' | 'email' | 'call' | 'event';
  medium: 'page' | 'article' | 'video' | 'post' | 'document' | 'dynamic_ad' | 'message';
  source: string;
  referralType: 'organic' | 'paid';
  version: string;
}

export interface PageConfig {
  schemaVersion: number;
  pageContext: { kind: 'detail' | 'index' };
  pageSubject: { target: string; cardinality: 'one' | 'many' };
  templateKey?: string;
}

export interface PageAssetData {
  fieldGroups: FieldGroup[];
  attribution: AssetAttribution;
  pageConfig: PageConfig;
  sections: SectionInstance[];
}

export interface PageAsset {
  id: string;
  slug: string;
  name: string;
  type: 'page';
  account_id: string;
  data: PageAssetData;
  created_at: string;
  updated_at: string;
  // When fetched with resolve=true
  compiledSections?: CompiledSection[];
}

export interface CompiledSection {
  id: string;
  placement: { slot: string; order?: number };
  binding: Binding;
  presentationKey?: string;
  config: Record<string, unknown>;
  resolvedData: Array<{
    id: string;
    slug: string;
    name: string;
    type: string;
    data?: Record<string, unknown>;
  }>;
}

export interface CreatePageInput {
  template_key?: string;
  name: string;
  slug: string;
  subject_type?: string;
  subject_id?: string;
  account_id?: string;
  source?: string;
  version?: string;
}

export interface AddSectionInput {
  binding: Binding;
  preset_key: string;
  placement?: { slot: 'start' | 'end' | 'free'; order?: number };
  overrides?: Record<string, unknown>;
}

// --- Presentation Presets ---

export interface PresentationPreset {
  key: string;
  name: string;
  signature: BindingSignature;
  config: Record<string, unknown>;
  version?: number;
  account_id?: string;
}

export interface PresetFilter {
  signature_kind?: 'self' | 'related';
  target?: string;
  cardinality?: 'one' | 'many';
  account_id?: string;
}

// --- Domains ---

export type DomainType = 'www' | 'blog' | 'docs' | 'app' | 'custom';

export interface Domain {
  id: string;
  brand_id: string;
  hostname: string;
  type: DomainType;
  is_primary: boolean;
  config: Record<string, unknown>;
  entity_types: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DomainInput {
  brand_id: string;
  hostname: string;
  type?: DomainType;
  is_primary?: boolean;
  config?: Record<string, unknown>;
  entity_types?: string[];
}

// --- CSV Import ---

export interface CsvImportMappings {
  dimension: string;
  slugColumn: string;
  labelColumn: string;
  parentDimension?: string;
  parentColumn?: string;
  metadataColumns?: string[];
}

export interface CsvImportResult {
  created: number;
  skipped: number;
  parents: number;
  total: number;
}

// --- AI Module Types ---

export interface AICredential {
  id: string;
  provider: 'openai' | 'anthropic' | 'google';
  keyHint: string | null;
  name: string | null;
  isDefault: boolean;
  tokenBudgetDaily: number | null;
  costBudgetDaily: number | null;
  usageTokensToday: number;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface AICredentialInput {
  provider: 'openai' | 'anthropic' | 'google';
  apiKey: string;
  name?: string;
  isDefault?: boolean;
  tokenBudgetDaily?: number;
  costBudgetDaily?: number;
}

export interface AIProvider {
  name: string;
  displayName: string;
  models: Array<{
    id: string;
    name: string;
    inputPrice: number;
    outputPrice: number;
  }>;
}

export interface AIActivity {
  id: string;
  name: string;
  status: string;
  queuedAt?: string;
  startedAt?: string;
  iterations?: number;
}

export interface AIExecutionResult {
  success: boolean;
  iterations: number;
  tokenUsage: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  costEstimate?: number;
  error?: string;
  won?: boolean;
  qualifierResult?: {
    allPassed: boolean;
    results: Array<{
      qualifier: string;
      passed: boolean;
      value: unknown;
      expectedValue: unknown;
      operator: string;
    }>;
    evaluatedAt: string;
  };
}

export interface AISchedulerResult {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  won: number;
  details: Array<{
    activityId: string;
    activityName: string;
    executionSuccess: boolean;
    won: boolean;
    executionError?: string;
  }>;
}

export interface AISchedulerStatus {
  running: boolean;
  accountId: string | null;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    result?: unknown;
    success?: boolean;
  }>;
}

export interface AIChatHistory {
  activityId: string;
  messages: AIChatMessage[];
  isActive: boolean;
  contextRecordId?: string;
}

export interface AIChatResponse {
  success: boolean;
  content: string;
  tokenUsage: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  costEstimate?: number;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    result?: unknown;
    success?: boolean;
  }>;
  error?: string;
}

export interface AIAgentTemplate {
  slug: string;
  name: string;
  description: string;
  icon: string;
  provider: 'anthropic' | 'openai' | 'google';
  model: string;
  systemPrompt: string;
  allowedTools: string[];
  maxIterations: number;
  tokenBudget: number;
  suggestedRole: string;
  suggestedDepartment: string;
  tags: string[];
}

export interface AIAgentTemplateInstantiateInput {
  name?: string;
  credentialId: string;
}

export interface AIApprovalSummary {
  id: string;
  name: string;
  originalActivityId: string;
  originalActivityName: string;
  triggeredRules: string[];
  confidence: number;
  createdAt: string;
}

export interface AIApprovalDetail {
  id: string;
  name: string;
  status: string;
  originalActivityId: string;
  triggeredRules: string[];
  proposedChanges: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
    confidence: number;
  }>;
  toolCalls: Array<{
    name: string;
    success: boolean;
    error?: string;
  }>;
  confidence: number;
  agentId: string;
  agentName: string;
  createdAt: string;
}

export interface AIUsageSummary {
  today: { tokens: number; cost: number; operations: number };
  week: { tokens: number; cost: number; operations: number };
  month: { tokens: number; cost: number; operations: number };
  byProvider: Record<string, { tokens: number; cost: number }>;
  byModel: Record<string, { tokens: number; cost: number }>;
}

export interface AIUsageHistory {
  date: string;
  tokens: number;
  cost: number;
  operations: number;
}

export interface AICredentialUsage {
  credentialId: string;
  credentialName: string | null;
  provider: string;
  tokensUsed: number;
  tokenLimit: number | null;
  percentUsed: number | null;
  costEstimate: number;
}

export interface AIAgentUsage {
  agentId: string;
  agentName: string;
  tokens: number;
  cost: number;
  operations: number;
}

export interface AIUsageLogEntry {
  id: string;
  accountId: string;
  credentialId: string;
  agentId: string | null;
  activityId: string | null;
  model: string;
  tokensPrompt: number;
  tokensCompletion: number;
  tokensTotal: number;
  costEstimate: number;
  operationType: string;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
}

class ApiClient {
  // Request without auth headers (for login/register endpoints)
  private async requestNoAuth<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json() as ApiError;
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const method = options.method || 'GET';

    // Build headers - token auth takes precedence over API key
    const token = localStorage.getItem('vi_auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      // JWT Auth mode
      headers['Authorization'] = `Bearer ${token}`;
      const accountId = localStorage.getItem('vi_active_account');
      if (accountId) {
        headers['x-account-id'] = accountId;
      }
    } else {
      // Legacy API Key bypass mode (for dev/scripts)
      const adminKey = import.meta.env.VITE_ADMIN_KEY;
      if (!adminKey) {
        console.warn('[API] VITE_ADMIN_KEY not configured - API requests may fail');
      }
      if (adminKey) {
        headers['X-API-Key'] = adminKey;
      }
      headers['x-user-id'] = '11111111-1111-1111-1111-111111111111';
      headers['x-account-id'] = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    }

    console.log(`[API] ${method} ${path}`);
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json() as ApiError;
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Entities (Mapped to Records backend)
  async listEntities(type?: string, accountId?: string): Promise<Entity[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (accountId) params.append('account_id', accountId);

    const response = await this.request<{ data: Entity[], pagination: any }>(`/records?${params.toString()}`);
    return response.data || [];
  }

  async getEntity(id: string): Promise<Entity> {
    return this.request<Entity>(`/records/${id}`);
  }

  async createEntity(input: EntityInput): Promise<Entity> {
    return this.request<Entity>('/records', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateEntity(id: string, input: Partial<EntityInput>): Promise<Entity> {
    return this.request<Entity>(`/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async deleteEntity(id: string): Promise<void> {
    return this.request<void>(`/records/${id}`, {
      method: 'DELETE',
    });
  }

  // Relationships
  async listRelationships(fromId?: string, toId?: string, type?: string): Promise<Relationship[]> {
    const params = new URLSearchParams();
    if (fromId) params.append('from_id', fromId);
    if (toId) params.append('to_id', toId);
    if (type) params.append('type', type);
    return this.request<Relationship[]>(`/relationships?${params.toString()}`);
  }

  async createRelationship(input: RelationshipInput): Promise<Relationship> {
    return this.request<Relationship>('/relationships', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async deleteRelationship(id: string): Promise<void> {
    return this.request<void>(`/relationships/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async health(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // --- Auth ---

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.requestNoAuth<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name?: string): Promise<LoginResponse> {
    return this.requestNoAuth<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async me(): Promise<MeResponse> {
    return this.request<MeResponse>('/auth/me');
  }

  // --- Templates ---

  async listTemplates(): Promise<PageTemplate[]> {
    return this.request<PageTemplate[]>('/templates');
  }

  async getTemplate(key: string): Promise<PageTemplate> {
    return this.request<PageTemplate>(`/templates/${key}`);
  }

  async createTemplate(template: Partial<PageTemplate>): Promise<PageTemplate> {
    return this.request<PageTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateTemplate(key: string, template: Partial<PageTemplate>): Promise<PageTemplate> {
    return this.request<PageTemplate>(`/templates/${key}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  async deleteTemplate(key: string): Promise<void> {
    return this.request<void>(`/templates/${key}`, { method: 'DELETE' });
  }

  // --- Derive ---

  async derivePage(entitySlug: string, segment?: string): Promise<DerivedPage> {
    const params = new URLSearchParams();
    if (segment) params.append('segment', segment);
    return this.request<DerivedPage>(`/derive/${entitySlug}?${params.toString()}`);
  }

  // --- Builds ---

  async listBuilds(status?: string): Promise<BuildEntry[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return this.request<BuildEntry[]>(`/builds?${params.toString()}`);
  }

  async getBuildSummary(): Promise<BuildSummary> {
    return this.request<BuildSummary>('/builds/summary');
  }

  async triggerBuild(entityId: string): Promise<BuildEntry> {
    return this.request<BuildEntry>(`/builds/${entityId}`, { method: 'POST' });
  }

  // --- Dimensions ---

  async listDimensionValues(dimension?: string): Promise<DimensionValue[]> {
    const params = new URLSearchParams();
    if (dimension) params.append('dimension', dimension);
    // Dimensions endpoint returns paginated response { data: [...], pagination: {...} }
    const response = await this.request<{ data: DimensionValue[], pagination: any }>(`/dimensions?${params.toString()}`);
    return response.data || [];
  }

  async getDimensionTypes(): Promise<DimensionType[]> {
    return this.request<DimensionType[]>('/dimensions/types');
  }

  async createDimValue(input: { dimension: string; slug: string; label: string; parent_id?: string; metadata?: Record<string, unknown> }): Promise<DimensionValue> {
    return this.request<DimensionValue>('/dimensions', { method: 'POST', body: JSON.stringify(input) });
  }

  async deleteDimensionValue(id: string): Promise<void> {
    return this.request<void>(`/dimensions/${id}`, { method: 'DELETE' });
  }

  async getEntitiesTargeting(dimension: string, slug: string, persona?: string): Promise<Array<{ entity_id: string; persona: string; name: string; type: string; slug: string }>> {
    const params = new URLSearchParams({ dimension, slug });
    if (persona) params.append('persona', persona);
    return this.request(`/dimensions/targeting?${params.toString()}`);
  }

  async importDimensionCsv(rows: Record<string, string>[], mappings: CsvImportMappings): Promise<CsvImportResult> {
    return this.request<CsvImportResult>('/dimensions/import', {
      method: 'POST',
      body: JSON.stringify({ rows, mappings }),
    });
  }

  // Phase 4: Filtered dimension values for cascading pick-lists
  async listFilteredDimensionValues(
    dimension: string,
    filter?: Record<string, string>
  ): Promise<FilteredDimensionResponse> {
    const params = new URLSearchParams();
    if (filter) {
      for (const [dim, val] of Object.entries(filter)) {
        if (val) params.append(`filter[${dim}]`, val);
      }
    }
    return this.request<FilteredDimensionResponse>(`/schema/dimensions/${dimension}/values?${params.toString()}`);
  }

  async listDimensionDependencies(
    sourceDimension?: string,
    targetDimension?: string
  ): Promise<DimensionDependency[]> {
    const params = new URLSearchParams();
    if (sourceDimension) params.append('source_dimension', sourceDimension);
    if (targetDimension) params.append('target_dimension', targetDimension);
    return this.request<DimensionDependency[]>(`/dimensions/dependencies?${params.toString()}`);
  }

  // --- Domains ---

  async listDomains(brandId?: string): Promise<Domain[]> {
    const params = new URLSearchParams();
    if (brandId) params.append('brand_id', brandId);
    return this.request<Domain[]>(`/domains?${params.toString()}`);
  }

  async getDomain(id: string): Promise<Domain> {
    return this.request<Domain>(`/domains/${id}`);
  }

  async resolveDomain(hostname: string): Promise<Domain> {
    return this.request<Domain>(`/domains/resolve/${encodeURIComponent(hostname)}`);
  }

  async createDomain(input: DomainInput): Promise<Domain> {
    return this.request<Domain>('/domains', { method: 'POST', body: JSON.stringify(input) });
  }

  async updateDomain(id: string, input: Partial<DomainInput>): Promise<Domain> {
    return this.request<Domain>(`/domains/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  }

  async deleteDomain(id: string): Promise<void> {
    return this.request<void>(`/domains/${id}`, { method: 'DELETE' });
  }

  // --- Users ---
  async inviteUser(email: string, role: string): Promise<any> {
    return this.request('/users/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role })
    });
  }

  // Reseed / System
  async reseedPreview(): Promise<{ ops: any[]; stats: any }> {
    return this.request<{ ops: any[]; stats: any }>('/reseed/preview', { method: 'POST' });
  }

  async reseedApply(ops: any[]): Promise<{ success: boolean; applied: number }> {
    return this.request<any>('/reseed/apply', { 
        method: 'POST', 
        body: JSON.stringify({ ops }) 
    });
  }
  // --- Commercial ---
  
  async addOpportunityItem(opportunityId: string, productId: string, quantity: number = 1): Promise<Entity> {
      return this.request<Entity>(`/commercial/opportunities/${opportunityId}/items`, {
          method: 'POST',
          body: JSON.stringify({ productId, quantity })
      });
  }

  async removeOpportunityItem(opportunityId: string, itemId: string): Promise<Entity> {
      return this.request<Entity>(`/commercial/opportunities/${opportunityId}/items/remove`, {
          method: 'POST',
          body: JSON.stringify({ itemId })
      });
  }

  async updateOpportunityItemQuantity(opportunityId: string, itemId: string, quantity: number): Promise<Entity> {
      return this.request<Entity>(`/commercial/opportunities/${opportunityId}/items/update`, {
          method: 'POST',
          body: JSON.stringify({ itemId, quantity })
      });
  }

  // --- Activities ---

  async startActivity(activityId: string): Promise<Entity> {
      return this.request<Entity>(`/activities/${activityId}/start`, { method: 'POST' });
  }

  async pauseActivity(activityId: string): Promise<Entity> {
      return this.request<Entity>(`/activities/${activityId}/pause`, { method: 'POST' });
  }

  async resumeActivity(activityId: string): Promise<Entity> {
      return this.request<Entity>(`/activities/${activityId}/resume`, { method: 'POST' });
  }

  async completeActivity(activityId: string): Promise<Entity> {
      return this.request<Entity>(`/activities/${activityId}/complete`, { method: 'POST' });
  }

  // --- Page Assets (New Webbuilder System) ---

  async listPages(accountId?: string, subjectType?: string): Promise<PageAsset[]> {
    const params = new URLSearchParams();
    if (accountId) params.append('account_id', accountId);
    if (subjectType) params.append('subject_type', subjectType);
    return this.request<PageAsset[]>(`/pages?${params.toString()}`);
  }

  async getPage(idOrSlug: string, resolve: boolean = true): Promise<PageAsset> {
    const params = new URLSearchParams();
    if (!resolve) params.append('resolve', 'false');
    return this.request<PageAsset>(`/pages/${idOrSlug}?${params.toString()}`);
  }

  async createPage(input: CreatePageInput): Promise<PageAsset> {
    return this.request<PageAsset>('/pages', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updatePage(id: string, updates: Partial<PageAsset>): Promise<PageAsset> {
    return this.request<PageAsset>(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePage(id: string): Promise<void> {
    return this.request<void>(`/pages/${id}`, { method: 'DELETE' });
  }

  async getPagePreview(id: string): Promise<{ page: PageAsset; compiled: CompiledSection[]; previewUrl: string }> {
    return this.request(`/pages/${id}/preview`);
  }

  async addPageSection(pageId: string, section: AddSectionInput): Promise<{ section: SectionInstance; page: PageAsset }> {
    return this.request(`/pages/${pageId}/sections`, {
      method: 'POST',
      body: JSON.stringify(section),
    });
  }

  async updatePageSection(pageId: string, sectionId: string, updates: Record<string, unknown>): Promise<{ section: SectionInstance; page: PageAsset }> {
    return this.request(`/pages/${pageId}/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePageSection(pageId: string, sectionId: string): Promise<void> {
    return this.request<void>(`/pages/${pageId}/sections/${sectionId}`, { method: 'DELETE' });
  }

  async linkPageToEntity(pageId: string, entityId: string, relationshipType?: string): Promise<{ relationship_type: string; from: string; to: string }> {
    return this.request(`/pages/${pageId}/link`, {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId, relationship_type: relationshipType }),
    });
  }

  async resolvePageBindings(pageId: string, accountId?: string): Promise<Array<{ sectionId: string; binding: Binding; resolved: { records: Array<{ id: string; slug: string; name: string; type: string }> } }>> {
    const params = new URLSearchParams();
    if (accountId) params.append('account_id', accountId);
    return this.request(`/pages/${pageId}/bindings?${params.toString()}`);
  }

  // --- Presentation Presets ---

  async listPresets(filter?: PresetFilter): Promise<PresentationPreset[]> {
    const params = new URLSearchParams();
    if (filter?.signature_kind) params.append('signature_kind', filter.signature_kind);
    if (filter?.target) params.append('target', filter.target);
    if (filter?.cardinality) params.append('cardinality', filter.cardinality);
    if (filter?.account_id) params.append('account_id', filter.account_id);
    return this.request<PresentationPreset[]>(`/presets?${params.toString()}`);
  }

  async getPreset(key: string): Promise<PresentationPreset> {
    return this.request<PresentationPreset>(`/presets/${key}`);
  }

  async listCompatiblePresets(bindingKind: 'self' | 'related', target?: string, cardinality?: 'one' | 'many'): Promise<PresentationPreset[]> {
    const params = new URLSearchParams({ binding_kind: bindingKind });
    if (target) params.append('target', target);
    if (cardinality) params.append('cardinality', cardinality);
    return this.request<PresentationPreset[]>(`/presets/compatible?${params.toString()}`);
  }

  async createPreset(preset: Omit<PresentationPreset, 'version'>): Promise<PresentationPreset> {
    return this.request<PresentationPreset>('/presets', {
      method: 'POST',
      body: JSON.stringify(preset),
    });
  }

  async updatePreset(key: string, updates: Partial<PresentationPreset>): Promise<PresentationPreset> {
    return this.request<PresentationPreset>(`/presets/${key}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePreset(key: string): Promise<void> {
    return this.request<void>(`/presets/${key}`, { method: 'DELETE' });
  }

  async clonePreset(key: string, newKey: string, accountId?: string): Promise<PresentationPreset> {
    return this.request<PresentationPreset>(`/presets/${key}/clone`, {
      method: 'POST',
      body: JSON.stringify({ new_key: newKey, account_id: accountId }),
    });
  }

  // ============================================================
  // AI MODULE
  // ============================================================

  // --- Credentials ---

  async listAICredentials(): Promise<AICredential[]> {
    return this.request<AICredential[]>('/ai/credentials');
  }

  async createAICredential(input: AICredentialInput): Promise<AICredential> {
    return this.request<AICredential>('/ai/credentials', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateAICredential(id: string, updates: Partial<AICredentialInput>): Promise<AICredential> {
    return this.request<AICredential>(`/ai/credentials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteAICredential(id: string): Promise<void> {
    return this.request<void>(`/ai/credentials/${id}`, { method: 'DELETE' });
  }

  async testAICredential(id: string): Promise<{ valid: boolean; error?: string }> {
    return this.request<{ valid: boolean; error?: string }>(`/ai/credentials/${id}/test`, {
      method: 'POST',
    });
  }

  // --- Providers ---

  async listAIProviders(): Promise<{ providers: AIProvider[] }> {
    return this.request<{ providers: AIProvider[] }>('/ai/providers');
  }

  // --- Activities ---

  async listPendingAIActivities(): Promise<{ activities: AIActivity[] }> {
    return this.request<{ activities: AIActivity[] }>('/ai/activities/pending');
  }

  async listRunningAIActivities(): Promise<{ activities: AIActivity[] }> {
    return this.request<{ activities: AIActivity[] }>('/ai/activities/running');
  }

  async getAIActivityStatus(id: string): Promise<{ status: string; execution?: Record<string, unknown> }> {
    return this.request<{ status: string; execution?: Record<string, unknown> }>(`/ai/activities/${id}/status`);
  }

  async queueAIActivity(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/ai/activities/${id}/queue`, {
      method: 'POST',
    });
  }

  async executeAIActivity(id: string): Promise<AIExecutionResult> {
    return this.request<AIExecutionResult>(`/ai/activities/${id}/execute`, {
      method: 'POST',
    });
  }

  async evaluateAIActivityQualifiers(id: string): Promise<{
    activityId: string;
    allPassed: boolean;
    won: boolean;
    results: Array<{ qualifier: string; passed: boolean; value: unknown }>;
    evaluatedAt: string;
  }> {
    return this.request(`/ai/activities/${id}/evaluate`, {
      method: 'POST',
    });
  }

  // --- Scheduler ---

  async runAIScheduler(): Promise<AISchedulerResult> {
    return this.request<AISchedulerResult>('/ai/scheduler/run', {
      method: 'POST',
    });
  }

  async startAIScheduler(intervalMs?: number): Promise<{ success: boolean; running: boolean; accountId: string; intervalMs: number }> {
    return this.request('/ai/scheduler/start', {
      method: 'POST',
      body: JSON.stringify({ intervalMs }),
    });
  }

  async stopAIScheduler(): Promise<{ success: boolean; running: boolean }> {
    return this.request('/ai/scheduler/stop', {
      method: 'POST',
    });
  }

  async getAISchedulerStatus(): Promise<AISchedulerStatus> {
    return this.request<AISchedulerStatus>('/ai/scheduler/status');
  }

  // --- Chat ---

  async sendAIChatMessage(activityId: string, message: string): Promise<AIChatResponse> {
    return this.request<AIChatResponse>(`/ai/chat/${activityId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getAIChatHistory(activityId: string): Promise<AIChatHistory> {
    return this.request<AIChatHistory>(`/ai/chat/${activityId}/history`);
  }

  async clearAIChatHistory(activityId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/ai/chat/${activityId}/clear`, {
      method: 'POST',
    });
  }

  async closeAIChatSession(activityId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/ai/chat/${activityId}/close`, {
      method: 'POST',
    });
  }

  /**
   * Stream AI chat response via SSE.
   * Returns an EventSource that emits events: 'content', 'tool_call', 'tool_result', 'done', 'error'
   */
  createAIChatStream(activityId: string, message: string): EventSource {
    const token = localStorage.getItem('vi_auth_token');
    const accountId = localStorage.getItem('vi_active_account');
    const encodedMessage = encodeURIComponent(message);

    // Note: EventSource doesn't support custom headers, so we pass auth via query params
    // This is less secure but necessary for SSE. Production should use cookies instead.
    const url = `${API_BASE}/ai/chat/${activityId}/stream?message=${encodedMessage}&token=${token}&account=${accountId}`;

    return new EventSource(url);
  }

  // --- Agent Templates ---

  async listAgentTemplates(tag?: string, department?: string): Promise<{ templates: AIAgentTemplate[] }> {
    const params = new URLSearchParams();
    if (tag) params.append('tag', tag);
    if (department) params.append('department', department);
    return this.request<{ templates: AIAgentTemplate[] }>(`/ai/templates?${params.toString()}`);
  }

  async getAgentTemplate(slug: string): Promise<AIAgentTemplate> {
    return this.request<AIAgentTemplate>(`/ai/templates/${slug}`);
  }

  async instantiateAgentTemplate(
    slug: string,
    input: AIAgentTemplateInstantiateInput
  ): Promise<{ agent: Entity; template: AIAgentTemplate }> {
    return this.request<{ agent: Entity; template: AIAgentTemplate }>(`/ai/templates/${slug}/instantiate`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // --- Approvals ---

  async listPendingApprovals(): Promise<{ approvals: AIApprovalSummary[] }> {
    return this.request<{ approvals: AIApprovalSummary[] }>('/ai/approvals/pending');
  }

  async getApproval(id: string): Promise<AIApprovalDetail> {
    return this.request<AIApprovalDetail>(`/ai/approvals/${id}`);
  }

  async handleApprovalDecision(
    id: string,
    decision: 'approved' | 'rejected',
    comment?: string
  ): Promise<{ success: boolean; decision: string; approvalActivityId: string }> {
    return this.request(`/ai/approvals/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, comment }),
    });
  }

  // --- Usage Dashboard ---

  async getAIUsageSummary(): Promise<AIUsageSummary> {
    return this.request<AIUsageSummary>('/ai/usage/summary');
  }

  async getAIUsageHistory(days: number = 30): Promise<{ history: AIUsageHistory[] }> {
    return this.request<{ history: AIUsageHistory[] }>(`/ai/usage/history?days=${days}`);
  }

  async getAICredentialUsage(): Promise<{ credentials: AICredentialUsage[] }> {
    return this.request<{ credentials: AICredentialUsage[] }>('/ai/usage/credentials');
  }

  async getAIAgentUsage(days: number = 30): Promise<{ agents: AIAgentUsage[] }> {
    return this.request<{ agents: AIAgentUsage[] }>(`/ai/usage/agents?days=${days}`);
  }

  async getAIRecentUsage(limit: number = 50): Promise<{ entries: AIUsageLogEntry[] }> {
    return this.request<{ entries: AIUsageLogEntry[] }>(`/ai/usage/recent?limit=${limit}`);
  }

  // --- Config Workspaces ---

  async listWorkspaces(filters?: { status?: WorkspaceStatus; account_id?: string }): Promise<ConfigWorkspace[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.account_id) params.append('account_id', filters.account_id);
    const response = await this.request<{ data: ConfigWorkspace[] }>(`/workspaces?${params.toString()}`);
    return response.data || [];
  }

  async getWorkspace(id: string): Promise<WorkspaceWithChanges> {
    const response = await this.request<{ data: WorkspaceWithChanges }>(`/workspaces/${id}`);
    return response.data;
  }

  async createWorkspace(input: { account_id: string; name: string; description?: string }): Promise<ConfigWorkspace> {
    const response = await this.request<{ data: ConfigWorkspace }>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.data;
  }

  async deleteWorkspace(id: string): Promise<void> {
    return this.request<void>(`/workspaces/${id}`, { method: 'DELETE' });
  }

  async submitWorkspaceForReview(id: string): Promise<ConfigWorkspace> {
    const response = await this.request<{ data: ConfigWorkspace }>(`/workspaces/${id}/submit`, {
      method: 'POST',
    });
    return response.data;
  }

  async approveWorkspace(id: string): Promise<ConfigWorkspace> {
    const response = await this.request<{ data: ConfigWorkspace }>(`/workspaces/${id}/approve`, {
      method: 'POST',
    });
    return response.data;
  }

  async rejectWorkspace(id: string): Promise<ConfigWorkspace> {
    const response = await this.request<{ data: ConfigWorkspace }>(`/workspaces/${id}/reject`, {
      method: 'POST',
    });
    return response.data;
  }

  async previewWorkspace(id: string): Promise<WorkspacePreview> {
    const response = await this.request<{ data: WorkspacePreview }>(`/workspaces/${id}/preview`, {
      method: 'POST',
    });
    return response.data;
  }

  async applyWorkspace(id: string): Promise<{ workspace: ConfigWorkspace; appliedChanges: number; versionsCreated: number }> {
    const response = await this.request<{ data: { workspace: ConfigWorkspace; appliedChanges: number; versionsCreated: number } }>(`/workspaces/${id}/apply`, {
      method: 'POST',
    });
    return response.data;
  }

  async rollbackWorkspace(id: string): Promise<{ workspace: ConfigWorkspace; rolledBackChanges: number }> {
    const response = await this.request<{ data: { workspace: ConfigWorkspace; rolledBackChanges: number } }>(`/workspaces/${id}/rollback`, {
      method: 'POST',
    });
    return response.data;
  }

  // --- Workspace Changes ---

  async addWorkspaceChange(
    workspaceId: string,
    change: { config_type: ConfigTypeSlug; operation: 'create' | 'update' | 'delete'; target_id?: string; target_slug?: string; payload: Record<string, unknown> }
  ): Promise<ConfigChange> {
    const response = await this.request<{ data: ConfigChange }>(`/workspaces/${workspaceId}/changes`, {
      method: 'POST',
      body: JSON.stringify(change),
    });
    return response.data;
  }

  async listWorkspaceChanges(workspaceId: string): Promise<ConfigChange[]> {
    const response = await this.request<{ data: ConfigChange[] }>(`/workspaces/${workspaceId}/changes`);
    return response.data || [];
  }

  async removeWorkspaceChange(workspaceId: string, changeId: string): Promise<void> {
    return this.request<void>(`/workspaces/${workspaceId}/changes/${changeId}`, { method: 'DELETE' });
  }

  // --- Config Types & Validation ---

  async listConfigTypes(): Promise<ConfigTypeInfo[]> {
    const response = await this.request<{ data: ConfigTypeInfo[] }>('/workspaces/config-types');
    return response.data || [];
  }

  async validateConfig(config_type: ConfigTypeSlug, data: Record<string, unknown>): Promise<{ valid: boolean; errors: Array<{ path: string; message: string }> }> {
    const response = await this.request<{ data: { valid: boolean; errors: Array<{ path: string; message: string }> } }>('/workspaces/validate', {
      method: 'POST',
      body: JSON.stringify({ config_type, data }),
    });
    return response.data;
  }

  async listInterpreterExecutors(accountId?: string): Promise<InterpreterExecutorInfo[]> {
    const params = new URLSearchParams();
    if (accountId) params.append('account_id', accountId);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    const response = await this.request<{ data: InterpreterExecutorInfo[] }>(`/interpreter-executors${suffix}`);
    return response.data || [];
  }

  async validateInterpreterStage(input: InterpreterStageValidationInput): Promise<InterpreterStageValidationResult> {
    const response = await this.request<{ data: InterpreterStageValidationResult }>('/interpreter-executors/validate-stage', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.data;
  }

  // --- Config Version History ---

  async getConfigVersions(configType: string, configId: string, limit: number = 10): Promise<ConfigVersion[]> {
    const response = await this.request<{ data: ConfigVersion[] }>(`/workspaces/versions/${configType}/${configId}?limit=${limit}`);
    return response.data || [];
  }

  async restoreConfigVersion(configType: string, configId: string, version: number): Promise<{ restoredTo: number; newVersion: number }> {
    const response = await this.request<{ data: { restoredTo: number; newVersion: number } }>(`/workspaces/versions/${configType}/${configId}/restore`, {
      method: 'POST',
      body: JSON.stringify({ version }),
    });
    return response.data;
  }

  // --- State Machines ---

  async getStateMachine(entityType: string): Promise<{
    targetEntityType: string;
    stateField: string;
    states: string[];
    transitions: Array<{ from: string; to: string; action?: string; conditions?: Array<{ field: string; op: string; value: unknown }> }>;
    initialState: string;
  } | null> {
    try {
      const response = await this.request<{ data: {
        targetEntityType: string;
        stateField: string;
        states: string[];
        transitions: Array<{ from: string; to: string; action?: string; conditions?: Array<{ field: string; op: string; value: unknown }> }>;
        initialState: string;
      } }>(`/state-machines/${entityType}`);
      return response.data;
    } catch {
      return null;
    }
  }

  async getStateMachineTransitions(entityType: string, currentState: string): Promise<Array<{ to: string; action?: string }>> {
    try {
      const response = await this.request<{ data: { transitions: Array<{ to: string; action?: string }> } }>(`/state-machines/${entityType}/transitions?state=${currentState}`);
      return response.data.transitions || [];
    } catch {
      return [];
    }
  }

  // --- Workflows ---

  async getWorkflow(workflowSlug: string): Promise<{
    workflow: {
      id: string;
      slug: string;
      name: string;
      summary: string;
      triggerType: string;
      triggerEvent?: string;
      isActive: boolean;
      firstStepSlug?: string;
    };
    steps: Array<{
      id: string;
      slug: string;
      name: string;
      sequence: number;
      stepType: string;
      nextStepSlug?: string;
      branchStepSlug?: string;
      data: Record<string, unknown>;
    }>;
  } | null> {
    try {
      const response = await this.request<{ data: {
        workflow: {
          id: string;
          slug: string;
          name: string;
          summary: string;
          triggerType: string;
          triggerEvent?: string;
          isActive: boolean;
          firstStepSlug?: string;
        };
        steps: Array<{
          id: string;
          slug: string;
          name: string;
          sequence: number;
          stepType: string;
          nextStepSlug?: string;
          branchStepSlug?: string;
          data: Record<string, unknown>;
        }>;
      } }>(`/workflows/${workflowSlug}`);
      return response.data;
    } catch {
      return null;
    }
  }
}

export const api = new ApiClient();
