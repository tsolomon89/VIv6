/**
 * Health Decay Daemon - Background Processing
 *
 * Follows AI scheduler pattern from src/modules/ai/execution/scheduler.ts.
 * Polls records and updates health scores based on time-based decay.
 */

import { db } from '../../core/db.js';
import { DataRecord } from '../../core/types.js';
import { HealthEngine } from './engine.js';

let healthInterval: ReturnType<typeof setInterval> | null = null;

export interface DecayProcessResult {
    processed: number;
    healthDecreased: number;
    thresholdsCrossed: number;
    errors: number;
}

/**
 * Process health decay for all eligible records of a given type
 */
export async function processHealthDecayForType(
    entityType: string,
    accountId?: string
): Promise<DecayProcessResult> {
    const result: DecayProcessResult = {
        processed: 0,
        healthDecreased: 0,
        thresholdsCrossed: 0,
        errors: 0
    };

    try {
        // Get health config for this entity type
        const config = HealthEngine.getHealthConfig(entityType);
        if (!config) {
            return result;
        }

        // Query records with health > min_health that haven't been updated recently
        const minHealth = config.data?.min_health ?? 0;
        const query = accountId
            ? `SELECT id, type, data FROM records
               WHERE type = ?
               AND account_id = ?
               AND json_extract(data, '$.health') > ?
               AND json_extract(data, '$.health_calculated_at') IS NOT NULL`
            : `SELECT id, type, data FROM records
               WHERE type = ?
               AND json_extract(data, '$.health') > ?
               AND json_extract(data, '$.health_calculated_at') IS NOT NULL`;

        const params = accountId
            ? [entityType, accountId, minHealth]
            : [entityType, minHealth];

        const records = db.prepare(query).all(...params) as DataRecord[];

        for (const record of records) {
            try {
                if (typeof record.data === 'string') {
                    record.data = JSON.parse(record.data);
                }

                const decayResult = await HealthEngine.applyDecay(record.id);
                if (decayResult) {
                    result.processed++;
                    if (decayResult.decayApplied > 0) {
                        result.healthDecreased++;
                    }
                }
            } catch (err) {
                console.warn(`[HealthDaemon] Error processing record ${record.id}: ${err instanceof Error ? err.message : String(err)}`);
                result.errors++;
            }
        }
    } catch (err) {
        console.error(`[HealthDaemon] Error in processHealthDecayForType: ${err instanceof Error ? err.message : String(err)}`);
        result.errors++;
    }

    return result;
}

/**
 * Process health decay for all entity types with health config
 */
export async function processHealthDecay(accountId?: string): Promise<DecayProcessResult> {
    const totalResult: DecayProcessResult = {
        processed: 0,
        healthDecreased: 0,
        thresholdsCrossed: 0,
        errors: 0
    };

    try {
        // Get all health configs
        const configs = db.prepare(`
            SELECT json_extract(data, '$.entity_type') as entity_type
            FROM records
            WHERE type = 'health_config'
        `).all() as { entity_type: string }[];

        for (const { entity_type } of configs) {
            const result = await processHealthDecayForType(entity_type, accountId);
            totalResult.processed += result.processed;
            totalResult.healthDecreased += result.healthDecreased;
            totalResult.thresholdsCrossed += result.thresholdsCrossed;
            totalResult.errors += result.errors;
        }

        if (totalResult.processed > 0) {
            console.log(`[HealthDaemon] Processed ${totalResult.processed} records, ${totalResult.healthDecreased} decayed`);
        }
    } catch (err) {
        console.error(`[HealthDaemon] Error in processHealthDecay: ${err instanceof Error ? err.message : String(err)}`);
        totalResult.errors++;
    }

    return totalResult;
}

/**
 * Start the health decay daemon
 * @param accountId - Optional account ID to scope the daemon to
 * @param intervalMs - Polling interval in milliseconds (default: 5 minutes)
 * @returns Stop function
 */
export function startHealthDaemon(
    accountId: string = '',
    intervalMs: number = 300000
): () => void {
    if (healthInterval) {
        console.warn('[HealthDaemon] Daemon already running');
        return () => stopHealthDaemon();
    }

    console.log(`[HealthDaemon] Starting background daemon (interval: ${intervalMs}ms)`);

    // Run immediately on start
    processHealthDecay(accountId || undefined).catch(err => {
        console.error(`[HealthDaemon] Initial run error: ${err instanceof Error ? err.message : String(err)}`);
    });

    // Schedule recurring runs
    healthInterval = setInterval(() => {
        processHealthDecay(accountId || undefined).catch(err => {
            console.error(`[HealthDaemon] Scheduled run error: ${err instanceof Error ? err.message : String(err)}`);
        });
    }, intervalMs);

    return () => stopHealthDaemon();
}

/**
 * Stop the health decay daemon
 */
export function stopHealthDaemon(): void {
    if (healthInterval) {
        clearInterval(healthInterval);
        healthInterval = null;
        console.log('[HealthDaemon] Daemon stopped');
    }
}

/**
 * Check if the daemon is currently running
 */
export function isHealthDaemonRunning(): boolean {
    return healthInterval !== null;
}
