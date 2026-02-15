
import type { Entity } from '../../../lib/api';
import { ExternalLink } from 'lucide-react';
import { getRecordValue } from '../utils/record-utils';
import { RecordLineItems } from './RecordLineItems';


interface RecordDetailSectionProps {
    config: any;
    entity: Entity;
}

export function RecordDetailSection({ config, entity }: RecordDetailSectionProps) {
    
    // Helper to get value using centralized util
    const getValue = (key: string) => getRecordValue(entity, key);

    // Render List (e.g. Work History)
    if (config.isList) {
        const listData = getValue(config.field);
        
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/30">
                     <h3 className="font-semibold text-zinc-100 uppercase tracking-wider text-sm">{config.title}</h3>
                </div>
                <div className="p-6">
                    {Array.isArray(listData) ? (
                        <div className="space-y-4">
                            {listData.map((item, i) => (
                                <div key={i} className="bg-zinc-800/50 p-3 rounded text-sm text-zinc-300">
                                    {/* Simple Key-Value dump for list items for now */}
                                    {Object.entries(item).map(([k, v]) => (
                                        <div key={k} className="flex justify-between">
                                            <span className="text-zinc-500 capitalize">{k}</span>
                                            <span>{String(v)}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-zinc-500 italic">No history available</div>
                    )}
                </div>
            </div>
        );
    }

    // Render Related Objects (Attribution)
    if (config.objects) {
         return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/30">
                     <h3 className="font-semibold text-zinc-100 uppercase tracking-wider text-sm">{config.title}</h3>
                </div>
                <div className="p-6 flex gap-4">
                    {config.objects.map((obj: any, i: number) => (
                         <div key={i} className="flex-1 bg-zinc-800/50 p-4 rounded border border-zinc-700/50 text-center">
                            <div className="text-xs text-zinc-500 mb-1">{obj.title}</div>
                            <div className="text-zinc-300 font-medium flex items-center justify-center gap-2">
                                {/* Placeholder for related entity lookup */}
                                <span>No Data</span>
                                <ExternalLink size={12} />
                            </div>
                         </div>
                    ))}
                </div>
            </div>
        )
    }

    // Render Line Items (Commerce)
    if (config.type === 'line_items') {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/30 flex justify-between items-center">
                     <h3 className="font-semibold text-zinc-100 uppercase tracking-wider text-sm">{config.title}</h3>
                </div>
                <div className="p-6">
                    <RecordLineItems record={entity} />
                </div>
            </div>
        );
    }

    // Render Key-Value Grid
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-800/30">
                 <h3 className="font-semibold text-zinc-100 uppercase tracking-wider text-sm">{config.title}</h3>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    {config.items?.map((item: any, i: number) => {
                        const val = getValue(item.field);
                        return (
                            <div key={i} className="flex flex-col">
                                <span className="text-xs text-zinc-500 uppercase font-medium mb-1">
                                    {item.field.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-zinc-200 text-sm font-medium break-words">
                                    {val ? String(val) : '-'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

