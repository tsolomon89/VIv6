# Theme System: The Bridge Architecture

> **Concept**: The "Visual Editor" is a Host Shell that manipulates a sandboxed Guest Theme.
> **Isolation**: The Theme runs in an IFrame to ensure CSS/JS Safety.

## 1. The Architecture

### Host (Editor Shell)
- **Location**: `src/ui`
- **Role**: State Manager, Persistence, UI Controls.
- **Protocol**: Sends `ConfigState` to the IFrame.

### Guest (Theme)
- **Location**: `src/themes/victory-studio`
- **Role**: Renderer (React/WebGL), Interaction Handler.
- **Protocol**: Receives `ConfigState`, emits `SelectionEvents`.

## 2. The Bridge Protocol

Communication occurs via the `postMessage` API, wrapped in a `Bridge` class.

### Message Envelope
```typescript
interface EditorMessage<T> {
  type: EditorEventType;
  payload: T;
  source: 'editor' | 'canvas';
}
```

### Event Lifecycle

#### A. Initialization (Handshake)
1.  **Load**: Editor loads Theme IFrame.
2.  **Ping**: Editor sends `handshake`.
3.  **Ack**: Theme responds `handshake-ack`, confirming readiness.

#### B. State Hydration (Downstream)
1.  **Change**: User slides a slider in Editor.
2.  **Send**: Editor sends `update-content` with full `ConfigState` (or partial).
3.  **Render**: Theme React Tree re-renders immediately.

#### C. Selection (Upstream)
1.  **Click**: User clicks a Component in the Theme.
2.  **Send**: Theme sends `select` payload:
    ```typescript
    {
       recordId: "rec-123",
       componentId: "hero-section"
    }
    ```
3.  **React**: Editor selects the corresponding Record in the Sidebar.

## 3. Theme Requirements

To be compatible with the Visual Editor, a Theme MUST:

1.  **Listen**: Subscribe to `window.message`.
2.  **Render**: Accept standard `ConfigState` objects (defined in types).
3.  **Identify**: Mark DOM elements with `data-id` for localized selection highlighting.

## 4. The Render Policy
Themes are **Pure Functions** of their Props (`ConfigState`).
- ❌ Internal `useState` for content (Forbidden).
- ✅ Internal `useState` for animation/hover (Allowed).
