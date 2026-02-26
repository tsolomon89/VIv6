import {
    Type, Hash, Calendar, ToggleLeft, ListOrdered, Image, Link2, Database, Layers
} from 'lucide-react';

interface SchemaField {
    name: string;
    type: string;
    required?: boolean;
    ref_target?: string;
    dimension?: string;
    options?: string[];
}

interface SchemaFieldGroup {
    name: string;
    fields: SchemaField[];
}

interface SchemaDisplayProps {
    fieldGroups: any[]; // Accepts either canonical or seed format
}

// Normalize from any format to UI format
function normalizeFieldGroups(groups: any[]): SchemaFieldGroup[] {
    if (!groups || !Array.isArray(groups)) return [];

    return groups.map(group => ({
        name: group.name || group.nameFieldGroup || 'Unnamed Group',
        fields: (group.fields || group.fieldStructs || []).map((field: any) => ({
            name: field.name || field.nameField || '',
            type: field.type || field.inputType || 'text',
            required: field.required,
            ref_target: field.ref_target,
            dimension: field.dimension,
            options: field.options
        }))
    }));
}

// Map field type to icon
function getFieldTypeIcon(type: string) {
    const iconMap: Record<string, React.ElementType> = {
        'text': Type,
        'textarea': Type,
        'number': Hash,
        'currency': Hash,
        'percentage': Hash,
        'date': Calendar,
        'boolean': ToggleLeft,
        'select': ListOrdered,
        'multiselect': ListOrdered,
        'image': Image,
        'url': Link2,
        'email': Type,
        'phone': Type,
        'ref': Database,
        'Record': Database,
        'dimension': Layers,
        'virtual': Hash
    };
    return iconMap[type] || Type;
}

// Map type to user-friendly label
function getTypeLabel(type: string): string {
    const labelMap: Record<string, string> = {
        'text': 'Text',
        'textarea': 'Long Text',
        'number': 'Number',
        'currency': 'Currency',
        'percentage': 'Percentage',
        'date': 'Date',
        'boolean': 'Boolean',
        'select': 'Select',
        'multiselect': 'Multi-Select',
        'image': 'Image',
        'url': 'URL',
        'email': 'Email',
        'phone': 'Phone',
        'ref': 'Reference',
        'Record': 'Reference',
        'dimension': 'Dimension',
        'virtual': 'Virtual'
    };
    return labelMap[type] || type;
}

export function SchemaDisplay({ fieldGroups }: SchemaDisplayProps) {
    const normalizedGroups = normalizeFieldGroups(fieldGroups);

    if (normalizedGroups.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500">
                <Database size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No field groups defined</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {normalizedGroups.map((group, i) => (
                <div key={i} className="bg-zinc-800/50 rounded-lg overflow-hidden border border-zinc-700/50">
                    {/* Group Header */}
                    <div className="px-4 py-2.5 bg-zinc-800 border-b border-zinc-700/50">
                        <h3 className="text-sm font-medium text-zinc-200">
                            {group.name}
                        </h3>
                        <span className="text-xs text-zinc-500">
                            {group.fields.length} field{group.fields.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Fields */}
                    {group.fields.length > 0 ? (
                        <div className="divide-y divide-zinc-700/30">
                            {group.fields.map((field, j) => {
                                const Icon = getFieldTypeIcon(field.type);
                                return (
                                    <div key={j} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/30 transition-colors">
                                        {/* Type Icon */}
                                        <div className="p-1.5 bg-zinc-700/50 rounded text-indigo-400">
                                            <Icon size={12} />
                                        </div>

                                        {/* Field Name */}
                                        <span className="text-sm text-white flex-1 min-w-0 truncate">
                                            {field.name}
                                        </span>

                                        {/* Type Badge */}
                                        <span className="text-xs text-zinc-400 bg-zinc-700/50 px-2 py-0.5 rounded">
                                            {getTypeLabel(field.type)}
                                        </span>

                                        {/* Required Badge */}
                                        {field.required && (
                                            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                                                Required
                                            </span>
                                        )}

                                        {/* Reference Target */}
                                        {field.ref_target && (
                                            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                                                → {field.ref_target}
                                            </span>
                                        )}

                                        {/* Dimension */}
                                        {field.dimension && (
                                            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                {field.dimension}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="px-4 py-3 text-sm text-zinc-500 italic">
                            No fields in this group
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
