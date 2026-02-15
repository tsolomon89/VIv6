# MCP Server: The AI Interface

> **Identity**: `victory-initiative-mcp-server`
> **Protocol**: Model Context Protocol (MCP) over stdio.

## 1. Capabilities

### Tools (Action)
AI Agents use these tools to mutate the state of the system.
- **Strict Schema**: All mutations must respect the `FieldGroup` structure.
- **Normalization**: The server automatically converts "simple" JSON into "FieldGroup" structures.

| Tool | Input | Description |
| :--- | :--- | :--- |
| `create_entity` | `{ type, name, slug, data }` | Create a new Fact record. |
| `update_entity` | `{ id, data }` | Patch an existing record. |
| `link_entities` | `{ from_id, to_id, type }` | Create an edge in the graph. |
| `trigger_build` | `{ brand_slug? }` | Trigger static site generation. |

### Resources (Read)
ReadOnly access to the Knowledge Graph via URIs.

| URI Pattern | Description |
| :--- | :--- |
| `vi://schemas/entity-types` | JSON list of valid Types (`brand`, `product`...). |
| `vi://entities/{type}` | JSON list of all entities of that type. |

## 2. Validation Logic

The MCP Server acts as a **Guardian** for the Core Engine.
1.  **Input**: Agent sends `{ price: 100 }`.
2.  **Normalization**: Server converts to `[{ nameField: 'price', propertyStructs: [{ value_number: 100 }] }]`.
3.  **Validation**: Core checks if `price` is a valid field for this Entity Type.
4.  **Commit**: Saves to SQLite.

## 3. Deployment
- **Transport**: Stdio (Standard Input/Output).
- **Runtime**: Node.js.
- **Usage**: Intended for local agents (Cursor, Windsurf) or local CI/CD bots.
