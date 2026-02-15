
import React, { useState, useEffect } from 'react';
import { apiClient, Entity } from '../../../api/client';
import { EntityType } from '../../../../../core/schema/definitions';
import { Link, Check } from 'lucide-react';

interface RelationshipPickerProps {
    targetType: EntityType;
    multiple?: boolean;
    value?: string[]; // Array of IDs
    onChange: (ids: string[]) => void;
}

export const RelationshipPicker: React.FC<RelationshipPickerProps> = ({ targetType, multiple = true, value = [], onChange }) => {
    const [options, setOptions] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadOptions();
    }, [targetType]);

    const loadOptions = async () => {
        setLoading(true);
        try {
            // Need API to support filtering by type.
            // Client.listEntities matches signature listEntities(type?, brandId?)
            // We can pass targetType as string.
            const data = await apiClient.listEntities(targetType); 
            setOptions(data);
        } catch (e) {
            console.error("Failed to load options", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id: string) => {
        if (multiple) {
            if (value.includes(id)) {
                onChange(value.filter(v => v !== id));
            } else {
                onChange([...value, id]);
            }
        } else {
            onChange([id]); // Single replace
        }
    };

    const filteredOptions = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="bg-neutral-800 rounded-lg p-3 border border-neutral-700">
            <div className="flex items-center gap-2 mb-3 bg-neutral-900 p-2 rounded border border-neutral-800">
                <Link size={14} className="text-neutral-500" />
                <input 
                    type="text" 
                    placeholder={`Search ${targetType}...`} 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-transparent outline-none text-sm w-full text-white placeholder-neutral-600"
                />
            </div>
            
            <div className="max-h-[200px] overflow-y-auto space-y-1">
                {loading && <div className="text-xs text-neutral-500 text-center py-2">Loading...</div>}
                
                {!loading && filteredOptions.map(opt => {
                    const isSelected = value.includes(opt.id);
                    return (
                        <div 
                            key={opt.id}
                            onClick={() => toggleSelection(opt.id)}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer text-sm transition ${isSelected ? 'bg-blue-600/20 text-blue-200 border border-blue-500/30' : 'hover:bg-neutral-700 text-neutral-300'}`}
                        >
                            <span>{opt.name}</span>
                            {isSelected && <Check size={14} className="text-blue-400" />}
                        </div>
                    );
                })}

                {!loading && filteredOptions.length === 0 && (
                    <div className="text-xs text-neutral-500 text-center py-2">No {targetType}s found.</div>
                )}
            </div>
        </div>
    );
};
