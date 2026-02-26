/**
 * AI Activity Scheduler
 *
 * Background processing of pending AI activities.
 * Polls for Activities with ai_execution.status='pending' and triggers execution.
 *
 * After execution completes, evaluates Activity qualifiers to determine if
 * the Activity is "Won" (all qualifiers pass).
 */

import { listRecords, getRecord } from '../../../core/records.js';
import { executeActivity } from './engine.js';
import { evaluateActivityAfterExecution } from '../activity/qualifiers.js';
import { checkAndCreateApproval } from '../activity/approvals.js';
import { logUsage } from '../usage/service.js';
import type { AIActivityData, ActivityQualifierResult } from '../types.js';

// =============================================================================
// Types
// =============================================================================

export interface SchedulerResult {
    processed: number;
    succeeded: number;
    failed: number;
    won: number;  // Activities where all qualifiers passed
    details: ActivityProcessResult[];
}

export interface ActivityProcessResult {
    activityId: string;
    activityName: string;
    executionSuccess: boolean;
    executionError?: string;
    qualifierResult?: ActivityQualifierResult;
    won: boolean;
}

// =============================================================================
// Single Activity Processing
// =============================================================================

/**
 * Process a single pending AI activity.
 * 1. Execute the activity (AI does its work)
 * 2. Log usage to ai_usage_log table
 * 3. Check if approval is required and create approval activity
 * 4. Evaluate qualifiers after execution
 * 5. Return result indicating if Activity "Won"
 */
export async function processActivity(
    activityId: string,
    accountId: string
): Promise<ActivityProcessResult> {
    const result: ActivityProcessResult = {
        activityId,
        activityName: '',
        executionSuccess: false,
        won: false,
    };

    try {
        // Execute the AI activity
        const execResult = await executeActivity(activityId);

        // Log usage to ai_usage_log table
        if (execResult?.tokenUsage?.total) {
            try {
                const activity = getRecord(activityId);
                const activityData = activity?.data as AIActivityData | undefined;
                const credentialId = activityData?.ai_execution?.credentialId;
                const agentId = activityData?.assigned_to;
                const model = activityData?.ai_execution?.model || 'unknown';

                if (credentialId) {
                    logUsage({
                        accountId,
                        credentialId,
                        agentId: agentId || undefined,
                        activityId,
                        model,
                        tokenUsage: {
                            promptTokens: execResult.tokenUsage.promptTokens || 0,
                            completionTokens: execResult.tokenUsage.completionTokens || 0,
                            total: execResult.tokenUsage.total || 0,
                        },
                        costEstimate: execResult.costEstimate || 0,
                        operationType: 'activity',
                        success: execResult.success,
                        errorMessage: execResult.error,
                    });
                }
            } catch (usageErr) {
                console.warn(`[Scheduler] Failed to log usage: ${usageErr instanceof Error ? usageErr.message : String(usageErr)}`);
            }
        }

        if (execResult?.success) {
            result.executionSuccess = true;

            // Check if approval is required and create approval activity
            try {
                const approvalId = await checkAndCreateApproval(activityId, execResult, accountId);
                if (approvalId) {
                    console.log(`[Scheduler] Created approval activity ${approvalId} for activity ${activityId}`);
                }
            } catch (approvalErr) {
                console.warn(`[Scheduler] Failed to check/create approval: ${approvalErr instanceof Error ? approvalErr.message : String(approvalErr)}`);
            }

            // Evaluate qualifiers after execution
            const qualifierResult = await evaluateActivityAfterExecution(activityId, accountId);
            result.qualifierResult = qualifierResult;
            result.won = qualifierResult.allPassed;

            if (qualifierResult.allPassed) {
                console.log(`[Scheduler] Activity ${activityId} WON - all qualifiers passed`);
            } else {
                const failedCount = qualifierResult.results.filter(r => !r.passed).length;
                console.log(`[Scheduler] Activity ${activityId} completed but ${failedCount} qualifiers pending`);
            }
        } else {
            result.executionError = execResult?.error || 'Unknown execution error';
            console.warn(`[Scheduler] Activity ${activityId} execution failed: ${result.executionError}`);
        }
    } catch (err) {
        result.executionError = err instanceof Error ? err.message : String(err);
        console.error(`[Scheduler] Error processing activity ${activityId}:`, result.executionError);
    }

    return result;
}

// =============================================================================
// Batch Processing
// =============================================================================

/**
 * Process all pending AI activities for an account.
 * Called periodically or on-demand via API.
 */
export async function processPendingAIActivities(accountId: string): Promise<SchedulerResult> {
    const result: SchedulerResult = {
        processed: 0,
        succeeded: 0,
        failed: 0,
        won: 0,
        details: [],
    };

    // List all activity records for the account
    let activities;
    try {
        activities = listRecords(accountId, 'activity' as any);
    } catch (err) {
        console.error(`[Scheduler] Error listing activities for account ${accountId}:`,
            err instanceof Error ? err.message : String(err));
        return result;
    }

    for (const activity of activities) {
        const data = activity.data as AIActivityData;

        // Skip if not pending AI execution
        if (data.ai_execution?.status !== 'pending') {
            continue;
        }

        result.processed++;

        // Process this activity
        const activityResult = await processActivity(activity.id, accountId);
        activityResult.activityName = activity.name;
        result.details.push(activityResult);

        if (activityResult.executionSuccess) {
            result.succeeded++;
            if (activityResult.won) {
                result.won++;
            }
        } else {
            result.failed++;
        }
    }

    if (result.processed > 0) {
        console.log(`[Scheduler] Processed ${result.processed} activities: ${result.succeeded} succeeded (${result.won} won), ${result.failed} failed`);
    }

    return result;
}

// =============================================================================
// Background Scheduler
// =============================================================================

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let schedulerAccountId: string | null = null;

/**
 * Start background scheduler that polls for pending activities.
 *
 * @param accountId - Account to process activities for
 * @param intervalMs - Polling interval in milliseconds (default: 30 seconds)
 * @returns Stop function to halt the scheduler
 */
export function startScheduler(
    accountId: string,
    intervalMs: number = 30000
): () => void {
    // Stop any existing scheduler
    if (schedulerInterval) {
        stopScheduler();
    }

    console.log(`[Scheduler] Starting with ${intervalMs}ms interval for account ${accountId}`);

    schedulerAccountId = accountId;
    schedulerInterval = setInterval(async () => {
        try {
            await processPendingAIActivities(accountId);
        } catch (err) {
            console.error('[Scheduler] Error in background processing:',
                err instanceof Error ? err.message : String(err));
        }
    }, intervalMs);

    // Return stop function
    return stopScheduler;
}

/**
 * Stop the background scheduler.
 */
export function stopScheduler(): void {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
        console.log('[Scheduler] Stopped');
    }
    schedulerAccountId = null;
}

/**
 * Check if scheduler is currently running.
 */
export function isSchedulerRunning(): boolean {
    return schedulerInterval !== null;
}

/**
 * Get the account ID the scheduler is running for.
 */
export function getSchedulerAccountId(): string | null {
    return schedulerAccountId;
}

