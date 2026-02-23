/**
 * Activity Generation Engine
 *
 * Automatically generates Activities when Opportunities advance through pipeline stages.
 * Implements the Chain Reaction pattern:
 *   Opportunity Stage Change -> Generate Required Activities
 *
 * Key responsibilities:
 * 1. Query pipeline_stage config for required activities
 * 2. Generate Activity records with proper qualifiers
 * 3. Link activities to the opportunity via relationships
 * 4. Ensure idempotency (don't duplicate activities)
 */

import crypto from 'crypto';
import {
    DataRecord,
    DataRecordInput,
    EntityType,
    OpportunityStage,
    PipelineType,
    PipelineStageConfig,
    RequiredActivityConfig,
    OblioQualifier,
    AssignmentPoolData
} from '../../core/types.js';
import {
    createRecord,
    getRecord,
    listRecords,
    updateRecord,
    createRelationship,
    getRelationshipsFrom
} from '../../core/records.js';
import { createLogger } from '../../core/logger.js';

const logger = createLogger('activity-generator');

export class ActivityGenerator {

    /**
     * Get pipeline stage configuration for a given pipeline type and stage
     */
    static getPipelineStageConfig(
        accountId: string,
        pipelineType: PipelineType | string,
        stage: OpportunityStage
    ): DataRecord | undefined {
        // First try system account (global configs)
        const systemConfigs = listRecords('00000000-0000-0000-0000-000000000000', 'pipeline_stage');
        let config = systemConfigs.find(c =>
            c.data?.pipeline_type === pipelineType &&
            c.data?.stage === stage
        );

        if (config) return config;

        // Fallback to account-specific configs
        const accountConfigs = listRecords(accountId, 'pipeline_stage');
        return accountConfigs.find(c =>
            c.data?.pipeline_type === pipelineType &&
            c.data?.stage === stage
        );
    }

    /**
     * Get activity definition by slug
     */
    static getActivityDef(accountId: string, slug: string): DataRecord | undefined {
        // First try system account
        const systemDefs = listRecords('00000000-0000-0000-0000-000000000000', 'activity_def');
        let def = systemDefs.find(d => d.slug === slug);

        if (def) return def;

        // Fallback to account-specific
        const accountDefs = listRecords(accountId, 'activity_def');
        return accountDefs.find(d => d.slug === slug);
    }

    /**
     * Check if activities already exist for an opportunity stage (idempotency)
     */
    static hasActivitiesForStage(
        opportunityId: string,
        stage: OpportunityStage
    ): boolean {
        const rels = getRelationshipsFrom(opportunityId, 'has_activity');

        for (const rel of rels) {
            const activity = getRecord(rel.to_record_id);
            if (activity?.data?.for_stage === stage) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the pipeline type from an opportunity record
     */
    static getPipelineType(opportunity: DataRecord): PipelineType {
        // Check for explicit pipeline_type in data
        const pipelineType = opportunity.data?.pipeline_type as PipelineType;
        if (pipelineType) return pipelineType;

        // Check fieldGroups for Pipeline Type field
        const fieldGroups = opportunity.data?.fieldGroups || [];
        for (const group of fieldGroups) {
            const fields = group.fieldStructs || group.fields || [];
            for (const field of fields) {
                if (field.nameField === 'Pipeline Type' || field.name === 'Pipeline Type') {
                    const value = field.propertyStructs?.[0]?.valueProperty || field.value;
                    if (value && typeof value === 'string') {
                        return value.toLowerCase() as PipelineType;
                    }
                }
            }
        }

        // Default to B2B
        return 'b2b';
    }

    /**
     * Generate all required activities for an opportunity entering a new stage
     */
    static async generateActivitiesForStage(
        opportunity: DataRecord,
        newStage: OpportunityStage,
        pipelineType?: PipelineType | string
    ): Promise<DataRecord[]> {
        const resolvedPipelineType = pipelineType || this.getPipelineType(opportunity);

        logger.info({ opportunityId: opportunity.id, newStage, pipelineType: resolvedPipelineType }, 'Generating activities for opportunity stage');

        // Idempotency: Skip if activities already exist for this stage
        if (this.hasActivitiesForStage(opportunity.id, newStage)) {
            logger.debug({ opportunityId: opportunity.id, newStage }, 'Activities already exist for stage, skipping');
            return [];
        }

        // Get stage configuration
        const stageConfig = this.getPipelineStageConfig(
            opportunity.account_id,
            resolvedPipelineType,
            newStage
        );

        if (!stageConfig) {
            logger.warn({ pipelineType: resolvedPipelineType, stage: newStage }, 'No stage config found');
            return [];
        }

        const config = stageConfig.data as PipelineStageConfig;
        const requiredActivities = config.required_activities || [];
        const createdActivities: DataRecord[] = [];

        for (const actConfig of requiredActivities) {
            if (!actConfig.auto_generate) {
                logger.debug({ activityDefSlug: actConfig.activity_def_slug }, 'Skipping activity (auto_generate=false)');
                continue;
            }

            // Get the activity definition
            const actDef = this.getActivityDef(opportunity.account_id, actConfig.activity_def_slug);
            if (!actDef) {
                logger.warn({ activityDefSlug: actConfig.activity_def_slug }, 'Activity definition not found');
                continue;
            }

            // Build qualifiers from activity def + config defaults
            const qualifiers: OblioQualifier[] = [
                ...(actConfig.default_qualifiers || []),
                ...this.convertLegacyQualifiers(actDef.data?.qualifiers || [])
            ];

            // Determine assignment
            const assignedTo = this.resolveAssignment(
                actConfig.assignment_rule || 'auto',
                opportunity
            );

            // Generate unique slug with random suffix to prevent collisions
            const randomSuffix = crypto.randomBytes(4).toString('hex');
            const uniqueSlug = `${opportunity.slug}-${newStage}-${actConfig.activity_def_slug}-${Date.now()}-${randomSuffix}`;

            // Create the activity
            const activityInput: DataRecordInput = {
                type: 'activity',
                slug: uniqueSlug,
                name: `${actDef.name} for ${opportunity.name}`,
                summary: actDef.summary,
                account_id: opportunity.account_id,
                activity_type: actDef.data?.archetype || 'engagement',
                data: {
                    fieldGroups: [],
                    status: 'pending',
                    activity_type: actDef.data?.archetype || 'engagement',
                    activity_def_id: actDef.id,
                    activity_def_slug: actConfig.activity_def_slug,
                    opportunity_id: opportunity.id,
                    for_stage: newStage,
                    pipeline_type: resolvedPipelineType,
                    default_duration: actDef.data?.duration_default || 5,
                    qualifiers: qualifiers,
                    assigned_to: assignedTo,
                    generated_at: new Date().toISOString()
                }
            };

            // System context for creation (bypass permissions)
            const systemContext = { user: { id: 'system', permission_level: 'admin' } };

            try {
                const activity = await createRecord(activityInput, systemContext);

                // Create relationship: Opportunity -> has_activity -> Activity
                await createRelationship({
                    from_record_id: opportunity.id,
                    to_record_id: activity.id,
                    relationship_type: 'has_activity',
                    data: { stage: newStage, pipeline_type: resolvedPipelineType }
                });

                createdActivities.push(activity);
                logger.info({ activityId: activity.id, activityName: activity.name }, 'Created activity');
            } catch (err) {
                logger.error({ err, activityDefSlug: actConfig.activity_def_slug }, 'Failed to create activity');
            }
        }

        logger.info({ count: createdActivities.length, stage: newStage }, 'Generated activities for stage');
        return createdActivities;
    }

    /**
     * Convert legacy string qualifiers to OblioQualifier format
     */
    static convertLegacyQualifiers(qualifiers: (string | OblioQualifier)[]): OblioQualifier[] {
        return qualifiers.map(q => {
            if (typeof q === 'string') {
                // Legacy format: just a qualifier name like "budget_confirmed"
                return {
                    qualifier: q,
                    qualifierOperator: '=' as const,
                    qualifierValue: true,
                    qualifierType: 'Data' as const
                };
            }
            return q;
        });
    }

    /**
     * Get or create an assignment pool for the given scope
     */
    static getOrCreateAssignmentPool(
        accountId: string,
        pipelineType: PipelineType | string
    ): DataRecord | null {
        // Query for existing pool
        const pools = listRecords(accountId, 'assignment_pool' as EntityType);
        let pool = pools.find(p => p.data?.pipeline_type === pipelineType);

        if (pool) {
            return pool;
        }

        // Create default pool with eligible human contacts
        const contacts = listRecords(accountId, 'contact' as EntityType);
        const humanContacts = contacts.filter(c => !c.data?.is_ai_agent);

        if (humanContacts.length === 0) {
            logger.debug('No human contacts found for round-robin pool');
            return null;
        }

        const poolInput: DataRecordInput = {
            type: 'assignment_pool' as EntityType,
            slug: `assignment-pool-${pipelineType}-${Date.now()}`,
            name: `Assignment Pool - ${String(pipelineType).toUpperCase()}`,
            account_id: accountId,
            data: {
                fieldGroups: [],
                scope: 'pipeline_type',
                pipeline_type: pipelineType,
                member_ids: humanContacts.map(c => c.id),
                last_assigned_index: -1,
                last_assigned_at: null,
            } as AssignmentPoolData
        };

        const systemContext = { user: { id: 'system', permission_level: 'admin' } };

        try {
            // Use synchronous pattern - createRecord returns Promise but we need sync
            // For now, create the pool synchronously by checking again after creation attempt
            createRecord(poolInput, systemContext).then(created => {
                logger.info({ poolId: created.id }, 'Created assignment pool');
            }).catch(err => {
                logger.warn({ err }, 'Failed to create assignment pool');
            });

            // Return null for this call - pool will be available next time
            // This handles the async gap gracefully
            return null;
        } catch (err) {
            logger.warn({ err }, 'Error creating assignment pool');
            return null;
        }
    }

    /**
     * Update the pool cursor after an assignment
     */
    static updatePoolCursor(poolId: string, newIndex: number): void {
        const pool = getRecord(poolId);
        if (!pool) return;

        const systemContext = { user: { id: 'system', permission_level: 'admin' } };

        updateRecord(poolId, {
            data: {
                ...pool.data,
                last_assigned_index: newIndex,
                last_assigned_at: new Date().toISOString(),
            }
        }, systemContext).catch(err => {
            logger.warn({ err, poolId, newIndex }, 'Failed to update pool cursor');
        });
    }

    /**
     * Resolve round-robin assignment for a pipeline type
     */
    static resolveRoundRobinAssignment(
        accountId: string,
        pipelineType: PipelineType | string
    ): string | null {
        const pool = this.getOrCreateAssignmentPool(accountId, pipelineType);

        if (!pool) {
            logger.debug({ pipelineType }, 'No assignment pool available');
            return null;
        }

        const poolData = pool.data as AssignmentPoolData;
        const memberIds = poolData.member_ids || [];

        if (memberIds.length === 0) {
            logger.debug({ pipelineType }, 'Assignment pool is empty');
            return null;
        }

        // Calculate next index (wrap around)
        const lastIndex = poolData.last_assigned_index ?? -1;
        let nextIndex = (lastIndex + 1) % memberIds.length;
        let attempts = 0;

        // Find next valid contact (skip deleted ones)
        while (attempts < memberIds.length) {
            const candidateId = memberIds[nextIndex];
            const contact = getRecord(candidateId);

            if (contact && contact.type === 'contact') {
                // Valid contact found - update cursor and return
                this.updatePoolCursor(pool.id, nextIndex);
                logger.debug({ contactId: candidateId, contactName: contact.name }, 'Round-robin assigned');
                return candidateId;
            }

            // Contact invalid/deleted - try next
            logger.debug({ contactId: candidateId }, 'Skipping invalid contact');
            nextIndex = (nextIndex + 1) % memberIds.length;
            attempts++;
        }

        // All contacts in pool are invalid
        logger.warn({ pipelineType }, 'All contacts in pool are invalid');
        return null;
    }

    /**
     * Resolve who the activity should be assigned to
     */
    static resolveAssignment(
        rule: 'auto' | 'owner' | 'round_robin',
        opportunity: DataRecord
    ): string | null {
        switch (rule) {
            case 'owner':
                // Try to get owner from opportunity data
                return opportunity.data?.owner_id as string || null;
            case 'round_robin':
                const pipelineType = this.getPipelineType(opportunity);
                return this.resolveRoundRobinAssignment(
                    opportunity.account_id,
                    pipelineType
                );
            case 'auto':
            default:
                // System/AI will pick up unassigned activities
                return null;
        }
    }

    /**
     * Generate initial MQL activities for a new opportunity
     */
    static async generateInitialActivities(opportunity: DataRecord): Promise<DataRecord[]> {
        const stage: OpportunityStage = 'mql';
        return this.generateActivitiesForStage(opportunity, stage);
    }
}

/**
 * Create a Data Cleanup Activity when taxonomy violations are detected.
 * This is data-driven - queries activity_def for the data_cleanup template.
 */
export async function createDataCleanupActivity(
    recordId: string,
    recordType: EntityType,
    invalidFields: string[],
    accountId: string
): Promise<DataRecord | null> {
    // Query activity definition for data cleanup type (data-driven)
    const activityDef = ActivityGenerator.getActivityDef(accountId, 'data_cleanup');

    const activityInput: DataRecordInput = {
        type: 'activity',
        slug: `data-cleanup-${recordId}-${Date.now()}`,
        name: activityDef?.name || 'Data Cleanup Required',
        summary: `Review and correct invalid field values for ${recordType}`,
        account_id: accountId,
        data: {
            fieldGroups: [],
            activity_type: 'data',
            activity_def_id: activityDef?.id,
            status: 'pending',
            target_record_id: recordId,
            target_record_type: recordType,
            invalid_fields: invalidFields,
            cleanup_reason: 'taxonomy_violation',
            generated_at: new Date().toISOString(),
        },
    };

    const systemContext = { user: { id: 'system', permission_level: 'admin' } };

    try {
        const activity = await createRecord(activityInput, systemContext);

        // Link activity to the target record
        await createRelationship({
            from_record_id: recordId,
            to_record_id: activity.id,
            relationship_type: 'requires_cleanup',
        });

        logger.info({ activityId: activity.id, recordType, recordId }, 'Created cleanup activity');
        return activity;
    } catch (err) {
        logger.error({ err, recordType, recordId }, 'Failed to create cleanup activity');
        return null;
    }
}

logger.debug('ActivityGenerator module loaded');
