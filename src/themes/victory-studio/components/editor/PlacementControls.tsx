
import React from 'react';
import { Placement } from '../../types';
import { ArrowUpToLine, ArrowDownToLine, ArrowUpDown } from 'lucide-react';

interface PlacementControlsProps {
    placement: Placement;
    onChange: (placement: Placement) => void;
}

export const PlacementControls: React.FC<PlacementControlsProps> = ({ placement, onChange }) => {
    return (
        <div className="space-y-4">
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                    onClick={() => onChange({ slot: 'start' })}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-all ${placement.slot === 'start' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                >
                    <ArrowUpToLine className="w-3.5 h-3.5" />
                    Start
                </button>
                <button
                    onClick={() => onChange({ slot: 'free', order: placement.order || 0 })}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-all ${placement.slot === 'free' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Free
                </button>
                <button
                    onClick={() => onChange({ slot: 'end' })}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-medium transition-all ${placement.slot === 'end' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    End
                </button>
            </div>

            {placement.slot === 'free' && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Sort Order</span>
                    <input 
                        type="number"
                        value={placement.order || 0}
                        onChange={(e) => onChange({ ...placement, order: parseInt(e.target.value) || 0 })}
                        className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white text-right"
                    />
                </div>
            )}
        </div>
    );
};
