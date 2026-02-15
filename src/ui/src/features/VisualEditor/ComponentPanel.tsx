
import { useEditorStore } from './SelectionManager';
import { Box, Info, Grid } from 'lucide-react';

export function ComponentPanel() {
    const { selectedId, derivedPage, updateSectionConfig } = useEditorStore();

    // Find the selected section
    const section = derivedPage?.sections.find(s => s.id === selectedId);

    if (!selectedId || !section) {
        return (
            <div className="p-8 text-center flex flex-col items-center gap-3 text-zinc-500">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Box size={24} className="opacity-50" />
                </div>
                <div>
                   <p className="font-medium text-zinc-400">No Selection</p>
                   <p className="text-xs">Click an element in the canvas to edit.</p>
                </div>
            </div>
        );
    }

    const { config, binding } = section;
    const componentName = (config as any).component || (binding.kind === 'self' ? 'Primary View' : 'Related Collection');

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                <div className="w-8 h-8 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-xs font-bold ring-1 ring-inset ring-indigo-500/30">
                    {section.id.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white font-mono truncate w-40" title={section.id}>{section.id}</h3>
                    <p className="text-xs text-zinc-500 capitalize">
                        {componentName}
                    </p>
                </div>
            </div>

            {/* Logical Info (ReadOnly) */}
            <div className="space-y-2 p-3 bg-zinc-950 rounded border border-zinc-800">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Info size={12} />
                    <span className="font-semibold">Binding:</span>
                    <span className="text-zinc-300">{binding.kind}</span>
                </div>
                {binding.kind === 'related' && (
                    <div className="text-xs text-zinc-500 pl-5">
                       Target: <span className="text-indigo-400">{binding.target}</span> ({binding.cardinality})
                    </div>
                )}
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Grid size={12} />
                    <span className="font-semibold">Entities:</span>
                    <span className="text-zinc-300">{section.entities.length}</span>
                </div>
            </div>

            {/* Visual Config Fields */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-500 uppercase">Appearance</h4>
                
                {Object.entries(config).map(([key, value]) => {
                    // Logic to determine input type based on value type or key name
                    const isColor = key.toLowerCase().includes('color') || (typeof value === 'string' && value.startsWith('#'));
                    const isNumber = typeof value === 'number';
                    
                    return (
                        <div key={key} className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            
                            {isColor ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="color" 
                                        defaultValue={String(value)}
                                        className="bg-transparent w-6 h-6 border-none cursor-pointer"
                                    />
                                    <input 
                                        type="text" 
                                        value={String(value)}
                                        onChange={(e) => updateSectionConfig(section.id, { [key]: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                                    />
                                </div>
                            ) : (
                                <input 
                                    type={isNumber ? 'number' : 'text'}
                                    value={String(value)}
                                    onChange={(e) => {
                                        const val = isNumber ? parseFloat(e.target.value) : e.target.value;
                                        updateSectionConfig(section.id, { [key]: val });
                                    }}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                                />
                            )}
                        </div>
                    );
                })}
                
                {Object.keys(config).length === 0 && (
                    <p className="text-xs text-zinc-600 italic">No configuration properties exposed.</p>
                )}
            </div>
        </div>
    );
}
