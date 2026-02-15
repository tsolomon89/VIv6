# API Contracts & Core Functions

> **Architecture**: Top-level tools (CLI, GUI, Agents) wrap a shared layer of "Core Functions".

## Core Functions Layer

Located in `src/core/*`. These are pure functions with strict types.

| Function | Purpose |
| :--- | :--- |
| `createEntity(db, payload)` | Validates schema, slugs, and inserts row. |
| `createRelationship(db, from, to, type)` | Validates constraints (e.g., only Products can have Features). |
| `derivePage(db, slug)` | Traverses graph to build page JSON. |
| `generateContent(entity)` | Calls LLM to fill missing text fields. |

## MCP Tools Layer

AI Agents access the system via Model Context Protocol (MCP) tools that wrap Core Functions.

| Tool Name | Arguments | Behavior |
| :--- | :--- | :--- |
| `create_entity` | `type`, `name`, `data` | calls `createEntity`. |
| `query_graph` | `root_id`, `depth` | calls `getEntityGraph`. |
| `build_site` | `domain` | calls `derivePage` recursively. |

## API Endpoints (REST)

For external integrations and the Frontend.

*   `POST /api/v1/entities` -> `createEntity`
*   `GET /api/v1/pages/:slug` -> `derivePage` (Dynamic Preview)
*   **AI Generation**: `POST /api/v1/generate`
    *   Input: `entity_id`, `template_id`
    *   Output: `GeneratedContent` (Markdown)
