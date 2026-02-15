# RecordStruct Primitive

> **Canonical Definition**: The single atomic unit of storage in Oblio. Every entity, definition, and relationship is a `RecordStruct`.

## The Primitive

There are no tables. There are only Records.

```typescript
type RecordStruct = {
  // Identity
  idRecord: UUID;
  account_id: UUID; // Tenancy Boundary (Oblio itself is a Tenant)
  
  // Logic
  objectStruct: ObjectStruct;
  
  // Metadata
  created_at: ISO8601;
  updated_at: ISO8601;
  version: number;
}
```

### ObjectStruct
Defines "What kind of thing is this?" by pointing to a definition.

```typescript
type ObjectStruct = {
  // Recursion: Points to an Object Definition Record
  idRefObjectRecord: UUID; 
  
  // Data
  fieldGroupStructs: FieldGroupStruct[];
}
```

### FieldGroupStruct
Visual/Logical grouping of fields.

```typescript
type FieldGroupStruct = {
  // Recursion: Points to a FieldGroup Definition Record (Optional)
  idRefFieldGroupRecord?: UUID;
  nameFieldGroup: string; // Cache/Display
  
  // Data
  fieldStructs: FieldStruct[];
}
```

### FieldStruct
The actual data atom.

```typescript
type FieldStruct = {
  // Recursion: Points to a Field Definition Record
  idRefFieldRecord: UUID;
  nameField: string; // Cache/Display
  
  // Value(s)
  propertyStructs: PropertyStruct[];
}
```

### PropertyStruct
A value or an edge.

```typescript
type PropertyStruct = {
  // One of these must be populated based on Field Definition type
  value_string?: string;
  value_number?: number;
  value_bool?: boolean;
  value_datetime?: string;
  value_json?: any;
  
  // The Edge
  value_ref_record_id?: UUID; // Points to another idRecord
}
```

## Invariants

1.  **Universal Homogeneity**: A `Contact` is a RecordStruct. A `Product` is a RecordStruct. The definition of a `Contact` (ObjectDef) is *also* a RecordStruct.
2.  **Strict Recursion**: `idRefObjectRecord` and `idRefFieldRecord` MUST resolve to valid records in the same Tenant (or the upstream Tier 1 "Oblio" Tenant).
3.  **Data = Schema**: You cannot create a record without referencing its definition records. The schema is enforced at write time by checking these references.
