
import { ConfigState } from '../types';

/**
 * Deep merges overrides into a base configuration.
 * - Objects are merged recursively.
 * - Arrays are replaced (no merging of indices).
 * - Primitives are replaced.
 * - Specific handling for NumberParam to allow partial updates if needed, 
 *   though usually they are treated as atomic.
 */
export const applyOverrides = (base: any, overrides: any): any => {
    if (!overrides) return base;
    if (!base) return overrides;

    // If types differ significantly or it's an array, just replace
    if (typeof base !== typeof overrides || Array.isArray(overrides)) {
        return overrides;
    }

    // If it's a primitive value (not object), replace
    if (typeof overrides !== 'object' || overrides === null) {
        return overrides;
    }

    const result = { ...base };

    for (const key of Object.keys(overrides)) {
        const baseVal = base[key];
        const overrideVal = overrides[key];

        // Handle specific cases or recursion
        if (typeof overrideVal === 'object' && overrideVal !== null && !Array.isArray(overrideVal)) {
            // Check if it's a leaf object we want to merge or atomic?
            // For ConfigState, deeply merging objects like listTemplate or nested params is good.
            if (baseVal && typeof baseVal === 'object' && !Array.isArray(baseVal)) {
                result[key] = applyOverrides(baseVal, overrideVal);
            } else {
                result[key] = overrideVal;
            }
        } else {
            // Primitives or Arrays -> Replace
            result[key] = overrideVal;
        }
    }

    return result;
};
