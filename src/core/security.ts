import { DataRecordInput, EntityType } from './types.js';

// --- Tier Definitions ---

export enum RecordTier {
    KERNEL = 0,
    CONFIGURATION = 1,
    TENANT_DATA = 2
}

const TIER_1_TYPES: EntityType[] = ['object_def', 'field_def'];

export function getRecordTier(type: EntityType): RecordTier {
    if (TIER_1_TYPES.includes(type)) {
        return RecordTier.CONFIGURATION;
    }
    // Default to Tier 2
    return RecordTier.TENANT_DATA;
}

// --- Permission Logic ---

export interface UserContext {
    userId: string;
    accountId: string;
    permissionLevel: 'admin' | 'editor' | 'viewer';
}

export function canCreateRecord(context: UserContext, type: EntityType): boolean {
    const tier = getRecordTier(type);

    if (tier === RecordTier.KERNEL) return false; // Immutable via API
    
    if (tier === RecordTier.CONFIGURATION) {
        return context.permissionLevel === 'admin';
    }

    // Tier 2: Tenant Data
    // Admin can always create? Or Editor?
    return ['admin', 'editor'].includes(context.permissionLevel);
}

export function canUpdateRecord(context: UserContext, record: DataRecordInput): boolean {
    const tier = getRecordTier(record.type);

    if (tier === RecordTier.KERNEL) return false;

    if (tier === RecordTier.CONFIGURATION) {
        return context.permissionLevel === 'admin';
    }

    // Tier 2
    // Check ownership?
    if (record.account_id && record.account_id !== context.accountId) {
        // Multi-tenant check
        // Unless admin is super-admin (system admin). 
        // For now, assume context.accountId is the acting scope.
         if (context.permissionLevel !== 'admin') return false; 
    }

    return ['admin', 'editor'].includes(context.permissionLevel);
}

export function canDeleteRecord(context: UserContext, record: DataRecordInput): boolean {
    return canUpdateRecord(context, record); // delete ~= update
}

// --- Hook Registration ---

import { hooks } from './hooks.js';

export function initSecurityHooks() {
    console.log('[Security] Initializing Security Hooks (Tier 0)...');

    hooks.onPreCreate('check_permission', async (record, context) => {
        // context matches express-request-context structure
        // But hooks context might be different. We need to ensure context is passed.
        // For now, we assume context is passed as second arg to emitPreCreate
        if (!context || !context.userId) {
             // If context is missing, it might be internal system operation (e.g. seeding).
             // Allow internal ops or block?
             // System ops usually don't have user context.
             return;
        }
        
        if (!canCreateRecord(context, record.type)) {
            throw new Error(`[Security] User ${context.userId} cannot CREATE record of type ${record.type} (Tier ${getRecordTier(record.type)})`);
        }
    });

    hooks.onPreUpdate('check_permission', async (record, context) => {
        if (!context || !context.userId) return;

        if (!canUpdateRecord(context, record)) {
             throw new Error(`[Security] User ${context.userId} cannot UPDATE record ${record.id} (Tier ${getRecordTier(record.type)})`);
        }
    });

    hooks.onPreDelete('check_permission', async (record, context) => {
        if (!context || !context.userId) return;
        
        // Cast to DataRecordInput to satisfy interface, though delete only needs ID usually.
        // But hook passes the full record.
        if (!canDeleteRecord(context, record as DataRecordInput)) {
             throw new Error(`[Security] User ${context.userId} cannot DELETE record ${record.id} (Tier ${getRecordTier(record.type)})`);
        }
    });
}
