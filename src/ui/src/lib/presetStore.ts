/**
 * Preset Store
 *
 * Singleton store for presentation presets loaded from backend.
 * Replaces client-side PRESET_REGISTRY with backend-driven presets.
 */

import { api } from './api';
import type { PresentationPreset, Binding, BindingSignature } from './api';

class PresetStore {
  private presets: Map<string, PresentationPreset> = new Map();
  private loaded = false;
  private loading: Promise<void> | null = null;

  /**
   * Load all presets from backend (once)
   */
  async load(): Promise<void> {
    if (this.loaded) return;

    // Prevent concurrent loads
    if (this.loading) {
      return this.loading;
    }

    this.loading = this._doLoad();
    return this.loading;
  }

  private async _doLoad(): Promise<void> {
    try {
      const presets = await api.listPresets();
      this.presets.clear();
      presets.forEach(p => this.presets.set(p.key, p));
      this.loaded = true;
      console.log(`[PresetStore] Loaded ${presets.length} presets`);
    } catch (err) {
      console.error('[PresetStore] Failed to load presets:', err);
      throw err;
    } finally {
      this.loading = null;
    }
  }

  /**
   * Force reload presets from backend
   */
  async reload(): Promise<void> {
    this.loaded = false;
    this.loading = null;
    return this.load();
  }

  /**
   * Check if presets are loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get a preset by key
   */
  get(key: string): PresentationPreset | undefined {
    return this.presets.get(key);
  }

  /**
   * List all presets with optional filter
   */
  list(filter?: { signatureKind?: 'self' | 'related'; target?: string; cardinality?: 'one' | 'many' }): PresentationPreset[] {
    let results = Array.from(this.presets.values());

    if (filter?.signatureKind) {
      results = results.filter(p => p.signature.kind === filter.signatureKind);
    }

    if (filter?.target) {
      results = results.filter(p => {
        if (p.signature.kind === 'related') {
          return p.signature.target === filter.target;
        }
        return false;
      });
    }

    if (filter?.cardinality) {
      results = results.filter(p => {
        if (p.signature.kind === 'related') {
          return p.signature.cardinality === filter.cardinality;
        }
        return true; // 'self' presets don't have cardinality
      });
    }

    return results;
  }

  /**
   * Get all preset keys
   */
  keys(): string[] {
    return Array.from(this.presets.keys());
  }

  /**
   * Get presets compatible with a binding
   */
  getCompatible(binding: Binding): PresentationPreset[] {
    return Array.from(this.presets.values()).filter(preset =>
      this.matchesSignature(preset.signature, binding)
    );
  }

  /**
   * Check if a preset signature matches a binding
   */
  matchesSignature(signature: BindingSignature, binding: Binding): boolean {
    // Kind must match
    if (signature.kind !== binding.kind) {
      return false;
    }

    // For 'self', no further checks
    if (signature.kind === 'self') {
      return true;
    }

    // For 'related', target and cardinality must match
    if (signature.kind === 'related' && binding.kind === 'related') {
      if (signature.target && signature.target !== binding.target) {
        return false;
      }
      if (signature.cardinality && signature.cardinality !== binding.cardinality) {
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Get the first compatible preset for a binding, or null
   */
  getDefaultPreset(binding: Binding): PresentationPreset | null {
    const compatible = this.getCompatible(binding);
    return compatible.length > 0 ? compatible[0] : null;
  }

  /**
   * Check if a preset key is compatible with a binding
   */
  isCompatible(presetKey: string, binding: Binding): boolean {
    const preset = this.get(presetKey);
    if (!preset) return false;
    return this.matchesSignature(preset.signature, binding);
  }
}

// Singleton instance
export const presetStore = new PresetStore();

// React hook for preset store
import { useState, useEffect } from 'react';

export function usePresetStore() {
  const [loaded, setLoaded] = useState(presetStore.isLoaded());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!loaded) {
      presetStore.load()
        .then(() => setLoaded(true))
        .catch(err => setError(err));
    }
  }, [loaded]);

  return {
    loaded,
    error,
    get: presetStore.get.bind(presetStore),
    list: presetStore.list.bind(presetStore),
    getCompatible: presetStore.getCompatible.bind(presetStore),
    isCompatible: presetStore.isCompatible.bind(presetStore),
    getDefaultPreset: presetStore.getDefaultPreset.bind(presetStore),
    reload: async () => {
      await presetStore.reload();
      setLoaded(true);
    },
  };
}
