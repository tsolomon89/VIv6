/**
 * ODAC - Opportunity-Driven Access Control
 *
 * The heart of the auth system. Queries active employment opportunities
 * to derive capabilities.
 *
 * Key concept:
 * - Products with product_type='HUM' represent Job Titles
 * - Opportunities with stage='ftp' (WON) grant active employment
 * - Product.capabilities defines what permissions the role grants
 * - Temporal validity via Start Date / End Date fields
 */

import { db } from '../../core/db.js';
import { getRecord } from '../../core/records.js';
import { getFieldDisplayName, OpportunityFields } from '../../core/utils/field_lookup.js';

export interface UserCapabilities {
    userId: string;
    accountId: string;
    capabilities: string[];
    roles: string[];          // Product slugs (job titles)
    opportunityIds: string[]; // The WON opportunities granting access
}

export interface AccountAccess {
    accountId: string;
    accountName: string;
    accountSlug: string;
    capabilities: string[];
    roles: string[];
}

/**
 * Helper to find field value in canonical fieldGroups structure
 */
function findFieldValue(data: any, fieldName: string): any {
    const fieldGroups = data?.fieldGroups || [];
    for (const group of fieldGroups) {
        const fields = group.fieldStructs || group.fields || [];
        for (const field of fields) {
            if ((field.nameField || field.name) === fieldName) {
                if (field.propertyStructs?.[0]) {
                    return field.propertyStructs[0].valueProperty;
                }
                return field.value;
            }
        }
    }
    return undefined;
}

/**
 * Get capabilities for a user in a specific account via ODAC.
 *
 * Query: Find all Opportunities where:
 *   - User is linked (via User ID field)
 *   - Opportunity stage = 'ftp' (WON)
 *   - Product in line_items has product_type = 'HUM'
 *   - Start Date <= now <= End Date (or End Date is null)
 */
export function getUserCapabilities(userId: string, accountId: string): UserCapabilities {
    const capabilities: Set<string> = new Set();
    const roles: Set<string> = new Set();
    const opportunityIds: string[] = [];

    try {
        // Find opportunities in this account
        const stmt = db.prepare(`
            SELECT r.id, r.data
            FROM records r
            WHERE r.account_id = ?
              AND r.type = 'opportunity'
              AND r.deleted_at IS NULL
        `);

        const opportunities = stmt.all(accountId) as any[];
        const now = new Date().toISOString();

        for (const opp of opportunities) {
            const data = typeof opp.data === 'string' ? JSON.parse(opp.data) : opp.data;

            // Check if this opportunity is for this user
            const userIdField = findFieldValue(data, 'User ID');
            if (userIdField !== userId) continue;

            // Check stage is WON (ftp) - using schema-aware field name
            const stageFieldName = getFieldDisplayName('opportunity', OpportunityFields.STAGE);
            const stage = findFieldValue(data, stageFieldName);
            if (stage !== 'ftp') continue;

            // Check temporal validity
            const startDate = findFieldValue(data, 'Start Date');
            const endDate = findFieldValue(data, 'End Date');
            if (startDate && startDate > now) continue;
            if (endDate && endDate < now) continue;

            // This opportunity grants access - extract capabilities from line items
            const lineItems = data.line_items || [];
            for (const item of lineItems) {
                if (!item.product_id) continue;

                const product = getRecord(item.product_id);
                if (!product) continue;

                const productData = product.data || {};
                // Check if this is an HR product (job title)
                if (productData.product_type !== 'HUM') continue;

                // Add capabilities from this HR product
                const caps = productData.capabilities || [];
                caps.forEach((c: string) => capabilities.add(c));
                roles.add(product.slug);
            }

            opportunityIds.push(opp.id);
        }
    } catch (error) {
        console.error('[ODAC] Error fetching capabilities:', error);
    }

    return {
        userId,
        accountId,
        capabilities: Array.from(capabilities),
        roles: Array.from(roles),
        opportunityIds
    };
}

/**
 * Check if user has a specific capability in an account.
 * Supports wildcard patterns like 'admin:*' and '*:*'
 */
export function hasCapability(userId: string, accountId: string, capability: string): boolean {
    const { capabilities } = getUserCapabilities(userId, accountId);

    // Check exact match
    if (capabilities.includes(capability)) return true;

    // Check wildcard patterns
    const [action, resource] = capability.split(':');

    // admin:* matches admin:users, admin:records, etc.
    if (capabilities.includes(`${action}:*`)) return true;

    // *:records matches read:records, write:records, etc.
    if (capabilities.includes(`*:${resource}`)) return true;

    // *:* matches everything
    if (capabilities.includes('*:*')) return true;

    return false;
}

/**
 * Check if user has ANY of the specified capabilities
 */
export function hasAnyCapability(userId: string, accountId: string, capabilities: string[]): boolean {
    return capabilities.some(cap => hasCapability(userId, accountId, cap));
}

/**
 * Check if user has ALL of the specified capabilities
 */
export function hasAllCapabilities(userId: string, accountId: string, capabilities: string[]): boolean {
    return capabilities.every(cap => hasCapability(userId, accountId, cap));
}

/**
 * Get all accounts a user has active access to via ODAC.
 */
export function getUserAccounts(userId: string): AccountAccess[] {
    const result: AccountAccess[] = [];

    try {
        // Get all accounts that have opportunities
        const stmt = db.prepare(`
            SELECT DISTINCT a.id, a.name, a.slug
            FROM accounts a
            WHERE EXISTS (
                SELECT 1 FROM records r
                WHERE r.account_id = a.id
                  AND r.type = 'opportunity'
                  AND r.deleted_at IS NULL
            )
        `);

        const accounts = stmt.all() as any[];

        for (const acc of accounts) {
            const caps = getUserCapabilities(userId, acc.id);
            // Only include if user has any capabilities
            if (caps.capabilities.length > 0) {
                result.push({
                    accountId: acc.id,
                    accountName: acc.name,
                    accountSlug: acc.slug,
                    capabilities: caps.capabilities,
                    roles: caps.roles
                });
            }
        }
    } catch (error) {
        console.error('[ODAC] Error fetching user accounts:', error);
    }

    return result;
}

/**
 * Get the primary account for a user (first account with access, or the one
 * stored in users.primary_account_id if valid)
 */
export function getUserPrimaryAccount(userId: string): AccountAccess | null {
    try {
        // Check if user has a stored primary account preference
        const userStmt = db.prepare('SELECT primary_account_id FROM users WHERE id = ?');
        const user = userStmt.get(userId) as any;

        if (user?.primary_account_id) {
            const caps = getUserCapabilities(userId, user.primary_account_id);
            if (caps.capabilities.length > 0) {
                const accStmt = db.prepare('SELECT id, name, slug FROM accounts WHERE id = ?');
                const acc = accStmt.get(user.primary_account_id) as any;
                if (acc) {
                    return {
                        accountId: acc.id,
                        accountName: acc.name,
                        accountSlug: acc.slug,
                        capabilities: caps.capabilities,
                        roles: caps.roles
                    };
                }
            }
        }

        // Fallback: return first account with access
        const accounts = getUserAccounts(userId);
        return accounts[0] || null;
    } catch (error) {
        console.error('[ODAC] Error fetching primary account:', error);
        return null;
    }
}

/**
 * Grant access to a user by creating an employment opportunity
 *
 * This is a convenience function that creates the necessary records
 * to grant a user access to an account.
 */
export async function grantAccess(
    userId: string,
    accountId: string,
    hrProductId: string,
    options: {
        startDate?: string;
        endDate?: string | null;
        opportunityName?: string;
    } = {}
): Promise<string> {
    const { createRecord } = await import('../../core/records.js');
    const crypto = await import('crypto');

    const now = new Date().toISOString();
    const opportunityId = crypto.randomUUID();

    // Get product details for line item snapshot
    const product = getRecord(hrProductId);
    if (!product) {
        throw new Error(`HR Product ${hrProductId} not found`);
    }

    if (product.data?.product_type !== 'HUM') {
        throw new Error(`Product ${hrProductId} is not an HR product (type: HUM)`);
    }

    const opportunityInput: any = {
        id: opportunityId,
        type: 'opportunity',
        name: options.opportunityName || `Employment: User ${userId.slice(0, 8)}`,
        slug: `employment-${userId.slice(0, 8)}-${Date.now()}`,
        account_id: accountId,
        data: {
            fieldGroups: [{
                idRefFieldGroupRecord: crypto.randomUUID(),
                nameFieldGroup: 'Employment',
                fieldStructs: [
                    {
                        idRefFieldRecord: crypto.randomUUID(),
                        nameField: 'User ID',
                        inputType: 'Record',
                        displayPosition: 0,
                        isSelectMany: false,
                        isSystem: false,
                        propertyStructs: [{ valueProperty: userId }]
                    },
                    {
                        idRefFieldRecord: crypto.randomUUID(),
                        nameField: getFieldDisplayName('opportunity', OpportunityFields.STAGE),
                        inputType: 'select',
                        displayPosition: 1,
                        isSelectMany: false,
                        isSystem: false,
                        propertyStructs: [{ valueProperty: 'ftp' }] // WON = active
                    },
                    {
                        idRefFieldRecord: crypto.randomUUID(),
                        nameField: 'Start Date',
                        inputType: 'date',
                        displayPosition: 2,
                        isSelectMany: false,
                        isSystem: false,
                        propertyStructs: [{ valueProperty: options.startDate || now }]
                    },
                    {
                        idRefFieldRecord: crypto.randomUUID(),
                        nameField: 'End Date',
                        inputType: 'date',
                        displayPosition: 3,
                        isSelectMany: false,
                        isSystem: false,
                        propertyStructs: [{ valueProperty: options.endDate || null }]
                    }
                ]
            }],
            line_items: [{
                id: crypto.randomUUID(),
                product_id: hrProductId,
                name: product.name,
                sku: product.slug,
                price: 0, // Employment is not a financial transaction in this context
                currency: 'USD',
                quantity: 1,
                product_type: 'HUM', // Copy for easy filtering
                added_at: now
            }]
        }
    };

    const systemContext = { user: { id: 'system', permission_level: 'admin' } };
    await createRecord(opportunityInput, systemContext);

    return opportunityId;
}

/**
 * Revoke access by ending the employment opportunity
 */
export async function revokeAccess(opportunityId: string): Promise<void> {
    const { updateRecord } = await import('../../core/records.js');
    const crypto = await import('crypto');

    const opp = getRecord(opportunityId);
    if (!opp) {
        throw new Error(`Opportunity ${opportunityId} not found`);
    }

    // Update the End Date to now
    const data = opp.data || { fieldGroups: [] };
    const fieldGroups = data.fieldGroups || [];
    const now = new Date().toISOString();

    // Find or create End Date field
    let found = false;
    for (const group of fieldGroups as any[]) {
        const fields = group.fieldStructs || group.fields || [];
        for (const field of fields as any[]) {
            if ((field.nameField || field.name) === 'End Date') {
                if (!field.propertyStructs) field.propertyStructs = [];
                if (field.propertyStructs.length === 0) {
                    field.propertyStructs.push({ valueProperty: now });
                } else {
                    field.propertyStructs[0].valueProperty = now;
                }
                found = true;
                break;
            }
        }
        if (found) break;
    }

    if (!found && fieldGroups.length > 0) {
        const firstGroup = fieldGroups[0] as any;
        const fields = firstGroup.fieldStructs || firstGroup.fields || [];
        fields.push({
            idRefFieldRecord: crypto.randomUUID(),
            nameField: 'End Date',
            inputType: 'date',
            displayPosition: fields.length,
            isSelectMany: false,
            isSystem: false,
            propertyStructs: [{ valueProperty: now }]
        });
    }

    updateRecord(opportunityId, { data: { fieldGroups } });
}
