# VI Studio - Interactive WebGL Experience

VI Studio is a high-performance, interactive WebGL application built with React, OGL, and Three.js. It features a sophisticated visual synthesizer that generates 3D prism geometries and atmospheric storm effects, all reactive to user scroll interactions and mouse movements.

## 🚀 Features

- **Dual Render Engines**:
  - **Prism Engine (OGL)**: A lightweight WebGL context dedicated to rendering geometric primitives (Tetrahedrons, Spheres, Toroids) with refractive, glow, and bloom properties.
  - **Storm Engine (Three.js)**: A procedural shader-based background generating volumetric clouds and dynamic lightning strikes.
- **Reactive Scroll System**: Visual parameters can be linked to scroll depth, interpolating values in real-time as the user navigates the hero section.
- **Performance First**: Optimized shaders, offscreen suspension, and efficient state management to maintain 60FPS.
- **Creator Mode**: An embedded, production-grade visual editor for designing scenes in real-time without code changes.

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **3D Graphics**: 
  - `ogl`: For geometric primitives and custom shaders.
  - `three`: For atmospheric effects.
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run development server**:
   ```bash
   npm start
   ```

## 🎨 Creator & Debug Mode

This application contains a powerful hidden "Creator Mode" used by developers and designers to fine-tune visual values, compose scenes, and debug performance in production environments.

> **Note:** The Creator Mode includes a sophisticated parameter linking system allowing you to bind any visual property (Scale, Color, Rotation) to the user's scroll position via a curve editor.

For exhaustive documentation on how to access, use, and export data from this mode, please refer to **[CREATOR_GUIDE.md](./CREATOR_GUIDE.md)**.

## 📄 License

Proprietary software. All rights reserved.
