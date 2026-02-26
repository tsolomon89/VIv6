# UI Contract: Records vs Structs

> **Principle**: The Database speaks "Fact". The UI speaks "Struct".
> **Flow**: Data hydrates Down. Actions flow Up.

## 1. The Type Hierarchy

### A. The Storage Primitive (`*Record`)
*   **Format**: JSON-serializable `RecordStruct` (ID, refID, FieldGroups).
*   **Use Case**: API Responses, Database Rows, Caching.
*   **Nature**: Normalized, Reference-heavy.

### B. The Application Struct (`*Struct`)
*   **Format**: TypeScript Interface with resolved types.
*   **Use Case**: React Props, Computation.
*   **Nature**: Denormalized, Read-Only, Hydrated.

**Example Transformation**:
```typescript
// Storage (Record)
{
  "id": "rec-123",
  "fields": [ { "name": "owner", "ref": "user-456" } ]
}

// UI (Struct)
{
  id: "rec-123",
  owner: { id: "user-456", name: "Jane Doe", avatar: "..." } // Hydrated!
}
```

## 2. Binding Rules

1.  **Immutable Props**: Components NEVER mutate their props.
    - ❌ `props.user.name = "Bob"`
    - ✅ `updateAction(props.user.id, { name: "Bob" })`

2.  **Nullable by Default**: The UI must handle "Loading" or "Missing" states gracefully.
    - `Reference` fields might trigger a fetch. The Struct should handle the `loading` state or providing a skeleton.

3.  **No SQL in UI**: Components should define their data requirements via **Fragments** or **Selectors**, never raw queries.

## 3. Optimistic UI Contract
Since the backend is an Event Log (Async), the UI MUST be Optimistic.
1.  **User Action**: "Archive Contact".
2.  **Local State**: Mark Contact as `archived` in Store.
3.  **Network**: Send `ActivityType=Archive`.
4.  **Reconciliation**: If Event fails, revert Local State and toast Error.

## 4. Canonical Implementation: The Dual-Head Architecture

> **Reality**: The system uses an **Assembler Pattern**, not a runtime Hydration Layer.

### A. The Writer: Strict Schema (MCP)
- **Location**: `src/mcp/server.ts` & `src/core/schema/validation.ts`
- **Role**: Enforces the `FieldGroup` structure when data is *written* to the database.
- **Principle**: "Garbage Out, Quality In".

### B. The Reader: Flattened Structs (Assembler)
- **Location**: `src/build/assembler.ts`
- **Role**: Flattens the complex `Entity` structure into simple Key-Value pairs for the UI.
- **Function**: `Reader.project(data: EntityData): Record<string, any>`

### C. The Visual Bridge
- **Location**: `src/ui/src/features/VisualEditor/Bridge.ts`
- **Role**: Connects the iframe (Canvas) to the Editor shell, passing these flattened structs.
