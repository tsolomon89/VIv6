/**
 * State Machine API Routes
 *
 * REST endpoints for querying and validating state machine definitions.
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
    getStateMachine,
    validateTransition,
    getValidStates,
    getAllowedTransitions,
    parseStateMachineDefinition
} from '../../modules/ops/state_machine.js';
import { listRecords } from '../../modules/content/services.js';
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import { EntityType } from '../../core/types.js';

const router = Router();

/**
 * GET /api/state-machines
 * List all state machine definitions
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    try {
        const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;
        const machines = listRecords(accountId, 'state_machine' as any);

        const result = machines.map(m => {
            const def = parseStateMachineDefinition(m);
            return {
                id: m.id,
                slug: m.slug,
                name: m.name,
                summary: m.summary,
                targetEntityType: def.targetEntityType,
                stateField: def.stateField,
                stateCount: def.states.length,
                transitionCount: def.transitions.length,
                initialState: def.initialState
            };
        });

        res.json({ data: result });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/state-machines/:entityType
 * Get state machine definition for a specific entity type
 */
router.get('/:entityType', (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType } = req.params;
        const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;

        const machine = getStateMachine(entityType as EntityType, accountId);

        if (!machine) {
            res.status(404).json({
                error: `No state machine defined for entity type: ${entityType}`,
                status: 404
            });
            return;
        }

        res.json({ data: machine });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/state-machines/:entityType/states
 * Get all valid states for an entity type
 */
router.get('/:entityType/states', (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType } = req.params;
        const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;

        const states = getValidStates(entityType as EntityType, accountId);
        const machine = getStateMachine(entityType as EntityType, accountId);

        res.json({
            data: {
                entityType,
                states,
                initialState: machine?.initialState
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/state-machines/:entityType/transitions
 * Get allowed transitions from a given state
 */
router.get('/:entityType/transitions', (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType } = req.params;
        const { state } = req.query;
        const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;

        if (!state || typeof state !== 'string') {
            res.status(400).json({
                error: 'state query parameter is required',
                status: 400
            });
            return;
        }

        const transitions = getAllowedTransitions(entityType as EntityType, state, accountId);

        res.json({
            data: {
                entityType,
                currentState: state,
                transitions: transitions.map(t => ({
                    to: t.to,
                    action: t.action,
                    conditions: t.conditions
                }))
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/state-machines/validate
 * Validate a state transition
 */
router.post('/validate', (req: Request, res: Response, next: NextFunction) => {
    try {
        const { entityType, currentState, newState, account_id } = req.body;
        const accountId = account_id || DEFAULT_ACCOUNT_ID;

        if (!entityType || !currentState || !newState) {
            res.status(400).json({
                error: 'entityType, currentState, and newState are required',
                status: 400
            });
            return;
        }

        const result = validateTransition(
            entityType as EntityType,
            currentState,
            newState,
            undefined,
            accountId
        );

        // Include allowed transitions for context
        const allowed = getAllowedTransitions(entityType as EntityType, currentState, accountId);

        res.json({
            data: {
                entityType,
                currentState,
                newState,
                valid: result.valid,
                error: result.error,
                allowedTransitions: allowed.map(t => t.to)
            }
        });
    } catch (err) {
        next(err);
    }
});

export default router;
