/**
 * Contract Test Fixtures
 *
 * Seed data specifications per Oblio spec section 6.2
 * These represent the "known good" test data for contract verification.
 */

import { db } from '../../../src/core/db.js';
import { TEST_ACCOUNTS } from './contract-helpers.js';
import pipelineStagesJson from '../../../data/seeds/tier_1_schema/pipeline_stages.json' with { type: 'json' };

/**
 * Seed 1: The Product (The Potential Energy)
 * Spec section 6.2
 */
export const SEED_PRODUCT = {
    id: 'prod-saas-001',
    type: 'product',
    slug: 'enterprise-saas',
    name: 'Enterprise SaaS',
    data: {
        product_type: 'B2B',
        pricing: {
            currency: 'USD',
            amount: 10000,
        },
        billing: 'Annual',
        contract_type: 'Annual',
        url: 'https://saas.example.com',
        personas: ['pers-dm-01', 'pers-eu-01'],
    },
};

/**
 * Seed 2: The Data Asset (Mock Validation List)
 * Spec section 6.2
 */
export const SEED_DATA_ASSET = {
    jobTitles: ['CTO', 'VP Engineering', 'DevOps Engineer', 'Software Engineer', 'VP Sales'],
    sectors: ['Technology', 'Finance', 'Healthcare', 'Manufacturing'],
    industries: ['SaaS', 'FinTech', 'HealthTech', 'Enterprise Software'],
};

/**
 * Seed 3: The User (Internal Actor)
 * Spec section 6.2
 */
export const SEED_ADMIN_USER = {
    id: 'user-admin-01',
    email: 'admin@test.oblio.io',
    name: 'Test Admin',
    role: 'admin',
    department: 'Operations',
    capacity: 28800, // Seconds in a work day
};

export const SEED_JUNIOR_USER = {
    id: 'user-junior-01',
    email: 'junior@test.oblio.io',
    name: 'Test Junior',
    role: 'junior',
    department: 'Marketing',
    capacity: 28800,
};

/**
 * Seed 4: Personas
 * Spec section 4.1 Step 1.3
 */
export const SEED_PERSONAS = {
    decisionMaker: {
        id: 'pers-dm-01',
        type: 'persona',
        slug: 'decision-maker-cto',
        name: 'CTO (Decision Maker)',
        data: {
            persona_type: 'decision_maker',
            job_titles: ['CTO', 'VP Engineering'],
            seniority: 'Director+',
            priority: 'high',
        },
    },
    endUser: {
        id: 'pers-eu-01',
        type: 'persona',
        slug: 'end-user-devops',
        name: 'DevOps Engineer (End User)',
        data: {
            persona_type: 'end_user',
            job_titles: ['DevOps Engineer', 'Software Engineer'],
            seniority: 'Individual Contributor',
            priority: 'medium',
        },
    },
};

/**
 * Seed 5: Features
 * Spec section 4.1 Step 1.4
 */
export const SEED_FEATURES = {
    apiAccess: {
        id: 'feat-api-01',
        type: 'feature',
        slug: 'api-access',
        name: 'API Access',
        data: {
            feature_type: 'noun',
            description: 'Full REST API access for automation',
        },
    },
};

/**
 * Seed 6: Solutions/Use Cases
 * Spec section 4.1 Step 1.4
 */
export const SEED_SOLUTIONS = {
    automateWorkflows: {
        id: 'sol-auto-01',
        type: 'solution',
        slug: 'automate-workflows',
        name: 'Automate Workflows',
        data: {
            solution_type: 'verb',
            description: 'Automate repetitive workflows',
            linked_feature: 'feat-api-01',
            linked_persona: 'pers-eu-01',
        },
    },
};

/**
 * Seed 7: Sample Contact (for ingestion tests)
 */
export const SEED_CONTACT = {
    id: 'contact-jane-01',
    type: 'contact',
    slug: 'jane-doe-ibm',
    name: 'Jane Doe',
    data: {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@ibm.com',
        job_title: 'VP Sales',
        domain: 'ibm.com',
    },
};

/**
 * Seed 8: Sample Account (company)
 */
export const SEED_ACCOUNT = {
    id: 'account-ibm-01',
    type: 'company',
    slug: 'ibm',
    name: 'IBM',
    data: {
        domain: 'ibm.com',
        sector: 'Technology',
        industry: 'Enterprise Software',
        size: '10000+',
    },
};

/**
 * Seed 9: Sample Opportunity
 */
export const SEED_OPPORTUNITY = {
    id: 'opp-test-01',
    type: 'opportunity',
    slug: 'test-opp-ibm',
    name: 'IBM Enterprise Deal',
    data: {
        opportunity_stage: 'mql',
        probability: 0.1,
        amount: 100000,
        projected_revenue: 100000,
        target_close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        primary_product_id: 'prod-saas-001',
        primary_contact_id: 'contact-jane-01',
        primary_account_id: 'account-ibm-01',
    },
};

/**
 * Seed dimension values for taxonomy validation
 */
export function seedDimensionValues(): void {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO dimension_values (id, dimension, slug, label, account_id)
        VALUES (?, ?, ?, ?, ?)
    `);

    // Job titles
    SEED_DATA_ASSET.jobTitles.forEach((title, i) => {
        const slug = title.toLowerCase().replace(/\s+/g, '-');
        stmt.run(`dim-job-${i}`, 'job_title', slug, title, null);
    });

    // Sectors
    SEED_DATA_ASSET.sectors.forEach((sector, i) => {
        const slug = sector.toLowerCase().replace(/\s+/g, '-');
        stmt.run(`dim-sector-${i}`, 'sector', slug, sector, null);
    });

    // Industries
    SEED_DATA_ASSET.industries.forEach((industry, i) => {
        const slug = industry.toLowerCase().replace(/\s+/g, '-');
        stmt.run(`dim-industry-${i}`, 'industry', slug, industry, null);
    });

    // Opportunity stages (FSM states)
    const stages = ['mql', 'sql', 'ftp', 'rtp'];
    stages.forEach((stage, i) => {
        stmt.run(`dim-stage-${i}`, 'opportunity_stage', stage, stage.toUpperCase(), null);
    });

    // Persona types with power_level metadata (for /validate/product endpoint)
    const personaStmt = db.prepare(`
        INSERT OR IGNORE INTO dimension_values (id, dimension, slug, label, account_id, metadata)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    personaStmt.run('dim-persona-dm', 'persona', 'decision_maker', 'Decision Maker', null, JSON.stringify({ power_level: 3 }));
    personaStmt.run('dim-persona-inf', 'persona', 'influencer', 'Influencer', null, JSON.stringify({ power_level: 2 }));
    personaStmt.run('dim-persona-eu', 'persona', 'end_user', 'End User', null, JSON.stringify({ power_level: 1 }));
}

/**
 * Seed all fixtures for a clean test state
 */
export function seedAllFixtures(accountId: string = TEST_ACCOUNTS.SYSTEM): void {
    // Seed dimension values first (taxonomy)
    seedDimensionValues();

    // Seed validation constraints for ConstraintEngine
    seedValidationConstraints();

    const recordStmt = db.prepare(`
        INSERT OR IGNORE INTO records (id, type, slug, name, account_id, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    // Seed product
    recordStmt.run(
        SEED_PRODUCT.id,
        SEED_PRODUCT.type,
        SEED_PRODUCT.slug,
        SEED_PRODUCT.name,
        accountId,
        JSON.stringify(SEED_PRODUCT.data)
    );

    // Seed personas
    Object.values(SEED_PERSONAS).forEach(persona => {
        recordStmt.run(
            persona.id,
            persona.type,
            persona.slug,
            persona.name,
            accountId,
            JSON.stringify(persona.data)
        );
    });

    // Seed features
    Object.values(SEED_FEATURES).forEach(feature => {
        recordStmt.run(
            feature.id,
            feature.type,
            feature.slug,
            feature.name,
            accountId,
            JSON.stringify(feature.data)
        );
    });

    // Seed solutions
    Object.values(SEED_SOLUTIONS).forEach(solution => {
        recordStmt.run(
            solution.id,
            solution.type,
            solution.slug,
            solution.name,
            accountId,
            JSON.stringify(solution.data)
        );
    });

    // Seed account and contact for opportunity anchors
    recordStmt.run(
        SEED_ACCOUNT.id,
        'account',  // Use 'account' type, not 'company'
        SEED_ACCOUNT.slug,
        SEED_ACCOUNT.name,
        accountId,
        JSON.stringify(SEED_ACCOUNT.data)
    );

    recordStmt.run(
        SEED_CONTACT.id,
        SEED_CONTACT.type,
        SEED_CONTACT.slug,
        SEED_CONTACT.name,
        accountId,
        JSON.stringify(SEED_CONTACT.data)
    );

    // Seed relationships (product -> persona)
    const relStmt = db.prepare(`
        INSERT OR IGNORE INTO record_relationships (id, from_record_id, to_record_id, relationship_type, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
    `);

    relStmt.run('rel-prod-dm', SEED_PRODUCT.id, SEED_PERSONAS.decisionMaker.id, 'targets_persona');
    relStmt.run('rel-prod-eu', SEED_PRODUCT.id, SEED_PERSONAS.endUser.id, 'targets_persona');
    relStmt.run('rel-sol-feat', SEED_SOLUTIONS.automateWorkflows.id, SEED_FEATURES.apiAccess.id, 'uses_feature');
    relStmt.run('rel-sol-pers', SEED_SOLUTIONS.automateWorkflows.id, SEED_PERSONAS.endUser.id, 'targets_persona');
    relStmt.run('rel-contact-account', SEED_CONTACT.id, SEED_ACCOUNT.id, 'works_at');
}

/**
 * Seed tenant accounts for isolation tests
 */
export function seedTenantAccounts(): void {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO records (id, slug, name, type, account_id, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    stmt.run(
        TEST_ACCOUNTS.TENANT_A,
        'tenant-a',
        'Tenant A Organization',
        'account',
        TEST_ACCOUNTS.SYSTEM,
        JSON.stringify({ type: 'client' })
    );

    stmt.run(
        TEST_ACCOUNTS.TENANT_B,
        'tenant-b',
        'Tenant B Organization',
        'account',
        TEST_ACCOUNTS.SYSTEM,
        JSON.stringify({ type: 'client' })
    );
}

/**
 * Data cleaning test vectors
 * Spec section 6.3
 */
export const DATA_CLEANING_VECTORS = {
    clean: {
        input: { jobTitle: 'CTO' },
        expected: { accepted: true, cleanedValue: 'CTO' },
    },
    dirty: {
        input: { jobTitle: 'Chief Tech Officer' },
        expected: { accepted: false, triggersActivity: true },
    },
};

/**
 * Batch contacts for ingestion tests
 */
export const SEED_CONTACTS_BATCH = [
    { email: 'alice@acme.com', name: 'Alice Chen', job_title: 'CTO' },
    { email: 'bob@acme.com', name: 'Bob Smith', job_title: 'InvalidTitle' },
    { email: 'charlie@newcorp.com', name: 'Charlie Davis', job_title: 'VP Sales' },
];

/**
 * CSV import data for bulk ingestion tests
 */
export const SEED_IMPORT_CSV = `email,name,job_title,company
jane@ibm.com,Jane Doe,VP Sales,IBM
john@ibm.com,John Smith,Software Engineer,IBM
invalid@test.com,Bad Data,XXXINVALIDXXX,Unknown`;

/**
 * Sample company account for contact linking tests
 */
export const SEED_COMPANY_ACME = {
    id: 'company-acme-01',
    type: 'company',
    slug: 'acme-corp',
    name: 'Acme Corporation',
    data: {
        domain: 'acme.com',
        sector: 'Technology',
        industry: 'SaaS',
        size: '100-500',
    },
};

/**
 * Pipeline Stage Configs (from JSON seed)
 * Used for L2 Activity Generation tests
 */
export const SEED_PIPELINE_STAGE_B2B_MQL = pipelineStagesJson.find(
    (s: any) => s.slug === 'b2b_mql'
);

export const SEED_PIPELINE_STAGE_B2B_SQL = pipelineStagesJson.find(
    (s: any) => s.slug === 'b2b_sql'
);

/**
 * Activity Definitions for generation tests
 * Valid archetypes: data, asset, engagement, admin
 */
export const SEED_ACTIVITY_DEFS = {
    recordCreated: {
        id: 'actdef-record-created',
        type: 'activity_def',
        slug: 'record_created',
        name: 'Record Created',
        summary: 'Activity triggered when a record is created',
        data: {
            archetype: 'admin',
            duration_default: 0,
            qualifiers: [],
        },
    },
    callLogged: {
        id: 'actdef-call-logged',
        type: 'activity_def',
        slug: 'call_logged',
        name: 'Call Logged',
        summary: 'Log a phone call with contact',
        data: {
            archetype: 'engagement',
            duration_default: 15,
            qualifiers: ['budget_discussed'],
        },
    },
    meetingHeld: {
        id: 'actdef-meeting-held',
        type: 'activity_def',
        slug: 'meeting_held',
        name: 'Meeting Held',
        summary: 'Hold a meeting with stakeholders',
        data: {
            archetype: 'engagement',
            duration_default: 30,
            qualifiers: ['decision_maker_present'],
        },
    },
    dealApproved: {
        id: 'actdef-deal-approved',
        type: 'activity_def',
        slug: 'deal_approved',
        name: 'Deal Approved',
        summary: 'Deal has been approved and signed',
        data: {
            archetype: 'admin',
            duration_default: 0,
            qualifiers: ['contract_signed', 'payment_received'],
        },
    },
    recordUpdated: {
        id: 'actdef-record-updated',
        type: 'activity_def',
        slug: 'record_updated',
        name: 'Record Updated',
        summary: 'Activity triggered when a record is updated',
        data: {
            archetype: 'admin',
            duration_default: 0,
            qualifiers: [],
        },
    },
};

/**
 * Seed validation constraints for ConstraintEngine
 * These are the same constraints from data/seeds/tier_1_schema/validation_constraints.json
 */
export function seedValidationConstraints(): void {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO records (id, type, slug, name, summary, account_id, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const constraints = [
        {
            id: 'constraint-00000000-0000-0000-0000-000000000001',
            type: 'validation_constraint',
            slug: 'product_name_max_length',
            name: 'Product name max 26 characters',
            summary: 'Product names must be 26 characters or less for display consistency',
            account_id: TEST_ACCOUNTS.SYSTEM,
            data: {
                entity_type: 'product',
                trigger: 'pre_create',
                constraint_type: 'max_length',
                field: 'name',
                max_length: 26,
                error_code: 'INV-PRODUCT-NAME',
                error_message: 'Product name must be 26 characters or less'
            }
        },
        {
            id: 'constraint-00000000-0000-0000-0000-000000000002',
            type: 'validation_constraint',
            slug: 'product_name_max_length_update',
            name: 'Product name max 26 characters (update)',
            summary: 'Product names must be 26 characters or less when updating',
            account_id: TEST_ACCOUNTS.SYSTEM,
            data: {
                entity_type: 'product',
                trigger: 'pre_update',
                constraint_type: 'max_length',
                field: 'name',
                max_length: 26,
                error_code: 'INV-PRODUCT-NAME',
                error_message: 'Product name must be 26 characters or less'
            }
        },
        {
            id: 'constraint-00000000-0000-0000-0000-000000000004',
            type: 'validation_constraint',
            slug: 'opportunity_requires_product',
            name: 'Opportunity requires primary product',
            summary: 'All opportunities must have a primary_product_id reference',
            account_id: TEST_ACCOUNTS.SYSTEM,
            data: {
                entity_type: 'opportunity',
                trigger: 'pre_create',
                constraint_type: 'required_field',
                field: 'primary_product_id',
                error_code: 'INV-PRODUCT-TENSOR',
                error_message: 'Opportunity must have a primary product reference (primary_product_id)'
            }
        },
        {
            id: 'constraint-00000000-0000-0000-0000-000000000005',
            type: 'validation_constraint',
            slug: 'opportunity_requires_pipeline',
            name: 'Opportunity requires pipeline_type',
            summary: 'All opportunities must specify a valid pipeline_type from seeded pipeline_stage records',
            account_id: TEST_ACCOUNTS.SYSTEM,
            data: {
                entity_type: 'opportunity',
                trigger: 'pre_create',
                constraint_type: 'exists_in',
                field: 'pipeline_type',
                validation: 'exists_in_pipeline_stages',
                error_code: 'INV-PIPELINE-TYPE',
                error_message: 'Opportunity must specify a valid pipeline_type'
            }
        },
        {
            id: 'constraint-00000000-0000-0000-0000-000000000007',
            type: 'validation_constraint',
            slug: 'use_case_requires_solution_persona',
            name: 'Use Case requires Solution and Persona',
            summary: 'Use cases must link a solution to a persona',
            account_id: TEST_ACCOUNTS.SYSTEM,
            data: {
                entity_type: 'useCase',
                trigger: 'pre_create',
                constraint_type: 'required_fields',
                fields: ['linked_solution_id', 'linked_persona_id'],
                error_code: 'INV-USECASE',
                error_message: 'Use case requires both a linked solution and persona (linked_solution_id and linked_persona_id)'
            }
        },
        {
            id: 'constraint-00000000-0000-0000-0000-000000000003',
            type: 'validation_constraint',
            slug: 'activity_completion_duration',
            name: 'Activity completion requires duration',
            summary: 'Completed activities must have duration > 0 seconds',
            account_id: TEST_ACCOUNTS.SYSTEM,
            data: {
                entity_type: 'activity',
                trigger: 'pre_update',
                constraint_type: 'min_value',
                field: 'duration_seconds',
                min_value: 1,
                condition: { field: 'status', op: 'eq', value: 'completed' },
                error_code: 'INV-ACTIVITY-DURATION',
                error_message: 'Activity completion requires duration > 0 seconds'
            }
        },
        {
            id: 'constraint-00000000-0000-0000-0000-000000000009',
            type: 'validation_constraint',
            slug: 'activity_completion_duration_create',
            name: 'Activity creation with completed status requires duration',
            summary: 'Activities created with completed status must have duration > 0',
            account_id: TEST_ACCOUNTS.SYSTEM,
            data: {
                entity_type: 'activity',
                trigger: 'pre_create',
                constraint_type: 'min_value',
                field: 'duration_seconds',
                min_value: 1,
                condition: { field: 'status', op: 'eq', value: 'completed' },
                error_code: 'INV-ACTIVITY-DURATION',
                error_message: 'Activity completion requires duration > 0 seconds'
            }
        },
        {
            id: 'constraint-00000000-0000-0000-0000-000000000008',
            type: 'validation_constraint',
            slug: 'b2b_requires_decision_maker',
            name: 'B2B Product requires Decision Maker persona',
            summary: 'B2B products must be linked to at least one persona with power_level >= 3',
            account_id: TEST_ACCOUNTS.SYSTEM,
            data: {
                entity_type: 'product',
                trigger: 'validation_endpoint',
                constraint_type: 'relationship_exists',
                condition: { field: 'product_type', op: 'eq', value: 'B2B' },
                relationship_type: 'targets_persona',
                target_dimension: 'persona',
                power_level_minimum: 3,
                error_code: 'INV-B2B-PERSONA',
                error_message: 'B2B product must have at least one Decision Maker persona linked'
            }
        }
    ];

    for (const constraint of constraints) {
        stmt.run(
            constraint.id,
            constraint.type,
            constraint.slug,
            constraint.name,
            constraint.summary,
            constraint.account_id,
            JSON.stringify(constraint.data)
        );
    }
}

/**
 * Seed pipeline stage configurations
 */
export function seedPipelineStages(): void {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO records (id, type, slug, name, summary, account_id, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    // Seed all 24 pipeline stages from JSON
    for (const stage of pipelineStagesJson) {
        stmt.run(
            stage.id,
            stage.type,
            stage.slug,
            stage.name,
            stage.summary || null,
            stage.account_id,
            JSON.stringify(stage.data)
        );
    }

    // Seed activity definitions
    Object.values(SEED_ACTIVITY_DEFS).forEach(actDef => {
        stmt.run(
            actDef.id,
            actDef.type,
            actDef.slug,
            actDef.name,
            actDef.summary,
            TEST_ACCOUNTS.SYSTEM,
            JSON.stringify(actDef.data)
        );
    });
}
