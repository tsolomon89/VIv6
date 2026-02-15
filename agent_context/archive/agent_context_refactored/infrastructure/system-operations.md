# System Operations & Infrastructure

## Bootstrapping Strategy ("The Egg Problem")

The system faces a recursive problem: "Who configures the system that configures the users?"

We solve this using a multi-tier seeding strategy.

### Tier 0: The DNA (Code)
**Scope:** Hardcoded Constants / Config.
*   **What**: The `schema.sql`, `DimensionDefinitions` (The "Idea" of Sector, Company Size), and base `Role` arrays.
*   **Action**: `npm run db:migrate`. The database structure exists.

### Tier 1: The Platform (Oblio OS)
**Scope:** The First Tenant.
*   **What**: An Account Record representing **Oblio** itself.
*   **Source**: `data/seeds/platform-os.json`.
*   **Action**: `npm run db:seed`.
*   **Result**: Account `acc_oblio_os` is created. Global Dimensions (e.g., "Healthcare") are inserted owned by NULL (System).

### Tier 2: The First Clients (Your Projects)
**Scope:** `victoryinitiative`, `timsolomon`.
*   **What**: These are technically **Tenants** of Oblio. They are NOT separate instances.
*   **Source**: `config/tenants/*.json`.
*   **Action**: The seed script iterates through these configs and creates Account records.
*   **Result**: `acc_vi` and `acc_tim` are created.

> **Open Question**: The automation of this step (Automated Provisioning upon Deal Close) is currently undefined. See [Runtime Gaps](../../60_open_questions/runtime_gaps.md).

> **Key Concept**: You do not "deploy" Victory Initiative. You deploy **Oblio**, and Victory Initiative is simply Account #2 in the database.

## Deployment Architecture

### The "One App, Many Domains" Model

We avoid the "Headless CMS Paradox" (where you need a CMS instance separate from the frontend).

*   **Infrastructure**: Single Monorepo (`VIv5`).
*   **Deployment**: Single Vercel Project (`oblio-prod`).
*   **Database**: Single SQLite/Turso instance (Multi-tenant).

### Routing Logic (Middleware)
How does `timsolomon.com` know which data to show?

1.  **Request**: User hits `timsolomon.com`.
2.  **Middleware**: Checks `site-manifest.json` (or Redis cache).
3.  **Mapping**: Finds `"timsolomon.com": "acc_tim_uuid"`.
4.  **Rewrite**: Rewrites request to `/app?accountId=acc_tim_uuid`.
5.  **Data Fetch**: API uses that ID to scope all queries.

**Result**: One codebase serves infinity domains.

## Build Pipeline

The system generates static sites from the Entity Graph.

### cli command: `build`
**Input**: `entities` table + `logic/inventory-graph`
**Output**: `dist/sites/{domain}/`

```text
dist/
├── sites/
│   ├── client-site.com/
│   │   ├── pages/
│   │   │   ├── products/attribution-engine.json
│   │   │   ├── features/data-integration.json
│   │   └── routes.json
│   ├── platform-admin.app/
│   └── ...
├── shared/
│   ├── features/
│   └── targeting/
└── site-manifest.json
```

## CLI Tools

### `npm run db:seed`
Populates the database with initial Tier 0 and Tier 1 data (Platform OS, Demo Brands).
*   **Source**: `data/seeds/*.json`
*   **Dest**: SQLite `entities`, `relationships` tables.

### `npm run db:reset`
Nuclear option. Drops all tables, re-runs migrations, and re-seeds.

## MD File Ingestion

The build process watches `content/blog/*.md` and `content/docs/*.md`.
1.  **Parse Frontmatter**: Extract tags, dates, related entities.
2.  **Generate JSON**: `dist/sites/{domain}/blog/{slug}.json`.
3.  **Update Index**: Add to `/blog` listing.
