import { useMemo } from 'react';
import { LayoutTemplate, AlertCircle } from 'lucide-react';
import type { Binding } from './BindingControls';

// Simplified preset registry for Admin UI
// In production, this would come from an API or shared types
export interface PresetSignature {
    kind: 'self' | 'related';
    target?: string;
    cardinality?: 'one' | 'many';
}

export interface PresentationPreset {
    key: string;
    signature: PresetSignature;
    label?: string;
}

// Default preset registry - can be extended via props or API
const DEFAULT_PRESETS: PresentationPreset[] = [
    { key: 'self.hero.v1', signature: { kind: 'self' }, label: 'Hero Section' },
    { key: 'self.cta.v1', signature: { kind: 'self' }, label: 'Call to Action' },
    { key: 'related.product.many.marquee.v1', signature: { kind: 'related', target: 'product', cardinality: 'many' }, label: 'Product Marquee' },
    { key: 'related.product.many.grid.v1', signature: { kind: 'related', target: 'product', cardinality: 'many' }, label: 'Product Grid' },
    { key: 'related.feature.many.grid.v1', signature: { kind: 'related', target: 'feature', cardinality: 'many' }, label: 'Feature Grid' },
    { key: 'related.solution.many.grid.v1', signature: { kind: 'related', target: 'solution', cardinality: 'many' }, label: 'Solution Grid' },
    { key: 'related.useCase.many.grid.v1', signature: { kind: 'related', target: 'useCase', cardinality: 'many' }, label: 'Use Case Grid' },
];

function matchesSignature(binding: Binding, signature: PresetSignature): boolean {
    if (binding.kind !== signature.kind) return false;
    if (signature.kind === 'self') return true;
    if (signature.target && binding.target !== signature.target) return false;
    if (signature.cardinality && binding.cardinality !== signature.cardinality) return false;
    return true;
}

interface PresentationControlsProps {
    binding: Binding;
    currentKey: string;
    onChange: (key: string) => void;
    presets?: PresentationPreset[];
}

export function PresentationControls({ 
    binding, 
    currentKey, 
    onChange, 
    presets = DEFAULT_PRESETS 
}: PresentationControlsProps) {
    
    // Filter presets compatible with current binding
    const compatiblePresets = useMemo(() => {
        return presets.filter(preset => matchesSignature(binding, preset.signature));
    }, [binding, presets]);

    const currentPreset = presets.find(p => p.key === currentKey);
    const isCompatible = currentPreset ? matchesSignature(binding, currentPreset.signature) : false;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    Presentation Preset
                </label>
                
                {compatiblePresets.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                        {compatiblePresets.map(preset => (
                            <button
                                key={preset.key}
                                onClick={() => onChange(preset.key)}
                                className={`flex items-center justify-between px-3 py-3 rounded-xl border text-left transition-all group ${
                                    currentKey === preset.key 
                                    ? 'bg-white/10 border-white/20 text-white shadow-sm' 
                                    : 'bg-black/20 border-white/5 text-white/50 hover:bg-white/5 hover:border-white/10 hover:text-white/80'
                                }`}
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium">{preset.label || preset.key}</span>
                                    <span className="text-[10px] font-mono text-white/30">{preset.key}</span>
                                </div>
                                {currentKey === preset.key && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-red-200">
                            No compatible presets found for this binding signature.
                        </div>
                    </div>
                )}
            </div>

            {!isCompatible && currentKey && (
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <div className="text-xs font-bold text-yellow-200">Incompatible Preset</div>
                        <div className="text-[10px] text-yellow-200/70 leading-relaxed">
                            Current preset <span className="font-mono bg-black/20 px-1 rounded">{currentKey}</span> does not match the active binding.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
