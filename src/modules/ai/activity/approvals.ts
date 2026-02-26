/**
 * Approval Activities
 *
 * Tier-1 approval workflow for AI execution results.
 * When AI completes work, approval rules are evaluated to determine
 * if human review is required before changes are applied.
 *
 * Approval Rules are seeded as records (type: 'approval_rule').
 */

import { getRecord, listRecords, createRecord, updateRecord } from '../../../core/records.js';
import type {
    ApprovalRule,
    ApprovalContext,
    ApprovalTrigger,
    ToolCall,
    ProposedChange,
    ExecutionResult,
    AIActivityData,
} from '../types.js';

// Protected fields that commonly require approval
const PROTECTED_FIELDS = ['persona', 'linkage', 'budget', 'decision_maker', 'stage'];

/**
 * Load all approval rules from database (seeded as records).
 */
export function getApprovalRules(accountId: string): ApprovalRule[] {
    try {
        const records = listRecords(accountId, 'approval_rule' as any);
        return records.map(r => {
            const data = r.data as Record<string, unknown>;
            return {
                id: r.id,
                slug: r.slug,
                trigger: (data.trigger as ApprovalTrigger) || 'field_change',
                fields: data.fields as string[] | undefined,
                targetTypes: data.target_types as string[] | undefined,
                threshold: data.threshold as number | undefined,
                requiresRole: (data.requires_role as string) || 'any',
                description: (data.description as string) || '',
            };
        });
    } catch (err) {
        console.warn(`[Approvals] Failed to load approval rules: ${err instanceof Error ? err.message : String(err)}`);
        return [];
    }
}

/**
 * Evaluate which approval rules apply to AI execution results.
 *
 * @param rules - List of approval rules to check
 * @param toolCalls - Tool calls made during execution
 * @param proposedChanges - Proposed changes from execution
 * @param avgConfidence - Average confidence score (0-1)
 * @returns Array of triggered rules
 */
export function evaluateApprovalRules(
    rules: ApprovalRule[],
    toolCalls: ToolCall[],
    proposedChanges: ProposedChange[],
    avgConfidence: number
): ApprovalRule[] {
    const triggered: ApprovalRule[] = [];

    for (const rule of rules) {
        switch (rule.trigger) {
            case 'field_change':
                // Check if any proposed changes affect protected fields
                const affectedFields = proposedChanges
                    .filter(c => c.newValue !== c.oldValue)
                    .map(c => c.field.toLowerCase());

                const ruleFields = rule.fields || PROTECTED_FIELDS;
                const hasProtectedField = ruleFields.some(f =>
                    affectedFields.some(af => af.includes(f.toLowerCase()))
                );

                if (hasProtectedField) {
                    triggered.push(rule);
                }
                break;

            case 'record_create':
                // Check if any tool calls created records of protected types
                const createdTypes = toolCalls
                    .filter(tc => tc.name === 'create_entity' && tc.success)
                    .map(tc => tc.arguments?.type as string)
                    .filter(Boolean);

                const targetTypes = rule.targetTypes || ['opportunity'];
                if (targetTypes.some(t => createdTypes.includes(t))) {
                    triggered.push(rule);
                }
                break;

            case 'confidence_below':
                // Check if average confidence is below threshold
                const threshold = rule.threshold ?? 0.8;
                if (avgConfidence < threshold) {
                    triggered.push(rule);
                }
                break;

            default:
                // Unknown trigger type - skip
                break;
        }
    }

    return triggered;
}

/**
 * Calculate average confidence from proposed changes.
 */
export function calculateAverageConfidence(proposedChanges: ProposedChange[]): number {
    if (proposedChanges.length === 0) return 1.0; // No changes = fully confident

    const totalConfidence = proposedChanges.reduce((sum, c) => sum + (c.confidence ?? 1.0), 0);
    return totalConfidence / proposedChanges.length;
}

/**
 * Find an appropriate approver contact based on required roles.
 */
async function findApprover(
    requiredRoles: string[],
    accountId: string
): Promise<string | null> {
    // Get all contacts for this account
    const contacts = listRecords(accountId, 'contact' as any);

    // Filter to human contacts (not AI agents)
    const humanContacts = contacts.filter(c => {
        const data = c.data as Record<string, unknown>;
        return !data.is_ai_agent;
    });

    if (humanContacts.length === 0) {
        return null;
    }

    // If "any" is in required roles, return first human contact
    if (requiredRoles.includes('any')) {
        return humanContacts[0].id;
    }

    // Try to find contact with matching role
    for (const contact of humanContacts) {
        const data = contact.data as Record<string, unknown>;
        const role = (data.role || data.job_title || '') as string;

        for (const requiredRole of requiredRoles) {
            if (role.toLowerCase().includes(requiredRole.toLowerCase())) {
                return contact.id;
            }
        }
    }

    // Fallback to first human contact
    return humanContacts[0].id;
}

/**
 * Generate an Approval Activity for human review.
 *
 * @param context - Approval context with execution results and triggered rules
 * @param accountId - Account ID
 * @returns The ID of the created approval activity
 */
export async function generateApprovalActivity(
    context: ApprovalContext,
    accountId: string
): Promise<string | null> {
    // Find appropriate assignee based on required roles
    const requiredRoles = context.triggeredRules.map(r => r.requiresRole);
    const assigneeId = await findApprover(requiredRoles, accountId);

    // Build description of triggered rules
    const triggeredRuleDescriptions = context.triggeredRules
        .map(r => `- ${r.description || r.slug}`)
        .join('\n');

    // Build description of proposed changes
    const changeDescriptions = context.proposedChanges
        .map(c => `- ${c.field}: ${JSON.stringify(c.oldValue)} → ${JSON.stringify(c.newValue)} (confidence: ${Math.round((c.confidence ?? 1) * 100)}%)`)
        .join('\n');

    // Create approval activity data
    const approvalData: AIActivityData = {
        activity_type: 'admin',
        subject: `Review AI Work: ${context.activityName}`,
        description: `Review and approve work completed by AI agent "${context.agentName}".

**Triggered Approval Rules:**
${triggeredRuleDescriptions || 'None'}

**Proposed Changes:**
${changeDescriptions || 'No changes proposed'}

**Confidence Score:** ${Math.round(context.confidence * 100)}%

**Tool Calls:** ${context.toolCalls.length} calls made`,
        status: 'pending',
        assigned_to: assigneeId || undefined,

        // Qualifiers for approval workflow
        qualifiers: [
            {
                name: 'Review AI output',
                description: 'Check the work completed by the AI agent',
                completed: false,
            },
            {
                name: 'Approve or reject',
                description: 'Accept the changes or send back for revision',
                completed: false,
            },
        ],

        // Approval context for the reviewer
        approval_context: {
            original_activity_id: context.activityId,
            triggered_rules: context.triggeredRules.map(r => r.slug),
            proposed_changes: context.proposedChanges,
            tool_calls: context.toolCalls.map(tc => ({
                name: tc.name,
                success: tc.success,
                error: tc.error,
            })),
            confidence: context.confidence,
            agent_id: context.agentId,
            agent_name: context.agentName,
        },
    };

    try {
        const result = await createRecord({
            account_id: accountId,
            type: 'activity',
            slug: `approval-${context.activityId.slice(0, 8)}-${Date.now()}`,
            name: `Review: ${context.activityName}`,
            data: approvalData as any,
        });

        if (result?.id) {
            console.log(`[Approvals] Created approval activity ${result.id} for activity ${context.activityId}`);
            return result.id;
        }

        return null;
    } catch (error) {
        console.warn(`[Approvals] Failed to create approval activity: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}

/**
 * Check if AI execution results require approval and create Approval Activity if needed.
 *
 * @param activityId - The Activity that was executed
 * @param executionResult - The result of AI execution
 * @param accountId - Account ID
 * @returns Approval activity ID if created, null otherwise
 */
export async function checkAndCreateApproval(
    activityId: string,
    executionResult: ExecutionResult,
    accountId: string
): Promise<string | null> {
    // Get activity details
    const activity = getRecord(activityId);
    if (!activity || activity.type !== 'activity') {
        return null;
    }

    const data = activity.data as AIActivityData;

    // Get agent details
    const agentId = data.assigned_to;
    let agentName = 'Unknown AI Agent';
    if (agentId) {
        const agent = getRecord(agentId);
        if (agent) {
            agentName = agent.name;
        }
    }

    // Load approval rules
    const rules = getApprovalRules(accountId);
    if (rules.length === 0) {
        // No rules configured - no approval needed
        return null;
    }

    // Calculate average confidence
    const avgConfidence = calculateAverageConfidence(executionResult.proposedChanges);

    // Evaluate which rules are triggered
    const triggeredRules = evaluateApprovalRules(
        rules,
        executionResult.toolCalls,
        executionResult.proposedChanges,
        avgConfidence
    );

    if (triggeredRules.length === 0) {
        // No rules triggered - no approval needed
        return null;
    }

    // Build approval context
    const context: ApprovalContext = {
        activityId,
        activityName: activity.name,
        agentId: agentId || '',
        agentName,
        toolCalls: executionResult.toolCalls,
        proposedChanges: executionResult.proposedChanges,
        confidence: avgConfidence,
        triggeredRules,
        executionResult,
    };

    // Generate approval activity
    const approvalId = await generateApprovalActivity(context, accountId);

    // Update original activity to pending approval status
    if (approvalId) {
        const currentData = activity.data as Record<string, unknown>;
        await updateRecord(activityId, {
            data: {
                ...currentData,
                ai_execution: {
                    ...(currentData.ai_execution as Record<string, unknown> || {}),
                    status: 'pending_approval',
                    approval_activity_id: approvalId,
                },
            } as any,
        });
    }

    return approvalId;
}

/**
 * Handle approval decision (approve or reject).
 *
 * @param approvalActivityId - The Approval Activity ID
 * @param decision - 'approved' or 'rejected'
 * @param reviewerComment - Optional comment from reviewer
 * @returns True if handled successfully
 */
export async function handleApprovalDecision(
    approvalActivityId: string,
    decision: 'approved' | 'rejected',
    reviewerComment?: string
): Promise<boolean> {
    // Get approval activity
    const approval = getRecord(approvalActivityId);
    if (!approval || approval.type !== 'activity') {
        return false;
    }

    const data = approval.data as AIActivityData;
    const approvalContext = data.approval_context as Record<string, unknown> | undefined;
    if (!approvalContext) {
        console.warn(`[Approvals] Approval activity ${approvalActivityId} missing approval_context`);
        return false;
    }

    const originalActivityId = approvalContext.original_activity_id as string;
    if (!originalActivityId) {
        return false;
    }

    // Get original activity
    const original = getRecord(originalActivityId);
    if (!original || original.type !== 'activity') {
        return false;
    }

    const originalData = original.data as Record<string, unknown>;

    // Update original activity based on decision
    if (decision === 'approved') {
        // Mark original activity as completed
        await updateRecord(originalActivityId, {
            data: {
                ...originalData,
                status: 'completed',
                ai_execution: {
                    ...(originalData.ai_execution as Record<string, unknown> || {}),
                    status: 'completed',
                    approval_decision: 'approved',
                    approval_activity_id: approvalActivityId,
                    approved_at: new Date().toISOString(),
                    reviewer_comment: reviewerComment,
                },
            } as any,
        });
    } else {
        // Mark original activity as failed/rejected
        await updateRecord(originalActivityId, {
            data: {
                ...originalData,
                status: 'pending', // Back to pending for rework
                ai_execution: {
                    ...(originalData.ai_execution as Record<string, unknown> || {}),
                    status: 'failed',
                    approval_decision: 'rejected',
                    approval_activity_id: approvalActivityId,
                    rejected_at: new Date().toISOString(),
                    reviewer_comment: reviewerComment,
                },
            } as any,
        });
    }

    // Mark approval activity as completed
    const approvalCurrentData = approval.data as Record<string, unknown>;
    await updateRecord(approvalActivityId, {
        data: {
            ...approvalCurrentData,
            status: 'completed',
            decision,
            decision_at: new Date().toISOString(),
            reviewer_comment: reviewerComment,
        } as any,
    });

    console.log(`[Approvals] Approval activity ${approvalActivityId}: ${decision}`);
    return true;
}

/**
 * List pending approval activities for an account.
 */
export function listPendingApprovals(accountId: string): Array<{
    id: string;
    name: string;
    originalActivityId: string;
    originalActivityName: string;
    triggeredRules: string[];
    confidence: number;
    createdAt: string;
}> {
    const activities = listRecords(accountId, 'activity' as any);
    const pending: Array<{
        id: string;
        name: string;
        originalActivityId: string;
        originalActivityName: string;
        triggeredRules: string[];
        confidence: number;
        createdAt: string;
    }> = [];

    for (const activity of activities) {
        const data = activity.data as AIActivityData;

        // Check if this is an approval activity (has approval_context)
        const approvalContext = data.approval_context as Record<string, unknown> | undefined;
        if (!approvalContext) continue;

        // Check if still pending
        if (data.status !== 'pending') continue;

        pending.push({
            id: activity.id,
            name: activity.name,
            originalActivityId: approvalContext.original_activity_id as string,
            originalActivityName: activity.name.replace('Review: ', ''),
            triggeredRules: (approvalContext.triggered_rules as string[]) || [],
            confidence: (approvalContext.confidence as number) || 1,
            createdAt: activity.created_at,
        });
    }

    return pending;
}
