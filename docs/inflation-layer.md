# The Inflation Layer (EAV Hydration)

In a strict EAV (Entity-Attribute-Value) architecture, querying records can become highly complex and unreadable for UI components. To solve this, the system implements an "Inflation" and "Projection" layer utilizing the `UniversalRecordData` type.

## 1. UniversalRecordData
The system allows Records to be ingested sequentially as flat JSON objects (`Record<string, any>`). To enforce constraints without mutating the underlying data unpredictably, the database stores this flat JSON.

## 2. Inflation (`inflateRecord`)
When the system needs to rigorously evaluate or validate a record (e.g., in `src/modules/content/seeding.ts`), it "inflates" the JSON into the canonical `RecordStruct` hierarchy:
1.  **Lookups**: It queries the `object_def` matching the entity type.
2.  **Mapping**: It maps JSON keys to `FieldStruct` definitions.
3.  **Instantiation**: It constructs `PropertyStruct` containers for values.

## 3. Projection (`Reader.project`)
Conversely, when shipping data to the Frontend via the API, the structured EAV `RecordStruct` is too verbose.
- The `Reader` contract (`src/contracts/Reader.ts`) exposes methods to project a complex `RecordStruct` or legacy JSON back into a flat, UI-consumable object.
- It compresses `RecordStruct -> ObjectStruct -> FieldGroupStructs -> FieldStructs -> PropertyStructs` directly down into key-value pairs (e.g., `{ name: "Product A", price: 100 }`).

**[MUST]** 
Direct mutation of `UniversalRecordData` within the database SHOULD occur in flat JSON, while business logic requiring type-safety or schema-awareness MUST inflate the record first. UI components MUST rely on Projected (flat) data.
