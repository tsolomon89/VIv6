# UI Contract: Record Data Flow

> **Principle**: Storage uses `RecordStruct`; API/runtime uses `RecordData`; UI renders projected views.

## 1. Canonical Data Shapes

### Storage Primitive
- `RecordStruct` is the canonical persisted/hydrated structure.
- Relationships are fields with `inputType = "Record"` and reference values.

### API/Runtime Payload
- `DataRecord.type` is `ObjectType`.
- `DataRecord.data` is `RecordData`.
- `RecordData` shape is always:
  - `fieldGroups[]`
  - `fields[]`
  - `values[]` (always array)

### Cardinality
- Cardinality is mapping/schema data (`FieldDef.cardinality: single | multi`).
- Payload shape does not switch between `value` and `values`.

## 2. Boundary Rules

1. Writers may receive legacy single `value` input, but must normalize to `values[]` before persistence.
2. Readers must emit canonical `values[]` payloads.
3. UI components must treat field values as arrays and apply cardinality behavior from mapping metadata.

## 3. Runtime Modules

- Normalization and cardinality enforcement: `src/core/record_data.ts`
- API schema boundary: `src/api/schemas.ts`
- Core schema validation boundary: `src/core/schema/validation.ts`
- Record CRUD service boundary: `src/modules/content/services.ts`
