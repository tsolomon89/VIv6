import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Activity, Play, Clock, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { showToast } from '../hooks/useToast';
import type { AIActivity, ApiError } from '../lib/api';

export function AIActivitiesPage() {
  const [pendingActivities, setPendingActivities] = useState<AIActivity[]>([]);
  const [runningActivities, setRunningActivities] = useState<AIActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Queue action states
  const [queueingId, setQueueingId] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      const [pending, running] = await Promise.all([
        api.listPendingAIActivities(),
        api.listRunningAIActivities(),
      ]);
      setPendingActivities(pending.activities);
      setRunningActivities(running.activities);
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to fetch activities');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchActivities().finally(() => setLoading(false));

    // Poll every 5 seconds for updates
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, [fetchActivities]);

  const handleQueueActivity = async (id: string) => {
    setQueueingId(id);
    try {
      await api.queueAIActivity(id);
      showToast.success('Activity queued for AI execution');
      fetchActivities();
    } catch (err) {
      const apiError = err as ApiError;
      showToast.error(apiError.error || 'Failed to queue activity');
    } finally {
      setQueueingId(null);
    }
  };

  const handleExecuteActivity = async (id: string) => {
    setExecutingId(id);
    try {
      const result = await api.executeAIActivity(id);
      if (result.success) {
        showToast.success(`Activity executed: ${result.iterations} iterations, ${result.won ? 'WON' : 'evaluated'}`);
      } else {
        showToast.error(result.error || 'Execution failed');
      }
      fetchActivities();
    } catch (err) {
      const apiError = err as ApiError;
      showToast.error(apiError.error || 'Failed to execute activity');
    } finally {
      setExecutingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-zinc-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity size={28} />
            AI Activity Monitor
          </h1>
          <p className="text-zinc-400 mt-1">Monitor and manage AI activity execution</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchActivities().finally(() => setLoading(false)); }}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-amber-400">{pendingActivities.length}</div>
              <div className="text-zinc-400">Pending</div>
            </div>
            <Clock size={32} className="text-amber-500/50" />
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-indigo-400">{runningActivities.length}</div>
              <div className="text-zinc-400">Running</div>
            </div>
            <Loader2 size={32} className={`text-indigo-500/50 ${runningActivities.length > 0 ? 'animate-spin' : ''}`} />
          </div>
        </div>
      </div>

      {/* Running Activities */}
      <div className="bg-zinc-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Loader2 size={20} className="text-indigo-400" />
          Running Activities
        </h2>
        {runningActivities.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No activities currently running</p>
        ) : (
          <div className="space-y-3">
            {runningActivities.map((activity) => (
              <div key={activity.id} className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                  <div>
                    <div className="font-medium">{activity.name}</div>
                    <div className="text-sm text-zinc-500 flex items-center gap-2">
                      {activity.startedAt && (
                        <span>Started: {new Date(activity.startedAt).toLocaleTimeString()}</span>
                      )}
                      {activity.iterations !== undefined && (
                        <>
                          <span>·</span>
                          <span>{activity.iterations} iterations</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Loader2 size={20} className="animate-spin text-indigo-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Activities */}
      <div className="bg-zinc-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Clock size={20} className="text-amber-400" />
          Pending Activities
        </h2>
        {pendingActivities.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No pending activities</p>
        ) : (
          <div className="space-y-3">
            {pendingActivities.map((activity) => (
              <div key={activity.id} className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div>
                    <div className="font-medium">{activity.name}</div>
                    <div className="text-sm text-zinc-500">
                      {activity.queuedAt && (
                        <span>Queued: {new Date(activity.queuedAt).toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQueueActivity(activity.id)}
                    disabled={queueingId === activity.id || executingId === activity.id}
                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white disabled:opacity-50"
                    title="Re-queue"
                  >
                    {queueingId === activity.id ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleExecuteActivity(activity.id)}
                    disabled={queueingId === activity.id || executingId === activity.id}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    {executingId === activity.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Play size={16} />
                    )}
                    Execute Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
        <h3 className="font-medium mb-2">About AI Activities</h3>
        <p className="text-sm text-zinc-400">
          AI activities are work items assigned to AI agents. When an activity is queued,
          the scheduler picks it up and executes it using the assigned agent's configuration.
          Activities go through qualifier evaluation after execution to determine if they "won"
          (passed all conditions).
        </p>
      </div>
    </div>
  );
}
