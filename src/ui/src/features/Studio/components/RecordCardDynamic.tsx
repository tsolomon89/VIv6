import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Entity } from '../../../lib/api';
import type { RecordCardConfig } from '../config/studio-config';
import { RecordTileDynamic } from './RecordTileDynamic';

interface RecordCardDynamicProps {
    config: RecordCardConfig;
    entity: Entity;
    definition?: Entity;
    isEditing?: boolean;
    onChange?: (field: string, value: any) => void;
}

export function RecordCardDynamic({ config, entity, definition, isEditing, onChange }: RecordCardDynamicProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
            {/* Header */}
            <div 
                className="flex items-center justify-between px-5 py-4 bg-zinc-800/30 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                onClick={() => config.isExpandable && setIsExpanded(!isExpanded)}
            >
                <h3 className="font-semibold text-zinc-100 uppercase tracking-wider text-sm">
                    {config.title}
                </h3>
                {config.isExpandable && (
                    <button className="text-zinc-500 hover:text-zinc-300">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                )}
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="flex flex-col">
                    {/* Render predefined tiles */}
                    {config.tiles?.map((tileConfig, i) => (
                        <RecordTileDynamic 
                            key={i} 
                            config={tileConfig} 
                            entity={entity} 
                            definition={definition} 
                            isEditing={isEditing}
                            onChange={onChange}
                        />
                    ))}
                    
                    {/* Fallback for empty cards */}
                    {(!config.tiles || config.tiles.length === 0) && (
                        <div className="p-6 text-center text-zinc-500 text-sm italic">
                            No details available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
