# Editor Architecture: The 3-View System

> **Invariant**: One Editor. One State. Three Views.
> **Goal**: Seamless transition from "Data Entry" to "Visual Tuning".

## 1. The Three Views
These are not separate apps. They are different *Lenses* on the same Registry.

### A. Forms-Only View (The Data Lens)
- **Location**: `/dashboard`
- **Focus**: Structural integrity, relationships, high-volume entry.
- **UI**: Tables, Forms, JSON Editors.
- **Use Case**: "I need to fix the SEO tags on 50 products."

### B. Sidebar Workbench (The Hybrid Lens)
- **Location**: `/` (with `editorMode="sidebar"`)
- **Focus**: Visual context with precise control.
- **Layout**:
    - **Left**: Responsive IFrame (The "Page").
    - **Right**: Attribute Sidebar (The "Form").
- **Use Case**: "I want to see how this headline looks on Mobile while editing the text."

### C. Overlay HUD (The Visual Lens)
- **Location**: `/` (with `editorMode="overlay"`)
- **Focus**: Immersion and fast tweaks.
- **Layout**: UI controls float *over* the live page.
- **Use Case**: "I want to tweak the spacing of this hero section."

## 2. Shared State (The Kernel)
All three views share a single Global Selection State:

```typescript
interface EditorState {
  mode: 'forms' | 'sidebar' | 'overlay';
  selection: {
    recordId: string | null;      // The Active Record
    componentId: string | null;   // The UI Component
    fieldPath: string | null;     // The specific field being edited
  };
  context: {
    route: string;                // Current Page URL
    environment: 'sandbox' | 'live';
  };
}
```

## 3. Environment Behavior

### Hosted / Public (Sandbox)
-### 3.1 Unlocking the Environment
Use the Konami Code: `↑ ↓ ← → → ← ↓ ↑`.
This toggles `localStorage.setItem('viv5_sandbox_unlocked', 'true')` and reveals the "Editor Overlay" button in the standard shell.
- **Persistence**: **None**.
- **Storage**: Browser LocalStorage / Session Memory.
- **Action**: "Export JSON" (to manually copy to codebase).

### Local / Staging (Live)
- **Unlock**: Auto-detects `localhost` or Auth Token.
- **Persistence**: **Real-Time**.
- **Storage**: Writes directly to `Process.db` via API.
- **Action**: "Save" / "Publish".

## 4. Deep Linking Contract
- **Page -> Forms**: Clicking "Edit in Dashboard" on a visual element deep-links to the exact Record ID in the Dashboard.
- **Forms -> Page**: Clicking "Locate" on a Record deep-links to the Page URL where that record is rendered, scrolling it into view.
