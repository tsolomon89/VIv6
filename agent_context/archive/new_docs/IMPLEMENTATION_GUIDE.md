# IMPLEMENTATION GUIDE

> **Purpose**: Step-by-step implementation guide for AI agents. Follow in order.

---

## Repository Structure

```
oblio/
├── packages/
│   ├── db/                       # Database layer
│   │   ├── src/
│   │   │   ├── schema.sql        # Table definitions
│   │   │   ├── migrations/       # Migration files
│   │   │   ├── seed/             # Seed data
│   │   │   └── index.ts          # DB connection + helpers
│   │   └── package.json
│   │
│   ├── core/                     # Core business logic
│   │   ├── src/
│   │   │   ├── accounts.ts       # Account CRUD
│   │   │   ├── contacts.ts       # Contact + identity resolution
│   │   │   ├── entities.ts       # Entity CRUD (products, features, etc.)
│   │   │   ├── relationships.ts  # Entity relationships
│   │   │   ├── opportunities.ts  # Pipeline management
│   │   │   ├── activities.ts     # Activity logging
│   │   │   ├── dimensions.ts     # Dimension values
│   │   │   ├── targeting.ts      # Persona matching
│   │   │   └── index.ts          # Public exports
│   │   └── package.json
│   │
│   └── shared/                   # Shared types + utilities
│       ├── src/
│       │   ├── types.ts          # TypeScript interfaces
│       │   ├── constants.ts      # Enums, static values
│       │   └── utils.ts          # Helper functions
│       └── package.json
│
├── apps/
│   ├── api/                      # REST/GraphQL API
│   │   ├── src/
│   │   │   ├── routes/           # Route handlers
│   │   │   ├── middleware/       # Auth, tenancy
│   │   │   └── index.ts          # Server entry
│   │   └── package.json
│   │
│   ├── admin/                    # Admin UI (React)
│   │   ├── src/
│   │   │   ├── pages/            # Page components
│   │   │   ├── components/       # Shared components
│   │   │   ├── lib/              # API client, state
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   └── viv5/                     # Website generator
│       ├── src/
│       │   ├── compiler/         # Page derivation
│       │   ├── templates/        # Section templates
│       │   ├── renderer/         # React rendering
│       │   ├── builder/          # existing old-builder code
│       │   └── index.ts
│       └── package.json
│
├── mcp/                          # MCP server for AI agents
│   ├── src/
│   │   ├── tools/                # Tool definitions
│   │   └── server.ts
│   └── package.json
│
├── data/
│   ├── vi.sqlite                 # SQLite database
│   └── seeds/                    # Seed JSON files
│
├── agent_context/                # AI agent documentation (THIS FOLDER)
│   ├── OBLIO_SYSTEM.md
│   ├── VIV5_INTEGRATION.md
│   ├── SCHEMA.md
│   ├── IMPLEMENTATION_GUIDE.md   # This file
│   └── ...
│
└── package.json                  # Workspace root
```

---

## Phase 0: Project Setup

### 0.1 Initialize Monorepo

```bash
# Create workspace
mkdir oblio && cd oblio
npm init -y

# Add workspace config to package.json
{
  "name": "oblio",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*",
    "mcp"
  ]
}

# Create directory structure
mkdir -p packages/{db,core,shared}/src
mkdir -p apps/{api,admin,viv5}/src
mkdir -p mcp/src
mkdir -p data/seeds
mkdir -p agent_context
```

### 0.2 Install Dependencies

```bash
# Root dev dependencies
npm install -D typescript @types/node tsx vitest

# packages/db
cd packages/db
npm init -y
npm install better-sqlite3
npm install -D @types/better-sqlite3

# packages/core
cd ../core
npm init -y
npm install uuid
npm install -D @types/uuid

# packages/shared
cd ../shared
npm init -y

# apps/api
cd ../../apps/api
npm init -y
npm install express cors
npm install -D @types/express @types/cors

# apps/admin
cd ../admin
npm init -y
npm install react react-dom react-router-dom
npm install -D @types/react @types/react-dom vite @vitejs/plugin-react
```

### 0.3 TypeScript Configuration

```json
// tsconfig.base.json (root)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

---

## Phase 1: Database Layer

### 1.1 Create Schema

Copy `SCHEMA.md` SQL into `packages/db/src/schema.sql`.

### 1.2 Database Connection

```typescript
// packages/db/src/index.ts
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

let db: Database.Database | null = null;

export function getDb(dbPath = 'data/vi.sqlite'): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function migrate(db: Database.Database): void {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
}

export function reset(db: Database.Database): void {
  // Drop all tables and recreate
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all() as { name: string }[];
  
  for (const { name } of tables) {
    db.exec(`DROP TABLE IF EXISTS ${name}`);
  }
  
  migrate(db);
}

export * from './queries';
```

### 1.3 Query Helpers

```typescript
// packages/db/src/queries.ts
import type Database from 'better-sqlite3';

export function generateId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

// Generic CRUD helpers
export function insertRow(
  db: Database.Database,
  table: string,
  data: Record<string, unknown>
): string {
  const id = data.id as string || generateId();
  const columns = Object.keys(data);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map(k => {
    const v = data[k];
    return typeof v === 'object' ? JSON.stringify(v) : v;
  });
  
  db.prepare(`
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
  `).run(...values);
  
  return id;
}

export function updateRow(
  db: Database.Database,
  table: string,
  id: string,
  data: Record<string, unknown>
): void {
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data).map(v => 
    typeof v === 'object' ? JSON.stringify(v) : v
  );
  
  db.prepare(`
    UPDATE ${table} SET ${sets}, updated_at = ? WHERE id = ?
  `).run(...values, now(), id);
}

export function getRow<T>(
  db: Database.Database,
  table: string,
  id: string
): T | undefined {
  const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
  return row ? parseJsonFields(row as Record<string, unknown>) as T : undefined;
}

export function parseJsonFields<T extends Record<string, unknown>>(row: T): T {
  const result = { ...row };
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
      try {
        result[key as keyof T] = JSON.parse(value) as T[keyof T];
      } catch { /* not JSON */ }
    }
  }
  return result;
}
```

### 1.4 Tests

```typescript
// packages/db/src/__tests__/db.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { migrate, reset, insertRow, getRow } from '../index';

describe('Database', () => {
  let db: Database.Database;
  
  beforeEach(() => {
    db = new Database(':memory:');
    migrate(db);
  });
  
  it('creates tables', () => {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table'
    `).all();
    
    expect(tables.map((t: any) => t.name)).toContain('accounts');
    expect(tables.map((t: any) => t.name)).toContain('entities');
  });
  
  it('inserts and retrieves rows', () => {
    const id = insertRow(db, 'accounts', {
      id: 'test_account',
      slug: 'test',
      name: 'Test Account',
      account_class: 'business',
      data: { foo: 'bar' }
    });
    
    const row = getRow(db, 'accounts', id);
    expect(row).toBeDefined();
    expect((row as any).data.foo).toBe('bar');
  });
});
```

---

## Phase 2: Core Functions

### 2.1 Types

```typescript
// packages/shared/src/types.ts

export type AccountClass = 'business' | 'household';
export type AccountType = 'admin' | 'client' | 'vendor' | 'partner';
export type EntityType = 'product' | 'feature' | 'solution' | 'useCase' | 'asset';
export type PersonaType = 'DM' | 'EU' | 'IN';
export type OppType = 'B2B' | 'B2C' | 'Supplier' | 'Partnership' | 'Reseller' | 'HR';
export type OppStage = 'MQL' | 'SQL' | 'FTP' | 'RTP';
export type OppStatus = 'open' | 'won' | 'lost' | 'churned';

export interface Account {
  id: string;
  slug: string;
  name: string;
  account_class: AccountClass;
  account_type?: AccountType;
  parent_id?: string;
  managed_by_account_id?: string;
  is_oblio_user: boolean;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  primary_email_id?: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Entity {
  id: string;
  account_id: string;
  slug: string;
  type: EntityType;
  name: string;
  summary?: string;
  description?: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EntityRelationship {
  id: string;
  from_entity_id: string;
  to_entity_id: string;
  relationship_type: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface Opportunity {
  id: string;
  owner_account_id: string;
  target_account_id: string;
  primary_contact_id?: string;
  opp_type: OppType;
  stage: OppStage;
  product_ids: string[];
  value?: number;
  currency: string;
  status: OppStatus;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface TargetingCriteria {
  companySize?: string[];
  department?: string[];
  seniority?: string[];
  sector?: string[];
  [key: string]: string[] | undefined;
}

export interface ProductPersonas {
  DM?: TargetingCriteria;
  EU?: TargetingCriteria;
  IN?: TargetingCriteria;
}
```

### 2.2 Accounts Module

```typescript
// packages/core/src/accounts.ts
import type Database from 'better-sqlite3';
import { insertRow, updateRow, getRow, generateId, parseJsonFields } from '@oblio/db';
import type { Account, AccountClass, AccountType } from '@oblio/shared';

export interface CreateAccountInput {
  slug: string;
  name: string;
  account_class?: AccountClass;
  account_type?: AccountType;
  parent_id?: string;
  managed_by_account_id?: string;
  is_oblio_user?: boolean;
  data?: Record<string, unknown>;
}

export function createAccount(db: Database.Database, input: CreateAccountInput): Account {
  // Validate slug uniqueness
  const existing = db.prepare('SELECT id FROM accounts WHERE slug = ?').get(input.slug);
  if (existing) {
    throw new Error(`Account with slug '${input.slug}' already exists`);
  }
  
  const id = generateId();
  insertRow(db, 'accounts', {
    id,
    slug: input.slug,
    name: input.name,
    account_class: input.account_class || 'business',
    account_type: input.account_type || 'client',
    parent_id: input.parent_id || null,
    managed_by_account_id: input.managed_by_account_id || null,
    is_oblio_user: input.is_oblio_user ?? false,
    data: input.data || {}
  });
  
  return getAccount(db, id)!;
}

export function getAccount(db: Database.Database, id: string): Account | undefined {
  return getRow<Account>(db, 'accounts', id);
}

export function getAccountBySlug(db: Database.Database, slug: string): Account | undefined {
  const row = db.prepare('SELECT * FROM accounts WHERE slug = ?').get(slug);
  return row ? parseJsonFields(row as Record<string, unknown>) as Account : undefined;
}

export function updateAccount(
  db: Database.Database, 
  id: string, 
  updates: Partial<CreateAccountInput>
): Account {
  updateRow(db, 'accounts', id, updates);
  return getAccount(db, id)!;
}

export function listAccounts(
  db: Database.Database,
  filters?: { parent_id?: string; account_class?: AccountClass; is_oblio_user?: boolean }
): Account[] {
  let query = 'SELECT * FROM accounts WHERE deleted_at IS NULL';
  const params: unknown[] = [];
  
  if (filters?.parent_id) {
    query += ' AND parent_id = ?';
    params.push(filters.parent_id);
  }
  if (filters?.account_class) {
    query += ' AND account_class = ?';
    params.push(filters.account_class);
  }
  if (filters?.is_oblio_user !== undefined) {
    query += ' AND is_oblio_user = ?';
    params.push(filters.is_oblio_user ? 1 : 0);
  }
  
  const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
  return rows.map(r => parseJsonFields(r) as Account);
}

export function getAccountChildren(db: Database.Database, parentId: string): Account[] {
  const rows = db.prepare(
    'SELECT * FROM accounts WHERE parent_id = ? AND deleted_at IS NULL'
  ).all(parentId) as Record<string, unknown>[];
  return rows.map(r => parseJsonFields(r) as Account);
}
```

### 2.3 Entities Module

```typescript
// packages/core/src/entities.ts
import type Database from 'better-sqlite3';
import { insertRow, updateRow, getRow, generateId, parseJsonFields } from '@oblio/db';
import type { Entity, EntityType } from '@oblio/shared';

export interface CreateEntityInput {
  account_id: string;
  slug: string;
  type: EntityType;
  name: string;
  summary?: string;
  description?: string;
  data?: Record<string, unknown>;
}

export function createEntity(db: Database.Database, input: CreateEntityInput): Entity {
  // Validate slug uniqueness within account
  const existing = db.prepare(
    'SELECT id FROM entities WHERE account_id = ? AND slug = ?'
  ).get(input.account_id, input.slug);
  
  if (existing) {
    throw new Error(`Entity with slug '${input.slug}' already exists in this account`);
  }
  
  const id = generateId();
  insertRow(db, 'entities', {
    id,
    account_id: input.account_id,
    slug: input.slug,
    type: input.type,
    name: input.name,
    summary: input.summary || null,
    description: input.description || null,
    data: input.data || {}
  });
  
  return getEntity(db, id)!;
}

export function getEntity(db: Database.Database, id: string): Entity | undefined {
  return getRow<Entity>(db, 'entities', id);
}

export function getEntityBySlug(
  db: Database.Database, 
  accountId: string, 
  slug: string
): Entity | undefined {
  const row = db.prepare(
    'SELECT * FROM entities WHERE account_id = ? AND slug = ?'
  ).get(accountId, slug);
  return row ? parseJsonFields(row as Record<string, unknown>) as Entity : undefined;
}

export function listEntities(
  db: Database.Database,
  accountId: string,
  filters?: { type?: EntityType }
): Entity[] {
  let query = 'SELECT * FROM entities WHERE account_id = ? AND deleted_at IS NULL';
  const params: unknown[] = [accountId];
  
  if (filters?.type) {
    query += ' AND type = ?';
    params.push(filters.type);
  }
  
  query += ' ORDER BY name';
  
  const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
  return rows.map(r => parseJsonFields(r) as Entity);
}

export function updateEntity(
  db: Database.Database,
  id: string,
  updates: Partial<CreateEntityInput>
): Entity {
  updateRow(db, 'entities', id, updates);
  return getEntity(db, id)!;
}

export function deleteEntity(db: Database.Database, id: string): void {
  updateRow(db, 'entities', id, { deleted_at: new Date().toISOString() });
}
```

### 2.4 Relationships Module

```typescript
// packages/core/src/relationships.ts
import type Database from 'better-sqlite3';
import { insertRow, getRow, generateId, parseJsonFields } from '@oblio/db';
import type { EntityRelationship } from '@oblio/shared';
import { getEntity } from './entities';

export interface CreateRelationshipInput {
  from_entity_id: string;
  to_entity_id: string;
  relationship_type: string;
  data?: Record<string, unknown>;
}

export function createRelationship(
  db: Database.Database, 
  input: CreateRelationshipInput
): EntityRelationship {
  // Validate both entities exist
  const from = getEntity(db, input.from_entity_id);
  const to = getEntity(db, input.to_entity_id);
  
  if (!from) throw new Error(`From entity ${input.from_entity_id} not found`);
  if (!to) throw new Error(`To entity ${input.to_entity_id} not found`);
  
  // Check for duplicate
  const existing = db.prepare(`
    SELECT id FROM entity_relationships 
    WHERE from_entity_id = ? AND to_entity_id = ? AND relationship_type = ?
  `).get(input.from_entity_id, input.to_entity_id, input.relationship_type);
  
  if (existing) {
    throw new Error('Relationship already exists');
  }
  
  const id = generateId();
  insertRow(db, 'entity_relationships', {
    id,
    from_entity_id: input.from_entity_id,
    to_entity_id: input.to_entity_id,
    relationship_type: input.relationship_type,
    data: input.data || {}
  });
  
  return getRelationship(db, id)!;
}

export function getRelationship(
  db: Database.Database, 
  id: string
): EntityRelationship | undefined {
  return getRow<EntityRelationship>(db, 'entity_relationships', id);
}

export function getRelationshipsFrom(
  db: Database.Database,
  entityId: string,
  type?: string
): EntityRelationship[] {
  let query = 'SELECT * FROM entity_relationships WHERE from_entity_id = ?';
  const params: unknown[] = [entityId];
  
  if (type) {
    query += ' AND relationship_type = ?';
    params.push(type);
  }
  
  const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
  return rows.map(r => parseJsonFields(r) as EntityRelationship);
}

export function getRelationshipsTo(
  db: Database.Database,
  entityId: string,
  type?: string
): EntityRelationship[] {
  let query = 'SELECT * FROM entity_relationships WHERE to_entity_id = ?';
  const params: unknown[] = [entityId];
  
  if (type) {
    query += ' AND relationship_type = ?';
    params.push(type);
  }
  
  const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
  return rows.map(r => parseJsonFields(r) as EntityRelationship);
}

export function deleteRelationship(db: Database.Database, id: string): void {
  db.prepare('DELETE FROM entity_relationships WHERE id = ?').run(id);
}

// Get full entity graph from a starting point
export function getEntityGraph(
  db: Database.Database,
  entityId: string,
  options: { depth?: number; types?: string[] } = {}
): { entity: Entity; relationships: EntityRelationship[]; related: Entity[] }[] {
  const depth = options.depth ?? 2;
  const visited = new Set<string>();
  const result: { entity: Entity; relationships: EntityRelationship[]; related: Entity[] }[] = [];
  
  function traverse(id: string, currentDepth: number) {
    if (currentDepth > depth || visited.has(id)) return;
    visited.add(id);
    
    const entity = getEntity(db, id);
    if (!entity) return;
    
    let rels = getRelationshipsFrom(db, id);
    if (options.types?.length) {
      rels = rels.filter(r => options.types!.includes(r.relationship_type));
    }
    
    const related = rels.map(r => getEntity(db, r.to_entity_id)).filter(Boolean) as Entity[];
    
    result.push({ entity, relationships: rels, related });
    
    for (const rel of rels) {
      traverse(rel.to_entity_id, currentDepth + 1);
    }
  }
  
  traverse(entityId, 0);
  return result;
}
```

### 2.5 Export Core Functions

```typescript
// packages/core/src/index.ts
export * from './accounts';
export * from './contacts';
export * from './entities';
export * from './relationships';
export * from './opportunities';
export * from './activities';
export * from './dimensions';
export * from './targeting';
```

---

## Phase 3: Seed Data

### 3.1 Seed Script

```typescript
// packages/db/src/seed/index.ts
import type Database from 'better-sqlite3';
import { createAccount, createEntity, createRelationship } from '@oblio/core';

export function seedOblioOS(db: Database.Database): void {
  // 1. Create Oblio OS root account
  const oblioOS = createAccount(db, {
    slug: 'oblio-os',
    name: 'Oblio OS',
    account_class: 'business',
    account_type: 'admin',
    is_oblio_user: true,
    data: { settings: { isRoot: true } }
  });
  
  // 2. Seed dimension values
  seedDimensionValues(db);
  
  // 3. Seed default templates
  seedTemplates(db);
}

export function seedDimensionValues(db: Database.Database): void {
  const dimensions = [
    // Company Size
    { dimension: 'companySize', slug: 'proprietor', label: 'Proprietor (1)', data: { headcountRange: [1, 1] } },
    { dimension: 'companySize', slug: 'micro', label: 'Micro (2-10)', data: { headcountRange: [2, 10] } },
    { dimension: 'companySize', slug: 'smb', label: 'SMB (11-50)', data: { headcountRange: [11, 50] } },
    { dimension: 'companySize', slug: 'mid', label: 'Mid (51-200)', data: { headcountRange: [51, 200] } },
    { dimension: 'companySize', slug: 'large', label: 'Large (201-1000)', data: { headcountRange: [201, 1000] } },
    { dimension: 'companySize', slug: 'enterprise', label: 'Enterprise (1000+)', data: { headcountRange: [1001, null] } },
    
    // Departments
    { dimension: 'department', slug: 'marketing', label: 'Marketing' },
    { dimension: 'department', slug: 'sales', label: 'Sales' },
    { dimension: 'department', slug: 'revops', label: 'Revenue Operations' },
    { dimension: 'department', slug: 'finance', label: 'Finance' },
    { dimension: 'department', slug: 'engineering', label: 'Engineering' },
    { dimension: 'department', slug: 'product', label: 'Product' },
    
    // Seniority
    { dimension: 'seniority', slug: 'ic', label: 'Individual Contributor' },
    { dimension: 'seniority', slug: 'manager', label: 'Manager' },
    { dimension: 'seniority', slug: 'senior', label: 'Senior' },
    { dimension: 'seniority', slug: 'director', label: 'Director' },
    { dimension: 'seniority', slug: 'vp', label: 'VP' },
    { dimension: 'seniority', slug: 'c-level', label: 'C-Level' },
  ];
  
  for (const dim of dimensions) {
    db.prepare(`
      INSERT INTO dimension_values (id, dimension, slug, label, data, account_id)
      VALUES (?, ?, ?, ?, ?, NULL)
    `).run(
      crypto.randomUUID(),
      dim.dimension,
      dim.slug,
      dim.label,
      JSON.stringify(dim.data || {})
    );
  }
}

export function seedYourBrands(db: Database.Database): void {
  // Load from inventory-v2.json and create accounts + entities
  // Implementation depends on your JSON structure
}
```

### 3.2 CLI Commands

```typescript
// packages/db/src/cli.ts
import { getDb, migrate, reset } from './index';
import { seedOblioOS, seedYourBrands } from './seed';

const command = process.argv[2];
const db = getDb();

switch (command) {
  case 'migrate':
    migrate(db);
    console.log('Migration complete');
    break;
    
  case 'seed':
    seedOblioOS(db);
    seedYourBrands(db);
    console.log('Seed complete');
    break;
    
  case 'reset':
    reset(db);
    seedOblioOS(db);
    console.log('Reset complete');
    break;
    
  default:
    console.log('Usage: db:migrate | db:seed | db:reset');
}
```

Add to package.json:
```json
{
  "scripts": {
    "db:migrate": "tsx src/cli.ts migrate",
    "db:seed": "tsx src/cli.ts seed",
    "db:reset": "tsx src/cli.ts reset"
  }
}
```

---

## Phase 4: Continue with remaining phases...

See `PHASE1_TASKS.md` for:
- Phase 4: Page Derivation Engine
- Phase 5: Static Build Output
- Phase 6: MD File Ingestion
- Phase 7: Content Constraints & AI Generation
- Phase 8: Template Registry
- Phase 9: Runtime Renderer
- Phase 10: Editor Integration
- Phase 11: MCP Tools

---

## Testing Strategy

### Unit Tests

Each module in `packages/core` should have tests:

```bash
packages/core/src/__tests__/
├── accounts.test.ts
├── entities.test.ts
├── relationships.test.ts
└── targeting.test.ts
```

### Integration Tests

Test the full flow:

```typescript
// test/integration/flow.test.ts
it('creates account → entity → relationship → derives page', async () => {
  // 1. Create account
  const account = createAccount(db, { slug: 'test', name: 'Test' });
  
  // 2. Create product
  const product = createEntity(db, {
    account_id: account.id,
    type: 'product',
    slug: 'test-product',
    name: 'Test Product'
  });
  
  // 3. Create feature
  const feature = createEntity(db, {
    account_id: account.id,
    type: 'feature',
    slug: 'test-feature',
    name: 'Test Feature'
  });
  
  // 4. Create relationship
  createRelationship(db, {
    from_entity_id: product.id,
    to_entity_id: feature.id,
    relationship_type: 'has_feature'
  });
  
  // 5. Derive page
  const page = derivePage(db, 'test-product');
  
  expect(page.sections).toHaveLength(3); // hero, features, cta
  expect(page.sections[1].binding.target).toBe('feature');
});
```

---

## Invariant Checks

Add to every module:

```typescript
// packages/core/src/invariants.ts

export function assertSlugUnique(db: Database.Database, table: string, slug: string, accountId?: string): void {
  let query = `SELECT id FROM ${table} WHERE slug = ?`;
  const params: unknown[] = [slug];
  
  if (accountId) {
    query += ' AND account_id = ?';
    params.push(accountId);
  }
  
  const existing = db.prepare(query).get(...params);
  if (existing) {
    throw new Error(`Slug '${slug}' already exists in ${table}`);
  }
}

export function assertAccountExists(db: Database.Database, accountId: string): void {
  const account = db.prepare('SELECT id FROM accounts WHERE id = ?').get(accountId);
  if (!account) {
    throw new Error(`Account ${accountId} not found`);
  }
}

export function assertEntityExists(db: Database.Database, entityId: string): void {
  const entity = db.prepare('SELECT id FROM entities WHERE id = ?').get(entityId);
  if (!entity) {
    throw new Error(`Entity ${entityId} not found`);
  }
}
```

---

*Follow this guide in order. Each phase builds on the previous. Test before moving on.*
