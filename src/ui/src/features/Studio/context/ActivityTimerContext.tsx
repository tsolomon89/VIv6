
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type Entity } from '../../../lib/api';

// --- Types ---

interface ActivityTimerState {
    activeActivity: Entity | null;
    status: 'idle' | 'tracking' | 'paused';
    elapsedSeconds: number; // For UI display
}

interface ActivityTimerContextValue extends ActivityTimerState {
    start: (activity: Entity) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    complete: () => Promise<void>;
    isLoading: boolean;
}

const ActivityTimerContext = createContext<ActivityTimerContextValue | undefined>(undefined);

// --- Provider ---

const STORAGE_KEY = 'oblio_active_activity_id';

export function ActivityTimerProvider({ children }: { children: ReactNode }) {
    const [activeActivity, setActiveActivity] = useState<Entity | null>(null);
    const [status, setStatus] = useState<'idle' | 'tracking' | 'paused'>('idle');
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Load from LocalStorage on mount
    useEffect(() => {
        const storedId = localStorage.getItem(STORAGE_KEY);
        if (storedId) {
            setIsLoading(true);
            api.getEntity(storedId)
                .then(ensureCorrectState)
                .catch(() => {
                    localStorage.removeItem(STORAGE_KEY);
                })
                .finally(() => setIsLoading(false));
        }
    }, []);

    // Helper to calculate state from record data
    const ensureCorrectState = (record: Entity) => {
        const data = record.data as any;
        setActiveActivity(record);
        
        if (data.status === 'in_progress') {
            setStatus('tracking');
            // Calculate elapsed
            const start = new Date(data.started_at).getTime();
            const now = Date.now();
            const paused = data.total_paused_seconds || 0;
            // Diff in seconds
            const diff = Math.floor((now - start) / 1000) - paused;
            setElapsedSeconds(Math.max(0, diff));
        } else if (data.status === 'paused') {
            setStatus('paused');
            // Calculate elapsed up to pause
            const start = new Date(data.started_at).getTime();
            const pausedAt = new Date(data.paused_at).getTime();
            const previouslyPaused = data.total_paused_seconds || 0;
            const diff = Math.floor((pausedAt - start) / 1000) - previouslyPaused;
            setElapsedSeconds(Math.max(0, diff));
        } else {
            // Completed or other
            reset();
        }
    };

    // 2. Timer Interval
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (status === 'tracking') {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const reset = () => {
        setActiveActivity(null);
        setStatus('idle');
        setElapsedSeconds(0);
        localStorage.removeItem(STORAGE_KEY);
    };

    // --- Actions ---

    const start = async (activity: Entity) => {
        setIsLoading(true);
        try {
            const updated = await api.startActivity(activity.id);
            localStorage.setItem(STORAGE_KEY, activity.id);
            ensureCorrectState(updated);
        } catch (e) {
            console.error('Failed to start activity', e);
        } finally {
            setIsLoading(false);
        }
    };

    const pause = async () => {
        if (!activeActivity) return;
        setIsLoading(true);
        try {
            const updated = await api.pauseActivity(activeActivity.id);
            ensureCorrectState(updated);
        } catch (e) {
            console.error('Failed to pause activity', e);
        } finally {
            setIsLoading(false);
        }
    };

    const resume = async () => {
        if (!activeActivity) return;
        setIsLoading(true);
        try {
            const updated = await api.resumeActivity(activeActivity.id);
            ensureCorrectState(updated);
        } catch (e) {
            console.error('Failed to resume activity', e);
        } finally {
            setIsLoading(false);
        }
    };

    const complete = async () => {
        if (!activeActivity) return;
        setIsLoading(true);
        try {
            await api.completeActivity(activeActivity.id);
            // Don't update state to "completed", just reset the timer context
            reset();
        } catch (e) {
            console.error('Failed to complete activity', e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ActivityTimerContext.Provider value={{
            activeActivity,
            status,
            elapsedSeconds,
            start,
            pause,
            resume,
            complete,
            isLoading
        }}>
            {children}
        </ActivityTimerContext.Provider>
    );
}

// --- Hook ---

export function useActivityTimer() {
    const context = useContext(ActivityTimerContext);
    if (!context) {
        throw new Error('useActivityTimer must be used within an ActivityTimerProvider');
    }
    return context;
}
