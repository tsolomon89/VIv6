import { getRecord, updateRecord, listRecords, getRecordBySlug, createRecord } from '../records.js';
import { createRelationship } from '../relationships.js';
import { createAccount, getAccountBySlug } from '../accounts.js';
import { validateConstraints, Violation } from './constraints.js';
import { DataRecord } from '../types.js';
import { EntitySchemas, EntityType, AccountDataSchema } from '../schema/definitions.js';
import { z } from 'zod';

/**
 * Agent Tool: Read Record
 */
export function readEntityTool(idOrSlug: string): DataRecord | undefined {
    // Try UUID format
    if (idOrSlug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return getRecord(idOrSlug);
    }
    // Note: getRecordBySlug now strictly requires accountId to be precise,
    // but for legacy tool compatibility we might just return the first match or fail?
    // Let's assume global lookup for unique slugs if accountId is not provided,
    // or we might need to update this signature too.
    return getRecordBySlug(idOrSlug);
}

/**
 * Agent Tool: Get Entity Schema
 */
export function getSchemaTool(type: EntityType) {
    const schema = EntitySchemas[type];
    if (!schema) throw new Error(`Unknown entity type: ${type}`);
    return Object.keys((schema.shape as any).data.shape);
}

/**
 * Agent Tool: Create Account (New)
 */
export function createAccountTool(name: string, data: Record<string, any>) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Validate Data
    const result = AccountDataSchema.safeParse(data);
    if (!result.success) {
        throw new Error(`Account Data Validation Failed: ${result.error.message}`);
    }

    const account = createAccount({
        name,
        slug,
        type: 'client',
        account_class: 'business', // Default
        data: result.data
    });
    return account;
}

/**
 * Agent Tool: Create Record
 */
export function createEntityTool(type: EntityType, name: string, data: Record<string, any>, accountId: string) {
    const schema = EntitySchemas[type];
    if (!schema) throw new Error(`Unknown entity type: ${type}`);

    if (!accountId) throw new Error("accountId is required to create a record");

    // Auto-slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Validate Data
    const recordInput = {
        type,
        name,
        slug,
        account_id: accountId,
        data
    };

    // Zod Validation
    const result = schema.safeParse(recordInput);
    if (!result.success) {
        throw new Error(`Validation Failed: ${result.error.message}`);
    }

    // Create - Explicitly pass account_id to satisfy type requirement (Zod has it optional)
    const record = createRecord({
        ...result.data,
        account_id: accountId
    });
    return record;
}

/**
 * Agent Tool: Update Field
 */
export function updateEntityFieldTool(id: string, field: string, value: any) {
    const record = getRecord(id);
    if (!record) throw new Error(`Record ${id} not found`);

    // Check if top-level or data
    const isTopLevel = ['name', 'description', 'slug', 'type', 'account_id', 'summary'].includes(field);

    let updates: any = {};
    if (isTopLevel) {
        updates[field] = value;
    } else {
        updates.data = { ...record.data, [field]: value };
    }

    const updated = updateRecord(id, updates);
    if (!updated) throw new Error("Update failed");

    // Check constraints
    const violations = validateConstraints(updated);

    return {
        success: true,
        record: updated,
        violations: violations.length > 0 ? violations : null
    };
}

/**
 * Agent Tool: Link Records
 */
export function linkEntityTool(fromId: string, toId: string, relationshipType: string, data?: Record<string, any>) {
    const rel = createRelationship({
        from_record_id: fromId,
        to_record_id: toId,
        relationship_type: relationshipType,
        data
    });
    return rel;
}
