
import { OpportunityStage, DataRecord, OPPORTUNITY_STAGES } from '../../core/types.js';
import { db } from '../../core/db.js';
import { getFieldDisplayName, OpportunityFields } from '../../core/utils/field_lookup.js';

/**
 * Rational Trigonometry for Commercial Engine
 *
 * Calculates the 'Deal Yield' (Velocity of Revenue) based on:
 * - Amount (Mass)
 * - Probability (Certainty)
 * - Time (Resistance)
 *
 * Formula: Yield = (Amount * Probability) / DaysToClose
 */

// ============================================================================
// STAGE PROBABILITY LOADING FROM DB
// ============================================================================

interface StageProbabilityConfig {
    stage: OpportunityStage;
    probability: number;
}

// Cache for stage probabilities (loaded once from DB)
let stageProbabilityCache: Map<OpportunityStage, number> | null = null;

// Default probabilities (used as fallback if DB isn't seeded)
const DEFAULT_STAGE_PROBABILITY: Record<OpportunityStage, number> = {
    'mql': 0.1,
    'sql': 0.4,
    'ftp': 1.0,
    'rtp': 0.8
};

/**
 * Load stage probabilities from pipeline_stages records.
 * Results are cached after first load.
 */
function loadStageProbabilities(): Map<OpportunityStage, number> {
    if (stageProbabilityCache) return stageProbabilityCache;

    stageProbabilityCache = new Map(Object.entries(DEFAULT_STAGE_PROBABILITY) as [OpportunityStage, number][]);

    try {
        const rows = db.prepare(`
            SELECT data
            FROM records
            WHERE type = 'pipeline_stage' AND account_id = '00000000-0000-0000-0000-000000000000'
        `).all() as Array<{ data: string }>;

        for (const row of rows) {
            const data = JSON.parse(row.data);
            const stage = data.stage as OpportunityStage;
            const probability = data.probability;

            if (stage && typeof probability === 'number' && OPPORTUNITY_STAGES.includes(stage)) {
                // Use the first matching stage probability (b2b typically)
                if (!stageProbabilityCache.has(stage) || data.pipeline_type === 'b2b') {
                    stageProbabilityCache.set(stage, probability);
                }
            }
        }

        console.log(`[Commercial] Loaded ${stageProbabilityCache.size} stage probabilities from DB`);
    } catch (err) {
        console.warn(`[Commercial] Failed to load stage probabilities from DB, using defaults:`, err);
    }

    return stageProbabilityCache;
}

/**
 * Get probability for a given stage. Uses DB value if available, defaults otherwise.
 */
export function getStageProbability(stage: OpportunityStage): number {
    const probabilities = loadStageProbabilities();
    return probabilities.get(stage) ?? DEFAULT_STAGE_PROBABILITY[stage] ?? 0.1;
}

/**
 * Clear the stage probability cache (useful for testing or after seed updates)
 */
export function clearStageProbabilityCache(): void {
    stageProbabilityCache = null;
}

// Legacy export for backward compatibility - now loads from DB
export const STAGE_PROBABILITY: Record<OpportunityStage, number> = new Proxy(DEFAULT_STAGE_PROBABILITY, {
    get(target, prop) {
        if (typeof prop === 'string' && OPPORTUNITY_STAGES.includes(prop as OpportunityStage)) {
            return getStageProbability(prop as OpportunityStage);
        }
        return target[prop as OpportunityStage];
    }
});

// --- CANONICAL FORMAT HELPERS ---
// Read field values from canonical format with legacy fallback

function findField(fieldGroups: any[], fieldName: string): any | undefined {
    for (const g of fieldGroups || []) {
        const fields = g.fieldStructs || g.fields || [];
        const field = fields.find((f: any) =>
            (f.nameField === fieldName) || (f.name === fieldName)
        );
        if (field) return field;
    }
    return undefined;
}

function getFieldValue(field: any): any {
    if (!field) return undefined;
    if (field.propertyStructs && field.propertyStructs.length > 0) {
        return field.propertyStructs[0].valueProperty;
    }
    return field.value;
}

/**
 * Get a value from record data, trying canonical format first, then legacy props.
 */
function getDataValue(data: any, fieldName: string, legacyProp: string): any {
    // Try canonical format first
    const fieldGroups = data?.fieldGroups || [];
    const field = findField(fieldGroups, fieldName);
    const canonicalValue = getFieldValue(field);
    if (canonicalValue !== undefined) return canonicalValue;

    // Fall back to legacy prop
    return data?.[legacyProp];
}

export function calculateDealYield(record: DataRecord): number {
    const data = record.data || {};

    // 1. Mass (Amount) - using schema-aware field names
    const amountFieldName = getFieldDisplayName('opportunity', OpportunityFields.AMOUNT);
    const amount = Number(getDataValue(data, amountFieldName, 'amount')) || 0;
    if (amount === 0) return 0;

    // 2. Certainty (Probability)
    // Preference: Explicit probability > Stage default
    const stageFieldName = getFieldDisplayName('opportunity', OpportunityFields.STAGE);
    const stageValue = getDataValue(data, stageFieldName, 'opportunity_stage');
    const stage = (OPPORTUNITY_STAGES.includes(stageValue as any) ? stageValue : 'mql') as OpportunityStage;

    const probFieldName = getFieldDisplayName('opportunity', OpportunityFields.PROBABILITY);
    const probValue = getDataValue(data, probFieldName, 'probability');
    const probability = (typeof probValue === 'number')
        ? probValue
        : (STAGE_PROBABILITY[stage] || 0.1);

    // 3. Resistance (Time)
    // Days until target_close_date from NOW
    // If close date is passed or missing, we assume a standard '30 day' sprint for hygiene, or 1 day if today.
    const targetDateFieldName = getFieldDisplayName('opportunity', OpportunityFields.TARGET_CLOSE_DATE);
    const targetDateStr = getDataValue(data, targetDateFieldName, 'target_close_date');
    const targetDate = targetDateStr ? new Date(targetDateStr) : null;
    let daysToClose = 30; // Default resistance

    if (targetDate) {
        const now = new Date();
        const diffTime = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Ensure strictly positive denominator to avoid Infinity
        daysToClose = diffDays > 0 ? diffDays : 1;
    }

    // Calculation
    // Yield = Expected Value / Time
    const expectedValue = amount * probability;
    const dealYield = expectedValue / daysToClose;

    return Number(dealYield.toFixed(2)); // Round to 2 decimals
}
