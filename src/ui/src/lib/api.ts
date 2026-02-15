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
}

export interface FieldGroup {
  name: string;
  fields: Field[];
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
      headers['X-API-Key'] = import.meta.env.VITE_ADMIN_KEY || 'secret';
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
    
    return this.request<Entity[]>(`/records?${params.toString()}`);
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
    return this.request<DimensionValue[]>(`/dimensions?${params.toString()}`);
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
}

export const api = new ApiClient();
