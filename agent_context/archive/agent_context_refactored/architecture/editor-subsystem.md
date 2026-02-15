# Editor Subsystem Architecture

> **Unifying Invariant**: There is **one editor** for one underlying registry. The UI exposes that editor through **three synchronized views** (lenses), which share the same operations and state.

## The Three Views

These are not separate tools; they are different layouts for the same engine.

### 1. Forms-only View (Registry CRUD)
*   **Purpose**: Structural precision. High density.
*   **Location**: `/dashboard`
*   **Behavior**: Full CRUD over entity types, fields, and records.
*   **Primary Use**: Setting up data models, configuring logic, bulk editing.
*   **Linkage**: "Preview on Page" -> Jumps to Sidebar/Overlay.

### 2. Sidebar Workbench View
*   **Purpose**: Visual tuning & responsive testing.
*   **Location**: `/` (with `editorMode="sidebar"`)
*   **Layout**:
    *   **Left**: Rendered page inside a responsive wrapper (simulated viewport).
    *   **Right**: Forms/controls for the currently selected component.
*   **Behavior**: Clicking an element on the simulated page selects it in the specific form.
*   **Linkage**: "Open in Forms" -> Deep links to Dashboard.

### 3. Overlay HUD View
*   **Purpose**: Fast, in-context copy/content tweaks.
*   **Location**: `/` (with `editorMode="overlay"`)
*   **Behavior**: Floating controls on top of the live page.
*   **Linkage**: "Expand to Sidebar" -> Switches layout.

## Environment Behavior

The Editor UI is the same code in all environments, but its **persistence** capability changes.

| Environment | Persistence | Unlock Method | Notes |
| :--- | :--- | :--- | :--- |
| **Hosted (Public)** | **Sandbox** (Session only) | Konami Code | Edits are lost on refresh. No DB writes. |
| **Local/Staging** | **Persistent** (DB Writes) | Konami Code / Login | "Save" commits changes to Backend. |

## Shared State Contract

All views share a global "Selection Context":
1.  **Current Route**: Which page is being viewed.
2.  **Active Template**: Which template renders the page.
3.  **Selected Component ID**: Which specific block is active.
4.  **Bound Record**: Which data record is populating the component.

### Deep Linking Contract
*   `?editId={UUID}`: Opens the editor focused on that specific entity.
*   `?editorMode={sidebar|overlay}`: Sets the view mode.
