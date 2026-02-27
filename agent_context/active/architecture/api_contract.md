# API Contract: Record-First Interface

> Invariant: HTTP is the only mutation boundary.
> Model: one polymorphic `Record` resource plus explicit relationships.

## 1. Core Principles

### A. Record-first polymorphism
All domain objects are records (`type`, `slug`, `data`), not per-type endpoints.
- Canonical CRUD base: `/api/records`
- Relationships base: `/api/relationships`

### B. Deterministic writes
Create/update flows are idempotency-aware.
- `POST /api/records` may return `_idempotency: created | updated | skipped`
- Replays should be safe by design.

### C. Minimal transport contract
- Success responses return JSON payloads directly.
- Errors use `{ error, status, code? }`.
- Auth is bearer-token based for protected routes.

## 2. Canonical Resource Surface

### Records (`/api/records`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/records` | List records (filter by `account_id`, optional `type`, paginated). |
| `GET` | `/api/records/:id` | Fetch by record ID, with slug fallback in default account scope. |
| `POST` | `/api/records` | Create a record (`RecordInputSchema`). |
| `PUT` | `/api/records/:id` | Update a record (`RecordUpdateSchema`). |
| `DELETE` | `/api/records/:id` | Delete a record. |
| `POST` | `/api/records/validate/product` | Run product validation constraints. |

### Relationships (`/api/relationships`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/relationships` | Query relationships (`from_record_id`, `to_record_id`, type filters). |
| `POST` | `/api/relationships` | Create relationship edge. |
| `DELETE` | `/api/relationships/:id` | Delete relationship edge. |

### Domains (`/api/domains`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/domains` | List domains (`brand_id` query supported for compatibility). |
| `GET` | `/api/domains/resolve/:hostname` | Resolve hostname to domain/account mapping. |
| `GET` | `/api/domains/:id` | Get one domain. |
| `POST` | `/api/domains` | Create domain. |
| `PUT` | `/api/domains/:id` | Update domain. |
| `DELETE` | `/api/domains/:id` | Delete domain. |

## 3. Operational Surface

### Derivation (`/api/derive`)
- `GET /api/derive/:entitySlug`
- Optional query: `segment`, `domain_type`

### Builds (`/api/builds`)
- `GET /api/builds`
- `GET /api/builds/summary`
- `POST /api/builds/:entityId`

### Config and reseed
- `GET /api/config`
- `POST /api/reseed/preview`
- `POST /api/reseed/apply`

## 4. Architectural Constraint

The API contract stays reductionist:
1. Prefer extending record `type` + schema over adding new top-level CRUD endpoints.
2. Keep transport shapes shared and composable.
3. Treat specialized routes as operational projections over records, not alternate source-of-truth models.
