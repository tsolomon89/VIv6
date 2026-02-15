# Product Catalog: The Graph Projection

> **Shift**: We previously thought of "Products" and "Features" as database tables.
> **Correction**: They are **Nodes** in a semantic graph, stored as `RecordStructs`.

## The Ontology
The Product Catalog is a set of linked records derived from activity.

### 1. Product (The Container)
A purchasable unit.
- **ObjectDef**: `product`
- **Fields**: `name`, `pricing_model`, `sku`

### 2. Feature (The Capability)
A specific functional unit.
- **ObjectDef**: `feature`
- **Fields**: `technical_spec`, `flag_key`

### 3. Solution (The Value)
The "Why".
- **ObjectDef**: `solution`
- **Fields**: `pain_point`, `benefit`

### 4. Use Case (The Context)
The specific application.
- **ObjectDef**: `use_case`
- **Fields**: `industry_match`, `persona_match`

## The Derivation Chain (Inventory Graph)
The relationship between entities is **derived** through a specific chain of dependency:

`Product` -> `has_feature` -> `Feature` -> `delivers` -> `Solution` -> `applies_to` -> `UseCase`

1.  **Product uses Features**: A SKU bundles capabilities.
2.  **Feature delivers Solution**: A capability solves a problem (e.g., "Reporting Engine" -> "Prove ROI").
3.  **Solution applies to Use Case**: A value prop targets a context (e.g., "Prove ROI" -> "Marketing Team").

> **Generative Trigger**: This chain is the input for the **Generative Grammar**.
> The system iterates through `Feature x Solution x Persona` to generate Assets automatically (as defined in `logic/workflow_engine.md`).

- `Product` has a multi-ref field `features` pointing to `Feature` records.
- `Feature` has a multi-ref field `delivers_to` pointing to `Solution` records.
- `Solution` has a multi-ref field `targets` pointing to `Persona` records.

## Pivot Views
Because these are standard records, we can "Pivot" the catalog:

1.  **Product Manager View**:
    - Rows: Products
    - Cols: Features
    - Cell: Active/Beta

2.  **Sales View**:
    - Rows: Solutions
    - Cols: Buyer Personas
    - Cell: "Pitch Deck Asset" (Ref to Asset record)

## Entitlements
Entitlements are calculated by traversing the graph.
1.  **Account** purchases **Product**.
2.  **Product** contains **Features**.
3.  Therefore, **Account** has access to **Features**.
4.  Middleware checks: `Does Account -> Product -> Feature(Reporting) exist?`

No separate "Entitlements Table" is needed. It is a graph query.
