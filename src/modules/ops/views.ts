/**
 * Views - Query definitions as records (Ops Layer)
 *
 * Views are the "read" side of the Ops layer. They define queries
 * that return sets of records, enabling data-driven binding resolution.
 *
 * A View is a record that can be CRUDed via MCP/UI, and executed
 * to return filtered, sorted, limited result sets.
 */

import { db } from '../../core/db.js';
import { DataRecord, EntityType } from '../../core/types.js';
import { listRecords, getRecordBySlug } from '../content/services.js';

// --- Types ---

export interface ViewFilter {
    field: string;
    op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'not_in';
    value: any;
}

export interface ViewSort {
    field: string;
    direction: 'asc' | 'desc';
}

export interface ViewContextParam {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'record_id';
    required?: boolean;
}

export interface ViewDefinition {
    sourceType: 'record' | 'relationship' | 'aggregate';
    targetEntityType: EntityType;
    filters?: ViewFilter[];
    sort?: ViewSort[];
    limit?: number;
    contextParams?: ViewContextParam[];
    outputSchema?: Record<string, string>; // field name -> type
}

export interface ViewExecutionContext {
    accountId: string;
    params?: Record<string, any>;
    sourceEntity?: DataRecord; // For relationship-based views
}

export interface ViewResult {
    records: DataRecord[];
    total: number;
    viewSlug: string;
}

// --- View Resolution ---

/**
 * Parse a View record's data into a structured ViewDefinition
 */
export function parseViewDefinition(viewRecord: DataRecord): ViewDefinition {
    const data = viewRecord.data || {};

    // Handle both flat and fieldGroups structures
    const getField = (name: string): any => {
        // Check flat structure first (from seeds)
        if (data[name] !== undefined) return data[name];

        // Check fieldGroups structure (use type assertion for flexible data)
        const fieldGroups = (data as any).fieldGroups;
        if (fieldGroups && Array.isArray(fieldGroups)) {
            for (const fg of fieldGroups) {
                const fieldStructs = fg.fieldStructs || [];
                for (const field of fieldStructs) {
                    if (field.nameField === name) {
                        const prop = field.propertyStructs?.[0];
                        return prop?.valueProperty;
                    }
                }
            }
        }
        return undefined;
    };

    const parseJson = (value: any): any => {
        if (typeof value === 'string') {
            try { return JSON.parse(value); } catch { return undefined; }
        }
        return value;
    };

    return {
        sourceType: getField('Source Type') || 'record',
        targetEntityType: getField('Target Entity Type') as EntityType,
        filters: parseJson(getField('Filters')),
        sort: parseJson(getField('Sort')),
        limit: getField('Limit'),
        contextParams: parseJson(getField('Context Params')),
        outputSchema: parseJson(getField('Output Schema'))
    };
}

/**
 * Execute a View and return matching records
 */
export function executeView(
    viewDef: ViewDefinition,
    context: ViewExecutionContext
): ViewResult {
    const { accountId, params = {}, sourceEntity } = context;

    if (viewDef.sourceType === 'record') {
        return executeRecordView(viewDef, accountId, params);
    }

    if (viewDef.sourceType === 'relationship' && sourceEntity) {
        return executeRelationshipView(viewDef, sourceEntity, accountId, params);
    }

    // Default fallback
    return { records: [], total: 0, viewSlug: '' };
}

/**
 * Execute a record-based View (queries the records table directly)
 */
function executeRecordView(
    viewDef: ViewDefinition,
    accountId: string,
    params: Record<string, any>
): ViewResult {
    // Start with all records of the target type
    let records = listRecords(accountId, viewDef.targetEntityType);

    // Apply filters
    if (viewDef.filters && viewDef.filters.length > 0) {
        records = applyFilters(records, viewDef.filters, params);
    }

    // Apply sorting
    if (viewDef.sort && viewDef.sort.length > 0) {
        records = applySort(records, viewDef.sort);
    }

    const total = records.length;

    // Apply limit
    if (viewDef.limit && viewDef.limit > 0) {
        records = records.slice(0, viewDef.limit);
    }

    return { records, total, viewSlug: '' };
}

/**
 * Execute a relationship-based View (queries related records)
 */
function executeRelationshipView(
    viewDef: ViewDefinition,
    sourceEntity: DataRecord,
    accountId: string,
    params: Record<string, any>
): ViewResult {
    // Get relationships from the source entity
    const stmt = db.prepare(`
        SELECT r.* FROM records r
        JOIN record_relationships rel ON r.id = rel.to_record_id
        WHERE rel.from_record_id = ? AND r.type = ?
    `);

    const rows = stmt.all(sourceEntity.id, viewDef.targetEntityType) as any[];
    let records: DataRecord[] = rows.map(row => ({
        ...row,
        data: JSON.parse(row.data)
    }));

    // Apply filters
    if (viewDef.filters && viewDef.filters.length > 0) {
        records = applyFilters(records, viewDef.filters, params);
    }

    // Apply sorting
    if (viewDef.sort && viewDef.sort.length > 0) {
        records = applySort(records, viewDef.sort);
    }

    const total = records.length;

    // Apply limit
    if (viewDef.limit && viewDef.limit > 0) {
        records = records.slice(0, viewDef.limit);
    }

    return { records, total, viewSlug: '' };
}

// --- Filter/Sort Helpers ---

function applyFilters(
    records: DataRecord[],
    filters: ViewFilter[],
    params: Record<string, any>
): DataRecord[] {
    return records.filter(record => {
        return filters.every(filter => {
            const fieldValue = getFieldValue(record, filter.field);
            let compareValue = filter.value;

            // Substitute parameters
            if (typeof compareValue === 'string' && compareValue.startsWith('$')) {
                const paramName = compareValue.slice(1);
                compareValue = params[paramName];
            }

            return evaluateCondition(fieldValue, filter.op, compareValue);
        });
    });
}

function applySort(records: DataRecord[], sorts: ViewSort[]): DataRecord[] {
    return [...records].sort((a, b) => {
        for (const sort of sorts) {
            const aVal = getFieldValue(a, sort.field);
            const bVal = getFieldValue(b, sort.field);

            let comparison = 0;
            if (aVal < bVal) comparison = -1;
            else if (aVal > bVal) comparison = 1;

            if (comparison !== 0) {
                return sort.direction === 'desc' ? -comparison : comparison;
            }
        }
        return 0;
    });
}

function getFieldValue(record: DataRecord, fieldPath: string): any {
    // Handle top-level record fields
    if (fieldPath === 'name') return record.name;
    if (fieldPath === 'slug') return record.slug;
    if (fieldPath === 'type') return record.type;
    if (fieldPath === 'created_at') return record.created_at;
    if (fieldPath === 'updated_at') return record.updated_at;

    // Handle data fields (flat structure)
    if (record.data[fieldPath] !== undefined) {
        return record.data[fieldPath];
    }

    // Handle nested paths (e.g., "data.amount")
    const parts = fieldPath.split('.');
    let value: any = record;
    for (const part of parts) {
        if (value === null || value === undefined) return undefined;
        value = value[part];
    }

    return value;
}

function evaluateCondition(fieldValue: any, op: ViewFilter['op'], compareValue: any): boolean {
    switch (op) {
        case 'eq': return fieldValue === compareValue;
        case 'neq': return fieldValue !== compareValue;
        case 'gt': return fieldValue > compareValue;
        case 'gte': return fieldValue >= compareValue;
        case 'lt': return fieldValue < compareValue;
        case 'lte': return fieldValue <= compareValue;
        case 'contains':
            if (typeof fieldValue === 'string') {
                return fieldValue.includes(String(compareValue));
            }
            return false;
        case 'in':
            if (Array.isArray(compareValue)) {
                return compareValue.includes(fieldValue);
            }
            return false;
        case 'not_in':
            if (Array.isArray(compareValue)) {
                return !compareValue.includes(fieldValue);
            }
            return true;
        default:
            return true;
    }
}

// --- Public API ---

/**
 * Get a View by slug and execute it
 */
export function resolveView(
    accountId: string,
    viewSlug: string,
    context?: Partial<ViewExecutionContext>
): ViewResult {
    const viewRecord = getRecordBySlug(accountId, viewSlug);
    if (!viewRecord || viewRecord.type !== 'view') {
        return { records: [], total: 0, viewSlug };
    }

    const viewDef = parseViewDefinition(viewRecord);
    const result = executeView(viewDef, {
        accountId,
        ...context
    });

    return { ...result, viewSlug };
}

/**
 * List all available Views for an account
 */
export function listViews(accountId: string): DataRecord[] {
    return listRecords(accountId, 'view');
}

/**
 * Get the signature of a View (for UI introspection)
 */
export function getViewSignature(viewRecord: DataRecord): {
    inputs: ViewContextParam[];
    outputs: Record<string, string>;
} {
    const viewDef = parseViewDefinition(viewRecord);
    return {
        inputs: viewDef.contextParams || [],
        outputs: viewDef.outputSchema || {}
    };
}
