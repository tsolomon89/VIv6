# DATABASE SCHEMA

> **Purpose**: Concrete SQL schema for Oblio. Implements the EAV pattern with stable columns + flexible JSON data.

---

## Design Principles

1. **Stable columns** for identity and filtering (`id`, `slug`, `type`, `account_id`)
2. **JSON `data` column** for flexible attributes (no migrations for new fields)
3. **Application-layer validation** via FieldDefinitions (not DB constraints)
4. **Global slug uniqueness** where specified
5. **Soft deletes** via `deleted_at` (audit trail)

---

## Core Tables

### accounts

The fundamental tenancy unit. Businesses, households, teams—all Accounts.

```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,              -- Globally unique
  name TEXT NOT NULL,
  
  -- Classification
  account_class TEXT NOT NULL DEFAULT 'business',  -- 'business' | 'household'
  account_type TEXT DEFAULT 'client',              -- 'admin' | 'client' | 'vendor' | 'partner'
  
  -- Hierarchy
  parent_id TEXT REFERENCES accounts(id),
  managed_by_account_id TEXT REFERENCES accounts(id),
  
  -- State
  is_oblio_user BOOLEAN DEFAULT FALSE,    -- Has logins, self-managing
  
  -- Flexible data
  data JSON DEFAULT '{}',
  /*
    data: {
      firmographics: {
        industry: string,
        sector: string,
        headcount: number,
        revenue: number,
        location: { ... }
      },
      settings: {
        labels: { products: 'Services', features: 'Capabilities', ... },
        primaryCTA: { type: 'FormSubmit', label: 'Book a call' },
        domain: 'hiretimothysolomon.com'
      },
      branding: {
        colors: { ... },
        logo: string
      }
    }
  */
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE INDEX idx_accounts_parent ON accounts(parent_id);
CREATE INDEX idx_accounts_managed_by ON accounts(managed_by_account_id);
CREATE INDEX idx_accounts_class ON accounts(account_class);
CREATE INDEX idx_accounts_type ON accounts(account_type);
```

### contacts

A single human identity.

```sql
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  
  -- Identity
  primary_email_id TEXT,                  -- Resolved after email creation
  
  -- Flexible data
  data JSON DEFAULT '{}',
  /*
    data: {
      name: string,
      phone: string,
      preferences: { ... },
      social: { linkedin: string, twitter: string }
    }
  */
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  deleted_at TEXT
);
```

### emails

Identity resolution layer.

```sql
CREATE TABLE emails (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL UNIQUE,           -- Globally unique
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  is_verified BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  
  source TEXT DEFAULT 'manual',           -- 'form', 'import', 'oauth', 'manual'
  
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_emails_contact ON emails(contact_id);
CREATE INDEX idx_emails_address ON emails(address);
```

### account_memberships

The edge connecting Contacts to Accounts. Carries role and context.

```sql
CREATE TABLE account_memberships (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  -- Role & Permissions
  role TEXT NOT NULL DEFAULT 'member',    -- 'owner', 'admin', 'employee', 'customer', etc.
  permission_level TEXT DEFAULT 'junior', -- 'admin' | 'leader' | 'senior' | 'junior'
  role_overrides JSON DEFAULT '{}',       -- Granular permission toggles
  
  -- Context
  persona_type TEXT,                      -- 'DM' | 'EU' | 'IN'
  
  -- State
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TEXT DEFAULT (datetime('now')),
  left_at TEXT,
  
  UNIQUE(contact_id, account_id)
);

CREATE INDEX idx_memberships_contact ON account_memberships(contact_id);
CREATE INDEX idx_memberships_account ON account_memberships(account_id);
```

### account_links

Account-to-Account relationships (vendor, partner, customer, etc.)

```sql
CREATE TABLE account_links (
  id TEXT PRIMARY KEY,
  parent_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  child_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  relationship_type TEXT NOT NULL,        -- 'vendor' | 'customer' | 'partner' | 'reseller' | 'franchise' | 'subsidiary'
  
  -- Optional opportunity context
  opportunity_id TEXT REFERENCES opportunities(id),
  
  data JSON DEFAULT '{}',
  
  created_at TEXT DEFAULT (datetime('now')),
  
  UNIQUE(parent_account_id, child_account_id, relationship_type)
);

CREATE INDEX idx_account_links_parent ON account_links(parent_account_id);
CREATE INDEX idx_account_links_child ON account_links(child_account_id);
```

---

## Catalog Tables

### entities

Generic catalog node. Products, Features, Solutions, UseCases, Assets.

```sql
CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  -- Identity
  slug TEXT NOT NULL,                     -- Unique within account
  type TEXT NOT NULL,                     -- 'product' | 'feature' | 'solution' | 'useCase' | 'asset'
  
  -- Display
  name TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  
  -- Flexible data
  data JSON DEFAULT '{}',
  /*
    For type='product':
    data: {
      product_type: 'B2B' | 'B2C' | 'Partnership' | 'Reseller' | 'HR' | 'Supplier',
      pricing: { value: 299, currency: 'GBP', frequency: 'Monthly' },
      personas: {
        DM: { companySize: ['smb', 'mid'], department: ['marketing'] },
        EU: { ... },
        IN: { ... }
      }
    }
    
    For type='feature':
    data: { ... }
    
    For type='asset':
    data: {
      asset_type: 'page' | 'article' | 'post' | 'ad' | 'email',
      url: string,
      content: string
    }
  */
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  deleted_at TEXT,
  
  UNIQUE(account_id, slug)
);

CREATE INDEX idx_entities_account ON entities(account_id);
CREATE INDEX idx_entities_type ON entities(type);
CREATE INDEX idx_entities_slug ON entities(slug);
```

### entity_relationships

Edges in the catalog graph.

```sql
CREATE TABLE entity_relationships (
  id TEXT PRIMARY KEY,
  from_entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  to_entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  
  relationship_type TEXT NOT NULL,        -- 'has_feature' | 'delivers' | 'applies_to' | 'targets' | 'requires'
  
  data JSON DEFAULT '{}',                 -- Edge-specific data
  
  created_at TEXT DEFAULT (datetime('now')),
  
  UNIQUE(from_entity_id, to_entity_id, relationship_type)
);

CREATE INDEX idx_entity_rels_from ON entity_relationships(from_entity_id);
CREATE INDEX idx_entity_rels_to ON entity_relationships(to_entity_id);
CREATE INDEX idx_entity_rels_type ON entity_relationships(relationship_type);
```

---

## Dimension Tables

### dimension_values

Controlled vocabulary for targeting. Oblio OS owns global values; accounts can extend.

```sql
CREATE TABLE dimension_values (
  id TEXT PRIMARY KEY,
  
  dimension TEXT NOT NULL,                -- 'companySize' | 'sector' | 'department' | 'seniority' | 'ageRange' | 'interest'
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  
  -- Hierarchy
  parent_id TEXT REFERENCES dimension_values(id),
  
  -- Ownership
  account_id TEXT REFERENCES accounts(id), -- NULL = Oblio OS (global)
  
  -- Metadata
  data JSON DEFAULT '{}',
  /*
    data: {
      headcountRange: [11, 50],           -- For companySize
      linkedinLabel: 'Small business',
      googleLabel: 'SMB',
      order: 3                            -- Display order
    }
  */
  
  source TEXT DEFAULT 'manual',           -- 'manual' | 'csv_import' | 'api_sync'
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  UNIQUE(dimension, slug, account_id)
);

CREATE INDEX idx_dimension_values_dimension ON dimension_values(dimension);
CREATE INDEX idx_dimension_values_parent ON dimension_values(parent_id);
CREATE INDEX idx_dimension_values_account ON dimension_values(account_id);
```

---

## Pipeline Tables

### opportunities

A potential transaction between Accounts.

```sql
CREATE TABLE opportunities (
  id TEXT PRIMARY KEY,
  
  -- Parties
  owner_account_id TEXT NOT NULL REFERENCES accounts(id),   -- Who owns this opp
  target_account_id TEXT NOT NULL REFERENCES accounts(id),  -- The other party
  primary_contact_id TEXT REFERENCES contacts(id),
  
  -- Classification
  opp_type TEXT NOT NULL,                 -- 'B2B' | 'B2C' | 'Supplier' | 'Partnership' | 'Reseller' | 'HR'
  
  -- Stage
  stage TEXT NOT NULL DEFAULT 'MQL',      -- 'MQL' | 'SQL' | 'FTP' | 'RTP'
  
  -- What's being transacted
  product_ids JSON DEFAULT '[]',          -- Array of entity IDs
  
  -- Value
  value REAL,
  currency TEXT DEFAULT 'GBP',
  
  -- State
  status TEXT DEFAULT 'open',             -- 'open' | 'won' | 'lost' | 'churned'
  
  -- Flexible data
  data JSON DEFAULT '{}',
  /*
    data: {
      matchScore: 0.85,
      personaType: 'DM',
      attribution: {
        url: '/products/attribution-engine/healthcare',
        referrer: 'google.com',
        utm: { ... }
      },
      notes: string,
      customFields: { ... }
    }
  */
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  closed_at TEXT
);

CREATE INDEX idx_opportunities_owner ON opportunities(owner_account_id);
CREATE INDEX idx_opportunities_target ON opportunities(target_account_id);
CREATE INDEX idx_opportunities_contact ON opportunities(primary_contact_id);
CREATE INDEX idx_opportunities_type ON opportunities(opp_type);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_status ON opportunities(status);
```

### activities

Any event in the system.

```sql
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  
  -- Who
  contact_id TEXT REFERENCES contacts(id),  -- May be NULL (anonymous)
  account_id TEXT NOT NULL REFERENCES accounts(id),
  
  -- What
  activity_type TEXT NOT NULL,            -- 'page_view' | 'form_submit' | 'email_open' | 'purchase' | 'login' | etc.
  
  -- Context
  asset_id TEXT REFERENCES entities(id),
  opportunity_id TEXT REFERENCES opportunities(id),
  
  -- When
  occurred_at TEXT DEFAULT (datetime('now')),
  
  -- Flexible data
  data JSON DEFAULT '{}',
  /*
    data: {
      url: string,
      referrer: string,
      ip: string,
      userAgent: string,
      utm: { ... },
      formData: { ... },
      duration: number
    }
  */
  
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_account ON activities(account_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_occurred ON activities(occurred_at);
CREATE INDEX idx_activities_opportunity ON activities(opportunity_id);
```

---

## Auth Tables

### sessions

User authentication sessions.

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  operating_account_id TEXT NOT NULL REFERENCES accounts(id),
  
  token TEXT NOT NULL UNIQUE,
  
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  
  data JSON DEFAULT '{}'                  -- Device info, etc.
);

CREATE INDEX idx_sessions_contact ON sessions(contact_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

### auth_credentials

Password storage (separated from contacts for security).

```sql
CREATE TABLE auth_credentials (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL UNIQUE REFERENCES contacts(id) ON DELETE CASCADE,
  
  password_hash TEXT NOT NULL,
  
  -- Recovery
  reset_token TEXT,
  reset_expires TEXT,
  
  -- MFA (future)
  mfa_secret TEXT,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

---

## Build Tables

### build_state

Tracks build status per entity for VIv5.

```sql
CREATE TABLE build_state (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'pending',          -- 'pending' | 'building' | 'success' | 'error'
  
  content_hash TEXT,                      -- For idempotency
  
  last_built_at TEXT,
  error_message TEXT,
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  UNIQUE(entity_id)
);

CREATE INDEX idx_build_state_account ON build_state(account_id);
CREATE INDEX idx_build_state_status ON build_state(status);
```

---

## Template Tables

### templates

Section and page templates for VIv5.

```sql
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  
  -- Identity
  key TEXT NOT NULL UNIQUE,               -- 'related.feature.many.grid.v1'
  name TEXT NOT NULL,                     -- 'Feature Grid'
  
  -- Binding
  binding_kind TEXT NOT NULL,             -- 'self' | 'related'
  binding_target TEXT,                    -- 'feature' | 'solution' | etc. (NULL for self)
  binding_cardinality TEXT,               -- 'one' | 'many' (NULL for self)
  binding_signature TEXT NOT NULL,        -- 'related.feature.many' (computed)
  
  -- Type
  template_type TEXT DEFAULT 'section',   -- 'section' | 'page'
  
  -- Configuration
  constraints JSON DEFAULT '{}',          -- Character limits, etc.
  default_config JSON DEFAULT '{}',       -- Visual defaults
  
  -- Ownership
  account_id TEXT REFERENCES accounts(id), -- NULL = global template
  
  is_default BOOLEAN DEFAULT FALSE,       -- Default for this binding signature
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_templates_binding ON templates(binding_signature);
CREATE INDEX idx_templates_account ON templates(account_id);
```

---

## Field Definitions (Application Config)

Not a database table—stored in JSON config files. Drives dynamic form rendering.

```json
// field_definitions.json
{
  "entity.product": [
    {
      "key": "data.product_type",
      "type": "select",
      "label": "Product Type",
      "required": true,
      "options": ["B2B", "B2C", "Partnership", "Reseller", "HR", "Supplier"]
    },
    {
      "key": "data.pricing.value",
      "type": "number",
      "label": "Price",
      "constraints": { "min": 0 }
    },
    {
      "key": "data.pricing.currency",
      "type": "select",
      "label": "Currency",
      "options": ["GBP", "USD", "EUR"]
    },
    {
      "key": "data.pricing.frequency",
      "type": "select",
      "label": "Billing Frequency",
      "options": ["None", "Monthly", "Annually", "PerUnit"]
    },
    {
      "key": "data.personas.DM",
      "type": "targeting",
      "label": "Decision Maker Targeting",
      "component": "PersonaTargetingEditor"
    }
  ],
  
  "entity.feature": [
    {
      "key": "summary",
      "type": "text",
      "label": "Summary",
      "constraints": { "maxLength": 200 }
    }
  ],
  
  "account": [
    {
      "key": "data.settings.domain",
      "type": "text",
      "label": "Domain"
    },
    {
      "key": "data.settings.labels.products",
      "type": "text",
      "label": "Products Label",
      "placeholder": "Products"
    }
  ]
}
```

---

## Migration Strategy

### Initial Setup

```sql
-- Run once to create all tables
-- migrations/001_initial.sql contains all CREATE TABLE statements above
```

### Adding Fields

**Don't migrate.** Add to the JSON `data` column:

```typescript
// Before: entity.data = { pricing: { value: 299 } }
// After:  entity.data = { pricing: { value: 299 }, newField: 'value' }

// Update field_definitions.json to show in UI
```

### Adding Columns (Rare)

Only for new queryable/filterable fields:

```sql
-- migrations/002_add_column.sql
ALTER TABLE entities ADD COLUMN new_column TEXT;
CREATE INDEX idx_entities_new_column ON entities(new_column);
```

---

## Seed Data

### Oblio OS Bootstrap

```sql
-- Insert Oblio OS as root account
INSERT INTO accounts (id, slug, name, account_class, account_type, is_oblio_user, data)
VALUES (
  'account_oblio_os',
  'oblio-os',
  'Oblio OS',
  'business',
  'admin',
  TRUE,
  '{"settings": {"isRoot": true}}'
);

-- Insert dimension values (global)
INSERT INTO dimension_values (id, dimension, slug, label, data) VALUES
  ('dv_size_proprietor', 'companySize', 'proprietor', 'Proprietor (1)', '{"headcountRange": [1, 1]}'),
  ('dv_size_micro', 'companySize', 'micro', 'Micro (2-10)', '{"headcountRange": [2, 10]}'),
  ('dv_size_smb', 'companySize', 'smb', 'SMB (11-50)', '{"headcountRange": [11, 50]}'),
  ('dv_size_mid', 'companySize', 'mid', 'Mid (51-200)', '{"headcountRange": [51, 200]}'),
  ('dv_size_large', 'companySize', 'large', 'Large (201-1000)', '{"headcountRange": [201, 1000]}'),
  ('dv_size_enterprise', 'companySize', 'enterprise', 'Enterprise (1000+)', '{"headcountRange": [1001, null]}');

-- Insert default templates
INSERT INTO templates (id, key, name, binding_kind, binding_signature, default_config) VALUES
  ('tmpl_self_hero', 'self.hero.v1', 'Hero', 'self', 'self', '{}'),
  ('tmpl_self_cta', 'self.cta.v1', 'Call to Action', 'self', 'self', '{}'),
  ('tmpl_feature_many_grid', 'related.feature.many.grid.v1', 'Feature Grid', 'related', 'related.feature.many', '{}');
```

---

*This schema supports the full Oblio model with EAV flexibility. Validate at the application layer, not the database.*
