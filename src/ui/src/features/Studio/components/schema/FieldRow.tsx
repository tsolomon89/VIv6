import { useState } from 'react';
import {
    Trash2, ChevronUp, ChevronDown, Settings,
    Type, Hash, Calendar, ToggleLeft, ListOrdered, Image, Link2, Database
} from 'lucide-react';
import { FieldConfigPanel } from './FieldConfigPanel';
import type { SchemaField } from './ObjectDefEditor';

// Field types supported
export const FIELD_TYPES = [
    { value: 'text', label: 'Text', icon: Type },
    { value: 'textarea', label: 'Long Text', icon: Type },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'currency', label: 'Currency', icon: Hash },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'boolean', label: 'Boolean', icon: ToggleLeft },
    { value: 'select', label: 'Select', icon: ListOrdered },
    { value: 'multiselect', label: 'Multi-Select', icon: ListOrdered },
    { value: 'image', label: 'Image', icon: Image },
    { value: 'url', label: 'URL', icon: Link2 },
    { value: 'email', label: 'Email', icon: Type },
    { value: 'phone', label: 'Phone', icon: Type },
    { value: 'ref', label: 'Reference', icon: Database },
    { value: 'dimension', label: 'Dimension', icon: Database },
    { value: 'percentage', label: 'Percentage', icon: Hash },
    { value: 'virtual', label: 'Virtual', icon: Hash },
] as const;

interface FieldRowProps {
    field: SchemaField;
    fieldIndex: number;
    onUpdate: (field: SchemaField) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export function FieldRow({
    field,
    fieldIndex: _fieldIndex,
    onUpdate,
    onRemove,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast
}: FieldRowProps) {
    const [showConfig, setShowConfig] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Handle both seed format (type) and canonical format (inputType)
    const normalizedType = field.type || (field as any).inputType || 'text';
    const fieldType = FIELD_TYPES.find(t => t.value === normalizedType) || FIELD_TYPES[0];
    const TypeIcon = fieldType.icon;

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...field, name: e.target.value });
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value;
        const updates: Partial<SchemaField> = { type: newType };

        // Clear type-specific fields when changing type
        if (newType !== 'select' && newType !== 'multiselect') {
            delete updates.options;
        }
        if (newType !== 'ref') {
            delete updates.ref_target;
        }
        if (newType !== 'dimension') {
            delete updates.dimension;
            delete updates.dependsOn;
        }

        onUpdate({ ...field, ...updates });
    };

    const handleRequiredToggle = () => {
        onUpdate({ ...field, required: !field.required });
    };

    const handleDelete = () => {
        if (field.name.trim()) {
            setShowDeleteConfirm(true);
        } else {
            onRemove();
        }
    };

    return (
        <div className="bg-zinc-800/50 rounded-lg overflow-hidden">
            {/* Main row */}
            <div className="flex items-center gap-2 px-3 py-2">
                {/* Move buttons */}
                <div className="flex flex-col gap-0.5 text-zinc-500">
                    <button
                        onClick={onMoveUp}
                        disabled={isFirst}
                        className={`p-0.5 rounded transition-colors ${
                            isFirst ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-700 hover:text-white'
                        }`}
                        title="Move up"
                    >
                        <ChevronUp size={12} />
                    </button>
                    <button
                        onClick={onMoveDown}
                        disabled={isLast}
                        className={`p-0.5 rounded transition-colors ${
                            isLast ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-700 hover:text-white'
                        }`}
                        title="Move down"
                    >
                        <ChevronDown size={12} />
                    </button>
                </div>

                {/* Type icon */}
                <div className="p-1.5 bg-zinc-700 rounded text-indigo-400">
                    <TypeIcon size={14} />
                </div>

                {/* Field name input */}
                <input
                    type="text"
                    value={field.name}
                    onChange={handleNameChange}
                    placeholder="Field name"
                    className="flex-1 min-w-0 px-2 py-1 text-sm bg-transparent border border-transparent hover:border-zinc-600 focus:border-indigo-500 rounded text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />

                {/* Type select */}
                <select
                    value={field.type}
                    onChange={handleTypeChange}
                    className="px-2 py-1 text-xs bg-zinc-700 border border-zinc-600 rounded text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                    {FIELD_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>

                {/* Required toggle */}
                <button
                    onClick={handleRequiredToggle}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        field.required
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-zinc-700 text-zinc-500 border border-zinc-600 hover:text-zinc-300'
                    }`}
                    title={field.required ? 'Required field' : 'Optional field'}
                >
                    {field.required ? 'Required' : 'Optional'}
                </button>

                {/* Config button */}
                <button
                    onClick={() => setShowConfig(!showConfig)}
                    className={`p-1.5 rounded transition-colors ${
                        showConfig
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
                    title="Advanced settings"
                >
                    <Settings size={14} />
                </button>

                {/* Delete button */}
                <button
                    onClick={handleDelete}
                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded transition-colors"
                    title="Delete field"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm && (
                <div className="px-3 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center justify-between">
                    <p className="text-xs text-red-400">
                        Delete "{field.name}"?
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onRemove();
                                setShowDeleteConfirm(false);
                            }}
                            className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Config panel */}
            {showConfig && (
                <FieldConfigPanel
                    field={field}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
}
