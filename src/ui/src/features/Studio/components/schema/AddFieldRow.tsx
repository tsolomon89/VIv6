import { useState } from 'react';
import { Plus, Library, X } from 'lucide-react';
import { FIELD_TYPES } from './FieldRow';
import { FieldLibraryPicker } from './FieldLibraryPicker';
import type { SchemaField } from './ObjectDefEditor';

interface AddFieldRowProps {
    onAddField: (field: SchemaField) => void;
}

export function AddFieldRow({ onAddField }: AddFieldRowProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldType, setNewFieldType] = useState('text');

    const handleAddInline = () => {
        if (newFieldName.trim()) {
            onAddField({
                name: newFieldName.trim(),
                type: newFieldType
            });
            setNewFieldName('');
            setNewFieldType('text');
            setIsAdding(false);
        }
    };

    const handleImportFromLibrary = (field: SchemaField) => {
        onAddField(field);
        setShowLibrary(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddInline();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
            setNewFieldName('');
        }
    };

    if (isAdding) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/30 rounded-lg border border-dashed border-zinc-700">
                {/* Field name input */}
                <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Field name"
                    className="flex-1 min-w-0 px-2 py-1 text-sm bg-zinc-800 border border-zinc-600 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    autoFocus
                />

                {/* Type select */}
                <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                    className="px-2 py-1 text-xs bg-zinc-700 border border-zinc-600 rounded text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                    {FIELD_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>

                {/* Add button */}
                <button
                    onClick={handleAddInline}
                    disabled={!newFieldName.trim()}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        newFieldName.trim()
                            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                            : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    }`}
                >
                    Add
                </button>

                {/* Cancel button */}
                <button
                    onClick={() => {
                        setIsAdding(false);
                        setNewFieldName('');
                    }}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors"
                >
                    <Plus size={14} />
                    Add Field
                </button>

                <button
                    onClick={() => setShowLibrary(true)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors"
                    title="Import from field library"
                >
                    <Library size={14} />
                    From Library
                </button>
            </div>

            {/* Field Library Modal */}
            {showLibrary && (
                <FieldLibraryPicker
                    onSelect={handleImportFromLibrary}
                    onClose={() => setShowLibrary(false)}
                />
            )}
        </>
    );
}
