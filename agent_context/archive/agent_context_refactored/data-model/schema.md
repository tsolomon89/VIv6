# Database Schema (SQLite + EAV)

> **Contract**: The database schema is STABLE. All flexibility is contained within the `data` JSON column. New fields MUST be added to `data`, not as new columns, unless they require high-performance indexing.

## Core Tables

### users

The Global Identity table. Authentication and profile data lives here.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  
  -- Global Profile
  name TEXT,
  avatar_url TEXT,
  global_preferences JSON DEFAULT '{}',
  
  -- Account Routing
  primary_account_id TEXT REFERENCES accounts(id),
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  deleted_at TEXT
);
```

### accounts

The fundamental unit of tenancy.

```sql
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,              -- Globally unique URL identifier
  name TEXT NOT NULL,
  
  -- Hierarchy & Classification
  account_class TEXT NOT NULL DEFAULT 'business',  -- 'free' | 'professional' | 'business'
  type TEXT DEFAULT 'client',                      -- 'admin' | 'client'
  
  -- Flexible Data (EAV)
  data JSON DEFAULT '{}',
  /*
    data: {
      branding: { logo_url, primary_color },
      settings: { features: {} }
    }
  */
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  deleted_at TEXT
);
```

### user_accounts (Memberships)

The Many-to-Many join between Users and Accounts. This IS the "Internal Contact".

```sql
CREATE TABLE user_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  -- RBAC
  permission_level TEXT DEFAULT 'junior', -- 'admin' | 'leader' | 'senior' | 'junior'
  role_overrides JSON DEFAULT '{}',
  
  -- Account-Specific Profile (The "Contact Card")
  data JSON DEFAULT '{}',
  /*
    data: {
      jobTitle: "Marketing Manager",
      notifications: { ... }
    }
  */
  
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TEXT DEFAULT (datetime('now')),
  
  UNIQUE(user_id, account_id)
);
```

### contacts (External Leads)

External people who do NOT have a login (Leads/Prospects).

```sql
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id), -- The account that owns this lead
  
  email TEXT,
  name TEXT,
  
  -- Flexible CRM Data
  data JSON DEFAULT '{}',                 -- Phone, Social, Lead Score
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  deleted_at TEXT
);
```

### account_links (CRM Relationships)

Allows one Account (e.g., Admin) to manage another (e.g., Client).

```sql
CREATE TABLE account_links (
  id TEXT PRIMARY KEY,
  owner_account_id TEXT NOT NULL REFERENCES accounts(id),
  target_account_id TEXT NOT NULL REFERENCES accounts(id),
  
  link_type TEXT NOT NULL,                -- 'managed_by' | 'partner' | 'vendor'
  
  data JSON DEFAULT '{}',
  
  created_at TEXT DEFAULT (datetime('now')),
  
  UNIQUE(owner_account_id, target_account_id, link_type)
);
```

## Catalog (Content) Tables

### entities

Generic node for all content (Products, Features, Solutions, Assets).

```sql
CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  slug TEXT NOT NULL,                     -- Unique within Account
  type TEXT NOT NULL,                     -- 'product' | 'feature' | 'solution' | 'useCase' | 'asset'
  
  name TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  
  data JSON DEFAULT '{}',
  /*
    Product: { product_type, pricing, personas }
    Asset: { asset_type, url, content }
  */
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  deleted_at TEXT,
  
  UNIQUE(account_id, slug)
);
```

### entity_relationships

The graph edges connecting Entities.

```sql
CREATE TABLE entity_relationships (
  id TEXT PRIMARY KEY,
  from_entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  to_entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  
  relationship_type TEXT NOT NULL,        -- 'has_feature' | 'delivers' | 'applies_to' | 'targets'
  
  data JSON DEFAULT '{}',
  
  created_at TEXT DEFAULT (datetime('now')),
  
  UNIQUE(from_entity_id, to_entity_id, relationship_type)
);
```

**Standard Graph**:
*   `Product` -> `has_feature` -> `Feature`
*   `Feature` -> `delivers` -> `Solution`
*   `Solution` -> `applies_to` -> `UseCase`
*   `Product` -> `targets` -> `Persona` (Conceptually, stored in JSON)

## Transaction Tables

### opportunities

Potential transactions between Accounts.

```sql
CREATE TABLE opportunities (
  id TEXT PRIMARY KEY,
  owner_account_id TEXT NOT NULL REFERENCES accounts(id),
  target_account_id TEXT NOT NULL REFERENCES accounts(id),
  
  opp_type TEXT NOT NULL,                 -- 'B2B' | 'B2C' | 'SUP' | 'PRT' | 'AFF' | 'RES' | 'INV' | 'HUM'
  stage TEXT NOT NULL DEFAULT 'MQL',      -- 'MQL' | 'SQL' | 'FTP' | 'RTP'
  status TEXT DEFAULT 'open',             -- 'open' | 'won' | 'lost'
  
  value REAL,
  currency TEXT DEFAULT 'GBP',
  
  data JSON DEFAULT '{}',
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  closed_at TEXT
);
```

### activities

Immutable event log.

```sql
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  contact_id TEXT REFERENCES contacts(id),
  
  activity_type TEXT NOT NULL,            -- 'page_view', 'form_submit'
  asset_id TEXT REFERENCES entities(id),
  opportunity_id TEXT REFERENCES opportunities(id),
  
  data JSON DEFAULT '{}',                 -- Payload (URL, UTM, IP)
  
  occurred_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);
```

## System Tables

### dimension_values

Controlled vocabulary for targeting options.

```sql
CREATE TABLE dimension_values (
  id TEXT PRIMARY KEY,
  dimension TEXT NOT NULL,                -- 'companySize', 'sector'
  slug TEXT NOT NULL,                     -- 'smb', 'healthcare'
  label TEXT NOT NULL,
  
  parent_id TEXT REFERENCES dimension_values(id),
  account_id TEXT REFERENCES accounts(id), -- NULL = Global (Oblio OS)
  
  data JSON DEFAULT '{}',
  
  UNIQUE(dimension, slug, account_id)
);
```

### templates

Definitions for page logic and layout.

```sql
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,               -- 'related.feature.many.grid.v1'
  name TEXT NOT NULL,
  
  binding_kind TEXT NOT NULL,             -- 'self' | 'related'
  binding_signature TEXT NOT NULL,        -- 'related.feature.many'
  
  template_type TEXT DEFAULT 'section',   -- 'section' | 'page'
  
  default_config JSON DEFAULT '{}',
  account_id TEXT REFERENCES accounts(id)
);
```
