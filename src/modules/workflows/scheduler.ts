/**
 * Workflow Scheduler - Background Processing
 *
 * Follows AI scheduler pattern from src/modules/ai/execution/scheduler.ts.
 * Polls for workflow_enrollment records where:
 * - status = 'active'
 * - next_step_due_at <= NOW
 */

import { WorkflowEngine, ProcessResult } from './engine.js';

let workflowInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the workflow scheduler
 * @param accountId - Optional account ID to scope the scheduler to
 * @param intervalMs - Polling interval in milliseconds (default: 1 minute)
 * @returns Stop function
 */
export function startWorkflowScheduler(
    accountId: string = '',
    intervalMs: number = 60000
): () => void {
    if (workflowInterval) {
        console.warn('[WorkflowScheduler] Scheduler already running');
        return () => stopWorkflowScheduler();
    }

    console.log(`[WorkflowScheduler] Starting background scheduler (interval: ${intervalMs}ms)`);

    // Run immediately on start
    WorkflowEngine.processDueEnrollments(accountId || undefined).catch(err => {
        console.error(`[WorkflowScheduler] Initial run error: ${err instanceof Error ? err.message : String(err)}`);
    });

    // Schedule recurring runs
    workflowInterval = setInterval(() => {
        WorkflowEngine.processDueEnrollments(accountId || undefined).catch(err => {
            console.error(`[WorkflowScheduler] Scheduled run error: ${err instanceof Error ? err.message : String(err)}`);
        });
    }, intervalMs);

    return () => stopWorkflowScheduler();
}

/**
 * Stop the workflow scheduler
 */
export function stopWorkflowScheduler(): void {
    if (workflowInterval) {
        clearInterval(workflowInterval);
        workflowInterval = null;
        console.log('[WorkflowScheduler] Scheduler stopped');
    }
}

/**
 * Check if the scheduler is currently running
 */
export function isWorkflowSchedulerRunning(): boolean {
    return workflowInterval !== null;
}

/**
 * Manually trigger a processing run
 */
export async function triggerWorkflowProcessing(accountId?: string): Promise<ProcessResult> {
    return WorkflowEngine.processDueEnrollments(accountId);
}
