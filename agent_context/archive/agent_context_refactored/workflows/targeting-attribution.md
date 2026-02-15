# Targeting & Attribution Workflow

> **Contract**: The URL is the source of truth for attribution. We do not trust Cookies or LocalStorage over the URL.

## URL Structure

The URL encodes the targeting context:

`{domain}/{resource}/{slug}/{segment}`

| Part | Description | Example |
| :--- | :--- | :--- |
| `resource` | The Entity Type (plural). | `products` |
| `slug` | The Entity ID. | `marketing-automation` |
| `segment` | The Targeting Filter. | `healthcare` |

## Attribution Parsing

When a page loads:

1.  **Extract `segment`**: e.g., `healthcare`.
2.  **Lookup DimensionValue**: Is `healthcare` valid? Yes -> `sector`.
3.  **Infer Context**:
    *   `sector` = `Healthcare`.
    *   `persona_type` = `DM` (Decision Maker) (Default for Product pages).
    *   `opp_type` = `B2B` (Default for Product pages).

## Lead Capture

When a form is submitted:

1.  **Form Data**: `{ email: 'user@hospital.com', name: 'Dr. Smith' }`
2.  **Attribution Data**:
    *   `source_url`: `/products/marketing-automation/healthcare`
    *   `sector`: `Healthcare` (Derived from URL)
    *   `product_interest`: `Marketing Automation` (Derived from URL)
3.  **Entity Resolution**:
    *   Find/Create Contact (`user@hospital.com`).
    *   Create Activity (`FormSubmit`).
    *   Create Opportunity (`B2B`, `Healthcare`, `Marketing Automation`).

## No Free Text

The `segment` in the URL MUST match a `DimensionValue.slug`.
*   `/products/crm/healthcare` -> Valid (`healthcare` exists).
*   `/products/crm/amazing-stuff` -> Invalid (Ignore segment, treat as generic).
