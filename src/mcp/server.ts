#!/usr/bin/env node
/**
 * Victory Initiative MCP Server
 * 
 * Exposes entity and relationship management tools for AI agents.
 * uses strict typing for EntityData (FieldGroups) while shielding the complexity from simple requests.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

import { initDb, db } from '../core/db.js';
import { SYSTEM_ACCOUNT_ID } from '../core/constants.js';
import {
  createRecord,
  getRecord,
  getRecordBySlug,
  updateRecord,
  deleteRecord,
  listRecords,
} from '../core/records.js';
import {
  createRelationship,
  getRelationshipsFrom,
  getRelationshipsTo,
  deleteRelationship,
} from '../core/relationships.js';
import { normalizeEntityData, FieldGroup, FieldGroupSchema } from '../core/schema/validation.js';
import { EntityType, EntityData, Field, DataRecord, ENTITY_TYPES } from '../core/types.js';
import {
  listDimensionTypes,
  listDimensionValues,
  listDimensionDependencies,
  getTargetingSuggestions
} from './handlers/dimensions.js';
import {
  createPageAsset,
  listPageAssets,
  updatePageSection,
  addPageSection,
  resolvePageBindings,
  linkPageToEntity,
} from './handlers/pages.js';
import {
  listPresetsHandler,
  getPresetHandler,
  listCompatiblePresetsHandler,
} from './handlers/presets.js';
import {
  listStateMachines,
  getStateMachineForEntity,
  validateStateTransition,
  getAllowedTransitionsHandler,
  getValidStatesHandler,
} from './handlers/state_machines.js';
import {
  listWorkflows,
  getWorkflowWithSteps,
  triggerWorkflow,
  listWorkflowEnrollments,
  listWorkflowStepTypes,
} from './handlers/workflows.js';
import {
  listInterpreterExecutorsHandler,
  validateInterpreterStageHandler,
} from './handlers/interpreter_executors.js';
import { registerCustomInterpreterExecutors } from '../modules/ops/custom_interpreter_executors.js';
import { loadInterpreterExecutorPlugins } from '../modules/ops/interpreter_executor_plugin_loader.js';

function getEntity(id: string): DataRecord | undefined {
  return getRecord(id);
}

async function createEntity(input: Parameters<typeof createRecord>[0]) {
  return createRecord(input);
}

async function updateEntity(id: string, updates: Parameters<typeof updateRecord>[1]) {
  return updateRecord(id, updates);
}

async function deleteEntity(id: string) {
  return deleteRecord(id);
}

function getEntityBySlug(slug: string, accountId?: string): DataRecord | undefined {
  const scopedAccountId = accountId ?? SYSTEM_ACCOUNT_ID;
  const scoped = getRecordBySlug(scopedAccountId, slug);
  if (scoped || accountId) {
    return scoped;
  }

  const row = db.prepare(
    'SELECT id FROM records WHERE slug = ? ORDER BY created_at DESC LIMIT 1'
  ).get(slug) as { id: string } | undefined;
  return row ? getRecord(row.id) : undefined;
}

function listEntities(type?: EntityType, accountId?: string): DataRecord[] {
  if (accountId) {
    return listRecords(accountId, type);
  }

  const query = type
    ? 'SELECT id FROM records WHERE type = ? ORDER BY created_at DESC'
    : 'SELECT id FROM records ORDER BY created_at DESC';
  const rows = type
    ? db.prepare(query).all(type)
    : db.prepare(query).all();

  return (rows as Array<{ id: string }>)
    .map((row) => getRecord(row.id))
    .filter((record): record is DataRecord => Boolean(record));
}

// (Schemas imported from validation.ts)

// Initialize database
initDb();
registerCustomInterpreterExecutors();
void loadInterpreterExecutorPlugins().then(result => {
  if (result.errors.length > 0 || result.missing.length > 0) {
    console.error('[InterpreterExecutors] Plugin loader issues:', {
      missing: result.missing,
      errors: result.errors,
    });
  }
  if (result.loaded.length > 0 || result.skipped.length > 0 || result.unloaded.length > 0) {
    console.log('[InterpreterExecutors] Plugin loader summary:', {
      loaded: result.loaded.length,
      skipped: result.skipped.length,
      unloaded: result.unloaded.length,
      missing: result.missing.length,
      errors: result.errors.length,
    });
  }
}).catch(error => {
  console.error('[InterpreterExecutors] Plugin loader failed:', error);
});

// Create MCP server
const server = new McpServer({
  name: 'victory-initiative-mcp-server',
  version: '1.1.0',
});

// ============================================================================
// TOOLS
// ============================================================================

// Valid entity types
// Valid entity types (Imported from Core)
// const entityTypes = ['brand', 'product', 'feature', 'solution', 'useCase', 'persona'] as const;

// --- create_entity ---
server.registerTool(
  'create_entity',
  {
    description: 'Create a new entity. Supports both simple key-value `data` (converted to Default group) and structured `fieldGroups`.',
    inputSchema: {
      type: z.enum(ENTITY_TYPES).describe('The entity type'),
      name: z.string().min(1).describe('Display name for the entity'),
      slug: z.string().min(1).regex(/^[a-z0-9-]+$/).describe('URL-friendly identifier (lowercase, hyphens only)'),
      description: z.string().optional().describe('Optional description'),
      account_id: z.string().uuid().optional().describe('Optional account ID for multi-tenancy'),
      data: z.record(z.string(), z.unknown()).optional().describe('Optional: Simple key-value data (will be converted to Default field group)'),
      fieldGroups: z.array(FieldGroupSchema).optional().describe('Optional: Structured field groups for strict schema'),
    },
  },
  async (args) => {
    try {
      const entityData = normalizeEntityData(args.data, args.fieldGroups as FieldGroup[]);
      
      const entity = await createEntity({
        type: args.type as EntityType,
        name: args.name,
        slug: args.slug,
        description: args.description,
        data: entityData,
        // Default to System Account (Oblio) if not specified
        account_id: args.account_id || SYSTEM_ACCOUNT_ID,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(entity, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error creating entity: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- get_entity ---
server.registerTool(
  'get_entity',
  {
    description: 'Get an entity by ID (UUID) or slug',
    inputSchema: {
      identifier: z.string().min(1).describe('Entity ID (UUID) or slug'),
    },
  },
  async (args) => {
    try {
      let entity = getEntity(args.identifier);
      if (!entity) {
        entity = getEntityBySlug(args.identifier);
      }
      if (!entity) {
        return {
          content: [{ type: 'text', text: `Entity not found: ${args.identifier}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(entity, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- list_entities ---
server.registerTool(
  'list_entities',
  {
    description: 'List all entities, optionally filtered by type',
    inputSchema: {
      type: z.enum(ENTITY_TYPES).optional().describe('Optional: filter by entity type'),
      account_id: z.string().uuid().optional().describe('Optional: filter by account ID'),
    },
  },
  async (args) => {
    try {
      const entities = listEntities(args.type, args.account_id);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              count: entities.length,
              entities: entities.map((e) => ({
                id: e.id,
                type: e.type,
                slug: e.slug,
                name: e.name,
              })),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- update_entity ---
server.registerTool(
  'update_entity',
  {
    description: 'Update an existing entity',
    inputSchema: {
      id: z.string().uuid().describe('Entity ID (UUID)'),
      name: z.string().min(1).optional().describe('New name (optional)'),
      description: z.string().optional().describe('New description (optional)'),
      data: z.record(z.string(), z.unknown()).optional().describe('Update simple data fields'),
      fieldGroups: z.array(FieldGroupSchema).optional().describe('Update structured field groups'),
    },
  },
  async (args) => {
    try {
      const updates: Record<string, unknown> = {};
      if (args.name) updates.name = args.name;
      if (args.description !== undefined) updates.description = args.description;
      
      // For updates, we need to handle data merging carefully.
      // Current implementation of updateEntity in core does a simple merge.
      // We will normalize the input updates to EntityData structure.
      if (args.data || args.fieldGroups) {
        updates.data = normalizeEntityData(args.data, args.fieldGroups as FieldGroup[]);
      }

      const entity = await updateEntity(args.id, updates);
      if (!entity) {
        return {
          content: [{ type: 'text', text: `Entity not found: ${args.id}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(entity, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- delete_entity ---
server.registerTool(
  'delete_entity',
  {
    description: 'Delete an entity by ID',
    inputSchema: {
      id: z.string().uuid().describe('Entity ID (UUID)'),
    },
  },
  async (args) => {
    try {
      const deleted = await deleteEntity(args.id);
      return {
        content: [{ type: 'text', text: deleted ? `Deleted entity: ${args.id}` : `Entity not found: ${args.id}` }],
        isError: !deleted,
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- link_entities ---
server.registerTool(
  'link_entities',
  {
    description: 'Create a relationship between two entities',
    inputSchema: {
      from_id: z.string().uuid().describe('Source entity ID (UUID)'),
      to_id: z.string().uuid().describe('Target entity ID (UUID)'),
      relationship_type: z.string().min(1).describe('Type of relationship (e.g., "offers", "includes", "targets")'),
      properties: z.record(z.string(), z.unknown()).optional().describe('Optional edge properties (e.g., { order: 1 })'),
    },
  },
  async (args) => {
    try {
      const relationship = await createRelationship({
        from_record_id: args.from_id,
        to_record_id: args.to_id,
        relationship_type: args.relationship_type,
        data: args.properties,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(relationship, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- get_relationships ---
server.registerTool(
  'get_relationships',
  {
    description: 'Get relationships for an entity',
    inputSchema: {
      entity_id: z.string().uuid().describe('Entity ID (UUID)'),
      direction: z.enum(['from', 'to', 'both']).default('both').describe('Direction: "from" (outgoing), "to" (incoming), or "both"'),
    },
  },
  async (args) => {
    try {
      let relationships: unknown[] = [];
      if (args.direction === 'from' || args.direction === 'both') {
        relationships = [...relationships, ...getRelationshipsFrom(args.entity_id)];
      }
      if (args.direction === 'to' || args.direction === 'both') {
        relationships = [...relationships, ...getRelationshipsTo(args.entity_id)];
      }
      return {
        content: [{ type: 'text', text: JSON.stringify({ count: relationships.length, relationships }, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// RESOURCES
// ============================================================================

server.registerResource(
  'entity-types',
  'vi://schemas/entity-types',
  { description: 'List of valid entity types' },
  async () => ({
    contents: [
      {
        uri: 'vi://schemas/entity-types',
        mimeType: 'application/json',
        text: JSON.stringify({
          types: ENTITY_TYPES,
          description: 'Valid entity types in the Victory Initiative knowledge graph',
        }),
      },
    ],
  })
);


server.registerResource(
  'relationship-types',
  'vi://schemas/relationship-types',
  { description: 'List of valid relationship types' },
  async () => ({
    contents: [
      {
        uri: 'vi://schemas/relationship-types',
        mimeType: 'application/json',
        text: JSON.stringify({
          types: ['offers', 'includes', 'targets', 'requires', 'relates_to'],
          description: 'Standard relationship types (extensible)',
        }),
      },
    ],
  })
);

// Dynamic resource for entities by type
server.registerResource(
  'entities-by-type',
  'vi://entities/{type}',
  { description: 'List entities of a specific type. Template: vi://entities/{type}' },
  async (uri) => {
    const type = uri.href.split('/').pop();
    if (!type || !ENTITY_TYPES.includes(type as any)) {
      throw new Error(`Invalid entity type: ${type}`);
    }
    
    const entities = listEntities(type as EntityType);
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(entities, null, 2),
        },
      ],
    };
  }
);



// --- list_components ---
server.registerTool(
  'list_components',
  {
    description: 'List available UI component presets and their schemas',
    inputSchema: {
      filter: z.string().optional().describe('Optional filter for component key'),
    },
  },
  async (args) => {
    try {
      const componentsPath = path.resolve(process.cwd(), 'data/components.json');
      if (!await fs.pathExists(componentsPath)) {
        return {
          content: [{ type: 'text', text: 'Components registry not found (data/components.json missing)' }],
          isError: true,
        };
      }

      const data = await fs.readJson(componentsPath);
      let results = data;

      if (args.filter) {
        results = data.filter((c: any) => c.key.includes(args.filter));
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// OPS LAYER TOOLS (Views, Derivations, Metrics, Rules)
// ============================================================================

// --- list_views ---
server.registerTool(
  'list_views',
  {
    description: 'List all available View definitions for an account',
    inputSchema: {
      account_id: z.string().uuid().optional().describe('Account ID (defaults to system account)'),
    },
  },
  async (args) => {
    try {
      const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
      const views = listViews(accountId);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              count: views.length,
              views: views.map((v) => ({
                id: v.id,
                slug: v.slug,
                name: v.name,
                summary: v.summary,
              })),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- execute_view ---
server.registerTool(
  'execute_view',
  {
    description: 'Execute a View and return matching records. Views are query definitions stored as records.',
    inputSchema: {
      view_slug: z.string().min(1).describe('Slug of the View to execute'),
      account_id: z.string().uuid().optional().describe('Account ID (defaults to system account)'),
      params: z.record(z.string(), z.unknown()).optional().describe('Optional parameters for parameterized views'),
    },
  },
  async (args) => {
    try {
      const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
      const result = resolveView(accountId, args.view_slug, {
        params: args.params,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              viewSlug: result.viewSlug,
              total: result.total,
              records: result.records.map((r) => ({
                id: r.id,
                slug: r.slug,
                name: r.name,
                type: r.type,
                data: r.data,
              })),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- get_view_signature ---
server.registerTool(
  'get_view_signature',
  {
    description: 'Get the signature (inputs/outputs) of a View for UI introspection',
    inputSchema: {
      view_slug: z.string().min(1).describe('Slug of the View'),
      account_id: z.string().uuid().optional().describe('Account ID (defaults to system account)'),
    },
  },
  async (args) => {
    try {
      const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
      const viewRecord = getRecordBySlugOps(accountId, args.view_slug);

      if (!viewRecord || viewRecord.type !== 'view') {
        return {
          content: [{ type: 'text', text: `View not found: ${args.view_slug}` }],
          isError: true,
        };
      }

      const signature = getViewSignature(viewRecord);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              slug: args.view_slug,
              name: viewRecord.name,
              summary: viewRecord.summary,
              ...signature,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// DERIVATION TOOLS
// ============================================================================

// --- list_derivations ---
server.registerTool(
  'list_derivations',
  {
    description: 'List all Derivation definitions (computed field formulas)',
    inputSchema: {
      account_id: z.string().uuid().optional().describe('Account ID (defaults to system account)'),
      entity_type: z.string().optional().describe('Optional: filter by target entity type'),
    },
  },
  async (args) => {
    try {
      const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
      let derivations = listDerivations(accountId);

      if (args.entity_type) {
        derivations = derivations.filter(d => {
          const def = parseDerivationDefinition(d);
          return def.targetEntityType === args.entity_type;
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              count: derivations.length,
              derivations: derivations.map((d) => {
                const def = parseDerivationDefinition(d);
                return {
                  slug: d.slug,
                  name: d.name,
                  targetEntityType: def.targetEntityType,
                  fieldName: def.fieldName,
                  returnType: def.returnType,
                };
              }),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- compute_derivation ---
server.registerTool(
  'compute_derivation',
  {
    description: 'Compute a derivation for a specific record',
    inputSchema: {
      derivation_slug: z.string().min(1).describe('Slug of the Derivation to compute'),
      record_id: z.string().uuid().describe('ID of the record to compute for'),
      account_id: z.string().uuid().optional().describe('Account ID (defaults to system account)'),
    },
  },
  async (args) => {
    try {
      const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
      const derivationRecord = getRecordBySlugOps(accountId, args.derivation_slug);

      if (!derivationRecord || derivationRecord.type !== 'derivation') {
        return {
          content: [{ type: 'text', text: `Derivation not found: ${args.derivation_slug}` }],
          isError: true,
        };
      }

      const targetRecord = getRecordOps(args.record_id);
      if (!targetRecord) {
        return {
          content: [{ type: 'text', text: `Record not found: ${args.record_id}` }],
          isError: true,
        };
      }

      const def = parseDerivationDefinition(derivationRecord);
      const result = computeDerivation(def, targetRecord);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              derivation: args.derivation_slug,
              recordId: args.record_id,
              result,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- compute_all_derivations ---
server.registerTool(
  'compute_all_derivations',
  {
    description: 'Compute all applicable derivations for a record',
    inputSchema: {
      record_id: z.string().uuid().describe('ID of the record to compute for'),
      account_id: z.string().uuid().optional().describe('Account ID (defaults to system account)'),
    },
  },
  async (args) => {
    try {
      const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
      const targetRecord = getRecordOps(args.record_id);

      if (!targetRecord) {
        return {
          content: [{ type: 'text', text: `Record not found: ${args.record_id}` }],
          isError: true,
        };
      }

      const results = computeAllDerivations(accountId, targetRecord);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              recordId: args.record_id,
              entityType: targetRecord.type,
              computedFields: results,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- evaluate_expression ---
server.registerTool(
  'evaluate_expression',
  {
    description: 'Evaluate a derivation expression against test data (for preview/testing)',
    inputSchema: {
      expression: z.string().min(1).describe('The expression to evaluate'),
      test_data: z.record(z.string(), z.unknown()).describe('Test data context (key-value pairs)'),
    },
  },
  async (args) => {
    try {
      const result = evaluateDerivationExpression(args.expression, args.test_data as Record<string, any>);
      const dependencies = extractDependencies(args.expression);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              expression: args.expression,
              result: result.value,
              error: result.error,
              dependencies,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// METRIC TOOLS
// ============================================================================

// --- list_metrics ---
server.registerTool(
  'list_metrics',
  {
    description: 'List all Metric definitions (aggregation/rollup rules)',
    inputSchema: {
      account_id: z.string().uuid().optional().describe('Account ID (defaults to system account)'),
      target_entity_type: z.string().optional().describe('Optional: filter by target entity type'),
    },
  },
  async (args) => {
    try {
      const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
      let metrics = listMetrics(accountId);

      if (args.target_entity_type) {
        metrics = metrics.filter(m => {
          const def = parseMetricDefinition(m);
          return def.targetEntityType === args.target_entity_type;
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              count: metrics.length,
              metrics: metrics.map((m) => {
                const def = parseMetricDefinition(m);
                return {
                  slug: m.slug,
                  name: m.name,
                  sourceEntityType: def.sourceEntityType,
                  targetEntityType: def.targetEntityType,
                  aggregation: def.aggregation,
                  targetField: def.targetField,
                };
              }),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- compute_metric ---
server.registerTool(
  'compute_metric',
  {
    description: 'Compute a metric for a specific target record',
    inputSchema: {
      metric_slug: z.string().min(1).describe('Slug of the Metric to compute'),
      target_record_id: z.string().uuid().describe('ID of the target record'),
      account_id: z.string().uuid().optional().describe('Account ID (defaults to system account)'),
    },
  },
  async (args) => {
    try {
      const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
      const metricRecord = getRecordBySlugOps(accountId, args.metric_slug);

      if (!metricRecord || metricRecord.type !== 'metric') {
        return {
          content: [{ type: 'text', text: `Metric not found: ${args.metric_slug}` }],
          isError: true,
        };
      }

      const targetRecord = getRecordOps(args.target_record_id);
      if (!targetRecord) {
        return {
          content: [{ type: 'text', text: `Record not found: ${args.target_record_id}` }],
          isError: true,
        };
      }

      const def = parseMetricDefinition(metricRecord);
      const result = computeMetric(def, targetRecord, accountId);
      const snapshot = createMetricSnapshot(args.metric_slug, args.target_record_id, result);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              metric: args.metric_slug,
              targetRecordId: args.target_record_id,
              result,
              snapshot,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- compute_all_metrics ---
server.registerTool(
  'compute_all_metrics',
  {
    description: 'Compute all applicable metrics for a target record',
    inputSchema: {
      target_record_id: z.string().uuid().describe('ID of the target record'),
      account_id: z.string().uuid().optional().describe('Account ID (defaults to system account)'),
    },
  },
  async (args) => {
    try {
      const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
      const targetRecord = getRecordOps(args.target_record_id);

      if (!targetRecord) {
        return {
          content: [{ type: 'text', text: `Record not found: ${args.target_record_id}` }],
          isError: true,
        };
      }

      const results = computeAllMetrics(accountId, targetRecord);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              targetRecordId: args.target_record_id,
              entityType: targetRecord.type,
              metrics: results,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// RULE TOOLS
// ============================================================================

// --- list_rules ---
server.registerTool(
  'list_rules',
  {
    description: 'List all Rule definitions (trigger/automation patterns)',
    inputSchema: {
      account_id: z.string().uuid().optional().describe('Account ID (defaults to system account)'),
      entity_type: z.string().optional().describe('Optional: filter by trigger entity type'),
      event: z.string().optional().describe('Optional: filter by trigger event'),
    },
  },
  async (args) => {
    try {
      const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
      let rules = listRules(accountId);

      if (args.entity_type || args.event) {
        rules = rules.filter(r => {
          const def = parseRuleDefinition(r);
          if (args.entity_type && def.triggerEntityType !== args.entity_type) return false;
          if (args.event && def.triggerEvent !== args.event) return false;
          return true;
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              count: rules.length,
              rules: rules.map((r) => {
                const def = parseRuleDefinition(r);
                return {
                  slug: r.slug,
                  name: r.name,
                  triggerEvent: def.triggerEvent,
                  triggerEntityType: def.triggerEntityType,
                  isActive: def.isActive,
                  priority: def.priority,
                  actionCount: def.actions.length,
                };
              }),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- test_rule ---
server.registerTool(
  'test_rule',
  {
    description: 'Test a rule against a record without executing actions (preview mode)',
    inputSchema: {
      rule_slug: z.string().min(1).describe('Slug of the Rule to test'),
      record_id: z.string().uuid().describe('ID of the record to test against'),
      account_id: z.string().uuid().optional().describe('Account ID (defaults to system account)'),
    },
  },
  async (args) => {
    try {
      const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
      const ruleRecord = getRecordBySlugOps(accountId, args.rule_slug);

      if (!ruleRecord || ruleRecord.type !== 'rule') {
        return {
          content: [{ type: 'text', text: `Rule not found: ${args.rule_slug}` }],
          isError: true,
        };
      }

      const targetRecord = getRecordOps(args.record_id);
      if (!targetRecord) {
        return {
          content: [{ type: 'text', text: `Record not found: ${args.record_id}` }],
          isError: true,
        };
      }

      const def = parseRuleDefinition(ruleRecord);
      const testResult = await testRule(def, targetRecord, accountId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              rule: args.rule_slug,
              recordId: args.record_id,
              isActive: def.isActive,
              ...testResult,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- get_rule_definition ---
server.registerTool(
  'get_rule_definition',
  {
    description: 'Get the full definition of a Rule',
    inputSchema: {
      rule_slug: z.string().min(1).describe('Slug of the Rule'),
      account_id: z.string().uuid().optional().describe('Account ID (defaults to system account)'),
    },
  },
  async (args) => {
    try {
      const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
      const ruleRecord = getRecordBySlugOps(accountId, args.rule_slug);

      if (!ruleRecord || ruleRecord.type !== 'rule') {
        return {
          content: [{ type: 'text', text: `Rule not found: ${args.rule_slug}` }],
          isError: true,
        };
      }

      const def = parseRuleDefinition(ruleRecord);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              slug: ruleRecord.slug,
              name: ruleRecord.name,
              summary: ruleRecord.summary,
              definition: def,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- trigger_build ---
server.registerTool(
  'trigger_build',
  {
    description: 'Trigger a static site build. Can build all or target a specific brand.',
    inputSchema: {
      brand_slug: z.string().optional().describe('Optional: Brand slug to build specifically (e.g. "oblio")'),
    },
  },
  async (args) => {
    try {
      let command = 'npm run build';
      if (args.brand_slug) {
        command = `npm run build:brand -- --brand=${args.brand_slug}`;
      }

      // Execute build command
      const { stdout, stderr } = await execAsync(command, { cwd: process.cwd() });

      return {
        content: [
          { type: 'text', text: `Build Command: ${command}\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}` }
        ],
      };
    } catch (error: any) {
      return {
        content: [{ 
            type: 'text', 
            text: `Build Failed: ${error.message}\n\nSTDOUT:\n${error.stdout}\n\nSTDERR:\n${error.stderr}` 
        }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// DIMENSION TOOLS (Taxonomy Management for AI Agents)
// ============================================================================

// --- list_dimension_types ---
server.registerTool(
  'list_dimension_types',
  {
    description: 'List all dimension types (e.g., sector, industry, function, seniority, company_size)',
    inputSchema: {},
  },
  async () => {
    try {
      const result = listDimensionTypes();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- list_dimension_values ---
server.registerTool(
  'list_dimension_values',
  {
    description: 'List values for a specific dimension. Supports filtering by parent or dependency.',
    inputSchema: {
      dimension: z.string().min(1).describe('The dimension to list values for (e.g., "industry", "function")'),
      filter: z.record(z.string(), z.string()).optional().describe('Optional: Filter by related dimensions (e.g., { "sector": "technology" })'),
      parent_id: z.string().uuid().optional().describe('Optional: Filter by parent ID'),
    },
  },
  async (args) => {
    try {
      const result = listDimensionValues({
        dimension: args.dimension,
        filter: args.filter,
        parent_id: args.parent_id,
      });
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- list_dimension_dependencies ---
server.registerTool(
  'list_dimension_dependencies',
  {
    description: 'List dependencies between dimensions (for cascading pick-lists)',
    inputSchema: {
      source_dimension: z.string().optional().describe('Optional: Filter by source dimension'),
      target_dimension: z.string().optional().describe('Optional: Filter by target dimension'),
    },
  },
  async (args) => {
    try {
      const result = listDimensionDependencies({
        source_dimension: args.source_dimension,
        target_dimension: args.target_dimension,
      });
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- get_targeting_suggestions ---
server.registerTool(
  'get_targeting_suggestions',
  {
    description: 'Get targeting dimension suggestions for a persona or product. Helps AI agents understand available targeting options.',
    inputSchema: {
      entity_type: z.string().describe('Entity type to get suggestions for (e.g., "persona", "product")'),
    },
  },
  async (args) => {
    try {
      const result = getTargetingSuggestions({
        entity_type: args.entity_type,
      });
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- provision_account ---
import { provisionAccount } from '../core/provisioning.js';

// --- Ops Layer Tools (Views, Derivations, Metrics, Rules) ---
import { resolveView, listViews, getViewSignature, parseViewDefinition } from '../modules/ops/views.js';
import {
  computeDerivation,
  computeAllDerivations,
  listDerivations,
  listDerivationsForType,
  parseDerivationDefinition,
  evaluateDerivationExpression,
  extractDependencies
} from '../modules/ops/derivations.js';
import {
  computeMetric,
  computeAllMetrics,
  listMetrics,
  listMetricsForTargetType,
  parseMetricDefinition,
  createMetricSnapshot
} from '../modules/ops/metrics.js';
import {
  executeRule,
  executeMatchingRules,
  listRules,
  listRulesForEvent,
  parseRuleDefinition,
  testRule,
  createRuleContext
} from '../modules/ops/rules.js';
import { getRecordBySlug as getRecordBySlugOps, getRecord as getRecordOps } from '../modules/content/services.js';

server.registerTool(
  'provision_account',
  {
    description: 'Provision a new Tenant Account. Creates Account, Owner Contact, and Admin Membership.',
    inputSchema: {
      domain: z.string().min(3).describe('The primary domain for the tenant (e.g. "acme.com")'),
      plan: z.string().default('pro').describe('Subscription plan (default: "pro")'),
      owner_email: z.string().email().describe('Email address of the account owner'),
    },
  },
  async (args) => {
    try {
      const result = provisionAccount(args.domain, args.plan, args.owner_email);
      return {
        content: [
          { 
            type: 'text', 
            text: JSON.stringify({
              message: 'Account successfully provisioned',
              account: result.account,
              owner: result.ownerContact,
              membership: result.membership
            }, null, 2) 
          }
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Provisioning Failed: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// WEBBUILDER TOOLS (Page Assets & Presentation Presets)
// ============================================================================

// --- create_page_asset ---
server.registerTool(
  'create_page_asset',
  {
    description: 'Create a page asset from a template. Pages are assets where channel=website and medium=page.',
    inputSchema: {
      template_key: z.string().optional().describe('Template to instantiate (e.g., "landing-page-v1")'),
      name: z.string().min(1).describe('Page name'),
      slug: z.string().min(1).regex(/^[a-z0-9-]+$/).describe('URL slug'),
      subject_type: z.string().optional().describe('Entity type the page is about (e.g., "brand", "product")'),
      subject_id: z.string().uuid().optional().describe('ID of the subject entity'),
      account_id: z.string().uuid().optional().describe('Account ID'),
      source: z.string().optional().describe('Source domain (default: "brand.co")'),
      version: z.string().optional().describe('Asset version (default: "V.01")'),
    },
  },
  async (args) => {
    try {
      const result = await createPageAsset({
        template_key: args.template_key,
        name: args.name,
        slug: args.slug,
        subject_type: args.subject_type,
        subject_id: args.subject_id,
        account_id: args.account_id,
        source: args.source,
        version: args.version,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- list_page_assets ---
server.registerTool(
  'list_page_assets',
  {
    description: 'List all page assets with their templates',
    inputSchema: {
      account_id: z.string().uuid().optional().describe('Account ID'),
      subject_type: z.string().optional().describe('Filter by subject type'),
    },
  },
  async (args) => {
    try {
      const result = listPageAssets({
        account_id: args.account_id,
        subject_type: args.subject_type,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- update_page_section ---
server.registerTool(
  'update_page_section',
  {
    description: 'Update a specific section of a page with visual overrides',
    inputSchema: {
      page_id: z.string().uuid().describe('Page ID'),
      section_id: z.string().describe('Section ID within the page'),
      overrides: z.record(z.string(), z.unknown()).describe('Visual config overrides'),
    },
  },
  async (args) => {
    try {
      const result = await updatePageSection({
        page_id: args.page_id,
        section_id: args.section_id,
        overrides: args.overrides as Record<string, unknown>,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- add_page_section ---
server.registerTool(
  'add_page_section',
  {
    description: 'Add a new section to a page using a preset',
    inputSchema: {
      page_id: z.string().uuid().describe('Page ID'),
      binding: z.object({
        kind: z.enum(['self', 'related']).describe('Binding kind'),
        target: z.string().optional().describe('Target entity type for related bindings'),
        cardinality: z.enum(['one', 'many']).optional().describe('Cardinality for related bindings'),
      }).describe('Section binding (what data to display)'),
      preset_key: z.string().describe('Presentation preset key'),
      placement: z.object({
        slot: z.enum(['start', 'end', 'free']).describe('Section slot'),
        order: z.number().optional().describe('Order within free slot'),
      }).optional().describe('Section placement'),
    },
  },
  async (args) => {
    try {
      const result = await addPageSection({
        page_id: args.page_id,
        binding: args.binding as any,
        preset_key: args.preset_key,
        placement: args.placement,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- resolve_page_bindings ---
server.registerTool(
  'resolve_page_bindings',
  {
    description: 'Resolve all bindings for a page and return the associated data',
    inputSchema: {
      page_id: z.string().uuid().describe('Page ID'),
      account_id: z.string().uuid().optional().describe('Account ID'),
    },
  },
  async (args) => {
    try {
      const result = await resolvePageBindings({
        page_id: args.page_id,
        account_id: args.account_id,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- link_page_to_entity ---
server.registerTool(
  'link_page_to_entity',
  {
    description: 'Link a page to display an entity (for section bindings)',
    inputSchema: {
      page_id: z.string().uuid().describe('Page ID'),
      entity_id: z.string().uuid().describe('Entity ID to link'),
      relationship_type: z.string().optional().describe('Relationship type (default: displays_<entity_type>)'),
    },
  },
  async (args) => {
    try {
      const result = await linkPageToEntity({
        page_id: args.page_id,
        entity_id: args.entity_id,
        relationship_type: args.relationship_type,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- list_presets ---
server.registerTool(
  'list_presets',
  {
    description: 'List available presentation presets for page sections',
    inputSchema: {
      signature_kind: z.enum(['self', 'related']).optional().describe('Filter by binding kind'),
      target: z.string().optional().describe('Filter by target entity type'),
      cardinality: z.enum(['one', 'many']).optional().describe('Filter by cardinality'),
      account_id: z.string().uuid().optional().describe('Account ID'),
    },
  },
  async (args) => {
    try {
      const result = listPresetsHandler({
        signature_kind: args.signature_kind,
        target: args.target,
        cardinality: args.cardinality,
        account_id: args.account_id,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- get_preset ---
server.registerTool(
  'get_preset',
  {
    description: 'Get a specific presentation preset by key',
    inputSchema: {
      key: z.string().describe('Preset key (e.g., "self.hero.v1")'),
    },
  },
  async (args) => {
    try {
      const result = getPresetHandler({ key: args.key });
      if (!result.preset) {
        return {
          content: [{ type: 'text', text: `Preset not found: ${args.key}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(result.preset, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// CONFIG WORKSPACE TOOLS (GTM-style staged configuration)
// ============================================================================

import {
  CreateWorkspaceSchema,
  GetWorkspaceSchema,
  ListWorkspacesSchema,
  AddChangeSchema,
  RemoveChangeSchema,
  PreviewWorkspaceSchema,
  ApplyWorkspaceSchema,
  RollbackWorkspaceSchema,
  VersionHistorySchema,
  RestoreVersionSchema,
  ValidateConfigSchema,
  createWorkspaceHandler,
  getWorkspaceHandler,
  listWorkspacesHandler,
  deleteWorkspaceHandler,
  addChangeHandler,
  removeChangeHandler,
  previewWorkspaceHandler,
  submitForReviewHandler,
  approveWorkspaceHandler,
  rejectWorkspaceHandler,
  applyWorkspaceHandler,
  rollbackWorkspaceHandler,
  getVersionHistoryHandler,
  restoreVersionHandler,
  validateConfigHandler,
  listConfigTypesHandler,
} from './handlers/config_workspace.js';

// --- create_workspace ---
server.registerTool(
  'create_workspace',
  {
    description: 'Create a new configuration workspace for staging changes',
    inputSchema: CreateWorkspaceSchema,
  },
  createWorkspaceHandler
);

// --- get_workspace ---
server.registerTool(
  'get_workspace',
  {
    description: 'Get a workspace with its changes',
    inputSchema: GetWorkspaceSchema,
  },
  getWorkspaceHandler
);

// --- list_workspaces ---
server.registerTool(
  'list_workspaces',
  {
    description: 'List configuration workspaces',
    inputSchema: ListWorkspacesSchema,
  },
  listWorkspacesHandler
);

// --- delete_workspace ---
server.registerTool(
  'delete_workspace',
  {
    description: 'Delete a draft or rejected workspace',
    inputSchema: GetWorkspaceSchema,
  },
  deleteWorkspaceHandler
);

// --- add_change ---
server.registerTool(
  'add_change',
  {
    description: 'Add a configuration change to a workspace (create, update, or delete)',
    inputSchema: AddChangeSchema,
  },
  addChangeHandler
);

// --- remove_change ---
server.registerTool(
  'remove_change',
  {
    description: 'Remove a change from a workspace',
    inputSchema: RemoveChangeSchema,
  },
  removeChangeHandler
);

// --- preview_workspace ---
server.registerTool(
  'preview_workspace',
  {
    description: 'Preview all changes in a workspace with validation and impact analysis',
    inputSchema: PreviewWorkspaceSchema,
  },
  previewWorkspaceHandler
);

// --- submit_for_review ---
server.registerTool(
  'submit_for_review',
  {
    description: 'Submit a workspace for review',
    inputSchema: GetWorkspaceSchema,
  },
  submitForReviewHandler
);

// --- approve_workspace ---
server.registerTool(
  'approve_workspace',
  {
    description: 'Approve a workspace for application',
    inputSchema: GetWorkspaceSchema,
  },
  approveWorkspaceHandler
);

// --- reject_workspace ---
server.registerTool(
  'reject_workspace',
  {
    description: 'Reject a workspace',
    inputSchema: GetWorkspaceSchema,
  },
  rejectWorkspaceHandler
);

// --- apply_workspace ---
server.registerTool(
  'apply_workspace',
  {
    description: 'Apply all changes in an approved workspace atomically',
    inputSchema: ApplyWorkspaceSchema,
  },
  applyWorkspaceHandler
);

// --- rollback_workspace ---
server.registerTool(
  'rollback_workspace',
  {
    description: 'Rollback all changes from an applied workspace',
    inputSchema: RollbackWorkspaceSchema,
  },
  rollbackWorkspaceHandler
);

// --- get_version_history ---
server.registerTool(
  'get_version_history',
  {
    description: 'Get version history for a configuration',
    inputSchema: VersionHistorySchema,
  },
  getVersionHistoryHandler
);

// --- restore_version ---
server.registerTool(
  'restore_version',
  {
    description: 'Restore a configuration to a previous version',
    inputSchema: RestoreVersionSchema,
  },
  restoreVersionHandler
);

// --- validate_config ---
server.registerTool(
  'validate_config',
  {
    description: 'Validate configuration data against its schema',
    inputSchema: ValidateConfigSchema,
  },
  validateConfigHandler
);

// --- list_config_types ---
server.registerTool(
  'list_config_types',
  {
    description: 'List all available configuration types with their schemas',
    inputSchema: {},
  },
  listConfigTypesHandler
);

// ============================================================================
// STATE MACHINE TOOLS
// ============================================================================

// --- list_state_machines ---
server.registerTool(
  'list_state_machines',
  {
    description: 'List all state machine definitions that control entity lifecycle transitions',
    inputSchema: {
      account_id: z.string().uuid().optional().describe('Optional account ID'),
    },
  },
  async (args) => {
    try {
      const result = listStateMachines(args.account_id);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- get_state_machine ---
server.registerTool(
  'get_state_machine',
  {
    description: 'Get state machine definition for a specific entity type (e.g., "activity", "opportunity")',
    inputSchema: {
      entity_type: z.string().describe('The entity type to get state machine for'),
      account_id: z.string().uuid().optional().describe('Optional account ID'),
    },
  },
  async (args) => {
    try {
      const result = getStateMachineForEntity({
        entityType: args.entity_type,
        accountId: args.account_id,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- validate_state_transition ---
server.registerTool(
  'validate_state_transition',
  {
    description: 'Check if a state transition is valid for an entity type',
    inputSchema: {
      entity_type: z.string().describe('The entity type (e.g., "activity", "opportunity")'),
      current_state: z.string().describe('The current state'),
      new_state: z.string().describe('The target state to transition to'),
      account_id: z.string().uuid().optional().describe('Optional account ID'),
    },
  },
  async (args) => {
    try {
      const result = validateStateTransition({
        entityType: args.entity_type,
        currentState: args.current_state,
        newState: args.new_state,
        accountId: args.account_id,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- get_allowed_transitions ---
server.registerTool(
  'get_allowed_transitions',
  {
    description: 'Get all allowed state transitions from a given state',
    inputSchema: {
      entity_type: z.string().describe('The entity type'),
      current_state: z.string().describe('The current state'),
      account_id: z.string().uuid().optional().describe('Optional account ID'),
    },
  },
  async (args) => {
    try {
      const result = getAllowedTransitionsHandler({
        entityType: args.entity_type,
        currentState: args.current_state,
        accountId: args.account_id,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// WORKFLOW TOOLS
// ============================================================================

// --- list_workflows ---
server.registerTool(
  'list_workflows',
  {
    description: 'List all workflow definitions with their trigger events and step counts',
    inputSchema: {
      account_id: z.string().uuid().optional().describe('Optional account ID'),
    },
  },
  async (args) => {
    try {
      const result = listWorkflows(args.account_id);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- get_workflow ---
server.registerTool(
  'get_workflow',
  {
    description: 'Get a workflow definition with all its steps',
    inputSchema: {
      workflow_slug: z.string().describe('The workflow slug'),
      account_id: z.string().uuid().optional().describe('Optional account ID'),
    },
  },
  async (args) => {
    try {
      const result = getWorkflowWithSteps({
        workflowSlug: args.workflow_slug,
        accountId: args.account_id,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- trigger_workflow ---
server.registerTool(
  'trigger_workflow',
  {
    description: 'Manually trigger a workflow execution',
    inputSchema: {
      workflow_slug: z.string().describe('The workflow slug to trigger'),
      event: z.string().optional().describe('Optional event name (defaults to "manual")'),
      context: z.record(z.string(), z.unknown()).optional().describe('Optional context data for the workflow'),
    },
  },
  async (args) => {
    try {
      const result = await triggerWorkflow({
        workflowSlug: args.workflow_slug,
        event: args.event,
        context: args.context as Record<string, any>,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- list_workflow_enrollments ---
server.registerTool(
  'list_workflow_enrollments',
  {
    description: 'List workflow enrollments, optionally filtered by workflow or status',
    inputSchema: {
      workflow_slug: z.string().optional().describe('Filter by workflow slug'),
      status: z.string().optional().describe('Filter by status (active, completed, paused)'),
      account_id: z.string().uuid().optional().describe('Optional account ID'),
    },
  },
  async (args) => {
    try {
      const result = listWorkflowEnrollments({
        workflowSlug: args.workflow_slug,
        status: args.status,
        accountId: args.account_id,
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- list_workflow_step_types ---
server.registerTool(
  'list_workflow_step_types',
  {
    description: 'List available workflow step types and their handlers',
    inputSchema: {
      account_id: z.string().uuid().optional().describe('Optional account ID'),
    },
  },
  async (args) => {
    try {
      const result = listWorkflowStepTypes(args.account_id);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// INTERPRETER EXECUTOR TOOLS
// ============================================================================

// --- list_interpreter_executors ---
server.registerTool(
  'list_interpreter_executors',
  {
    description: 'List interpreter executors with builtin/runtime/definition status',
    inputSchema: {
      account_id: z.string().uuid().optional().describe('Optional account ID'),
    },
  },
  async (args) => {
    try {
      const result = listInterpreterExecutorsHandler(args.account_id);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// --- validate_interpreter_stage ---
server.registerTool(
  'validate_interpreter_stage',
  {
    description: 'Validate interpreter pipeline stage contract and runtime executor availability',
    inputSchema: {
      account_id: z.string().uuid().optional().describe('Optional account ID'),
      event: z.enum([
        'pre_create',
        'post_create',
        'pre_update',
        'post_update',
        'pre_delete',
        'post_delete',
      ] as const).describe('Lifecycle event'),
      entity_type: z.string().describe('Entity type for the stage'),
      stage: z.object({
        executor: z.string().min(1).describe('Executor key'),
        order: z.number().int().optional().describe('Optional stage order'),
        options: z.record(z.string(), z.unknown()).optional().describe('Optional stage options'),
      }).describe('Stage definition to validate'),
    },
  },
  async (args) => {
    try {
      const result = validateInterpreterStageHandler({
        accountId: args.account_id,
        event: args.event,
        entityType: args.entity_type,
        stage: {
          executor: args.stage.executor,
          order: args.stage.order,
          options: args.stage.options as Record<string, any> | undefined,
        },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// ============================================================================
// START SERVER
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Victory Initiative MCP Server (v1.1.0) running on stdio');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
