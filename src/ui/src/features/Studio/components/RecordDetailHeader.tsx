
import type { Entity } from '../../../lib/api';
import { api } from '../../../lib/api';
import { RECORD_FIELD_MAPPINGS, RECORD_ICON_MAPPING } from '../config/studio-config';
import { getRecordValue } from '../utils/record-utils';
import { User, Play, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface RecordDetailHeaderProps {
    entity: Entity;
    type: string;
}

export function RecordDetailHeader({ entity, type }: RecordDetailHeaderProps) {
    const config = (RECORD_FIELD_MAPPINGS as any)[type];
    if (!config) return null;

    // Use centralized util
    const getValue = (key: string) => getRecordValue(entity, key);

    const titleKeys = Array.isArray(config.title) ? config.title : [config.title];
    const title = titleKeys.map((k: string) => getValue(k)).filter(Boolean).join(' • ');
    
    const subtitle = getValue(config.subtitle as string);
    const imageUrl = getValue(config.image as string);
    
    const socialLinks = config.social ? Object.entries(config.social) : [];

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Image / Avatar */}
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-700 shrink-0">
                {imageUrl ? (
                    <img src={String(imageUrl)} alt={String(title)} className="w-full h-full object-cover" />
                ) : (
                    <User size={40} className="text-zinc-500" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
                <h1 className="text-3xl font-bold text-white">{subtitle || entity.name}</h1>
                <div className="text-lg text-zinc-400 font-medium">{title}</div>
                
                {/* Body / Stats if any */}
                {config.body && (
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500 mt-2">
                        {(Array.isArray(config.body) ? config.body : [config.body]).map((k: string) => {
                            const val = getValue(k);
                            return val ? <span key={k} className="bg-zinc-800 px-2 py-1 rounded">{String(val)}</span> : null;
                        })}
                    </div>
                )}
            </div>

            {/* Actions / Socials */}
            <div className="flex gap-2 items-center">
                <BuildButton entityId={entity.id} />
                
                {socialLinks.map(([key, iconKey]) => {
                    const url = getValue(key);
                    const iconConfig = (RECORD_ICON_MAPPING as any)[iconKey as string];
                    if (!url || !iconConfig) return null;
                    
                    const Icon = iconConfig.icon;
                    return (
                        <a 
                            key={key} 
                            href={String(url)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-zinc-800 hover:brightness-110 transition-all text-zinc-400 hover:text-white"
                            style={{ color: iconConfig.color }}
                        >
                            <Icon size={20} />
                        </a>
                    );
                })}
            </div>
        </div>
    );
}

function BuildButton({ entityId }: { entityId: string }) {
    const [status, setStatus] = useState<'idle' | 'building' | 'success' | 'error'>('idle');

    const handleBuild = async () => {
        setStatus('building');
        try {
            await api.triggerBuild(entityId);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (e) {
            console.error(e);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    if (status === 'success') {
        return (
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Check size={16} />
                <span className="text-xs font-medium">Built</span>
            </button>
        );
    }

    if (status === 'error') {
         return (
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertTriangle size={16} />
                <span className="text-xs font-medium">Failed</span>
            </button>
        );
    }

    return (
        <button 
            onClick={handleBuild}
            disabled={status === 'building'}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all text-zinc-400 hover:text-white disabled:opacity-50"
            title="Trigger Static Build"
        >
            {status === 'building' ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
            <span className="text-xs font-medium">Build</span>
        </button>
    );
}
