# ADR-001: SQLite + EAV Pattern

## Context
We need a data model that supports:
1.  **High Velocity**: Rapid prototyping without database migrations.
2.  **Strict Identity**: Core entities (Accounts, Contacts) must be stable.
3.  **Flexible Business Logic**: Different customers (Tier 1 Accounts) need different fields.
4.  **Local Dev Experience**: Simple setup (`npm install`), no Docker/Postgres requirement initially.

## Decision
We use **SQLite** as the primary database with an **Entity-Attribute-Value (EAV)** pattern implemented via a JSON `data` column.

### The Pattern
*   **Stable Columns**: `id`, `slug`, `type`, `created_at`.
*   **Flexible Data**: `data` (JSON).

```sql
CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'product', 'feature'
  data JSON DEFAULT '{}'
);
```

## Consequences

### Positive
*   **No Migrations**: Adding a 'Pricing' field to a Product is a code change (edit `ProductData` interface), not a DB migration.
*   **Per-Tenant Schema**: Tenant A can have `data.industry`, Tenant B can have `data.shoeSize`. Both coexist in the same table.
*   **Portability**: The entire database is a single file (`database.sqlite`).
*   **Speed**: SQLite is in-process and extremely fast for read-heavy workloads (SSG).

### Negative
*   **Complex Queries**: Filtering by JSON fields is slower than indexed columns (though SQLite JSON support is good).
*   **Type Safety**: We lose SQL-level type enforcement. We MUST enforce schema validation in the Application Layer (Zod/TypeScript).

## Mitigation
*   **Application Layer Validation**: All writes MUST pass through a Zod schema validation step.
*   **Indexing**: We will promote high-frequency query fields to real columns if performance degrades.
