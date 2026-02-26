
import { hooks } from '../../core/hooks.js';
import { DataRecordInput, ActivityType, ACTIVITY_TYPES, DataRecord } from '../../core/types.js';
import { getRecord, updateRecord } from '../../core/records.js';

export class ActivityEngine {
    
    static validateTaxonomy(input: DataRecordInput) {
        if (input.type !== 'activity') return;

        // Strict Taxonomy Enforcement
        // If activity_type is provided, it must be valid.
        // In a stricter version, we might REQUIRE it. For now, optional but validated if present.
        const type = (input as any).activity_type as ActivityType | undefined;
        if (type && !ACTIVITY_TYPES.includes(type)) {
            throw new Error(`Invalid Activity Type: ${type}. Must be one of: ${ACTIVITY_TYPES.join(', ')}`);
        }
    }

    static async startActivity(activityId: string, userId: string) {
        const record = getRecord(activityId);
        if (!record) throw new Error('Activity not found');
        if (record.type !== 'activity') throw new Error('Record is not an activity');

        const now = new Date().toISOString();
        const data = record.data || {};
        
        // Idempotency: Don't restart if already in progress
        if (data.status === 'in_progress') return record;

        // Resume Logic: If previously paused, just update status
        if (data.status === 'paused') {
             await updateRecord(activityId, {
                data: {
                    ...data,
                    status: 'in_progress',
                    // Add a "Resume Event" to timeline? For MVP, just unpause.
                    // We need to track "Time Paused" to subtract from total duration.
                    last_resumed_at: now
                }
            });
            return getRecord(activityId);
        }

        await updateRecord(activityId, {
            data: {
                ...data,
                status: 'in_progress',
                started_at: now,
                owner_id: userId,
                // Physics: Initialize Accumulators
                total_paused_seconds: 0
            }
        });
        
        return getRecord(activityId);
    }

    static async pauseActivity(activityId: string) {
        const record = getRecord(activityId);
        if (!record || record.data?.status !== 'in_progress') return record;

        const now = new Date();
        const lastResumed = record.data.last_resumed_at ? new Date(record.data.last_resumed_at) : new Date(record.data.started_at);
        
        // Calculate the chunk of time just spent
        const sessionSeconds = (now.getTime() - lastResumed.getTime()) / 1000;
        
        // We don't add this to "paused", we add this to "active" so we don't lose it?
        // Actually, simpler model:
        // Duration = (Now - Start) - TotalPaused
        // So when we Pause, we mark "paused_at". 
        // When we Resume, we calculate (Now - paused_at) and ADD to TotalPaused.
        
        await updateRecord(activityId, {
            data: {
                ...record.data,
                status: 'paused',
                paused_at: now.toISOString()
            }
        });
        return getRecord(activityId);
    }
    
    static async resumeActivity(activityId: string) {
         const record = getRecord(activityId);
         if (!record || record.data?.status !== 'paused') return record;
         
         const now = new Date();
         const pausedAt = new Date(record.data.paused_at);
         const pausedSeconds = (now.getTime() - pausedAt.getTime()) / 1000;
         
         await updateRecord(activityId, {
             data: {
                 ...record.data,
                 status: 'in_progress',
                 total_paused_seconds: (record.data.total_paused_seconds || 0) + pausedSeconds,
                 last_resumed_at: now.toISOString(),
                 paused_at: null // Clear
             }
         });
         return getRecord(activityId);
    }

    static checkQualifiers(record: DataRecord) {
        const data = record.data || {};
        const qualifiers = data.qualifiers as Record<string, boolean> | undefined;
        
        if (!qualifiers) return true; // No qualifiers to check

        for (const [key, value] of Object.entries(qualifiers)) {
            if (value !== true) {
                throw new Error(`Cannot complete activity. Qualifier not met: ${key}`);
            }
        }
        return true;
    }

    static async completeActivity(activityId: string) {
        const record = getRecord(activityId);
        if (!record) throw new Error('Activity not found');
        
        // Phase 11: Qualifier Logic
        ActivityEngine.checkQualifiers(record);
        
        const data = record.data || {};
        
        const now = new Date();
        const startedAt = data.started_at ? new Date(data.started_at) : now;
        
        // Physics Calculation: Actual = (End - Start) - Paused
        let rawDuration = (now.getTime() - startedAt.getTime()) / 1000;
        const pausedDuration = data.total_paused_seconds || 0;
        
        // Handle case where we finish WHILE paused (unlikely in UI but possible in API)
        if (data.status === 'paused' && data.paused_at) {
             const currentPause = (now.getTime() - new Date(data.paused_at).getTime()) / 1000;
             rawDuration -= currentPause; // Don't count the current pause tail
        }
        
        const actualDuration = Math.max(0, rawDuration - pausedDuration);

        await updateRecord(activityId, {
            data: {
                ...data,
                status: 'completed',
                completed_at: now.toISOString(),
                actual_duration: actualDuration,
                duration_seconds: Math.ceil(actualDuration), // For constraint validation (INV-ACTIVITY-DURATION)
                // Clear state
                paused_at: null
            }
        });

        return getRecord(activityId);
    }
}

// --- Hooks Registration ---

hooks.onPreCreate('activity', async (input: DataRecordInput) => {
    console.log('[ActivityEngine] Validating new Activity...');
    ActivityEngine.validateTaxonomy(input);
});

// Auto-inject default status
hooks.onPreCreate('activity', async (input: DataRecordInput) => {
    if (!input.data) input.data = { fieldGroups: [] };
    if (!input.data.status) {
        input.data.status = 'pending';
    }
});

// --- Chain Reaction Hook ---
// When an activity is completed, trigger the chain reaction to check for stage advancement
hooks.onPostUpdate('activity', async (record: DataRecordInput | DataRecord) => {
    // Only trigger on completion
    if ((record.data as any)?.status !== 'completed') return;

    try {
        // Dynamic import to avoid circular dependencies
        const { ChainReactionHandler } = await import('./chain_reaction.js');
        await ChainReactionHandler.onActivityCompleted(record as DataRecord);
    } catch (err) {
        console.warn('[ActivityEngine] Chain reaction failed:', err instanceof Error ? err.message : String(err));
    }
});

console.log('[ActivityEngine] Chain Reaction hooks registered.');
