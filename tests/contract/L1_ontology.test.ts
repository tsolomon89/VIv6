/**
 * L1 Ontology Contract Tests
 *
 * Level 1: Ontological Definition (The Product Tensor)
 * The user defines the "Laws of Physics" for their specific business.
 *
 * Capabilities tested:
 * - C1.1: Product creation (the seed of potential energy)
 * - C1.2: Feature definition (the nouns)
 * - C1.3: Persona definition (the who)
 * - C1.4: Solution/Use Case mapping (feature + persona = use case)
 * - C1.5: Qualifier definition (logic gates for stage progression)
 *
 * Spec references: Section 3 Level 1, Section 4.1 Steps 1.2-1.5
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    TEST_ACCOUNTS,
    CAPABILITY_LEVELS,
} from './setup/contract-helpers.js';
import {
    SEED_PRODUCT,
    SEED_PERSONAS,
    SEED_FEATURES,
    SEED_SOLUTIONS,
    seedDimensionValues,
    seedValidationConstraints,
} from './setup/fixtures.js';

describe(`${CAPABILITY_LEVELS.L1}: Ontological Definition`, () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
        seedDimensionValues();
        seedValidationConstraints();
    });

    // =========================================================================
    // C1.1: Product Creation
    // =========================================================================
    describe('C1.1: Product Creation (The Seed)', () => {
        /**
         * Spec 4.1 Step 1.2: Product Creation
         * Product defines "Potential Energy" in the thermodynamic model
         */
        it('should create product with type, pricing, and billing frequency', async () => {
            const client = getClient();
            const slug = `product-${Date.now()}`;

            const res = await client.post('/records', {
                type: 'product',
                slug,
                name: 'Enterprise SaaS',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    product_type: 'B2B',
                    pricing: {
                        currency: 'USD',
                        amount: 10000,
                    },
                    billing: 'Annual',
                    contract_type: 'Annual',
                    url: 'https://saas.example.com',
                },
            });

            expect(res.status).toBe(201);
            expect(res.data.type).toBe('product');
            expect(res.data.data.product_type).toBe('B2B');
            expect(res.data.data.pricing.amount).toBe(10000);
            expect(res.data.data.billing).toBe('Annual');
        });

        /**
         * Spec Invariant: Product.name length <= 26
         * Enforced by invariant hooks in src/core/invariants.ts
         */
        it('[INV] should validate product name max length (26 chars)', async () => {
            const client = getClient();

            const res = await client.post('/records', {
                type: 'product',
                slug: 'long-name-product',
                name: 'This Product Name Is Way Too Long For The Constraint',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: { product_type: 'B2B' },
            });

            expect(res.status).toBe(400);
            expect(res.data.error).toContain('name');
        });

        /**
         * Spec: Product.type must be one of 5 enumerated types
         */
        it('should accept valid product types', async () => {
            const client = getClient();
            const validTypes = ['B2B', 'B2C', 'B2B2C', 'D2C', 'Marketplace'];

            for (const productType of validTypes) {
                const res = await client.post('/records', {
                    type: 'product',
                    slug: `product-${productType.toLowerCase()}-${Date.now()}`,
                    name: `${productType} Product`,
                    account_id: TEST_ACCOUNTS.SYSTEM,
                    data: { product_type: productType },
                });

                // Should succeed (201) or be idempotent (200)
                expect([200, 201]).toContain(res.status);
            }
        });

        /**
         * Spec: B2B opportunities require Account linkage (soft warning)
         * Note: Account requirement is on OPPORTUNITIES, not products.
         * All contacts have accounts in the current model - the product type
         * just classifies the relationship.
         */
        it('[INV] B2B opportunities should have Account (soft validation)', async () => {
            const client = getClient();

            // Create B2B product first
            const productRes = await client.post('/records', {
                type: 'product',
                slug: `product-b2b-anchor-${Date.now()}`,
                name: 'B2B Anchor Test',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: { product_type: 'B2B' },
            });
            expect(productRes.status).toBe(201);

            // Create opportunity WITHOUT primary_account_id (soft validation - logs warning but succeeds)
            const oppRes = await client.post('/records', {
                type: 'opportunity',
                slug: `opp-no-account-${Date.now()}`,
                name: 'Opp Without Account',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    primary_product_id: productRes.data.id,
                    pipeline_type: 'b2b',
                    amount: 100000,
                    // Missing primary_account_id - should warn but not fail
                },
            });

            // Soft validation: opportunity is created (201) but warning is logged
            expect(oppRes.status).toBe(201);
        });
    });

    // =========================================================================
    // C1.2: Feature Definition
    // =========================================================================
    describe('C1.2: Feature Definition (The Nouns)', () => {
        /**
         * Spec 4.1 Step 1.4: Define Features as atomic units of value
         */
        it('should create feature with description', async () => {
            const client = getClient();

            const res = await client.post('/records', {
                type: 'feature',
                slug: 'api-access',
                name: 'API Access',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    feature_type: 'noun',
                    description: 'Full REST API access for automation',
                },
            });

            expect(res.status).toBe(201);
            expect(res.data.type).toBe('feature');
            expect(res.data.data.feature_type).toBe('noun');
        });

        it('should link feature to product via relationship', async () => {
            const client = getClient();

            // Create product first
            const productRes = await client.post('/records', {
                type: 'product',
                slug: `product-feat-${Date.now()}`,
                name: 'Product with Features',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: { product_type: 'B2B' },
            });
            const productId = productRes.data.id;

            // Create feature
            const featureRes = await client.post('/records', {
                type: 'feature',
                slug: `feature-${Date.now()}`,
                name: 'Test Feature',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: { feature_type: 'noun' },
            });
            const featureId = featureRes.data.id;

            // Create relationship
            const relRes = await client.post('/relationships', {
                from_id: productId,
                to_id: featureId,
                type: 'has_feature',
            });

            // Debug: Always log response structure
            console.log('[Test Debug] Relationship response keys:', Object.keys(relRes.data));
            console.log('[Test Debug] Relationship response:', relRes.data);

            expect(relRes.status).toBe(201);
            // Response uses database column names OR API-mapped names
            expect(relRes.data).toHaveProperty('id');
            // Check actual field names in response
            const fromId = relRes.data.from_record_id || relRes.data.from_id;
            const toId = relRes.data.to_record_id || relRes.data.to_id;
            const relType = relRes.data.relationship_type || relRes.data.type;
            expect(fromId).toBe(productId);
            expect(toId).toBe(featureId);
            expect(relType).toBe('has_feature');
        });
    });

    // =========================================================================
    // C1.3: Persona Definition
    // =========================================================================
    describe('C1.3: Persona Definition (The Who)', () => {
        /**
         * Spec 4.1 Step 1.3: Define target audience logic
         */
        it('should create persona with type and job titles', async () => {
            const client = getClient();

            const res = await client.post('/records', {
                type: 'persona',
                slug: 'decision-maker-cto',
                name: 'CTO (Decision Maker)',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    persona_type: 'decision_maker',
                    job_titles: ['CTO', 'VP Engineering'],
                    seniority: 'Director+',
                    priority: 'high',
                },
            });

            expect(res.status).toBe(201);
            expect(res.data.type).toBe('persona');
            expect(res.data.data.persona_type).toBe('decision_maker');
            expect(res.data.data.job_titles).toContain('CTO');
        });

        /**
         * Spec: For B2B Product, at least one Decision Maker persona MUST be linked
         * Uses /validate/product endpoint which queries dimension_values for power_level >= 3
         */
        it('[INV] B2B product requires at least one Decision Maker persona', async () => {
            const client = getClient();

            // Create B2B product
            const productRes = await client.post('/records', {
                type: 'product',
                slug: `product-b2b-no-dm-${Date.now()}`,
                name: 'B2B Without DM',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: { product_type: 'B2B' },
            });
            expect(productRes.status).toBe(201);
            const productId = productRes.data.id;

            // Create end_user persona (power_level: 1, not a decision maker)
            const personaRes = await client.post('/records', {
                type: 'persona',
                slug: `persona-eu-only-${Date.now()}`,
                name: 'End User Only',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: { persona_type: 'end_user' },
            });
            expect(personaRes.status).toBe(201);

            // Link persona to product
            await client.post('/relationships', {
                from_id: productId,
                to_id: personaRes.data.id,
                type: 'targets_persona',
            });

            // Validate product - should fail because no decision_maker linked
            const validateRes = await client.post('/records/validate/product', {
                product_id: productId,
            });

            expect(validateRes.status).toBe(400);
            expect(validateRes.data.valid).toBe(false);
            // API returns errors as array: { errors: [{ code, message }] }
            expect(validateRes.data.errors).toBeDefined();
            expect(validateRes.data.errors.length).toBeGreaterThan(0);
            expect(validateRes.data.errors[0].code).toBe('INV-B2B-PERSONA');
            expect(validateRes.data.errors[0].message).toContain('Decision Maker');
        });

        /**
         * Spec: Personas must use Oblio Data Asset fields (no free text)
         */
        it('should create persona with valid job titles from taxonomy', async () => {
            const client = getClient();

            // These job titles should exist in seeded dimension values
            const validTitles = ['CTO', 'VP Engineering'];

            const res = await client.post('/records', {
                type: 'persona',
                slug: `persona-valid-${Date.now()}`,
                name: 'Valid Persona',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    persona_type: 'decision_maker',
                    job_titles: validTitles,
                },
            });

            expect(res.status).toBe(201);
        });

        it('should link persona to product', async () => {
            const client = getClient();

            // Create product
            const productRes = await client.post('/records', {
                type: 'product',
                slug: `product-pers-${Date.now()}`,
                name: 'Product with Persona',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: { product_type: 'B2B' },
            });

            // Create persona
            const personaRes = await client.post('/records', {
                type: 'persona',
                slug: `persona-link-${Date.now()}`,
                name: 'Linked Persona',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: { persona_type: 'decision_maker' },
            });

            // Link them
            const relRes = await client.post('/relationships', {
                from_id: productRes.data.id,
                to_id: personaRes.data.id,
                type: 'targets_persona',
            });

            expect(relRes.status).toBe(201);
        });

        /**
         * Spec Section 2.2: Persona priority routing
         * Decision Maker > End User > Influencer
         */
        it('should support persona priority levels', async () => {
            const client = getClient();

            const priorities = ['high', 'medium', 'low'];

            for (const priority of priorities) {
                const res = await client.post('/records', {
                    type: 'persona',
                    slug: `persona-${priority}-${Date.now()}`,
                    name: `${priority} Priority Persona`,
                    account_id: TEST_ACCOUNTS.SYSTEM,
                    data: {
                        persona_type: priority === 'high' ? 'decision_maker' : 'end_user',
                        priority,
                    },
                });

                expect(res.status).toBe(201);
                expect(res.data.data.priority).toBe(priority);
            }
        });
    });

    // =========================================================================
    // C1.4: Solution/Use Case Mapping
    // =========================================================================
    describe('C1.4: Solution/Use Case Definition', () => {
        /**
         * Spec 4.1 Step 1.4: Feature + Persona = Use Case
         */
        it('should create solution linking feature and persona', async () => {
            const client = getClient();

            // Create prerequisites
            const featureRes = await client.post('/records', {
                type: 'feature',
                slug: `sol-feature-${Date.now()}`,
                name: 'API Access',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: { feature_type: 'noun' },
            });

            const personaRes = await client.post('/records', {
                type: 'persona',
                slug: `sol-persona-${Date.now()}`,
                name: 'DevOps Engineer',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: { persona_type: 'end_user' },
            });

            // Create solution
            const solutionRes = await client.post('/records', {
                type: 'solution',
                slug: `solution-${Date.now()}`,
                name: 'Automate Workflows',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    solution_type: 'verb',
                    description: 'Automate repetitive workflows',
                    linked_feature_id: featureRes.data.id,
                    linked_persona_id: personaRes.data.id,
                },
            });

            expect(solutionRes.status).toBe(201);
            expect(solutionRes.data.data.linked_feature_id).toBe(featureRes.data.id);
            expect(solutionRes.data.data.linked_persona_id).toBe(personaRes.data.id);
        });

        /**
         * Spec Invariant: Every Use Case must link a Solution to a Persona
         * This is now enforced via INV-USECASE in invariants.ts
         */
        it('[INV] use case requires linked solution and persona', async () => {
            const client = getClient();

            // Try to create use case without solution link
            const res = await client.post('/records', {
                type: 'useCase',
                slug: `use-case-orphan-${Date.now()}`,
                name: 'Orphan Use Case',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    // Missing linked_solution_id and linked_persona_id
                    description: 'This should fail',
                },
            });

            expect(res.status).toBe(400);
            expect(res.data.error).toContain('linked');
        });
    });

    // =========================================================================
    // C1.5: Qualifier Definition
    // =========================================================================
    describe('C1.5: Qualifier Definition (Logic Gates)', () => {
        /**
         * Spec 4.1 Step 1.5: Set logical gates for stage progression
         */
        it('should create product with qualifier definitions', async () => {
            const client = getClient();

            const res = await client.post('/records', {
                type: 'product',
                slug: `product-qualifiers-${Date.now()}`,
                name: 'Product with Qualifiers',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    product_type: 'B2B',
                    qualifiers: {
                        mql: [
                            { field: 'email_verified', operator: '=', value: true },
                            { field: 'persona_match_score', operator: '>=', value: 60 },
                        ],
                        sql: [
                            { field: 'budget_confirmed', operator: '=', value: true },
                        ],
                        ftp: [
                            { field: 'contract_signed', operator: '=', value: true },
                        ],
                    },
                },
            });

            expect(res.status).toBe(201);
            expect(res.data.data.qualifiers).toBeDefined();
            expect(res.data.data.qualifiers.mql).toHaveLength(2);
        });

        /**
         * Spec Invariant: Qualifiers must be Boolean or Numeric threshold
         */
        it('should support boolean qualifiers', async () => {
            const client = getClient();

            const res = await client.post('/records', {
                type: 'product',
                slug: `product-bool-qual-${Date.now()}`,
                name: 'Boolean Qualifier Product',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    product_type: 'B2B',
                    qualifiers: {
                        mql: [
                            { field: 'email_verified', operator: '=', value: true },
                            { field: 'opt_in', operator: '=', value: true },
                        ],
                    },
                },
            });

            expect(res.status).toBe(201);
        });

        it('should support numeric threshold qualifiers', async () => {
            const client = getClient();

            const res = await client.post('/records', {
                type: 'product',
                slug: `product-num-qual-${Date.now()}`,
                name: 'Numeric Qualifier Product',
                account_id: TEST_ACCOUNTS.SYSTEM,
                data: {
                    product_type: 'B2B',
                    qualifiers: {
                        mql: [
                            { field: 'persona_match_score', operator: '>=', value: 60 },
                            { field: 'engagement_score', operator: '>', value: 50 },
                        ],
                    },
                },
            });

            expect(res.status).toBe(201);
        });
    });
});
