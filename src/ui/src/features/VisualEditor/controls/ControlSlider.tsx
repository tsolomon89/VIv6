

import type { NumberParam } from '../../../lib/types';

interface ControlSliderProps {
    label: string;
    param: NumberParam;
    min: number;
    max: number;
    step: number;
    onChange: (value: NumberParam) => void;
}

export function ControlSlider({ label, param, min, max, step, onChange }: ControlSliderProps) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">{label}</label>
                <span className="text-[10px] font-mono text-white/60">{param.value.toFixed(step >= 1 ? 0 : 2)}</span>
            </div>
            <div className="flex items-center gap-2">
                <input 
                    type="range" 
                    min={min} 
                    max={max} 
                    step={step}
                    value={param.value}
                    onChange={(e) => onChange({ ...param, value: parseFloat(e.target.value) })}
                    className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
            </div>
        </div>
    );
}
