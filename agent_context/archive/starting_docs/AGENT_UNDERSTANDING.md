# AGENT_UNDERSTANDING.md — My Interpretation of Victory Initiative

**Date**: 2026-01-30
**Authored By**: Antigravity (Agent)

---

## 1. What We Are Building
We are building **Victory Initiative v5 (Keimenon)**, a programmatic website generator. 

It reverses the traditional web development model:
*   **Traditional**: Manually design pages → Fill with content.
*   **VIv5**: Define **Entities** (Products, Features, Solutions) → The system **derives** the pages, routes, and content structure automatically.

**The "North Star":** I should be able to add a new "Product" entity, and the system immediately generates a high-fidelity landing page, updates the navigation, and links related "Feature" pages—all without me touching a site builder.

---

## 2. Core Philosophy
My work is guided by these non-negotiable principles:

### A. URL = Attribution
The URL is not just an address; it is the tracking data.
*   `domain.com/products/attribution-engine` implicitly means:
    *   **Persona**: Decision Maker (DM)
    *   **Funnel Stage**: MQL
    *   **Channel**: Website
    *   **Entity**: Product > Attribution Engine
We do not use UTM parameters on internal links; the URL structure *is* the signal.

### B. No Free Text
We do not allow unstructured input in lead capture forms.
*   **Why**: Free text creates undiagnosable funnel leaks.
*   **Instead**: Users select from structured taxonomies (Sector, Role, Company Size) which map directly to our **Personas**.
*   **Benefit**: We know exactly *why* a lead matched (or didn't match) a specific product.

### C. Universal Primitives (The "No Bespoke Code" Rule)
We avoid writing custom React components for specific content (e.g., "OblioNewsItem").
*   **Instead**: We use generic configuration atoms: `div`, `text`, `list`, `card`, `tile`.
*   **Proof**: I recently verified this by refactoring the "Oblio" brand to use only these primitives, achieving the exact same high-fidelity design without custom code.

---

## 3. Current Status
We are deep in **Phase 1: MVP**.

**What is Done:**
*   ✅ **Core Data Layer**: SQLite schema for Entities and Relationships.
*   ✅ **Build Engine**: `generate.ts` can compile the Entity Graph into a static React app.
*   ✅ **Theme Engine**: `victory-studio` (React) renders `window.VI_CONFIG` payloads.
*   ✅ **Proof of Concept**: The "Oblio" brand integration proved we can ship a complex, interactive 3D site using this architecture.

**What is Missing (The Gap):**
*   ❌ **Markdown Ingestion**: We cannot yet drop a `.md` file to create a Blog or Doc page (`TASK_006`).
*   ❌ **Content Constraints**: We are not yet enforcing character limits or providing AI re-writing tools in the Admin UI (`TASK_007`).

---

## 4. My Role
I am the lead engineer and architect for this implementation.
*   I analyze the `agent_context` docs to align with the vision.
*   I write the Core Functions (`src/core`) to power the backend.
*   I implement the Build Pipeline (`src/build`).
*   **Crucially**: I am connecting the existing, high-fidelity UI from `old-builder` to this new Data Layer. I am not rewriting the frontend; I am giving it a brain (Database + API).
*   I act as the "AI Operator" of this system, using MCP capabilities to fill out forms, rewrite content, and adjust styles as requested.

## 5. The End Goal
Success is achieved when you can:
1.  Run `npm run db:seed` to populate a brand.
2.  Run `npm run build` to generate the site.
3.  Upload `dist/` to a host.
4.  Have a fully functional, attributed, high-performance website that looks like a custom hand-coded masterpiece but was entirely generated from structured data.

---

*This document represents my active operating context provided by the `NORTH_STAR.md` and `GLOSSARY.md` files.*
