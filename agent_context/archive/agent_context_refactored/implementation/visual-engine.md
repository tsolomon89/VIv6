# Visual Engine & Creator Mode

> **Concept**: A production-grade visual editor embedded in the runtime. It allows designers to tweak WebGL scenes and interaction timelines without code.

## Access & Security

*   **Mechanism**: "Developer Activation Sequence" (Hidden UI Trigger).
*   **Persistence**: Sets `debug_unlocked = true` in transparent storage (e.g. `localStorage`).
*   **UI**: Reveals header controls (Power, Export) only when unlocked.

## The Scroll Timeline Architecture

The engine uses a generalized **Scroll-Reactive Interpolation System**. 

### Core Concepts

1.  **Timeline Source**: The driver of progress.
    *   *Global Scroll*: Window scroll position.
    *   *Element Scroll*: Scroll position of a specific container.
    *   *Viewport Intersection*: How much of an element is visible (0.0 to 1.0).

2.  **Interpolation Range**:
    *   **Input Domain**: `[Start Trigger, End Trigger]` (e.g., `0px` to `500px`).
    *   **Output Range**: `[Start Value, End Value]` (e.g., `Opacity 0` to `Opacity 1`).

3.  **Easing & Physics**:
    *   Values are not just linear. They support easing curves (`ease-in`, `ease-out`, `spring`).

### Data Model (The Contract)

Instead of hardcoded "Hero Height", the engine consumes **Scroll Bindings**:

```typescript
type ScrollBinding = {
  targetProperty: string; // e.g., "camera.position.y" or "opacity"
  source: "window" | "element";
  keyframes: {
    triggerPoint: number; // 0.0 to 1.0 (percent of range) or pixel value
    value: any;
  }[];
  interpolation: "linear" | "bezier" | "spring";
}
```

## The Storm Engine (Background Layer)

A procedural WebGL layer behind the main scene, managing atmospheric effects.

*   **Logic**: Procedural generation based on seeded noise.
*   **State Vector**: A set of normalized float parameters (0.0 - 1.0) controlling the scene.
    *   `cloud_density`: Volumetric fog density.
    *   `energy_intensity`: Frequency and amplitude of dynamic elements (e.g., lightning).
    *   `atmosphere_hue`: Base color rotation.

## Developer Workflow

1.  **Edit**: Tweak parameters in the **Sidebar Workbench** or **Overlay HUD**.
2.  **Export**: Serialize the current state vector to JSON.
3.  **Persist**: Save to the `ThemeConfig` entity in the database (or code config for global defaults).
