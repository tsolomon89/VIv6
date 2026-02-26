/**
 * MCP-to-Function Bridge
 *
 * Converts MCP tools to AI provider function-calling format
 * and executes tools with proper account scoping.
 *
 * Uses existing handlers and records API rather than direct SQL.
 */

import {
    createRecord,
    getRecord,
    getRecordBySlug,
    updateRecord,
    deleteRecord,
    listRecords,
    createRelationship,
    getRelationshipsFrom,
    getRelationshipsTo,
} from '../../../core/records.js';
import { db } from '../../../core/db.js';
import { normalizeEntityData } from '../../../core/schema/validation.js';
import {
    listDimensionTypes,
    listDimensionValues,
    listDimensionDependencies,
    getTargetingSuggestions,
} from '../../../mcp/handlers/dimensions.js';
import type { EntityType } from '../../../core/types.js';
import type { MCPToolDefinition, ProviderTool } from '../types.js';

/**
 * MCP tool execution result
 */
export interface MCPToolResult {
    success: boolean;
    result: unknown;
    error?: string;
}

/**
 * All available MCP tool names
 */
export const MCP_TOOL_NAMES = [
    // Entity CRUD
    'create_entity',
    'get_entity',
    'list_entities',
    'update_entity',
    'delete_entity',

    // Relationships
    'link_entities',
    'get_relationships',

    // Dimensions (taxonomy)
    'list_dimension_types',
    'list_dimension_values',
    'list_dimension_dependencies',
    'get_targeting_suggestions',

    // Views (read-only)
    'list_views',
    'execute_view',
] as const;

export type MCPToolName = typeof MCP_TOOL_NAMES[number];

/**
 * Get MCP tool definitions for AI providers.
 * Filters by allowed tools if specified.
 */
export function getMCPToolDefinitions(allowedTools?: string[]): MCPToolDefinition[] {
    const allTools = getToolDefinitions();

    if (!allowedTools || allowedTools.length === 0) {
        return allTools;
    }

    return allTools.filter(tool => allowedTools.includes(tool.name));
}

/**
 * Convert MCP tool definitions to AI provider format.
 */
export function convertToProviderTools(mcpTools: MCPToolDefinition[]): ProviderTool[] {
    return mcpTools.map(tool => ({
        type: 'function',
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
        },
    }));
}

/**
 * Execute an MCP tool with account scoping.
 */
export async function executeMCPTool(
    toolName: string,
    args: Record<string, unknown>,
    accountId: string
): Promise<MCPToolResult> {
    try {
        // Inject account_id for tools that need it
        const scopedArgs = {
            ...args,
            account_id: args.account_id || accountId,
        };

        const handler = getToolHandler(toolName as MCPToolName);
        if (!handler) {
            return {
                success: false,
                result: null,
                error: `Unknown tool: ${toolName}`,
            };
        }

        const result = await handler(scopedArgs, accountId);
        return {
            success: true,
            result,
        };
    } catch (error) {
        return {
            success: false,
            result: null,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/**
 * Get all tool definitions.
 * These match the MCP server's tool schemas.
 */
function getToolDefinitions(): MCPToolDefinition[] {
    return [
        // --- Entity CRUD ---
        {
            name: 'create_entity',
            description: 'Create a new entity. Supports both simple key-value data and structured fieldGroups.',
            inputSchema: {
                type: 'object',
                properties: {
                    type: {
                        type: 'string',
                        description: 'Entity type (brand, product, feature, solution, useCase, persona, contact, opportunity, activity, organization, account)',
                    },
                    name: { type: 'string', description: 'Display name' },
                    slug: { type: 'string', description: 'URL-friendly identifier' },
                    description: { type: 'string', description: 'Optional description' },
                    data: { type: 'object', description: 'Simple key-value data' },
                },
                required: ['type', 'name', 'slug'],
            },
        },
        {
            name: 'get_entity',
            description: 'Get an entity by ID (UUID) or slug',
            inputSchema: {
                type: 'object',
                properties: {
                    identifier: { type: 'string', description: 'Entity ID or slug' },
                },
                required: ['identifier'],
            },
        },
        {
            name: 'list_entities',
            description: 'List entities with optional type filter',
            inputSchema: {
                type: 'object',
                properties: {
                    type: { type: 'string', description: 'Filter by entity type' },
                    limit: { type: 'number', description: 'Max results (default 100)' },
                },
            },
        },
        {
            name: 'update_entity',
            description: 'Update an existing entity',
            inputSchema: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Entity ID' },
                    name: { type: 'string', description: 'New name' },
                    description: { type: 'string', description: 'New description' },
                    data: { type: 'object', description: 'Data to merge' },
                },
                required: ['id'],
            },
        },
        {
            name: 'delete_entity',
            description: 'Delete an entity by ID',
            inputSchema: {
                type: 'object',
                properties: {
                    id: { type: 'string', description: 'Entity ID' },
                },
                required: ['id'],
            },
        },

        // --- Relationships ---
        {
            name: 'link_entities',
            description: 'Create a relationship between two entities',
            inputSchema: {
                type: 'object',
                properties: {
                    from_id: { type: 'string', description: 'Source entity ID' },
                    to_id: { type: 'string', description: 'Target entity ID' },
                    rel_type: { type: 'string', description: 'Relationship type (e.g., has_feature, targets_persona)' },
                },
                required: ['from_id', 'to_id', 'rel_type'],
            },
        },
        {
            name: 'get_relationships',
            description: 'Get relationships for an entity',
            inputSchema: {
                type: 'object',
                properties: {
                    entity_id: { type: 'string', description: 'Entity ID' },
                    direction: { type: 'string', enum: ['from', 'to', 'both'], description: 'Relationship direction' },
                },
                required: ['entity_id'],
            },
        },

        // --- Dimensions (Taxonomy) ---
        {
            name: 'list_dimension_types',
            description: 'List all dimension types (geography, industry, etc.)',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'list_dimension_values',
            description: 'List values for a dimension type',
            inputSchema: {
                type: 'object',
                properties: {
                    dimension: { type: 'string', description: 'Dimension type slug' },
                    parent_id: { type: 'string', description: 'Filter by parent value ID' },
                    filter: { type: 'object', description: 'Filter by related dimension values (e.g., { sector: "technology" })' },
                },
                required: ['dimension'],
            },
        },
        {
            name: 'list_dimension_dependencies',
            description: 'List dependencies between dimension values',
            inputSchema: {
                type: 'object',
                properties: {
                    source_dimension: { type: 'string', description: 'Source dimension type' },
                    target_dimension: { type: 'string', description: 'Target dimension type' },
                },
            },
        },
        {
            name: 'get_targeting_suggestions',
            description: 'Get targeting suggestions based on entity type',
            inputSchema: {
                type: 'object',
                properties: {
                    entity_type: { type: 'string', description: 'Entity type to get suggestions for' },
                },
                required: ['entity_type'],
            },
        },

        // --- Views (read-only, simplified) ---
        {
            name: 'list_views',
            description: 'List available data views',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'execute_view',
            description: 'Execute a view query',
            inputSchema: {
                type: 'object',
                properties: {
                    view_name: { type: 'string', description: 'View name' },
                    params: { type: 'object', description: 'View parameters' },
                },
                required: ['view_name'],
            },
        },
    ];
}

/**
 * Get the handler function for a tool.
 */
function getToolHandler(
    toolName: MCPToolName
): ((args: Record<string, unknown>, accountId: string) => Promise<unknown>) | null {
    const handlers: Record<string, (args: Record<string, unknown>, accountId: string) => Promise<unknown>> = {
        // Entity CRUD - using records API
        create_entity: async (args, accountId) => {
            const entityData = normalizeEntityData(
                args.data as Record<string, unknown> | undefined,
                undefined
            );
            return createRecord({
                type: args.type as EntityType,
                name: args.name as string,
                slug: args.slug as string,
                description: args.description as string | undefined,
                data: entityData,
                account_id: accountId,
            });
        },

        get_entity: async (args, accountId) => {
            const identifier = args.identifier as string;
            // Try by ID first, then by slug
            let entity = getRecord(identifier);
            if (!entity) {
                entity = getRecordBySlug(accountId, identifier);
            }
            if (!entity) {
                throw new Error(`Entity not found: ${identifier}`);
            }
            return entity;
        },

        list_entities: async (args, accountId) => {
            return listRecords(accountId, args.type as EntityType | undefined);
        },

        update_entity: async (args) => {
            const id = args.id as string;
            const entityData = args.data
                ? normalizeEntityData(args.data as Record<string, unknown>, undefined)
                : undefined;
            return updateRecord(id, {
                name: args.name as string | undefined,
                description: args.description as string | undefined,
                data: entityData,
            });
        },

        delete_entity: async (args) => {
            const id = args.id as string;
            await deleteRecord(id);
            return { deleted: true, id };
        },

        // Relationships - using records API
        link_entities: async (args) => {
            return createRelationship({
                from_record_id: args.from_id as string,
                to_record_id: args.to_id as string,
                relationship_type: args.rel_type as string,
            });
        },

        get_relationships: async (args) => {
            const entityId = args.entity_id as string;
            const direction = (args.direction as string) || 'both';

            const result: { from: unknown[]; to: unknown[] } = { from: [], to: [] };

            if (direction === 'from' || direction === 'both') {
                result.from = getRelationshipsFrom(entityId);
            }
            if (direction === 'to' || direction === 'both') {
                result.to = getRelationshipsTo(entityId);
            }

            return result;
        },

        // Dimensions - using dimension handlers
        list_dimension_types: async () => {
            return listDimensionTypes();
        },

        list_dimension_values: async (args) => {
            return listDimensionValues({
                dimension: args.dimension as string,
                parent_id: args.parent_id as string | undefined,
                filter: args.filter as Record<string, string> | undefined,
            });
        },

        list_dimension_dependencies: async (args) => {
            return listDimensionDependencies({
                source_dimension: args.source_dimension as string | undefined,
                target_dimension: args.target_dimension as string | undefined,
            });
        },

        get_targeting_suggestions: async (args) => {
            return getTargetingSuggestions({
                entity_type: args.entity_type as string,
            });
        },

        // Views - using records API
        list_views: async (args, accountId) => {
            // List records of type 'view'
            return listRecords(accountId, 'view' as EntityType);
        },

        execute_view: async (args, accountId) => {
            const viewName = args.view_name as string;
            const parameters = args.parameters as Record<string, unknown> | undefined;

            // Get the view record
            const view = getRecordBySlug(accountId, viewName);

            if (!view) {
                throw new Error(`View not found: ${viewName}`);
            }

            const viewData = view.data as Record<string, unknown>;
            const targetType = viewData.target_entity_type as string;
            let filter = viewData.filter as string | undefined;

            if (!targetType) {
                throw new Error(`View ${viewName} has no target_entity_type`);
            }

            // Substitute parameters in filter
            if (filter && parameters) {
                for (const [key, value] of Object.entries(parameters)) {
                    const placeholder = `{{${key}}}`;
                    filter = filter.replace(new RegExp(placeholder, 'g'), String(value));
                }
            }

            // Build query
            let query = `SELECT * FROM records WHERE account_id = ? AND type = ?`;
            const queryArgs: unknown[] = [accountId, targetType];

            // Parse and apply filter
            if (filter) {
                // Convert view filter to SQL WHERE clause
                // Supports: field = 'value', field != 'value', field > value, field < value
                // Connected by AND/OR
                const sqlFilter = parseViewFilter(filter);
                if (sqlFilter) {
                    query += ` AND (${sqlFilter})`;
                }
            }

            query += ` ORDER BY created_at DESC LIMIT 100`;

            try {
                const rows = db.prepare(query).all(...queryArgs) as Array<{ id: string; name: string; slug: string; data: string }>;

                // Parse data JSON and flatten for output
                const results = rows.map(row => {
                    const data = JSON.parse(row.data || '{}');
                    return {
                        id: row.id,
                        name: row.name,
                        slug: row.slug,
                        ...data,
                    };
                });

                // Apply in-memory filtering for JSON fields (data.*)
                const filteredResults = filter
                    ? results.filter(r => applyInMemoryFilter(r, filter!))
                    : results;

                return {
                    view: viewName,
                    target_type: targetType,
                    count: filteredResults.length,
                    results: filteredResults,
                };
            } catch (err) {
                throw new Error(`View execution failed: ${err instanceof Error ? err.message : String(err)}`);
            }
        },
    };

    return handlers[toolName] || null;
}

/**
 * Check if a tool name is valid.
 */
export function isValidTool(toolName: string): toolName is MCPToolName {
    return MCP_TOOL_NAMES.includes(toolName as MCPToolName);
}

/**
 * Get tool names by category.
 */
export function getToolsByCategory(): Record<string, MCPToolName[]> {
    return {
        entities: ['create_entity', 'get_entity', 'list_entities', 'update_entity', 'delete_entity'],
        relationships: ['link_entities', 'get_relationships'],
        dimensions: ['list_dimension_types', 'list_dimension_values', 'list_dimension_dependencies', 'get_targeting_suggestions'],
        views: ['list_views', 'execute_view'],
    };
}

// --- View Filtering Helpers ---

/**
 * Parse a view filter string and return a partial SQL WHERE clause.
 * Only handles simple top-level column filters, not JSON data fields.
 * Returns null if filter cannot be converted to SQL.
 */
function parseViewFilter(filter: string): string | null {
    // View filters are designed for in-memory filtering of JSON data
    // We return null here since most filters reference data.* fields
    // which need to be filtered in-memory after JSON parsing
    return null;
}

/**
 * Apply a filter expression to a record in memory.
 * Supports basic operators: =, !=, >, <, >=, <=
 * Supports AND/OR connectors (case-insensitive).
 */
function applyInMemoryFilter(record: Record<string, unknown>, filter: string): boolean {
    // Split by AND/OR while preserving the connector
    const tokens = filter.split(/\s+(AND|OR)\s+/i);

    let result = true;
    let pendingOr = false;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i].trim();

        if (token.toUpperCase() === 'AND') {
            continue;
        }
        if (token.toUpperCase() === 'OR') {
            pendingOr = true;
            continue;
        }

        // Parse condition: field operator value
        const conditionResult = evaluateCondition(record, token);

        if (pendingOr) {
            result = result || conditionResult;
            pendingOr = false;
        } else {
            result = result && conditionResult;
        }
    }

    return result;
}

/**
 * Evaluate a single condition like "stage != 'won'"
 */
function evaluateCondition(record: Record<string, unknown>, condition: string): boolean {
    // Match patterns like: field = 'value', field != 'value', field > 10
    const match = condition.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(=|!=|<>|>=|<=|>|<)\s*(.+)\s*$/);
    if (!match) {
        // If we can't parse, assume it passes
        return true;
    }

    const [, field, operator, rawValue] = match;
    const recordValue = record[field];

    // Parse the value (remove quotes if present)
    let value: string | number = rawValue.trim();
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1);
    } else if (!isNaN(Number(value))) {
        value = Number(value);
    }

    // Handle null/undefined record values
    if (recordValue === null || recordValue === undefined) {
        if (operator === '!=' || operator === '<>') {
            return true; // null != 'anything' is true
        }
        return false;
    }

    // Compare based on operator
    switch (operator) {
        case '=':
            return String(recordValue).toLowerCase() === String(value).toLowerCase();
        case '!=':
        case '<>':
            return String(recordValue).toLowerCase() !== String(value).toLowerCase();
        case '>':
            return Number(recordValue) > Number(value);
        case '<':
            return Number(recordValue) < Number(value);
        case '>=':
            return Number(recordValue) >= Number(value);
        case '<=':
            return Number(recordValue) <= Number(value);
        default:
            return true;
    }
}
