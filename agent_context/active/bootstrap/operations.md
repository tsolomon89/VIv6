# System Operations

## 1. Deployment Architecture (One App, Many Domains)

- Infrastructure: single API deployment with domain-based tenant resolution.
- Database: single SQLite/Turso-backed record store.
- Routing: hostname resolves to account context.

## 2. Build Pipeline (Static Generation)

### `npm run build`
- Generates the full static output under `dist/`.

### `npm run build:brand -- --brand=<slug>`
- Generates a brand-scoped build under `dist/<slug>/`.
- Recommended for production handoff and targeted deployments.

## 3. CLI Toolkit

### `npm run seed`
- Seeds baseline system and tenant records from project seed sources.

### `npx tsx src/scripts/verify_simulation.ts`
- Runs simulation verification flow against the current data model.
- Used to sanity-check activity-generation and simulation wiring.
