/**
 * MCP Workflow Tool Handlers
 *
 * Provides tools for querying, inspecting, and triggering workflows.
 * Workflows are multi-step automation sequences triggered by events.
 */

import { db } from '../../core/db.js';
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import { WorkflowEngine } from '../../modules/workflows/engine.js';
import { listRecords, getRecordBySlug } from '../../modules/content/services.js';
import { DataRecord } from '../../core/types.js';

// ============================================================================
// TYPES
// ============================================================================

export interface ListWorkflowsResult {
    count: number;
    workflows: Array<{
        id: string;
        slug: string;
        name: string;
        summary: string;
        triggerType: string;
        triggerEvent?: string;
        isActive: boolean;
        stepCount: number;
    }>;
}

export interface GetWorkflowArgs {
    workflowSlug: string;
    accountId?: string;
}

export interface WorkflowStep {
    slug: string;
    name: string;
    sequence: number;
    stepType: string;
    nextStepSlug?: string;
    branchStepSlug?: string;
    data: Record<string, any>;
}

export interface GetWorkflowResult {
    found: boolean;
    workflowSlug: string;
    workflow?: {
        id: string;
        slug: string;
        name: string;
        summary: string;
        triggerType: string;
        triggerEvent?: string;
        isActive: boolean;
        firstStepSlug?: string;
    };
    steps?: WorkflowStep[];
    error?: string;
}

export interface TriggerWorkflowArgs {
    workflowSlug: string;
    event?: string;
    context?: Record<string, any>;
}

export interface TriggerWorkflowResult {
    success: boolean;
    workflowSlug: string;
    message: string;
    error?: string;
}

export interface ListEnrollmentsArgs {
    workflowSlug?: string;
    status?: string;
    accountId?: string;
}

export interface WorkflowEnrollment {
    id: string;
    workflowSlug: string;
    contactId: string;
    status: string;
    currentStepSlug?: string;
    enrolledAt: string;
    completedAt?: string;
}

export interface ListEnrollmentsResult {
    count: number;
    enrollments: WorkflowEnrollment[];
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * List all workflow definitions
 */
export function listWorkflows(accountId: string = DEFAULT_ACCOUNT_ID): ListWorkflowsResult {
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

    return {
        count: workflows.length,
        workflows: workflows.map(w => ({
            id: w.id,
            slug: w.slug,
            name: w.name,
            summary: w.summary || '',
            triggerType: (w.data?.trigger_type || w.data?.['Trigger Type'] || 'manual') as string,
            triggerEvent: (w.data?.trigger_event || w.data?.['Trigger Event']) as string | undefined,
            isActive: (w.data?.is_active ?? w.data?.['Is Active'] ?? true) as boolean,
            stepCount: stepCountMap.get(w.slug) || 0
        }))
    };
}

/**
 * Get workflow definition with all steps
 */
export function getWorkflowWithSteps(args: GetWorkflowArgs): GetWorkflowResult {
    const { workflowSlug, accountId = DEFAULT_ACCOUNT_ID } = args;

    const workflow = getRecordBySlug(accountId, 'workflow' as any, workflowSlug);

    if (!workflow) {
        return {
            found: false,
            workflowSlug,
            error: `Workflow not found: ${workflowSlug}`
        };
    }

    // Get all steps for this workflow
    const allSteps = listRecords(accountId, 'workflow_step' as any);
    const workflowSteps = allSteps
        .filter(s => s.data?.workflow_slug === workflowSlug)
        .sort((a, b) => ((a.data?.sequence || 0) as number) - ((b.data?.sequence || 0) as number));

    return {
        found: true,
        workflowSlug,
        workflow: {
            id: workflow.id,
            slug: workflow.slug,
            name: workflow.name,
            summary: workflow.summary || '',
            triggerType: (workflow.data?.trigger_type || workflow.data?.['Trigger Type'] || 'manual') as string,
            triggerEvent: (workflow.data?.trigger_event || workflow.data?.['Trigger Event']) as string | undefined,
            isActive: (workflow.data?.is_active ?? workflow.data?.['Is Active'] ?? true) as boolean,
            firstStepSlug: (workflow.data?.first_step_slug || workflow.data?.['First Step Slug']) as string | undefined
        },
        steps: workflowSteps.map(s => ({
            slug: s.slug,
            name: s.name,
            sequence: (s.data?.sequence || 0) as number,
            stepType: (s.data?.step_type || s.data?.['Step Type'] || 'unknown') as string,
            nextStepSlug: s.data?.next_step_slug as string | undefined,
            branchStepSlug: s.data?.branch_step_slug as string | undefined,
            data: s.data || {}
        }))
    };
}

/**
 * Manually trigger a workflow
 */
export async function triggerWorkflow(args: TriggerWorkflowArgs): Promise<TriggerWorkflowResult> {
    const { workflowSlug, event = 'manual', context = {} } = args;

    try {
        await WorkflowEngine.triggerWorkflow(workflowSlug, event, context);

        return {
            success: true,
            workflowSlug,
            message: `Workflow '${workflowSlug}' triggered successfully with event '${event}'`
        };
    } catch (err) {
        return {
            success: false,
            workflowSlug,
            message: 'Failed to trigger workflow',
            error: err instanceof Error ? err.message : String(err)
        };
    }
}

/**
 * List workflow enrollments
 */
export function listWorkflowEnrollments(args: ListEnrollmentsArgs): ListEnrollmentsResult {
    const { workflowSlug, status, accountId = DEFAULT_ACCOUNT_ID } = args;

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

    return {
        count: enrollments.length,
        enrollments: enrollments.map(e => ({
            id: e.id,
            workflowSlug: (e.data?.workflow_slug || e.data?.['Workflow Slug'] || '') as string,
            contactId: (e.data?.contact_id || e.data?.['Contact ID'] || '') as string,
            status: (e.data?.status || e.data?.['Status'] || 'unknown') as string,
            currentStepSlug: (e.data?.current_step_slug || e.data?.['Current Step Slug']) as string | undefined,
            enrolledAt: (e.data?.enrolled_at || e.data?.['Enrolled At'] || '') as string,
            completedAt: (e.data?.completed_at || e.data?.['Completed At']) as string | undefined
        }))
    };
}

/**
 * Get workflow step types
 */
export function listWorkflowStepTypes(accountId: string = DEFAULT_ACCOUNT_ID): {
    count: number;
    stepTypes: Array<{
        slug: string;
        name: string;
        description: string;
        handler: string;
        generatesActivity: boolean;
    }>;
} {
    const stepTypes = listRecords(accountId, 'workflow_step_type' as any);

    return {
        count: stepTypes.length,
        stepTypes: stepTypes.map(st => ({
            slug: st.slug,
            name: st.name,
            description: (st.data?.description || st.summary || '') as string,
            handler: (st.data?.handler || st.slug) as string,
            generatesActivity: (st.data?.generates_activity ?? false) as boolean
        }))
    };
}
