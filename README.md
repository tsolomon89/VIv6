# Victory Initiative v5 (Keimenon)

**The Schema-Driven Record Platform.**

A universal record workspace for managing a knowledge graph of Records (Contacts, Products, Opportunities, Activities) and generating static, performant websites from them using data-driven templates.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+
- NPM

### 2. Installation
```bash
npm install
```

### 3. Running Locally
Start the local development environment (API + Studio UI):
```bash
# Terminal 1: API Server
npx tsx src/api/server.ts

# Terminal 2: Studio UI
cd src/ui && npm run dev
```
Access the Studio at `http://localhost:5173`.

### 4. Managing Content
1.  Open the **Studio** at `/dashboard`.
2.  Navigate to any record type via the sidebar (Contacts, Opportunities, Products, etc.).
3.  Create, edit, or link records — the system uses relationships to determine page layouts.
4.  Manage system settings at `/settings` (AI credentials, builds, domains).

### 5. Building the Site
Generate the static website to the `dist/` folder:

**Standard Build (All Pages)**:
```bash
npm run build
```

**Brand-Scoped Build (Recommended for Production)**:
```bash
npm run build:brand -- --brand=keimenon
```
Output:
- `dist/<hostname>/index.html` when the tenant has an active primary domain
- `dist/<tenant_slug>/index.html` when no active primary domain is configured

**Verify all seeded tenant brand builds (CI-equivalent gate)**:
```bash
npm run build:verify:brands
```
This runs `build:brand` for every tenant slug in `data/seeds/tenants/*.json` and fails fast on any build or missing artifact.

### 6. Previewing
```bash
npx serve dist
```

## 🛠 Architecture

- **Core (`src/core`)**: SQLite database logic, Record CRUD, schema-as-data.
- **API (`src/api`)**: Express REST API (`/api/records`, `/api/relationships`, `/api/domains`).
- **UI (`src/ui`)**: React Studio — the universal record workspace.
- **Build (`src/build`)**: One-way static generator that compiles DB → HTML.
- **Templates (`src/templates`)**: Handlebars templates (`.hbs`) for the build output.
- **MCP (`src/mcp`)**: AI Agent tools for Cursor/Claude integration.
- **Docs (`agent_context/active`)**: Canonical architecture and domain model specs.

## 📦 Deployment

1.  Run `npm run build:brand -- --brand=<tenant_slug>`.
2.  Deploy the resolved output folder:
    - `dist/<hostname>/` when an active primary domain exists
    - `dist/<tenant_slug>/` otherwise
3.  Run `npm run build:verify:brands` before release to enforce all-seeded-brand build verification.

### 7. Resetting Local Data After Canonicalization
The supported local upgrade path for the hard-cut `ObjectType` / `values[]` migration is a destructive reset and reseed:
```bash
npm run devdb:reset
```
This rebuilds `data/vi.sqlite` from the tracked seed set and is the supported way to realign a local dev database with the current canonical schema.
