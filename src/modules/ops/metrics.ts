/**
 * Metrics - Aggregation/rollup rules (Ops Layer)
 *
 * Metrics compute aggregated values across related records.
 * They enable rollup fields without hardcoding aggregation logic.
 *
 * A Metric is a record that can be CRUDed via MCP/UI, and executed
 * to compute an aggregate value for a target record.
 *
 * Example use cases:
 * - Campaign total cost (sum of activity costs)
 * - Account pipeline value (sum of opportunity amounts)
 * - Contact activity count (count of activities)
 * - Product average rating (avg of review scores)
 */

import { db } from '../../core/db.js';
import { DataRecord, EntityType, RecordRelationship } from '../../core/types.js';
import { listRecords, getRecordBySlug, getRecord, getRelationshipsFrom, getRelationshipsTo } from '../content/services.js';

// --- Types ---

export type AggregationFunction = 'sum' | 'count' | 'avg' | 'min' | 'max';

export interface MetricFilter {
    field: string;
    op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'not_in';
    value: any;
}

export interface MetricDefinition {
    sourceEntityType: EntityType;
    targetEntityType: EntityType;
    sourceField: string;
    targetField: string;
    aggregation: AggregationFunction;
    relationshipPath?: string; // e.g., 'belongs_to', 'has_many'
    filters?: MetricFilter[];
    trackLineage: boolean;
}

export interface MetricResult {
    targetField: string;
    value: number;
    aggregation: AggregationFunction;
    sourceCount: number;
    lineage?: string[]; // IDs of contributing records
    success: boolean;
    error?: string;
}

export interface MetricSnapshot {
    metricSlug: string;
    targetRecordId: string;
    value: number;
    sourceCount: number;
    lineage: string[];
    computedAt: string;
}

// --- Metric Resolution ---

/**
 * Parse a Metric record's data into a structured MetricDefinition
 */
export function parseMetricDefinition(metricRecord: DataRecord): MetricDefinition {
    const data = metricRecord.data || {};

    const getField = (name: string): any => {
        if (data[name] !== undefined) return data[name];

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
        sourceEntityType: getField('Source Entity Type') as EntityType,
        targetEntityType: getField('Target Entity Type') as EntityType,
        sourceField: getField('Source Field') || 'id',
        targetField: getField('Target Field') || metricRecord.slug,
        aggregation: (getField('Aggregation') || 'count') as AggregationFunction,
        relationshipPath: getField('Relationship Path'),
        filters: parseJson(getField('Filters')),
        trackLineage: getField('Track Lineage') === true || getField('Track Lineage') === 'true'
    };
}

/**
 * Get field value from a record (handles both flat and nested structures)
 */
function getFieldValue(record: DataRecord, fieldPath: string): any {
    // Top-level record fields
    if (fieldPath === 'id') return record.id;
    if (fieldPath === 'name') return record.name;
    if (fieldPath === 'slug') return record.slug;
    if (fieldPath === 'type') return record.type;
    if (fieldPath === 'created_at') return record.created_at;
    if (fieldPath === 'updated_at') return record.updated_at;

    // Flat data fields
    if (record.data[fieldPath] !== undefined) {
        return record.data[fieldPath];
    }

    // Nested path traversal
    const parts = fieldPath.split('.');
    let value: any = record;
    for (const part of parts) {
        if (value === null || value === undefined) return undefined;
        value = value[part];
    }

    // Check fieldGroups structure
    if (value === undefined) {
        const fieldGroups = (record.data as any).fieldGroups;
        if (fieldGroups && Array.isArray(fieldGroups)) {
            for (const fg of fieldGroups) {
                const fieldStructs = fg.fieldStructs || [];
                for (const field of fieldStructs) {
                    if (field.nameField === fieldPath) {
                        const prop = field.propertyStructs?.[0];
                        return prop?.valueProperty;
                    }
                }
            }
        }
    }

    return value;
}

/**
 * Check if a record passes all filters
 */
function passesFilters(record: DataRecord, filters: MetricFilter[]): boolean {
    return filters.every(filter => {
        const fieldValue = getFieldValue(record, filter.field);
        return evaluateFilterCondition(fieldValue, filter.op, filter.value);
    });
}

function evaluateFilterCondition(fieldValue: any, op: MetricFilter['op'], compareValue: any): boolean {
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

/**
 * Find related source records for a target record
 */
function findRelatedSourceRecords(
    targetRecord: DataRecord,
    metricDef: MetricDefinition,
    accountId: string
): DataRecord[] {
    const sourceRecords: DataRecord[] = [];

    if (metricDef.relationshipPath) {
        // Use explicit relationship path
        // Check outgoing relationships (target -> source)
        const outRels = getRelationshipsFrom(targetRecord.id, metricDef.relationshipPath);
        for (const rel of outRels) {
            const source = getRecord(rel.to_record_id);
            if (source && source.type === metricDef.sourceEntityType) {
                sourceRecords.push(source);
            }
        }

        // Check incoming relationships (source -> target)
        const inRels = getRelationshipsTo(targetRecord.id, metricDef.relationshipPath);
        for (const rel of inRels) {
            const source = getRecord(rel.from_record_id);
            if (source && source.type === metricDef.sourceEntityType) {
                sourceRecords.push(source);
            }
        }
    } else {
        // No explicit path - try to find by any relationship
        // Check all outgoing
        const outRels = getRelationshipsFrom(targetRecord.id);
        for (const rel of outRels) {
            const source = getRecord(rel.to_record_id);
            if (source && source.type === metricDef.sourceEntityType) {
                sourceRecords.push(source);
            }
        }

        // Check all incoming
        const inRels = getRelationshipsTo(targetRecord.id);
        for (const rel of inRels) {
            const source = getRecord(rel.from_record_id);
            if (source && source.type === metricDef.sourceEntityType) {
                sourceRecords.push(source);
            }
        }
    }

    // Deduplicate by ID
    const seen = new Set<string>();
    return sourceRecords.filter(r => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
    });
}

/**
 * Compute aggregation over a set of values
 */
function aggregate(values: number[], fn: AggregationFunction): number {
    if (values.length === 0) {
        return fn === 'count' ? 0 : 0;
    }

    switch (fn) {
        case 'sum':
            return values.reduce((a, b) => a + b, 0);
        case 'count':
            return values.length;
        case 'avg':
            return values.reduce((a, b) => a + b, 0) / values.length;
        case 'min':
            return Math.min(...values);
        case 'max':
            return Math.max(...values);
        default:
            return 0;
    }
}

/**
 * Compute a single metric for a target record
 */
export function computeMetric(
    metricDef: MetricDefinition,
    targetRecord: DataRecord,
    accountId: string
): MetricResult {
    try {
        // Find related source records
        const sourceRecords = findRelatedSourceRecords(targetRecord, metricDef, accountId);

        // Apply filters
        let filteredRecords = sourceRecords;
        if (metricDef.filters && metricDef.filters.length > 0) {
            filteredRecords = sourceRecords.filter(r => passesFilters(r, metricDef.filters!));
        }

        // Extract values from source field
        const values: number[] = [];
        const lineage: string[] = [];

        for (const source of filteredRecords) {
            if (metricDef.aggregation === 'count') {
                values.push(1);
            } else {
                const rawValue = getFieldValue(source, metricDef.sourceField);
                const numValue = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue));
                if (!isNaN(numValue)) {
                    values.push(numValue);
                }
            }

            if (metricDef.trackLineage) {
                lineage.push(source.id);
            }
        }

        // Compute aggregation
        const result = aggregate(values, metricDef.aggregation);

        return {
            targetField: metricDef.targetField,
            value: result,
            aggregation: metricDef.aggregation,
            sourceCount: filteredRecords.length,
            lineage: metricDef.trackLineage ? lineage : undefined,
            success: true
        };
    } catch (error) {
        return {
            targetField: metricDef.targetField,
            value: 0,
            aggregation: metricDef.aggregation,
            sourceCount: 0,
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Compute all metrics for a target record based on its entity type
 */
export function computeAllMetrics(
    accountId: string,
    targetRecord: DataRecord
): Record<string, MetricResult> {
    const metrics = listMetricsForTargetType(accountId, targetRecord.type);
    const results: Record<string, MetricResult> = {};

    for (const metricRecord of metrics) {
        const def = parseMetricDefinition(metricRecord);
        const result = computeMetric(def, targetRecord, accountId);
        results[result.targetField] = result;
    }

    return results;
}

/**
 * Compute a metric across all target records (batch computation)
 */
export function computeMetricBatch(
    metricDef: MetricDefinition,
    accountId: string
): Map<string, MetricResult> {
    const results = new Map<string, MetricResult>();
    const targetRecords = listRecords(accountId, metricDef.targetEntityType);

    for (const target of targetRecords) {
        const result = computeMetric(metricDef, target, accountId);
        results.set(target.id, result);
    }

    return results;
}

/**
 * List all Metric records for a specific target entity type
 */
export function listMetricsForTargetType(accountId: string, entityType: EntityType): DataRecord[] {
    const allMetrics = listRecords(accountId, 'metric');

    return allMetrics.filter(m => {
        const def = parseMetricDefinition(m);
        return def.targetEntityType === entityType;
    });
}

/**
 * List all Metric records for an account
 */
export function listMetrics(accountId: string): DataRecord[] {
    return listRecords(accountId, 'metric');
}

/**
 * Get a Metric by slug
 */
export function getMetric(accountId: string, slug: string): DataRecord | undefined {
    const record = getRecordBySlug(accountId, slug);
    if (record && record.type === 'metric') {
        return record;
    }
    return undefined;
}

/**
 * Get a snapshot summary of a metric computation
 */
export function createMetricSnapshot(
    metricSlug: string,
    targetRecordId: string,
    result: MetricResult
): MetricSnapshot {
    return {
        metricSlug,
        targetRecordId,
        value: result.value,
        sourceCount: result.sourceCount,
        lineage: result.lineage || [],
        computedAt: new Date().toISOString()
    };
}

/**
 * Validate a metric definition
 */
export function validateMetricDefinition(def: MetricDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!def.sourceEntityType) {
        errors.push('Source Entity Type is required');
    }
    if (!def.targetEntityType) {
        errors.push('Target Entity Type is required');
    }
    if (!def.sourceField && def.aggregation !== 'count') {
        errors.push('Source Field is required for non-count aggregations');
    }
    if (!def.targetField) {
        errors.push('Target Field is required');
    }
    if (!['sum', 'count', 'avg', 'min', 'max'].includes(def.aggregation)) {
        errors.push(`Invalid aggregation function: ${def.aggregation}`);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
