
import { OpportunityStage, DataRecord, OPPORTUNITY_STAGES } from '../../core/types.js';

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

export const STAGE_PROBABILITY: Record<OpportunityStage, number> = {
    'mql': 0.1,  // 10%
    'sql': 0.4,  // 40%
    'ftp': 1.0,  // 100% (Closed Won)
    'rtp': 0.8   // 80% (Renewal is high probability)
};

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

    // 1. Mass (Amount)
    const amount = Number(getDataValue(data, 'Amount', 'amount')) || 0;
    if (amount === 0) return 0;

    // 2. Certainty (Probability)
    // Preference: Explicit probability > Stage default
    const stageValue = getDataValue(data, 'Opportunity Stage', 'opportunity_stage');
    const stage = (OPPORTUNITY_STAGES.includes(stageValue as any) ? stageValue : 'mql') as OpportunityStage;

    const probValue = getDataValue(data, 'Probability', 'probability');
    const probability = (typeof probValue === 'number')
        ? probValue
        : (STAGE_PROBABILITY[stage] || 0.1);

    // 3. Resistance (Time)
    // Days until target_close_date from NOW
    // If close date is passed or missing, we assume a standard '30 day' sprint for hygiene, or 1 day if today.
    const targetDateStr = getDataValue(data, 'Target Close Date', 'target_close_date');
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
