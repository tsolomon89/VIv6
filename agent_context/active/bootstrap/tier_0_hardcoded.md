# Tier 0: The Hardcoded Core

To solve the "Egg Problem" (how do you define a Field without a Field definition?), we hardcode the primitives.

> **Rule**: Tier 0 is Code. Everything else is Data.

## 1. The Bootstrap Dictionary
The following UUIDs and Slugs are constants in the codebase (`@pkg/constants`).

| Concept | Slug | Hardcoded UUID | Description |
| :--- | :--- | :--- | :--- |
| **ObjectDef** | `object_def` | `00000000-0000-0000-0000-000000000001` | Defines what an Object is. |
| **FieldDef** | `field_def` | `00000000-0000-0000-0000-000000000002` | Defines what a Field is. |
| **FieldGroup**| `field_group`| `00000000-0000-0000-0000-000000000003` | Defines visual grouping. |
| **Oblio** | `oblio_account`| `00000000-0000-0000-0000-000000000000` | The Root Tenant ID. |

## 2. The Universal Validations
The code must know how to validate specific data types without needing a database lookup.

- `string`: Any text.
- `number`: Any float/int.
- `bool`: True/False.
- `uuid`: Valid UUID v4.
- `datetime`: ISO 8601 string.
- `ref`: A UUID that exists in the `records` table.

## 3. The Bootstrapping Sequence
When the system starts fresh (empty DB):

1.  **Code Migration**: Insert the Tier 0 Records using the hardcoded IDs.
    - Create Record `...001` (ObjectDef) pointing to itself.
    - Create Record `...002` (FieldDef) pointing to `...001`.
2.  **Schema Loading**: The system reads these records into memory to "learn" what an Object and Field area.
3.  **Ready**: The system can now accept writes for new Types (e.g., "Contact").

## 4. The Loopback
The definition of `ObjectDef` is a Record that:
- Has ID: `...001`
- Points to ObjectDef ID: `...001` (It defines itself)
- Has Fields: `name`, `slug`, `fields` (which are defined by FieldDefs, which point back to ObjectDef).

This **Self-Referential Loop** is the mathematical foundation of the Homoiconic Store.
