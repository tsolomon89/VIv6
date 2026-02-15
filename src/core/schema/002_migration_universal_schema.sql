-- Migration:-- Activities (Event Log)
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  type TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  metadata TEXT NOT NULL, -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Migration: Universal Schema Alignment (Content v1 -> Universal v2)
-- Upgrades existing Content Engine DB to full VI v5 Object Model

BEGIN TRANSACTION;

-- 1. Identity & Tenancy
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  name TEXT,
  avatar_url TEXT,
  global_preferences JSON DEFAULT '{}',
  primary_account_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  account_class TEXT NOT NULL DEFAULT 'business',
  type TEXT DEFAULT 'client',
  data JSON DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS user_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  permission_level TEXT DEFAULT 'junior',
  role_overrides JSON DEFAULT '{}',
  data JSON DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  UNIQUE(user_id, account_id)
);

CREATE TABLE IF NOT EXISTS account_links (
  id TEXT PRIMARY KEY,
  owner_account_id TEXT NOT NULL,
  target_account_id TEXT NOT NULL,
  link_type TEXT NOT NULL,
  data JSON DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_account_id) REFERENCES accounts(id),
  FOREIGN KEY (target_account_id) REFERENCES accounts(id),
  UNIQUE(owner_account_id, target_account_id, link_type)
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  data JSON DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- 2. Migrate Entites (Add account_id)
-- SQLite doesn't support IF NOT EXISTS for ADD COLUMN, so we rely on app logic or ignore error if manual.
-- For script robustness in SQLite, we have to endure error if it exists, or create new table and copy.
-- Simplified approach: ALTER (will fail if exists, but script continues in some runners, else use pragma check)
-- Assuming this runs on v1 DB:

ALTER TABLE entities ADD COLUMN account_id TEXT;
-- Populate account_id from brand_id if possible (assuming 'brand' entity becomes an Account reference)
-- UPDATE entities SET account_id = brand_id; 

ALTER TABLE entities ADD COLUMN summary TEXT;
ALTER TABLE entities ADD COLUMN deleted_at TEXT;

-- 3. Migrate Relationships -> EntityRelationships
CREATE TABLE IF NOT EXISTS entity_relationships (
  id TEXT PRIMARY KEY,
  from_entity_id TEXT NOT NULL,
  to_entity_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  data JSON DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (to_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
  UNIQUE(from_entity_id, to_entity_id, relationship_type)
);

-- Copy data
INSERT INTO entity_relationships (id, from_entity_id, to_entity_id, relationship_type, data, created_at)
SELECT id, from_id, to_id, type, properties, created_at FROM relationships;

-- 4. Commerce & Ledger
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  owner_account_id TEXT NOT NULL,
  target_account_id TEXT,
  contact_id TEXT,
  opp_type TEXT NOT NULL, 
  stage TEXT NOT NULL DEFAULT 'MQL',
  status TEXT DEFAULT 'open',
  value REAL,
  currency TEXT DEFAULT 'GBP',
  data JSON DEFAULT '{}',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  closed_at TEXT,
  FOREIGN KEY (owner_account_id) REFERENCES accounts(id),
  FOREIGN KEY (target_account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  contact_id TEXT,
  activity_type TEXT NOT NULL,
  asset_id TEXT,
  opportunity_id TEXT,
  data JSON DEFAULT '{}',
  occurred_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (asset_id) REFERENCES entities(id),
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id)
);

-- 5. Templates
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  binding_kind TEXT NOT NULL,
  binding_signature TEXT,
  template_type TEXT DEFAULT 'section',
  default_config JSON DEFAULT '{}',
  account_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Migration of templates left as exercise or manual step due to structural diffs.

-- Cleanup
-- DROP TABLE relationships; -- Keep for safety until verified manually
-- DROP TABLE section_templates;
-- DROP TABLE page_templates;

INSERT INTO _migrations (name) VALUES ('002_migration_universal_schema');

COMMIT;
