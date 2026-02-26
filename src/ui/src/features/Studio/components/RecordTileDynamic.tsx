import type { Entity } from '../../../lib/api';
import type { RecordTileConfig } from '../config/studio-config';
import { User, Mail, Phone, Link as LinkIcon, Activity } from 'lucide-react';
import { getRecordValueAsString } from '../utils/record-utils';
import { RecordField } from './RecordField';
import { RecordTileProjection } from './RecordTileProjection';

interface RecordTileDynamicProps {
    config: RecordTileConfig;
    entity: Entity;
    definition?: Entity;
    isEditing?: boolean;
    onChange?: (field: string, value: any) => void;
}

export function RecordTileDynamic({ config, entity, definition, isEditing, onChange }: RecordTileDynamicProps) {
    // Default Icon based on field content heuristics (can be improved with explicit config)
    const getIcon = () => {
        if (config.title.some(t => t.includes('email'))) return <Mail size={18} />;
        if (config.title.some(t => t.includes('phone'))) return <Phone size={18} />;
        return <Activity size={18} />;
    };

    const renderFields = (keys: string[], className?: string) => {
        if (!keys || keys.length === 0) return null;
        return (
            <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
                {keys.map((key, i) => (
                    <div key={key} className="flex items-center gap-1.5 min-w-0">
                        <RecordField 
                            entity={entity} 
                            field={key} 
                            definition={definition} 
                            isEditing={isEditing}
                            onChange={onChange}
                        />
                         {i < keys.length - 1 && !isEditing && <span className="text-zinc-600 text-[10px]">•</span>}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex items-start gap-4 p-4 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors">
            {config.type === 'projection' && config.projection ? (
                <div className="w-full">
                    <RecordTileProjection config={config.projection} entity={entity} />
                </div>
            ) : (
                <>
                {/* Leading Visual */}
            {config.leading !== 'none' && (
                <div className="shrink-0 mt-1">
                    {config.leading === 'image' && (
                        <div className="w-10 h-10 rounded bg-zinc-700 flex items-center justify-center overflow-hidden">
                             <User size={20} className="text-zinc-500" />
                        </div>
                    )}
                    {config.leading === 'icon' && (
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                            {getIcon()}
                        </div>
                    )}
                     {config.leading === 'progress' && (
                        <div className="w-10 h-10 rounded-full border-4 border-green-500/20 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-green-400">
                                {getRecordValueAsString(entity, config.health) || 'N/A'}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                {config.subtitle && (
                    <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-0.5">
                        {config.subtitle}
                    </div>
                )}
                
                <div className="text-sm font-medium text-zinc-200">
                     {renderFields(config.title)}
                     {(!config.title || config.title.length === 0) && '-'}
                </div>
                
                {config.body && config.body.length > 0 && (
                    <div className="text-xs text-zinc-400 mt-1">
                        {renderFields(config.body)}
                    </div>
                )}
            </div>
            
            {/* Action / Arrow */}
            {config.action && (
                <div className="shrink-0 self-center">
                    <LinkIcon size={14} className="text-zinc-600" />
                </div>
            )}
            </>
            )}
        </div>
    );
}
