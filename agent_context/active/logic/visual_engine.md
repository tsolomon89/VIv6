# Visual Engine (Creator Mode) Logic

> **Concept**: A visual editor for the runtime.
> **Fact Store Mapping**: The "Scene State" is a `RecordStruct`.

## 1. The State Vector

The Visual Engine configuration is not a blob; it is a structured Record.

### Scene Config Record
```typescript
RecordStruct {
  typeObject: "SceneConfig",
  fieldGroupStructs: [{
    nameFieldGroup: "Visuals",
    fieldStructs: [
      { nameField: "cloud_density", propertyStructs: [{ value_number: 0.8 }] },
      { nameField: "energy_intensity", propertyStructs: [{ value_number: 0.5 }] },
      { nameField: "atmosphere_hue", propertyStructs: [{ value_number: 0.1 }] }
    ]
  }]
}
```

## 2. Page Derivation (The Generated Site)
The Website is not manually built page-by-page. It is **derived** from the Product Graph (as defined in `product_catalog.md`).

### A. The Derivation Rules
| Object Type | Generates Page? | URL Structure | Content Source |
| :--- | :--- | :--- | :--- |
| **Product** | Yes | `/services/{slug}` | `Product` fields + Linked `Features` |
| **Feature** | Yes | `/capabilities/{slug}` | `Feature` fields + Linked `Solutions` |
| **Solution** | Yes | `/outcomes/{slug}` | `Solution` fields + Linked `UseCases` |
| **UseCase** | Optional | `/industries/{slug}` | `UseCase` fields |

### B. The Hydration Flow
1.  **Request**: `GET /services/fractional-growth`
2.  **Resolution**: Router finds `Product` record with slug `fractional-growth`.
3.  **Graph Traversal**: 
    - Fetch Product Fields (Price, Name).
    - Fetch Linked Features (List of Capabilities).
    - Fetch Linked Solutions (Value Propositions).
4.  **Rendering**: The `ProductPage` template is hydrated with this graph data.

> **Result**: You update the "Data" (add a Feature), and the "Website" (Product Page) updates automatically.

## 3. Scroll Timeline Architecture
Instead of rigid code, Scroll Bindings are `RecordStructs` that define behavior.

### Scroll Binding Record
```typescript
RecordStruct {
  typeObject: "ScrollBinding",
  fieldGroupStructs: [{
    fieldStructs: [
      { nameField: "target_property", propertyStructs: [{ value_string: "camera.position.y" }] },
      { nameField: "source", propertyStructs: [{ value_enum: "window" }] },
      { nameField: "keyframes", propertyStructs: [{ value_json: [
          { "trigger": 0.0, "value": 0 },
          { "trigger": 1.0, "value": 500 }
      ]}]}
    ]
  }]
}
```

## 4. UX Architecture: The "Stupify" Paradigm

The UI is not designed for "delight" but for **Data Integrity**.

### A. The Sidebar Paradigm (Constraint)
- **Constraint**: All CRUD operations must happen in the Sidebar.
- **Goal**: To capture **Actual Duration**.
- **Mechanism**:
    1.  `Sidebar.Open()` -> Start Timer.
    2.  User performs work.
    3.  `Sidebar.Submit()` -> Stop Timer.
    4.  Delta = `Actual Duration` (The precise labor cost).

### B. Widget Hierarchy
- **Dashboard Cards**: High-level metrics (`Health`, `Capacity`).
- **Record Tile**: Persistent summary of the active object.
- **Tab Controller**:
    - `Activity`: The Event Log.
    - `Version`: The Audit Trail.

### C. "Select, Setup, Stupify"
1.  **Select**: Pick a Template (e.g., "B2B SaaS").
2.  **Setup**: Configure definitions (Prices, Personas).
3.  **Stupify**: The System runs the Markov Chain; the User just follows the Sidebar instructions ("Call John").
