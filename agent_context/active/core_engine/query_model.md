# Query Model: Pivots and Projections

Because there are no tables, SQL `SELECT * FROM contacts` does not exist.
Instead, we query the **Fact Store** using strict primitives.

## 1. The Fact Store View
Logically, the database is a massive list of Triples/Quadruples:
`(AccountID, RecordID, FieldDefID, Value)`

## 2. Query Primitives

### A. Selection (The "Type" Filter)
All queries start by narrowing the search space to a specific **Object Definition**.

```sql
-- Pseudo-logic
SELECT * FROM records 
WHERE account_id = :tenant 
AND object_struct.idRefObjectRecord = :contact_def_id
```

### B. Filtering (The "Where" Clause)
Filtering requires joining against the Definition ID.

```sql
-- "Find Contact where email = 'jane@prop.com'"
SELECT r.* 
FROM records r
JOIN field_values fv ON r.id = fv.record_id
WHERE fv.field_def_id = :email_field_id
AND fv.value_string = 'jane@prop.com'
```

### C. Graph Traversal (The "Reference" Join)
Edges are just fields with type `ref`.

```sql
-- "Find all Contacts belonging to Account X"
SELECT r.*
FROM records r
JOIN field_values fv ON r.id = fv.record_id
WHERE fv.field_def_id = :membership_field_id
AND fv.value_ref = :account_x_id
```

## 3. The Pivot (Aggregation)
The "Pivot Table" is the primary analytical lens. It groups records by the values of specific FieldDefs.

> **Operation**: `Pivot(ObjectDef, [RowDimensionFields], [ColumnDimensionFields], Metric)`

Example: **"Count Contacts by Department and Seniority"**
- **Object**: Contact
- **Rows**: FieldDef(Department)
- **Cols**: FieldDef(Seniority)
- **Metric**: Count(ID)

## 4. The Meta-Pivot (Reflection)
The system can query its own structure.

> **Operation**: `MetaPivot(ObjectDef)`

Returns: "What Fields defined on this Object have usage?"
- Used to dynamically build UI tables.
- "Show me all columns available for 'Contact'." -> Query `ObjectDef` -> Get List of `FieldDef`s -> Render Table Headers.

## 5. Indexed Projections (Performance)
While the logical model is EAV, the physical implementation MUST use **Inverted Indexes** (`record_values` table) to make these lookups O(1) or O(log n).

- Index: `(account_id, field_def_id, value_ref)` -> Fast Graph Traversal
- Index: `(account_id, field_def_id, value_string)` -> Fast Filtering
