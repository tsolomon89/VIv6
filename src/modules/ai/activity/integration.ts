/**
 * Activity Integration
 *
 * Detects when Activities are assigned to AI agents and triggers execution.
 * Works with Activity.data.ai_execution instead of separate job tables.
 */

import * as crypto from 'crypto';
import { getRecord, listRecords, updateRecord, createRecord } from '../../../core/records.js';
import { getAgentConfig, executeActivity } from '../execution/engine.js';
import { evaluateActivityAfterExecution, isOblioQualifier } from './qualifiers.js';
import { ChainReactionHandler } from '../../activities/chain_reaction.js';
import type { AIActivityData, AIExecutionData, ExecutionResult, ActivityQualifierResult, Qualifier, OblioQualifier } from '../types.js';

/**
 * Check if a qualifier is completed (works for both simple and Oblio qualifiers).
 */
function isQualifierCompleted(q: Qualifier | OblioQualifier): boolean {
    if (isOblioQualifier(q)) {
        // OblioQualifier uses _result from evaluation (or check _evaluated)
        return q._result === true;
    }
    // Simple Qualifier uses completed flag
    return q.completed === true;
}

/**
 * Get the name/identifier for a qualifier.
 */
function getQualifierName(q: Qualifier | OblioQualifier): string {
    if (isOblioQualifier(q)) {
        return q.qualifier;
    }
    return q.name;
}

/**
 * Extended execution result that includes qualifier evaluation.
 */
export interface ExecutionWithQualifiersResult extends ExecutionResult {
    qualifierResult?: ActivityQualifierResult;
    won?: boolean;
}

/**
 * Check if a Contact is an AI agent.
 */
export function isAIAgent(contactId: string): boolean {
    const config = getAgentConfig(contactId);
    return config !== null && config.isAiAgent;
}

/**
 * Handle Activity assignment - check if assignee is AI agent and queue execution.
 *
 * This should be called when:
 * 1. An Activity is created with an assigned_to field
 * 2. An Activity is updated and assigned_to changes to an AI agent
 *
 * @param activityId - The Activity record ID
 * @returns True if execution was queued, false otherwise
 */
export async function handleActivityAssignment(activityId: string): Promise<boolean> {
    // Get the activity record
    const activity = getRecord(activityId);
    if (!activity || activity.type !== 'activity') {
        console.warn(`[AI Activity] Activity not found: ${activityId}`);
        return false;
    }

    const data = activity.data as AIActivityData;

    // Check if assigned to an AI agent
    if (!data.assigned_to) {
        return false;
    }

    if (!isAIAgent(data.assigned_to)) {
        return false;
    }

    // Check if already has an execution in progress
    if (data.ai_execution?.status === 'running') {
        console.log(`[AI Activity] Activity ${activityId} already has execution in progress`);
        return false;
    }

    // Initialize ai_execution with pending status
    const execution: AIExecutionData = {
        status: 'pending',
        queuedAt: new Date().toISOString(),
    };

    // Preserve existing data (including fieldGroups if present)
    const currentData = activity.data as Record<string, unknown>;
    await updateRecord(activityId, {
        data: {
            ...currentData,
            ai_execution: execution,
        } as any,
    });

    console.log(`[AI Activity] Queued execution for activity ${activityId}`);
    return true;
}

/**
 * Execute an Activity that has been queued for AI processing.
 * After execution, evaluates qualifiers to determine if Activity "Won".
 * If Activity "Won", triggers chain reaction to potentially advance opportunity stage.
 *
 * Returns the execution result with qualifier evaluation.
 */
export async function executeQueuedActivity(activityId: string): Promise<ExecutionWithQualifiersResult | null> {
    const activity = getRecord(activityId);
    if (!activity || activity.type !== 'activity') {
        return null;
    }

    const data = activity.data as AIActivityData;

    // Verify it's queued for AI execution
    if (!data.ai_execution || data.ai_execution.status !== 'pending') {
        return null;
    }

    // Execute the activity
    const result = await executeActivity(activityId);

    // If execution succeeded, evaluate qualifiers
    if (result.success) {
        const qualifierResult = await evaluateActivityAfterExecution(activityId, activity.account_id);
        const extendedResult: ExecutionWithQualifiersResult = {
            ...result,
            qualifierResult,
            won: qualifierResult.allPassed,
        };

        if (qualifierResult.allPassed) {
            console.log(`[AI Activity] Activity ${activityId} WON - all qualifiers passed`);

            // Trigger chain reaction to potentially advance opportunity stage
            // Re-fetch activity to get updated state with qualifiers
            const updatedActivity = getRecord(activityId);
            if (updatedActivity) {
                try {
                    await ChainReactionHandler.onActivityCompleted(updatedActivity);
                } catch (chainErr) {
                    console.warn(`[AI Activity] Chain reaction failed: ${chainErr instanceof Error ? chainErr.message : String(chainErr)}`);
                }
            }
        } else {
            const failedCount = qualifierResult.results.filter(r => !r.passed).length;
            console.log(`[AI Activity] Activity ${activityId} completed but ${failedCount} qualifiers pending`);
        }

        return extendedResult;
    }

    return result;
}

/**
 * Check all pending activities for AI agent assignments.
 * Returns count of activities queued for execution.
 */
export async function processPendingActivities(accountId?: string): Promise<number> {
    // List all activity records
    const activities = listRecords(accountId || '', 'activity' as any);
    let queuedCount = 0;

    for (const activity of activities) {
        const data = activity.data as AIActivityData;

        // Skip if not assigned
        if (!data.assigned_to) continue;

        // Skip if already completed (all qualifiers passed)
        if (data.qualifiers?.every(q => isQualifierCompleted(q))) continue;

        // Skip if already has execution in progress or completed
        if (data.ai_execution?.status === 'running' || data.ai_execution?.status === 'completed') {
            continue;
        }

        // Skip if not AI agent
        if (!isAIAgent(data.assigned_to)) continue;

        // Queue the activity
        const queued = await handleActivityAssignment(activity.id);
        if (queued) {
            queuedCount++;
        }
    }

    return queuedCount;
}

/**
 * Mark activity qualifiers as completed based on execution results.
 */
export async function updateActivityFromExecution(
    activityId: string,
    completedQualifiers: string[]
): Promise<void> {
    if (completedQualifiers.length === 0) return;

    const activity = getRecord(activityId);
    if (!activity || activity.type !== 'activity') return;

    const data = activity.data as AIActivityData;
    const qualifiers = data.qualifiers || [];

    // Mark matching qualifiers as completed
    for (const qualifier of qualifiers) {
        const qName = getQualifierName(qualifier);
        if (completedQualifiers.includes(qName)) {
            if (isOblioQualifier(qualifier)) {
                // OblioQualifier: mark as evaluated with result true
                qualifier._evaluated = true;
                qualifier._result = true;
                qualifier._evaluatedAt = new Date().toISOString();
            } else {
                // Simple Qualifier: mark completed
                qualifier.completed = true;
            }
        }
    }

    // Update the record (preserve existing data)
    const currentData = activity.data as Record<string, unknown>;
    await updateRecord(activityId, {
        data: {
            ...currentData,
            qualifiers,
        } as any,
    });
}

/**
 * Create an Approval Activity based on Tier-1 rules.
 * Called when an AI execution completes and requires human review.
 */
export async function createApprovalActivity(
    originalActivityId: string,
    accountId: string,
    requiredRole: string
): Promise<string | null> {
    // Get original activity
    const original = getRecord(originalActivityId);
    if (!original || original.type !== 'activity') return null;

    const originalData = original.data as AIActivityData;

    // Create approval activity
    const approvalSlug = `approval-${original.slug}-${Date.now()}`;
    const approvalData: AIActivityData = {
        activity_type: 'admin',
        subject: `Review AI Work: ${originalData.subject || original.name}`,
        description: `Review and approve work completed by AI agent for activity: ${original.name}`,
        status: 'pending',
        qualifiers: [
            { name: 'Review AI output', description: 'Check the work completed by the AI agent', completed: false },
            { name: 'Approve or reject', description: 'Accept the changes or send back for revision', completed: false },
        ],
        // Reference to original activity
        original_activity_id: originalActivityId,
        required_role: requiredRole,
    };

    try {
        const result = await createRecord({
            account_id: accountId,
            type: 'activity',
            slug: approvalSlug,
            name: `Review: ${original.name}`,
            data: approvalData as any,
        });

        return result?.id || null;
    } catch (error) {
        console.warn(`[AI Activity] Failed to create approval activity: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}

/**
 * Get pending AI activities for an account.
 */
export function getPendingAIActivities(accountId: string): Array<{
    id: string;
    name: string;
    status: string;
    queuedAt?: string;
}> {
    const activities = listRecords(accountId, 'activity' as any);
    const pending: Array<{ id: string; name: string; status: string; queuedAt?: string }> = [];

    for (const activity of activities) {
        const data = activity.data as AIActivityData;
        if (data.ai_execution?.status === 'pending') {
            pending.push({
                id: activity.id,
                name: activity.name,
                status: 'pending',
                queuedAt: data.ai_execution.queuedAt,
            });
        }
    }

    return pending;
}

/**
 * Get running AI activities for an account.
 */
export function getRunningAIActivities(accountId: string): Array<{
    id: string;
    name: string;
    status: string;
    startedAt?: string;
    iterations?: number;
}> {
    const activities = listRecords(accountId, 'activity' as any);
    const running: Array<{ id: string; name: string; status: string; startedAt?: string; iterations?: number }> = [];

    for (const activity of activities) {
        const data = activity.data as AIActivityData;
        if (data.ai_execution?.status === 'running') {
            running.push({
                id: activity.id,
                name: activity.name,
                status: 'running',
                startedAt: data.ai_execution.startedAt,
                iterations: data.ai_execution.iterations,
            });
        }
    }

    return running;
}
