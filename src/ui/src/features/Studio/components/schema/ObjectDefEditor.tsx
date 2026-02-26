import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Plus, Database } from 'lucide-react';
import { api, type Entity } from '../../../../lib/api';
import { FieldGroupCard } from './FieldGroupCard';

// Types for the schema editor
export interface SchemaField {
    name: string;
    type: string;
    required?: boolean;
    summary?: string;
    options?: string[];
    ref_target?: string;
    dimension?: string;
    dependsOn?: string[];
}

export interface SchemaFieldGroup {
    name: string;
    fields: SchemaField[];
}

interface ObjectDefData {
    category?: string;
    icon?: string;
    is_system?: boolean;
    fieldGroups?: SchemaFieldGroup[];
}

// NOTE: Canonical format from inflateRecord uses different property names:
// - fieldGroupStructs (not fieldGroups), nameFieldGroup (not name)
// - fieldStructs (not fields), nameField (not name), inputType (not type)
// The normalizeFieldGroups() function handles both formats.

/**
 * Normalize field groups from any format (seed or canonical) to UI format
 */
function normalizeFieldGroups(groups: any[]): SchemaFieldGroup[] {
    return groups.map(group => ({
        name: group.name || group.nameFieldGroup || 'Unnamed Group',
        fields: (group.fields || group.fieldStructs || []).map((field: any) => ({
            name: field.name || field.nameField || '',
            type: field.type || field.inputType || 'text',
            required: field.required,
            summary: field.summary,
            options: field.options,
            ref_target: field.ref_target,
            dimension: field.dimension,
            dependsOn: field.dependsOn
        }))
    }));
}

export function ObjectDefEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [objectDef, setObjectDef] = useState<Entity | null>(null);
    const [fieldGroups, setFieldGroups] = useState<SchemaFieldGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

    // Load the object definition
    useEffect(() => {
        if (!id) return;

        const loadObjectDef = async () => {
            try {
                setLoading(true);
                const entity = await api.getEntity(id);
                setObjectDef(entity);

                const data = entity.data as unknown as ObjectDefData;
                const rawGroups = data?.fieldGroups || [];
                // Normalize from any format (seed or canonical) to UI format
                const groups = normalizeFieldGroups(rawGroups);
                setFieldGroups(groups);

                // Expand all groups by default
                setExpandedGroups(new Set(groups.map((_, i) => i)));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load object definition');
            } finally {
                setLoading(false);
            }
        };

        loadObjectDef();
    }, [id]);

    // Handle save
    const handleSave = async () => {
        if (!objectDef) return;

        try {
            setSaving(true);
            setError(null);

            const updatedData: ObjectDefData = {
                ...(objectDef.data as unknown as ObjectDefData),
                fieldGroups
            };

            await api.updateEntity(objectDef.id, {
                type: objectDef.type,
                slug: objectDef.slug,
                name: objectDef.name,
                description: objectDef.description,
                data: updatedData as any  // ObjectDefData has different structure than EntityData
            });

            setIsDirty(false);
            // Navigate back after successful save
            navigate(`/records/object_def/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // Field group operations
    const handleAddGroup = () => {
        const newGroup: SchemaFieldGroup = {
            name: `Group ${fieldGroups.length + 1}`,
            fields: []
        };
        setFieldGroups([...fieldGroups, newGroup]);
        setExpandedGroups(prev => new Set([...prev, fieldGroups.length]));
        setIsDirty(true);
    };

    const handleUpdateGroup = (index: number, updates: Partial<SchemaFieldGroup>) => {
        setFieldGroups(prev => {
            const newGroups = [...prev];
            newGroups[index] = { ...newGroups[index], ...updates };
            return newGroups;
        });
        setIsDirty(true);
    };

    const handleRemoveGroup = (index: number) => {
        setFieldGroups(prev => prev.filter((_, i) => i !== index));
        setIsDirty(true);
    };

    const handleMoveGroup = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= fieldGroups.length) return;

        setFieldGroups(prev => {
            const newGroups = [...prev];
            [newGroups[index], newGroups[newIndex]] = [newGroups[newIndex], newGroups[index]];
            return newGroups;
        });
        setIsDirty(true);
    };

    const toggleGroupExpanded = (index: number) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    // Field operations
    const handleAddField = (groupIndex: number, field: SchemaField) => {
        setFieldGroups(prev => {
            const newGroups = [...prev];
            newGroups[groupIndex] = {
                ...newGroups[groupIndex],
                fields: [...newGroups[groupIndex].fields, field]
            };
            return newGroups;
        });
        setIsDirty(true);
    };

    const handleUpdateField = (groupIndex: number, fieldIndex: number, field: SchemaField) => {
        setFieldGroups(prev => {
            const newGroups = [...prev];
            const newFields = [...newGroups[groupIndex].fields];
            newFields[fieldIndex] = field;
            newGroups[groupIndex] = { ...newGroups[groupIndex], fields: newFields };
            return newGroups;
        });
        setIsDirty(true);
    };

    const handleRemoveField = (groupIndex: number, fieldIndex: number) => {
        setFieldGroups(prev => {
            const newGroups = [...prev];
            const newFields = newGroups[groupIndex].fields.filter((_, i) => i !== fieldIndex);
            newGroups[groupIndex] = { ...newGroups[groupIndex], fields: newFields };
            return newGroups;
        });
        setIsDirty(true);
    };

    const handleMoveField = (groupIndex: number, fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= fieldGroups[groupIndex].fields.length) return;

        setFieldGroups(prev => {
            const newGroups = [...prev];
            const newFields = [...newGroups[groupIndex].fields];
            const [moved] = newFields.splice(fromIndex, 1);
            newFields.splice(toIndex, 0, moved);
            newGroups[groupIndex] = { ...newGroups[groupIndex], fields: newFields };
            return newGroups;
        });
        setIsDirty(true);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-zinc-950">
                <div className="text-zinc-500">Loading...</div>
            </div>
        );
    }

    if (!objectDef) {
        return (
            <div className="flex-1 flex items-center justify-center bg-zinc-950">
                <div className="text-red-400">Object definition not found</div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-zinc-950 min-h-0">
            {/* Header */}
            <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/records/object_def/${id}`)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Database size={24} className="text-indigo-400" />
                        <div>
                            <h1 className="text-lg font-semibold text-white">
                                Edit Schema: {objectDef.name}
                            </h1>
                            <p className="text-sm text-zinc-500">
                                Manage field groups and fields for this object type
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(`/records/object_def/${id}`)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={16} />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty || saving}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isDirty && !saving
                                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                        }`}
                    >
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            {/* Error message */}
            {error && (
                <div className="mx-6 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* Field Groups */}
                    {fieldGroups.map((group, groupIndex) => (
                        <FieldGroupCard
                            key={groupIndex}
                            group={group}
                            groupIndex={groupIndex}
                            isExpanded={expandedGroups.has(groupIndex)}
                            onToggleExpand={() => toggleGroupExpanded(groupIndex)}
                            onUpdateGroup={(updates) => handleUpdateGroup(groupIndex, updates)}
                            onRemoveGroup={() => handleRemoveGroup(groupIndex)}
                            onMoveGroup={(dir) => handleMoveGroup(groupIndex, dir)}
                            onAddField={(field) => handleAddField(groupIndex, field)}
                            onUpdateField={(fieldIndex, field) => handleUpdateField(groupIndex, fieldIndex, field)}
                            onRemoveField={(fieldIndex) => handleRemoveField(groupIndex, fieldIndex)}
                            onMoveField={(fromIndex, toIndex) => handleMoveField(groupIndex, fromIndex, toIndex)}
                            isFirst={groupIndex === 0}
                            isLast={groupIndex === fieldGroups.length - 1}
                        />
                    ))}

                    {/* Add Group Button */}
                    <button
                        onClick={handleAddGroup}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors"
                    >
                        <Plus size={18} />
                        Add Field Group
                    </button>

                    {/* Empty state */}
                    {fieldGroups.length === 0 && (
                        <div className="text-center py-12">
                            <Database size={48} className="mx-auto text-zinc-600 mb-4" />
                            <h3 className="text-lg font-medium text-zinc-400 mb-2">No Field Groups</h3>
                            <p className="text-sm text-zinc-500 mb-4">
                                Add field groups to organize the fields for this object type.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
