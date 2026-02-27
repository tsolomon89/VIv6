/**
 * MCP Dimension Tool Handlers
 *
 * Extracted from server.ts for testability.
 * These functions implement the core logic for dimension-related MCP tools.
 */

import { db } from '../../core/db.js';

// ============================================================================
// TYPES
// ============================================================================

export interface DimensionTypesResult {
  count: number;
  types: Array<{ dimension: string; count: number }>;
}

export interface DimensionValuesArgs {
  dimension: string;
  filter?: Record<string, string>;
  parent_id?: string;
}

export interface DimensionValuesResult {
  dimension: string;
  count: number;
  filtered: boolean;
  values: Array<{
    id: string;
    slug: string;
    label: string;
    parent_id: string | null;
    metadata: any;
  }>;
}

export interface DependenciesArgs {
  source_dimension?: string;
  target_dimension?: string;
}

export interface DependenciesResult {
  count: number;
  dependencies: Array<{
    id: string;
    source_dimension: string;
    source_value_id: string;
    target_dimension: string;
    target_value_id: string;
    source_slug: string;
    source_label: string;
    target_slug: string;
    target_label: string;
    [key: string]: any;
  }>;
}

export interface TargetingSuggestionsArgs {
  entity_type: string;
}

export interface TargetingSuggestionsResult {
  ObjectType: string;
  availableDimensions: Array<{ dimension: string; count: number }>;
  dimensionRelationships: Array<{
    source_dimension: string;
    target_dimension: string;
    link_count: number;
  }>;
  usage: {
    tip: string;
    example: string;
  };
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * List all dimension types with counts
 */
export function listDimensionTypes(): DimensionTypesResult {
  const rows = db.prepare(
    'SELECT dimension, COUNT(*) as count FROM dimension_values GROUP BY dimension ORDER BY dimension'
  ).all() as Array<{ dimension: string; count: number }>;

  return { count: rows.length, types: rows };
}

/**
 * List values for a specific dimension with optional filtering
 */
export function listDimensionValues(args: DimensionValuesArgs): DimensionValuesResult {
  let query = `
    SELECT DISTINCT dv.id, dv.slug, dv.label, dv.parent_id, dv.metadata
    FROM dimension_values dv
    WHERE dv.dimension = ? AND dv.account_id IS NULL
  `;
  const params: any[] = [args.dimension];

  if (args.parent_id) {
    query += ' AND dv.parent_id = ?';
    params.push(args.parent_id);
  }

  // Apply dependency filtering
  if (args.filter && Object.keys(args.filter).length > 0) {
    for (const [filterDim, filterSlug] of Object.entries(args.filter)) {
      if (!filterSlug) continue;
      query += `
        AND dv.id IN (
          SELECT dd.target_value_id FROM dimension_dependencies dd
          JOIN dimension_values fv ON fv.id = dd.source_value_id
          WHERE dd.target_dimension = ? AND dd.source_dimension = ? AND fv.slug = ?
          UNION
          SELECT dd.source_value_id FROM dimension_dependencies dd
          JOIN dimension_values fv ON fv.id = dd.target_value_id
          WHERE dd.source_dimension = ? AND dd.target_dimension = ? AND fv.slug = ? AND dd.bidirectional = 1
        )
      `;
      params.push(args.dimension, filterDim, filterSlug, args.dimension, filterDim, filterSlug);
    }
  }

  query += ' ORDER BY dv.label';
  const rows = db.prepare(query).all(...params) as any[];

  return {
    dimension: args.dimension,
    count: rows.length,
    filtered: !!args.filter,
    values: rows.map(r => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata) : null
    }))
  };
}

/**
 * List dependencies between dimensions
 */
export function listDimensionDependencies(args: DependenciesArgs): DependenciesResult {
  let query = `
    SELECT dd.*,
           sv.slug as source_slug, sv.label as source_label,
           tv.slug as target_slug, tv.label as target_label
    FROM dimension_dependencies dd
    JOIN dimension_values sv ON sv.id = dd.source_value_id
    JOIN dimension_values tv ON tv.id = dd.target_value_id
    WHERE 1=1
  `;
  const params: string[] = [];

  if (args.source_dimension) {
    query += ' AND dd.source_dimension = ?';
    params.push(args.source_dimension);
  }
  if (args.target_dimension) {
    query += ' AND dd.target_dimension = ?';
    params.push(args.target_dimension);
  }

  query += ' ORDER BY dd.source_dimension, sv.label, tv.label LIMIT 100';
  const rows = db.prepare(query).all(...params) as any[];

  return { count: rows.length, dependencies: rows };
}

/**
 * Get targeting suggestions for an entity type
 */
export function getTargetingSuggestions(args: TargetingSuggestionsArgs): TargetingSuggestionsResult {
  const dimensions = db.prepare(
    'SELECT dimension, COUNT(*) as count FROM dimension_values WHERE account_id IS NULL GROUP BY dimension ORDER BY count DESC'
  ).all() as Array<{ dimension: string; count: number }>;

  const depSummary = db.prepare(`
    SELECT source_dimension, target_dimension, COUNT(*) as link_count
    FROM dimension_dependencies
    WHERE account_id IS NULL
    GROUP BY source_dimension, target_dimension
  `).all() as Array<{ source_dimension: string; target_dimension: string; link_count: number }>;

  return {
    ObjectType: args.entity_type,
    availableDimensions: dimensions,
    dimensionRelationships: depSummary,
    usage: {
      tip: 'Use list_dimension_values to get specific values for each dimension',
      example: 'list_dimension_values({ dimension: "industry", filter: { sector: "technology" } })',
    },
  };
}

