import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, RefreshCw, Database, Upload } from 'lucide-react';
import { api } from '../lib/api';
import type { ApiError, DimensionValue, DimensionType } from '../lib/api';
import { CsvImporter } from '../components/CsvImporter';
import { slugify } from '../lib/utils';

export function DimensionValueList() {
  const [values, setValues] = useState<DimensionValue[]>([]);
  const [dimTypes, setDimTypes] = useState<DimensionType[]>([]);
  const [dimFilter, setDimFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newDim, setNewDim] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // CSV import
  const [showImport, setShowImport] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vals, types] = await Promise.all([
        api.listDimensionValues(dimFilter || undefined),
        api.getDimensionTypes(),
      ]);
      setValues(vals);
      setDimTypes(types);
    } catch (err) {
      setError((err as ApiError).error || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [dimFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!newDim || !newSlug || !newLabel) return;
    setCreating(true);
    setCreateError(null);
    try {
      await api.createDimValue({ dimension: newDim, slug: newSlug, label: newLabel });
      setNewDim(''); setNewSlug(''); setNewLabel('');
      setShowCreate(false);
      fetchData();
    } catch (err) {
      setCreateError((err as ApiError).error || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this dimension value?')) return;
    try {
      await api.deleteDimensionValue(id);
      setValues(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      setError((err as ApiError).error || 'Failed to delete');
    }
  };

  const parentLabel = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = values.find(v => v.id === parentId);
    return parent?.label || parentId.slice(0, 8);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dimension Values</h1>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowImport(!showImport)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg">
            <Upload size={18} /> Import CSV
          </button>
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg">
            <Plus size={18} /> Add Value
          </button>
        </div>
      </div>

      {/* CSV Import Panel */}
      {showImport && (
        <CsvImporter
          onImported={fetchData}
          onClose={() => setShowImport(false)}
        />
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
          {createError && (
            <div className="mb-3 p-2 bg-red-900/50 border border-red-700 rounded text-red-200 text-xs">{createError}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input value={newDim} onChange={e => setNewDim(e.target.value)} placeholder="Dimension (e.g., industry)"
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
            <input value={newLabel} onChange={e => { setNewLabel(e.target.value); setNewSlug(slugify(e.target.value)); }}
              placeholder="Label" className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
            <input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="Slug"
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono" />
            <button onClick={handleCreate} disabled={!newDim || !newSlug || !newLabel || creating}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg">
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Filter by dimension type */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setDimFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm ${!dimFilter ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
          All ({values.length})
        </button>
        {dimTypes.map(dt => (
          <button key={dt.dimension} onClick={() => setDimFilter(dt.dimension)}
            className={`px-3 py-1.5 rounded-lg text-sm ${dimFilter === dt.dimension ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
            {dt.dimension} ({dt.count})
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">{error}</div>
      )}

      {loading ? (
        <div className="text-zinc-400 flex items-center gap-2"><RefreshCw size={18} className="animate-spin" /> Loading...</div>
      ) : values.length === 0 ? (
        <div className="text-zinc-400 flex items-center gap-2"><Database size={18} /> No dimension values found.</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full">
            <thead className="bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Label</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Dimension</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Parent</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Source</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {values.map(v => (
                <tr key={v.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3 text-white">{v.label}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-300">{v.dimension}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-sm">{v.slug}</td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">{parentLabel(v.parent_id) || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded ${v.source === 'csv_import' ? 'bg-amber-900/50 text-amber-300' : 'bg-zinc-800 text-zinc-400'}`}>
                      {v.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(v.id)} className="p-1 text-zinc-500 hover:text-red-400">
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
