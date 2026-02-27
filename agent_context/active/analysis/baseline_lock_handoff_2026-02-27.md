# Baseline Lock Handoff (2026-02-27)

## PR/Merge Summary (Gate-by-Gate)

- `G1 MCP Runtime`: Replaced legacy entity imports in MCP/runtime paths with record-first services; startup now resolves and runs.
- `G2 Build State Schema`: Delivery/build SQL normalized to `build_state.record_id` and `records` joins.
- `G3 Legacy Core Imports`: Active source paths no longer import `core/entities.js`.
- `G4 Canonical Doc API Drift`: Canonical architecture/bootstrap docs updated to record-first and current editor/runtime behavior.
- `G5 Script Contract`: Doc-referenced npm scripts aligned to scripts that exist in `package.json`.
- `G6 Deployment/Theme Path Contract`: Stale deployment/theme path references removed from root/docs.
- `G7 OpenAPI Parity`: Added route coverage verifier, explicit internal exclusions, and path docs for mounted public API roots.
- `G8 Pages Regression`: Pages route regression remains green (`pages.test.ts` passing).

## Baseline Scope Curation

Included in baseline lock:
- Runtime/schema gate fixes:
  - `src/mcp/server.ts`
  - `src/server/index.ts`
  - `src/modules/delivery/api/build.ts`
  - `src/modules/delivery/BuildQueue.ts`
  - `src/core/migrations/002_build_state_record_id_compat.ts`
  - Gate-focused tests under `src/core/...` and `src/mcp/...`
- Documentation drift fixes:
  - `agent_context/active/architecture/*`
  - `agent_context/active/bootstrap/*`
  - `README.md`, `DEPLOY.md`, `docs/*`
- OpenAPI parity + verification:
  - `src/api/docs/openapi_exclusions.ts`
  - `src/api/docs/paths/platform.ts`
  - `src/scripts/verify_openapi_coverage.ts`
- Matrix verification/report:
  - `src/scripts/verify_drift_gates.ts`
  - `agent_context/active/analysis/drift_gate_report_2026-02-27.md`
- CI/script wiring:
  - `package.json`
  - `.github/workflows/deploy.yml`

Explicitly excluded from baseline lock:
- Incidental/unrelated untracked artifacts:
  - `src/shared/`
  - `uploads/*`
  - `ts_errors.txt`
  - `ts_errors_utf8.txt`

## Deferred Backlog (Not in This Baseline)

1. Architecture canonicalization pass (`EntityType`/`ObjectType` and related type model cleanup).
2. Reductionist/polymorphic consolidation pass for further DRY reduction across modules/contracts.
