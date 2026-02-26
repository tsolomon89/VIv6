import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Database, Trash2, RefreshCw, FolderTree, List, UserPlus } from 'lucide-react';
import { api } from '../lib/api';
import { showToast } from '../hooks/useToast';
import type { Entity, ApiError } from '../lib/api';
import { useBrand } from '../lib/BrandContext';
import { UseCaseTree } from '../components/UseCaseTree';
import { InviteUserModal } from '../components/InviteUserModal';
import { ENTITY_TYPES } from '../lib/constants';

export function EntityList() {
  const { activeBrandId } = useBrand();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const fetchEntities = async () => {
    setLoading(true);
    setError(null);
    try {
      // Pass activeBrandId to API
      // If brand_id is undefined, backend handles it (returns all or filters by type only)
      // But for multi-tenant, we probably want to strictly filter if activeBrandId is set.
      const data = await api.listEntities(filter || undefined, activeBrandId || undefined);
      setEntities(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to fetch entities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, [filter, activeBrandId]); // Refetch when brand changes

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    
    try {
      await api.deleteEntity(id);
      setEntities(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      showToast.error(apiError.error || 'Failed to delete entity');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Entities</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchEntities}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          
          {filter === 'user' && (
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <UserPlus size={18} />
              Invite User
            </button>
          )}

          <Link 
            to="/entities/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Plus size={18} />
            New Entity
          </Link>
        </div>
      </div>
      
      <InviteUserModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchEntities}
      />

      {/* Filter */}
      <div className="mb-4 flex items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        >
          <option value="">All Types</option>
          {ENTITY_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {filter === 'useCase' && (
          <div className="flex bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              <List size={14} /> Table
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 ${viewMode === 'tree' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              <FolderTree size={14} /> Tree
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Tree View for Use Cases */}
      {filter === 'useCase' && viewMode === 'tree' ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <UseCaseTree />
        </div>
      ) : (
      <>
      {/* List */}
      {loading ? (
        <div className="text-zinc-400 flex items-center gap-2">
          <RefreshCw size={18} className="animate-spin" />
          Loading...
        </div>
      ) : entities.length === 0 ? (
        <div className="text-zinc-400 flex items-center gap-2">
          <Database size={18} />
          No entities found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full">
            <thead className="bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Created</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {entities.map((entity) => (
                <tr key={entity.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/entities/${entity.id}`} className="text-indigo-400 hover:underline">
                      {entity.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-300">
                      {entity.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-sm">{entity.slug}</td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">
                    {new Date(entity.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(entity.id, entity.name)}
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
      </>
      )}
    </div>
  );
}
