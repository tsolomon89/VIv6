import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileCode, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { showToast } from '../hooks/useToast';

const BINDING_KINDS = ['self', 'related'];
const ENTITY_TYPES = ['brand', 'product', 'feature', 'solution', 'useCase'];

function parseBindingFromKey(key: string): { kind: string; target?: string; cardinality?: string; layout?: string } | null {
    if (!key) return null;
    const parts = key.split('.');
    if (parts[0] === 'self') {
        return { kind: 'self', layout: parts[1] };
    }
    if (parts[0] === 'related' && parts.length >= 4) {
        return { kind: 'related', target: parts[1], cardinality: parts[2], layout: parts[3] };
    }
    return null;
}

function BindingBadge({ templateKey }: { templateKey: string }) {
    const binding = parseBindingFromKey(templateKey);
    if (!binding) return <span className="text-zinc-600 text-xs">custom key</span>;

    if (binding.kind === 'self') {
        return (
            <span className="px-2 py-0.5 text-xs rounded bg-emerald-900/50 text-emerald-300">
                self
            </span>
        );
    }

    return (
        <span className="flex items-center gap-1">
            <span className="px-2 py-0.5 text-xs rounded bg-blue-900/50 text-blue-300">
                related
            </span>
            <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-300">
                {binding.target}
            </span>
            <span className="px-1.5 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400">
                {binding.cardinality}
            </span>
        </span>
    );
}

export function TemplateList() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bindingFilter, setBindingFilter] = useState('');
    const [targetFilter, setTargetFilter] = useState('');

    const fetchTemplates = () => {
        setLoading(true);
        api.listTemplates()
            .then(setTemplates)
            .catch(() => showToast.error('Failed to load templates'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleDelete = async (key: string) => {
        if (!confirm('Delete template?')) return;
        try {
            await api.deleteTemplate(key);
            fetchTemplates();
        } catch {
            showToast.error('Failed to delete');
        }
    };

    const filtered = templates.filter(t => {
        const binding = parseBindingFromKey(t.key);
        if (bindingFilter && binding?.kind !== bindingFilter) return false;
        if (targetFilter && binding?.target !== targetFilter) return false;
        return true;
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Templates</h1>
                <div className="flex gap-2">
                    <button onClick={fetchTemplates} className="p-2 bg-zinc-800 rounded hover:bg-zinc-700">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <Link to="/templates/new" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                        <Plus size={18} /> New Template
                    </Link>
                </div>
            </div>

            {/* Binding Filters */}
            <div className="flex gap-3 mb-4">
                <select
                    value={bindingFilter}
                    onChange={e => { setBindingFilter(e.target.value); if (e.target.value !== 'related') setTargetFilter(''); }}
                    className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                >
                    <option value="">All Bindings</option>
                    {BINDING_KINDS.map(k => (
                        <option key={k} value={k}>{k}</option>
                    ))}
                </select>
                {bindingFilter === 'related' && (
                    <select
                        value={targetFilter}
                        onChange={e => setTargetFilter(e.target.value)}
                        className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                    >
                        <option value="">All Targets</option>
                        {ENTITY_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                )}
                <span className="text-zinc-500 text-sm self-center">
                    {filtered.length} template{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(t => (
                    <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 text-indigo-400">
                                <FileCode size={18} />
                                <span className="font-mono text-sm">{t.key}</span>
                            </div>
                            <button onClick={() => handleDelete(t.key)} className="text-zinc-600 hover:text-red-400">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{t.name}</h3>
                        <p className="text-sm text-zinc-500 mb-3 line-clamp-2">{t.description || 'No description'}</p>

                        <div className="flex items-center gap-2 mb-3">
                            <BindingBadge templateKey={t.key} />
                        </div>

                        <div className="flex items-center gap-4 text-xs text-zinc-500 border-t border-zinc-800 pt-3">
                             <span>Target: {t.subject_target}</span>
                             <span>Sections: {t.sections?.length || 0}</span>
                        </div>

                        <div className="mt-4">
                            <Link to={`/templates/${t.key}`} className="block w-full text-center py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm mb-1">
                                Edit Structure
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
