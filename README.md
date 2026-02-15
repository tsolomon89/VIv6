# Victory Initiative v5 (Keimenon)

**The Schema-Driven Website Generator.**

This project allows you to manage a knowledge graph of Entities (Products, Features, Brands) and generate a static, performant website from them using data-driven templates.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+
- NPM

### 2. Installation
```bash
npm install
```

### 3. Running the Admin UI
Start the local development environment (API, MCP Server, and UI):
```bash
# Terminal 1: API Server
npx tsx src/api/server.ts

# Terminal 2: Admin UI
cd src/ui && npm run dev
```
Access the UI at `http://localhost:5173`.

### 4. Managing Content
1.  Go to **Entities** in the Admin UI.
2.  Create or Edit entities (Brands, Products, Features).
3.  Set relationships (e.g., Brand "Offers" Product).
4.  The system uses these relationships to determine page layouts.

### 5. Building the Site
Generate the static website to the `dist/` folder:

**Standard Build (All Pages)**:
```bash
npm run build
```

**Brand-Scoped Build (Recommended for Production)**:
Target a specific brand (e.g., `oblio`) to generate a clean, brand-specific output directory:
```bash
npm run build:brand -- --brand=oblio
```
Output: `dist/oblio/oblio/index.html`

### 6. Previewing
Preview the built site locally:
```bash
npx serve dist
```

## 🛠 Architecture

- **Core (`src/core`)**: SQLite database logic, Entity/Relationship CRUD.
- **API (`src/api`)**: Express REST API connecting UI to Core.
- **UI (`src/ui`)**: React Admin Interface for content management.
- **Build (`src/build`)**: One-way static generator that compiles DB -> HTML.
- **Templates (`src/templates`)**: Handlebars templates (`.hbs`) for the build output.
- **MCP (`src/mcp`)**: AI Agent tools (`create_entity`, `link_entities`) for Cursor/Claude integration.

## 📦 Deployment

1.  Run `npm run build`.
2.  Run `npm run zip` (if configured) or simply drag `dist/` to Netlify/Surge.
