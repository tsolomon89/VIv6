/**
 * Health Module - Hook Registration
 *
 * Registers lifecycle hooks for:
 * - Initializing health on contact creation
 * - Injecting energy when activities complete
 */

import { hooks } from '../../core/hooks.js';
import { db } from '../../core/db.js';
import { DataRecord, DataRecordInput } from '../../core/types.js';
import { HealthEngine } from './engine.js';

/**
 * Initialize health on contact creation
 */
hooks.onPreCreate('contact', async (input: DataRecordInput) => {
    const config = HealthEngine.getHealthConfig('contact');
    if (!config) return;

    input.data = input.data || { fieldGroups: [] };
    input.data.health = config.data.base_health;
    input.data.health_calculated_at = new Date().toISOString();
});

/**
 * Initialize health on opportunity creation
 */
hooks.onPreCreate('opportunity', async (input: DataRecordInput) => {
    const config = HealthEngine.getHealthConfig('opportunity');
    if (!config) return;

    input.data = input.data || { fieldGroups: [] };
    input.data.health = config.data.base_health;
    input.data.health_calculated_at = new Date().toISOString();
});

/**
 * Inject energy when activity completes
 */
hooks.onPostUpdate('activity', async (record: DataRecordInput | DataRecord) => {
    // Only trigger on status change to 'completed'
    if ((record.data as any)?.status !== 'completed') return;

    const data = record.data as Record<string, any>;
    const activityDefSlug = data?.activity_def_slug;

    if (!activityDefSlug) return;

    try {
        // Get activation energy from activity definition
        const activityDef = db.prepare(`
            SELECT data FROM records
            WHERE type = 'activity_def' AND slug = ?
            LIMIT 1
        `).get(activityDefSlug) as { data: string | Record<string, any> } | undefined;

        if (!activityDef) return;

        const defData = typeof activityDef.data === 'string'
            ? JSON.parse(activityDef.data)
            : activityDef.data;

        const activationEnergy = defData?.activation_energy;
        if (!activationEnergy || activationEnergy <= 0) return;

        // Find contact to inject energy into
        // Check for direct contact_id or look up via relationship
        let contactId = data?.contact_id;

        if (!contactId && (record as DataRecord).id) {
            // Try to find contact via relationship
            const relationship = db.prepare(`
                SELECT target_id FROM record_relationships
                WHERE source_id = ? AND relationship_type = 'has_contact'
                LIMIT 1
            `).get((record as DataRecord).id) as { target_id: string } | undefined;

            contactId = relationship?.target_id;
        }

        if (!contactId) return;

        // Inject energy into contact
        const result = await HealthEngine.injectEnergy(
            contactId,
            activationEnergy,
            `activity:${(record as DataRecord).id || 'unknown'}`
        );

        console.log(`[Health] Injected ${activationEnergy} energy into contact ${contactId}: ${result.previousHealth} -> ${result.newHealth}`);
    } catch (err) {
        console.warn(`[Health] Failed to inject energy on activity completion: ${err instanceof Error ? err.message : String(err)}`);
    }
});

/**
 * Also inject energy for opportunity-related activities
 */
hooks.onPostUpdate('activity', async (record: DataRecordInput | DataRecord) => {
    // Only trigger on status change to 'completed'
    if ((record.data as any)?.status !== 'completed') return;

    const data = record.data as Record<string, any>;
    const opportunityId = data?.opportunity_id;
    const activityDefSlug = data?.activity_def_slug;

    if (!opportunityId || !activityDefSlug) return;

    try {
        // Get activation energy from activity definition
        const activityDef = db.prepare(`
            SELECT data FROM records
            WHERE type = 'activity_def' AND slug = ?
            LIMIT 1
        `).get(activityDefSlug) as { data: string | Record<string, any> } | undefined;

        if (!activityDef) return;

        const defData = typeof activityDef.data === 'string'
            ? JSON.parse(activityDef.data)
            : activityDef.data;

        const activationEnergy = defData?.activation_energy;
        if (!activationEnergy || activationEnergy <= 0) return;

        // Check if opportunity has health config
        const config = HealthEngine.getHealthConfig('opportunity');
        if (!config) return;

        // Inject energy into opportunity
        const result = await HealthEngine.injectEnergy(
            opportunityId,
            activationEnergy,
            `activity:${(record as DataRecord).id || 'unknown'}`
        );

        console.log(`[Health] Injected ${activationEnergy} energy into opportunity ${opportunityId}: ${result.previousHealth} -> ${result.newHealth}`);
    } catch (err) {
        console.warn(`[Health] Failed to inject energy into opportunity: ${err instanceof Error ? err.message : String(err)}`);
    }
});

// Re-export HealthEngine for convenience
export { HealthEngine } from './engine.js';
export { startHealthDaemon, stopHealthDaemon, isHealthDaemonRunning, processHealthDecay } from './daemon.js';
