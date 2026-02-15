
// --- The Physics of Oblio: Time, Energy, and Capacity ---

import { DurationStruct } from '../../core/types.js';

// --- Constants (Universal Physical Constants of Oblio) ---
export const PHYSICS = {
    // 1 Hour = 60 Minutes = 3600 Seconds
    TIME_UNIT_SECONDS: 1,
    
    // Activation Energy (Joules/Points) required to overcome Entropy
    ACTIVATION_ENERGY: {
        ENGAGEMENT_OUTBOUND: 10,  // Sending an email
        ENGAGEMENT_INBOUND: 25,   // Client reply
        DATA_ENTRY: 5,            // Enrichment
        CREATIVE_WORK: 15         // Asset creation
    },

    // Entropy: Decay rate per hour
    ENTROPY_RATE_PER_HOUR: 0.1, 
    
    // Standard Work Day (Capacity Calculation)
    WORK_DAY_HOURS: 8
};

/**
 * Algo 1: Finite Capacity Calculation
 * Capacity (C) = Total Available Time (T) / Average Activity Duration (d)
 */
export function calculateDailyCapacity(
    availableHours: number = PHYSICS.WORK_DAY_HOURS, 
    averageDurationMinutes: number = 15 // Default fallback
): number {
    const totalMinutes = availableHours * 60;
    return Math.floor(totalMinutes / averageDurationMinutes);
}

/**
 * Algo 2.0: Entropy Decay
 * Current Health (H) = Initial Health (H0) * e^(-yt)
 * simplified to linear decay for MVP: H = H0 - (Rate * Hours)
 */
export function calculateDecayedHealth(
    initialHealth: number,
    hoursPassed: number
): number {
    const decay = PHYSICS.ENTROPY_RATE_PER_HOUR * hoursPassed;
    return Math.max(0, initialHealth - decay);
}

/**
 * Physics Check: Is the actual duration within tolerance of the expected duration?
 * Returns a "Strain" metric (0 = perfect match, >1 = over budget, <1 = under budget)
 */
export function calculateTimeStrain(duration: DurationStruct): number {
    if (!duration.actual_duration_seconds || !duration.default_duration_minutes) return 0;
    
    const expectedSeconds = duration.default_duration_minutes * 60;
    return duration.actual_duration_seconds / expectedSeconds;
}
