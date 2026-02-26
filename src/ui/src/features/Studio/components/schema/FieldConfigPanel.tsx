import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { api, type Entity } from '../../../../lib/api';
import type { SchemaField } from './ObjectDefEditor';

interface FieldConfigPanelProps {
    field: SchemaField;
    onUpdate: (field: SchemaField) => void;
}

export function FieldConfigPanel({ field, onUpdate }: FieldConfigPanelProps) {
    const [objectDefs, setObjectDefs] = useState<Entity[]>([]);
    const [dimensions, setDimensions] = useState<string[]>([]);
    const [newOption, setNewOption] = useState('');

    // Load object definitions for ref_target dropdown
    useEffect(() => {
        api.listEntities('object_def').then(setObjectDefs).catch(() => []);
    }, []);

    // Load available dimensions
    useEffect(() => {
        api.listDimensionValues().then(values => {
            const uniqueDims = [...new Set(values.map(v => v.dimension))];
            setDimensions(uniqueDims);
        }).catch(() => []);
    }, []);

    const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate({ ...field, summary: e.target.value });
    };

    const handleRefTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate({ ...field, ref_target: e.target.value || undefined });
    };

    const handleDimensionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdate({ ...field, dimension: e.target.value || undefined });
    };

    const handleAddOption = () => {
        if (newOption.trim()) {
            const currentOptions = field.options || [];
            if (!currentOptions.includes(newOption.trim())) {
                onUpdate({ ...field, options: [...currentOptions, newOption.trim()] });
            }
            setNewOption('');
        }
    };

    const handleRemoveOption = (optionToRemove: string) => {
        const currentOptions = field.options || [];
        onUpdate({ ...field, options: currentOptions.filter(opt => opt !== optionToRemove) });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddOption();
        }
    };

    const showRefTarget = field.type === 'ref';
    const showDimension = field.type === 'dimension';
    const showOptions = field.type === 'select' || field.type === 'multiselect';

    return (
        <div className="px-3 py-3 bg-zinc-900/50 border-t border-zinc-700 space-y-3">
            {/* Summary/Description */}
            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Description
                </label>
                <textarea
                    value={field.summary || ''}
                    onChange={handleSummaryChange}
                    placeholder="Brief description of this field"
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
            </div>

            {/* Reference target */}
            {showRefTarget && (
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Reference Target
                    </label>
                    <select
                        value={field.ref_target || ''}
                        onChange={handleRefTargetChange}
                        className="w-full px-2 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">Select object type...</option>
                        {objectDefs.map(def => (
                            <option key={def.id} value={def.slug}>
                                {def.name} ({def.slug})
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-zinc-500">
                        The type of record this field links to
                    </p>
                </div>
            )}

            {/* Dimension select */}
            {showDimension && (
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Dimension
                    </label>
                    <select
                        value={field.dimension || ''}
                        onChange={handleDimensionChange}
                        className="w-full px-2 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">Select dimension...</option>
                        {dimensions.map(dim => (
                            <option key={dim} value={dim}>
                                {dim}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-zinc-500">
                        The taxonomy dimension for this field's values
                    </p>
                </div>
            )}

            {/* Options for select/multiselect */}
            {showOptions && (
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Options
                    </label>

                    {/* Option chips */}
                    {(field.options && field.options.length > 0) && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {field.options.map((option, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-zinc-700 text-zinc-300 rounded"
                                >
                                    {option}
                                    <button
                                        onClick={() => handleRemoveOption(option)}
                                        className="text-zinc-400 hover:text-red-400 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Add option input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add option..."
                            className="flex-1 px-2 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                            onClick={handleAddOption}
                            disabled={!newOption.trim()}
                            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                                newOption.trim()
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                    : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                            }`}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                        {field.type === 'multiselect' ? 'Users can select multiple options' : 'Users can select one option'}
                    </p>
                </div>
            )}
        </div>
    );
}
