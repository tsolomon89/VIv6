# Page Generation Workflow

> **Contract**: Page generation is deterministic. `Entity Graph` + `Templates` = `Website`.

## The Derivation Pipeline

## The Build Pipeline (Phase 1)
1.  **Input**: Entity Graph (SQLite) + Templates (`src/templates/`) + Assets (`content/`).
2.  **Process**:
    *   `derivePage(slug)`: Traverses graph, selects templates, binds data.
    *   `generateContent()`: AI fills missing text (if draft).
3.  **Output**: Static JSON files in `dist/sites/{domain}/`.
4.  **Routing**: `site-manifest.json` maps domains to account IDs.

## Template Binding

Templates use "Bindings" to find data.

*   `self.name` -> The Entity's name.
*   `self.data.price` -> The Entity's price.
*   `related.feature.many` -> Find all Entities linked with `relationship_type='has_feature'`.
*   `related.solution.one` -> Find a single linked Solution.

**Constraint**: If a Binding cannot be resolved (e.g., `related.feature` requested but none exist), the section MUST perform a "Collapsing Fold" (render nothing, occupy zero height).

## Static Generation (SSG)

The build process (`npm run build`) freezes this state into HTML/JS.

*   **Trigger**: `npm run build` or `Entity Update` (in incremental builds).
*   **Output**: `dist/` folder ready for CDN.
*   **Performance**: Zero DB hits at runtime for page content.

## Dynamic Personalization

While the HTML is static, the *content* can be filtered client-side based on URL Attribution.

*   **Scenario**: User visits `/products/crm/healthcare`.
*   **Static**: The page contains *all* CRM case studies.
*   **Dynamic**: The client-side JS detects `segment='healthcare'` and hides non-Healthcare case studies.
*   **Fallback**: If JS fails, show generic content.
