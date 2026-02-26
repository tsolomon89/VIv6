import { useState, useEffect } from 'react';
import { X, Search, Database, Import } from 'lucide-react';
import { api, type Entity } from '../../../../lib/api';
import type { SchemaField } from './ObjectDefEditor';

interface FieldLibraryPickerProps {
    onSelect: (field: SchemaField) => void;
    onClose: () => void;
}

interface FieldDefData {
    type?: string;
    required?: boolean;
    summary?: string;
    options?: string[];
    ref_target?: string;
    dimension?: string;
}

export function FieldLibraryPicker({ onSelect, onClose }: FieldLibraryPickerProps) {
    const [fieldDefs, setFieldDefs] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const loadFieldDefs = async () => {
            try {
                const defs = await api.listEntities('field_def');
                setFieldDefs(defs);
            } catch (err) {
                console.warn('Failed to load field definitions:', err);
            } finally {
                setLoading(false);
            }
        };

        loadFieldDefs();
    }, []);

    const filteredDefs = fieldDefs.filter(def =>
        def.name.toLowerCase().includes(search.toLowerCase()) ||
        def.slug.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (def: Entity) => {
        const data = def.data as FieldDefData;

        // Clone the field definition into a SchemaField
        const field: SchemaField = {
            name: def.name,
            type: data.type || 'text',
            required: data.required,
            summary: data.summary || def.description,
            options: data.options,
            ref_target: data.ref_target,
            dimension: data.dimension,
        };

        onSelect(field);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700 bg-zinc-800">
                    <div className="flex items-center gap-2">
                        <Database size={18} className="text-indigo-400" />
                        <h3 className="text-sm font-semibold text-white">Field Library</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-zinc-800">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search fields..."
                            className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                        <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                            Loading...
                        </div>
                    ) : filteredDefs.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <Database size={32} className="mx-auto text-zinc-600 mb-2" />
                            <p className="text-sm text-zinc-500">
                                {search ? 'No matching fields found' : 'No fields in library'}
                            </p>
                            <p className="text-xs text-zinc-600 mt-1">
                                Create field_def records to build your reusable field library
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800">
                            {filteredDefs.map(def => {
                                const data = def.data as FieldDefData;
                                return (
                                    <button
                                        key={def.id}
                                        onClick={() => handleSelect(def)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white">
                                                    {def.name}
                                                </span>
                                                <span className="px-1.5 py-0.5 text-xs bg-zinc-700 text-zinc-400 rounded">
                                                    {data.type || 'text'}
                                                </span>
                                                {data.required && (
                                                    <span className="px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                                                        required
                                                    </span>
                                                )}
                                            </div>
                                            {(data.summary || def.description) && (
                                                <p className="mt-0.5 text-xs text-zinc-500 truncate">
                                                    {data.summary || def.description}
                                                </p>
                                            )}
                                        </div>
                                        <Import size={16} className="text-zinc-500" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-zinc-700 bg-zinc-800/50">
                    <p className="text-xs text-zinc-500">
                        Select a field to add a copy to this group. Changes won't affect the library.
                    </p>
                </div>
            </div>
        </div>
    );
}
