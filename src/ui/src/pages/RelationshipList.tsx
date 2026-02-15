import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, RefreshCw, Link2, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import type { Entity, Relationship, RelationshipInput, ApiError } from '../lib/api';
import { useBrand } from '../lib/BrandContext';
import { RELATIONSHIP_TYPES } from '../lib/constants';

export function RelationshipList() {
  const { activeBrandId } = useBrand();
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [relType, setRelType] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rels, ents] = await Promise.all([
        api.listRelationships(undefined, undefined, typeFilter || undefined),
        api.listEntities(undefined, activeBrandId || undefined),
      ]);
      setRelationships(rels);
      setEntities(ents);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, activeBrandId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const entityName = (id: string) => {
    const e = entities.find(ent => ent.id === id);
    return e ? e.name : id.slice(0, 8) + '...';
  };

  const entityTypeName = (id: string) => {
    const e = entities.find(ent => ent.id === id);
    return e?.type || '?';
  };

  const handleCreate = async () => {
    if (!fromId || !toId || !relType) return;
    setCreating(true);
    try {
      const input: RelationshipInput = { from_id: fromId, to_id: toId, type: relType };
      const created = await api.createRelationship(input);
      setRelationships(prev => [created, ...prev]);
      setFromId('');
      setToId('');
      setRelType('');
      setShowCreate(false);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to create relationship');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this relationship? This cannot be undone.')) return;
    try {
      await api.deleteRelationship(id);
      setRelationships(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to delete relationship');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Relationships</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Plus size={18} />
            New Relationship
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase mb-3">Create Relationship</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={fromId}
              onChange={e => setFromId(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            >
              <option value="">From entity...</option>
              {entities.map(e => (
                <option key={e.id} value={e.id}>[{e.type}] {e.name}</option>
              ))}
            </select>
            <select
              value={relType}
              onChange={e => setRelType(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            >
              <option value="">Relationship type...</option>
              {RELATIONSHIP_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={toId}
              onChange={e => setToId(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
            >
              <option value="">To entity...</option>
              {entities.map(e => (
                <option key={e.id} value={e.id}>[{e.type}] {e.name}</option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              disabled={!fromId || !toId || !relType || creating}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        >
          <option value="">All Types</option>
          {RELATIONSHIP_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-zinc-400 flex items-center gap-2">
          <RefreshCw size={18} className="animate-spin" />
          Loading...
        </div>
      ) : relationships.length === 0 ? (
        <div className="text-zinc-400 flex items-center gap-2">
          <Link2 size={18} />
          No relationships found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full">
            <thead className="bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">From</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-zinc-400">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">To</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Created</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {relationships.map(rel => (
                <tr key={rel.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-300">
                        {entityTypeName(rel.from_id)}
                      </span>
                      <span className="text-white">{entityName(rel.from_id)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-zinc-500">
                      <ArrowRight size={14} />
                      <span className="px-2 py-0.5 text-xs rounded bg-indigo-900/50 text-indigo-300 font-mono">
                        {rel.type}
                      </span>
                      <ArrowRight size={14} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-300">
                        {entityTypeName(rel.to_id)}
                      </span>
                      <span className="text-white">{entityName(rel.to_id)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">
                    {new Date(rel.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(rel.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
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
