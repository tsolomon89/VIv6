/**
 * Health Engine - Decay Calculation and Energy Injection
 *
 * Integrates with:
 * - physics.ts: calculateDecayedHealth()
 * - personas.json: decay_rate per persona
 * - activity_definitions.json: activation_energy
 */

import { db } from '../../core/db.js';
import { DataRecord, HealthConfigData, HealthThreshold, EntityType } from '../../core/types.js';
import { PHYSICS } from '../activities/physics.js';

export interface HealthCalculationResult {
    previousHealth: number;
    currentHealth: number;
    decayApplied: number;
    decayRate: number;
    hoursPassed: number;
}

export class HealthEngine {
    /**
     * Get health configuration for an entity type
     */
    static getHealthConfig(entityType: EntityType | string): DataRecord | undefined {
        const result = db.prepare(`
            SELECT * FROM records
            WHERE type = 'health_config'
            AND json_extract(data, '$.entity_type') = ?
            LIMIT 1
        `).get(entityType) as DataRecord | undefined;

        if (result && typeof result.data === 'string') {
            result.data = JSON.parse(result.data);
        }
        return result;
    }

    /**
     * Get decay rate for a contact based on their persona
     * Reads from dimension_values metadata.kinetic_routing.decay_rate
     */
    static getPersonaDecayRate(record: DataRecord): number {
        const persona = record.data?.persona;
        if (!persona) return PHYSICS.ENTROPY_RATE_PER_HOUR;

        try {
            const dimensionValue = db.prepare(`
                SELECT metadata FROM dimension_values WHERE slug = ?
            `).get(persona) as { metadata: string | Record<string, any> } | undefined;

            if (!dimensionValue) return PHYSICS.ENTROPY_RATE_PER_HOUR;

            const metadata = typeof dimensionValue.metadata === 'string'
                ? JSON.parse(dimensionValue.metadata)
                : dimensionValue.metadata;

            return metadata?.kinetic_routing?.decay_rate ?? PHYSICS.ENTROPY_RATE_PER_HOUR;
        } catch (err) {
            console.warn(`[HealthEngine] Error fetching persona decay rate: ${err instanceof Error ? err.message : String(err)}`);
            return PHYSICS.ENTROPY_RATE_PER_HOUR;
        }
    }

    /**
     * Calculate current health for a record considering time-based decay
     */
    static calculateCurrentHealth(record: DataRecord): HealthCalculationResult {
        const config = this.getHealthConfig(record.type);
        const baseHealth = config?.data?.base_health ?? 100;
        const currentHealth = record.data?.health ?? baseHealth;
        const lastCalculated = record.data?.health_calculated_at;

        if (!lastCalculated) {
            return {
                previousHealth: currentHealth,
                currentHealth: currentHealth,
                decayApplied: 0,
                decayRate: 0,
                hoursPassed: 0
            };
        }

        const hoursPassed = (Date.now() - new Date(lastCalculated).getTime()) / 3600000;
        const decayRate = this.getPersonaDecayRate(record);
        const decayApplied = decayRate * hoursPassed;
        const newHealth = Math.max(0, currentHealth - decayApplied);

        return {
            previousHealth: currentHealth,
            currentHealth: newHealth,
            decayApplied,
            decayRate,
            hoursPassed
        };
    }

    /**
     * Inject activation energy into a record's health
     */
    static async injectEnergy(
        recordId: string,
        energy: number,
        source: string
    ): Promise<{ previousHealth: number; newHealth: number }> {
        const record = db.prepare('SELECT * FROM records WHERE id = ?').get(recordId) as DataRecord | undefined;
        if (!record) {
            throw new Error(`Record not found: ${recordId}`);
        }

        if (typeof record.data === 'string') {
            record.data = JSON.parse(record.data);
        }

        const config = this.getHealthConfig(record.type);
        const maxHealth = config?.data?.max_health ?? 100;
        const { currentHealth: calculatedHealth } = this.calculateCurrentHealth(record);
        const newHealth = Math.min(maxHealth, calculatedHealth + energy);
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE records SET
                data = json_set(
                    data,
                    '$.health', ?,
                    '$.health_calculated_at', ?,
                    '$.last_energy_source', ?,
                    '$.last_energy_amount', ?
                ),
                updated_at = datetime('now')
            WHERE id = ?
        `).run(newHealth, now, source, energy, recordId);

        // Check if we crossed a threshold
        await this.checkThresholds(record, calculatedHealth, newHealth);

        return {
            previousHealth: calculatedHealth,
            newHealth
        };
    }

    /**
     * Apply decay to a record's health (called by daemon)
     */
    static async applyDecay(recordId: string): Promise<HealthCalculationResult | null> {
        const record = db.prepare('SELECT * FROM records WHERE id = ?').get(recordId) as DataRecord | undefined;
        if (!record) return null;

        if (typeof record.data === 'string') {
            record.data = JSON.parse(record.data);
        }

        const result = this.calculateCurrentHealth(record);

        // Skip if no meaningful decay occurred
        if (result.decayApplied < 0.01) return result;

        const config = this.getHealthConfig(record.type);
        const minHealth = config?.data?.min_health ?? 0;
        const newHealth = Math.max(minHealth, result.currentHealth);
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE records SET
                data = json_set(
                    data,
                    '$.health', ?,
                    '$.health_calculated_at', ?
                ),
                updated_at = datetime('now')
            WHERE id = ?
        `).run(newHealth, now, recordId);

        // Check if we crossed a threshold
        await this.checkThresholds(record, result.previousHealth, newHealth);

        return {
            ...result,
            currentHealth: newHealth
        };
    }

    /**
     * Check if a threshold was crossed and trigger any associated actions
     */
    static async checkThresholds(
        record: DataRecord,
        oldHealth: number,
        newHealth: number
    ): Promise<void> {
        const config = this.getHealthConfig(record.type);
        if (!config?.data?.health_thresholds) return;

        const thresholds = config.data.health_thresholds as HealthThreshold[];

        for (const threshold of thresholds) {
            const wasInThreshold = oldHealth >= threshold.min_value && oldHealth <= threshold.max_value;
            const isInThreshold = newHealth >= threshold.min_value && newHealth <= threshold.max_value;

            // Entering this threshold
            if (!wasInThreshold && isInThreshold && threshold.action_on_enter) {
                console.log(`[HealthEngine] Record ${record.id} entered threshold '${threshold.name}', triggering action: ${threshold.action_on_enter}`);
                // Future: trigger rule or emit event
                // For now, just log
            }
        }
    }

    /**
     * Get the current threshold name for a health value
     */
    static getThresholdName(entityType: EntityType | string, health: number): string | undefined {
        const config = this.getHealthConfig(entityType);
        if (!config?.data?.health_thresholds) return undefined;

        const thresholds = config.data.health_thresholds as HealthThreshold[];
        const threshold = thresholds.find(t => health >= t.min_value && health <= t.max_value);
        return threshold?.name;
    }

    /**
     * Initialize health fields on a new record
     */
    static initializeHealth(data: Record<string, any>, entityType: EntityType | string): Record<string, any> {
        const config = this.getHealthConfig(entityType);
        if (!config) return data;

        return {
            ...data,
            health: config.data.base_health,
            health_calculated_at: new Date().toISOString()
        };
    }
}
