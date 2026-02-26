import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Pencil, Check, X } from 'lucide-react';
import { FieldRow } from './FieldRow';
import { AddFieldRow } from './AddFieldRow';
import type { SchemaField, SchemaFieldGroup } from './ObjectDefEditor';

interface FieldGroupCardProps {
    group: SchemaFieldGroup;
    groupIndex: number;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onUpdateGroup: (updates: Partial<SchemaFieldGroup>) => void;
    onRemoveGroup: () => void;
    onMoveGroup: (direction: 'up' | 'down') => void;
    onAddField: (field: SchemaField) => void;
    onUpdateField: (fieldIndex: number, field: SchemaField) => void;
    onRemoveField: (fieldIndex: number) => void;
    onMoveField: (fromIndex: number, toIndex: number) => void;
    isFirst: boolean;
    isLast: boolean;
}

export function FieldGroupCard({
    group,
    groupIndex: _groupIndex,
    isExpanded,
    onToggleExpand,
    onUpdateGroup,
    onRemoveGroup,
    onMoveGroup,
    onAddField,
    onUpdateField,
    onRemoveField,
    onMoveField,
    isFirst,
    isLast
}: FieldGroupCardProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(group.name);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSaveName = () => {
        if (editedName.trim()) {
            onUpdateGroup({ name: editedName.trim() });
        } else {
            setEditedName(group.name);
        }
        setIsEditingName(false);
    };

    const handleCancelNameEdit = () => {
        setEditedName(group.name);
        setIsEditingName(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveName();
        } else if (e.key === 'Escape') {
            handleCancelNameEdit();
        }
    };

    const handleDelete = () => {
        if (group.fields.length > 0) {
            setShowDeleteConfirm(true);
        } else {
            onRemoveGroup();
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50">
                {/* Drag handle / Move buttons */}
                <div className="flex items-center gap-1 text-zinc-500">
                    <button
                        onClick={() => onMoveGroup('up')}
                        disabled={isFirst}
                        className={`p-1 rounded transition-colors ${
                            isFirst ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-700 hover:text-white'
                        }`}
                        title="Move up"
                    >
                        <ChevronUp size={16} />
                    </button>
                    <button
                        onClick={() => onMoveGroup('down')}
                        disabled={isLast}
                        className={`p-1 rounded transition-colors ${
                            isLast ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-700 hover:text-white'
                        }`}
                        title="Move down"
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>

                {/* Group name */}
                <div className="flex-1 flex items-center gap-2">
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="px-2 py-1 text-sm font-medium bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:border-indigo-500"
                                autoFocus
                            />
                            <button
                                onClick={handleSaveName}
                                className="p-1 text-emerald-400 hover:bg-zinc-700 rounded"
                            >
                                <Check size={14} />
                            </button>
                            <button
                                onClick={handleCancelNameEdit}
                                className="p-1 text-zinc-400 hover:bg-zinc-700 rounded"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditingName(true)}
                            className="flex items-center gap-2 text-sm font-medium text-white hover:text-indigo-400 transition-colors"
                        >
                            {group.name}
                            <Pencil size={12} className="opacity-50" />
                        </button>
                    )}
                    <span className="text-xs text-zinc-500">
                        ({group.fields.length} field{group.fields.length !== 1 ? 's' : ''})
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDelete}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded transition-colors"
                        title="Delete group"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={onToggleExpand}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                    >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm && (
                <div className="px-4 py-3 bg-red-500/10 border-t border-red-500/20 flex items-center justify-between">
                    <p className="text-sm text-red-400">
                        Delete this group and all {group.fields.length} fields?
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onRemoveGroup();
                                setShowDeleteConfirm(false);
                            }}
                            className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            {isExpanded && (
                <div className="border-t border-zinc-800">
                    {/* Indigo accent bar */}
                    <div className="flex">
                        <div className="w-1 bg-indigo-500" />
                        <div className="flex-1 p-4 space-y-2">
                            {/* Fields */}
                            {group.fields.map((field, fieldIndex) => (
                                <FieldRow
                                    key={fieldIndex}
                                    field={field}
                                    fieldIndex={fieldIndex}
                                    onUpdate={(updatedField) => onUpdateField(fieldIndex, updatedField)}
                                    onRemove={() => onRemoveField(fieldIndex)}
                                    onMoveUp={() => onMoveField(fieldIndex, fieldIndex - 1)}
                                    onMoveDown={() => onMoveField(fieldIndex, fieldIndex + 1)}
                                    isFirst={fieldIndex === 0}
                                    isLast={fieldIndex === group.fields.length - 1}
                                />
                            ))}

                            {/* Add field */}
                            <AddFieldRow onAddField={onAddField} />

                            {/* Empty state */}
                            {group.fields.length === 0 && (
                                <div className="text-center py-6 text-zinc-500 text-sm">
                                    No fields in this group. Add a field to get started.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
