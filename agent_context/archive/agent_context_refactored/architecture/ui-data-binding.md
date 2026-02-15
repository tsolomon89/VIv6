# UI Data Binding Architecture (Records vs Structs)

> **Core Principle**: Data flows **down** (as Read-Only Structs), Actions flow **up**. Separate Database concerns (Row Mutations) from UI concerns (Render Props).

## The "Two-Layer" Data Model

The system enforces a strict separation between **Persistence Entities** (Database Records) and **UI Transfer Objects** (Structs).

| Layer | Type Suffix | Purpose | Mutability | Contains |
| :--- | :--- | :--- | :--- | :--- |
| **Database** | `*Record` | Fetching/Saving to SQLite. | Mutable (during write) | Raw SQL Columns, Foreign Keys |
| **UI/Component** | `*Struct` | Rendering, Props, Validation. | **Immutable** | Enriched/Derived Values, Nested Objects |

### Hierarchy

1.  **DataRecord** (DB Row)
    *   *Hydrates into* -> `RecordStruct`
2.  **RecordStruct** (Root Entity)
    *   Contains: `EntityProperties`
    *   Derives: `DisplayTitle`, `Slug`, `NavigationPath`
3.  **ComponentProps** (Leaf Nodes)
    *   Contains: Specific fields needed for a view (e.g., `CardProps`, `HeaderProps`)

## Data Flow Patterns

### 1. Fetch & Hydrate (Database -> UI)
**Pattern**: Hook -> API -> Zod Parse -> Component.

```typescript
// 1. Fetch Record
const { data: record, isLoading } = useRecord<AccountStruct>(accountId);

if (isLoading) return <Spinner />;

// 2. Pass to Component (Record is already a hydrated Struct)
return <AccountDashboard data={record} />;
```

### 2. Prop Drilling (Parent -> Child)
**Pattern**: Pass only the necessary slice of the Struct down.

*   `Page` receives `RecordStruct`.
*   `Card` receives `AccountSummaryStruct` (Subset).
*   `Form` receives `FormDefinition`.
*   `Input` receives `FieldDefinition` + `value`.

> **Why?** Prevents unnecessary re-renders and keeps components loosely coupled.

### 3. Updates (UI -> Database)
**Pattern**: Action -> Optimistic Update -> API Call.

1.  **Action**: User modifies a field.
2.  **Optimistic UI**: React State updates immediately.
3.  **API Call**: `updateRecord(id, { field: value })`.
    *   The API accepts partial updates (PATCH).
    *   The API returns the fresh `RecordStruct` to re-synchronize.

## Best Practices

1.  **NEVER pass Raw SQL Rows to Components**: They lack derived logic and type safety. Use Structs/Interfaces.
2.  **Navigation**: Pass IDs or Slugs, then fetch/select from cache. Do not pass massive objects in route state.
3.  **Null Safety**: Structs should guarantee existence of required UI fields (e.g., `displayName` falls back to `Untitled`).
4.  **Immutability**: UI Components treat data as Read-Only. Mutation happens via explicit `actions` (mutator functions).
