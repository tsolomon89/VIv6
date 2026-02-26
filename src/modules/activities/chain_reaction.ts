/**
 * Chain Reaction Handler
 *
 * Implements the reverse direction of the Activity Generation system:
 *   Activity Won -> Qualifier TRUE -> Opportunity Stage Advances -> New Activities Generated
 *
 * When an Activity completes (status = 'completed' + all qualifiers pass),
 * this handler checks if ALL activities for the current stage are complete,
 * and if so, advances the opportunity to the next stage.
 */

import {
    DataRecord,
    OpportunityStage,
    PipelineType,
    PipelineStageConfig,
    OblioQualifier
} from '../../core/types.js';
import {
    getRecord,
    getRelationshipsFrom,
    getRelationshipsTo
} from '../../core/records.js';
import { ActivityGenerator } from './generation.js';
import { getFieldDisplayName, OpportunityFields } from '../../core/utils/field_lookup.js';

export class ChainReactionHandler {

    /**
     * Called when an activity is marked complete.
     * Checks if stage advancement should occur.
     */
    static async onActivityCompleted(activity: DataRecord): Promise<void> {
        console.log(`[ChainReaction] Activity completed: ${activity.id}`);

        const opportunityId = activity.data?.opportunity_id as string;
        if (!opportunityId) {
            console.log('[ChainReaction] Activity has no linked opportunity');
            return;
        }

        const opportunity = getRecord(opportunityId);
        if (!opportunity || opportunity.type !== 'opportunity') {
            console.log('[ChainReaction] Linked opportunity not found or invalid type');
            return;
        }

        const currentStage = this.getOpportunityStage(opportunity);
        const forStage = activity.data?.for_stage as OpportunityStage;

        // Only process if activity was for current stage
        if (forStage !== currentStage) {
            console.log(`[ChainReaction] Activity stage ${forStage} != opportunity stage ${currentStage}. Skipping.`);
            return;
        }

        // Check if ALL activities for this stage are complete with passing qualifiers
        const allComplete = await this.areAllStageActivitiesComplete(
            opportunityId,
            currentStage
        );

        if (allComplete) {
            console.log(`[ChainReaction] All activities complete for ${currentStage}. Advancing stage.`);
            await this.advanceOpportunityStage(opportunity, currentStage);
        } else {
            console.log(`[ChainReaction] Not all activities complete for ${currentStage}. Waiting.`);
        }
    }

    /**
     * Get the current stage of an opportunity
     */
    static getOpportunityStage(opportunity: DataRecord): OpportunityStage {
        // Check data.opportunity_stage
        if (opportunity.data?.opportunity_stage) {
            return opportunity.data.opportunity_stage as OpportunityStage;
        }

        // Check fieldGroups for Opportunity Stage field (using schema-aware field name)
        const stageFieldName = getFieldDisplayName('opportunity', OpportunityFields.STAGE);
        const fieldGroups = opportunity.data?.fieldGroups || [];
        for (const group of fieldGroups) {
            const fields = group.fieldStructs || group.fields || [];
            for (const field of fields) {
                if (field.nameField === stageFieldName || field.name === stageFieldName) {
                    const value = field.propertyStructs?.[0]?.valueProperty || field.value;
                    if (value && typeof value === 'string') {
                        return value.toLowerCase() as OpportunityStage;
                    }
                }
            }
        }

        // Default to MQL
        return 'mql';
    }

    /**
     * Check if all activities for a stage are complete with passing qualifiers
     */
    static async areAllStageActivitiesComplete(
        opportunityId: string,
        stage: OpportunityStage
    ): Promise<boolean> {
        // Get all activities linked to this opportunity for this stage
        const rels = getRelationshipsFrom(opportunityId, 'has_activity');

        let stageActivityCount = 0;
        let completedCount = 0;

        for (const rel of rels) {
            const activity = getRecord(rel.to_record_id);
            if (!activity) continue;
            if (activity.data?.for_stage !== stage) continue;

            stageActivityCount++;

            // Check status
            if (activity.data?.status !== 'completed') {
                console.log(`[ChainReaction] Activity ${activity.id} not complete (status: ${activity.data?.status})`);
                return false;
            }

            // Check qualifiers passed
            const qualifiersPassed = this.checkActivityQualifiers(activity);
            if (!qualifiersPassed) {
                console.log(`[ChainReaction] Activity ${activity.id} qualifiers not all passed`);
                return false;
            }

            completedCount++;
        }

        console.log(`[ChainReaction] Stage ${stage}: ${completedCount}/${stageActivityCount} activities complete`);

        // Must have at least one activity to advance
        return stageActivityCount > 0 && completedCount === stageActivityCount;
    }

    /**
     * Check if all qualifiers on an activity have passed
     */
    static checkActivityQualifiers(activity: DataRecord): boolean {
        const qualifiers = activity.data?.qualifiers as (OblioQualifier[] | Record<string, boolean>);

        if (!qualifiers) return true; // No qualifiers = pass

        // Handle array format (OblioQualifier[])
        if (Array.isArray(qualifiers)) {
            for (const q of qualifiers) {
                // If qualifier has been evaluated and failed
                if (q._evaluated === true && q._result === false) {
                    return false;
                }
                // If qualifier is required but not evaluated yet
                if (q.qualifierRequired && !q._evaluated) {
                    return false;
                }
            }
            return true;
        }

        // Handle object format (legacy { key: boolean })
        for (const [key, value] of Object.entries(qualifiers)) {
            if (value !== true) {
                return false;
            }
        }

        return true;
    }

    /**
     * Advance opportunity to next stage and generate new activities
     */
    static async advanceOpportunityStage(
        opportunity: DataRecord,
        currentStage: OpportunityStage
    ): Promise<void> {
        const pipelineType = ActivityGenerator.getPipelineType(opportunity);

        // Get stage config to find next stage
        const stageConfig = ActivityGenerator.getPipelineStageConfig(
            opportunity.account_id,
            pipelineType,
            currentStage
        );

        if (!stageConfig) {
            console.log(`[ChainReaction] No stage config for ${pipelineType}/${currentStage}`);
            return;
        }

        const config = stageConfig.data as PipelineStageConfig;
        const nextStage = config.next_stage;

        if (!nextStage) {
            console.log(`[ChainReaction] No next stage after ${currentStage}. Pipeline complete.`);
            return;
        }

        console.log(`[ChainReaction] Advancing opportunity ${opportunity.id} from ${currentStage} to ${nextStage}`);

        try {
            // Import CommercialEngine dynamically to avoid circular dependencies
            const { CommercialEngine } = await import('../commercial/commercial.js');

            // Use CommercialEngine to transition (handles yield calculations, side effects, etc.)
            const updatedOpp = await CommercialEngine.transitionStage(opportunity.id, nextStage);

            if (updatedOpp) {
                // Generate activities for new stage
                await ActivityGenerator.generateActivitiesForStage(updatedOpp, nextStage, pipelineType);
            }
        } catch (err) {
            console.error(`[ChainReaction] Failed to advance stage:`, err instanceof Error ? err.message : String(err));
        }
    }
}

console.log('[ChainReactionHandler] Loaded.');
