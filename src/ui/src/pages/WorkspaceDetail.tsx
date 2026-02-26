/**
 * WorkspaceDetail - View and manage a single workspace
 *
 * Shows workspace changes, allows adding/removing changes,
 * and provides preview/apply/rollback actions.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GitBranch,
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RotateCcw,
  Play,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { api, type WorkspaceWithChanges, type WorkspaceStatus, type WorkspacePreview } from '../lib/api';

const STATUS_STYLES: Record<WorkspaceStatus, { bg: string; text: string; icon: typeof Clock }> = {
  draft: { bg: 'bg-zinc-700', text: 'text-zinc-300', icon: Clock },
  review: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', icon: AlertCircle },
  approved: { bg: 'bg-blue-900/50', text: 'text-blue-400', icon: CheckCircle },
  applied: { bg: 'bg-green-900/50', text: 'text-green-400', icon: CheckCircle },
  rejected: { bg: 'bg-red-900/50', text: 'text-red-400', icon: XCircle },
  rolled_back: { bg: 'bg-orange-900/50', text: 'text-orange-400', icon: RotateCcw },
};

const OPERATION_STYLES = {
  create: { bg: 'bg-green-900/50', text: 'text-green-400' },
  update: { bg: 'bg-blue-900/50', text: 'text-blue-400' },
  delete: { bg: 'bg-red-900/50', text: 'text-red-400' },
};

interface PreviewModalProps {
  preview: WorkspacePreview | null;
  loading: boolean;
  onClose: () => void;
  onApply: () => void;
  applying: boolean;
}

function PreviewModal({ preview, loading, onClose, onApply, applying }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Eye size={20} className="text-indigo-400" />
            Workspace Preview
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <XCircle size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={32} className="animate-spin text-zinc-500" />
            </div>
          ) : preview ? (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{preview.stats.created}</div>
                  <div className="text-sm text-green-400/70">Create</div>
                </div>
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{preview.stats.updated}</div>
                  <div className="text-sm text-blue-400/70">Update</div>
                </div>
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{preview.stats.deleted}</div>
                  <div className="text-sm text-red-400/70">Delete</div>
                </div>
              </div>

              {/* Blocking Reasons */}
              {preview.blockingReasons.length > 0 && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <h3 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                    <XCircle size={16} />
                    Cannot Apply
                  </h3>
                  <ul className="text-sm text-red-400/80 space-y-1">
                    {preview.blockingReasons.map((reason, i) => (
                      <li key={i}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validation Errors */}
              {preview.validationErrors.length > 0 && (
                <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4">
                  <h3 className="font-medium text-orange-400 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Validation Errors
                  </h3>
                  <ul className="text-sm text-orange-400/80 space-y-1">
                    {preview.validationErrors.map((err, i) => (
                      <li key={i}>• Change {err.changeId}: {err.errors.join(', ')}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Safety Concerns */}
              {preview.safetyConcerns.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-400 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Safety Concerns
                  </h3>
                  <ul className="text-sm text-yellow-400/80 space-y-1">
                    {preview.safetyConcerns.map((concern, i) => (
                      <li key={i}>• [{concern.severity}] {concern.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary */}
              {preview.summary && (
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-2">Summary</h3>
                  <pre className="text-sm text-zinc-400 whitespace-pre-wrap">{preview.summary}</pre>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            Close
          </button>
          {preview?.canApply && (
            <button
              onClick={onApply}
              disabled={applying}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2"
            >
              {applying ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Play size={16} />
              )}
              Apply Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkspaceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<WorkspaceWithChanges | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<WorkspacePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  const loadWorkspace = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWorkspace(id);
      setWorkspace(data);
    } catch (err: any) {
      setError(err.error || 'Failed to load workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [id]);

  const handleStatusAction = async (action: 'submit' | 'approve' | 'reject' | 'rollback') => {
    if (!id) return;
    setActionLoading(true);
    try {
      let updated;
      switch (action) {
        case 'submit':
          updated = await api.submitWorkspaceForReview(id);
          break;
        case 'approve':
          updated = await api.approveWorkspace(id);
          break;
        case 'reject':
          updated = await api.rejectWorkspace(id);
          break;
        case 'rollback':
          const result = await api.rollbackWorkspace(id);
          updated = result.workspace;
          break;
      }
      setWorkspace((prev) => prev ? { ...prev, ...updated } : null);
    } catch (err: any) {
      alert(err.error || `Failed to ${action} workspace`);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!id) return;
    setShowPreview(true);
    setPreviewLoading(true);
    try {
      const data = await api.previewWorkspace(id);
      setPreview(data);
    } catch (err: any) {
      alert(err.error || 'Failed to preview workspace');
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    try {
      const result = await api.applyWorkspace(id);
      setWorkspace((prev) => prev ? { ...prev, ...result.workspace } : null);
      setShowPreview(false);
      alert(`Successfully applied ${result.appliedChanges} changes!`);
    } catch (err: any) {
      alert(err.error || 'Failed to apply workspace');
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveChange = async (changeId: string) => {
    if (!id || !confirm('Remove this change?')) return;
    try {
      await api.removeWorkspaceChange(id, changeId);
      setWorkspace((prev) =>
        prev
          ? { ...prev, changes: prev.changes.filter((c) => c.id !== changeId) }
          : null
      );
    } catch (err: any) {
      alert(err.error || 'Failed to remove change');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw size={32} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
          <XCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-red-400 mb-2">Error</h3>
          <p className="text-red-400/80">{error || 'Workspace not found'}</p>
          <button
            onClick={() => navigate('/workspaces')}
            className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
          >
            Back to Workspaces
          </button>
        </div>
      </div>
    );
  }

  const style = STATUS_STYLES[workspace.status];
  const StatusIcon = style.icon;
  const canEdit = workspace.status === 'draft';
  const canSubmit = workspace.status === 'draft' && workspace.changes.length > 0;
  const canApprove = workspace.status === 'review';
  const canApplyDirect = workspace.status === 'approved';
  const canRollback = workspace.status === 'applied';

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/workspaces')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Workspaces
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-zinc-800 rounded-xl">
              <GitBranch size={24} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                {workspace.name}
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${style.bg} ${style.text}`}
                >
                  <StatusIcon size={12} />
                  {workspace.status}
                </span>
              </h1>
              {workspace.description && (
                <p className="text-zinc-400 mt-1">{workspace.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadWorkspace}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>

          {canSubmit && (
            <button
              onClick={() => handleStatusAction('submit')}
              disabled={actionLoading}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Send size={16} />
              Submit for Review
            </button>
          )}

          {canApprove && (
            <>
              <button
                onClick={() => handleStatusAction('reject')}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <XCircle size={16} />
                Reject
              </button>
              <button
                onClick={() => handleStatusAction('approve')}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Approve
              </button>
            </>
          )}

          {canApplyDirect && (
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Play size={16} />
              Preview & Apply
            </button>
          )}

          {canRollback && (
            <button
              onClick={() => handleStatusAction('rollback')}
              disabled={actionLoading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Rollback
            </button>
          )}
        </div>
      </header>

      {/* Metadata */}
      <div className="flex items-center gap-6 text-sm text-zinc-500">
        <span>Created: {new Date(workspace.created_at).toLocaleString()}</span>
        <span>Updated: {new Date(workspace.updated_at).toLocaleString()}</span>
        {workspace.applied_at && (
          <span>Applied: {new Date(workspace.applied_at).toLocaleString()}</span>
        )}
      </div>

      {/* Changes */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/20 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Changes ({workspace.changes.length})
          </h2>
          {canEdit && (
            <button
              onClick={() => navigate(`/config?workspace=${id}`)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus size={16} />
              Add Change
            </button>
          )}
        </div>

        <div className="divide-y divide-zinc-800">
          {workspace.changes.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No changes in this workspace yet.
              {canEdit && (
                <button
                  onClick={() => navigate(`/config?workspace=${id}`)}
                  className="block mx-auto mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg"
                >
                  Add Your First Change
                </button>
              )}
            </div>
          ) : (
            workspace.changes.map((change) => {
              const opStyle = OPERATION_STYLES[change.operation];
              return (
                <div key={change.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium uppercase ${opStyle.bg} ${opStyle.text}`}
                    >
                      {change.operation}
                    </span>
                    <div>
                      <div className="font-medium text-white">
                        {change.config_type}
                        {change.target_slug && (
                          <span className="text-zinc-400 ml-2">: {change.target_slug}</span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {change.validation_result?.valid === false && (
                          <span className="text-red-400 mr-2">
                            Validation failed
                          </span>
                        )}
                        {change.safety_result?.safe === false && (
                          <span className="text-yellow-400">
                            Safety concerns
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => handleRemoveChange(change.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Remove change"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          preview={preview}
          loading={previewLoading}
          onClose={() => setShowPreview(false)}
          onApply={handleApply}
          applying={applying}
        />
      )}
    </div>
  );
}
