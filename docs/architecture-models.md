# Architecture Models

The core data structures of VI v5 (Oblio) revolve around an **EAV (Entity-Attribute-Value)** / Homoiconic Record architecture.

## 1. Identity & Tenancy (`users` / `accounts`)
- **[MUST]** All users MUST authenticate.
- **[MUST]** Accounts act as logical partitions for data. A user belongs to one or more Accounts.
- **[SHOULD]** Prefer attaching commercial logic (Opportunity/Pipeline) over direct User-to-User interactions.

## 2. Universal Schema (`records`)
The `records` table is the universal persistent store. Instead of separate SQL tables for Products, Opportunities, and Assets, all are `Records`.

- **Type (`type`)**: E.g., `product`, `opportunity`, `activity`, `object_def`.
- **Content State (`data`)**: JSON. Historically a loose map, currently being migrated to strict `UniversalRecordData`.
- **References**: Managed through `record_relationships` table (handling Many-to-Many).

### The EAV Hierarchy

```mermaid
graph TD;
    R[RecordStruct] --> O[ObjectStruct]
    O --> FG[FieldGroupStruct]
    FG --> F[FieldStruct]
    F --> P[PropertyStruct]
    P --> Ref[RecordSnapshotStruct (Optional)]
```

- **RecordStruct**: The instantiated data container holding fields.
- **ObjectStruct**: Points to an `object_def` Record.
- **FieldGroupStruct**: Logical grouping of fields.
- **FieldStruct**: The definition of the field (name, input rules). Connects to a `field_def` Record.
- **PropertyStruct**: The scalar value itself.

## 3. Database Decisions
- **[Decision]**: Uses `better-sqlite3`. The `data` property of Records leverages JSON functions in SQL statements (`json_extract`).
- **[Resolution Test]**: Do NOT create new SQL tables for new business logic types; instead, seed a new `object_def` and use `records`. The only exception is infrastructure systems (e.g., `domains`, `ai_credentials`).
