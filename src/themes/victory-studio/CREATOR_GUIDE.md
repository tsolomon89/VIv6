# 🎛️ VI Studio: Creator & Debug Mode Manual

**Version 1.0** | **Internal Use Only**

This comprehensive guide details the **Creator Mode**, a production-grade visual editor embedded within the VI Studio application. It allows designers and developers to construct complex, scroll-reactive WebGL scenes directly in the browser without writing code.

---

## 📑 Table of Contents

1.  [Access & Security](#1-access--security)
2.  [Core Concept: The Scroll Timeline](#2-core-concept-the-scroll-timeline)
3.  [The Parameter System (Interaction Guide)](#3-the-parameter-system-interaction-guide)
4.  [Panel Reference: Scene Editor](#4-panel-reference-scene-editor)
5.  [Panel Reference: Backdrop (Storm)](#5-panel-reference-backdrop-storm)
6.  [Developer Workflow: Export & Integration](#6-developer-workflow-export--integration)
7.  [Troubleshooting](#7-troubleshooting)

---

## 1. Access & Security

The Creator Mode is hidden from the public interface. It uses a persistent "unlock" mechanism stored in the user's local storage.

### 🔐 Unlocking the Interface
To enable Creator Mode, enter the "Konami-style" sequence using your keyboard or touch gestures (swipes):

**Sequence:** `UP` `DOWN` `LEFT` `RIGHT` `RIGHT` `LEFT` `DOWN` `UP`

*   **Visual Confirmation:** The screen will flash **Yellow** upon success.
*   **Persistence:** Once unlocked, the mode remains available even after refreshing the page. A boolean flag `debug_unlocked = true` is stored in `localStorage`.

### 🎚️ Header Controls
Once unlocked, new controls appear in the top-right header:

| Icon | Name | Function |
| :--- | :--- | :--- |
| **Power** (`⏻`) | **Toggle Overlay** | Hides/Shows the UI panels without disabling the mode. Useful for viewing the design cleanly. |
| **Copy** (`📋`) | **Export Config** | Serializes the entire current state (Storm + Scene) to the clipboard as JSON. |

---

## 2. Core Concept: The Scroll Timeline

The visual engine is built around a **Scroll-Reactive Interpolation System**.

*   **The Hero Height**: In the Scene Editor panel, the "Hero Height" slider (default: 1500px) defines the vertical distance the user must scroll to transition from **0%** (Start) to **100%** (End) of the animation.
*   **The Timeline**:
    *   **Scroll 0px**: All parameters use their `value` (Primary Handle).
    *   **Scroll [HeroHeight]px**: All parameters use their `endValue` (Secondary Handle).
    *   **Between**: Values are linearly interpolated.

> **💡 Pro Tip:** To create a "Zoom Out" effect, set the **Scale** Start Value to `300` and the End Value to `100`. As the user scrolls down, the object will appear to recede.

---

## 3. The Parameter System (Interaction Guide)

Standard sliders are static. Creator Mode sliders are **dynamic** and **programmable**.

### 🖱️ Controls & Shortcuts

| Interaction | Action | Description |
| :--- | :--- | :--- |
| **Click / Drag** | **Set Start Value** | Adjusts the baseline value. This is the value seen when at the top of the page. |
| **Shift + Click** | **Set End Value** | Creates or moves the "Ghost Handle". This is the target value when scrolled down. |
| **Click Link Icon** | **Link/Unlink** | **Crucial:** Interpolation only happens if the Link (`🔗`) is active (Blue). If unlinked, the End Value is ignored. |
| **Click Arrows** | **Swap Values** | Instantly reverses the animation direction (Start ↔ End). |
| **Click 'X'** | **Delete End** | Removes the End Value and disables linking. |
| **Click Number** | **Manual Input** | Click the digital value to type a precise number. Press `Enter` to commit. |

### 🧠 Mental Model
Think of every parameter as a timeline track.
*   **Left Handle**: Time = 0
*   **Right Handle**: Time = 1
*   **Slider Bar**: Shows the range of motion.
*   **Blue Fill**: Indicates the parameter is active (Linked).

---

## 4. Panel Reference: Scene Editor

This panel controls the **Prism Engine** (OGL), which renders the geometric shapes.

### 👁️ View Modes
*   **Single Mode**: Isolates a single object configuration. Changes here **do not** affect the main scene. Use this as a scratchpad or material lab.
*   **Multi Mode**: The actual scene composition. Objects are layered on top of each other.

### 🎛️ Parameters Dictionary

#### **Geometry**
*   **Shape**: The primitive topology (`Tetrahedron`, `Cube`, `Sphere`, `Cylinder`, `Toroid`, `Column`).
*   **Scale**: The overall size of the object.
*   **Height / Base Width**: Deforms the aspect ratio of the mesh (e.g., stretching a sphere into an oval, or a cube into a pillar).

#### **Appearance (Shaders)**
*   **Glow**: The intensity of the internal emissive light.
*   **Bloom**: The strength of the post-processing glow halo.
*   **Noise**: Adds film grain to the shader (useful for "retro" or "hologram" looks).
*   **Hue Shift**: Rotates the color spectrum of the object. Link this to scroll for rainbow cycling effects.
*   **Color Freq**: Controls how many "bands" of color appear on the object. High frequency = many stripes.
*   **Rainbow**: Increases chromatic aberration (RGB split) at the edges.
*   **Density**: Controls the refractive index. Lower density looks more ethereal/ghostly.
*   **Opacity**: Global alpha transparency.

#### **Motion**
*   **Time Scale**: Speed of the idle animation. Set to `0` for completely frozen objects.
*   **Hover Strength**: (Only in `Hover` mode) How much the object tilts in response to the mouse.
*   **Inertia**: (Only in `Hover` mode) The weight of the object. Lower values = lazier, smoother movement.

#### **Position**
*   **Offset X/Y**: 2D screen-space position. `0,0` is center.

---

## 5. Panel Reference: Backdrop (Storm)

This panel controls the **Storm Engine** (Three.js), a separate layer that renders the procedural clouds and lightning.

### 🌩️ Lightning Controls
*   **Strike Intensity**: How bright the screen flashes when lightning strikes.
*   **Frequency**: How often strikes occur.
*   **Bolt Width / Glow**: Visual thickness of the arcs.
*   **Zigzag**: How jagged the lightning path is. `0` is straight, `2` is chaotic.
*   **Depth**: Adds parallax depth to the bolts.

### ☁️ Atmosphere Controls
*   **Cloudiness**: Density of the background fog.
*   **Speed**: How fast the "wind" blows the clouds.
*   **Hue**: The base color tint of the sky (0-360 degrees).

---

## 6. Developer Workflow: Export & Integration

The Creator Mode is a "No-Code" frontend for the application's configuration state. To make changes permanent in the codebase:

### Step 1: Export
1.  Configure your scene to perfection.
2.  Click the **Copy** (`📋`) button in the header.
3.  The JSON payload is now in your clipboard.

### Step 2: Implementation
Open `App.tsx`. You will need to replace the default state initializers with values from your JSON.

**A. Updating Single Mode Defaults**
Locate `DEFAULT_CONFIG`.
```typescript
const DEFAULT_CONFIG: ConfigState = {
  // ... Paste relevant fields from JSON "singleConfig"
};
```

**B. Updating The Scene (Multi Mode)**
Locate `getInitialSceneObjects`.
```typescript
const getInitialSceneObjects = (): SceneObject[] => {
  // Replace the array content with JSON "sceneObjects"
  return [
    // ... object 1
    // ... object 2
  ];
};
```

**C. Updating Storm Defaults**
Locate `DEFAULT_STORM_CONFIG`.
```typescript
const DEFAULT_STORM_CONFIG: StormConfigState = {
  // ... Paste relevant fields from JSON "stormConfig"
};
```

**D. Updating Global Settings**
Update `useState` initializers for `scrollPixels` or `stormEnabled` if those changed.

---

## 7. Troubleshooting

**Q: I entered the code but nothing happened.**
*   Ensure the browser window has focus. Click anywhere on the page and try again.
*   The code is speed-sensitive. Try entering it at a moderate, steady pace.

**Q: My "End Value" isn't working.**
*   Check the **Link Icon**. It must be active (Blue).
*   Ensure you have scrolled down. The End Value only applies when `Scroll Progress > 0`.

**Q: Performance is dropping (FPS < 30).**
*   **High Cloudiness** combined with **High Prism Density** is computationally expensive.
*   Reduce **Noise** (Grain) as it requires per-pixel calculation.
*   Reduce **Object Count** in the Multi-Scene.

**Q: The Copy button didn't work.**
*   Ensure you have clipboard permissions enabled in your browser.
*   Check the console (F12) for any serialization errors.

---
*© 2024 VI Studio. Proprietary & Confidential.*
