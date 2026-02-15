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
  createEntity,
  getEntity,
  getEntityBySlug,
  updateEntity,
  deleteEntity,
  listEntities,
} from '../core/entities.js';
import {
  createRelationship,
  getRelationshipsFrom,
  getRelationshipsTo,
  deleteRelationship,
} from '../core/relationships.js';
import { normalizeEntityData, FieldGroup, FieldGroupSchema } from '../core/schema/validation.js';
import { EntityType, EntityData, Field, ENTITY_TYPES } from '../core/types.js';

// (Schemas imported from validation.ts)

// Initialize database
initDb();

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
      
      const entity = createEntity({
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

      const entity = updateEntity(args.id, updates);
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
      const deleted = deleteEntity(args.id);
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
      const relationship = createRelationship({
        from_entity_id: args.from_id,
        to_entity_id: args.to_id,
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
      const rows = db.prepare(
        'SELECT dimension, COUNT(*) as count FROM dimension_values GROUP BY dimension ORDER BY dimension'
      ).all() as Array<{ dimension: string; count: number }>;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            count: rows.length,
            types: rows,
          }, null, 2),
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
      const rows = db.prepare(query).all(...params);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            dimension: args.dimension,
            count: rows.length,
            filtered: !!args.filter,
            values: rows,
          }, null, 2),
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
      const rows = db.prepare(query).all(...params);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            count: rows.length,
            dependencies: rows,
          }, null, 2),
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
      // Get all dimension types with counts
      const dimensions = db.prepare(
        'SELECT dimension, COUNT(*) as count FROM dimension_values WHERE account_id IS NULL GROUP BY dimension ORDER BY count DESC'
      ).all() as Array<{ dimension: string; count: number }>;

      // Get dependency summary
      const depSummary = db.prepare(`
        SELECT source_dimension, target_dimension, COUNT(*) as link_count
        FROM dimension_dependencies
        WHERE account_id IS NULL
        GROUP BY source_dimension, target_dimension
      `).all();

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            entityType: args.entity_type,
            availableDimensions: dimensions,
            dimensionRelationships: depSummary,
            usage: {
              tip: 'Use list_dimension_values to get specific values for each dimension',
              example: 'list_dimension_values({ dimension: "industry", filter: { sector: "technology" } })',
            },
          }, null, 2),
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
