/**
 * State Machine Engine
 *
 * Enables configurable state transitions for entity lifecycles.
 * State machines are defined as records and loaded from the database.
 *
 * Key Features:
 * - Validates state transitions
 * - Supports conditional transitions
 * - Integrates with hooks for enforcement
 */

import { DataRecord, DataRecordInput, EntityType } from '../../core/types.js';
import { InvariantViolation } from '../../core/invariants.js';
import { listRecords, getRecordBySlug } from '../content/services.js';
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';

// --- Types ---

export interface StateTransition {
    from: string;
    to: string;
    action?: string;  // Optional action name (e.g., 'start', 'complete')
    conditions?: Array<{ field: string; op: string; value: any }>;
}

export interface StateMachineDefinition {
    targetEntityType: EntityType;
    stateField: string;
    states: string[];
    transitions: StateTransition[];
    initialState: string;
}

export interface TransitionResult {
    valid: boolean;
    error?: string;
    transition?: StateTransition;
}

// --- Cache ---

const stateMachineCache = new Map<string, StateMachineDefinition | null>();

/**
 * Clear the state machine cache (useful after seeding)
 */
export function clearStateMachineCache(): void {
    stateMachineCache.clear();
}

// --- Core Functions ---

/**
 * Parse a state machine record into a StateMachineDefinition
 */
export function parseStateMachineDefinition(record: DataRecord): StateMachineDefinition {
    const data = record.data || {};

    // Support both formats (seed format and canonical)
    const targetEntityType = (
        data.targetEntityType ||
        data['Target Entity Type']
    ) as EntityType;

    const stateField = data.stateField || data['State Field'] || 'status';

    const statesRaw = data.states || data['States'] || [];
    const states = typeof statesRaw === 'string' ? JSON.parse(statesRaw) : statesRaw;

    const transitionsRaw = data.transitions || data['Transitions'] || [];
    const transitions = typeof transitionsRaw === 'string' ? JSON.parse(transitionsRaw) : transitionsRaw;

    const initialState = data.initialState || data['Initial State'] || states[0] || 'pending';

    return {
        targetEntityType,
        stateField,
        states,
        transitions,
        initialState
    };
}

/**
 * Get state machine definition for an entity type
 */
export function getStateMachine(entityType: EntityType, accountId: string = DEFAULT_ACCOUNT_ID): StateMachineDefinition | undefined {
    const cacheKey = `${accountId}:${entityType}`;

    if (stateMachineCache.has(cacheKey)) {
        const cached = stateMachineCache.get(cacheKey);
        return cached || undefined;
    }

    // Query for state machine by entity type
    const allStateMachines = listRecords(accountId, 'state_machine');

    const matching = allStateMachines.find(sm => {
        const def = parseStateMachineDefinition(sm);
        return def.targetEntityType === entityType;
    });

    if (matching) {
        const definition = parseStateMachineDefinition(matching);
        stateMachineCache.set(cacheKey, definition);
        return definition;
    }

    // Check system account if not found in provided account
    if (accountId !== DEFAULT_ACCOUNT_ID) {
        const systemMachines = listRecords(DEFAULT_ACCOUNT_ID, 'state_machine');
        const systemMatching = systemMachines.find(sm => {
            const def = parseStateMachineDefinition(sm);
            return def.targetEntityType === entityType;
        });

        if (systemMatching) {
            const definition = parseStateMachineDefinition(systemMatching);
            stateMachineCache.set(cacheKey, definition);
            return definition;
        }
    }

    // Cache the miss
    stateMachineCache.set(cacheKey, null);
    return undefined;
}

/**
 * Validate a state transition
 */
export function validateTransition(
    entityType: EntityType,
    currentState: string,
    newState: string,
    record?: DataRecord,
    accountId: string = DEFAULT_ACCOUNT_ID
): TransitionResult {
    const sm = getStateMachine(entityType, accountId);

    if (!sm) {
        // No state machine defined - allow all transitions
        return { valid: true };
    }

    // Same state - always valid
    if (currentState === newState) {
        return { valid: true };
    }

    // Check if current state is valid
    if (currentState && !sm.states.includes(currentState)) {
        return {
            valid: false,
            error: `Invalid current state: '${currentState}'. Valid states: ${sm.states.join(', ')}`
        };
    }

    // Check if target state is valid
    if (!sm.states.includes(newState)) {
        return {
            valid: false,
            error: `Invalid target state: '${newState}'. Valid states: ${sm.states.join(', ')}`
        };
    }

    // Find valid transitions from current state
    const validTransitions = sm.transitions.filter(t => t.from === currentState);
    const transition = validTransitions.find(t => t.to === newState);

    if (!transition) {
        const allowedTargets = validTransitions.map(t => t.to);
        return {
            valid: false,
            error: `Cannot transition from '${currentState}' to '${newState}'. Allowed transitions: ${allowedTargets.length > 0 ? allowedTargets.join(', ') : 'none'}`
        };
    }

    // Check transition conditions
    if (transition.conditions && record) {
        for (const condition of transition.conditions) {
            if (!evaluateCondition(record, condition)) {
                return {
                    valid: false,
                    error: `Transition condition not met: ${condition.field} ${condition.op} ${condition.value}`
                };
            }
        }
    }

    return { valid: true, transition };
}

/**
 * Evaluate a single condition against a record
 */
function evaluateCondition(record: DataRecord, condition: { field: string; op: string; value: any }): boolean {
    const fieldValue = getFieldValue(record, condition.field);

    switch (condition.op) {
        case 'eq':
            return fieldValue === condition.value;
        case 'neq':
            return fieldValue !== condition.value;
        case 'gt':
            return typeof fieldValue === 'number' && fieldValue > condition.value;
        case 'gte':
            return typeof fieldValue === 'number' && fieldValue >= condition.value;
        case 'lt':
            return typeof fieldValue === 'number' && fieldValue < condition.value;
        case 'lte':
            return typeof fieldValue === 'number' && fieldValue <= condition.value;
        case 'exists':
            return fieldValue !== null && fieldValue !== undefined;
        case 'not_exists':
            return fieldValue === null || fieldValue === undefined;
        default:
            return true;
    }
}

/**
 * Get a field value from a record (checking both top-level data and nested structures)
 */
function getFieldValue(record: DataRecord, field: string): any {
    // Check direct property
    if ((record as any)[field] !== undefined) {
        return (record as any)[field];
    }

    // Check data property
    if (record.data?.[field] !== undefined) {
        return record.data[field];
    }

    // Check fieldGroups
    const fieldGroups = record.data?.fieldGroups || [];
    for (const group of fieldGroups) {
        const fields = group.fieldStructs || group.fields || [];
        for (const f of fields) {
            if (f.nameField === field || f.name === field) {
                return f.propertyStructs?.[0]?.valueProperty || f.value;
            }
        }
    }

    return undefined;
}

/**
 * Enforce state machine transition in pre-update hook
 * Throws InvariantViolation if transition is invalid
 */
export function enforceStateMachine(
    record: DataRecordInput,
    previousRecord?: DataRecord
): void {
    const entityType = (record as any).type as EntityType;
    const accountId = (record as any).account_id || DEFAULT_ACCOUNT_ID;

    const sm = getStateMachine(entityType, accountId);
    if (!sm) return; // No state machine for this entity type

    // Get current and new states
    const currentState = previousRecord
        ? getFieldValue(previousRecord, sm.stateField)
        : sm.initialState;

    const newState = getFieldValue(record as any, sm.stateField);

    // If no new state or same state, allow
    if (!newState || newState === currentState) {
        return;
    }

    // Validate transition
    const result = validateTransition(entityType, currentState, newState, previousRecord, accountId);

    if (!result.valid) {
        throw new InvariantViolation(
            result.error!,
            'INVALID_STATE_TRANSITION'
        );
    }
}

/**
 * Get the initial state for an entity type
 */
export function getInitialState(entityType: EntityType, accountId: string = DEFAULT_ACCOUNT_ID): string | undefined {
    const sm = getStateMachine(entityType, accountId);
    return sm?.initialState;
}

/**
 * Get all valid states for an entity type
 */
export function getValidStates(entityType: EntityType, accountId: string = DEFAULT_ACCOUNT_ID): string[] {
    const sm = getStateMachine(entityType, accountId);
    return sm?.states || [];
}

/**
 * Get allowed transitions from a given state
 */
export function getAllowedTransitions(
    entityType: EntityType,
    currentState: string,
    accountId: string = DEFAULT_ACCOUNT_ID
): StateTransition[] {
    const sm = getStateMachine(entityType, accountId);
    if (!sm) return [];

    return sm.transitions.filter(t => t.from === currentState);
}

console.log('[StateMachine] Engine loaded.');
