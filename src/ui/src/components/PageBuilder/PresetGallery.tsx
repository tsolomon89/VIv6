import { useState, useMemo } from 'react';
import { X, Search, Grid, User, Package, Filter } from 'lucide-react';
import { usePresetStore } from '../../lib/presetStore';
import { PresetCard } from './PresetCard';
import type { PresentationPreset, Binding } from '../../lib/api';

interface PresetGalleryProps {
  /** Called when a preset is selected */
  onSelect: (preset: PresentationPreset) => void;
  /** Called to close the gallery */
  onClose: () => void;
  /** Optional: filter to specific binding type */
  bindingFilter?: Binding;
  /** Optional: title override */
  title?: string;
}

type FilterKind = 'all' | 'self' | 'related';
type FilterTarget = 'all' | 'product' | 'feature' | 'solution' | 'useCase' | 'brand';

export function PresetGallery({ onSelect, onClose, bindingFilter, title = 'Choose a Section Template' }: PresetGalleryProps) {
  const { loaded, error, list, getCompatible } = usePresetStore();

  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<FilterKind>(
    bindingFilter?.kind === 'self' ? 'self' :
    bindingFilter?.kind === 'related' ? 'related' : 'all'
  );
  const [targetFilter, setTargetFilter] = useState<FilterTarget>(
    bindingFilter?.kind === 'related' && bindingFilter.target ? bindingFilter.target as FilterTarget : 'all'
  );
  const [selectedPreset, setSelectedPreset] = useState<PresentationPreset | null>(null);

  // Get presets based on filters
  const presets = useMemo(() => {
    if (!loaded) return [];

    // If we have a binding filter, use getCompatible
    if (bindingFilter) {
      return getCompatible(bindingFilter);
    }

    // Otherwise use list with manual filters
    let results = list();

    if (kindFilter !== 'all') {
      results = results.filter(p => p.signature.kind === kindFilter);
    }

    if (targetFilter !== 'all' && kindFilter === 'related') {
      results = results.filter(p => {
        if (p.signature.kind === 'related') {
          return p.signature.target === targetFilter;
        }
        return false;
      });
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.key.toLowerCase().includes(searchLower)
      );
    }

    return results;
  }, [loaded, list, getCompatible, bindingFilter, kindFilter, targetFilter, search]);

  // Group presets by kind for better organization
  const groupedPresets = useMemo(() => {
    const selfPresets = presets.filter(p => p.signature.kind === 'self');
    const relatedPresets = presets.filter(p => p.signature.kind === 'related');
    return { self: selfPresets, related: relatedPresets };
  }, [presets]);

  const handleSelect = (preset: PresentationPreset) => {
    setSelectedPreset(preset);
  };

  const handleConfirm = () => {
    if (selectedPreset) {
      onSelect(selectedPreset);
      onClose();
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-2xl p-8 max-w-md text-center">
          <p className="text-red-400 mb-4">Failed to load presets</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-zinc-950 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Select a visual template for your section
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-zinc-800 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search presets..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Filter pills */}
          {!bindingFilter && (
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Filter size={12} />
                <span>Type:</span>
              </div>
              {(['all', 'self', 'related'] as FilterKind[]).map((kind) => (
                <button
                  key={kind}
                  onClick={() => setKindFilter(kind)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    kindFilter === kind
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {kind === 'all' ? 'All' : kind === 'self' ? 'Self (Hero/CTA)' : 'Related'}
                </button>
              ))}

              {kindFilter === 'related' && (
                <>
                  <div className="w-px h-6 bg-zinc-800 mx-2" />
                  {(['all', 'product', 'feature', 'solution', 'brand'] as FilterTarget[]).map((target) => (
                    <button
                      key={target}
                      onClick={() => setTargetFilter(target)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                        targetFilter === target
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {target}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Preset Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {!loaded ? (
            <div className="flex items-center justify-center h-48 text-zinc-500">
              <div className="w-6 h-6 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : presets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
              <Grid size={32} className="mb-2 opacity-50" />
              <p>No presets match your filters</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Self presets */}
              {groupedPresets.self.length > 0 && (
                <div>
                  {kindFilter === 'all' && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-zinc-400">
                      <User size={14} />
                      <span className="font-medium">Hero & CTA Sections</span>
                      <span className="text-zinc-600">({groupedPresets.self.length})</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {groupedPresets.self.map((preset) => (
                      <PresetCard
                        key={preset.key}
                        preset={preset}
                        selected={selectedPreset?.key === preset.key}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Related presets */}
              {groupedPresets.related.length > 0 && (
                <div>
                  {kindFilter === 'all' && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-zinc-400">
                      <Package size={14} />
                      <span className="font-medium">Content Collections</span>
                      <span className="text-zinc-600">({groupedPresets.related.length})</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {groupedPresets.related.map((preset) => (
                      <PresetCard
                        key={preset.key}
                        preset={preset}
                        selected={selectedPreset?.key === preset.key}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="text-sm text-zinc-500">
            {selectedPreset ? (
              <span>Selected: <span className="text-white font-medium">{selectedPreset.name}</span></span>
            ) : (
              <span>Click a preset to select it</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedPreset}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg transition-colors text-sm font-medium disabled:cursor-not-allowed"
            >
              Add Section
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
