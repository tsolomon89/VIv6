import { useState, useEffect } from 'react';
import { RefreshCw, BarChart3, TrendingUp, DollarSign, Cpu, Users } from 'lucide-react';
import { api } from '../lib/api';
import type { AIUsageSummary, AIUsageHistory, AICredentialUsage, AIAgentUsage, ApiError } from '../lib/api';

export function AIUsagePage() {
  const [summary, setSummary] = useState<AIUsageSummary | null>(null);
  const [history, setHistory] = useState<AIUsageHistory[]>([]);
  const [credentials, setCredentials] = useState<AICredentialUsage[]>([]);
  const [agents, setAgents] = useState<AIAgentUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range
  const [days, setDays] = useState(30);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, historyData, credData, agentData] = await Promise.all([
        api.getAIUsageSummary(),
        api.getAIUsageHistory(days),
        api.getAICredentialUsage(),
        api.getAIAgentUsage(days),
      ]);
      setSummary(summaryData);
      setHistory(historyData.history);
      setCredentials(credData.credentials);
      setAgents(agentData.agents);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to fetch usage data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(2)}`;
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
            <BarChart3 size={28} />
            AI Usage Dashboard
          </h1>
          <p className="text-zinc-400 mt-1">Track token usage and costs across providers</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="bg-zinc-800 rounded-lg px-3 py-2 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          {/* Today */}
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="text-sm text-zinc-400 mb-2">Today</div>
            <div className="text-3xl font-bold text-emerald-400">{formatTokens(summary.today.tokens)}</div>
            <div className="text-sm text-zinc-500 mt-1">
              {formatCost(summary.today.cost)} · {summary.today.operations} ops
            </div>
          </div>
          {/* This Week */}
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="text-sm text-zinc-400 mb-2">This Week</div>
            <div className="text-3xl font-bold text-indigo-400">{formatTokens(summary.week.tokens)}</div>
            <div className="text-sm text-zinc-500 mt-1">
              {formatCost(summary.week.cost)} · {summary.week.operations} ops
            </div>
          </div>
          {/* This Month */}
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="text-sm text-zinc-400 mb-2">This Month</div>
            <div className="text-3xl font-bold text-amber-400">{formatTokens(summary.month.tokens)}</div>
            <div className="text-sm text-zinc-500 mt-1">
              {formatCost(summary.month.cost)} · {summary.month.operations} ops
            </div>
          </div>
        </div>
      )}

      {/* Usage by Provider */}
      {summary && Object.keys(summary.byProvider).length > 0 && (
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <DollarSign size={20} />
            Cost by Provider
          </h2>
          <div className="space-y-4">
            {Object.entries(summary.byProvider).map(([provider, data]) => {
              const totalCost = Object.values(summary.byProvider).reduce((sum, p) => sum + p.cost, 0);
              const percentage = totalCost > 0 ? (data.cost / totalCost) * 100 : 0;
              return (
                <div key={provider}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{provider}</span>
                    <span className="text-zinc-400">
                      {formatTokens(data.tokens)} tokens · {formatCost(data.cost)}
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Usage History Chart (Simple Bar Visualization) */}
      {history.length > 0 && (
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <TrendingUp size={20} />
            Usage History
          </h2>
          <div className="h-48 flex items-end gap-1">
            {history.map((day, i) => {
              const maxTokens = Math.max(...history.map(d => d.tokens), 1);
              const height = (day.tokens / maxTokens) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-indigo-500/50 hover:bg-indigo-500 rounded-t transition-colors relative group"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${day.date}: ${formatTokens(day.tokens)} tokens`}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {day.date}: {formatTokens(day.tokens)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>{history[0]?.date}</span>
            <span>{history[history.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Credential Usage */}
      {credentials.length > 0 && (
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Cpu size={20} />
            Credential Usage
          </h2>
          <div className="space-y-3">
            {credentials.map((cred) => (
              <div key={cred.credentialId} className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{cred.credentialName || 'Unnamed'}</span>
                    <span className="text-zinc-500 ml-2 text-sm capitalize">{cred.provider}</span>
                  </div>
                  <span className="text-zinc-400">{formatCost(cred.costEstimate)}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-zinc-400">{formatTokens(cred.tokensUsed)} used</span>
                  {cred.tokenLimit && (
                    <>
                      <span className="text-zinc-600">|</span>
                      <span className={cred.percentUsed && cred.percentUsed > 80 ? 'text-red-400' : 'text-zinc-400'}>
                        {cred.percentUsed?.toFixed(0)}% of {formatTokens(cred.tokenLimit)} limit
                      </span>
                    </>
                  )}
                </div>
                {cred.tokenLimit && (
                  <div className="mt-2 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${(cred.percentUsed ?? 0) > 80 ? 'bg-red-500' : (cred.percentUsed ?? 0) > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(cred.percentUsed ?? 0, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Usage */}
      {agents.length > 0 && (
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Users size={20} />
            Agent Usage
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-zinc-400 border-b border-zinc-800">
                  <th className="pb-3 font-medium">Agent</th>
                  <th className="pb-3 font-medium text-right">Tokens</th>
                  <th className="pb-3 font-medium text-right">Cost</th>
                  <th className="pb-3 font-medium text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {agents.map((agent) => (
                  <tr key={agent.agentId} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 font-medium">{agent.agentName}</td>
                    <td className="py-3 text-right text-zinc-400">{formatTokens(agent.tokens)}</td>
                    <td className="py-3 text-right text-zinc-400">{formatCost(agent.cost)}</td>
                    <td className="py-3 text-right text-zinc-400">{agent.operations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!summary && history.length === 0 && credentials.length === 0 && agents.length === 0 && (
        <div className="bg-zinc-900 rounded-xl p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-300">No usage data yet</h3>
          <p className="text-zinc-500 mt-1">Usage data will appear here once AI activities are executed.</p>
        </div>
      )}
    </div>
  );
}
