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
import { ObjectType } from '../../core/types.js';

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
 * GET /api/state-machines/:ObjectType
 * Get state machine definition for a specific entity type
 */
router.get('/:ObjectType', (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ObjectType } = req.params;
        const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;

        const machine = getStateMachine(ObjectType as ObjectType, accountId);

        if (!machine) {
            res.status(404).json({
                error: `No state machine defined for entity type: ${ObjectType}`,
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
 * GET /api/state-machines/:ObjectType/states
 * Get all valid states for an entity type
 */
router.get('/:ObjectType/states', (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ObjectType } = req.params;
        const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;

        const states = getValidStates(ObjectType as ObjectType, accountId);
        const machine = getStateMachine(ObjectType as ObjectType, accountId);

        res.json({
            data: {
                ObjectType,
                states,
                initialState: machine?.initialState
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/state-machines/:ObjectType/transitions
 * Get allowed transitions from a given state
 */
router.get('/:ObjectType/transitions', (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ObjectType } = req.params;
        const { state } = req.query;
        const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;

        if (!state || typeof state !== 'string') {
            res.status(400).json({
                error: 'state query parameter is required',
                status: 400
            });
            return;
        }

        const transitions = getAllowedTransitions(ObjectType as ObjectType, state, accountId);

        res.json({
            data: {
                ObjectType,
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
        const { ObjectType, currentState, newState, account_id } = req.body;
        const accountId = account_id || DEFAULT_ACCOUNT_ID;

        if (!ObjectType || !currentState || !newState) {
            res.status(400).json({
                error: 'ObjectType, currentState, and newState are required',
                status: 400
            });
            return;
        }

        const result = validateTransition(
            ObjectType as ObjectType,
            currentState,
            newState,
            undefined,
            accountId
        );

        // Include allowed transitions for context
        const allowed = getAllowedTransitions(ObjectType as ObjectType, currentState, accountId);

        res.json({
            data: {
                ObjectType,
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

