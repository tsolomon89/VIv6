# Inventory Graph Logic

> **Definition**: The Inventory Graph defines how **Products** are composed of **Features**, which deliver **Solutions** to specific **Use Cases**. This graph drives page generation and navigation structure.

## The Derivation Chain

The relationship between entities is **derived** through a specific chain of dependency:

`Product` -> `has_feature` -> `Feature` -> `delivers` -> `Solution` -> `applies_to` -> `UseCase`

### 1. Product (The Offer)
*   **Definition**: A purchasable item (SKU).
*   **Edge**: `has_feature`
*   **Clarification**: A Product *uses* Features to deliver value.

### 2. Feature (The Capability)
*   **Definition**: A functional component or capability.
*   **Edge**: `delivers`
*   **Clarification**: Features are the "What". Solutions are the "Why".
*   **Shared**: The same Feature (e.g., "Reporting Engine") can be used by multiple Products.

### 3. Solution (The Outcome)
*   **Definition**: A bundled value proposition (e.g., "Prove ROI").
*   **Edge**: `applies_to`
*   **Clarification**: Solutions map Features to tangible business outcomes.
*   **Explicit Edge**: Products now explicitly list `solutionIds` to indicate which outcomes they *emphasize*, filtering the theoretical set derived from Features.

### 4. Use Case (The Context)
*   **Definition**: A specific application (e.g., "Marketing Team proving ROI").
*   **Edge**: None (Leaf node).
*   **Clarification**: Derived by intersecting a Solution with a Persona/Industry.

## Edge Schemas

### Product -> Feature
*   **Relation**: Many-to-Many.
*   **Fields**: `is_highlight` (Boolean) - show on pricing page?

### Feature -> Solution
*   **Relation**: Many-to-Many.
*   **Fields**: `impact_score` (1-100) - how much does this feature contribute?

### Solution -> Use Case
*   **Relation**: Many-to-Many.
*   **Fields**: `relevance` (High/Med/Low).

## Page Generation Consequences

The `PageBuilder` uses this graph to generate pages:
1.  **Product Page**: Lists linked Features and emphasized Solutions.
2.  **Solution Page**: Lists Features that deliver it and Products that include it.
3.  **Use Case Page**: Lists Solutions applicable to that context.
