# Targeting & Attribution Workflow

> **Contract**: The URL is the source of truth for attribution.
> **Fact Store Mapping**: URL segments map to `DimensionKey` and `DimensionValue` records.

## URL Structure

The URL encodes the targeting context which resolves to Dimension Coordinates:

`{domain}/{resource}/{slug}/{segment}`

| Part | Description | Fact Store Equivalent |
| :--- | :--- | :--- |
| `resource` | The Object Type (plural). | `ObjectDef.slug` (e.g., `products`) |
| `slug` | The Entity Identifier. | `Record.slug` (e.g., `marketing-automation`) |
| `segment` | The Targeting Filter. | `DimensionValue.slug` (e.g., `healthcare`) |

## Attribution Parsing

When a page loads, the Client must resolve the "Context Coordinates":

1.  **Extract `segment`**: e.g., `healthcare`.
2.  **Lookup DimensionValue**: Query `records` where `type=DimensionValue` AND `slug=healthcare`.
    - Result: `rec-dim-healthcare` (which points to `DimensionKey: Sector`).
3.  **Infer Context**:
    - `Sector` = `Healthcare`.
    - `Persona` = `Decision Maker` (Implicit Default).
    - `OppType` = `B2B` (Implicit Default).

## Lead Capture (The Collapse)

When a form is submitted, we record an **Activity** that collapses the ephemeral URL context into a permanent Fact.

1.  **Form Data**: `{ email: 'user@hospital.com', name: 'Dr. Smith' }`
2.  **Context Data** (derived from URL):
    - `source_url`: `/products/marketing-automation/healthcare`
    - `dimension_refs`: [`rec-dim-healthcare`, `rec-prod-marketing`]
3.  **Entity Resolution (Write Logic)**:
    - **Step 1**: Find/Create `Contact` (`email=user@hospital.com`).
    - **Step 2**: Create `Activity` (`type='FormSubmit'`):
        - `actor`: `rec-contact-drsmith`
        - `dimensions`: [`rec-dim-healthcare`]
    - **Step 3**: The "Opportunity" is a projection of this Activity.

## Validation (No Free Text)
The `segment` in the URL MUST resolve to a `DimensionValue` record.
- `/products/crm/healthcare` -> Valid (Record exists).
- `/products/crm/unknown-stuff` -> Invalid (Record not found). Fallback to generic.
