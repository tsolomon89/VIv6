
import { db } from '../core/db.js';
import { randomUUID } from 'crypto';

/**
 * seed_schema.ts
 * 
 * Defines the core "Oblio" ontology (Objects and Fields) in the database.
 * This script is idempotent: it upserts definitions based on their SLUG.
 * 
 * Architecture:
 * - Objects: Defined in 'object_def' records.
 * - Fields: Defined in 'field_def' records, linked to Objects via 'object_def_id'.
 */

const SYSTEM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

// Type Definitions matching core/types.ts roughly for seeding
type FieldInputType = 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'select' | 'multiselect' | 'image' | 'url' | 'boolean' | 'ref' | 'Record';

interface FieldSeed {
    slug: string; // e.g., 'price'
    name: string; // e.g., 'Price'
    type: FieldInputType;
    options?: string[]; // For select
    ref_target?: string; // Slug of the target object (e.g., 'account')
    required?: boolean;
    summary?: string; 
}

interface ObjectSeed {
    slug: string;
    name: string;
    summary: string;
    icon?: string;
    fields: FieldSeed[];
}

const OBLIO_SCHEMA: ObjectSeed[] = [
    // ----------------------------------------------------------------------
    // 2.1 The Product Tensor
    // ----------------------------------------------------------------------
    {
        slug: 'product',
        name: 'Product',
        summary: 'The seed of Potential Energy. Defines offerings.',
        icon: 'package',
        fields: [
            { slug: 'name', name: 'Product Name', type: 'text', required: true, summary: 'Strategic anchor for customer loyalty' },
            { slug: 'url', name: 'Product URL', type: 'url', summary: 'Primary digital address' },
            { 
                slug: 'pipeline', 
                name: 'Pipeline Classification', 
                type: 'select', 
                options: ['B2B', 'B2C', 'Partnership', 'Investment'],
                required: true,
                summary: 'Primary router for product physics'
            },

            { slug: 'price', name: 'Price', type: 'currency', required: true },
            { slug: 'currency', name: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'JPY'] },
            { 
                slug: 'billing_frequency', 
                name: 'Billing Frequency', 
                type: 'select', 
                options: ['One-Time', 'Monthly', 'Quarterly', 'Annual']
            },
            { slug: 'contract_duration', name: 'Contract Duration (Months)', type: 'number' },
            { slug: 'features', name: 'Features', type: 'Record', ref_target: 'feature', summary: 'bundled features' }
        ]
    },
    {
        slug: 'feature',
        name: 'Feature',
        summary: 'A tangible aspect of the product (The Thing).',
        icon: 'zap',
        fields: [
            { slug: 'name', name: 'Feature Name', type: 'text', required: true, summary: 'Noun. Max 30 chars.' },
            { slug: 'product', name: 'Parent Product', type: 'ref', ref_target: 'product', required: true },
            { slug: 'sku', name: 'SKU', type: 'text' },
            { slug: 'price', name: 'Auxiliary Price', type: 'currency' },
            { slug: 'description', name: 'Description', type: 'textarea' },
            { slug: 'solutions', name: 'Solutions', type: 'Record', ref_target: 'solution', summary: 'Benefits mapped to this feature' }
        ]
    },
    {
        slug: 'solution',
        name: 'Solution',
        summary: 'How a Feature solves a problem (The Action).',
        icon: 'check-circle',
        fields: [
            { slug: 'name', name: 'Solution Name', type: 'text', required: true, summary: 'Verb. Max 30 chars.' },
            { slug: 'use_case', name: 'Use Case', type: 'ref', ref_target: 'use_case' },
            { slug: 'pitch', name: 'Elevator Pitch', type: 'textarea' },
            { slug: 'personas', name: 'Target Personas', type: 'Record', ref_target: 'persona' }
        ]
    },

    // ----------------------------------------------------------------------
    // 2.2 The Audience Vectors
    // ----------------------------------------------------------------------
    {
        slug: 'persona',
        name: 'Persona',
        summary: 'Archetypal user or buyer.',
        icon: 'users',
        fields: [
            { slug: 'name', name: 'Persona Name', type: 'text', required: true },
            { 
                slug: 'type', 
                name: 'Archetype', 
                type: 'select', 
                options: ['Decision Maker', 'End User', 'Influencer'],
                required: true
            },
            { slug: 'role_name', name: 'Role Name', type: 'text' },
            { slug: 'pain_points', name: 'Pain Points', type: 'textarea' },
            { 
                slug: 'authority_level', 
                name: 'Authority Level', 
                type: 'select', 
                options: ['Decision Maker', 'Influencer', 'End User', 'Gatekeeper'] 
            }
        ]
    },
    {
        slug: 'use_case',
        name: 'Use Case',
        summary: 'Intersection of Persona Property and Solution.',
        icon: 'target',
        fields: [
            { slug: 'name', name: 'Name', type: 'text', required: true },
            { slug: 'context', name: 'Context', type: 'textarea' },
            { slug: 'persona', name: 'Persona', type: 'ref', ref_target: 'persona' },
            { slug: 'solution', name: 'Solution', type: 'ref', ref_target: 'solution' },
            { slug: 'assets', name: 'Marketing Assets', type: 'Record', ref_target: 'asset' }
        ]
    },

    // ----------------------------------------------------------------------
    // 2.3 The Entity Graph
    // ----------------------------------------------------------------------
    {
        slug: 'contact',
        name: 'Contact',
        summary: 'Fundamental particle of the customer universe.',
        icon: 'contact',
        fields: [
            { slug: 'first_name', name: 'First Name', type: 'text', required: true },
            { slug: 'last_name', name: 'Last Name', type: 'text', required: true },
            { slug: 'email', name: 'Email', type: 'text' }, 
            { slug: 'phone', name: 'Phone', type: 'text' },
            { slug: 'job_title', name: 'Job Title', type: 'text' },
            { slug: 'account', name: 'Account', type: 'ref', ref_target: 'account' },
            { slug: 'persona', name: 'Persona', type: 'ref', ref_target: 'persona' },
            { slug: 'linkedin_url', name: 'LinkedIn', type: 'url' },
            { slug: 'avatar', name: 'Avatar', type: 'image' },
            { slug: 'birthdate', name: 'Birthdate', type: 'date' },
            { slug: 'work_history', name: 'Work History', type: 'Record', ref_target: 'work_history' }
        ]
    },
    {
        slug: 'work_history',
        name: 'Work History',
        summary: 'Temporal link between a Contact and an Account.',
        icon: 'briefcase',
        fields: [
            { slug: 'contact', name: 'Contact', type: 'Record', required: true, ref_target: 'contact' },
            { slug: 'account', name: 'Account', type: 'Record', required: true, ref_target: 'account' },
            { slug: 'job_title', name: 'Job Title', type: 'text', required: true },
            { slug: 'start_date', name: 'Start Date', type: 'date', required: true },
            { slug: 'end_date', name: 'End Date', type: 'date' }, // Null = Current
            { slug: 'is_primary', name: 'Is Primary?', type: 'boolean' }
        ]
    },
    {
        slug: 'account',
        name: 'Account',
        summary: 'Gravitational center of the B2B deal.',
        icon: 'building-2',
        fields: [
            { slug: 'name', name: 'Account Name', type: 'text', required: true },
            { slug: 'industry', name: 'Industry', type: 'text' }, 
            { slug: 'size', name: 'Company Size', type: 'select', options: ['1-10', '11-50', '51-200', '201-500', '500+'] },
            { slug: 'revenue', name: 'Annual Revenue', type: 'currency' },
            { slug: 'website', name: 'Website', type: 'url' },
            { slug: 'logo', name: 'Logo', type: 'image' },
            { slug: 'linkedin_url', name: 'LinkedIn URL', type: 'url' },
            { slug: 'primary_contact', name: 'Primary Contact', type: 'ref', ref_target: 'contact' }
        ]
    },

    // ----------------------------------------------------------------------
    // 2.4 The Transactional Core
    // ----------------------------------------------------------------------
    {
        slug: 'opportunity',
        name: 'Opportunity',
        summary: 'Active vessel in the Markov process.',
        icon: 'dollar-sign',
        fields: [
            { slug: 'name', name: 'Opportunity Name', type: 'text', required: true },
            { slug: 'amount', name: 'Amount', type: 'currency' },
            { 
                slug: 'stage', 
                name: 'Stage', 
                type: 'select', 
                options: ['MQL', 'SQL', 'FTP', 'RQL', 'Closed Won', 'Closed Lost'],
                required: true 
            },
            { slug: 'close_date', name: 'Close Date', type: 'date' },
            { slug: 'account', name: 'Account', type: 'ref', ref_target: 'account' },
            { slug: 'primary_contact', name: 'Primary Contact', type: 'ref', ref_target: 'contact' },
            { slug: 'product', name: 'Product', type: 'Record', ref_target: 'product' },
            { slug: 'probability', name: 'Probability (%)', type: 'number' },
            // Stochastic Model Fields
            { slug: 'health_score', name: 'Health Score (Entropy)', type: 'number', summary: 'Dynamic energetic state (0-100)' },
            { slug: 'decay_rate', name: 'Decay Rate', type: 'number', summary: 'Entropic decay per unit time' }
        ]
    },
    {
        slug: 'qualifier',
        name: 'Qualifier',
        summary: 'Boolean property acting as a logic gate.',
        icon: 'check-square',
        fields: [
            { slug: 'name', name: 'Name', type: 'text', required: true },
            { slug: 'is_met', name: 'Is Met?', type: 'boolean', required: true },
            { slug: 'opportunity', name: 'Opportunity', type: 'ref', ref_target: 'opportunity' }, // Keeping ref for now or switching to Record? Let's use ref for consistency with existing unless we want strict
            { slug: 'required_for_stage', name: 'Required For Stage', type: 'select', options: ['MQL', 'SQL', 'FTP', 'RTP'] },
            { slug: 'criteria', name: 'Criteria', type: 'textarea' }
        ]
    },

    // --- CREATIVE & GROWTH VECTORS ---
    {
        slug: 'asset',
        name: 'Asset',
        summary: 'A digital artifact created for a specific purpose.',
        icon: 'share-2',
        fields: [
            { slug: 'name', name: 'Asset Name', type: 'text', required: true },
            { slug: 'type', name: 'Type', type: 'select', options: ['Image', 'Video', 'Copy', 'Script', 'PDF'] },
            { slug: 'url', name: 'URL', type: 'url' },
            { slug: 'status', name: 'Status', type: 'select', options: ['Draft', 'Review', 'Approved', 'Published'] },
            { slug: 'campaign', name: 'Campaign', type: 'Record', ref_target: 'campaign' },
            { slug: 'product', name: 'Product', type: 'Record', ref_target: 'product' }
        ]
    },
    {
        slug: 'content',
        name: 'Content',
        summary: 'The raw material for assets (atomic ideas).',
        icon: 'library',
        fields: [
            { slug: 'title', name: 'Title', type: 'text', required: true },
            { slug: 'body', name: 'Body', type: 'textarea' },
            { slug: 'author', name: 'Author', type: 'Record', ref_target: 'user' },
            { slug: 'status', name: 'Status', type: 'select', options: ['Idea', 'Draft', 'Final'] }
        ]
    },
    {
        slug: 'campaign',
        name: 'Campaign',
        summary: 'A strategic initiative to deploy potential energy.',
        icon: 'megaphone',
        fields: [
            { slug: 'name', name: 'Campaign Name', type: 'text', required: true },
            { slug: 'budget', name: 'Budget', type: 'currency' },
            { slug: 'start_date', name: 'Start Date', type: 'date' },
            { slug: 'end_date', name: 'End Date', type: 'date' },
            { slug: 'status', name: 'Status', type: 'select', options: ['Planning', 'Active', 'Completed', 'Paused'] },
            { slug: 'performance_metrics', name: 'Performance Metrics', type: 'textarea', summary: 'JSON blob or relation' }
        ]
    },

    // --- SYSTEM ACTORS ---
    {
        slug: 'user',
        name: 'User',
        summary: 'A human agent authorized to perform work (kinetic operators).',
        icon: 'user-check',
        fields: [
            { slug: 'first_name', name: 'First Name', type: 'text', required: true },
            { slug: 'last_name', name: 'Last Name', type: 'text', required: true },
            { slug: 'email', name: 'Email', type: 'text', required: true },
            { slug: 'role', name: 'Role', type: 'ref', ref_target: 'role', required: true },
            { slug: 'capacity_minutes', name: 'Daily Capacity (min)', type: 'number', summary: ' Finite constraint for Algo 1' },
            { slug: 'hourly_rate', name: 'Hourly Rate', type: 'currency', summary: 'For CAC calculation' }
        ]
    },
    {
        slug: 'role',
        name: 'Role',
        summary: 'A set of permissions and constraints.',
        icon: 'shield',
        fields: [
            { slug: 'name', name: 'Role Name', type: 'text', required: true },
            { slug: 'permissions', name: 'Permissions', type: 'multiselect', options: ['read_all', 'write_all', 'approve_assets', 'export_data'] }
        ]
    },

    // ----------------------------------------------------------------------
    // 2.5 The Activity Engine
    // ----------------------------------------------------------------------
    {
        slug: 'activity',
        name: 'Activity',
        summary: 'The atom of work. Kinetic operator.',
        icon: 'activity',
        fields: [
            { slug: 'subject', name: 'Subject', type: 'text', required: true },
            { 
                slug: 'type', 
                name: 'Type', 
                type: 'select', 
                options: ['Data', 'Asset', 'Engagement', 'Admin'],
                required: true 
            },
            { slug: 'status', name: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Completed', 'Skipped'] },
            { slug: 'description', name: 'Description', type: 'textarea' },
            { slug: 'date', name: 'Date', type: 'date' },
            
            // Physics of Time
            { slug: 'default_duration_minutes', name: 'Default Duration (min)', type: 'number', summary: 'Theoretical time' },
            { slug: 'baseline_duration_minutes', name: 'Baseline Duration (min)', type: 'number', summary: 'Statistical average' },
            { slug: 'actual_duration_seconds', name: 'Actual Duration (sec)', type: 'number', summary: 'Precise measured labor' },
            
            // Rational Trigonometry
            { slug: 'quadrance', name: 'Quadrance (Q)', type: 'number', summary: 'Squared distance to close' },
            { slug: 'spread', name: 'Spread (s)', type: 'number', summary: 'Divergence from optimal path' },

            // Context
            { slug: 'account', name: 'Account', type: 'ref', ref_target: 'account' },
            { slug: 'contact', name: 'Contact', type: 'ref', ref_target: 'contact' },
            { slug: 'opportunity', name: 'Opportunity', type: 'ref', ref_target: 'opportunity' }
        ]
    }
];

async function seedSchema() {
    console.log('🌱 Seeding Oblio Schema (Objects & Fields)...');

    // 1. Prepare Statements
    const upsertObject = db.prepare(`
        INSERT INTO records (id, type, slug, name, summary, account_id, data, created_at, updated_at)
        VALUES (@id, 'object_def', @slug, @name, @summary, @account_id, @data, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(account_id, slug) DO UPDATE SET
            name = excluded.name,
            summary = excluded.summary,
            data = excluded.data,
            updated_at = CURRENT_TIMESTAMP
    `);

    const findObjectBySlug = db.prepare(`SELECT id FROM records WHERE slug = ? AND type = 'object_def' AND account_id = ?`);
    
    // We store fields as separate records, type='field_def'
    // We need to link them to the parent object.
    // The current pattern uses a `ref_target` or similar mechanism? 
    // Wait, the new `field_def` schema likely needs a `parent_id` or a pointer in `data`.
    // Let's assume `data.object_def_id` or similar. 
    // Based on `core/types.ts`, `FieldDef` isn't fully typed there, but `records` table is generic.
    
    const upsertField = db.prepare(`
        INSERT INTO records (id, type, slug, name, summary, account_id, data, created_at, updated_at)
        VALUES (@id, 'field_def', @slug, @name, @summary, @account_id, @data, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(account_id, slug) DO UPDATE SET
            name = excluded.name,
            summary = excluded.summary,
            data = excluded.data,
            updated_at = CURRENT_TIMESTAMP
    `);

    // 2. Iterate and Seed
    db.transaction(() => {
        for (const obj of OBLIO_SCHEMA) {
            const objId = randomUUID();
            
            // 2.1 Upsert Object Definition
            // Check if exists first to reuse ID else slug collision handles update but we need ID for fields
            let existingObj = findObjectBySlug.get(obj.slug, SYSTEM_ACCOUNT_ID) as { id: string } | undefined;
            const finalObjId = existingObj ? existingObj.id : objId;

            upsertObject.run({
                id: finalObjId,
                slug: obj.slug,
                name: obj.name,
                summary: obj.summary,
                account_id: SYSTEM_ACCOUNT_ID,
                data: JSON.stringify({ icon: obj.icon })
            });

            console.log(`📦 Object: ${obj.name} (${obj.slug})`);

            // 2.2 Upsert Valid Fields
            for (const field of obj.fields) {
                // Unique slug for field: object_field (e.g., contact_email)
                const fieldSlug = `${obj.slug}_${field.slug}`; 
                
                // If Ref, resolve target object ID? 
                // Actually, the field definition just needs the slug of the target object usually, 
                // or we rely on the UI to look up the object_def by slug.
                // Let's store target_object_slug for now to be safe.
                
                const fieldData = {
                    type: field.type,
                    object_def_id: finalObjId, // Link to parent
                    options: field.options,
                    required: field.required,
                    ref_target: field.ref_target // The slug of the target
                };

                upsertField.run({
                    id: randomUUID(), // ID doesn't matter as much as slug for fields usually, but let's let Conflict handle duplicates if we used consistent UUIDs. Here we don't have consistent UUIDs.
                    // Wait, ON CONFLICT is on (account_id, slug). So we need stable slugs.
                    slug: fieldSlug,
                    name: field.name,
                    summary: field.summary || '',
                    account_id: SYSTEM_ACCOUNT_ID,
                    data: JSON.stringify(fieldData)
                });
                // console.log(`   - Field: ${field.name} (${fieldSlug})`);
            }
        }
    })();

    console.log('✅ Oblio Schema Seeding Complete.');
}

seedSchema();
