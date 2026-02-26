/**
 * State Machines API Route Tests
 *
 * Tests for /api/state-machines endpoints:
 * - GET /api/state-machines - List state machines
 * - GET /api/state-machines/:entityType - Get state machine for entity type
 * - GET /api/state-machines/:entityType/states - Get valid states
 * - GET /api/state-machines/:entityType/transitions - Get allowed transitions
 * - POST /api/state-machines/validate - Validate a state transition
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    seedTestRecord,
    db,
} from './setup.js';
import { clearStateMachineCache } from '../../../modules/ops/state_machine.js';

describe('State Machines API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
        clearStateMachineCache();  // Clear cache between tests
    });

    /**
     * Helper to seed a state machine record
     */
    function seedStateMachine(data: {
        slug: string;
        name: string;
        targetEntityType: string;
        stateField: string;
        states: string[];
        transitions: Array<{ from: string; to: string; action?: string }>;
        initialState: string;
    }): string {
        return seedTestRecord({
            type: 'state_machine',
            slug: data.slug,
            name: data.name,
            data: {
                targetEntityType: data.targetEntityType,
                stateField: data.stateField,
                states: data.states,  // Don't stringify - seedTestRecord does it
                transitions: data.transitions,  // Don't stringify - seedTestRecord does it
                initialState: data.initialState,
            },
        });
    }

    describe('GET /api/state-machines', () => {
        it('returns empty array when no state machines exist', async () => {
            const client = getClient();
            const response = await client.get('/state-machines');

            expect(response.status).toBe(200);
            expect(response.data.data).toEqual([]);
        });

        it('returns all state machine definitions', async () => {
            seedStateMachine({
                slug: 'activity-lifecycle',
                name: 'Activity Lifecycle',
                targetEntityType: 'activity',
                stateField: 'status',
                states: ['pending', 'in_progress', 'completed'],
                transitions: [
                    { from: 'pending', to: 'in_progress', action: 'start' },
                    { from: 'in_progress', to: 'completed', action: 'complete' },
                ],
                initialState: 'pending',
            });

            seedStateMachine({
                slug: 'opportunity-lifecycle',
                name: 'Opportunity Lifecycle',
                targetEntityType: 'opportunity',
                stateField: 'opportunity_stage',
                states: ['mql', 'sql', 'ftp', 'rtp'],
                transitions: [
                    { from: 'mql', to: 'sql' },
                    { from: 'sql', to: 'ftp' },
                    { from: 'ftp', to: 'rtp' },
                ],
                initialState: 'mql',
            });

            const client = getClient();
            const response = await client.get('/state-machines');

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(2);
            expect(response.data.data.map((m: any) => m.slug)).toContain('activity-lifecycle');
            expect(response.data.data.map((m: any) => m.slug)).toContain('opportunity-lifecycle');
        });
    });

    describe('GET /api/state-machines/:entityType', () => {
        it('returns state machine for valid entity type', async () => {
            seedStateMachine({
                slug: 'activity-lifecycle',
                name: 'Activity Lifecycle',
                targetEntityType: 'activity',
                stateField: 'status',
                states: ['pending', 'in_progress', 'completed', 'cancelled'],
                transitions: [
                    { from: 'pending', to: 'in_progress', action: 'start' },
                    { from: 'in_progress', to: 'completed', action: 'complete' },
                    { from: 'in_progress', to: 'cancelled', action: 'cancel' },
                ],
                initialState: 'pending',
            });

            const client = getClient();
            const response = await client.get('/state-machines/activity');

            expect(response.status).toBe(200);
            expect(response.data.data).toBeDefined();
            expect(response.data.data.targetEntityType).toBe('activity');
            expect(response.data.data.stateField).toBe('status');
            expect(response.data.data.states).toContain('pending');
            expect(response.data.data.states).toContain('completed');
            expect(response.data.data.initialState).toBe('pending');
        });

        it('returns 404 for non-existent entity type', async () => {
            const client = getClient();
            const response = await client.get('/state-machines/nonexistent');

            expect(response.status).toBe(404);
            expect(response.data.error).toContain('No state machine');
        });
    });

    describe('GET /api/state-machines/:entityType/states', () => {
        it('returns valid states for entity type', async () => {
            seedStateMachine({
                slug: 'activity-lifecycle',
                name: 'Activity Lifecycle',
                targetEntityType: 'activity',
                stateField: 'status',
                states: ['pending', 'in_progress', 'completed'],
                transitions: [
                    { from: 'pending', to: 'in_progress' },
                    { from: 'in_progress', to: 'completed' },
                ],
                initialState: 'pending',
            });

            const client = getClient();
            const response = await client.get('/state-machines/activity/states');

            expect(response.status).toBe(200);
            expect(response.data.data.entityType).toBe('activity');
            expect(response.data.data.states).toContain('pending');
            expect(response.data.data.states).toContain('in_progress');
            expect(response.data.data.states).toContain('completed');
            expect(response.data.data.initialState).toBe('pending');
        });

        it('returns empty states for non-existent entity type', async () => {
            const client = getClient();
            const response = await client.get('/state-machines/nonexistent/states');

            expect(response.status).toBe(200);
            expect(response.data.data.states).toEqual([]);
        });
    });

    describe('GET /api/state-machines/:entityType/transitions', () => {
        it('returns allowed transitions from a state', async () => {
            seedStateMachine({
                slug: 'activity-lifecycle',
                name: 'Activity Lifecycle',
                targetEntityType: 'activity',
                stateField: 'status',
                states: ['pending', 'in_progress', 'completed', 'cancelled'],
                transitions: [
                    { from: 'pending', to: 'in_progress', action: 'start' },
                    { from: 'pending', to: 'cancelled', action: 'cancel' },
                    { from: 'in_progress', to: 'completed', action: 'complete' },
                ],
                initialState: 'pending',
            });

            const client = getClient();
            const response = await client.get('/state-machines/activity/transitions', {
                params: { state: 'pending' }
            });

            expect(response.status).toBe(200);
            expect(response.data.data.entityType).toBe('activity');
            expect(response.data.data.currentState).toBe('pending');
            expect(response.data.data.transitions).toHaveLength(2);
            expect(response.data.data.transitions.map((t: any) => t.to)).toContain('in_progress');
            expect(response.data.data.transitions.map((t: any) => t.to)).toContain('cancelled');
        });

        it('returns 400 when state parameter is missing', async () => {
            const client = getClient();
            const response = await client.get('/state-machines/activity/transitions');

            expect(response.status).toBe(400);
            expect(response.data.error).toContain('state');
        });

        it('returns empty transitions for terminal state', async () => {
            seedStateMachine({
                slug: 'activity-lifecycle',
                name: 'Activity Lifecycle',
                targetEntityType: 'activity',
                stateField: 'status',
                states: ['pending', 'completed'],
                transitions: [
                    { from: 'pending', to: 'completed' },
                ],
                initialState: 'pending',
            });

            const client = getClient();
            const response = await client.get('/state-machines/activity/transitions', {
                params: { state: 'completed' }
            });

            expect(response.status).toBe(200);
            expect(response.data.data.transitions).toHaveLength(0);
        });
    });

    describe('POST /api/state-machines/validate', () => {
        it('validates a valid transition', async () => {
            seedStateMachine({
                slug: 'activity-lifecycle',
                name: 'Activity Lifecycle',
                targetEntityType: 'activity',
                stateField: 'status',
                states: ['pending', 'in_progress', 'completed'],
                transitions: [
                    { from: 'pending', to: 'in_progress' },
                    { from: 'in_progress', to: 'completed' },
                ],
                initialState: 'pending',
            });

            const client = getClient();
            const response = await client.post('/state-machines/validate', {
                entityType: 'activity',
                currentState: 'pending',
                newState: 'in_progress',
            });

            expect(response.status).toBe(200);
            expect(response.data.data.valid).toBe(true);
            expect(response.data.data.entityType).toBe('activity');
            expect(response.data.data.currentState).toBe('pending');
            expect(response.data.data.newState).toBe('in_progress');
        });

        it('rejects an invalid transition', async () => {
            seedStateMachine({
                slug: 'activity-lifecycle',
                name: 'Activity Lifecycle',
                targetEntityType: 'activity',
                stateField: 'status',
                states: ['pending', 'in_progress', 'completed'],
                transitions: [
                    { from: 'pending', to: 'in_progress' },
                    { from: 'in_progress', to: 'completed' },
                ],
                initialState: 'pending',
            });

            const client = getClient();
            const response = await client.post('/state-machines/validate', {
                entityType: 'activity',
                currentState: 'pending',
                newState: 'completed',  // Invalid: should go through in_progress
            });

            expect(response.status).toBe(200);
            expect(response.data.data.valid).toBe(false);
            expect(response.data.data.error).toBeDefined();
            expect(response.data.data.allowedTransitions).toContain('in_progress');
        });

        it('returns 400 for missing required fields', async () => {
            const client = getClient();
            const response = await client.post('/state-machines/validate', {
                entityType: 'activity',
                // Missing currentState and newState
            });

            expect(response.status).toBe(400);
        });

        it('allows transition when no state machine is defined', async () => {
            const client = getClient();
            const response = await client.post('/state-machines/validate', {
                entityType: 'contact',  // No state machine defined
                currentState: 'active',
                newState: 'inactive',
            });

            expect(response.status).toBe(200);
            // When no state machine exists, all transitions are allowed
            expect(response.data.data.valid).toBe(true);
        });
    });
});
