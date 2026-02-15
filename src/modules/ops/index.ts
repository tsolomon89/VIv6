/**
 * Ops Layer - Behavior as Data
 *
 * The Ops layer provides four operator types that define behaviors as CRUDable records:
 *
 * 1. Views - Query definitions that return sets of records
 * 2. Derivations - Computed field formulas (pure functions)
 * 3. Metrics - Aggregation/rollup rules across related records
 * 4. Rules - Trigger/automation patterns for events
 *
 * These operators bridge the gap between:
 * - Tier 1 Schema (what entity types exist)
 * - Tier 2 Data (instance records)
 *
 * By making behavior CRUDable, the system becomes self-configuring
 * without code changes.
 */

export * from './views.js';
export * from './derivations.js';
export * from './metrics.js';
export * from './rules.js';
