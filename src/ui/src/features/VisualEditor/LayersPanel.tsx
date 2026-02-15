import type { DerivedSection } from '../../lib/api';
import { Box, Layout } from 'lucide-react';
import { useEditorStore } from './SelectionManager';

interface LayersPanelProps {
    sections: DerivedSection[];
}

export function LayersPanel({ sections }: LayersPanelProps) {
    const { selectedId, select } = useEditorStore();

    if (sections.length === 0) {
        return (
            <div className="p-4 text-zinc-500 text-sm italic text-center">
                No layers found
            </div>
        );
    }

    return (
        <div className="py-2">
            <div className="px-4 pb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Sections
            </div>
            <div className="space-y-0.5">
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => select(section.id)}
                        className={`w-full px-4 py-2 flex items-center gap-3 text-xs text-left transition-colors ${
                            selectedId === section.id 
                                ? 'bg-indigo-500/10 text-indigo-400 border-r-2 border-indigo-500' 
                                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border-r-2 border-transparent'
                        }`}
                    >
                        {section.binding.kind === 'self' ? <Layout size={14} /> : <Box size={14} />}
                        <span className="truncate flex-1 font-mono">
                            {section.id}
                        </span>
                        {section.binding.kind === 'related' && (
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-500">
                                {section.binding.target}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
