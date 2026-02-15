import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Info } from 'lucide-react';
import { api } from '../lib/api';
import { ENTITY_TYPES } from '../lib/constants';
const CARDINALITIES = ['one', 'many'];
const SLOTS = ['start', 'end', 'free'];

function SectionEditor({ section, index, onChange, onRemove }: {
    section: any;
    index: number;
    onChange: (index: number, section: any) => void;
    onRemove: (index: number) => void;
}) {
    const binding = section.binding || { kind: 'self' };

    const updateBinding = (updates: any) => {
        onChange(index, { ...section, binding: { ...binding, ...updates } });
    };

    const updatePlacement = (slot: string) => {
        onChange(index, { ...section, placement: { ...section.placement, slot } });
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-3">
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-zinc-300">Section {index + 1}</span>
                <button onClick={() => onRemove(index)} className="text-xs text-zinc-500 hover:text-red-400">Remove</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Presentation Key</label>
                    <input
                        value={section.presentationKey || ''}
                        onChange={e => onChange(index, { ...section, presentationKey: e.target.value })}
                        placeholder="e.g., hero-v1, feature-grid-v1"
                        className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white font-mono"
                    />
                </div>
                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Placement</label>
                    <select
                        value={section.placement?.slot || 'free'}
                        onChange={e => updatePlacement(e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                    >
                        {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="border-t border-zinc-800 pt-3">
                <label className="block text-xs text-zinc-500 mb-2">Binding</label>
                <div className="flex gap-3 items-start">
                    <select
                        value={binding.kind}
                        onChange={e => {
                            if (e.target.value === 'self') {
                                onChange(index, { ...section, binding: { kind: 'self' } });
                            } else {
                                onChange(index, { ...section, binding: { kind: 'related', target: 'feature', cardinality: 'many' } });
                            }
                        }}
                        className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                    >
                        <option value="self">self</option>
                        <option value="related">related</option>
                    </select>

                    {binding.kind === 'related' && (
                        <>
                            <select
                                value={binding.target || 'feature'}
                                onChange={e => updateBinding({ target: e.target.value })}
                                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                            >
                                {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select
                                value={binding.cardinality || 'many'}
                                onChange={e => updateBinding({ cardinality: e.target.value })}
                                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
                            >
                                {CARDINALITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export function TemplateEditor() {
    const { key } = useParams();
    const navigate = useNavigate();
    const isNew = key === 'new';

    const [formData, setFormData] = useState({
        key: '',
        name: '',
        description: '',
        subject_target: 'brand',
        subject_cardinality: 'one',
        sections: [] as any[]
    });

    // JSON editor state
    const [showJson, setShowJson] = useState(false);
    const [jsonText, setJsonText] = useState('[]');
    const [jsonError, setJsonError] = useState<string | null>(null);

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isNew && key) {
            setLoading(true);
            api.getTemplate(key)
                .then(data => {
                    // Ensure description is string
                    const safeData = { ...data, description: data.description || '' };
                    setFormData(safeData);
                    setJsonText(JSON.stringify(data.sections, null, 2));
                })
                .catch(err => setError(err.error || 'Failed to load'))
                .finally(() => setLoading(false));
        }
    }, [key, isNew]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleJsonChange = (text: string) => {
        setJsonText(text);
        try {
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) throw new Error('Sections must be an array');
            setJsonError(null);
            setFormData(prev => ({ ...prev, sections: parsed }));
        } catch (err) {
            setJsonError((err as Error).message);
        }
    };

    const syncJsonFromSections = () => {
        setJsonText(JSON.stringify(formData.sections, null, 2));
        setJsonError(null);
    };

    const handleSectionChange = (index: number, section: any) => {
        const updated = [...formData.sections];
        updated[index] = section;
        setFormData(prev => ({ ...prev, sections: updated }));
    };

    const handleSectionRemove = (index: number) => {
        setFormData(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }));
    };

    const addSection = () => {
        const newSection = {
            schemaVersion: 1,
            id: crypto.randomUUID(),
            placement: { slot: 'free' },
            binding: { kind: 'self' },
            presentationKey: '',
        };
        setFormData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (showJson && jsonError) return;

        setSaving(true);
        setError(null);

        try {
            if (isNew) {
                await api.createTemplate(formData);
                navigate('/templates');
            } else {
                await api.updateTemplate(key as string, formData);
                navigate('/templates');
            }
        } catch (err) {
            setError((err as any).error || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-zinc-400">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/templates" className="p-2 hover:bg-zinc-800 rounded-lg">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold">{isNew ? 'New Template' : formData.key}</h1>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex gap-3 text-red-200">
                    <AlertCircle /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Meta */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Key (Binding Signature)</label>
                        <input
                            value={formData.key}
                            onChange={e => handleChange('key', e.target.value)}
                            disabled={!isNew}
                            placeholder="e.g., self.hero.v1 or related.feature.many.grid.v1"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono"
                        />
                        {isNew && (
                            <p className="mt-1 text-xs text-zinc-500 flex items-center gap-1">
                                <Info size={12} />
                                Format: self.&lt;layout&gt;.&lt;version&gt; or related.&lt;target&gt;.&lt;cardinality&gt;.&lt;layout&gt;.&lt;version&gt;
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                        <input
                            value={formData.name}
                            onChange={e => handleChange('name', e.target.value)}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                        <input
                            value={formData.description}
                            onChange={e => handleChange('description', e.target.value)}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Subject Target</label>
                        <select
                            value={formData.subject_target}
                            onChange={e => handleChange('subject_target', e.target.value)}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        >
                            {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Subject Cardinality</label>
                        <select
                            value={formData.subject_cardinality}
                            onChange={e => handleChange('subject_cardinality', e.target.value)}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                        >
                            {CARDINALITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Sections */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-medium text-zinc-400">
                            Sections ({formData.sections.length})
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => { setShowJson(!showJson); if (!showJson) syncJsonFromSections(); }}
                                className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400"
                            >
                                {showJson ? 'Visual Editor' : 'JSON Editor'}
                            </button>
                            {!showJson && (
                                <button
                                    type="button"
                                    onClick={addSection}
                                    className="text-xs px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
                                >
                                    + Add Section
                                </button>
                            )}
                        </div>
                    </div>

                    {showJson ? (
                        <div>
                            {jsonError && <p className="text-red-400 text-xs mb-2">{jsonError}</p>}
                            <textarea
                                value={jsonText}
                                onChange={e => handleJsonChange(e.target.value)}
                                className={`w-full h-96 bg-zinc-950 font-mono text-xs p-4 rounded-lg border ${jsonError ? 'border-red-500' : 'border-zinc-800'} focus:outline-none`}
                            />
                        </div>
                    ) : (
                        <div>
                            {formData.sections.length === 0 ? (
                                <p className="text-zinc-500 text-sm py-4 text-center">No sections. Click "+ Add Section" to start.</p>
                            ) : (
                                formData.sections.map((section, i) => (
                                    <SectionEditor
                                        key={section.id || i}
                                        section={section}
                                        index={i}
                                        onChange={handleSectionChange}
                                        onRemove={handleSectionRemove}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving || (showJson && !!jsonError)}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium"
                    >
                        <Save size={18} /> {saving ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </form>
        </div>
    );
}
