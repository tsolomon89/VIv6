# Oblio Seed System & Field Group Specification

> [!IMPORTANT]
> This document outlines the **current mechanism** of the seed system and the **required data structure** to enable explicit Field Groups. Use this specification to prepare your seed data.

## 1. System Overview

- **Location**: `data/seeds/`
- **Primary Loader**: `src/scripts/seed_from_data.ts`
- **Logic Module**: `src/modules/content/seeding.ts`
- **Schema Definition**: `data/seeds/tier_1_schema/definitions.json`

> [!NOTE]
> `src/scripts/seed_oblio.ts` is a separate, specialized script for seeding **CMS Content** (Brand Config, Templates) and does not use the general `inflateRecord` loader.


The system follows a **Homoiconic** principle: Object Definitions (`object_def`) and Field Definitions (`field_def`) are themselves Records stored in the database.

## 2. Current Behavior ("The Flattener")

Currently, the seeding logic (`inflateRecord`) **does not support multiple field groups**. It processes input data by:
1.  Taking all keys in the `data` object.
2.  Converting each key into a `FieldStruct`.
3.  Placing all fields into a single, hardcoded `FieldGroupStruct` named **"General"**.

### Current `definitions.json` Example
```json
{
    "type": "object_def",
    "slug": "contact",
    "data": { 
        "fields": [ ...list of field defs... ] 
    }
}
/* 
Result: 
- Group: "General"
  - Field: "fields" (Value: The list of definitions)
*/
```

## 3. Target Specification for Field Groups

To support explicit Field Groups (as supported by the API contract in `src/api/schemas.ts`), you must structure your seed definition as follows.

> [!NOTE]
> The seeding script (`src/modules/content/seeding.ts`) will need to be updated to recognize this structure.

### Required JSON Structure

Instead of a flat `fields` array, use a `fieldGroups` array in the `data` property.

```json
{
  "type": "object_def",
  "slug": "contact",
  "name": "Contact",
  "summary": "Individual people and stakeholders",
  "data": {
    "fieldGroups": [
      {
        "name": "General",
        "fields": [
          { "name": "Email", "type": "email", "required": true },
          { "name": "Phone", "type": "phone" }
        ]
      },
      {
        "name": "Profile",
        "fields": [
          { "name": "First Name", "type": "text" },
          { "name": "Last Name", "type": "text" },
          { "name": "Job Title", "type": "text" },
          { "name": "Department", "type": "dimension", "dimension": "department" }
        ]
      },
      {
        "name": "System",
        "fields": [
          { "name": "Owner", "type": "ref", "ref_target": "user" },
          { "name": "Created By", "type": "ref", "ref_target": "user" }
        ]
      }
    ]
  }
}
```

## 4. Implementation Checklist

To make this specification functional, the following changes are required in the codebase:

1.  **Update Ingestor (`src/modules/content/seeding.ts`)**:
    - Modify `inflateRecord` to check for `data.fieldGroups`.
    - If found, map each group to a `FieldGroupStruct`.
    - Retrieve or create `field_group` records for each group name.

2.  **Update UI Config (`src/ui/src/features/Studio/config/studio-config.ts`)**:
    - The `RecordDetailView` currently uses **hardcoded** card configurations (`RECORD_DETAIL_CONFIG`).
    - Adding Field Groups to the seed **will not automatically show them** in the UI until `studio-config.ts` is updated to include cards for the new groups (or the UI is refactored to render groups dynamically from the schema).

## 5. Field Types Reference

When defining fields in the `fields` array, use these supported types:

| Type | Description |
| :--- | :--- |
| `text` | Single line text |
| `textarea` | Multi-line text |
| `number` | Integer or Float |
| `currency` | Monetary value |
| `date` | Date picker |
| `boolean` | Checkbox / Toggle |
| `email` | Email validation |
| `phone` | Phone validation |
| `url` | Link validation |
| `select` | Dropdown (requires `options`) |
| `multiselect` | Multi-select (requires `options`) |
| `dimension` | Taxonomy reference (requires `dimension` slug) |
| `ref` | Reference to another Record (requires `ref_target` slug) |
