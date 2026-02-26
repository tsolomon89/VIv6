import { useState, useEffect } from 'react';
import { RefreshCw, Shield, CheckCircle, XCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { showToast } from '../hooks/useToast';
import type { AIApprovalSummary, AIApprovalDetail, ApiError } from '../lib/api';

type ViewMode = 'list' | 'detail';

export function AIApprovalsPage() {
  const [approvals, setApprovals] = useState<AIApprovalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail view
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedApproval, setSelectedApproval] = useState<AIApprovalDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Decision state
  const [deciding, setDeciding] = useState(false);
  const [comment, setComment] = useState('');

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listPendingApprovals();
      setApprovals(data.approvals);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleViewDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const detail = await api.getApproval(id);
      setSelectedApproval(detail);
      setViewMode('detail');
      setComment('');
    } catch (err) {
      const apiError = err as ApiError;
      showToast.error(apiError.error || 'Failed to load approval details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!selectedApproval) return;

    setDeciding(true);
    try {
      await api.handleApprovalDecision(selectedApproval.id, decision, comment || undefined);
      showToast.success(`Approval ${decision === 'approved' ? 'approved' : 'rejected'} successfully`);
      setViewMode('list');
      setSelectedApproval(null);
      setComment('');
      fetchApprovals();
    } catch (err) {
      const apiError = err as ApiError;
      showToast.error(apiError.error || `Failed to ${decision === 'approved' ? 'approve' : 'reject'}`);
    } finally {
      setDeciding(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-400';
    if (confidence >= 0.5) return 'text-amber-400';
    return 'text-red-400';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-emerald-500/20';
    if (confidence >= 0.5) return 'bg-amber-500/20';
    return 'bg-red-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-zinc-500" size={32} />
      </div>
    );
  }

  // Detail View
  if (viewMode === 'detail' && selectedApproval) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setViewMode('list'); setSelectedApproval(null); }}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{selectedApproval.name}</h1>
            <p className="text-zinc-400 text-sm">Review AI work and decide</p>
          </div>
        </div>

        {/* Confidence Score */}
        <div className={`rounded-xl p-4 ${getConfidenceBg(selectedApproval.confidence)}`}>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-medium">AI Confidence Score</span>
            <span className={`text-2xl font-bold ${getConfidenceColor(selectedApproval.confidence)}`}>
              {Math.round(selectedApproval.confidence * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${selectedApproval.confidence >= 0.8 ? 'bg-emerald-500' : selectedApproval.confidence >= 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${selectedApproval.confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Triggered Rules */}
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-amber-400" />
            Triggered Approval Rules
          </h2>
          {selectedApproval.triggeredRules.length === 0 ? (
            <p className="text-zinc-500">No rules triggered</p>
          ) : (
            <ul className="space-y-2">
              {selectedApproval.triggeredRules.map((rule, i) => (
                <li key={i} className="flex items-center gap-2 text-zinc-300">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  {rule}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Proposed Changes */}
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Proposed Changes</h2>
          {selectedApproval.proposedChanges.length === 0 ? (
            <p className="text-zinc-500">No field changes proposed</p>
          ) : (
            <div className="space-y-3">
              {selectedApproval.proposedChanges.map((change, i) => (
                <div key={i} className="bg-zinc-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-zinc-200">{change.field}</span>
                    <span className={`text-sm ${getConfidenceColor(change.confidence)}`}>
                      {Math.round(change.confidence * 100)}% confident
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-500">Before:</span>
                      <pre className="text-red-400 bg-zinc-900 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(change.oldValue, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-zinc-500">After:</span>
                      <pre className="text-emerald-400 bg-zinc-900 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(change.newValue, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tool Calls */}
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Tool Calls Made</h2>
          {selectedApproval.toolCalls.length === 0 ? (
            <p className="text-zinc-500">No tool calls made</p>
          ) : (
            <div className="space-y-2">
              {selectedApproval.toolCalls.map((call, i) => (
                <div key={i} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-2">
                  <span className="font-mono text-sm">{call.name}</span>
                  {call.success ? (
                    <CheckCircle size={16} className="text-emerald-400" />
                  ) : (
                    <span className="text-red-400 text-sm">{call.error || 'Failed'}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent Info */}
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">AI Agent</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
              <Shield size={24} className="text-indigo-400" />
            </div>
            <div>
              <div className="font-medium">{selectedApproval.agentName}</div>
              <div className="text-sm text-zinc-500">{selectedApproval.agentId}</div>
            </div>
          </div>
        </div>

        {/* Decision Section */}
        <div className="bg-zinc-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Your Decision</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment about your decision..."
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm resize-none h-20"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleDecision('approved')}
                disabled={deciding}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle size={20} />
                Approve
              </button>
              <button
                onClick={() => handleDecision('rejected')}
                disabled={deciding}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <XCircle size={20} />
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield size={28} />
            AI Approvals
          </h1>
          <p className="text-zinc-400 mt-1">Review pending AI work that requires human approval</p>
        </div>
        <button
          onClick={fetchApprovals}
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

      {/* Pending Count */}
      <div className="bg-zinc-900 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-amber-400">{approvals.length}</div>
            <div className="text-zinc-400">Pending Approvals</div>
          </div>
          <Clock size={48} className="text-zinc-700" />
        </div>
      </div>

      {/* Approvals List */}
      <div className="bg-zinc-900 rounded-xl overflow-hidden">
        {approvals.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
            <h3 className="text-lg font-medium text-zinc-300">All caught up!</h3>
            <p className="text-zinc-500 mt-1">No pending approvals at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {approvals.map((approval) => (
              <button
                key={approval.id}
                onClick={() => handleViewDetail(approval.id)}
                disabled={loadingDetail}
                className="w-full px-6 py-4 hover:bg-zinc-800/50 transition-colors text-left flex items-center gap-4"
              >
                <div className={`w-3 h-3 rounded-full ${getConfidenceBg(approval.confidence)} flex items-center justify-center`}>
                  <div className={`w-2 h-2 rounded-full ${approval.confidence >= 0.8 ? 'bg-emerald-400' : approval.confidence >= 0.5 ? 'bg-amber-400' : 'bg-red-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{approval.name}</div>
                  <div className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
                    <span>{approval.triggeredRules.length} rule(s) triggered</span>
                    <span>·</span>
                    <span>{Math.round(approval.confidence * 100)}% confidence</span>
                    <span>·</span>
                    <span>{new Date(approval.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-zinc-500" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
