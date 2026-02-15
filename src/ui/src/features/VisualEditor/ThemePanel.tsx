import { useThemeStore } from '../Theming/ThemeContext';
import { RefreshCw } from 'lucide-react';

export function ThemePanel() {
    const { theme, updateColor, updateTypography, reset } = useThemeStore();

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Global Theme</h3>
                <button onClick={reset} className="text-zinc-500 hover:text-white" title="Reset to Default">
                    <RefreshCw size={14} />
                </button>
            </div>

            {/* Colors */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase">Colors</h4>
                
                {Object.entries(theme.colors).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                        <input 
                            type="color" 
                            value={value}
                            onChange={(e) => updateColor(key as any, e.target.value)}
                            className="bg-transparent w-6 h-6 border-none cursor-pointer"
                        />
                        <div className="flex-1">
                            <div className="text-xs text-zinc-400 capitalize">{key}</div>
                            <input 
                                type="text" 
                                value={value}
                                onChange={(e) => updateColor(key as any, e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 font-mono"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <hr className="border-zinc-800" />

            {/* Typography */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase">Typography</h4>
                
                <div>
                   <label className="text-xs text-zinc-400 block mb-1">Base Size</label>
                   <input 
                        type="text" 
                        value={theme.typography.baseSize}
                        onChange={(e) => updateTypography('baseSize', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 font-mono"
                   />
                </div>
                
                 <div>
                   <label className="text-xs text-zinc-400 block mb-1">Scale Ratio</label>
                   <input 
                        type="number" 
                        step="0.05"
                        value={theme.typography.scaleRatio}
                        onChange={(e) => updateTypography('scaleRatio', parseFloat(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 font-mono"
                   />
                </div>
            </div>
        </div>
    );
}
