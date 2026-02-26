# Webbuilder and Presentation Engine

The VI v5 (Oblio) system features a split architecture for its presentation layer: a persistent Record state backend, and a decoupled React-based Theme frontend (`victory-studio`). The Bridge connects the two during editing, while the Generator compiles them for production.

## 1. Visual Editor Architecture

The Visual Editor is composed of two primary environments communicating via window messages:
*   **The Editor Shell**: The surrounding React application containing toolbars, layer panels, and configuration controls.
*   **The Canvas (`Canvas.tsx`)**: An `iframe` rendering the actual Theme / Website loaded with the current Record's context.

### The Bridge (`Bridge.ts`)
Communication across the iframe boundary is handled by the `Bridge` class.
- **Handshake**: The Editor initiates a `handshake` event when the iframe loads.
- **Events**: Passes events like `select`, `hover`, `update-content`, and `set-theme` back and forth. 
- **Decoupling**: The Canvas operates entirely unaware of the Editor's DOM, allowing the Theme to run in perfect isolation (matching its production environment).

## 2. Page & Section Templates

Visual presentation configurations are stored within the SQLite database, not hardcoded.
- **Section Templates (`section_templates`)**: Defines individual visual building blocks (e.g., `hero.default.v1`).
- **Page Templates (`page_templates`)**: Defines how sections compose a layout for a specific `subject_target` (e.g., `product`, `article`).

## 3. The Generator Engine (`src/build/generate.ts`)

The generator converts dynamic EAV Records into flat, static HTML/JS bundles.

### Template Resolution
When building a page for a Record, the engine resolves which Template to use:
1.  **Specific Match**: Checks for a template keyed as `{entity.slug}-home`.
2.  **Generic Match**: Falls back to a template where `subject_target === entity.type`.

### Hydration via Injection
Instead of Server-Side Rendering (SSR) the React components in Node, the Generator uses a **Static Hydration** approach:
1.  It reads the pre-built `index.html` from the React Theme (`themes/victory-studio/dist`).
2.  It maps the Record's fields and the chosen Page Template into a `Payload` object.
3.  It injects this object as a global script tag: `<script id="vi-config">window.VI_CONFIG = {...}</script>`.
4.  When the browser loads the static HTML, the React Theme boots up, reads `window.VI_CONFIG`, and hydrates the layout dynamically on the client.

### Legacy Fallback
If the React Theme is missing, the Generator has a fallback engine that uses Handlebars (`.hbs`) templates to stitch together static HTML strings, though this is considered legacy.
