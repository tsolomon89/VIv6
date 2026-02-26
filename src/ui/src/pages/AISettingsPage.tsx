import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, Key, Bot, CheckCircle, XCircle, Play, Square, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { showToast } from '../hooks/useToast';
import type { AICredential, AIProvider, AISchedulerStatus, ApiError } from '../lib/api';

export function AISettingsPage() {
  // Credentials state
  const [credentials, setCredentials] = useState<AICredential[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scheduler state
  const [schedulerStatus, setSchedulerStatus] = useState<AISchedulerStatus | null>(null);

  // New credential form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCredential, setNewCredential] = useState({
    provider: 'anthropic' as 'openai' | 'anthropic' | 'google',
    apiKey: '',
    name: '',
    isDefault: false,
  });
  const [creating, setCreating] = useState(false);

  // Testing credential
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { valid: boolean; error?: string }>>({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [creds, providerData, scheduler] = await Promise.all([
        api.listAICredentials(),
        api.listAIProviders(),
        api.getAISchedulerStatus(),
      ]);
      setCredentials(creds);
      setProviders(providerData.providers);
      setSchedulerStatus(scheduler);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to fetch AI settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCredential.apiKey.trim()) {
      showToast.warning('API key is required');
      return;
    }

    setCreating(true);
    try {
      const created = await api.createAICredential({
        provider: newCredential.provider,
        apiKey: newCredential.apiKey,
        name: newCredential.name || undefined,
        isDefault: newCredential.isDefault,
      });
      setCredentials(prev => [...prev, created]);
      setShowNewForm(false);
      setNewCredential({ provider: 'anthropic', apiKey: '', name: '', isDefault: false });
    } catch (err) {
      const apiError = err as ApiError;
      showToast.error(apiError.error || 'Failed to create credential');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCredential = async (id: string, name: string | null) => {
    if (!confirm(`Delete credential "${name || 'Unnamed'}"? This cannot be undone.`)) return;

    try {
      await api.deleteAICredential(id);
      setCredentials(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      showToast.error(apiError.error || 'Failed to delete credential');
    }
  };

  const handleTestCredential = async (id: string) => {
    setTestingId(id);
    try {
      const result = await api.testAICredential(id);
      setTestResults(prev => ({ ...prev, [id]: result }));
    } catch (err) {
      const apiError = err as ApiError;
      setTestResults(prev => ({ ...prev, [id]: { valid: false, error: apiError.error || 'Test failed' } }));
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleScheduler = async () => {
    try {
      if (schedulerStatus?.running) {
        await api.stopAIScheduler();
        setSchedulerStatus({ running: false, accountId: null });
      } else {
        const result = await api.startAIScheduler(30000);
        setSchedulerStatus({ running: result.running, accountId: result.accountId });
      }
    } catch (err) {
      const apiError = err as ApiError;
      showToast.error(apiError.error || 'Failed to toggle scheduler');
    }
  };

  const handleRunScheduler = async () => {
    try {
      const result = await api.runAIScheduler();
      showToast.success(`Processed ${result.processed} activities: ${result.succeeded} succeeded, ${result.failed} failed, ${result.won} won`);
    } catch (err) {
      const apiError = err as ApiError;
      showToast.error(apiError.error || 'Failed to run scheduler');
    }
  };

  const getProviderDisplayName = (provider: string) => {
    const p = providers.find(pr => pr.name === provider);
    return p?.displayName || provider;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-zinc-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot size={28} />
            AI Integration
          </h1>
          <p className="text-zinc-400 mt-1">Manage API credentials and AI agent settings</p>
        </div>
        <button
          onClick={fetchData}
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

      {/* Credentials Section */}
      <div className="bg-zinc-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Key size={20} />
            API Credentials
          </h2>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-sm"
          >
            <Plus size={16} />
            Add Credential
          </button>
        </div>

        {/* New Credential Form */}
        {showNewForm && (
          <form onSubmit={handleCreateCredential} className="mb-6 bg-zinc-800 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Provider</label>
                <select
                  value={newCredential.provider}
                  onChange={e => setNewCredential(prev => ({ ...prev, provider: e.target.value as any }))}
                  className="w-full bg-zinc-700 rounded-lg px-3 py-2 text-sm"
                >
                  {providers.map(p => (
                    <option key={p.name} value={p.name}>{p.displayName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Name (optional)</label>
                <input
                  type="text"
                  value={newCredential.name}
                  onChange={e => setNewCredential(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Production Key"
                  className="w-full bg-zinc-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">API Key</label>
              <input
                type="password"
                value={newCredential.apiKey}
                onChange={e => setNewCredential(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="sk-..."
                className="w-full bg-zinc-700 rounded-lg px-3 py-2 text-sm font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={newCredential.isDefault}
                onChange={e => setNewCredential(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded bg-zinc-700"
              />
              <label htmlFor="isDefault" className="text-sm text-zinc-400">Set as default for this provider</label>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Credential'}
              </button>
            </div>
          </form>
        )}

        {/* Credentials List */}
        {credentials.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No credentials configured. Add an API key to get started.</p>
        ) : (
          <div className="space-y-3">
            {credentials.map(cred => (
              <div key={cred.id} className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${testResults[cred.id]?.valid === true ? 'bg-emerald-500' : testResults[cred.id]?.valid === false ? 'bg-red-500' : 'bg-zinc-600'}`} />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {cred.name || 'Unnamed Credential'}
                      {cred.isDefault && (
                        <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded">Default</span>
                      )}
                    </div>
                    <div className="text-sm text-zinc-400">
                      {getProviderDisplayName(cred.provider)} · {cred.keyHint || '****'}
                    </div>
                    {cred.lastUsedAt && (
                      <div className="text-xs text-zinc-500 mt-1">
                        Last used: {new Date(cred.lastUsedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {testResults[cred.id] && (
                    <span className={`text-xs ${testResults[cred.id].valid ? 'text-emerald-400' : 'text-red-400'}`}>
                      {testResults[cred.id].valid ? 'Valid' : testResults[cred.id].error || 'Invalid'}
                    </span>
                  )}
                  <button
                    onClick={() => handleTestCredential(cred.id)}
                    disabled={testingId === cred.id}
                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                    title="Test credential"
                  >
                    {testingId === cred.id ? (
                      <RefreshCw size={16} className="animate-spin text-zinc-400" />
                    ) : testResults[cred.id]?.valid ? (
                      <CheckCircle size={16} className="text-emerald-400" />
                    ) : testResults[cred.id]?.valid === false ? (
                      <XCircle size={16} className="text-red-400" />
                    ) : (
                      <CheckCircle size={16} className="text-zinc-500" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteCredential(cred.id, cred.name)}
                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-red-400"
                    title="Delete credential"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduler Section */}
      <div className="bg-zinc-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock size={20} />
            Background Scheduler
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${schedulerStatus?.running ? 'text-emerald-400' : 'text-zinc-500'}`}>
              {schedulerStatus?.running ? 'Running' : 'Stopped'}
            </span>
            <div className={`w-2 h-2 rounded-full ${schedulerStatus?.running ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
          </div>
        </div>

        <p className="text-zinc-400 text-sm mb-4">
          The scheduler automatically processes pending AI activities in the background.
          When running, it polls every 30 seconds for new work.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleToggleScheduler}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              schedulerStatus?.running
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {schedulerStatus?.running ? (
              <>
                <Square size={16} />
                Stop Scheduler
              </>
            ) : (
              <>
                <Play size={16} />
                Start Scheduler
              </>
            )}
          </button>
          <button
            onClick={handleRunScheduler}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Run Now
          </button>
        </div>
      </div>

      {/* Available Models */}
      <div className="bg-zinc-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Available Models</h2>
        <div className="space-y-4">
          {providers.map(provider => (
            <div key={provider.name}>
              <h3 className="text-sm font-medium text-zinc-300 mb-2">{provider.displayName}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {provider.models.map(model => (
                  <div key={model.id} className="bg-zinc-800 rounded-lg px-3 py-2 text-sm">
                    <div className="font-medium truncate" title={model.id}>{model.name}</div>
                    <div className="text-xs text-zinc-500">
                      ${model.inputPrice}/1K in · ${model.outputPrice}/1K out
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
