/**
 * Workflow Step Handlers - Data-Driven Execution
 *
 * Each handler reads configuration from the step record's data
 * and the step_type definition record, then performs the action.
 */

import { db } from '../../core/db.js';
import { DataRecord, WorkflowStepType } from '../../core/types.js';
import { v4 as uuidv4 } from 'uuid';

export interface StepResult {
    success: boolean;
    nextStepSlug?: string;
    activitiesGenerated?: string[];
    fieldsUpdated?: Record<string, any>;
    error?: string;
    exitReason?: 'win' | 'loss' | 'manual';
}

export interface StepHandler {
    execute(
        enrollment: DataRecord,
        step: DataRecord,
        typeConfig: DataRecord
    ): Promise<StepResult>;
}

/**
 * Wait Handler - Delay before proceeding to next step
 * The delay is already handled by the scheduler (next_step_due_at)
 * This handler just advances to the next step
 */
const waitHandler: StepHandler = {
    async execute(enrollment, step, typeConfig): Promise<StepResult> {
        const nextStepSlug = step.data?.next_step_slug;
        return {
            success: true,
            nextStepSlug
        };
    }
};

/**
 * Send Handler - Generate an activity for the contact
 */
const sendHandler: StepHandler = {
    async execute(enrollment, step, typeConfig): Promise<StepResult> {
        const activityDefSlug = step.data?.activity_def_slug;
        const contactId = enrollment.data?.contact_id;
        const accountId = (enrollment as any).account_id;

        if (!activityDefSlug) {
            return { success: false, error: 'No activity_def_slug specified' };
        }

        if (!contactId) {
            return { success: false, error: 'No contact_id on enrollment' };
        }

        try {
            // Get activity definition
            const activityDef = db.prepare(`
                SELECT * FROM records
                WHERE type = 'activity_def' AND slug = ?
                LIMIT 1
            `).get(activityDefSlug) as DataRecord | undefined;

            if (!activityDef) {
                return { success: false, error: `Activity definition not found: ${activityDefSlug}` };
            }

            if (typeof activityDef.data === 'string') {
                activityDef.data = JSON.parse(activityDef.data);
            }

            // Create the activity
            const activityId = uuidv4();
            const now = new Date().toISOString();
            const activitySlug = `${activityDefSlug}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

            const activityData = {
                fieldGroups: [],
                activity_def_slug: activityDefSlug,
                archetype: activityDef.data?.archetype,
                status: 'pending',
                contact_id: contactId,
                workflow_enrollment_id: enrollment.id,
                workflow_step_id: step.id,
                activation_energy: step.data?.activation_energy ?? activityDef.data?.activation_energy ?? typeConfig.data?.activation_energy_default ?? 0,
                created_by: 'workflow'
            };

            db.prepare(`
                INSERT INTO records (id, account_id, type, slug, name, data, created_at, updated_at)
                VALUES (?, ?, 'activity', ?, ?, ?, datetime('now'), datetime('now'))
            `).run(
                activityId,
                accountId,
                activitySlug,
                `${activityDef.name} - Workflow Generated`,
                JSON.stringify(activityData)
            );

            // Create relationship: contact has_activity
            db.prepare(`
                INSERT OR IGNORE INTO record_relationships (source_id, target_id, relationship_type)
                VALUES (?, ?, 'has_activity')
            `).run(contactId, activityId);

            console.log(`[WorkflowHandler] Created activity ${activityId} for contact ${contactId}`);

            return {
                success: true,
                nextStepSlug: step.data?.next_step_slug,
                activitiesGenerated: [activityId]
            };
        } catch (err) {
            return {
                success: false,
                error: `Failed to create activity: ${err instanceof Error ? err.message : String(err)}`
            };
        }
    }
};

/**
 * Update Handler - Update fields on the contact record
 */
const updateHandler: StepHandler = {
    async execute(enrollment, step, typeConfig): Promise<StepResult> {
        const fieldUpdates = step.data?.field_updates;
        const contactId = enrollment.data?.contact_id;

        if (!fieldUpdates || Object.keys(fieldUpdates).length === 0) {
            return { success: false, error: 'No field_updates specified' };
        }

        if (!contactId) {
            return { success: false, error: 'No contact_id on enrollment' };
        }

        try {
            // Build JSON set operations for each field
            const setOperations = Object.entries(fieldUpdates)
                .map(([key, value]) => `'$.${key}', ${typeof value === 'string' ? `'${value}'` : value}`)
                .join(', ');

            db.prepare(`
                UPDATE records SET
                    data = json_set(data, ${setOperations}),
                    updated_at = datetime('now')
                WHERE id = ?
            `).run(contactId);

            console.log(`[WorkflowHandler] Updated fields on contact ${contactId}:`, fieldUpdates);

            return {
                success: true,
                nextStepSlug: step.data?.next_step_slug,
                fieldsUpdated: fieldUpdates
            };
        } catch (err) {
            return {
                success: false,
                error: `Failed to update fields: ${err instanceof Error ? err.message : String(err)}`
            };
        }
    }
};

/**
 * Branch Handler - Conditional routing based on contact data
 */
const branchHandler: StepHandler = {
    async execute(enrollment, step, typeConfig): Promise<StepResult> {
        const conditions = step.data?.conditions;
        const branchStepSlug = step.data?.branch_step_slug;
        const nextStepSlug = step.data?.next_step_slug;
        const contactId = enrollment.data?.contact_id;

        if (!conditions || !Array.isArray(conditions)) {
            // No conditions, use default next step
            return { success: true, nextStepSlug };
        }

        if (!contactId) {
            return { success: false, error: 'No contact_id on enrollment' };
        }

        try {
            // Get contact record
            const contact = db.prepare('SELECT * FROM records WHERE id = ?').get(contactId) as DataRecord | undefined;
            if (!contact) {
                return { success: false, error: `Contact not found: ${contactId}` };
            }

            if (typeof contact.data === 'string') {
                contact.data = JSON.parse(contact.data);
            }

            // Evaluate conditions (AND logic)
            const allConditionsMet = evaluateConditions(conditions, contact.data);

            if (allConditionsMet && branchStepSlug) {
                console.log(`[WorkflowHandler] Conditions met, branching to ${branchStepSlug}`);
                return { success: true, nextStepSlug: branchStepSlug };
            } else {
                console.log(`[WorkflowHandler] Conditions not met, continuing to ${nextStepSlug}`);
                return { success: true, nextStepSlug };
            }
        } catch (err) {
            return {
                success: false,
                error: `Failed to evaluate branch: ${err instanceof Error ? err.message : String(err)}`
            };
        }
    }
};

/**
 * Complete Handler - Mark workflow as complete
 */
const completeHandler: StepHandler = {
    async execute(enrollment, step, typeConfig): Promise<StepResult> {
        const exitReason = (step.data?.exit_reason as 'win' | 'loss') || 'win';

        return {
            success: true,
            exitReason
        };
    }
};

/**
 * Query Handler - Query records and store results in enrollment context
 * Used by chain reaction to check if all stage activities are complete
 */
const queryHandler: StepHandler = {
    async execute(enrollment, step, typeConfig): Promise<StepResult> {
        const queryType = step.data?.query_type;
        const opportunityId = enrollment.data?.opportunity_id;

        if (queryType === 'all_activities_complete') {
            if (!opportunityId) {
                return { success: false, error: 'No opportunity_id in enrollment context' };
            }

            try {
                // Get all activities linked to this opportunity for the current stage
                const rels = db.prepare(`
                    SELECT to_record_id FROM relationships
                    WHERE from_record_id = ? AND relationship_type = 'has_activity'
                `).all(opportunityId) as { to_record_id: string }[];

                const opportunity = db.prepare('SELECT data FROM records WHERE id = ?').get(opportunityId) as { data: string } | undefined;
                if (!opportunity) {
                    return { success: false, error: `Opportunity not found: ${opportunityId}` };
                }

                const oppData = typeof opportunity.data === 'string' ? JSON.parse(opportunity.data) : opportunity.data;
                const currentStage = oppData.opportunity_stage;

                let allComplete = true;
                for (const rel of rels) {
                    const activity = db.prepare('SELECT data FROM records WHERE id = ?').get(rel.to_record_id) as { data: string } | undefined;
                    if (!activity) continue;

                    const actData = typeof activity.data === 'string' ? JSON.parse(activity.data) : activity.data;
                    if (actData.for_stage === currentStage && actData.status !== 'completed') {
                        allComplete = false;
                        break;
                    }
                }

                // Store result in enrollment context for branch step to evaluate
                db.prepare(`
                    UPDATE records SET
                        data = json_set(data, '$.query_result', ?),
                        updated_at = datetime('now')
                    WHERE id = ?
                `).run(allComplete ? 1 : 0, enrollment.id);

                return {
                    success: true,
                    nextStepSlug: step.data?.next_step_slug
                };
            } catch (err) {
                return {
                    success: false,
                    error: `Query failed: ${err instanceof Error ? err.message : String(err)}`
                };
            }
        }

        return { success: false, error: `Unknown query_type: ${queryType}` };
    }
};

/**
 * Advance Stage Handler - Advance opportunity to next pipeline stage
 */
const advanceStageHandler: StepHandler = {
    async execute(enrollment, step, typeConfig): Promise<StepResult> {
        const opportunityId = enrollment.data?.opportunity_id;

        if (!opportunityId) {
            return { success: false, error: 'No opportunity_id in enrollment context' };
        }

        try {
            // Dynamic import to avoid circular dependencies
            const { CommercialEngine } = await import('../commercial/commercial.js');
            const { getRecord } = await import('../../core/records.js');
            const { ActivityGenerator } = await import('../activities/generation.js');

            const opportunity = getRecord(opportunityId);
            if (!opportunity) {
                return { success: false, error: `Opportunity not found: ${opportunityId}` };
            }

            const pipelineType = opportunity.data?.pipeline_type || 'b2b';
            const currentStage = opportunity.data?.opportunity_stage;

            const stageConfig = ActivityGenerator.getPipelineStageConfig(
                opportunity.account_id,
                pipelineType,
                currentStage
            );

            const nextStage = stageConfig?.data?.next_stage;
            if (!nextStage) {
                console.log(`[WorkflowHandler] No next stage after ${currentStage}. Pipeline complete.`);
                return {
                    success: true,
                    nextStepSlug: step.data?.next_step_slug
                };
            }

            console.log(`[WorkflowHandler] Advancing opportunity ${opportunityId} from ${currentStage} to ${nextStage}`);
            await CommercialEngine.transitionStage(opportunityId, nextStage);

            return {
                success: true,
                nextStepSlug: step.data?.next_step_slug
            };
        } catch (err) {
            return {
                success: false,
                error: `Stage advance failed: ${err instanceof Error ? err.message : String(err)}`
            };
        }
    }
};

/**
 * Generate Activities Handler - Generate required activities for current stage
 */
const generateActivitiesHandler: StepHandler = {
    async execute(enrollment, step, typeConfig): Promise<StepResult> {
        const opportunityId = enrollment.data?.opportunity_id;

        if (!opportunityId) {
            return { success: false, error: 'No opportunity_id in enrollment context' };
        }

        try {
            const { getRecord } = await import('../../core/records.js');
            const { ActivityGenerator } = await import('../activities/generation.js');

            const opportunity = getRecord(opportunityId);
            if (!opportunity) {
                return { success: false, error: `Opportunity not found: ${opportunityId}` };
            }

            const stage = opportunity.data?.opportunity_stage;
            const pipelineType = opportunity.data?.pipeline_type || 'b2b';

            console.log(`[WorkflowHandler] Generating activities for ${opportunityId} stage ${stage}`);
            await ActivityGenerator.generateActivitiesForStage(opportunity, stage, pipelineType);

            return {
                success: true,
                nextStepSlug: step.data?.next_step_slug
            };
        } catch (err) {
            return {
                success: false,
                error: `Activity generation failed: ${err instanceof Error ? err.message : String(err)}`
            };
        }
    }
};

/**
 * Handler registry
 */
const handlers: Record<WorkflowStepType, StepHandler> = {
    wait: waitHandler,
    send: sendHandler,
    update: updateHandler,
    branch: branchHandler,
    complete: completeHandler,
    query: queryHandler,
    advance_stage: advanceStageHandler,
    generate_activities: generateActivitiesHandler
};

/**
 * Execute the appropriate handler for a step
 */
export async function executeStepHandler(
    enrollment: DataRecord,
    step: DataRecord,
    typeConfig: DataRecord
): Promise<StepResult> {
    const stepType = step.data?.step_type as WorkflowStepType;
    const handler = handlers[stepType];

    if (!handler) {
        return {
            success: false,
            error: `No handler for step type: ${stepType}`
        };
    }

    console.log(`[WorkflowHandler] Executing ${stepType} step: ${step.slug}`);
    return handler.execute(enrollment, step, typeConfig);
}

/**
 * Evaluate conditions against record data
 * Uses same structure as RuleCondition from rules engine
 */
function evaluateConditions(conditions: Record<string, any>[], data: Record<string, any>): boolean {
    for (const condition of conditions) {
        const field = condition.field;
        const op = condition.op || condition.operator || 'eq';
        const value = condition.value;

        // Get field value using dot notation
        const fieldValue = getNestedValue(data, field);

        let result = false;
        switch (op) {
            case 'eq':
            case '=':
            case '==':
                result = fieldValue === value;
                break;
            case 'neq':
            case '!=':
            case '<>':
                result = fieldValue !== value;
                break;
            case 'gt':
            case '>':
                result = fieldValue > value;
                break;
            case 'gte':
            case '>=':
                result = fieldValue >= value;
                break;
            case 'lt':
            case '<':
                result = fieldValue < value;
                break;
            case 'lte':
            case '<=':
                result = fieldValue <= value;
                break;
            case 'exists':
                result = fieldValue !== undefined && fieldValue !== null;
                break;
            case 'not_exists':
                result = fieldValue === undefined || fieldValue === null;
                break;
            case 'contains':
                result = typeof fieldValue === 'string' && fieldValue.includes(value);
                break;
            case 'in':
                result = Array.isArray(value) && value.includes(fieldValue);
                break;
            default:
                console.warn(`[WorkflowHandler] Unknown condition operator: ${op}`);
                result = false;
        }

        if (!result) {
            return false; // AND logic - all conditions must be true
        }
    }

    return true;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current === undefined || current === null) {
            return undefined;
        }
        current = current[key];
    }

    return current;
}
