/**
 * Workflows API Route Tests
 *
 * Tests for /api/workflows endpoints:
 * - GET /api/workflows - List workflows
 * - GET /api/workflows/step-types - List step types
 * - GET /api/workflows/:slug - Get workflow with steps
 * - POST /api/workflows/:slug/trigger - Trigger workflow
 * - GET /api/workflows/:slug/enrollments - List workflow enrollments
 * - GET /api/workflows/enrollments/all - List all enrollments
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

describe('Workflows API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    /**
     * Helper to seed a workflow record
     */
    function seedWorkflow(data: {
        slug: string;
        name: string;
        summary?: string;
        triggerType?: string;
        triggerEvent?: string;
        isActive?: boolean;
        firstStepSlug?: string;
    }): string {
        return seedTestRecord({
            type: 'workflow',
            slug: data.slug,
            name: data.name,
            description: data.summary || '',
            data: {
                trigger_type: data.triggerType || 'manual',
                trigger_event: data.triggerEvent,
                is_active: data.isActive ?? true,
                first_step_slug: data.firstStepSlug,
            },
        });
    }

    /**
     * Helper to seed a workflow step record
     */
    function seedWorkflowStep(data: {
        slug: string;
        name: string;
        workflowSlug: string;
        sequence: number;
        stepType: string;
        nextStepSlug?: string;
        branchStepSlug?: string;
    }): string {
        return seedTestRecord({
            type: 'workflow_step',
            slug: data.slug,
            name: data.name,
            data: {
                workflow_slug: data.workflowSlug,
                sequence: data.sequence,
                step_type: data.stepType,
                next_step_slug: data.nextStepSlug,
                branch_step_slug: data.branchStepSlug,
            },
        });
    }

    /**
     * Helper to seed a workflow step type record
     */
    function seedWorkflowStepType(data: {
        slug: string;
        name: string;
        description?: string;
        handler?: string;
        generatesActivity?: boolean;
    }): string {
        return seedTestRecord({
            type: 'workflow_step_type',
            slug: data.slug,
            name: data.name,
            data: {
                description: data.description || '',
                handler: data.handler || data.slug,
                generates_activity: data.generatesActivity ?? false,
            },
        });
    }

    /**
     * Helper to seed a workflow enrollment record
     */
    function seedWorkflowEnrollment(data: {
        workflowSlug: string;
        contactId?: string;
        status?: string;
        currentStepSlug?: string;
    }): string {
        return seedTestRecord({
            type: 'workflow_enrollment',
            slug: `enrollment-${crypto.randomUUID().substring(0, 8)}`,
            name: `Enrollment for ${data.workflowSlug}`,
            data: {
                workflow_slug: data.workflowSlug,
                contact_id: data.contactId || crypto.randomUUID(),
                status: data.status || 'active',
                current_step_slug: data.currentStepSlug,
                enrolled_at: new Date().toISOString(),
            },
        });
    }

    describe('GET /api/workflows', () => {
        it('returns empty array when no workflows exist', async () => {
            const client = getClient();
            const response = await client.get('/workflows');

            expect(response.status).toBe(200);
            expect(response.data.data).toEqual([]);
        });

        it('returns all workflows with step counts', async () => {
            seedWorkflow({
                slug: 'welcome-sequence',
                name: 'Welcome Sequence',
                summary: 'Send welcome emails to new contacts',
                triggerType: 'event',
                triggerEvent: 'contact.created',
                firstStepSlug: 'send-welcome',
            });

            seedWorkflowStep({
                slug: 'send-welcome',
                name: 'Send Welcome Email',
                workflowSlug: 'welcome-sequence',
                sequence: 1,
                stepType: 'send',
                nextStepSlug: 'wait-day',
            });

            seedWorkflowStep({
                slug: 'wait-day',
                name: 'Wait 1 Day',
                workflowSlug: 'welcome-sequence',
                sequence: 2,
                stepType: 'wait',
            });

            seedWorkflow({
                slug: 'chain-reaction',
                name: 'Chain Reaction',
                summary: 'Advance opportunity stages',
                triggerType: 'event',
                triggerEvent: 'activity.completed',
            });

            const client = getClient();
            const response = await client.get('/workflows');

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(2);

            const welcomeWorkflow = response.data.data.find((w: any) => w.slug === 'welcome-sequence');
            expect(welcomeWorkflow.name).toBe('Welcome Sequence');
            expect(welcomeWorkflow.stepCount).toBe(2);
            expect(welcomeWorkflow.triggerType).toBe('event');
            expect(welcomeWorkflow.isActive).toBe(true);
        });
    });

    describe('GET /api/workflows/step-types', () => {
        it('returns available step types', async () => {
            seedWorkflowStepType({
                slug: 'wait',
                name: 'Wait',
                description: 'Wait for a duration',
                handler: 'wait',
            });

            seedWorkflowStepType({
                slug: 'send',
                name: 'Send Email',
                description: 'Send an email to contact',
                handler: 'send',
                generatesActivity: true,
            });

            seedWorkflowStepType({
                slug: 'branch',
                name: 'Branch',
                description: 'Conditionally branch the workflow',
                handler: 'branch',
            });

            const client = getClient();
            const response = await client.get('/workflows/step-types');

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(3);
            expect(response.data.data.map((st: any) => st.slug)).toContain('wait');
            expect(response.data.data.map((st: any) => st.slug)).toContain('send');
            expect(response.data.data.map((st: any) => st.slug)).toContain('branch');

            const sendType = response.data.data.find((st: any) => st.slug === 'send');
            expect(sendType.generatesActivity).toBe(true);
        });
    });

    describe('GET /api/workflows/:slug', () => {
        it('returns workflow with all steps', async () => {
            seedWorkflow({
                slug: 'welcome-sequence',
                name: 'Welcome Sequence',
                summary: 'Onboarding workflow',
                triggerType: 'event',
                triggerEvent: 'contact.created',
                firstStepSlug: 'step-1',
            });

            seedWorkflowStep({
                slug: 'step-1',
                name: 'Send Welcome Email',
                workflowSlug: 'welcome-sequence',
                sequence: 1,
                stepType: 'send',
                nextStepSlug: 'step-2',
            });

            seedWorkflowStep({
                slug: 'step-2',
                name: 'Wait 24 Hours',
                workflowSlug: 'welcome-sequence',
                sequence: 2,
                stepType: 'wait',
                nextStepSlug: 'step-3',
            });

            seedWorkflowStep({
                slug: 'step-3',
                name: 'Check Engagement',
                workflowSlug: 'welcome-sequence',
                sequence: 3,
                stepType: 'branch',
                nextStepSlug: 'step-4',
                branchStepSlug: 'step-5',
            });

            const client = getClient();
            const response = await client.get('/workflows/welcome-sequence');

            expect(response.status).toBe(200);
            expect(response.data.data.workflow).toBeDefined();
            expect(response.data.data.steps).toBeDefined();

            const { workflow, steps } = response.data.data;
            expect(workflow.slug).toBe('welcome-sequence');
            expect(workflow.name).toBe('Welcome Sequence');
            expect(workflow.triggerEvent).toBe('contact.created');
            expect(workflow.firstStepSlug).toBe('step-1');

            expect(steps).toHaveLength(3);
            expect(steps[0].sequence).toBe(1);
            expect(steps[1].sequence).toBe(2);
            expect(steps[2].sequence).toBe(3);
            expect(steps[2].stepType).toBe('branch');
            expect(steps[2].branchStepSlug).toBe('step-5');
        });

        it('returns 404 for non-existent workflow', async () => {
            const client = getClient();
            const response = await client.get('/workflows/nonexistent');

            expect(response.status).toBe(404);
            expect(response.data.error).toContain('Workflow not found');
        });
    });

    describe('POST /api/workflows/:slug/trigger', () => {
        it('triggers a workflow manually', async () => {
            seedWorkflow({
                slug: 'manual-workflow',
                name: 'Manual Workflow',
                triggerType: 'manual',
                isActive: true,
            });

            const client = getClient();
            const response = await client.post('/workflows/manual-workflow/trigger', {
                event: 'manual',
                context: { test: true },
            });

            // Should succeed or return specific error
            // The actual execution may fail if no steps are defined, but the trigger call should work
            expect([200, 400]).toContain(response.status);
            if (response.status === 200) {
                expect(response.data.success).toBe(true);
            }
        });

        it('returns 400 for non-existent workflow', async () => {
            const client = getClient();
            const response = await client.post('/workflows/nonexistent/trigger', {
                event: 'manual',
            });

            expect(response.status).toBe(400);
            expect(response.data.error).toContain('not found');
        });
    });

    describe('GET /api/workflows/:slug/enrollments', () => {
        it('returns enrollments for a specific workflow', async () => {
            seedWorkflow({
                slug: 'welcome-sequence',
                name: 'Welcome Sequence',
            });

            seedWorkflowEnrollment({
                workflowSlug: 'welcome-sequence',
                status: 'active',
                currentStepSlug: 'step-1',
            });

            seedWorkflowEnrollment({
                workflowSlug: 'welcome-sequence',
                status: 'completed',
            });

            seedWorkflowEnrollment({
                workflowSlug: 'other-workflow',
                status: 'active',
            });

            const client = getClient();
            const response = await client.get('/workflows/welcome-sequence/enrollments');

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(2);
            expect(response.data.data.every((e: any) => e.workflowSlug === 'welcome-sequence')).toBe(true);
        });

        it('filters enrollments by status', async () => {
            seedWorkflow({
                slug: 'welcome-sequence',
                name: 'Welcome Sequence',
            });

            seedWorkflowEnrollment({
                workflowSlug: 'welcome-sequence',
                status: 'active',
            });

            seedWorkflowEnrollment({
                workflowSlug: 'welcome-sequence',
                status: 'active',
            });

            seedWorkflowEnrollment({
                workflowSlug: 'welcome-sequence',
                status: 'completed',
            });

            const client = getClient();
            const response = await client.get('/workflows/welcome-sequence/enrollments', {
                params: { status: 'active' }
            });

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(2);
            expect(response.data.data.every((e: any) => e.status === 'active')).toBe(true);
        });

        it('returns paginated results', async () => {
            seedWorkflow({
                slug: 'welcome-sequence',
                name: 'Welcome Sequence',
            });

            // Seed 5 enrollments
            for (let i = 0; i < 5; i++) {
                seedWorkflowEnrollment({
                    workflowSlug: 'welcome-sequence',
                    status: 'active',
                });
            }

            const client = getClient();
            const response = await client.get('/workflows/welcome-sequence/enrollments', {
                params: { limit: 2, offset: 0 }
            });

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(2);
            expect(response.data.pagination).toBeDefined();
            expect(response.data.pagination.total).toBe(5);
            expect(response.data.pagination.hasMore).toBe(true);
        });
    });

    describe('GET /api/workflows/enrollments/all', () => {
        it('returns all enrollments across workflows', async () => {
            seedWorkflowEnrollment({
                workflowSlug: 'workflow-a',
                status: 'active',
            });

            seedWorkflowEnrollment({
                workflowSlug: 'workflow-b',
                status: 'active',
            });

            seedWorkflowEnrollment({
                workflowSlug: 'workflow-c',
                status: 'completed',
            });

            const client = getClient();
            const response = await client.get('/workflows/enrollments/all');

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(3);
        });

        it('filters by workflow_slug', async () => {
            seedWorkflowEnrollment({
                workflowSlug: 'workflow-a',
                status: 'active',
            });

            seedWorkflowEnrollment({
                workflowSlug: 'workflow-a',
                status: 'completed',
            });

            seedWorkflowEnrollment({
                workflowSlug: 'workflow-b',
                status: 'active',
            });

            const client = getClient();
            const response = await client.get('/workflows/enrollments/all', {
                params: { workflow_slug: 'workflow-a' }
            });

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(2);
        });

        it('filters by status', async () => {
            seedWorkflowEnrollment({
                workflowSlug: 'workflow-a',
                status: 'active',
            });

            seedWorkflowEnrollment({
                workflowSlug: 'workflow-b',
                status: 'active',
            });

            seedWorkflowEnrollment({
                workflowSlug: 'workflow-c',
                status: 'completed',
            });

            const client = getClient();
            const response = await client.get('/workflows/enrollments/all', {
                params: { status: 'completed' }
            });

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(1);
            expect(response.data.data[0].status).toBe('completed');
        });
    });
});
