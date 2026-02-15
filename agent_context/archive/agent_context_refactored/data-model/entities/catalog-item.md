# Catalog Item Entity Specification

> **Definition**: A Catalog Item is a generic content node stored in the `entities` table. It represents **Entitlements** (Services/Access) rather than physical inventory.

## Core Fields (SQL)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Immutable identifier. |
| `slug` | String | Unique within the owning Account. |
| `type` | Enum | `product`, `feature`, `solution`, `useCase`, `asset`. |
| `name` | String | Display name. |
| `summary` | String | Short description (meta description). |
| `description` | Markdown | Long form content. |

> **Graph Logic**: For the rules governing relationships (Products -> Features -> Solutions), see [Inventory Graph Logic](../../logic/inventory-graph.md).

## Data JSON Schema by Type

### Product (`type='product'`)

**Definition**: A purchasable **Service Definition**. It defines the "Container" of value that an Account can subscribe to.

```typescript
interface ProductData {
  // The 'Opp Type' this product supports
  product_type: 'B2B' | 'B2C' | 'PRT' | 'RES' | 'HUM' | 'SUP' | 'INV' | 'AFF';
  
  // Commercial Model (Service Retainer / SaaS)
  pricing?: {
    value: number;
    currency: string;      // 'GBP', 'USD'
    frequency: string;     // 'Monthly', 'Annually', 'OneTime'
    model: string;         // 'PerSeat', 'FlatRate', 'Retainer'
  };

  // Persona Targeting (The "Who is this for?" logic)
  personas?: {
    [key in 'DM' | 'EU' | 'IN']: {
      companySize?: string[];    // ['smb', 'mid']
      department?: string[];     // ['marketing']
      seniority?: string[];      // ['director', 'vp']
      sector?: string[];         // ['healthcare']
    }
  };
}
```

### Feature (`type='feature'`)

**Definition**: A functional capability or **Entitlement**.
*   *Example*: "Reporting Engine" (A software feature) or "Monthly Strategy Call" (A service entitlement).

```typescript
interface FeatureData {
  is_beta?: boolean;
  technical_specs?: Record<string, string>;
  
  // Entitlement Limits
  // e.g. "Up to 5 Users", "Unlimited Storage"
  entitlement?: {
      metric: string;
      limit: number | 'unlimited';
  };
}

> **Open Question**: The *runtime enforcement* of these limits (Middleware vs Application Logic) is currently undefined. See [Runtime Gaps](../../60_open_questions/runtime_gaps.md).
```

### Solution (`type='solution'`)

**Definition**: A bundled value proposition. Describes *how* a set of Features solves a business problem.

```typescript
interface SolutionData {
  target_audience?: string;
  pain_points?: string[];
  benefits?: string[];
}
```

### Use Case (`type='useCase'`)

**Definition**: A specific application context. Typically defined by `Use Case = Persona Field + Solution`.

```typescript
interface UseCaseData {
  context?: string;
  industry_focus?: string; // e.g., 'Healthcare'
}
```

### Asset (`type='asset'`)

**Definition**: A piece of content or media used in Campaigns.

```typescript
interface AssetData {
  // Content
  headline?: string;
  content?: string;        // Markdown content
  url?: string;            // External URL

  // Classification
  asset_type: 'page' | 'article' | 'post' | 'ad' | 'email' | 'image' | 'video' | 'document';
  
  // Placement & Attribution
  source?: string;         // Placement URL (Google, Facebook)
  
  // Versioning
  version?: string;        // Active version
  ab_test_group?: string;  // 'A' or 'B'
  
  metadata?: {
    mime_type?: string;
    width?: number;
    height?: number;
    duration?: number;
  };
}
```

## Standard Relationships

Using `entity_relationships`:

*   **Product** `has_feature` **Feature**
*   **Feature** `delivers` **Solution**
*   **Solution** `applies_to` **UseCase**
*   **Campaign** `uses_asset` **Asset** (via Asset Group logic)

## URL Derivation

Catalog items automatically map to URLs:
`/{type}s/{slug}` -> `/products/attribution-engine`
