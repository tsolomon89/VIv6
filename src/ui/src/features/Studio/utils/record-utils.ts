import type { Entity } from '../../../lib/api';

/**
 * Extracts a value from a Record Entity, handling both direct properties and nested EAV fields.
 * Strategies:
 * 1. Direct property access (e.g. 'name', 'id').
 * 2. Field lookup by exact name.
 * 3. Field lookup by slugified match (e.g. 'email' -> 'Email', 'primaryPersona' -> 'Primary Persona').
 */
export const getRecordValue = (entity: Entity, key: string | undefined): unknown => {
    if (!key || !entity) return undefined;

    // 1. Direct Property Access
    if (key in entity) {
        return (entity as unknown as Record<string, unknown>)[key];
    }

    // 1.5 Loose Data Access (for non-fieldGroup structures)
    if (entity.data && key in entity.data) {
        return (entity.data as unknown as Record<string, unknown>)[key];
    }

    // 2. Data/Fields Traversal
    if (entity.data && entity.data.fieldGroups) {
        // Flatten all fields for searching
        const allFields = entity.data.fieldGroups.flatMap((g) => g.fields);
        
        // Strategy A: Exact Match
        const exactMatch = allFields.find((f) => f.name === key);
        if (exactMatch) return exactMatch.value;

        // Strategy B: Slug/Camel Match
        // "primaryPersona" should match "Primary Persona"
        const targetSlug = key.toLowerCase().replace(/\s+/g, '');
        const looseMatch = allFields.find((f) => {
            const fieldSlug = f.name.toLowerCase().replace(/\s+/g, '');
            // Check matches (ignoring spaces and casing)
            return fieldSlug === targetSlug || fieldSlug === key.toLowerCase();
        });

        if (looseMatch) return looseMatch.value;
    }

    return undefined;
};

/**
 * Helper to join multiple values (e.g. for Title composition)
 */
export const getRecordMultiValue = (entity: Entity, keys: string[]): string => {
    return keys.map(k => getRecordValue(entity, k)).filter(Boolean).join(' • ');
};

/**
 * Safely converts unknown value to string for rendering.
 * Returns empty string for null/undefined, otherwise String(value).
 */
export const toDisplayString = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return String(value);
};

/**
 * Gets a record value as a string (safe for rendering).
 */
export const getRecordValueAsString = (entity: Entity, key: string | undefined): string => {
    return toDisplayString(getRecordValue(entity, key));
};

/**
 * Formats a date string into a relative time string (e.g. "2 hours ago").
 */
export const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
};
