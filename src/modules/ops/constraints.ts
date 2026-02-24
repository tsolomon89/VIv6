/**
 * ConstraintEngine - Data-Driven Validation (Ops Layer)
 *
 * Enforces validation constraints defined as `validation_constraint` records.
 * This replaces hardcoded validation logic in invariants.ts.
 *
 * Constraints are evaluated:
 * - pre_create: Before record creation (can block)
 * - pre_update: Before record update (can block)
 * - validation_endpoint: On-demand validation (e.g., /validate/product)
 *
 * Constraint Types:
 * - required_field: Single field must have value
 * - required_fields: Multiple fields must have values
 * - exists_in: Value must exist in database (e.g., pipeline_stages)
 * - max_length: String length limit
 * - min_value / max_value: Numeric bounds
 * - relationship_exists: Must have relationship with conditions
 * - pattern: Regex validation
 * - trigger_activity: Create activity on violation (soft)
 */

import { DataRecord, DataRecordInput, EntityType, ConstraintTrigger, ValidationConstraintData } from '../../core/types.js';
import { InvariantViolation } from '../../core/invariants.js';
import { db } from '../../core/db.js';

// --- Types ---

export interface ConstraintContext {
    record: DataRecord | DataRecordInput;
    previousRecord?: DataRecord;
    trigger: ConstraintTrigger;
    accountId?: string;
}

export interface ConstraintResult {
    constraintSlug: string;
    passed: boolean;
    severity: 'error' | 'warning';
    errorCode?: string;
    errorMessage?: string;
}

// --- Field Value Resolution ---

/**
 * Get field value from a record (handles flat data and nested structures)
 */
function getFieldValue(record: DataRecord | DataRecordInput, fieldPath: string): any {
    const rec = record as any;

    // Top-level record fields
    if (fieldPath === 'id') return rec.id;
    if (fieldPath === 'name') return rec.name;
    if (fieldPath === 'slug') return rec.slug;
    if (fieldPath === 'type') return rec.type;
    if (fieldPath === 'summary') return rec.summary;
    if (fieldPath === 'description') return rec.description;

    // Data fields
    if (rec.data) {
        // Flat data fields (most common case)
        if (rec.data[fieldPath] !== undefined) {
            return rec.data[fieldPath];
        }

        // Check fieldGroups structure (canonical format)
        const fieldGroups = rec.data.fieldGroups || rec.data.fieldGroupStructs;
        if (fieldGroups && Array.isArray(fieldGroups)) {
            for (const fg of fieldGroups) {
                const fields = fg.fieldStructs || fg.fields || [];
                for (const field of fields) {
                    const name = field.nameField || field.name;
                    if (name === fieldPath) {
                        // Check propertyStructs first
                        if (field.propertyStructs?.[0]?.valueProperty !== undefined) {
                            return field.propertyStructs[0].valueProperty;
                        }
                        // Fall back to direct value
                        return field.value;
                    }
                }
            }
        }
    }

    // Nested path traversal (e.g., "data.primary_product_id")
    const parts = fieldPath.split('.');
    let value: any = record;
    for (const part of parts) {
        if (value === null || value === undefined) return undefined;
        value = value[part];
    }

    return value;
}

/**
 * Evaluate a simple condition
 */
function evaluateCondition(
    record: DataRecord | DataRecordInput,
    condition: { field: string; op: string; value: any }
): boolean {
    const fieldValue = getFieldValue(record, condition.field);

    switch (condition.op) {
        case 'eq':
            return fieldValue === condition.value;
        case 'neq':
            return fieldValue !== condition.value;
        case 'gt':
            return fieldValue > condition.value;
        case 'gte':
            return fieldValue >= condition.value;
        case 'lt':
            return fieldValue < condition.value;
        case 'lte':
            return fieldValue <= condition.value;
        case 'exists':
            return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
        case 'not_exists':
            return fieldValue === null || fieldValue === undefined || fieldValue === '';
        default:
            return true;
    }
}

// --- Constraint Loading ---

/**
 * Get all validation_constraint records for a given entity type and trigger.
 * Also includes constraints with entity_type '*' (wildcard, applies to all types).
 */
export function getConstraintsForTrigger(
    entityType: EntityType,
    trigger: ConstraintTrigger
): DataRecord[] {
    try {
        const rows = db.prepare(`
            SELECT * FROM records
            WHERE type = 'validation_constraint'
            AND (json_extract(data, '$.entity_type') = ? OR json_extract(data, '$.entity_type') = '*')
            AND json_extract(data, '$.trigger') = ?
        `).all(entityType, trigger) as any[];

        return rows.map(row => ({
            ...row,
            data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
        }));
    } catch (err) {
        console.warn(`[ConstraintEngine] Error loading constraints: ${err instanceof Error ? err.message : String(err)}`);
        return [];
    }
}

// --- Validation Helpers ---

/**
 * Query pipeline_stage records for valid pipeline_types
 */
function getValidPipelineTypes(): string[] {
    try {
        const rows = db.prepare(`
            SELECT DISTINCT json_extract(data, '$.pipeline_type') as pipeline_type
            FROM records
            WHERE type = 'pipeline_stage' AND json_extract(data, '$.pipeline_type') IS NOT NULL
        `).all() as Array<{ pipeline_type: string }>;
        return rows.map(r => r.pipeline_type);
    } catch (err) {
        console.warn(`[ConstraintEngine] Could not query pipeline_stages: ${err instanceof Error ? err.message : String(err)}`);
        return [];
    }
}

/**
 * Check if a relationship exists with optional conditions
 */
function checkRelationshipExists(
    recordId: string,
    relationshipType: string,
    powerLevelMinimum?: number
): boolean {
    try {
        // Get relationships from this record
        const relationships = db.prepare(`
            SELECT r.*, target.data as target_data
            FROM record_relationships r
            JOIN records target ON r.to_record_id = target.id
            WHERE r.from_record_id = ?
            AND r.relationship_type = ?
        `).all(recordId, relationshipType) as any[];

        if (relationships.length === 0) return false;

        // If power_level_minimum specified, check target records
        if (powerLevelMinimum !== undefined) {
            return relationships.some(rel => {
                const targetData = typeof rel.target_data === 'string'
                    ? JSON.parse(rel.target_data)
                    : rel.target_data;
                const powerLevel = targetData?.power_level ?? 0;
                return powerLevel >= powerLevelMinimum;
            });
        }

        return true;
    } catch (err) {
        console.warn(`[ConstraintEngine] Error checking relationships: ${err instanceof Error ? err.message : String(err)}`);
        return false;
    }
}

// --- Constraint Evaluation ---

/**
 * Evaluate a single constraint against a record
 */
export function evaluateConstraint(
    constraintRecord: DataRecord,
    context: ConstraintContext
): ConstraintResult {
    const data = constraintRecord.data as ValidationConstraintData;
    const { record } = context;
    const severity = data.severity || 'error';

    // Check condition first (if present)
    if (data.condition) {
        const conditionMet = evaluateCondition(record, data.condition);
        if (!conditionMet) {
            // Condition not met = constraint doesn't apply = pass
            return {
                constraintSlug: constraintRecord.slug,
                passed: true,
                severity
            };
        }
    }

    // Evaluate based on constraint_type
    switch (data.constraint_type) {
        case 'required_field': {
            const value = getFieldValue(record, data.field!);
            const passed = value !== null && value !== undefined && value !== '';
            return {
                constraintSlug: constraintRecord.slug,
                passed,
                severity,
                errorCode: passed ? undefined : data.error_code,
                errorMessage: passed ? undefined : data.error_message
            };
        }

        case 'required_fields': {
            const missing = (data.fields || []).filter(f => {
                const value = getFieldValue(record, f);
                return value === null || value === undefined || value === '';
            });
            const passed = missing.length === 0;
            return {
                constraintSlug: constraintRecord.slug,
                passed,
                severity,
                errorCode: passed ? undefined : data.error_code,
                errorMessage: passed ? undefined : `${data.error_message} (missing: ${missing.join(', ')})`
            };
        }

        case 'exists_in': {
            const value = getFieldValue(record, data.field!);

            // First check if field has a value
            if (value === null || value === undefined || value === '') {
                return {
                    constraintSlug: constraintRecord.slug,
                    passed: false,
                    severity,
                    errorCode: data.error_code,
                    errorMessage: `${data.field} is required`
                };
            }

            // Then validate against allowed values
            let validValues: string[] = [];
            if (data.validation === 'exists_in_pipeline_stages') {
                validValues = getValidPipelineTypes();
            }

            // If no valid values found (not seeded yet), skip validation
            if (validValues.length === 0) {
                return {
                    constraintSlug: constraintRecord.slug,
                    passed: true,
                    severity
                };
            }

            const passed = validValues.includes(String(value).toLowerCase());
            return {
                constraintSlug: constraintRecord.slug,
                passed,
                severity,
                errorCode: passed ? undefined : data.error_code,
                errorMessage: passed ? undefined : `${data.error_message}. Valid values: ${validValues.join(', ')}`
            };
        }

        case 'max_length': {
            const value = getFieldValue(record, data.field!);
            const strValue = String(value || '');
            const passed = strValue.length <= (data.max_length || Infinity);
            return {
                constraintSlug: constraintRecord.slug,
                passed,
                severity,
                errorCode: passed ? undefined : data.error_code,
                errorMessage: passed ? undefined : `${data.error_message} (max: ${data.max_length}, got: ${strValue.length})`
            };
        }

        case 'min_value': {
            const value = getFieldValue(record, data.field!);
            const numValue = Number(value);
            const passed = !isNaN(numValue) && numValue >= (data.min_value || -Infinity);
            return {
                constraintSlug: constraintRecord.slug,
                passed,
                severity,
                errorCode: passed ? undefined : data.error_code,
                errorMessage: passed ? undefined : `${data.error_message} (min: ${data.min_value}, got: ${numValue})`
            };
        }

        case 'max_value': {
            const value = getFieldValue(record, data.field!);
            const numValue = Number(value);
            const passed = !isNaN(numValue) && numValue <= (data.max_value || Infinity);
            return {
                constraintSlug: constraintRecord.slug,
                passed,
                severity,
                errorCode: passed ? undefined : data.error_code,
                errorMessage: passed ? undefined : `${data.error_message} (max: ${data.max_value}, got: ${numValue})`
            };
        }

        case 'relationship_exists': {
            const recordId = (record as any).id;
            if (!recordId) {
                // Can't check relationships on record without ID (pre_create)
                // This constraint type is typically used with validation_endpoint trigger
                return {
                    constraintSlug: constraintRecord.slug,
                    passed: true,
                    severity
                };
            }

            const passed = checkRelationshipExists(
                recordId,
                data.relationship_type!,
                data.power_level_minimum
            );
            return {
                constraintSlug: constraintRecord.slug,
                passed,
                severity,
                errorCode: passed ? undefined : data.error_code,
                errorMessage: passed ? undefined : data.error_message
            };
        }

        case 'pattern': {
            const value = getFieldValue(record, data.field!);
            const strValue = String(value ?? '');

            // If allow_empty is true and value is empty/null/undefined, pass immediately
            if (data.allow_empty && (value === null || value === undefined || strValue === '')) {
                return {
                    constraintSlug: constraintRecord.slug,
                    passed: true,
                    severity
                };
            }

            const pattern = new RegExp(data.pattern || '.*');
            const passed = pattern.test(strValue);
            return {
                constraintSlug: constraintRecord.slug,
                passed,
                severity,
                errorCode: passed ? undefined : data.error_code,
                errorMessage: passed ? undefined : data.error_message
            };
        }

        case 'trigger_activity': {
            // Soft constraint - triggers an activity instead of blocking
            // This is handled differently (in post hooks, not pre hooks)
            return {
                constraintSlug: constraintRecord.slug,
                passed: true,  // Never blocks
                severity: 'warning'
            };
        }

        default:
            console.warn(`[ConstraintEngine] Unknown constraint type: ${data.constraint_type}`);
            return {
                constraintSlug: constraintRecord.slug,
                passed: true,
                severity
            };
    }
}

// --- Public API ---

/**
 * Enforce all constraints for a record.
 * Throws InvariantViolation on first error.
 * Returns array of warning results.
 */
export function enforceConstraints(context: ConstraintContext): ConstraintResult[] {
    const entityType = (context.record as any).type as EntityType;
    if (!entityType) return [];

    const constraints = getConstraintsForTrigger(entityType, context.trigger);
    const warnings: ConstraintResult[] = [];

    for (const constraint of constraints) {
        const result = evaluateConstraint(constraint, context);

        if (!result.passed) {
            if (result.severity === 'error') {
                throw new InvariantViolation(
                    result.errorCode || 'CONSTRAINT_VIOLATION',
                    (constraint.data as ValidationConstraintData).field || 'unknown',
                    result.errorMessage || 'Validation constraint failed'
                );
            } else {
                // Warning - log and continue
                console.warn(`[ConstraintEngine] Warning: ${result.errorMessage}`);
                warnings.push(result);
            }
        }
    }

    return warnings;
}

/**
 * Validate a record against constraints without throwing.
 * Returns all results (pass/fail) for UI display.
 */
export function validateConstraints(context: ConstraintContext): ConstraintResult[] {
    const entityType = (context.record as any).type as EntityType;
    if (!entityType) return [];

    const constraints = getConstraintsForTrigger(entityType, context.trigger);
    return constraints.map(c => evaluateConstraint(c, context));
}

/**
 * List all validation_constraint records
 */
export function listConstraints(): DataRecord[] {
    try {
        const rows = db.prepare(`
            SELECT * FROM records
            WHERE type = 'validation_constraint'
            ORDER BY json_extract(data, '$.entity_type'), json_extract(data, '$.trigger')
        `).all() as any[];

        return rows.map(row => ({
            ...row,
            data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data
        }));
    } catch (err) {
        console.warn(`[ConstraintEngine] Error listing constraints: ${err instanceof Error ? err.message : String(err)}`);
        return [];
    }
}
