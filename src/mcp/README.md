# Victory Initiative MCP Server Configuration

This directory contains an MCP (Model Context Protocol) server that exposes the Victory Initiative knowledge graph to AI agents like Claude.

## Running the Server

```bash
npm run mcp:start
```

The server uses `stdio` transport for local integration.

## Claude Desktop Configuration

Add this to your Claude Desktop config file (`%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "victory-initiative": {
      "command": "npx",
      "args": ["tsx", "src/mcp/server.ts"],
      "cwd": "C:/Development/Projects/VIv5"
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `create_entity` | Create a new entity (brand, product, feature, etc.) |
| `get_entity` | Get an entity by ID or slug |
| `list_entities` | List all entities, optionally filtered by type |
| `update_entity` | Update an entity's name, description, or data |
| `delete_entity` | Delete an entity by ID |
| `link_entities` | Create a relationship between two entities |
| `get_relationships` | Get relationships for an entity |

## Available Resources

| Resource URI | Description |
|--------------|-------------|
| `vi://schemas/entity-types` | List of valid entity types |

## Entity Types

- `brand` - Company or brand
- `product` - Product or service
- `feature` - Product feature
- `solution` - Solution or outcome
- `useCase` - Use case or application
- `persona` - Target user persona
