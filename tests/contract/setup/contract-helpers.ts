/**
 * Contract Test Helpers
 *
 * Extends the existing API test setup with contract-specific utilities
 * for failure classification, observability, and spec compliance checking.
 */

import { db } from '../../../src/core/db.js';
import { SEED_PRODUCT } from './fixtures.js';

// Re-export existing utilities from API test setup
export {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    getBaseUrl,
    seedTestRecord,
    seedTestDimension,
    seedTestUser,
    seedTestPage,
    seedTestPreset,
    seedTestRelationship,
} from '../../../src/api/routes/__tests__/setup.js';

/**
 * Test failure classification types
 */
export enum FailureType {
    HARNESS = 'HARNESS',         // Test infrastructure issue
    BUG = 'BUG',                 // Implementation violates contract
    NOT_YET = 'NOT_YET',         // Feature not implemented
    AMBIGUOUS = 'AMBIGUOUS',     // Spec unclear
    DEVIATION = 'DEVIATION',     // Intentional spec deviation
}

export interface FailureClassification {
    type: FailureType;
    reason: string;
    specRef?: string;
}

export interface TestMeta {
    capabilityLevel: string;
    specSection?: string;
    expectsEndpoint?: boolean;
    invariant?: string;
}

/**
 * Classify a test failure based on error type and context
 */
export function classifyFailure(error: Error, meta?: TestMeta): FailureClassification {
    const msg = error.message || '';

    // Pattern 1: Connection/timeout = HARNESS
    if (msg.includes('ECONNREFUSED') || msg.includes('timeout') || msg.includes('ENOTFOUND')) {
        return { type: FailureType.HARNESS, reason: 'Test infrastructure failure - server not reachable' };
    }

    // Pattern 2: 404 on expected endpoint = NOT_YET
    if (msg.includes('404') && meta?.expectsEndpoint) {
        return {
            type: FailureType.NOT_YET,
            reason: 'Endpoint not implemented',
            specRef: meta.specSection
        };
    }

    // Pattern 3: Validation error
    if (msg.includes('Validation failed') || msg.includes('validation')) {
        if (meta?.specSection) {
            return {
                type: FailureType.NOT_YET,
                reason: 'Validation rule from spec not implemented',
                specRef: meta.specSection
            };
        }
        return { type: FailureType.BUG, reason: 'Unexpected validation failure' };
    }

    // Pattern 4: Assertion error = likely BUG
    if (error.name === 'AssertionError') {
        return { type: FailureType.BUG, reason: `Implementation returns incorrect value: ${msg}` };
    }

    // Pattern 5: 501 Not Implemented
    if (msg.includes('501') || msg.includes('Not Implemented')) {
        return { type: FailureType.NOT_YET, reason: 'Feature explicitly marked not implemented' };
    }

    return { type: FailureType.BUG, reason: msg || 'Unknown error' };
}

/**
 * Chain Reaction trace event
 */
export interface ChainReactionEvent {
    type: 'activity_status' | 'opportunity_stage' | 'chain_reaction' | 'relationship_created';
    entityId: string;
    action?: string;
    from?: string;
    to?: string;
    linkedId?: string;
    timestamp: string;
}

export interface ChainReactionTrace {
    opportunityId: string;
    events: ChainReactionEvent[];
}

/**
 * Trace the chain reaction for an opportunity
 * Useful for debugging state transition failures
 */
export function traceChainReaction(opportunityId: string): ChainReactionTrace {
    const events: ChainReactionEvent[] = [];

    // Get opportunity record
    const opp = db.prepare('SELECT * FROM records WHERE id = ?').get(opportunityId) as any;
    if (!opp) {
        return { opportunityId, events: [] };
    }

    // Find linked activities
    const activities = db.prepare(`
        SELECT * FROM records
        WHERE type = 'activity'
        AND json_extract(data, '$.opportunity_id') = ?
        ORDER BY created_at ASC
    `).all(opportunityId) as any[];

    activities.forEach((a: any) => {
        const data = JSON.parse(a.data || '{}');
        events.push({
            type: 'activity_status',
            entityId: a.id,
            from: data.previous_status,
            to: data.status,
            timestamp: a.updated_at,
        });
    });

    // Find relationships (renewal links)
    const relationships = db.prepare(`
        SELECT * FROM record_relationships
        WHERE from_record_id = ? OR to_record_id = ?
        ORDER BY created_at ASC
    `).all(opportunityId, opportunityId) as any[];

    relationships.forEach((r: any) => {
        if (r.relationship_type === 'renewal' || r.relationship_type === 'chain_reaction') {
            events.push({
                type: 'chain_reaction',
                entityId: opportunityId,
                action: 'created_linked_opp',
                linkedId: r.from_record_id === opportunityId ? r.to_record_id : r.from_record_id,
                timestamp: r.created_at,
            });
        }
    });

    // Sort by timestamp
    events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return { opportunityId, events };
}

/**
 * Dump activity history for an entity (for debugging)
 */
export function dumpActivityHistory(entityId: string): void {
    const activities = db.prepare(`
        SELECT * FROM records
        WHERE type = 'activity'
        AND (
            json_extract(data, '$.opportunity_id') = ? OR
            json_extract(data, '$.entity_id') = ? OR
            id = ?
        )
        ORDER BY created_at ASC
    `).all(entityId, entityId, entityId) as any[];

    console.error('\n=== Activity History for', entityId, '===');
    if (activities.length === 0) {
        console.error('  (no activities found)');
        return;
    }

    activities.forEach((a: any) => {
        const data = JSON.parse(a.data || '{}');
        console.error(`  [${a.created_at}] ${a.slug}`);
        console.error(`    status: ${data.status || 'unknown'}`);
        console.error(`    type: ${data.activity_type || 'unknown'}`);
        if (data.started_at) console.error(`    started: ${data.started_at}`);
        if (data.completed_at) console.error(`    completed: ${data.completed_at}`);
        if (data.duration_seconds) console.error(`    duration: ${data.duration_seconds}s`);
    });
    console.error('=== End Activity History ===\n');
}

/**
 * Assert that a record exists and matches expected shape
 */
export function assertRecordExists(
    id: string,
    expectedType: string,
    expectedData?: Record<string, any>
): any {
    const record = db.prepare('SELECT * FROM records WHERE id = ?').get(id) as any;

    if (!record) {
        throw new Error(`Record ${id} not found`);
    }

    if (record.type !== expectedType) {
        throw new Error(`Record ${id} has type '${record.type}', expected '${expectedType}'`);
    }

    if (expectedData) {
        const data = JSON.parse(record.data || '{}');
        for (const [key, value] of Object.entries(expectedData)) {
            if (data[key] !== value) {
                throw new Error(
                    `Record ${id} data.${key} is '${data[key]}', expected '${value}'`
                );
            }
        }
    }

    return {
        ...record,
        data: JSON.parse(record.data || '{}'),
    };
}

/**
 * Assert tenant isolation: a query scoped to tenant A should not see tenant B's data
 */
export async function assertTenantIsolation(
    client: any,
    tenantAId: string,
    tenantBId: string,
    recordType: string
): Promise<void> {
    // Create record for tenant A
    const aSlug = `isolation-test-a-${Date.now()}`;
    const createA = await client.post('/records', {
        type: recordType,
        slug: aSlug,
        name: 'Tenant A Record',
        account_id: tenantAId,
    });

    if (createA.status !== 201) {
        throw new Error(`Failed to create tenant A record: ${createA.status}`);
    }

    // Query as tenant B - should not see tenant A's record
    const listB = await client.get('/records', {
        params: { type: recordType, account_id: tenantBId }
    });

    // Handle paginated response format: { data: [], pagination: {} }
    const recordsB = listB.data.data || listB.data;
    const foundInB = Array.isArray(recordsB) && recordsB.some((r: any) => r.slug === aSlug);
    if (foundInB) {
        throw new Error(`Tenant isolation violated: Tenant B can see Tenant A's record '${aSlug}'`);
    }
}

/**
 * Capability level prefixes for test organization
 */
export const CAPABILITY_LEVELS = {
    L0: 'L0_Foundation',
    L1: 'L1_Ontology',
    L2: 'L2_Generation',
    L3: 'L3_Ingestion',
    L4: 'L4_Instantiation',
    L5: 'L5_Execution',
    INV: 'Invariant',
} as const;

/**
 * Standard test account IDs
 */
export const TEST_ACCOUNTS = {
    SYSTEM: '00000000-0000-0000-0000-000000000000',
    TENANT_A: '11111111-1111-4111-8111-111111111111',
    TENANT_B: '22222222-2222-4222-8222-222222222222',
} as const;

/**
 * Create a contact record via API
 */
export async function createContact(
    client: any,
    contactData: {
        email: string;
        name?: string;
        first_name?: string;
        last_name?: string;
        job_title?: string;
        domain?: string;
    },
    accountId: string = TEST_ACCOUNTS.SYSTEM
): Promise<any> {
    // Normalize email for slug to ensure lowercase (slug validation requires lowercase)
    const normalizedEmail = contactData.email.toLowerCase();
    const slug = `contact-${normalizedEmail.replace(/[@.]/g, '-')}-${Date.now()}`;
    const name = contactData.name ||
        `${contactData.first_name || ''} ${contactData.last_name || ''}`.trim() ||
        contactData.email;

    const res = await client.post('/records', {
        type: 'contact',
        slug,
        name,
        account_id: accountId,
        data: {
            email: contactData.email,
            first_name: contactData.first_name || contactData.name?.split(' ')[0],
            last_name: contactData.last_name || contactData.name?.split(' ').slice(1).join(' '),
            job_title: contactData.job_title,
            domain: contactData.domain || contactData.email.split('@')[1],
        },
    });

    return res;
}

/**
 * Create a company record via API
 */
export async function createCompany(
    client: any,
    companyData: {
        name: string;
        domain: string;
        sector?: string;
        industry?: string;
    },
    accountId: string = TEST_ACCOUNTS.SYSTEM
): Promise<any> {
    const slug = `company-${companyData.domain.replace(/\./g, '-')}-${Date.now()}`;

    const res = await client.post('/records', {
        type: 'company',
        slug,
        name: companyData.name,
        account_id: accountId,
        data: {
            domain: companyData.domain,
            sector: companyData.sector || 'Technology',
            industry: companyData.industry || 'SaaS',
        },
    });

    return res;
}

/**
 * Assert that a contact is linked to an account via relationship
 */
export async function assertContactLinkedToAccount(
    client: any,
    contactId: string,
    expectedAccountId: string
): Promise<void> {
    // Check for relationship between contact and account
    const res = await client.get('/relationships', {
        params: {
            from_record_id: contactId,
            relationship_type: 'works_at',
        },
    });

    const relationships = res.data.data || res.data;
    const linked = Array.isArray(relationships) &&
        relationships.some((r: any) => r.to_record_id === expectedAccountId);

    if (!linked) {
        throw new Error(
            `Contact ${contactId} not linked to account ${expectedAccountId}`
        );
    }
}

/**
 * Find a contact by email in the database
 */
export function findContactByEmail(email: string): any {
    const record = db.prepare(`
        SELECT * FROM records
        WHERE type = 'contact'
        AND json_extract(data, '$.email') = ?
    `).get(email) as any;

    if (record) {
        return {
            ...record,
            data: JSON.parse(record.data || '{}'),
        };
    }
    return null;
}

/**
 * Find a company by domain in the database
 */
export function findCompanyByDomain(domain: string): any {
    const record = db.prepare(`
        SELECT * FROM records
        WHERE type = 'company'
        AND json_extract(data, '$.domain') = ?
    `).get(domain) as any;

    if (record) {
        return {
            ...record,
            data: JSON.parse(record.data || '{}'),
        };
    }
    return null;
}

/**
 * Check if a dimension value exists
 */
export function dimensionValueExists(dimension: string, slug: string): boolean {
    const value = db.prepare(`
        SELECT id FROM dimension_values
        WHERE dimension = ? AND slug = ?
    `).get(dimension, slug);
    return !!value;
}

/**
 * Create an opportunity record via API
 */
export async function createOpportunity(
    client: any,
    oppData: {
        name: string;
        pipeline_type?: string;
        opportunity_stage?: string;
        amount?: number;
        owner_id?: string;
        primary_product_id?: string;
    },
    accountId: string = TEST_ACCOUNTS.SYSTEM
): Promise<any> {
    const slug = `opp-${oppData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const res = await client.post('/records', {
        type: 'opportunity',
        slug,
        name: oppData.name,
        account_id: accountId,
        data: {
            primary_product_id: oppData.primary_product_id || SEED_PRODUCT.id,
            pipeline_type: oppData.pipeline_type || 'b2b',
            opportunity_stage: oppData.opportunity_stage || 'mql',
            amount: oppData.amount || 50000,
            owner_id: oppData.owner_id,
        },
    });

    return res;
}

/**
 * Get activities for an opportunity
 */
export async function getActivitiesForOpportunity(
    client: any,
    opportunityId: string,
    accountId: string = TEST_ACCOUNTS.SYSTEM
): Promise<any[]> {
    const res = await client.get('/records', {
        params: { type: 'activity', account_id: accountId },
    });

    const activities = res.data.data || res.data;
    return Array.isArray(activities)
        ? activities.filter((a: any) => a.data?.opportunity_id === opportunityId)
        : [];
}

/**
 * Start an activity (changes status to in_progress)
 */
export async function startActivity(
    client: any,
    activityId: string
): Promise<any> {
    return client.post(`/activities/${activityId}/start`, {});
}

/**
 * Complete an activity (changes status to completed)
 */
export async function completeActivity(
    client: any,
    activityId: string
): Promise<any> {
    return client.post(`/activities/${activityId}/complete`, {});
}

/**
 * Get pipeline stage configurations
 */
export function getPipelineStageConfigs(): any[] {
    const stages = db.prepare(`
        SELECT * FROM records
        WHERE type = 'pipeline_stage'
        ORDER BY json_extract(data, '$.sequence') ASC
    `).all() as any[];

    return stages.map(s => ({
        ...s,
        data: JSON.parse(s.data || '{}'),
    }));
}

/**
 * Find activities by stage
 */
export function findActivitiesByStage(opportunityId: string, stage: string): any[] {
    const activities = db.prepare(`
        SELECT * FROM records
        WHERE type = 'activity'
        AND json_extract(data, '$.opportunity_id') = ?
        AND json_extract(data, '$.for_stage') = ?
    `).all(opportunityId, stage) as any[];

    return activities.map(a => ({
        ...a,
        data: JSON.parse(a.data || '{}'),
    }));
}

/**
 * Check if all activities for a stage are completed
 */
export function allActivitiesCompleted(opportunityId: string, stage: string): boolean {
    const activities = findActivitiesByStage(opportunityId, stage);

    if (activities.length === 0) return false;

    return activities.every(a => a.data.status === 'completed');
}
