
import { 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    Tooltip, 
    BarChart, 
    Bar, 
    XAxis, 
    AreaChart, 
    Area
} from 'recharts';
import type { Entity } from '../../../lib/api';
import type { RecordChartConfig } from '../config/studio-config';
import { getRecordValue } from '../utils/record-utils';

interface RecordTileChartProps {
    config: RecordChartConfig;
    entity: Entity;
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function RecordTileChart({ config, entity }: RecordTileChartProps) {
    // 1. Extract Data Stream
    // The dataKey usually points to a list field (e.g. 'campaigns' or 'performanceMetrics')
    const rawData = getRecordValue(entity, config.dataKey);
    const data = Array.isArray(rawData) ? rawData : [];

    const colors = config.colors || DEFAULT_COLORS;

    if (!data || data.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center text-zinc-600 text-xs italic">
                No data available
            </div>
        );
    }

    // 2. Render Chart Variant
    return (
        <div className="h-48 w-full p-2">
            <ResponsiveContainer width="100%" height="100%">
                {config.type === 'donut' ? (
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey={config.valueKey}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                            itemStyle={{ color: '#e4e4e7' }}
                        />
                    </PieChart>
                ) : config.type === 'bar' ? (
                    <BarChart data={data}>
                        <XAxis dataKey={config.categoryKey} stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                             cursor={{ fill: '#27272a', opacity: 0.4 }}
                             contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                             itemStyle={{ color: '#e4e4e7' }}
                        />
                         <Bar dataKey={config.valueKey} radius={[4, 4, 0, 0]}>
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                ) : (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey={config.categoryKey} stroke="#71717a" fontSize={10} tickLine={false} axisLine={false}  />
                        <Tooltip 
                             contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                             itemStyle={{ color: '#e4e4e7' }}
                        />
                        <Area type="monotone" dataKey={config.valueKey} stroke={colors[0]} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
