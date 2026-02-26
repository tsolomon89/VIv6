import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Entity } from '../../../lib/api';
import { api } from '../../../lib/api';
import { getRecordValue } from '../utils/record-utils';
import { ExternalLink, Mail, Phone, Calendar, ArrowUpRight } from 'lucide-react';

interface RecordFieldProps {
    entity: Entity;
    field: string;
    definition?: Entity; // The object_def for this entity
    className?: string;
    isEditing?: boolean;
    onChange?: (field: string, value: any) => void;
}

export function RecordField({ entity, field, definition, className, isEditing, onChange }: RecordFieldProps) {
    const value = getRecordValue(entity, field);
    const valueStr = value != null ? String(value) : '';
    const [internalValue, setInternalValue] = useState<string>(valueStr);
    const [resolvedName, setResolvedName] = useState<string | null>(null);
    const [refTarget, setRefTarget] = useState<string | null>(null);

    // Special handling: field_def columns
    const [parentObjectName, setParentObjectName] = useState<string | null>(null);
    const isFieldDefObjectColumn = entity.type === 'field_def' && field === 'object_def';
    const isFieldDefUsedByColumn = entity.type === 'field_def' && field === 'used_by';

    useEffect(() => {
        // Legacy: single object_def_id linkage
        if (isFieldDefObjectColumn) {
            const objectDefId = (entity.data as any)?.object_def_id;
            if (objectDefId && typeof objectDefId === 'string' && objectDefId.length > 20) {
                api.getEntity(objectDefId)
                    .then((obj) => setParentObjectName(obj.name))
                    .catch(() => setParentObjectName(null));
            }
        }
    }, [isFieldDefObjectColumn, entity.data]);

    // Sync internal value when prop changes
    useEffect(() => {
        setInternalValue(valueStr);
    }, [valueStr]);

    // 1. Resolve Type from Definition (if available)
    let type = 'text';
    let currentFieldDef: any = null;

    if (definition && definition.data) {
        const defData = definition.data as any;
        const targetSlug = field.toLowerCase().replace(/\s+/g, '');

        // NEW: Check fieldGroups structure first (per seed_system.md spec)
        if (defData.fieldGroups && Array.isArray(defData.fieldGroups)) {
            for (const group of defData.fieldGroups) {
                const fieldDef = (group.fields || []).find((f: any) =>
                    f.name.toLowerCase().replace(/\s+/g, '') === targetSlug
                );
                if (fieldDef) {
                    // Handle both seed format (type) and canonical format (inputType)
                    type = fieldDef.type || fieldDef.inputType || 'text';
                    currentFieldDef = fieldDef;
                    break;
                }
            }
        }
        // LEGACY: Fall back to flat fields array
        else if (defData.fields && Array.isArray(defData.fields)) {
            const fieldDef = defData.fields.find((f: any) =>
                f.name.toLowerCase().replace(/\s+/g, '') === targetSlug
            );
            if (fieldDef) {
                // Handle both seed format (type) and canonical format (inputType)
                type = fieldDef.type || fieldDef.inputType || 'text';
                currentFieldDef = fieldDef;
            }
        }
    }

    // 2. Fallback Heuristics (if no definition match found)
    if (!currentFieldDef) {
        const lowerField = field.toLowerCase();
        if (lowerField.includes('email')) type = 'email';
        if (lowerField.includes('phone')) type = 'phone';
        if (lowerField.includes('price') || lowerField.includes('amount')) type = 'currency';
        if (lowerField.includes('date') || lowerField.includes('at')) type = 'date';
        if (lowerField.includes('url') || lowerField.includes('website')) type = 'url';
    }

    // Effect for Reference Resolution
    useEffect(() => {
        if (type === 'ref' && value && typeof value === 'string' && currentFieldDef?.ref_target) {
            setRefTarget(currentFieldDef.ref_target);
            // Optimization: checking if value looks like a UUID to avoid 404s on garbage data
            if (value.length > 20) { 
                api.getEntity(value)
                    .then((r: any) => setResolvedName(r.name || r.title || r.subject || r.companyName || r.fullName || 'Unknown Record'))
                    .catch(() => setResolvedName('Unresolved Link'));
            }
        }
    }, [value, type, currentFieldDef]);

    // Input Handling
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setInternalValue(newVal);
        onChange?.(field, newVal);
    };

    const [availableSchemas, setAvailableSchemas] = useState<{slug: string, name: string}[]>([]);

    // Fetch schemas if editing a ref_target
    useEffect(() => {
        if (isEditing && field === 'ref_target') {
            api.listEntities('object_def').then(defs => {
                 setAvailableSchemas(defs.map((d: any) => ({ slug: d.slug, name: d.name })));
            });
        }
    }, [isEditing, field]);


    // Fetch available targets if this is a strict reference field
    const [availableTargets, setAvailableTargets] = useState<Entity[]>([]);
    
    useEffect(() => {
        if (isEditing && type === 'ref' && currentFieldDef?.ref_target) {
            api.listEntities(currentFieldDef.ref_target).then(setAvailableTargets).catch(console.error);
        }
    }, [isEditing, type, currentFieldDef]);

    if (isEditing) {
        // Special Case: Schema Selector for Reference Targets
        if (field === 'ref_target') {
            return (
                <select
                    value={internalValue}
                    onChange={(e) => {
                        const val = e.target.value;
                        setInternalValue(val);
                        onChange?.(field, val);
                    }}
                    onBlur={() => onChange?.(field, internalValue)}
                    className={`bg-zinc-800 border-zinc-700 text-zinc-100 px-2 py-1 rounded text-sm w-full focus:ring-1 focus:ring-indigo-500 focus:outline-none ${className}`}
                >
                    <option value="">Select Target Schema...</option>
                    {availableSchemas.map(s => (
                        <option key={s.slug} value={s.slug}>{s.name} ({s.slug})</option>
                    ))}
                </select>
            );
        }

        // Strict Reference Selector
        if (type === 'ref' && currentFieldDef?.ref_target) {
             return (
                <select
                    value={internalValue}
                    onChange={(e) => {
                        const val = e.target.value;
                        setInternalValue(val);
                        onChange?.(field, val);
                    }}
                    onBlur={() => onChange?.(field, internalValue)}
                    className={`bg-zinc-800 border-zinc-700 text-zinc-100 px-2 py-1 rounded text-sm w-full focus:ring-1 focus:ring-indigo-500 focus:outline-none ${className}`}
                >
                    <option value="">Select {currentFieldDef.ref_target}...</option>
                    {availableTargets.map(t => {
                        const target = t as any;
                        return (
                            <option key={target.id} value={target.id}>
                                {target.name || target.title || target.subject || target.slug || target.id}
                            </option>
                        );
                    })}
                </select>
            );
        }

        return (
            <input 
                type={type === 'email' ? 'email' : 'text'}
                value={internalValue}
                onChange={handleInputChange}
                onBlur={() => onChange?.(field, internalValue)} // Trigger Algo 2 or validation
                className={`bg-zinc-800 border-zinc-700 text-zinc-100 px-2 py-1 rounded text-sm w-full focus:ring-1 focus:ring-indigo-500 focus:outline-none ${className}`}
                placeholder={`Enter ${field}...`}
            />
        );
    }

    // Special render: field_def Object column - show parent object name (legacy)
    if (isFieldDefObjectColumn) {
        const objectDefId = (entity.data as any)?.object_def_id;
        if (parentObjectName) {
            return (
                <Link
                    to={`/records/object_def/${objectDefId}`}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 transition-colors ${className}`}
                    onClick={e => e.stopPropagation()}
                >
                    {parentObjectName}
                    <ArrowUpRight size={10} />
                </Link>
            );
        }
        if (objectDefId) {
            return <span className={`text-zinc-400 text-xs ${className}`}>Loading...</span>;
        }
        return <span className={`text-zinc-500 italic ${className}`}>-</span>;
    }

    // Special render: field_def Used By column - show array of object slugs
    if (isFieldDefUsedByColumn) {
        const usedByObjects = (entity.data as any)?.used_by_objects;
        if (usedByObjects && Array.isArray(usedByObjects) && usedByObjects.length > 0) {
            // Show up to 3 objects, then "+N more"
            const displayObjects = usedByObjects.slice(0, 3);
            const remaining = usedByObjects.length - 3;
            return (
                <span className={`flex flex-wrap gap-1 ${className}`}>
                    {displayObjects.map((slug: string) => (
                        <Link
                            key={slug}
                            to={`/records/${slug}`}
                            className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600/50 hover:text-white text-xs transition-colors"
                            onClick={e => e.stopPropagation()}
                        >
                            {slug}
                        </Link>
                    ))}
                    {remaining > 0 && (
                        <span className="text-zinc-500 text-xs">+{remaining} more</span>
                    )}
                </span>
            );
        }
        return <span className={`text-zinc-500 italic ${className}`}>-</span>;
    }

    if (value === undefined || value === null || value === '') {
        return <span className={`text-zinc-500 italic ${className}`}>-</span>;
    }

    // 3. Render based on Type
    switch (type) {
        case 'currency':
            const num = parseFloat(String(value));
            return (
                <span className={`font-mono ${className}`}>
                    {!isNaN(num) ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num) : String(value)}
                </span>
            );
        case 'date':
        case 'timestamp':
            // Simple date formatting
            const date = new Date(String(value));
            const isValidDate = !isNaN(date.getTime());
            return (
                <span className={`flex items-center gap-1.5 ${className}`}>
                   {isValidDate ? (
                       <>
                           <Calendar size={12} className="text-zinc-500" />
                           {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)}
                       </>
                   ) : String(value)}
                </span>
            );
        case 'email':
            return (
                <a href={`mailto:${value}`} className={`flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 hover:underline ${className}`} onClick={e => e.stopPropagation()}>
                    <Mail size={12} />
                    {String(value)}
                </a>
            );
        case 'phone':
            return (
                 <a href={`tel:${value}`} className={`flex items-center gap-1.5 text-zinc-300 hover:text-white ${className}`} onClick={e => e.stopPropagation()}>
                    <Phone size={12} />
                    {String(value)}
                </a>
            );
        case 'url':
             return (
                 <a href={String(value)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 hover:underline ${className}`} onClick={e => e.stopPropagation()}>
                    {String(value).replace(/^https?:\/\//, '')}
                    <ExternalLink size={12} />
                </a>
            );
        case 'ref':
             if (resolvedName && refTarget) {
                 return (
                    <Link 
                        to={`/records/${refTarget}/${value}`}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors ${className}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {resolvedName}
                        <ArrowUpRight size={10} />
                    </Link>
                 );
             }
             return <span className={`font-mono text-xs text-zinc-500 ${className}`}>{String(value).substring(0, 8)}...</span>;
             
        default:
            return <span className={className}>{String(value)}</span>;
    }
}
