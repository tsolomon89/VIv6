# Oblio Data Model Specification

## Overview

Oblio is a **fact-oriented, self-describing data system** where schema and data share the same structure. There are no entity tables. Entities (Contact, Product, Activity, etc.) are **projections**—query patterns over a universal observation log.

The closest named paradigms:
- **Object-Role Modeling (ORM)** / Fact-Based Modeling (Terry Halpin)
- **Entity-Attribute-Value (EAV)** with hierarchical grouping
- **Triple Stores / RDF** with structured attribute clusters
- **Event Sourcing** where current state is derived from observations

**Core principle:** We don't model things. We model what we can say about things. A "Contact" doesn't exist as a record—it exists as the shadow cast by all observations that reference a particular email address.

---

## The Universal Structure

Everything in Oblio—whether it's a data record, a field definition, an object type definition, or a user account—shares the same shape:

```
RecordStruct
├── idRecord: String (immutable UUID)
└── ObjectStruct
    ├── idRefObjectRecord: String (points to the Object definition)
    ├── typeObject: String (cached name of the Object type)
    └── List<FieldGroupStruct>
        ├── idRefFieldGroupRecord: String (points to FieldGroup definition)
        ├── nameFieldGroup: String (cached name)
        └── List<FieldStruct>
            ├── idRefFieldRecord: String (points to Field definition)
            ├── nameField: String (cached name)
            ├── inputType: String (how to render/validate)
            ├── displayPosition: double
            ├── isSelectMany: bool
            ├── isSystem: bool
            └── List<PropertyStruct>
                ├── valueProperty: String (the actual value)
                └── recordSnapshotStruct: RecordSnapshotStruct (optional reference)
```

**Key insight:** The `idRef*` fields are pointers to other RecordStructs that define what this thing is. A FieldStruct with `idRefFieldRecord: "field-123"` points to a RecordStruct with `idRecord: "field-123"` that defines the field's name, type, validation rules, etc.

---

## The Recursive Self-Description

### Level 0: A Data Record (e.g., a specific Contact)

```
RecordStruct {
  idRecord: "rec-jane-001",
  objectStruct: {
    typeObject: "Contact",
    idRefObjectRecord: "obj-contact",      ← points to Contact definition
    fieldGroupStructs: [{
      idRefFieldGroupRecord: "fg-contact-core",
      nameFieldGroup: "Core",
      fieldStructs: [
        {
          idRefFieldRecord: "field-email",  ← points to Email field definition
          nameField: "email",
          inputType: "string",
          propertyStructs: [{ valueProperty: "jane@acme.com" }]
        },
        {
          idRefFieldRecord: "field-department",
          nameField: "department",
          inputType: "reference",
          propertyStructs: [{ valueProperty: "dept-marketing" }]
        }
      ]
    }]
  }
}
```

### Level 1: A Field Definition (what "email" means)

```
RecordStruct {
  idRecord: "field-email",
  objectStruct: {
    typeObject: "Field",
    idRefObjectRecord: "obj-field",        ← points to Field object definition
    fieldGroupStructs: [{
      fieldStructs: [
        { nameField: "name", propertyStructs: [{ valueProperty: "email" }] },
        { nameField: "inputType", propertyStructs: [{ valueProperty: "string" }] },
        { nameField: "isRequired", propertyStructs: [{ valueProperty: "true" }] },
        { nameField: "isUnique", propertyStructs: [{ valueProperty: "true" }] }
      ]
    }]
  }
}
```

### Level 2: An Object Definition (what "Contact" means)

```
RecordStruct {
  idRecord: "obj-contact",
  objectStruct: {
    typeObject: "Object",
    idRefObjectRecord: "obj-object",       ← points to Object object definition
    fieldGroupStructs: [{
      fieldStructs: [
        { nameField: "name", propertyStructs: [{ valueProperty: "Contact" }] },
        { nameField: "fields", propertyStructs: [
            { valueProperty: "field-email" },
            { valueProperty: "field-department" },
            { valueProperty: "field-seniority" }
        ]}
      ]
    }]
  }
}
```

### Level 3: The Meta-Object (what "Object" itself means)

```
RecordStruct {
  idRecord: "obj-object",
  objectStruct: {
    typeObject: "Object",
    idRefObjectRecord: "obj-object",       ← points to itself (fixed point)
    fieldGroupStructs: [{
      fieldStructs: [
        { nameField: "name", propertyStructs: [{ valueProperty: "Object" }] },
        { nameField: "fields", propertyStructs: [...] }
      ]
    }]
  }
}
```

**The recursion terminates** at a small set of meta-objects that reference themselves. These are Tier 0—the only things hardcoded in the system.

---

## Tier 0: The Hardcoded Seed

Tier 0 consists of:

1. **The struct shape itself** (Record → Object → FieldGroup → Field → Property)
2. **The meta-objects:**
   - `obj-object` — defines what an Object is
   - `obj-field` — defines what a Field is
   - `obj-fieldgroup` — defines what a FieldGroup is
3. **The tenancy dimension:** `account_id` as a system field on all records
4. **The query engine** that interprets this structure

Everything else—including what "Contact" means, what "Product" contains, what permissions "Admin" has—is configured by users and stored as RecordStructs.

---

## How "Entities" Work

**There are no entity tables.** What appears to be a "Contact" or "Product" is actually:

### Storage
A RecordStruct where `typeObject = "Contact"` (or whatever).

### Query
"Get all Contacts" = `SELECT * FROM records WHERE typeObject = 'Contact'`

### Projection
"Get Contact by email" = Find all records where any FieldStruct with `nameField = 'email'` has `propertyValue = 'jane@acme.com'`

### Aggregation
"Get all unique departments" = Collect distinct `propertyValue` from all FieldStructs where `idRefFieldRecord = 'field-department'`

---

## The Dimension Model

Every FieldStruct is a **dimension axis**. Every PropertyStruct is a **coordinate** on that axis.

| Concept | Maps To |
|---------|---------|
| Dimension Key | `nameField` (e.g., "email", "department", "verb") |
| Dimension Value | `valueProperty` (e.g., "jane@acme.com", "Marketing", "clicked") |
| Observation | A complete RecordStruct (a point in dimension-space) |
| Entity | A query filter (all observations sharing a coordinate) |

**An Activity is just a point in dimension-space:**

```
(timestamp=T, actor=A, subject=S, verb=V, object=O, source=X, ...)
```

**A Contact is a projection:** all observations where `actor` or `subject` equals a given email.

---

## Relationships / Edges

Relationships between "entities" are not a separate concept. They're PropertyStructs whose values reference other records.

```
FieldStruct {
  nameField: "account",
  inputType: "reference",
  propertyStructs: [{ 
    valueProperty: "rec-acme-001",           ← ID of another record
    recordSnapshotStruct: { ... }            ← optional cached snapshot
  }]
}
```

**"Contact belongs to Account"** = Contact record has a field "account" whose value is the Account record's ID.

**Graph traversal** = Follow `propertyValue` references from record to record.

---

## Multi-Tenancy

Every RecordStruct has a system-level `account_id` field. This is the tenancy boundary.

```
RecordStruct {
  idRecord: "...",
  account_id: "tenant-acme",               ← System field, always present
  objectStruct: { ... }
}
```

**Oblio itself** (the platform) is `account_id: "oblio-platform"`. The Tier 0 meta-objects and base field definitions live here.

**Client accounts** inherit definitions from Oblio (or override them) and store their own data records.

---

## Permissions Model

Permissions are also RecordStructs. A user's access is determined by:

1. Their `account_id` membership (what tenant they belong to)
2. Their role fields (department, seniority, job title)
3. Permission records that map role combinations to capabilities

```
RecordStruct {
  typeObject: "Permission",
  fieldGroupStructs: [{
    fieldStructs: [
      { nameField: "role_department", propertyStructs: [{ valueProperty: "Support" }] },
      { nameField: "role_seniority", propertyStructs: [{ valueProperty: "Senior" }] },
      { nameField: "can_view", propertyStructs: [{ valueProperty: "obj-contact" }] },
      { nameField: "can_edit", propertyStructs: [{ valueProperty: "obj-contact" }] }
    ]
  }]
}
```

**Permissions cascade:** If an Admin owns a record, they can grant access down. Override rules can restrict or expand access at lower levels.

---

## Read Patterns (Pivot Operations)

The same data can be read multiple ways by changing traversal order:

### Flat List
"All Contacts" → Filter by `typeObject = 'Contact'`, render each record.

### Grouped
"Contacts by Department" → Group records by the value of `field-department`.

### Pivot
"Departments (as entities)" → Collect unique values of `field-department`, treat each as an entity with its own aggregated properties.

### Meta-Pivot
"Dimension Keys" → List all unique `nameField` values across all records.

This is the "pivot table of pivot tables" concept. The data doesn't change—only the read context.

---

## Implementation Notes

### Storage
Can be document DB (Firestore, MongoDB), relational (Postgres with JSONB), or hybrid. The model is storage-agnostic.

### Indexing
Index on: `account_id`, `typeObject`, `idRefObjectRecord`, and commonly-queried `nameField` + `valueProperty` combinations.

### Caching
The `typeObject` and `nameField` strings are cached denormalizations. The source of truth is always the `idRef*` pointer to the definition record.

### Validation
At write time, resolve `idRefFieldRecord` to get field definition, validate `propertyValue` against `inputType` and any constraints.

---

## Summary

| Question | Answer |
|----------|--------|
| What's the primitive? | RecordStruct (the universal shape) |
| What's an entity? | A query pattern, not a table |
| What's a relationship? | A PropertyStruct referencing another record |
| What's schema? | RecordStructs with `typeObject = 'Object'` or `'Field'` |
| What's data? | RecordStructs with `typeObject = 'Contact'` or whatever |
| What's hardcoded? | The struct shape + meta-objects + tenancy + query engine |
| What's configured? | Everything else |

**The system is homoiconic:** Schema is data. Data is schema. They're the same shape, differentiated only by what they reference and how they're queried.

---

## Handoff Instructions for AI Collaborators

When working on Oblio:

1. **Never create entity-specific tables.** Everything is a RecordStruct.
2. **Always include `idRef*` pointers** to definition records.
3. **Treat "types" as data.** `typeObject = 'Contact'` is a filter, not a class.
4. **Remember the recursion.** Field definitions are records. Object definitions are records. They use the same structure.
5. **Tenancy is `account_id`.** Always filter by it.
6. **Permissions are records.** Query them like any other data.
7. **The only fixed point is Tier 0.** Don't hardcode anything else.

When in doubt, ask: "Is this a new record type, or a new RecordStruct with a different `typeObject` value?" The answer is almost always the latter.
