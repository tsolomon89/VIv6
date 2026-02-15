# Schema as Data (Homoiconicity)

In Oblio, the schema is not defined in code or SQL DDL. It is defined in **Data Records**.

> **Principle**: The system is self-describing. To understand a record, you must read the *Definition Records* it references.

## The Meta-Objects

To bootstrap the system, we define a set of "Meta-Objects" (Tier 0). These are the only concepts that must exist for the system to start.

| Object Name | Description |
| :--- | :--- |
| **ObjectDef** | A record that defines a Type (e.g., "Contact", "Product"). |
| **FieldDef** | A record that defines an Attribute (e.g., "email", "price"). |
| **FieldGroupDef** | A record that defines a Grouping (e.g., "Contact Info"). |

### 1. Object Definition Record (`ObjectDef`)
A `RecordStruct` whose `idRefObjectRecord` points to the **ObjectDef** meta-record.

**Key Fields:**
- `name` (string): e.g., "Contact"
- `slug` (string): e.g., "contact"
- `fields` (ref[]): List of References to `FieldDef` records.
- `extends` (ref): Optional inheritance (Tier 2 inherits from Tier 1).

### 2. Field Definition Record (`FieldDef`)
A `RecordStruct` whose `idRefObjectRecord` points to the **FieldDef** meta-record.

**Key Fields:**
- `name` (string): Internal key (e.g., "primary_email")
- `label` (string): UI Label (e.g., "Primary Email")
- `data_type` (enum): `string`, `number`, `bool`, `date`, `ref`, `json`
- `cardinality` (enum): `single`, `multi`
- `ref_target` (ref): If `data_type == ref`, points to the Allowed `ObjectDef` record (e.g., "Must point to an Account").

## Validation Logic

Because Schema is Data, validation is a **Read-Check-Write** process:

1.  **Write Request**: User sends a `RecordStruct`.
2.  **Resolution**: System reads `idRefObjectRecord`.
3.  **Schema Fetch**: System loads the referenced Definition Record.
4.  **Field Check**:
    - For each `FieldStruct` in the input:
        - Resolve `idRefFieldRecord`.
        - Verify `data_type` matches the `PropertyStruct` value used.
        - Verify `cardinality` (e.g., don't allow 2 values if single).
        - If `ref`: Verify the target ID exists and is of the allowed Type.
5.  **Commit**: Save the record.

## Evolution of Schema

Since schema is just data:
- **Adding a Field**: Create a new `FieldDef` record, add its reference to the `ObjectDef`'s fields list.
- **Renaming**: Update the `label` on the `FieldDef` record.
- **Deprecation**: Remove the reference from `ObjectDef`. Old data remains but is "orphaned" from the standpoint of new writes.
