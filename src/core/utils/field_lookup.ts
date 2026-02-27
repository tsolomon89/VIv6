/**
 * Field Lookup Utility
 *
 * Provides mapping from canonical field names to display names.
 * This allows code to reference fields by consistent internal names
 * while supporting different display names per entity type.
 *
 * Usage:
 *   const fieldName = getFieldDisplayName('contact', 'email'); // Returns "Email"
 *   const field = findField(groups, getFieldDisplayName('contact', 'email'));
 */

import { db } from '../db.js';

interface FieldMapping {
    [canonicalName: string]: string;  // canonical -> display name
}

interface FieldConfig {
    entity_type: string;
    fields: FieldMapping;
}

// Cache for field configs (loaded once from DB)
let fieldConfigCache: Map<string, FieldMapping> | null = null;

// Default field mappings (used as fallback if DB isn't seeded)
const DEFAULT_FIELD_MAPPINGS: Record<string, FieldMapping> = {
    contact: {
        email: 'Email',
        job_title: 'Job Title',
        persona: 'Persona',
        health_score: 'Health Score',
        owner: 'Owner',
        account: 'Account',
        last_interaction: 'Last Interaction',
        phone: 'Phone',
        first_name: 'First Name',
        last_name: 'Last Name',
    },
    account: {
        website: 'Website',
        industry: 'Industry',
        company_size: 'Company Size',
        name: 'Name',
        owner: 'Owner',
    },
    opportunity: {
        amount: 'Amount',
        probability: 'Probability',
        opportunity_stage: 'Opportunity Stage',
        target_close_date: 'Target Close Date',
        intent_verified: 'Intent Verified',
        projected_yield: 'Projected Yield',
        stage_last_updated: 'Stage Last Updated',
        source_opportunity_id: 'Source Opportunity ID',
        owner: 'Owner',
        account: 'Account',
        contact: 'Contact',
        pipeline_type: 'Pipeline Type',
        value: 'Value',
    },
    activity: {
        contact: 'Contact',
        owner: 'Owner',
        status: 'Status',
        due_date: 'Due Date',
        completed_at: 'Completed At',
    },
};

/**
 * Load field configs from the database.
 * Results are cached after first load.
 */
function loadFieldConfigs(): Map<string, FieldMapping> {
    if (fieldConfigCache) return fieldConfigCache;

    // Initialize with defaults
    fieldConfigCache = new Map(
        Object.entries(DEFAULT_FIELD_MAPPINGS)
    );

    try {
        const rows = db.prepare(`
            SELECT data
            FROM records
            WHERE type = 'field_config' AND account_id = '00000000-0000-0000-0000-000000000000'
        `).all() as Array<{ data: string }>;

        for (const row of rows) {
            const config: FieldConfig = JSON.parse(row.data);
            if (config.entity_type && config.fields) {
                // Merge with defaults (DB values override)
                const existing = fieldConfigCache.get(config.entity_type) || {};
                fieldConfigCache.set(config.entity_type, {
                    ...existing,
                    ...config.fields,
                });
            }
        }

        console.log(`[FieldLookup] Loaded field configs for ${fieldConfigCache.size} entity types`);
    } catch (err) {
        console.warn(`[FieldLookup] Failed to load field configs from DB, using defaults:`, err);
    }

    return fieldConfigCache;
}

/**
 * Get the display name for a field given its canonical name and entity type.
 *
 * @param ObjectType - The entity type (e.g., 'contact', 'opportunity')
 * @param canonicalName - The canonical field name (e.g., 'email', 'health_score')
 * @returns The display name (e.g., 'Email', 'Health Score') or the canonical name if not found
 */
export function getFieldDisplayName(ObjectType: string, canonicalName: string): string {
    const configs = loadFieldConfigs();
    const entityFields = configs.get(ObjectType);
    return entityFields?.[canonicalName] ?? canonicalName;
}

/**
 * Get all field mappings for an entity type.
 *
 * @param ObjectType - The entity type
 * @returns Object mapping canonical names to display names
 */
export function getFieldMappings(ObjectType: string): FieldMapping {
    const configs = loadFieldConfigs();
    return configs.get(ObjectType) ?? {};
}

/**
 * Check if a display name matches a canonical field name for an entity type.
 *
 * @param ObjectType - The entity type
 * @param displayName - The display name to check
 * @param canonicalName - The canonical name to match against
 * @returns True if the display name matches the canonical field
 */
export function isFieldMatch(ObjectType: string, displayName: string, canonicalName: string): boolean {
    const expectedDisplayName = getFieldDisplayName(ObjectType, canonicalName);
    return displayName === expectedDisplayName || displayName === canonicalName;
}

/**
 * Clear the field config cache (useful for testing or after seed updates)
 */
export function clearFieldConfigCache(): void {
    fieldConfigCache = null;
}

// Convenience constants for common entity types
export const ContactFields = {
    EMAIL: 'email',
    JOB_TITLE: 'job_title',
    PERSONA: 'persona',
    HEALTH_SCORE: 'health_score',
    OWNER: 'owner',
    ACCOUNT: 'account',
    LAST_INTERACTION: 'last_interaction',
} as const;

export const OpportunityFields = {
    AMOUNT: 'amount',
    PROBABILITY: 'probability',
    STAGE: 'opportunity_stage',
    TARGET_CLOSE_DATE: 'target_close_date',
    INTENT_VERIFIED: 'intent_verified',
    PROJECTED_YIELD: 'projected_yield',
    STAGE_LAST_UPDATED: 'stage_last_updated',
    SOURCE_OPPORTUNITY_ID: 'source_opportunity_id',
    OWNER: 'owner',
    ACCOUNT: 'account',
    CONTACT: 'contact',
    PIPELINE_TYPE: 'pipeline_type',
    VALUE: 'value',
} as const;

export const AccountFields = {
    WEBSITE: 'website',
    INDUSTRY: 'industry',
    COMPANY_SIZE: 'company_size',
    NAME: 'name',
    OWNER: 'owner',
} as const;

export const ActivityFields = {
    CONTACT: 'contact',
    OWNER: 'owner',
    STATUS: 'status',
    DUE_DATE: 'due_date',
    COMPLETED_AT: 'completed_at',
} as const;

