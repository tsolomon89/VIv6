
import type { Entity } from '../../../lib/api';
import type { RecordProjectionConfig } from '../config/studio-config';
import { getRecordValue } from '../utils/record-utils';

interface RecordTileProjectionProps {
    config: RecordProjectionConfig;
    entity: Entity;
}

export function RecordTileProjection({ config, entity }: RecordTileProjectionProps) {
    // 1. Extract Values
    const current = Number(getRecordValue(entity, config.currentKey)) || 0;
    const target = Number(getRecordValue(entity, config.targetKey)) || 1; // Avoid divide by zero

    // 2. Calculate Physics
    const percentage = Math.min(Math.max((current / target) * 100, 0), 100);
    const isMet = current >= target;

    return (
        <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                        {config.label}
                    </div>
                    <div className="text-2xl font-bold text-white mt-1">
                        {current.toLocaleString()}
                        <span className="text-sm text-zinc-500 font-normal ml-1">
                             / {target.toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className={`text-sm font-bold ${isMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {Math.round(percentage)}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ease-out ${isMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Context/Delta (Optional placeholder for future Physics delta) */}
            <div className="flex justify-between text-xs text-zinc-600">
                <span>0</span>
                <span>Target: {target}</span>
            </div>
        </div>
    );
}
