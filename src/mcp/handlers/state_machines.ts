/**
 * MCP State Machine Tool Handlers
 *
 * Provides tools for querying and validating state machine definitions.
 * State machines define valid state transitions for entity lifecycles.
 */

import { db } from '../../core/db.js';
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import {
    getStateMachine,
    validateTransition,
    getValidStates,
    getAllowedTransitions,
    parseStateMachineDefinition,
    StateMachineDefinition,
    TransitionResult
} from '../../modules/ops/state_machine.js';
import { ObjectType } from '../../core/types.js';

// ============================================================================
// TYPES
// ============================================================================

export interface ListStateMachinesResult {
    count: number;
    stateMachines: Array<{
        slug: string;
        name: string;
        summary: string;
        targetEntityType: string;
        stateCount: number;
        transitionCount: number;
    }>;
}

export interface GetStateMachineArgs {
    ObjectType: string;
    accountId?: string;
}

export interface GetStateMachineResult {
    found: boolean;
    ObjectType: string;
    definition?: StateMachineDefinition;
    error?: string;
}

export interface ValidateTransitionArgs {
    ObjectType: string;
    currentState: string;
    newState: string;
    accountId?: string;
}

export interface ValidateTransitionResult {
    ObjectType: string;
    currentState: string;
    newState: string;
    valid: boolean;
    error?: string;
    allowedTransitions?: string[];
}

export interface GetAllowedTransitionsArgs {
    ObjectType: string;
    currentState: string;
    accountId?: string;
}

export interface GetAllowedTransitionsResult {
    ObjectType: string;
    currentState: string;
    transitions: Array<{
        to: string;
        action?: string;
    }>;
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * List all state machine definitions
 */
export function listStateMachines(accountId: string = DEFAULT_ACCOUNT_ID): ListStateMachinesResult {
    const rows = db.prepare(`
        SELECT id, slug, name, summary, data
        FROM records
        WHERE type = 'state_machine'
        AND (account_id = ? OR account_id = ?)
        ORDER BY name
    `).all(accountId, DEFAULT_ACCOUNT_ID) as Array<{
        id: string;
        slug: string;
        name: string;
        summary: string;
        data: string;
    }>;

    const stateMachines = rows.map(row => {
        const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        const def = parseStateMachineDefinition({
            id: row.id,
            slug: row.slug,
            name: row.name,
            summary: row.summary,
            data,
            type: 'state_machine',
            account_id: accountId
        } as any);

        return {
            slug: row.slug,
            name: row.name,
            summary: row.summary || '',
            targetEntityType: def.targetEntityType,
            stateCount: def.states.length,
            transitionCount: def.transitions.length
        };
    });

    return {
        count: stateMachines.length,
        stateMachines
    };
}

/**
 * Get state machine definition for a specific entity type
 */
export function getStateMachineForEntity(args: GetStateMachineArgs): GetStateMachineResult {
    const { ObjectType, accountId = DEFAULT_ACCOUNT_ID } = args;

    const definition = getStateMachine(ObjectType as ObjectType, accountId);

    if (!definition) {
        return {
            found: false,
            ObjectType,
            error: `No state machine defined for entity type: ${ObjectType}`
        };
    }

    return {
        found: true,
        ObjectType,
        definition
    };
}

/**
 * Validate whether a state transition is allowed
 */
export function validateStateTransition(args: ValidateTransitionArgs): ValidateTransitionResult {
    const { ObjectType, currentState, newState, accountId = DEFAULT_ACCOUNT_ID } = args;

    const result = validateTransition(
        ObjectType as ObjectType,
        currentState,
        newState,
        undefined,
        accountId
    );

    // Get allowed transitions for context
    const allowed = getAllowedTransitions(ObjectType as ObjectType, currentState, accountId);

    return {
        ObjectType,
        currentState,
        newState,
        valid: result.valid,
        error: result.error,
        allowedTransitions: allowed.map(t => t.to)
    };
}

/**
 * Get all allowed transitions from a given state
 */
export function getAllowedTransitionsHandler(args: GetAllowedTransitionsArgs): GetAllowedTransitionsResult {
    const { ObjectType, currentState, accountId = DEFAULT_ACCOUNT_ID } = args;

    const transitions = getAllowedTransitions(ObjectType as ObjectType, currentState, accountId);

    return {
        ObjectType,
        currentState,
        transitions: transitions.map(t => ({
            to: t.to,
            action: t.action
        }))
    };
}

/**
 * Get all valid states for an entity type
 */
export function getValidStatesHandler(ObjectType: string, accountId: string = DEFAULT_ACCOUNT_ID): {
    ObjectType: string;
    states: string[];
    initialState?: string;
} {
    const states = getValidStates(ObjectType as ObjectType, accountId);
    const definition = getStateMachine(ObjectType as ObjectType, accountId);

    return {
        ObjectType,
        states,
        initialState: definition?.initialState
    };
}

