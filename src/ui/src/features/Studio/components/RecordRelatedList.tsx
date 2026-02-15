import { useEffect, useState } from 'react';
import type { Entity } from '../../../lib/api';
import { api } from '../../../lib/api';
import type { RecordCardConfig } from '../config/studio-config';
import { RecordTileDynamic } from './RecordTileDynamic';
import { Users, ChevronUp, ChevronDown } from 'lucide-react';

interface RecordRelatedListProps {
    config: RecordCardConfig;
    parentRecord: Entity;
}

export function RecordRelatedList({ config, parentRecord }: RecordRelatedListProps) {
    const [items, setItems] = useState<Entity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        if (!config.relation) return;
        
        setIsLoading(true);
        api.listEntities(config.relation.targetType)
            .then(all => {
                // Filter
                const filtered = all.filter((e: any) => {
                    const fkVal = e.data?.[config.relation!.foreignKey];
                    // Handle "Ref" which might be object or ID. Usually ID in this system.
                    return fkVal === parentRecord.id;
                });
                
                // Sort
                if (config.relation!.sortBy === 'persona_power') {
                     const powerMap: Record<string, number> = {
                         'decision_maker': 3,
                         'influencer': 2,
                         'end_user': 1,
                         'gatekeeper': 1
                     };
                     filtered.sort((a: any, b: any) => {
                         const pA = a.data?.Persona || '';
                         const pB = b.data?.Persona || '';
                         return (powerMap[pB] || 0) - (powerMap[pA] || 0); // Descending
                     });
                }
                
                setItems(filtered);
            })
            .catch(err => console.error("Failed to load related items", err))
            .finally(() => setIsLoading(false));
    }, [config.relation, parentRecord.id]);

    if (!config.relation) return null;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
             {/* Header */}
            <div 
                className="flex items-center justify-between px-5 py-4 bg-zinc-800/30 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                onClick={() => config.isExpandable && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-zinc-400" />
                    <h3 className="font-semibold text-zinc-100 uppercase tracking-wider text-sm">
                        {config.title} ({items.length})
                    </h3>
                </div>
                {config.isExpandable && (
                    <button className="text-zinc-500 hover:text-zinc-300">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className="flex flex-col divide-y divide-zinc-800/50">
                    {isLoading ? (
                        <div className="p-4 text-xs text-zinc-500 text-center">Loading...</div>
                    ) : items.length === 0 ? (
                         <div className="p-4 text-xs text-zinc-500 text-center italic">No related records found.</div>
                    ) : (
                        items.map(item => (
                            <RecordTileDynamic 
                                key={item.id} 
                                config={config.relation!.tile} 
                                entity={item} 
                                // Definition? We might need it for field types, but currently dynamic tile guesses well.
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
