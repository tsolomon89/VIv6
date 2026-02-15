
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ActivityEngine } from '../src/modules/activities/activities';
import { calculateDailyCapacity, calculateTimeStrain, PHYSICS } from '../src/modules/activities/physics';
import { createRecord, getRecord } from '../src/core/records';
import { db } from '../src/core/db';

describe('Activity Physics Engine', () => {
    let activityId: string;

    beforeEach(async () => {
        // Reset DB state (Mock if needed, but integration is better)
        db.prepare('DELETE FROM records WHERE type = ?').run('activity');
        
        // Ensure we are using the synchronous create for tests
        const input = {
            type: 'activity' as const,
            name: 'Test Activity',
            slug: 'test-activity',
            account_id: 'acc_test',
            data: {
                fieldGroups: []
            }
        };
        
        // We use the exported createRecord from core/records.ts
        // which should write to the same DB instance as ActivityEngine reads from.
        const record = await createRecord(input);
        activityId = record.id;
        
        // Mock Date
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should track actual duration accurately with pauses', async () => {
        // 1. Start (T=0)
        await ActivityEngine.startActivity(activityId, 'user_1');
        
        // 2. Work for 5 seconds (T=5)
        vi.advanceTimersByTime(5000);
        
        // 3. Pause
        await ActivityEngine.pauseActivity(activityId);
        
        // 4. Wait for 10 seconds (Paused) (T=15)
        vi.advanceTimersByTime(10000);
        
        // 5. Resume
        await ActivityEngine.resumeActivity(activityId);
        
        // 6. Work for 5 seconds (T=20)
        vi.advanceTimersByTime(5000);
        
        // 7. Complete
        const result = await ActivityEngine.completeActivity(activityId);
        
        // Total Real Time: 20s
        // Total Paused: 10s
        // Actual Work: 10s
        
        expect(result!.data.status).toBe('completed');
        expect(result!.data.actual_duration).toBe(10);
        expect(result!.data.total_paused_seconds).toBe(10);
    });

    it('should calculate capacity correctly', () => {
        // 8 hours / 1 hour avg = 8 slots
        const capacity = calculateDailyCapacity(8, 60);
        expect(capacity).toBe(8);
        
        // 8 hours / 15 min avg = 32 slots
        const capacityHighVolume = calculateDailyCapacity(8, 15);
        expect(capacityHighVolume).toBe(32);
    });

    it('should calculate time strain', () => {
        const strain = calculateTimeStrain({
            default_duration_minutes: 10, // 600s
            actual_duration_seconds: 900 // Over budget
        });
        
        expect(strain).toBe(1.5); // 150% of budget
        
        const strainUnder = calculateTimeStrain({
            default_duration_minutes: 10, // 600s
            actual_duration_seconds: 300 // Under budget
        });
        
        expect(strainUnder).toBe(0.5); // 50% of budget
    });
});
