# API Contract: The REST Interface

> **Invariant**: The API is the *only* way to mutate State.
> **Architecture**: Resource-Oriented (REST-ish) over HTTP/1.1.

## 1. Core Principles

### A. Resource-Oriented
We expose **Nouns** (Entities, Relationships), not Verbs (RPC).
- ❌ `POST /api/save-product`
- ✅ `PUT /api/entities/:id`

### B. Idempotency First
The API is designed for **Replayability**. All mutations support Idempotency Keys or Deterministic IDs.
- **Header**: `Idempotency-Key` (Optional).
- **Behavior**: If you send the same payload twice, the second request returns `200 OK` (not `201 Created`) with `_idempotency: 'skipped' | 'updated'`.

### C. The "Fat" Payload
Read/Write operations use the **Full Record** structure.
- **Input**: Validated against `Schema` (e.g., `EntityInputSchema`).
- **Output**: The exact stored record, plus metadata (`created_at`, `_idempotency`).

## 2. Global Standards

### Authentication
- **Mechanism**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <token>`
- **Scope**: Token defines `TenantID` and `Role`.

### Response Envelope
Success is raw JSON. Errors follow RFC 7807 (Problem Details).
```json
// Error
{
  "error": "Entity not found",
  "status": 404,
  "code": "ERR_NOT_FOUND" // Optional
}
```

## 3. Resource Endpoints

### Entities (`/api/entities`)
The core CRUD for the Fact Store.

| Method | Endpoint | payload | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | `?type=Product&brandId=...` | List entities. Filter by Type/Tenant. |
| `GET` | `/:id` | - | Get by **ID** (`ent_...`) or **Slug**. |
| `POST` | `/` | `EntityInput` | Create a new Entity. |
| `PUT` | `/:id` | `EntityUpdate` | Update an existing Entity. |
| `DELETE` | `/:id` | - | Hard delete an Entity. |

**EntityInput Schema**:
```typescript
{
  type: string;        // "Product", "Feature"
  slug: string;        // URL-safe unique key
  attributes: Record;  // The data payload
  brandId?: string;    // Tenant Context
}
```

### Relationships (`/api/relationships`)
The Edges in the Product Graph.

| Method | Endpoint | Payload | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | `?from=ent_1` | List edges. |
| `POST` | `/` | `{ from, to, type }` | Create/Connect two Entities. |
| `DELETE` | `/:id` | - | Remove a connection. |

### Domains (`/api/domains`)
Tenant Identity and Routing Logic.

| Method | Endpoint | Payload | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | `?brand_id=...` | List domains for a tenant. |
| `GET` | `/resolve/:hostname` | - | Public endpoint to resolve `host` -> `Tenant`. |
| `POST` | `/` | `{ hostname, brand_id }` | Register a new domain. |

### Configuration (`/api/config`)
System-level metadata and singleton settings.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Get global configuration (Feature Flags, Limits). |
| `PUT` | `/` | Update global settings (Admin only). |

## 4. Operational Endpoints

### Derivation (`/api/derive`)
Triggers the "Page Compiler" to generate static assets from Records.

- `POST /api/derive/all`: Rebuild the entire site.
- `POST /api/derive/:id`: Rebuild specific Entity dependencies.

### Builds (`/api/builds`)
Access to the Build Artifacts and Status.

- `GET /`: List recent builds.
- `GET /:id/logs`: Stream build logs.

### Reseed (`/api/reseed`)
**Danger Zone**. Wipes and restores data.
- `GET /`: Check seed status.
- `POST /`: Trigger a reseed from `seed_content.ts`.
