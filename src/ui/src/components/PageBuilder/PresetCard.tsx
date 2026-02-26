import { Check, Grid, User, Package, Lightbulb, Target, Star, Layout } from 'lucide-react';
import type { PresentationPreset } from '../../lib/api';

interface PresetCardProps {
  preset: PresentationPreset;
  selected?: boolean;
  onSelect: (preset: PresentationPreset) => void;
}

// Get icon based on preset signature
function getSignatureIcon(preset: PresentationPreset) {
  if (preset.signature.kind === 'self') {
    return <User size={16} className="text-indigo-400" />;
  }

  const target = preset.signature.target;
  switch (target) {
    case 'product': return <Package size={16} className="text-emerald-400" />;
    case 'feature': return <Lightbulb size={16} className="text-amber-400" />;
    case 'solution': return <Target size={16} className="text-blue-400" />;
    case 'useCase': return <Star size={16} className="text-purple-400" />;
    case 'brand': return <Layout size={16} className="text-pink-400" />;
    default: return <Grid size={16} className="text-zinc-400" />;
  }
}

// Get layout visualization based on config
function getLayoutPreview(preset: PresentationPreset) {
  const config = preset.config as Record<string, any>;
  const layout = config.listLayout || 'single';
  const columns = config.listColumns?.value || 1;

  if (layout === 'grid') {
    const cols = Math.min(columns, 4);
    return (
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array(cols * 2).fill(0).map((_, i) => (
          <div key={i} className="h-3 bg-zinc-600 rounded-sm" />
        ))}
      </div>
    );
  }

  if (layout === 'marquee') {
    return (
      <div className="flex gap-1 overflow-hidden">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-6 w-8 flex-shrink-0 bg-zinc-600 rounded-sm" />
        ))}
      </div>
    );
  }

  if (layout === 'stack') {
    return (
      <div className="space-y-1">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-3 bg-zinc-600 rounded-sm" />
        ))}
      </div>
    );
  }

  // Single/hero style
  return (
    <div className="space-y-2">
      <div className="h-8 bg-zinc-600 rounded-sm" />
      <div className="h-2 w-3/4 bg-zinc-700 rounded-sm" />
    </div>
  );
}

export function PresetCard({ preset, selected, onSelect }: PresetCardProps) {
  const config = preset.config as Record<string, any>;

  // Get visual properties for preview
  const bgColor = config.cardBackground || config.cardBg || '#27272a';
  const isGradient = bgColor?.includes('gradient');

  return (
    <button
      onClick={() => onSelect(preset)}
      className={`group relative p-4 rounded-xl border-2 transition-all text-left ${
        selected
          ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800/50'
      }`}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      )}

      {/* Preview area */}
      <div
        className="h-24 rounded-lg mb-3 p-3 flex items-center justify-center overflow-hidden"
        style={{
          background: isGradient ? bgColor : undefined,
          backgroundColor: !isGradient ? bgColor : undefined
        }}
      >
        <div className="w-full max-w-[120px]">
          {getLayoutPreview(preset)}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {getSignatureIcon(preset)}
          <span className="font-medium text-sm text-white truncate flex-1">
            {preset.name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="capitalize">{preset.signature.kind}</span>
          {preset.signature.kind === 'related' && preset.signature.target && (
            <>
              <span className="text-zinc-600">·</span>
              <span className="capitalize">{preset.signature.target}</span>
              <span className="text-zinc-600">·</span>
              <span>{preset.signature.cardinality}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
