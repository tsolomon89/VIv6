# Dimension Value Entity Specification

> **Definition**: A controlled vocabulary item used for targeting and filtering. This is the **Backbone of Attribution**.

## Core Fields (SQL)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Immutable identifier. |
| `dimension` | String | The category (e.g., `companySize`). |
| `slug` | String | The URL-safe identifier (e.g., `smb`). |
| `label` | String | The human-readable name (e.g., "Small Business"). |
| `parent_id` | UUID | For hierarchical tagging (e.g., `Industry` -> `Sector`). |
| `account_id` | UUID | Owner. **NULL = Global (Oblio OS)**. Non-NULL = Tenant-specific extension. |

## The "No Free Text" Contract

Forms and Logic MUST NEVER use raw strings for these fields. They MUST use `DimensionValue.slug`.

### Valid Dimensions (Global)

| Dimension | Description | Examples |
| :--- | :--- | :--- |
| `companySize` | Firmographic scale. | `micro`, `smb`, `mid`, `enterprise` |
| `department` | Job function. | `marketing`, `sales`, `engineering`, `finance` |
| `seniority` | Job level. | `manager`, `director`, `vp`, `c-level` |
| `sector` | Broad industry group. | `healthcare`, `technology`, `manufacturing` |
| `industry` | Specific vertical (Subset of Sector). | `hospitals`, `saas`, `automotive` |
| `interest` | Behavioral topic. | `ai`, `security`, `analytics` |

## Data JSON Schema

```typescript
interface DimensionValueData {
    // For numeric ranges (used in filtering logic)
    rangeStart?: number;
    rangeEnd?: number;

    // Platform Mappings (for ad network API sync)
    linkedinLabel?: string;
    googleLabel?: string;
    facebookLabel?: string;

    // Display
    icon?: string;
    color?: string;
    order?: number;         // Sort order in UI
}
```

## Hierarchy Example

*   **Sector**: `Healthcare` (Parent)
    *   **Industry**: `Providers` (Child of Healthcare)
    *   **Industry**: `Payers` (Child of Healthcare)

**Logic**: Selecting `Providers` implies `Healthcare`. (Check Parent).

## Inheritance Model

*   **Tier 0 (Oblio OS)** defines the base taxonomy.
*   **Tier 1 (Customer)** can add *new* values to existing dimensions (e.g., a custom `department`).
*   **Tier 1 (Customer)** can override labels, but NOT slugs of global values (to preserve compatibility).
