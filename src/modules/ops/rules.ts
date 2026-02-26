/**
 * Rules - Trigger/automation patterns (Ops Layer)
 *
 * Rules produce writes and scheduled work from events.
 * They enable automation without hardcoding business logic.
 *
 * A Rule is a record that can be CRUDed via MCP/UI, and executed
 * when its trigger event fires and conditions are met.
 *
 * Trigger Events:
 * - pre_create, post_create: Before/after record creation
 * - pre_update, post_update: Before/after record update
 * - pre_delete, post_delete: Before/after record deletion
 * - scheduled: Time-based trigger (cron-like)
 *
 * Actions:
 * - set_field: Update a field value
 * - create_record: Create a new related record
 * - create_relationship: Link two records
 * - delete_relationship: Unlink two records
 * - emit_event: Trigger a custom event
 * - log: Write to activity log
 */

import { DataRecord, DataRecordInput, EntityType } from '../../core/types.js';
import { listRecords, getRecordBySlug, createRecord, updateRecord, createRelationship, deleteRelationship } from '../content/services.js';
import { events } from '../../core/events.js';
import { InvariantViolation } from '../../core/invariants.js';
import { computeDerivationBySlug } from './derivations.js';

// --- Types ---

export type TriggerEvent =
    | 'pre_read'
    | 'pre_create'
    | 'post_create'
    | 'pre_update'
    | 'post_update'
    | 'pre_delete'
    | 'post_delete'
    | 'scheduled';

export interface RuleCondition {
    field: string;
    op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'not_in' | 'exists' | 'not_exists' | 'changed' | 'changed_to' | 'has';
    value?: any;
}

export type ActionType =
    | 'set_field'
    | 'create_record'
    | 'create_relationship'
    | 'delete_relationship'
    | 'emit_event'
    | 'log'
    | 'allow'   // For access policy rules
    | 'deny'    // For access policy rules
    | 'compute_derivation';  // Compute and set a derivation field

export interface RuleAction {
    type: ActionType;
    target?: string; // Field name, entity type, or event name
    data?: Record<string, any>;
}

export interface RuleDefinition {
    triggerEvent: TriggerEvent;
    triggerEntityType: EntityType;
    conditions?: RuleCondition[];
    actions: RuleAction[];
    priority: number;
    isActive: boolean;
    /** If true, throw InvariantViolation when conditions match (blocks the operation) */
    blocking?: boolean;
    /** Error message when blocking rule triggers */
    blockMessage?: string;
}

export interface RuleExecutionContext {
    accountId: string;
    record: DataRecord | DataRecordInput;
    previousRecord?: DataRecord; // For updates
    event: TriggerEvent;
    userId?: string;
    // Extended context for policy evaluation (injected by middleware)
    context?: {
        userId?: string;
        accountId?: string;
        capabilities?: string[];
        event?: TriggerEvent;
        recordType?: string;
        [key: string]: any;
    };
}

export interface RuleExecutionResult {
    ruleSlug: string;
    triggered: boolean;
    conditionsMet: boolean;
    actionsExecuted: number;
    actionResults: ActionResult[];
    error?: string;
}

export interface ActionResult {
    type: ActionType;
    success: boolean;
    data?: any;
    error?: string;
}

// --- Rule Resolution ---

/**
 * Parse a Rule record's data into a structured RuleDefinition
 */
export function parseRuleDefinition(ruleRecord: DataRecord): RuleDefinition {
    const data = ruleRecord.data || {};

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

    const isActive = getField('Is Active');
    const blocking = getField('Blocking');

    return {
        triggerEvent: (getField('Trigger Event') || 'post_create') as TriggerEvent,
        triggerEntityType: getField('Trigger Entity Type') as EntityType,
        conditions: parseJson(getField('Conditions')) || [],
        actions: parseJson(getField('Actions')) || [],
        priority: parseInt(getField('Priority'), 10) || 100,
        isActive: isActive === true || isActive === 'true' || isActive === 1 || isActive === undefined,
        blocking: blocking === true || blocking === 'true' || blocking === 1,
        blockMessage: getField('Block Message') || undefined
    };
}

/**
 * Get field value from a record (handles both flat and nested structures)
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
    if (fieldPath === 'created_at') return rec.created_at;
    if (fieldPath === 'updated_at') return rec.updated_at;

    // Data fields
    if (rec.data) {
        // Flat data fields
        if (rec.data[fieldPath] !== undefined) {
            return rec.data[fieldPath];
        }

        // Check fieldGroups structure
        const fieldGroups = rec.data.fieldGroups;
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

    // Nested path traversal
    const parts = fieldPath.split('.');
    let value: any = record;
    for (const part of parts) {
        if (value === null || value === undefined) return undefined;
        value = value[part];
    }

    return value;
}

/**
 * Get value from execution context (for $context.* fields in policy rules)
 */
function getContextValue(context: RuleExecutionContext, fieldPath: string): any {
    if (!context.context) return undefined;

    // Remove $context. prefix
    const path = fieldPath.startsWith('$context.')
        ? fieldPath.slice(9)
        : fieldPath;

    // Handle nested paths (e.g., $context.user.role)
    const parts = path.split('.');
    let value: any = context.context;
    for (const part of parts) {
        if (value === null || value === undefined) return undefined;
        value = value[part];
    }

    return value;
}

/**
 * Evaluate a single condition against a record
 */
function evaluateCondition(
    condition: RuleCondition,
    record: DataRecord | DataRecordInput,
    previousRecord?: DataRecord,
    context?: RuleExecutionContext
): boolean {
    // Check for $context.* prefix (used by policy rules)
    const fieldValue = condition.field.startsWith('$context.')
        ? getContextValue(context!, condition.field)
        : getFieldValue(record, condition.field);

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
        case 'contains':
            if (typeof fieldValue === 'string') {
                return fieldValue.includes(String(condition.value));
            }
            if (Array.isArray(fieldValue)) {
                return fieldValue.includes(condition.value);
            }
            return false;
        case 'in':
            if (Array.isArray(condition.value)) {
                return condition.value.includes(fieldValue);
            }
            return false;
        case 'not_in':
            if (Array.isArray(condition.value)) {
                return !condition.value.includes(fieldValue);
            }
            return true;
        case 'exists':
            return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
        case 'not_exists':
            return fieldValue === null || fieldValue === undefined || fieldValue === '';
        case 'changed':
            if (!previousRecord) return true; // New record = changed
            const prevValue = getFieldValue(previousRecord, condition.field);
            return fieldValue !== prevValue;
        case 'changed_to':
            if (!previousRecord) return fieldValue === condition.value;
            const oldValue = getFieldValue(previousRecord, condition.field);
            return oldValue !== condition.value && fieldValue === condition.value;
        case 'has':
            // Check if array contains value (used for capability checks)
            if (Array.isArray(fieldValue)) {
                return fieldValue.includes(condition.value);
            }
            return false;
        default:
            return true;
    }
}

/**
 * Check if all conditions are met
 */
function checkConditions(
    conditions: RuleCondition[],
    record: DataRecord | DataRecordInput,
    previousRecord?: DataRecord,
    context?: RuleExecutionContext
): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition =>
        evaluateCondition(condition, record, previousRecord, context)
    );
}

/**
 * Substitute template variables in action data
 * Supports: {{field}}, {{record.field}}, {{now}}, {{uuid}}
 */
function substituteVariables(
    template: any,
    context: RuleExecutionContext
): any {
    if (typeof template === 'string') {
        return template.replace(/\{\{([^}]+)\}\}/g, (_, expr) => {
            const trimmed = expr.trim();

            // Built-in variables
            if (trimmed === 'now') return new Date().toISOString();
            if (trimmed === 'uuid') return crypto.randomUUID();
            if (trimmed === 'accountId') return context.accountId;
            if (trimmed === 'userId') return context.userId || '';

            // Record field access
            if (trimmed.startsWith('record.')) {
                const field = trimmed.slice(7);
                return String(getFieldValue(context.record, field) ?? '');
            }

            // Previous record access
            if (trimmed.startsWith('previous.') && context.previousRecord) {
                const field = trimmed.slice(9);
                return String(getFieldValue(context.previousRecord, field) ?? '');
            }

            // Direct field access
            return String(getFieldValue(context.record, trimmed) ?? '');
        });
    }

    if (Array.isArray(template)) {
        return template.map(item => substituteVariables(item, context));
    }

    if (typeof template === 'object' && template !== null) {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(template)) {
            result[key] = substituteVariables(value, context);
        }
        return result;
    }

    return template;
}

/**
 * Execute a single action
 */
async function executeAction(
    action: RuleAction,
    context: RuleExecutionContext
): Promise<ActionResult> {
    try {
        const data = action.data ? substituteVariables(action.data, context) : {};

        switch (action.type) {
            case 'set_field': {
                // Modify the record being processed (mutation for pre-hooks)
                const target = action.target;
                const value = data.value;

                if (target && context.record) {
                    const rec = context.record as any;
                    if (!rec.data) rec.data = {};
                    rec.data[target] = value;
                }

                return { type: action.type, success: true, data: { field: target, value } };
            }

            case 'create_record': {
                const newRecord = await createRecord({
                    type: action.target as EntityType,
                    account_id: context.accountId,
                    slug: data.slug || `auto-${Date.now()}`,
                    name: data.name || 'Auto-created record',
                    summary: data.summary,
                    description: data.description,
                    data: data.data || {}
                });

                return { type: action.type, success: true, data: { recordId: newRecord.id } };
            }

            case 'create_relationship': {
                const rel = await createRelationship({
                    from_record_id: data.from || (context.record as any).id,
                    to_record_id: data.to,
                    relationship_type: action.target || data.type || 'relates_to',
                    data: data.metadata
                });

                return { type: action.type, success: true, data: { relationshipId: rel.id } };
            }

            case 'delete_relationship': {
                const deleted = await deleteRelationship(data.relationshipId);
                return { type: action.type, success: deleted, data: { deleted } };
            }

            case 'emit_event': {
                events.emit(action.target || 'rule.event', {
                    ruleContext: context,
                    eventData: data
                });
                return { type: action.type, success: true, data: { event: action.target } };
            }

            case 'log': {
                console.log(`[Rule] ${action.target || 'Log'}:`, JSON.stringify(data, null, 2));
                return { type: action.type, success: true, data };
            }

            case 'allow': {
                // Access policy action - signals that access is permitted
                // The middleware checks for this action type in results
                return { type: action.type, success: true, data: { allowed: true } };
            }

            case 'deny': {
                // Access policy action - signals that access is denied
                return { type: action.type, success: true, data: { denied: true, reason: data.reason } };
            }

            case 'compute_derivation': {
                // Compute a derivation and set the field on the record
                const derivationSlug = action.target;
                if (!derivationSlug) {
                    return { type: action.type, success: false, error: 'No derivation slug specified' };
                }

                const result = computeDerivationBySlug(derivationSlug, context.record as DataRecord, context.accountId);

                if (result.success) {
                    // Set the computed value on the record
                    const rec = context.record as any;
                    if (!rec.data) rec.data = {};
                    rec.data[result.fieldName] = result.value;
                }

                return {
                    type: action.type,
                    success: result.success,
                    data: { fieldName: result.fieldName, value: result.value },
                    error: result.error
                };
            }

            default:
                return {
                    type: action.type,
                    success: false,
                    error: `Unknown action type: ${action.type}`
                };
        }
    } catch (error) {
        return {
            type: action.type,
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Execute a rule against a record
 */
export async function executeRule(
    ruleDef: RuleDefinition,
    ruleSlug: string,
    context: RuleExecutionContext
): Promise<RuleExecutionResult> {
    // Check if rule is active
    if (!ruleDef.isActive) {
        return {
            ruleSlug,
            triggered: false,
            conditionsMet: false,
            actionsExecuted: 0,
            actionResults: []
        };
    }

    // Check conditions (pass context for $context.* field evaluation)
    const conditionsMet = checkConditions(
        ruleDef.conditions || [],
        context.record,
        context.previousRecord,
        context
    );

    if (!conditionsMet) {
        return {
            ruleSlug,
            triggered: true,
            conditionsMet: false,
            actionsExecuted: 0,
            actionResults: []
        };
    }

    // Execute actions
    const actionResults: ActionResult[] = [];
    for (const action of ruleDef.actions) {
        const result = await executeAction(action, context);
        actionResults.push(result);
    }

    return {
        ruleSlug,
        triggered: true,
        conditionsMet: true,
        actionsExecuted: actionResults.filter(r => r.success).length,
        actionResults
    };
}

/**
 * Find and execute all matching rules for an event
 */
export async function executeMatchingRules(
    context: RuleExecutionContext
): Promise<RuleExecutionResult[]> {
    // Get all rules for this entity type and event
    const rules = listRulesForEvent(
        context.accountId,
        context.event,
        (context.record as any).type
    );

    // Sort by priority (lower = earlier)
    const sortedRules = rules.sort((a, b) => {
        const defA = parseRuleDefinition(a);
        const defB = parseRuleDefinition(b);
        return defA.priority - defB.priority;
    });

    // Execute each rule
    const results: RuleExecutionResult[] = [];
    for (const ruleRecord of sortedRules) {
        const def = parseRuleDefinition(ruleRecord);
        const result = await executeRule(def, ruleRecord.slug, context);
        results.push(result);

        // Check if this is a blocking rule and conditions were met
        if (def.blocking && result.triggered && result.conditionsMet) {
            const errorCode = `RULE_BLOCKED_${ruleRecord.slug.toUpperCase().replace(/-/g, '_')}`;
            const message = def.blockMessage || `Operation blocked by rule: ${ruleRecord.name || ruleRecord.slug}`;
            throw new InvariantViolation(message, errorCode);
        }
    }

    return results;
}

/**
 * List all Rule records for a specific event and entity type
 */
export function listRulesForEvent(
    accountId: string,
    event: TriggerEvent,
    entityType: EntityType
): DataRecord[] {
    const allRules = listRecords(accountId, 'rule');

    return allRules.filter(r => {
        const def = parseRuleDefinition(r);
        return def.triggerEvent === event &&
               def.triggerEntityType === entityType &&
               def.isActive;
    });
}

/**
 * List all Rule records for an account
 */
export function listRules(accountId: string): DataRecord[] {
    return listRecords(accountId, 'rule');
}

/**
 * Get a Rule by slug
 */
export function getRule(accountId: string, slug: string): DataRecord | undefined {
    const record = getRecordBySlug(accountId, slug);
    if (record && record.type === 'rule') {
        return record;
    }
    return undefined;
}

/**
 * Validate a rule definition
 */
export function validateRuleDefinition(def: RuleDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const validEvents: TriggerEvent[] = [
        'pre_create', 'post_create', 'pre_update', 'post_update',
        'pre_delete', 'post_delete', 'scheduled'
    ];

    if (!validEvents.includes(def.triggerEvent)) {
        errors.push(`Invalid trigger event: ${def.triggerEvent}`);
    }

    if (!def.triggerEntityType) {
        errors.push('Trigger Entity Type is required');
    }

    if (!def.actions || def.actions.length === 0) {
        errors.push('At least one action is required');
    }

    const validActionTypes: ActionType[] = [
        'set_field', 'create_record', 'create_relationship',
        'delete_relationship', 'emit_event', 'log'
    ];

    for (let i = 0; i < (def.actions?.length || 0); i++) {
        const action = def.actions[i];
        if (!validActionTypes.includes(action.type)) {
            errors.push(`Invalid action type at index ${i}: ${action.type}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Create rule execution context for hook integration
 */
export function createRuleContext(
    accountId: string,
    event: TriggerEvent,
    record: DataRecord | DataRecordInput,
    previousRecord?: DataRecord,
    userId?: string
): RuleExecutionContext {
    return {
        accountId,
        record,
        previousRecord,
        event,
        userId
    };
}

/**
 * Test a rule against a sample record (for preview/debugging)
 */
export async function testRule(
    ruleDef: RuleDefinition,
    testRecord: DataRecord,
    accountId: string,
    context?: RuleExecutionContext
): Promise<{
    conditionsMet: boolean;
    conditionResults: Array<{ condition: RuleCondition; passed: boolean }>;
    wouldExecute: RuleAction[];
}> {
    const conditionResults = (ruleDef.conditions || []).map(condition => ({
        condition,
        passed: evaluateCondition(condition, testRecord, undefined, context)
    }));

    const conditionsMet = conditionResults.every(r => r.passed);

    return {
        conditionsMet,
        conditionResults,
        wouldExecute: conditionsMet ? ruleDef.actions : []
    };
}
