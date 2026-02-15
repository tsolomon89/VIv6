import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, Link2, FileCode, Layers, Plus, Hammer, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { api } from '../lib/api';
import type { Entity, BuildSummary } from '../lib/api';
import { useBrand } from '../lib/BrandContext';
import { ENTITY_TYPE_STYLES } from '../lib/constants';

export interface TypeCount {
  type: string;
  count: number;
}

export function Dashboard() {
  const { activeBrandId } = useBrand();
  const [typeCounts, setTypeCounts] = useState<TypeCount[]>([]);
  const [recentEntities, setRecentEntities] = useState<Entity[]>([]);
  const [buildSummary, setBuildSummary] = useState<BuildSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [activeBrandId]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [entities, summary] = await Promise.all([
        api.listEntities(undefined, activeBrandId || undefined),
        api.getBuildSummary().catch(() => null),
      ]);

      // Count by type
      const counts = new Map<string, number>();
      for (const e of entities) {
        counts.set(e.type, (counts.get(e.type) || 0) + 1);
      }
      setTypeCounts(Array.from(counts.entries()).map(([type, count]) => ({ type, count })));

      // Recent 10 by updated_at
      const sorted = [...entities].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      setRecentEntities(sorted.slice(0, 10));

      setBuildSummary(summary);
    } catch (err) {
      console.error('Dashboard load error', err);
    } finally {
      setLoading(false);
    }
  };

  const typeStyles = ENTITY_TYPE_STYLES;

  if (loading) {
    return <div className="text-zinc-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            to="/records/contact"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> New Record
          </Link>
        </div>
      </div>

      {/* Entity Count Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {typeCounts.map(({ type, count }) => (
          <Link
            key={type}
            to={`/records/${type}`}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
          >
            <div className={`inline-flex p-2 rounded-lg mb-2 ${typeStyles[type] || 'bg-zinc-800 text-zinc-400'}`}>
              <Database size={16} />
            </div>
            <div className="text-2xl font-bold text-white">{count}</div>
            <div className="text-xs text-zinc-500 capitalize">{type}s</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <Clock size={16} className="text-zinc-500" />
            <h2 className="font-semibold text-zinc-200 text-sm">Recent Activity</h2>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {recentEntities.map(entity => (
              <Link
                key={entity.id}
                to={`/records/${entity.type}/${entity.id}`}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs rounded ${typeStyles[entity.type] || 'bg-zinc-800 text-zinc-400'}`}>
                    {entity.type}
                  </span>
                  <span className="text-sm text-zinc-200">{entity.name}</span>
                </div>
                <span className="text-xs text-zinc-600">
                  {new Date(entity.updated_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
            {recentEntities.length === 0 && (
              <div className="px-4 py-8 text-center text-zinc-600 text-sm">No entities yet</div>
            )}
          </div>
        </div>

        {/* Build Status + Quick Links */}
        <div className="space-y-4">
          {buildSummary && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                <Hammer size={16} className="text-zinc-500" />
                <h2 className="font-semibold text-zinc-200 text-sm">Build Status</h2>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle size={14} /> Success
                  </span>
                  <span className="text-sm font-mono text-zinc-300">{buildSummary.success}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-amber-400">
                    <Clock size={14} /> Pending
                  </span>
                  <span className="text-sm font-mono text-zinc-300">{buildSummary.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-red-400">
                    <AlertTriangle size={14} /> Errors
                  </span>
                  <span className="text-sm font-mono text-zinc-300">{buildSummary.error}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="font-semibold text-zinc-200 text-sm">Quick Links</h2>
            </div>
            <div className="p-2">
              <Link to="/records/content" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                <Database size={14} /> Content Database
              </Link>
              <Link to="/relationships" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                <Link2 size={14} /> Relationships
              </Link>
              <Link to="/templates" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                <FileCode size={14} /> Templates
              </Link>
              <Link to="/dimensions" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                <Layers size={14} /> Dimensions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
