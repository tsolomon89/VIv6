# Build & Seed Engines

The platform utilizes scripted engines to handle database priming and static asset generation, bypassing traditional runtime Server-Side Rendering (SSR).

## 1. The Seed Engine (`src/scripts/seed_from_data.ts`)

Instead of migrating databases via incremental Up/Down scripts, the system's Core Logic is defined entirely as seeded Records. The `seedFromData` orchestrator performs a unified ingestion:
1.  **Records & Domains**: Loads JSON states and inserts them.
2.  **Taxonomy & Logic**: Triggers sub-seeders for Pipelines (`seed_pipeline_config`), AI (`seed_ai`), Taxonomies (`seed_taxonomy`), and Presets.
3.  **Homoiconicity**: Because Pipelines, Rules, and Visual Templates are just database `records`, the seeding process literally programs the application physics without changing Javascript code.

## 2. The Build Engine (`src/build/generate.ts`)

The system separates its backend API from its presentation layer using Static Site Generation (SSG).
1.  **Data Assembly**: For every active `Record` attached to a Brand, it retrieves the `assemblePageContext`.
2.  **Template Resolution**: Determines the layout structure by matching `subject_target` in `page_templates`.
3.  **Hydration Payload**: Generates a massive JSON object representing the page state.
4.  **Injection**: It reads the compiled React app (`themes/victory-studio/dist/index.html`) and injects the JSON payload into an inline script tag (`<script id="vi-config">...`).
5.  **Output**: It writes the HTML to `dist/{brand}/...`. When a browser loads this static HTML, it instantly boots React with the injected state, resulting in a perfectly statically generated site that operates as a Single Page Application (SPA).
