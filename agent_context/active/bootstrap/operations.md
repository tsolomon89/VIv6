# System Operations

## 1. Deployment Architecture ("One App, Many Domains")

Oblio uses a **Multi-Tenant Monorepo** strategy.

- **Infrastructure**: Single Vercel Project.
- **Database**: Single Turso/SQLite Instance.
- **Routing**: `middleware.ts` maps `Hostname` -> `AccountID`.

### The Routing Handshake
1.  **Incoming**: `timsolomon.com`
2.  **Lookup**: Redis/Memcached checks Domain Registry (Tier 1 Data).
3.  **Rewrite**: `/app?tenant=acc-tim-uuid`
4.  **Security**: API validates that `acc-tim-uuid` allows public access or the user has a token for it.

## 2. The Build Pipeline (Static Generation)

For public sites (CMS Mode), we statically generate pages from the Fact Store.

### `npm run build:sites`
1.  **Query**: Fetch all Accounts marked `has_public_site=true`.
2.  **Iterate**: For each Account:
    - Fetch `Page` records.
    - Fetch `Product` records (for Catalog).
    - Generate `routes.json`.
3.  **Output**: `dist/sites/{domain}/*`

## 3. CLI Toolkit

### `npm run db:seed`
Bootstraps Tier 0 and Tier 1.
- Resets the "Physics" (Tier 0).
- Re-creates the "Oblio" Account (Tier 1).

### `npm run db:simulate {accountId} {days}`
*New Game Engine Tool.*
- Generates synthetic `Activity` records for the specified Account.
- Advances the "Game Clock" by `{days}`.
- Used for stress testing and verifying Scoring logic.
