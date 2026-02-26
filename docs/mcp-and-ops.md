# MCP and the Ops Layer

While the core EAV schema stores raw entity data, the Ops Layer (Operations) provides dynamic computation, and the Model Context Protocol (MCP) server exposes this entire engine to external AI agents.

## 1. The Hooks Pipeline (`src/core/hooks.ts`)
The system strictly orders lifecycle events when mutating Records to ensure safety and allow for automation side-effects:
1.  **Constraints (Data-Driven)**: Evaluates `validation_constraint` records first. If a constraint fails, it throws an `InvariantViolation` and blocks the transaction.
2.  **Code Hooks (Hardcoded)**: Executes traditional TypeScript callbacks (`onPreCreate`, `onPostUpdate`, etc.).
3.  **Rules (Data-Driven)**: Evaluates `rule` records asynchronously for automation (e.g., sending emails, creating tasks) without blocking the primary transaction.

## 2. The Ops Layer: Metrics & Derivations
Rather than denormalizing data and relying on complex triggers to update counters, the system computes aggregations and formulas at read-time via the Ops Layer.

### Metrics (`src/modules/ops/metrics.ts`)
Metrics are stored as `metric` records containing aggregation rules (`sum`, `count`, `avg`, `min`, `max`) targeted across relationships.
- **Example**: An Account pipeline value metric sums the `amount` field of all related `opportunity` records where `stage !== 'Closed Lost'`.
- Executed on-demand via `computeMetric` or injected during deep reads via `Reader.projectFull()`.

### Derivations (`src/modules/ops/derivations.ts`)
Derivations are stored as `derivation` records representing mathematical or logical formulas evaluated against a single record's context.
- **Example**: `margin_percent` = `(revenue - cost) / revenue * 100`.

## 3. Model Context Protocol (MCP) Integration (`src/mcp/server.ts`)
The `victory-initiative-mcp-server` makes Oblio an "AI-Native" application by exposing its EAV graph and Ops layer directly to compliant external LLMs (like Claude Desktop).

### Exposed Capabilities:
- **Entity Management**: `create_entity`, `get_entity`, `update_entity`, `delete_entity`, `list_entities`.
- **Graph Traversal**: `link_entities`, `get_relationships`.
- **Ops Execution**: `execute_view`, `compute_derivation`, `list_views`.
- **UI Introspection**: `list_components` (allowing the AI to understand what UI building blocks are available to the Webbuilder).

By bridging the EAV architecture with MCP, external Agents can not only read data but dynamically program the application's physics by inserting new Rules, Definitions, or Visual Templates as standard records.
