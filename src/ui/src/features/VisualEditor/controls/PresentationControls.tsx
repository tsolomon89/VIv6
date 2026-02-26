
import React, { useMemo } from 'react';
import type { Binding } from '../../../lib/api';
import { usePresetStore } from '../../../lib/presetStore';
import { LayoutTemplate, AlertCircle, Loader2 } from 'lucide-react';

interface PresentationControlsProps {
    binding: Binding;
    currentKey: string;
    onChange: (key: string) => void;
}

export const PresentationControls: React.FC<PresentationControlsProps> = ({ binding, currentKey, onChange }) => {

    // Use preset store (loaded from backend)
    const { loaded, error, getCompatible, get, isCompatible } = usePresetStore();

    // Filter presets compatible with current binding
    const compatiblePresets = useMemo(() => {
        if (!loaded) return [];
        return getCompatible(binding);
    }, [loaded, binding, getCompatible]);

    const currentPreset = get(currentKey);
    const isCurrentCompatible = currentPreset ? isCompatible(currentKey, binding) : false;

    // Show loading state while presets are being fetched
    if (!loaded && !error) {
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <LayoutTemplate className="w-3.5 h-3.5" />
                        Presentation Preset
                    </label>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-black/20 border border-white/5">
                        <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                        <span className="text-xs text-white/40">Loading presets...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if presets failed to load
    if (error) {
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <LayoutTemplate className="w-3.5 h-3.5" />
                        Presentation Preset
                    </label>
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-red-200">
                            Failed to load presets: {error.message}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-xs font-semibold truncate">{preset.name}</span>
                                    <span className="text-[10px] font-mono text-white/30 truncate">{preset.key}</span>
                                </div>
                                {currentKey === preset.key && <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />}
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

            {!isCurrentCompatible && currentKey && (
                <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <div className="text-xs font-bold text-yellow-200">Incompatible Preset</div>
                        <div className="text-[10px] text-yellow-200/70 leading-relaxed">
                            Current preset <span className="font-mono bg-black/20 px-1 rounded">{currentKey}</span> does not match the active binding. Please select a valid option above.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
