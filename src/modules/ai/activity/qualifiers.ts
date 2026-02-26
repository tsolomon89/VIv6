/**
 * Oblio Qualifier Evaluation System
 *
 * Implements the full Oblio qualifier model where:
 * - Qualifications = Physical data fields (raw matter)
 * - Qualifiers = Boolean logic gates that evaluate Qualifications
 * - Activity "Won" = When ALL Qualifiers evaluate to TRUE
 * - Chain Reaction: Activity Won -> Qualifier True -> Opportunity Won -> Next Opportunity Created
 *
 * Qualifiers use "object : fieldGroup : field" path format for auto-evaluation.
 */

import { getRecord, listRecords, updateRecord } from '../../../core/records.js';
import type {
    OblioQualifier,
    Qualifier,
    QualifierOperator,
    QualifierEvaluationResult,
    ActivityQualifierResult,
    AIActivityData,
} from '../types.js';

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Check if a qualifier is an OblioQualifier (full format) vs simple Qualifier
 */
export function isOblioQualifier(q: Qualifier | OblioQualifier): q is OblioQualifier {
    return 'qualifier' in q && 'qualifierOperator' in q;
}

// =============================================================================
// Path Parsing
// =============================================================================

/**
 * Parse qualifier path: "object : fieldGroup : field"
 * Returns { object, fieldGroup, field }
 */
export function parseQualifierPath(path: string): {
    object: string;
    fieldGroup: string;
    field: string;
} {
    const parts = path.split(' : ').map(p => p.trim());
    return {
        object: parts[0] || '',      // "contacts", "accounts", "opportunities"
        fieldGroup: parts[1] || '',  // "details", "firmographics", "primary"
        field: parts[2] || ''        // "email", "Industry", "DecisionMaker"
    };
}

// =============================================================================
// Record Resolution
// =============================================================================

/**
 * Resolve target record from Activity context.
 * Activity may have direct references (contact_id, account_id) or relationships.
 */
export function resolveTargetRecord(
    activity: { id: string; data: Record<string, unknown> },
    objectType: string,
    accountId: string
): Record<string, unknown> | null {
    const data = activity.data;

    // Normalize object type: "contacts" -> "contact", keep singular as-is
    const singularType = objectType.endsWith('s')
        ? objectType.slice(0, -1)
        : objectType;

    // Check for direct reference in activity data
    // Activity may have: contact_id, account_id, opportunity_id
    const refField = `${singularType}_id`;
    const refId = data[refField] as string;

    if (refId) {
        const record = getRecord(refId);
        if (record) {
            return record.data as Record<string, unknown>;
        }
    }

    // If object type is "activities", return the activity's own data
    if (objectType === 'activities' || singularType === 'activity') {
        return data;
    }

    // Check relationships table for linked records
    try {
        const relationships = listRecords(accountId, 'relationship' as any);
        for (const rel of relationships) {
            const relData = rel.data as Record<string, unknown>;
            const sourceId = relData?.source_id || relData?.from_record_id;
            const targetId = relData?.target_id || relData?.to_record_id;

            if (sourceId === activity.id || targetId === activity.id) {
                const linkedId = sourceId === activity.id ? targetId : sourceId;
                const linked = getRecord(linkedId as string);
                if (linked?.type === singularType) {
                    return linked.data as Record<string, unknown>;
                }
            }
        }
    } catch (err) {
        console.warn(`[Qualifier] Error resolving relationships: ${err instanceof Error ? err.message : String(err)}`);
    }

    return null;
}

// =============================================================================
// Field Value Extraction
// =============================================================================

/**
 * Get field value from record using fieldGroup path.
 * Supports nested data: record[fieldGroup][field] or flat record[field]
 */
export function getFieldValue(
    record: Record<string, unknown>,
    fieldGroup: string,
    field: string
): unknown {
    // Try fieldGroup.field first (nested structure)
    const group = record[fieldGroup] as Record<string, unknown> | undefined;
    if (group && typeof group === 'object' && field in group) {
        return group[field];
    }

    // Try flat structure: record[field]
    if (field in record) {
        return record[field];
    }

    // Try snake_case conversion: "First Name" -> "first_name"
    const snakeField = field.toLowerCase().replace(/\s+/g, '_');
    if (snakeField in record) {
        return record[snakeField];
    }

    // Try camelCase conversion: "First Name" -> "firstName"
    const camelField = field.replace(/\s+(.)/g, (_, c) => c.toUpperCase()).replace(/^\w/, c => c.toLowerCase());
    if (camelField in record) {
        return record[camelField];
    }

    // Try removing spaces: "First Name" -> "FirstName"
    const noSpaceField = field.replace(/\s+/g, '');
    if (noSpaceField in record) {
        return record[noSpaceField];
    }

    return undefined;
}

// =============================================================================
// Condition Evaluation
// =============================================================================

/**
 * Evaluate a single condition: value operator expected
 */
export function evaluateCondition(
    value: unknown,
    operator: QualifierOperator,
    expected: string | number | boolean
): boolean {
    // Non-Null check (most common for Data Activities)
    if (operator === 'Non-Null' || expected === 'Non-Null') {
        return value !== null && value !== undefined && value !== '';
    }

    // Boolean TRUE/FALSE
    if (expected === 'TRUE' || expected === true) {
        return value === true || value === 'true' || value === 1 || value === '1';
    }
    if (expected === 'FALSE' || expected === false) {
        return value === false || value === 'false' || value === 0 || value === '0';
    }

    // Handle null/undefined values
    if (value === null || value === undefined) {
        return false;
    }

    // Comparison operators
    switch (operator) {
        case '=':
            return value === expected || String(value) === String(expected);
        case '!=':
            return value !== expected && String(value) !== String(expected);
        case '>':
            return Number(value) > Number(expected);
        case '<':
            return Number(value) < Number(expected);
        case '>=':
            return Number(value) >= Number(expected);
        case '<=':
            return Number(value) <= Number(expected);
        default:
            console.warn(`[Qualifier] Unknown operator: ${operator}`);
            return false;
    }
}

// =============================================================================
// Single Qualifier Evaluation
// =============================================================================

/**
 * Evaluate a single Oblio qualifier against current data state.
 */
export function evaluateOblioQualifier(
    qualifier: OblioQualifier,
    activity: { id: string; data: Record<string, unknown> },
    accountId: string
): QualifierEvaluationResult {
    const { object, fieldGroup, field } = parseQualifierPath(qualifier.qualifier);

    // Resolve target record
    const targetRecord = resolveTargetRecord(activity, object, accountId);
    if (!targetRecord) {
        console.warn(`[Qualifier] Cannot resolve ${object} for activity ${activity.id}`);
        return {
            qualifier: qualifier.qualifier,
            passed: false,
            value: undefined,
            expectedValue: qualifier.qualifierValue,
            operator: qualifier.qualifierOperator,
        };
    }

    // Get field value
    const fieldValue = getFieldValue(targetRecord, fieldGroup, field);

    // Evaluate main condition
    const mainResult = evaluateCondition(
        fieldValue,
        qualifier.qualifierOperator,
        qualifier.qualifierValue
    );

    // If activity condition exists, both must pass
    if (qualifier.qualifierActivity && qualifier.activityCondition && qualifier.activityValue) {
        const { fieldGroup: actGroup, field: actField } = parseQualifierPath(qualifier.qualifierActivity);
        const actValue = getFieldValue(activity.data, actGroup, actField);
        const actResult = evaluateCondition(actValue, qualifier.activityCondition, qualifier.activityValue);

        return {
            qualifier: qualifier.qualifier,
            passed: mainResult && actResult,
            value: fieldValue,
            expectedValue: qualifier.qualifierValue,
            operator: qualifier.qualifierOperator,
        };
    }

    return {
        qualifier: qualifier.qualifier,
        passed: mainResult,
        value: fieldValue,
        expectedValue: qualifier.qualifierValue,
        operator: qualifier.qualifierOperator,
    };
}

/**
 * Evaluate a simple (legacy) qualifier.
 * Simple qualifiers just check the "completed" flag.
 */
export function evaluateSimpleQualifier(qualifier: Qualifier): QualifierEvaluationResult {
    return {
        qualifier: qualifier.name,
        passed: qualifier.completed === true,
        value: qualifier.completed,
        expectedValue: true,
        operator: '=',
    };
}

// =============================================================================
// All Qualifiers Evaluation
// =============================================================================

/**
 * Evaluate ALL qualifiers for an Activity.
 * Returns true if ALL pass (Activity "Won").
 */
export function evaluateAllQualifiers(
    activityId: string,
    accountId: string
): ActivityQualifierResult {
    const activity = getRecord(activityId);
    if (!activity) {
        return {
            allPassed: false,
            results: [],
            evaluatedAt: new Date().toISOString(),
        };
    }

    const data = activity.data as AIActivityData;
    const qualifiers = data.qualifiers || [];

    if (qualifiers.length === 0) {
        // No qualifiers = auto-pass
        return {
            allPassed: true,
            results: [],
            evaluatedAt: new Date().toISOString(),
        };
    }

    const results: QualifierEvaluationResult[] = [];
    let allPassed = true;

    for (const q of qualifiers) {
        let result: QualifierEvaluationResult;

        if (isOblioQualifier(q)) {
            // Full Oblio qualifier with path-based evaluation
            result = evaluateOblioQualifier(q, { id: activity.id, data }, accountId);
        } else {
            // Simple qualifier (legacy) - just check completed flag
            result = evaluateSimpleQualifier(q);
        }

        results.push(result);

        if (!result.passed) {
            allPassed = false;
        }
    }

    return {
        allPassed,
        results,
        evaluatedAt: new Date().toISOString(),
    };
}

// =============================================================================
// Post-Execution Evaluation
// =============================================================================

/**
 * After AI execution completes, evaluate qualifiers and update Activity status.
 *
 * Flow:
 * 1. Evaluate all qualifiers against current data state
 * 2. Store evaluation result in Activity.data.qualifier_result
 * 3. If ALL pass -> Mark Activity as "completed" (Won)
 * 4. Return result for logging/reporting
 */
export async function evaluateActivityAfterExecution(
    activityId: string,
    accountId: string
): Promise<ActivityQualifierResult> {
    const result = evaluateAllQualifiers(activityId, accountId);

    // Get current activity to update
    const activity = getRecord(activityId);
    if (!activity) {
        return result;
    }

    const currentData = activity.data as Record<string, unknown>;

    // Build update
    const updates: Record<string, unknown> = {
        ...currentData,
        qualifier_result: result,
    };

    // If all qualifiers passed, mark Activity as completed (Won)
    if (result.allPassed) {
        updates.status = 'completed';
        console.log(`[Qualifier] Activity ${activityId} WON - all ${result.results.length} qualifiers passed`);
    } else {
        const failed = result.results.filter(r => !r.passed);
        console.log(`[Qualifier] Activity ${activityId} has ${failed.length} failing qualifiers:`,
            failed.map(r => `${r.qualifier}: got ${JSON.stringify(r.value)}, expected ${r.operator} ${JSON.stringify(r.expectedValue)}`));
    }

    // Update the activity record
    try {
        await updateRecord(activityId, {
            data: updates as any,
        });
    } catch (err) {
        console.warn(`[Qualifier] Failed to update activity ${activityId}: ${err instanceof Error ? err.message : String(err)}`);
    }

    return result;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create a simple Non-Null qualifier for a field path.
 * Convenience function for common Data Activity qualifiers.
 */
export function createNonNullQualifier(
    objectFieldPath: string,
    type: 'Data' | 'Engagement' | 'Asset' | 'Admin' = 'Data'
): OblioQualifier {
    return {
        qualifier: objectFieldPath,
        qualifierOperator: 'Non-Null',
        qualifierValue: 'Non-Null',
        qualifierType: type,
        qualifierRequired: true,
    };
}

/**
 * Create an equality qualifier for a specific value.
 */
export function createEqualityQualifier(
    objectFieldPath: string,
    expectedValue: string | number | boolean,
    type: 'Data' | 'Engagement' | 'Asset' | 'Admin' = 'Data'
): OblioQualifier {
    return {
        qualifier: objectFieldPath,
        qualifierOperator: '=',
        qualifierValue: expectedValue,
        qualifierType: type,
        qualifierRequired: true,
    };
}
