import { useState, useEffect } from 'react';
import { Link2, Database } from 'lucide-react';

// Types matching the Theme's Binding structure
export type EntityType = 'brand' | 'product' | 'feature' | 'solution' | 'useCase';
export type Cardinality = 'one' | 'many';

export interface BindingScope {
    limit?: number;
    sort?: string;
    filter?: Record<string, any>;
}

export interface Binding {
    kind: 'self' | 'related';
    target?: EntityType;
    cardinality?: Cardinality;
    relationKey?: string;
    scope?: BindingScope;
}

interface BindingControlsProps {
    binding: Binding;
    onChange: (binding: Binding) => void;
}

const ENTITIES: EntityType[] = ['brand', 'product', 'feature', 'solution', 'useCase'];

export function BindingControls({ binding, onChange }: BindingControlsProps) {
    const isSelf = binding.kind === 'self';
    const [filterText, setFilterText] = useState('');

    // Sync filter text when binding changes externally
    useEffect(() => {
        if (binding.kind === 'related' && binding.scope?.filter) {
            setFilterText(JSON.stringify(binding.scope.filter));
        } else {
            setFilterText('');
        }
    }, [binding]);

    const handleFilterBlur = () => {
        if (!filterText.trim()) {
            if (binding.kind === 'related' && binding.scope?.filter) {
                const newScope = { ...binding.scope, filter: undefined };
                onChange({ ...binding, scope: newScope });
            }
            return;
        }
        try {
            const filter = JSON.parse(filterText);
            if (binding.kind === 'related') {
                const newScope = { ...binding.scope, filter };
                onChange({ ...binding, scope: newScope });
            }
        } catch (e) {
            console.warn("Invalid JSON in filter");
        }
    };

    const buttonBase = "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all";
    const buttonActive = "bg-white/10 text-white shadow-sm";
    const buttonInactive = "text-white/40 hover:text-white/70";

    return (
        <div className="space-y-4">
            {/* Self / Related Toggle */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                    onClick={() => onChange({ kind: 'self' })}
                    className={`${buttonBase} ${isSelf ? buttonActive : buttonInactive}`}
                >
                    <Link2 className="w-3.5 h-3.5" />
                    Self
                </button>
                <button
                    onClick={() => onChange({ kind: 'related', target: 'product', cardinality: 'many' })}
                    className={`${buttonBase} ${!isSelf ? buttonActive : buttonInactive}`}
                >
                    <Database className="w-3.5 h-3.5" />
                    Related
                </button>
            </div>

            {/* Related Entity Options */}
            {!isSelf && (
                <div className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    {/* Target Entity */}
                    <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">
                            Target Entity
                        </label>
                        <div className="flex flex-wrap gap-1">
                            {ENTITIES.map(ent => (
                                <button
                                    key={ent}
                                    onClick={() => onChange({ ...binding, target: ent })}
                                    className={`px-2 py-1.5 rounded text-[10px] uppercase font-medium border ${
                                        binding.target === ent 
                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' 
                                        : 'bg-transparent border-white/10 text-white/40 hover:text-white'
                                    }`}
                                >
                                    {ent}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cardinality */}
                    <div>
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-2">
                            Cardinality
                        </label>
                        <div className="flex gap-2">
                            {(['one', 'many'] as Cardinality[]).map((card) => (
                                <button
                                    key={card}
                                    onClick={() => onChange({ ...binding, cardinality: card })}
                                    className={`flex-1 py-1.5 rounded text-[10px] uppercase font-medium border ${
                                        binding.cardinality === card 
                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' 
                                        : 'bg-transparent border-white/10 text-white/40 hover:text-white'
                                    }`}
                                >
                                    {card}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Scope Controls */}
                    <div className="pt-2 border-t border-white/5 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                                    Limit
                                </label>
                                <input 
                                    type="number" 
                                    value={binding.scope?.limit || ''} 
                                    onChange={(e) => {
                                        const limit = parseInt(e.target.value);
                                        const newScope = { ...binding.scope, limit: isNaN(limit) ? undefined : limit };
                                        onChange({ ...binding, scope: newScope });
                                    }}
                                    placeholder="All"
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white focus:border-white/30 outline-none placeholder:text-white/20"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                                    Sort Field
                                </label>
                                <input 
                                    type="text" 
                                    value={binding.scope?.sort || ''} 
                                    onChange={(e) => {
                                        const newScope = { ...binding.scope, sort: e.target.value || undefined };
                                        onChange({ ...binding, scope: newScope });
                                    }}
                                    placeholder="date, title"
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white focus:border-white/30 outline-none placeholder:text-white/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">
                                Filter (JSON)
                            </label>
                            <input 
                                type="text" 
                                value={filterText} 
                                onChange={(e) => setFilterText(e.target.value)}
                                onBlur={handleFilterBlur}
                                placeholder='{"category": "Branding"}'
                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white focus:border-white/30 outline-none placeholder:text-white/20"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
