import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { X, RefreshCw, Check, AlertTriangle, ArrowRight } from 'lucide-react';

interface DiffOperation {
    action: 'create' | 'update' | 'noop';
    type: 'entity' | 'relationship';
    key: string;
    summary: string;
    payload?: any;
}

interface ReseedPreviewModalProps {
    onClose: () => void;
}

export function ReseedPreviewModal({ onClose }: ReseedPreviewModalProps) {
    const [ops, setOps] = useState<DiffOperation[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        loadPreview();
    }, []);

    const loadPreview = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await api.reseedPreview();
            setOps(result.ops);
            setStats(result.stats);
        } catch (err) {
            setError('Failed to load preview');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!confirm('Are you sure you want to apply these changes? This may modify your database.')) return;
        
        setApplying(true);
        try {
            const result = await api.reseedApply(ops);
            if (result.success) {
                setCompleted(true);
            }
        } catch (err) {
            setError('Failed to apply changes');
            console.error(err);
        } finally {
            setApplying(false);
        }
    };

    if (completed) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                        <Check size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Reseed Complete</h2>
                    <p className="text-zinc-400">
                        The system state has been updated successfully.
                    </p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg w-full"
                    >
                        Reload Application
                    </button>
                </div>
            </div>
        );
    }

    const changes = ops.filter(o => o.action !== 'noop');
    const noops = ops.filter(o => o.action === 'noop');

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <RefreshCw size={20} className="text-indigo-400" />
                        System Reseed Preview
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                         <div className="flex items-center justify-center h-40 gap-3 text-zinc-400">
                            <span className="animate-spin"><RefreshCw size={24} /></span>
                            Generating preview...
                         </div>
                    ) : error ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                            {error}
                            <button onClick={loadPreview} className="block mt-2 text-sm underline hover:text-red-300">Retry</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-center">
                                    <div className="text-2xl font-bold text-emerald-400">+{stats.created}</div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Created</div>
                                </div>
                                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-center">
                                    <div className="text-2xl font-bold text-amber-400">~{stats.updated}</div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Updated</div>
                                </div>
                                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-center">
                                    <div className="text-2xl font-bold text-zinc-600">{stats.noop}</div>
                                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Unchanged</div>
                                </div>
                            </div>

                            {changes.length === 0 ? (
                                <div className="text-center py-10 text-zinc-500">
                                    <Check size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>System is in sync. No changes needed.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-400 sticky top-0 bg-zinc-900 py-2">
                                        Proposed Changes ({changes.length})
                                    </h3>
                                    {changes.map((op, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-zinc-950 rounded border border-zinc-800">
                                            <div className={`mt-0.5 ${
                                                op.action === 'create' ? 'text-emerald-400' : 'text-amber-400'
                                            }`}>
                                                {op.action === 'create' ? <Check size={16} /> : <AlertTriangle size={16} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-zinc-300 font-medium">{op.summary}</div>
                                                <div className="text-xs text-zinc-500 font-mono mt-1">{op.key}</div>
                                            </div>
                                            <div className="text-xs px-2 py-1 rounded bg-zinc-900 text-zinc-500 uppercase font-bold border border-zinc-800">
                                                {op.action}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {noops.length > 0 && (
                                <div className="pt-4 border-t border-zinc-800">
                                    <details className="text-zinc-500 text-sm">
                                        <summary className="cursor-pointer hover:text-zinc-300">
                                            View {noops.length} unchanged items
                                        </summary>
                                        <div className="mt-2 pl-4 space-y-1">
                                            {noops.map((op, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
                                                    <span>{op.summary}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3 rounded-b-xl">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-zinc-400 hover:text-white text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleApply}
                        disabled={loading || applying || changes.length === 0}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                        {applying ? 'Applying...' : 'Apply Changes'}
                        {!applying && <ArrowRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
