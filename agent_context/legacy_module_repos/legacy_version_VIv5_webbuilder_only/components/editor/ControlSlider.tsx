import React, { useState, useEffect } from 'react';
import { Link2, Unlink, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { NumberParam } from '../../types';

interface ControlSliderProps {
    label: string;
    param?: NumberParam; // Make optional to allow defensive check
    min: number;
    max: number;
    step: number;
    onChange: (val: NumberParam) => void;
}

export const ControlSlider = ({ label, param, min, max, step, onChange }: ControlSliderProps) => {
    const [dragging, setDragging] = useState<'primary' | 'secondary' | null>(null);

    // Defensive check: If param is missing, return null or a placeholder to prevent crash
    if (!param) {
        return null; 
    }

    // We treat 'value' as Start and 'endValue' as End.
    const hasEnd = param.endValue !== null;

    // Helper to clamp
    const clamp = (v: number) => Math.min(Math.max(v, min), max);
    
    // Calculate percentages for sliders
    const toPercent = (v: number) => ((clamp(v) - min) / (max - min)) * 100;
    
    const handleSliderChange = (newVal: number, isSecondary: boolean) => {
        const c = clamp(newVal);
        if (isSecondary) {
            onChange({ ...param, endValue: c });
        } else {
            onChange({ ...param, value: c });
        }
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);

        const rect = e.currentTarget.getBoundingClientRect();
        // Calculate raw value
        const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        const val = min + pct * (max - min);

        // Determine which handle to target
        let target: 'primary' | 'secondary' = 'primary';

        if (e.shiftKey) {
            // Shift always targets secondary (or creates it)
            target = 'secondary';
        } else if (hasEnd) {
            // If both exist, find closest
            const distPrimary = Math.abs(val - param.value);
            const distSecondary = Math.abs(val - param.endValue!);
            if (distSecondary < distPrimary) {
                target = 'secondary';
            }
        }

        // Apply change immediately
        setDragging(target);
        handleSliderChange(val, target === 'secondary');
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragging) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        const val = min + pct * (max - min);

        handleSliderChange(val, dragging === 'secondary');
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setDragging(null);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const toggleLink = () => {
        onChange({ ...param, isLinked: !param.isLinked });
    };

    const removeEndValue = () => {
        onChange({ ...param, endValue: null, isLinked: false }); // Unlink if removing end point
    };
    
    const swapValues = () => {
        if (hasEnd) {
             onChange({
                ...param,
                value: param.endValue!,
                endValue: param.value
            });
        }
    };

    // --- Inline Input Component ---
    const NumberInput = ({ val, onUpdate }: { val: number, onUpdate: (n: number) => void }) => {
        const [text, setText] = useState(val.toFixed(2));
        const [editing, setEditing] = useState(false);

        useEffect(() => { if(!editing) setText(val.toFixed(2)) }, [val, editing]);

        const commit = () => {
            setEditing(false);
            const n = parseFloat(text);
            if (!isNaN(n)) onUpdate(n);
            else setText(val.toFixed(2));
        };

        return editing ? (
            <input 
                autoFocus
                type="text" 
                value={text}
                onChange={e => setText(e.target.value)}
                onBlur={commit}
                onKeyDown={e => e.key === 'Enter' && commit()}
                className="w-14 bg-white/20 text-white text-[10px] font-mono px-1 py-0.5 rounded text-right outline-none"
            />
        ) : (
            <span 
                onClick={() => setEditing(true)}
                className="cursor-text hover:bg-white/10 px-1 py-0.5 rounded text-[10px] font-mono text-white/50 hover:text-white transition-colors min-w-[3ch] text-right"
            >
                {val.toFixed(2)}
            </span>
        );
    }

    return (
        <div className={`flex flex-col gap-3 group p-2 rounded-xl transition-colors ${param.isLinked ? 'bg-white/5 border border-white/5' : 'hover:bg-white/5 border border-transparent'}`}>
            <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                    {/* Link Toggle */}
                    <button 
                        onClick={toggleLink}
                        title="Link to Scroll"
                        className={`p-1 rounded transition-all ${param.isLinked ? 'bg-blue-500/20 text-blue-400' : 'text-white/20 hover:text-white/60'}`}
                    >
                        {param.isLinked ? <Link2 className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
                    </button>
                    <span className={`font-medium transition-colors ${param.isLinked ? 'text-blue-200' : 'text-white/60 group-hover:text-white/90'}`}>
                        {label}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Primary Input */}
                    <NumberInput val={param.value} onUpdate={n => handleSliderChange(n, false)} />
                    
                    {/* Secondary Input & Delete */}
                    {hasEnd && (
                        <>
                            <button 
                                onClick={swapValues}
                                className="text-white/20 hover:text-white transition-colors p-0.5"
                                title="Reverse Direction"
                            >
                                {param.endValue! >= param.value ? <ArrowRight className="w-3 h-3" /> : <ArrowLeft className="w-3 h-3" />}
                            </button>
                            <NumberInput val={param.endValue!} onUpdate={n => handleSliderChange(n, true)} />
                            <button onClick={removeEndValue} className="text-white/20 hover:text-red-400 p-0.5 transition-colors" title="Remove End Point">
                                <X className="w-3 h-3" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div 
                className="relative h-2 w-full cursor-pointer touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                {/* Track Background */}
                <div className="absolute inset-0 rounded-full bg-white/10 overflow-hidden pointer-events-none">
                    {/* Range Fill (if two points) */}
                    {hasEnd ? (
                        <div 
                           className={`absolute h-full opacity-30 transition-all duration-75 ${param.isLinked ? 'bg-blue-400' : 'bg-white'}`}
                           style={{ 
                               left: `${Math.min(toPercent(param.value), toPercent(param.endValue!))}%`,
                               width: `${Math.abs(toPercent(param.endValue!) - toPercent(param.value))}%` 
                           }}
                        />
                    ) : (
                        <div 
                            className={`h-full transition-all duration-75 ease-out ${param.isLinked ? 'bg-blue-500/50' : 'bg-white/80'}`}
                            style={{ width: `${toPercent(param.value)}%` }}
                        />
                    )}
                </div>

                {/* Primary Handle */}
                <div 
                    className={`absolute top-1/2 -ml-1.5 -mt-1.5 w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none transition-all duration-75 ease-out border border-black/20 ${param.isLinked ? 'bg-blue-400 scale-110' : 'bg-white group-hover:scale-125'}`}
                    style={{ left: `${toPercent(param.value)}%` }}
                />

                {/* Secondary Handle */}
                {hasEnd && (
                    <div 
                        className={`absolute top-1/2 -ml-1.5 -mt-1.5 w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none transition-all duration-75 ease-out border border-black/20 bg-white/50 border-white/50`}
                        style={{ left: `${toPercent(param.endValue!)}%` }}
                    />
                )}
            </div>
            
            {/* Instruction Hint */}
            {!hasEnd && !param.isLinked && (
                 <div className="hidden group-hover:block text-[9px] text-white/20 text-center -mt-1">
                    Shift+Click to add end point
                 </div>
            )}
        </div>
    );
};
