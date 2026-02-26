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
import { EntityType } from '../../core/types.js';

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
    entityType: string;
    accountId?: string;
}

export interface GetStateMachineResult {
    found: boolean;
    entityType: string;
    definition?: StateMachineDefinition;
    error?: string;
}

export interface ValidateTransitionArgs {
    entityType: string;
    currentState: string;
    newState: string;
    accountId?: string;
}

export interface ValidateTransitionResult {
    entityType: string;
    currentState: string;
    newState: string;
    valid: boolean;
    error?: string;
    allowedTransitions?: string[];
}

export interface GetAllowedTransitionsArgs {
    entityType: string;
    currentState: string;
    accountId?: string;
}

export interface GetAllowedTransitionsResult {
    entityType: string;
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
    const { entityType, accountId = DEFAULT_ACCOUNT_ID } = args;

    const definition = getStateMachine(entityType as EntityType, accountId);

    if (!definition) {
        return {
            found: false,
            entityType,
            error: `No state machine defined for entity type: ${entityType}`
        };
    }

    return {
        found: true,
        entityType,
        definition
    };
}

/**
 * Validate whether a state transition is allowed
 */
export function validateStateTransition(args: ValidateTransitionArgs): ValidateTransitionResult {
    const { entityType, currentState, newState, accountId = DEFAULT_ACCOUNT_ID } = args;

    const result = validateTransition(
        entityType as EntityType,
        currentState,
        newState,
        undefined,
        accountId
    );

    // Get allowed transitions for context
    const allowed = getAllowedTransitions(entityType as EntityType, currentState, accountId);

    return {
        entityType,
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
    const { entityType, currentState, accountId = DEFAULT_ACCOUNT_ID } = args;

    const transitions = getAllowedTransitions(entityType as EntityType, currentState, accountId);

    return {
        entityType,
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
export function getValidStatesHandler(entityType: string, accountId: string = DEFAULT_ACCOUNT_ID): {
    entityType: string;
    states: string[];
    initialState?: string;
} {
    const states = getValidStates(entityType as EntityType, accountId);
    const definition = getStateMachine(entityType as EntityType, accountId);

    return {
        entityType,
        states,
        initialState: definition?.initialState
    };
}
