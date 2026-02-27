# Editor Architecture: The 3-View System

> Invariant: one editor state, multiple views.
> Goal: move between structural editing and visual tuning without changing data model.

## 1. The Three Views

### A. Forms-Only View (Data Lens)
- Location: `/dashboard`
- Focus: high-volume record and relationship editing.

### B. Sidebar Workbench (Hybrid Lens)
- Location: `/editor?mode=sidebar`
- Focus: visual preview plus precise controls.
- Layout: canvas on the left, controls on the right.

### C. Overlay HUD (Visual Lens)
- Location: `/editor?mode=overlay`
- Focus: fast visual iteration in-context.
- Layout: controls float over the live preview.

## 2. Shared State (Kernel)

```ts
interface EditorState {
  mode: 'forms' | 'sidebar' | 'overlay';
  selection: {
    recordId: string | null;
    componentId: string | null;
    fieldPath: string | null;
  };
}
```

Overlay access is gated by a separate system store flag:
- Store: `useSystemStore` (`zustand/persist`)
- Key: `system-storage`
- Flag: `state.isSandboxUnlocked`

## 3. Unlock and Persistence Behavior

### Unlocking
- Trigger: Konami sequence `ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowRight, ArrowLeft, ArrowDown, ArrowUp`
- Effect: sets `isSandboxUnlocked = true` in persisted client storage.
- Gate: `mode=overlay` remains blocked until unlocked.

### Persistence
- Unlock state persistence is client-only (browser storage).
- Content persistence is explicit: changes persist when Save flows call API routes.
- API writes remain the source of truth for records/pages/templates.

## 4. Deep Linking Contract

- Page to Forms: visual element actions deep-link to the owning record in dashboard context.
- Forms to Page: record actions deep-link to render context for visual verification.
