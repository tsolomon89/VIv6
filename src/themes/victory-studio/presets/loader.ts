/**
 * Preset Loader
 *
 * Dynamically loads presets from the backend API and merges them with
 * the local full-config registry. This allows:
 * - New presets added to DB to be available in the theme
 * - Local presets to retain their full WebGL configurations
 * - Graceful fallback if API is unavailable
 */

import { PRESET_REGISTRY } from './registry';
import { apiClient, PresentationPresetAPI } from '../api/client';
import type { PresentationPreset } from '../types';

// Merged registry: local full configs take precedence, DB-only presets added
let mergedRegistry: Record<string, PresentationPreset> = {};
let loaded = false;
let loading: Promise<void> | null = null;

/**
 * Initialize the merged registry with local presets
 */
function initRegistry(): void {
    if (Object.keys(mergedRegistry).length === 0) {
        mergedRegistry = { ...PRESET_REGISTRY };
    }
}

/**
 * Load presets from the backend API and merge with local registry.
 * Local presets (with full WebGL configs) take precedence.
 * New presets from DB are added to the registry.
 */
export async function loadPresets(): Promise<void> {
    if (loaded) return;

    // Prevent concurrent loads
    if (loading) {
        return loading;
    }

    loading = _doLoad();
    return loading;
}

async function _doLoad(): Promise<void> {
    initRegistry();

    try {
        const dbPresets = await apiClient.listPresets();
        let addedCount = 0;

        for (const preset of dbPresets) {
            if (!mergedRegistry[preset.key]) {
                // New preset from DB - convert API format to local format
                mergedRegistry[preset.key] = convertAPIPreset(preset);
                console.log(`[PresetLoader] Added DB preset: ${preset.key}`);
                addedCount++;
            }
            // Existing local presets keep their full config (DB has simplified version)
        }

        loaded = true;
        console.log(`[PresetLoader] Loaded ${dbPresets.length} presets from DB (${addedCount} new)`);
    } catch (err) {
        console.warn('[PresetLoader] Failed to load from DB, using local only:', err);
        // Still mark as loaded so we don't retry indefinitely
        loaded = true;
    } finally {
        loading = null;
    }
}

/**
 * Convert API preset format to local PresentationPreset format
 */
function convertAPIPreset(apiPreset: PresentationPresetAPI): PresentationPreset {
    return {
        key: apiPreset.key,
        signature: {
            kind: apiPreset.signature.kind,
            target: apiPreset.signature.target,
            cardinality: apiPreset.signature.cardinality
        },
        config: apiPreset.config as any
    };
}

/**
 * Get a preset by key from the merged registry
 */
export function getPreset(key: string): PresentationPreset | undefined {
    initRegistry();
    return mergedRegistry[key];
}

/**
 * Get all presets from the merged registry
 */
export function getAllPresets(): PresentationPreset[] {
    initRegistry();
    return Object.values(mergedRegistry);
}

/**
 * Get the full merged registry
 */
export function getPresetRegistry(): Record<string, PresentationPreset> {
    initRegistry();
    return mergedRegistry;
}

/**
 * Check if presets have been loaded from the API
 */
export function isLoaded(): boolean {
    return loaded;
}

/**
 * Force reload presets from API
 */
export async function reloadPresets(): Promise<void> {
    loaded = false;
    loading = null;
    return loadPresets();
}
