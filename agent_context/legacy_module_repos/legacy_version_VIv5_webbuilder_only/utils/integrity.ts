
import { PresetRegistry, ConfigState } from '../types';
import { PRESET_MANIFEST } from '../presets/manifest';
import { hashConfig } from './hashing';

export interface IntegrityIssue {
    key: string;
    expected: string;
    actual: string;
    status: 'missing_in_manifest' | 'mismatch' | 'version_violation';
}

const LOCKED_VERSION_REGEX = /\.v\d+$/; // e.g. .v1, .v2

// Check a single preset configuration against the manifest
export const validatePresetIntegrity = (key: string, config: ConfigState): IntegrityIssue | null => {
    const actualHash = hashConfig(config);
    const expectedHash = PRESET_MANIFEST[key];

    if (!expectedHash) {
        return { key, expected: '', actual: actualHash, status: 'missing_in_manifest' };
    }

    if (actualHash !== expectedHash) {
        // Guard: If this is a versioned preset (e.g. .v1), any change is a Violation.
        if (LOCKED_VERSION_REGEX.test(key)) {
            return {
                key,
                expected: expectedHash,
                actual: actualHash,
                status: 'version_violation'
            };
        } else {
            return {
                key,
                expected: expectedHash,
                actual: actualHash,
                status: 'mismatch'
            };
        }
    }

    return null;
};

// Batch check for the entire registry (used by Header/Debug UI)
export const checkPresetIntegrity = (registry: PresetRegistry): IntegrityIssue[] => {
    const issues: IntegrityIssue[] = [];

    Object.entries(registry).forEach(([key, preset]) => {
        const issue = validatePresetIntegrity(key, preset.config as ConfigState);
        if (issue) {
            issues.push(issue);
        }
    });

    return issues;
};

export const generateManifestLog = (registry: PresetRegistry) => {
    const map: Record<string, string> = {};
    Object.entries(registry).forEach(([key, preset]) => {
        map[key] = hashConfig(preset.config);
    });
    
    if (Object.keys(map).length > 0) {
        console.groupCollapsed("📋 Generated Preset Manifest (Copy to presets/manifest.ts)");
        console.log(JSON.stringify(map, null, 4));
        console.groupEnd();
    }
};
