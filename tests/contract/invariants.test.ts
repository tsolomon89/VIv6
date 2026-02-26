/**
 * Cross-Cutting Invariants Contract Tests
 *
 * These invariants represent the immutable laws of the Oblio "Physics" model.
 * They must be asserted in every relevant test case to ensure system integrity.
 *
 * Invariants tested:
 * - INV-1: Multi-Tenancy Isolation (Section 5.4)
 * - INV-2: No Free Text Rule (Section 5.2)
 * - INV-3: Finite State Machine (Section 5.3)
 * - INV-4: Product Tensor Origin (Section 5.5)
 * - INV-5: Sidebar Constraint (Section 5.1)
 *
 * Spec references: Section 5 Cross-Cutting Invariants
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    TEST_ACCOUNTS,
    CAPABILITY_LEVELS,
    assertTenantIsolation,
} from './setup/contract-helpers.js';
import { seedTenantAccounts, seedDimensionValues, seedAllFixtures, SEED_PRODUCT } from './setup/fixtures.js';

describe(`${CAPABILITY_LEVELS.INV}: Cross-Cutting Invariants`, () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
        seedAllFixtures();  // Seeds product for primary_product_id requirement
    });

    // =========================================================================
    // INV-1: Multi-Tenancy Isolation
    // =========================================================================
    describe('INV-1: Multi-Tenancy Isolation', () => {
        beforeEach(() => {
            seedTenantAccounts();
        });

        /**
         * Spec Section 5.4: A user from Org A can never see/edit objects from Org B
         */
        it('[INV] records are isolated by account_id', async () => {
            const client = getClient();
            await assertTenantIsolation(
                client,
                TEST_ACCOUNTS.TENANT_A,
                TEST_ACCOUNTS.TENANT_B,
                'product'
            );
        });

        /**
         * All database queries must include implicit account_id filter
         */
        it('[INV] listing records respects account_id filter', async () => {
            const client = getClient();

            // Create records for both tenants
            await client.post('/records', {
                type: 'contact',
                slug: 'contact-a',
                name: 'Tenant A Contact',
                account_id: TEST_ACCOUNTS.TENANT_A,
                data: { email: 'a@tenant-a.com' },
            });

            await client.post('/records', {
                type: 'contact',
                slug: 'contact-b',
                name: 'Tenant B Contact',
                account_id: TEST_ACCOUNTS.TENANT_B,
                data: { email: 'b@tenant-b.com' },
            });

            // Query as Tenant A (API returns paginated format)
            const listA = await client.get('/records', {
                params: { type: 'contact', account_id: TEST_ACCOUNTS.TENANT_A }
            });
            const recordsA = listA.data.data || listA.data;

            expect(recordsA.length).toBe(1);
            expect(recordsA[0].slug).toBe('contact-a');

            // Query as Tenant B
            const listB = await client.get('/records', {
                params: { type: 'contact', account_id: TEST_ACCOUNTS.TENANT_B }
            });
            const recordsB = listB.data.data || listB.data;

            expect(recordsB.length).toBe(1);
            expect(recordsB[0].slug).toBe('contact-b');
        });

        /**
         * Relationships should also be tenant-isolated
         */
        it('[INV] relationships respect tenant boundaries', async () => {
            const client = getClient();

            // Create records and relationship for Tenant A
            const prodA = await client.post('/records', {
                type: 'product',
                slug: 'prod-rel-a',
                name: 'Product A',
                account_id: TEST_ACCOUNTS.TENANT_A,
                data: {},
            });

            const featA = await client.post('/records', {
                type: 'feature',
                slug: 'feat-rel-a',
                name: 'Feature A',
                account_id: TEST_ACCOUNTS.TENANT_A,
                data: {},
            });

            await client.post('/relationships', {
                from_id: prodA.data.id,
                to_id: featA.data.id,
                type: 'has_feature',
            });

            // Create records for Tenant B (no relationship)
            await client.post('/records', {
                type: 'product',
                slug: 'prod-rel-b',
                name: 'Product B',
                account_id: TEST_ACCOUNTS.TENANT_B,
                data: {},
            });

            // Query relationships - should only see Tenant A's (paginated format)
            const relsA = await client.get('/relationships', {
                params: { from_id: prodA.data.id }
            });
            const relationships = relsA.data.data || relsA.data;

            expect(relationships.length).toBe(1);
            // API returns 'to_id' not 'to_record_id'
            const toId = relationships[0].to_record_id || relationships[0].to_id;
            expect(toId).toBe(featA.data.id);
        });
    });

    // =========================================================================
    // INV-2: No Free Text Rule (Ontological Purity)
    // =========================================================================
    describe('INV-2: No Free Text Rule', () => {
        beforeEach(() => {
            seedDimensionValues();
        });

        /**
         * Spec Section 5.2: Core fields must be selected from Oblio Data Asset
         * Note: This is partially implemented via dimension validation
         */
        it('[INV] dimension values must exist in taxonomy', async () => {
            const client = getClient();

            // Valid job title from seeded dimensions
            const validRes = await client.get('/schema/dimensions/job_title/values');
            expect(validRes.status).toBe(200);

            // Response format: { dimension, values, filtered, filterApplied }
            const values = validRes.data.values;
            expect(values).toBeDefined();
            expect(values.length).toBeGreaterThan(0);

            // Check that CTO exists
            const ctoExists = values.some((d: any) =>
                d.label === 'CTO' || d.slug === 'cto'
            );
            expect(ctoExists).toBe(true);
        });

        /**
         * Spec: Non-standard text should trigger Data Activity
         * When a contact is created with an invalid job_title,
         * the system flags it and auto-creates a Data Activity for cleanup
         */
        it('[INV] invalid taxonomy value triggers Data Activity', async () => {
            const client = getClient();

            // Create contact with invalid job_title (not in taxonomy)
            const contactRes = await client.post('/records', {
                type: 'contact',
                slug: `contact-bad-title-${Date.now()}`,
                name: 'Bad Title Contact',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    email: `badtitle${Date.now()}@test.com`,
                    job_title: 'Chief Innovation Wizard', // Invalid - not in taxonomy
                },
            });

            // Contact is created (soft enforcement) but flagged for cleanup
            expect(contactRes.status).toBe(201);
            expect(contactRes.data.data.requires_data_cleanup).toBe(true);
            expect(contactRes.data.data.invalid_fields).toContain('job_title');

            // Wait for async activity creation
            await new Promise(resolve => setTimeout(resolve, 100));

            // Check for Data Activity auto-created
            const activitiesRes = await client.get('/records', {
                params: {
                    type: 'activity',
                    account_id: TEST_ACCOUNTS.SYSTEM,
                }
            });

            const activities = activitiesRes.data.data || activitiesRes.data;
            const cleanupActivity = activities.find((a: any) =>
                a.data?.target_record_id === contactRes.data.id &&
                a.data?.activity_type === 'data' &&
                a.data?.cleanup_reason === 'taxonomy_violation'
            );

            expect(cleanupActivity).toBeDefined();
            if (cleanupActivity) {
                expect(cleanupActivity.data.invalid_fields).toContain('job_title');
                expect(cleanupActivity.data.status).toBe('pending');
            }
        });

        /**
         * Activity types should be from allowed set
         */
        it('[INV] activity types are from allowed enumeration', async () => {
            const client = getClient();

            const validTypes = ['data', 'asset', 'engagement', 'admin'];

            for (const activityType of validTypes) {
                const res = await client.post('/records', {
                    type: 'activity',
                    slug: `activity-${activityType}-${Date.now()}`,
                    name: `${activityType} Activity`,
                    account_id: TEST_ACCOUNTS.SYSTEM,
                    data: {
                        activity_type: activityType,
                    },
                });

                expect([200, 201]).toContain(res.status);
            }
        });
    });

    // =========================================================================
    // INV-3: Finite State Machine
    // =========================================================================
    describe('INV-3: Finite State Machine (Discrete Stages)', () => {
        /**
         * Spec Section 5.3: Opportunities exist in discrete states
         * Stages: MQL, SQL, FTP, RTP (no percentages)
         */
        it('[INV] opportunity stages are discrete values', async () => {
            const client = getClient();
            const validStages = ['mql', 'sql', 'ftp', 'rtp'];

            for (const stage of validStages) {
                const res = await client.post('/records', {
                    type: 'opportunity',
                    slug: `opp-stage-${stage}-${Date.now()}`,
                    name: `${stage.toUpperCase()} Stage Test`,
                    account_id: TEST_ACCOUNTS.SYSTEM,
                    data: {
                        primary_product_id: SEED_PRODUCT.id,
                        pipeline_type: 'b2b',
                        opportunity_stage: stage,
                        amount: 10000,
                    },
                });

                expect([200, 201]).toContain(res.status);
                // Probability should be auto-set based on stage
                const stageProbabilities: Record<string, number> = {
                    mql: 0.1,
                    sql: 0.4,
                    ftp: 1.0,
                    rtp: 0.8, // Renewal is high probability
                };
                expect(res.data.data.probability).toBe(stageProbabilities[stage]);
            }
        });

        /**
         * Spec: Users cannot manually set probability (derived from stage)
         */
        it('[INV] probability is auto-derived from stage', async () => {
            const client = getClient();

            // Create with explicit probability that doesn't match stage
            const res = await client.post('/records', {
                type: 'opportunity',
                slug: `opp-prob-test-${Date.now()}`,
                name: 'Probability Override Test',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    primary_product_id: SEED_PRODUCT.id,
                    pipeline_type: 'b2b',
                    opportunity_stage: 'mql',
                    probability: 0.99, // User tries to set 99%
                    amount: 10000,
                },
            });

            expect(res.status).toBe(201);
            // Should be overridden to MQL probability (0.1)
            expect(res.data.data.probability).toBe(0.1);
        });

        /**
         * Stage transitions should follow the FSM path
         */
        it('[INV] stage transitions update probability correctly', async () => {
            const client = getClient();

            // Create MQL
            const createRes = await client.post('/records', {
                type: 'opportunity',
                slug: `opp-fsm-${Date.now()}`,
                name: 'FSM Test',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: { primary_product_id: SEED_PRODUCT.id, pipeline_type: 'b2b', amount: 50000 },
            });
            const oppId = createRes.data.id;
            expect(createRes.data.data.probability).toBe(0.1);

            // Transition through stages
            const transitions: Array<{ stage: string; expectedProb: number }> = [
                { stage: 'sql', expectedProb: 0.4 },
                { stage: 'ftp', expectedProb: 1.0 },
            ];

            for (const { stage, expectedProb } of transitions) {
                const current = await client.get(`/records/${oppId}`);
                const updateRes = await client.put(`/records/${oppId}`, {
                    ...current.data,
                    data: { ...current.data.data, opportunity_stage: stage },
                });

                expect(updateRes.data.data.opportunity_stage).toBe(stage);
                expect(updateRes.data.data.probability).toBe(expectedProb);
            }
        });
    });

    // =========================================================================
    // INV-4: Product Tensor Origin
    // =========================================================================
    describe('INV-4: Product Tensor Origin', () => {
        /**
         * Spec Section 5.5: No Opportunity can exist without Primary Product
         * This is now enforced via INV-PRODUCT-TENSOR in invariants.ts
         */
        it('[INV] opportunity requires primary product', async () => {
            const client = getClient();

            const res = await client.post('/records', {
                type: 'opportunity',
                slug: 'orphan-opp-inv',
                name: 'Orphan Opportunity',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    pipeline_type: 'b2b',
                    amount: 100000,
                    // Missing primary_product_id
                },
            });

            // Should reject
            expect(res.status).toBe(400);
        });

        /**
         * Opportunity should store product reference when provided
         */
        it('opportunity stores primary product reference', async () => {
            const client = getClient();

            // Create a product first
            const productRes = await client.post('/records', {
                type: 'product',
                slug: `prod-tensor-${Date.now()}`,
                name: 'Tensor Product',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: { product_type: 'B2B' },
            });

            // Create opportunity with product reference
            const oppRes = await client.post('/records', {
                type: 'opportunity',
                slug: `opp-tensor-${Date.now()}`,
                name: 'Tensor Opportunity',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    pipeline_type: 'b2b',
                    amount: 50000,
                    primary_product_id: productRes.data.id,
                },
            });

            expect(oppRes.status).toBe(201);
            expect(oppRes.data.data.primary_product_id).toBe(productRes.data.id);
        });
    });

    // =========================================================================
    // INV-5: Sidebar Constraint
    // =========================================================================
    describe('INV-5: Sidebar Constraint (Physics of Time)', () => {
        /**
         * Spec Section 5.1: All state-changing work must capture energy cost
         * Activity.actualDuration must always be recorded
         * Enforced by invariant hooks in src/core/invariants.ts
         */
        it('[INV] activity completion requires duration > 0', async () => {
            const client = getClient();

            // Try to complete activity with invalid duration (0 or negative)
            const createRes = await client.post('/records', {
                type: 'activity',
                slug: `activity-no-duration-${Date.now()}`,
                name: 'No Duration Activity',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    activity_type: 'data',
                    status: 'completed',
                    duration_seconds: 0, // Invalid: must be > 0
                },
            });

            // Should reject
            expect(createRes.status).toBe(400);
            expect(createRes.data.error).toContain('duration');
        });

        /**
         * Document current behavior: activities can be created without duration
         */
        it('activities can currently be created without duration (gap)', async () => {
            const client = getClient();

            const res = await client.post('/records', {
                type: 'activity',
                slug: `activity-gap-${Date.now()}`,
                name: 'Gap Test Activity',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    activity_type: 'data',
                    status: 'pending',
                },
            });

            expect(res.status).toBe(201);
            // Duration not required - this documents the gap
            expect(res.data.data.duration_seconds).toBeUndefined();
        });

        /**
         * When duration IS provided, it should be stored
         */
        it('activities store duration when provided', async () => {
            const client = getClient();

            const res = await client.post('/records', {
                type: 'activity',
                slug: `activity-with-duration-${Date.now()}`,
                name: 'Duration Test Activity',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    activity_type: 'engagement',
                    status: 'completed',
                    started_at: new Date(Date.now() - 300000).toISOString(), // 5 min ago
                    completed_at: new Date().toISOString(),
                    duration_seconds: 300,
                },
            });

            expect(res.status).toBe(201);
            expect(res.data.data.duration_seconds).toBe(300);
        });
    });

    // =========================================================================
    // Summary: Invariant Coverage Matrix
    // =========================================================================
    describe('Invariant Coverage Summary', () => {
        /**
         * This test serves as documentation of invariant implementation status
         */
        it('documents invariant implementation status', () => {
            const invariants = {
                'INV-1: Multi-Tenancy Isolation': 'IMPLEMENTED',
                'INV-2: No Free Text Rule': 'PARTIAL (dimension validation)',
                'INV-3: Finite State Machine': 'IMPLEMENTED',
                'INV-4: Product Tensor Origin': 'SOFT_WARNING (logged, not enforced)',
                'INV-5: Sidebar Constraint': 'IMPLEMENTED (duration > 0 for completed)',
                'INV-PRODUCT-NAME': 'IMPLEMENTED (max 26 chars)',
            };

            // Log for visibility in test output
            console.log('\n=== Invariant Implementation Status ===');
            for (const [invariant, status] of Object.entries(invariants)) {
                console.log(`  ${invariant}: ${status}`);
            }
            console.log('=======================================\n');

            // This test always passes - it's documentation
            expect(true).toBe(true);
        });
    });
});
