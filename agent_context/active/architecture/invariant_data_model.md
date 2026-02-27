# Invariant Data Model: Typed EAV + Graph

> [!IMPORTANT]
> This document is the **Canonical Source of Truth** for the system's data architecture. It supersedes all previous EAV documentation.

## The Unifying Invariant
**A "relationship" is just a value whose type is "Record", and the field it sits under is the relationship label.**

The entire system collapses to this single idea. We do not have separate tables for "Entities" and "Relationships". We have **Records**, and some Fields on those Records point to other Records.

## 1. Core Taxonomy

### The Atom: RecordStruct
Everything is a `RecordStruct`.
- **Identity**: `idRecord` (UUID)
- **Type**: `objectStruct.typeObject` (runtime `ObjectType`) + `idRefObjectRecord` (Ref)
- **Content**: A collection of `FieldStructs` grouped by `FieldGroupStructs`.

### The Edge Label: FieldStruct
A `FieldStruct` defines a dimension or attribute of a Record.
- **Definition**: `idRefFieldRecord` points to the canonical Field definition.
- **Constraint**: `inputType` determines what values are valid.
    - If `inputType: "Record"`, this field is a **Relationship**.
- **Cardinality Authority**: `FieldDef.cardinality` (`single | multi`).

### The Edge Target: PropertyStruct
A `PropertyStruct` is the value at a specific coordinate (Record + Field).
- **Scalar Value**: `valueProperty` holds string/number/boolean data.
- **Reference Value**: If `inputType` is "Record", `valueProperty` (or nested `recordSnapshotStruct.idRefRecord`) holds the Target Record ID.

### API Record Payload (`RecordData`)
API/runtime payloads use:
- `fieldGroups[]`
- `fields[]`
- `values[]` (always an array)

Single-value fields still use `values[]` with one item. Cardinality is mapping/schema metadata, not payload shape.

> [!NOTE]
> **Ref vs Snapshot**:
> - **Reference (`idRef...`)**: The authoritative link. ALWAYS valid.
> - **Snapshot (`...SnapshotStruct`)**: A disposable, read-optimized cache of the target's state at write time. NEVER authoritative.

---

## 2. The Relationship Model

Relationships are **Typed Directed Edges** stored as properties.

**Structure:**
`(SourceRecord) --[Field]--> (TargetRecord)`

**Implementation:**
Inside `SourceRecord`:
```json
{
  "fieldStructs": [
    {
      "nameField": "Department",               // Edge Label
      "inputType": "Record",                  // Edge Type constraint
      "propertyStructs": [
        {
          "recordSnapshotStruct": {
            "idRefRecord": "rec-dept-001"     // Edge Target
          }
        }
      ]
    }
  ]
}
```

### Implicit Constraints
To avoid "graph soup", we enforce:
1.  **Field Existence**: You cannot assert an edge if the Field definition ("Department") does not exist.
2.  **Target Constraint**: (Future strict enforcement) A "Department" field should only accept records of type "Department". Currently enforced by convention.

---

## 3. The CSV Import Contract

To deterministically convert flat CSV data into this Graph, the CSV must be interpretable as a set of **(Source, Field, Target)** triples.

### The Contract
1.  **Determinism**: Re-importing the same CSV must produce the same Record IDs and Edges.
2.  **Explicit Traversal**: The CSV structure must explicitly state when context shifts from Parent to Child.
3.  **Reference Integrity**: Every target referenced must exist or be created in the same transaction.

### Mapping Logic
Given a hierarchical CSV row:
`| Dept Name | Rel: Job Title | Rel: Seniority |`

**Step 1: Identify Nodes**
- `Dept Name` -> **Source Node** (Type: Department, ID: `hash(Dept Name)`)
- `Job Title` -> **Target Node 1** (Type: Property/JobTitle, ID: `hash(Job Title)`)
- `Seniority` -> **Target Node 2** (Type: Property/Seniority, ID: `hash(Seniority)`)

**Step 2: Identify Edges**
- `Source` --[Has Job Title]--> `Target 1`
    - Implies existence of Field "Job Title" on "Department" object.
- `Target 1` --[Has Seniority]--> `Target 2`
    - Implies existence of Field "Seniority" on "Job Title" object.

### The Algorithm
For each row:
1.  **Resolve Source**: Find/Create the top-level Record.
2.  **Traverse Columns**:
    - If column is a simple attribute -> Add/Update `PropertyStruct` (Scalar).
    - If column implies nesting/relation ->
        a. Find/Create **Target Record**.
        b. Find **Field Definition** on Source that points to Target.
        c. Add/Update `PropertyStruct` (Reference) on Source pointing to Target.
        d. **Switch Context**: Target becomes new Source for subsequent nested columns.

---

## 4. Falsification Tests

A valid Oblio Data Model MUST pass these tests:

### Test 1: Edge Extraction
**Can you extract `(sourceId, fieldId, targetId)` triples using ONLY `idRef` fields?**
- If you need to parse strings or read snapshots to find edges, the model is broken.
- **Pass**: All relationships are explicit in `idRef` pointers.

### Test 2: Referential Integrity
**Does every `targetId` exist?**
- If a Property points to `rec-xyz`, `rec-xyz` must exist in the DB.
- **Pass**: No dangling pointers.

### Test 3: Schema Satisfaction
**Does the Field definition permit the edge?**
- If Source has edge `[Field A] -> Target`, does `Field A` definition exist?
- Is `Field A` inputType == "Record"?
- **Pass**: The graph obeys the type system.
