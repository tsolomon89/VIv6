/**
 * Workflow API Routes
 *
 * REST endpoints for managing workflows, enrollments, and triggering executions.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { WorkflowEngine } from '../../modules/workflows/engine.js';
import { listRecords, getRecordBySlug } from '../../modules/content/services.js';
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import { firstQueryValue } from '../../core/http/query.js';
import { protectedRoute } from '../../modules/auth/middleware.js';
import { parsePagination, paginatedResponse } from '../middleware/pagination.js';

const router = Router();

/**
 * GET /api/workflows
 * List all workflow definitions
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    try {
        const accountId = firstQueryValue(req.query.account_id) || DEFAULT_ACCOUNT_ID;
        const workflows = listRecords(accountId, 'workflow' as any);

        // Get step counts for each workflow
        const allSteps = listRecords(accountId, 'workflow_step' as any);
        const stepCountMap = new Map<string, number>();

        for (const step of allSteps) {
            const workflowSlug = step.data?.workflow_slug as string;
            if (workflowSlug) {
                stepCountMap.set(workflowSlug, (stepCountMap.get(workflowSlug) || 0) + 1);
            }
        }

        const result = workflows.map(w => ({
            id: w.id,
            slug: w.slug,
            name: w.name,
            summary: w.summary,
            triggerType: w.data?.trigger_type || w.data?.['Trigger Type'] || 'manual',
            triggerEvent: w.data?.trigger_event || w.data?.['Trigger Event'],
            isActive: w.data?.is_active ?? w.data?.['Is Active'] ?? true,
            stepCount: stepCountMap.get(w.slug) || 0
        }));

        res.json({ data: result });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/workflows/step-types
 * List available workflow step types
 */
router.get('/step-types', (req: Request, res: Response, next: NextFunction) => {
    try {
        const accountId = firstQueryValue(req.query.account_id) || DEFAULT_ACCOUNT_ID;
        const stepTypes = listRecords(accountId, 'workflow_step_type' as any);

        const result = stepTypes.map(st => ({
            slug: st.slug,
            name: st.name,
            description: st.data?.description || st.summary || '',
            handler: st.data?.handler || st.slug,
            generatesActivity: st.data?.generates_activity ?? false,
            requiredFields: st.data?.requires_fields || []
        }));

        res.json({ data: result });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/workflows/:slug
 * Get a workflow definition with all its steps
 */
router.get('/:slug', (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const accountId = firstQueryValue(req.query.account_id) || DEFAULT_ACCOUNT_ID;

        // Find workflow by slug from all workflow records
        const allWorkflows = listRecords(accountId, 'workflow' as any);
        const workflow = allWorkflows.find(w => w.slug === slug);

        if (!workflow) {
            res.status(404).json({
                error: `Workflow not found: ${slug}`,
                status: 404
            });
            return;
        }

        // Get all steps for this workflow
        const allSteps = listRecords(accountId, 'workflow_step' as any);
        const workflowSteps = allSteps
            .filter(s => s.data?.workflow_slug === slug)
            .sort((a, b) => ((a.data?.sequence || 0) as number) - ((b.data?.sequence || 0) as number));

        res.json({
            data: {
                workflow: {
                    id: workflow.id,
                    slug: workflow.slug,
                    name: workflow.name,
                    summary: workflow.summary,
                    triggerType: workflow.data?.trigger_type || 'manual',
                    triggerEvent: workflow.data?.trigger_event,
                    isActive: workflow.data?.is_active ?? true,
                    firstStepSlug: workflow.data?.first_step_slug
                },
                steps: workflowSteps.map(s => ({
                    id: s.id,
                    slug: s.slug,
                    name: s.name,
                    sequence: s.data?.sequence || 0,
                    stepType: s.data?.step_type || 'unknown',
                    nextStepSlug: s.data?.next_step_slug,
                    branchStepSlug: s.data?.branch_step_slug,
                    data: s.data
                }))
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/workflows/:slug/trigger
 * Manually trigger a workflow
 */
router.post('/:slug/trigger', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const { event = 'manual', context = {} } = req.body;

        await WorkflowEngine.triggerWorkflow(slug, event, context);

        res.json({
            success: true,
            message: `Workflow '${slug}' triggered with event '${event}'`
        });
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({
                error: err.message,
                status: 400
            });
        } else {
            next(err);
        }
    }
});

/**
 * GET /api/workflows/:slug/enrollments
 * List enrollments for a specific workflow
 */
router.get('/:slug/enrollments', (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const status = firstQueryValue(req.query.status);
        const accountId = firstQueryValue(req.query.account_id) || DEFAULT_ACCOUNT_ID;
        const pagination = parsePagination(req);

        let enrollments = listRecords(accountId, 'workflow_enrollment' as any)
            .filter(e =>
                e.data?.workflow_slug === slug ||
                e.data?.['Workflow Slug'] === slug
            );

        // Filter by status if specified
        if (status) {
            enrollments = enrollments.filter(e =>
                e.data?.status === status ||
                e.data?.['Status'] === status
            );
        }

        const total = enrollments.length;

        // Apply pagination
        const start = pagination.offset;
        const end = start + pagination.limit;
        const paginatedEnrollments = enrollments.slice(start, end);

        const result = paginatedEnrollments.map(e => ({
            id: e.id,
            workflowSlug: e.data?.workflow_slug || e.data?.['Workflow Slug'],
            contactId: e.data?.contact_id || e.data?.['Contact ID'],
            status: e.data?.status || e.data?.['Status'] || 'unknown',
            currentStepSlug: e.data?.current_step_slug || e.data?.['Current Step Slug'],
            enrolledAt: e.data?.enrolled_at || e.data?.['Enrolled At'],
            completedAt: e.data?.completed_at || e.data?.['Completed At']
        }));

        res.json(paginatedResponse(result, total, pagination));
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/workflows/enrollments
 * List all enrollments (across all workflows)
 */
router.get('/enrollments/all', (req: Request, res: Response, next: NextFunction) => {
    try {
        const workflowSlug = firstQueryValue(req.query.workflow_slug);
        const status = firstQueryValue(req.query.status);
        const accountId = firstQueryValue(req.query.account_id) || DEFAULT_ACCOUNT_ID;
        const pagination = parsePagination(req);

        let enrollments = listRecords(accountId, 'workflow_enrollment' as any);

        // Filter by workflow if specified
        if (workflowSlug) {
            enrollments = enrollments.filter(e =>
                e.data?.workflow_slug === workflowSlug ||
                e.data?.['Workflow Slug'] === workflowSlug
            );
        }

        // Filter by status if specified
        if (status) {
            enrollments = enrollments.filter(e =>
                e.data?.status === status ||
                e.data?.['Status'] === status
            );
        }

        const total = enrollments.length;

        // Apply pagination
        const start = pagination.offset;
        const end = start + pagination.limit;
        const paginatedEnrollments = enrollments.slice(start, end);

        const result = paginatedEnrollments.map(e => ({
            id: e.id,
            workflowSlug: e.data?.workflow_slug || e.data?.['Workflow Slug'],
            contactId: e.data?.contact_id || e.data?.['Contact ID'],
            status: e.data?.status || e.data?.['Status'] || 'unknown',
            currentStepSlug: e.data?.current_step_slug || e.data?.['Current Step Slug'],
            enrolledAt: e.data?.enrolled_at || e.data?.['Enrolled At'],
            completedAt: e.data?.completed_at || e.data?.['Completed At']
        }));

        res.json(paginatedResponse(result, total, pagination));
    } catch (err) {
        next(err);
    }
});

export default router;
