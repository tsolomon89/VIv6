/**
 * WorkspaceList - List and manage configuration workspaces
 *
 * GTM-style staging system for configuration changes.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Plus,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { api, type ConfigWorkspace, type WorkspaceStatus } from '../lib/api';

const STATUS_TABS: { value: WorkspaceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'applied', label: 'Applied' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_STYLES: Record<WorkspaceStatus, { bg: string; text: string; icon: typeof Clock }> = {
  draft: { bg: 'bg-zinc-700', text: 'text-zinc-300', icon: Clock },
  review: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', icon: AlertCircle },
  approved: { bg: 'bg-blue-900/50', text: 'text-blue-400', icon: CheckCircle },
  applied: { bg: 'bg-green-900/50', text: 'text-green-400', icon: CheckCircle },
  rejected: { bg: 'bg-red-900/50', text: 'text-red-400', icon: XCircle },
  rolled_back: { bg: 'bg-orange-900/50', text: 'text-orange-400', icon: RotateCcw },
};

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (workspace: ConfigWorkspace) => void;
}

function CreateWorkspaceModal({ isOpen, onClose, onCreated }: CreateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use system account for now
      const workspace = await api.createWorkspace({
        account_id: '00000000-0000-0000-0000-000000000000',
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onCreated(workspace);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.error || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Create Workspace</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Update Pipeline Rules"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the changes in this workspace..."
              rows={3}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2"
            >
              {loading && <RefreshCw size={16} className="animate-spin" />}
              Create Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function WorkspaceList() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<ConfigWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<WorkspaceStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadWorkspaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const data = await api.listWorkspaces(filters);
      setWorkspaces(data);
    } catch (err: any) {
      setError(err.error || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, [statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workspace?')) return;

    try {
      await api.deleteWorkspace(id);
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    } catch (err: any) {
      alert(err.error || 'Failed to delete workspace');
    }
  };

  const filteredWorkspaces = workspaces;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-zinc-800 rounded-xl">
            <GitBranch size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Configuration Workspaces</h1>
            <p className="text-zinc-500">Stage and preview changes before applying them.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadWorkspaces}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <Plus size={18} />
            New Workspace
          </button>
        </div>
      </header>

      {/* Status Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-lg w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="px-4 py-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-zinc-500" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredWorkspaces.length === 0 && (
        <div className="text-center py-12">
          <GitBranch size={48} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-400 mb-2">No workspaces found</h3>
          <p className="text-zinc-500 mb-4">
            {statusFilter === 'all'
              ? 'Create a workspace to start staging configuration changes.'
              : `No workspaces with status "${statusFilter}".`}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
          >
            Create Workspace
          </button>
        </div>
      )}

      {/* Workspace List */}
      {!loading && filteredWorkspaces.length > 0 && (
        <div className="space-y-4">
          {filteredWorkspaces.map((workspace) => {
            const style = STATUS_STYLES[workspace.status];
            const StatusIcon = style.icon;

            return (
              <div
                key={workspace.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors cursor-pointer"
                onClick={() => navigate(`/workspaces/${workspace.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{workspace.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${style.bg} ${style.text}`}
                      >
                        <StatusIcon size={12} />
                        {workspace.status}
                      </span>
                    </div>
                    {workspace.description && (
                      <p className="text-zinc-400 text-sm mb-3">{workspace.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>Created: {new Date(workspace.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(workspace.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/workspaces/${workspace.id}`)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {(workspace.status === 'draft' || workspace.status === 'rejected') && (
                      <button
                        onClick={() => handleDelete(workspace.id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(workspace) => {
          setWorkspaces((prev) => [workspace, ...prev]);
        }}
      />
    </div>
  );
}
