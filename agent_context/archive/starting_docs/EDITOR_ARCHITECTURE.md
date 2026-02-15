# Editor Architecture Specification

## Unifying Invariant
There is **one editor** for one underlying registry (entity types, fields, records, templates). The UI exposes that editor through **three synchronized views** (three lenses, same underlying operations and state):

1.  **Forms-only View (Registry CRUD)**
2.  **Sidebar Workbench (Page + Forms Column + Responsive Wrapper)**
3.  **Overlay HUD (Controls on top of live rendered page)**

These are not separate tools. They are the same tool with different layouts.

---

## 1. Environment Behavior (Sandbox vs Persistence)
The editor UI exists in both environments; **only persistence changes**.

### Hosted/Public Front-end
*   **Unlock**: Konami code unlocks editor UI.
*   **State**: Editing is allowed, but **no DB persistence exists**. Changes are **sandbox/session-only** (refresh resets).
*   **Save Action**: Disabled or "Export draft" (non-persistent).

### Local/Staging (Backend Running)
*   **Unlock**: Konami code unlocks the same editor UI.
*   **State**: "Save" is enabled and **writes to DB**.
*   **Indicator**: UI must explicitly show "Connected" vs "Sandbox" status.

---

## 2. Konami Code Behavior
*   Konami code is a **UI unlock** (reveals tools), not a guarantee of persistence.
*   After unlock, user can switch between the three views without leaving the page context.

---

## 3. The Three Views

### 1) Forms-only View (Registry CRUD)
**Purpose**: Structural and precise editing.
**Location**: `/dashboard` (currently)
**Behavior**:
*   Full CRUD over entity types, field groups, records, templates, and relationships.
*   **Action**: "Preview / Locate on page" (jump into Sidebar/Overlay focused on where it renders).
*   **Status**: First-class workflow lane, not a fallback.

### 2) Sidebar Workbench View
**Purpose**: Visual tuning with structured controls and responsive testing.
**Location**: `/` (with `editorMode="sidebar"`)
**Layout**:
*   **Left**: Rendered page inside a responsive wrapper (simulated viewport).
*   **Right**: Forms/controls for selected section/component.
**Behavior**:
*   Clicking element on page -> Updates shared selection.
*   Right column shows forms for target (Component params, Template params, Bound records).
*   **Action**: "Open in Forms-only" (deep-link to Dashboard).

### 3) Overlay HUD View
**Purpose**: Fast in-context tweaks.
**Location**: `/` (with `editorMode="overlay"`)
**Behavior**:
*   Editor UI overlays on top of live page (full width).
*   Selection updates shared state.
*   **Action**: "Expand to Sidebar" (Switch to Workbench).
*   **Action**: "Open in Forms-only" (deep-link to Dashboard).
*   Edits update preview immediately.

---

## 4. Shared Integration Contract

### Shared Selection State (Global)
There is a single "currently editing" context:
*   Current Page/Route
*   Active Template
*   Selected Section/Component ID
*   Bound Record(s) (e.g., specific Product ID)

### Bidirectional Deep-Linking
*   **Page → Forms**: "Open in Forms" lands on the *exact* record/field in Dashboard.
*   **Forms → Page**: "Locate on page" focuses local usage.

### Live Preview Sync
*   Forms-only edits -> Update Preview (Sidebar/Overlay).
*   Overlay/Sidebar edits -> Update Forms-only values.

