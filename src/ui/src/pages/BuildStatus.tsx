import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hammer, RefreshCw, Play, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { api } from '../lib/api';
import type { BuildEntry, BuildSummary } from '../lib/api';
import { BUILD_STATUS_STYLES } from '../lib/constants';

export function BuildStatus() {
  const [builds, setBuilds] = useState<BuildEntry[]>([]);
  const [summary, setSummary] = useState<BuildSummary | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [building, setBuilding] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([
        api.listBuilds(),
        api.getBuildSummary(),
      ]);
      setBuilds(b);
      setSummary(s);
    } catch (err) {
      console.error('Failed to load builds', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerBuild = async (entityId: string) => {
    setBuilding(prev => new Set([...prev, entityId]));
    try {
      await api.triggerBuild(entityId);
      await loadData();
    } catch (err) {
      setError(`Build failed for entity ${entityId}`);
    } finally {
      setBuilding(prev => {
        const next = new Set(prev);
        next.delete(entityId);
        return next;
      });
    }
  };

  const filtered = statusFilter
    ? builds.filter(b => b.status === statusFilter)
    : builds;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle size={14} className="text-emerald-400" />;
      case 'error': return <AlertTriangle size={14} className="text-red-400" />;
      default: return <Clock size={14} className="text-amber-400" />;
    }
  };

  const statusBadge = (status: string) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${BUILD_STATUS_STYLES[status] || BUILD_STATUS_STYLES.pending}`}>
        {statusIcon(status)} {status}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Build Status</h1>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: summary.total, color: 'text-zinc-300' },
            { label: 'Success', value: summary.success, color: 'text-emerald-400' },
            { label: 'Pending', value: summary.pending, color: 'text-amber-400' },
            { label: 'Errors', value: summary.error, color: 'text-red-400' },
          ].map(card => (
            <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-zinc-500">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">{error}</div>
      )}

      {/* Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-zinc-400 flex items-center gap-2">
          <RefreshCw size={18} className="animate-spin" /> Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-zinc-500 text-center py-8">
          <Hammer size={24} className="mx-auto mb-2 opacity-50" />
          No build records found. Trigger a build from an entity or use the API.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full">
            <thead className="bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Entity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Built At</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Error</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map(build => (
                <tr key={build.entity_id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/records/${build.entity_type || 'object'}/${build.entity_id}`} className="text-indigo-400 hover:underline text-sm">
                      {build.entity_name || build.entity_id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-300">
                      {build.entity_type || '?'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{statusBadge(build.status)}</td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">
                    {build.built_at ? new Date(build.built_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-red-400 text-xs max-w-[200px] truncate">
                    {build.error_message || ''}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => triggerBuild(build.entity_id)}
                      disabled={building.has(build.entity_id)}
                      className="p-1.5 text-zinc-500 hover:text-indigo-400 transition-colors disabled:opacity-50"
                      title="Rebuild"
                    >
                      {building.has(build.entity_id) ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Play size={14} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
