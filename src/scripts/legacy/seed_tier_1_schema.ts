
import { db, initDb } from '../core/db.js';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const OBLIO_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

// --- SCHEMA DEFINITIONS ---
const SCHEMA_OBJECTS = [
    { slug: 'contact', name: 'Contact', summary: 'A person.' },
    { slug: 'account', name: 'Account', summary: 'A company or organization.' },
    { slug: 'product', name: 'Product', summary: 'A sellable item or bundle.' },
    { slug: 'feature', name: 'Feature', summary: 'A functional capability.' },
    { slug: 'solution', name: 'Solution', summary: 'A value proposition or problem solved.' },
    { slug: 'use_case', name: 'Use Case', summary: 'A market context or scenario.' },
    { slug: 'persona', name: 'Persona', summary: 'A target audience segment.' },
    { slug: 'asset', name: 'Asset', summary: 'Digital content (image, video, text).' },
    { slug: 'campaign', name: 'Campaign', summary: 'A logic orchestrator.' },
    { slug: 'activity', name: 'Activity', summary: 'An event or log entry.' }
];

const STANDARD_ROLES = ['Admin', 'Editor', 'Viewer', 'Billing'];

export function seedTier1() {
    console.log('🏛️  Start Tier 1 Seeding (Oblio Schema)...');

    const now = new Date().toISOString();

    db.transaction(() => {
        const upsertEntity = db.prepare(`
            INSERT INTO entities (id, account_id, type, slug, name, summary, data, created_at, updated_at)
            VALUES (@id, @account_id, @type, @slug, @name, @summary, @data, @created_at, @updated_at)
            ON CONFLICT(account_id, slug) DO UPDATE SET 
                name = excluded.name, 
                summary = excluded.summary,
                updated_at = excluded.updated_at
        `);

        // 1. CANONICAL OBJECT DEFINITIONS
        console.log('   -> Seeding Canonical Objects...');
        for (const obj of SCHEMA_OBJECTS) {
            upsertEntity.run({
                id: uuidv4(), // These iterate, no hardcoded requirement unless needed for bootstrapping
                account_id: OBLIO_ACCOUNT_ID,
                type: 'object_def',
                slug: obj.slug, // e.g. 'contact'
                name: obj.name,
                summary: obj.summary,
                data: JSON.stringify({ is_canonical: true }),
                created_at: now,
                updated_at: now
            });
        }

        // 2. STANDARD LIBRARY
        console.log('   -> Seeding Standard Library...');
        // Roles (Modeled as Dimension Values for now, or ObjectDef? Docs say "Standard Definitions")
        // Usually roles are hardcoded in code or in a special table, but if "Standard Definitions", maybe dimension?
        // Let's stick to Dimensions for roles for now as per `tier_1_oblio.md` mentioning "Standard Library".
        // Actually, user_accounts table has permission_level.
        // But RBAC might be more complex. Let's seed them as 'role' dimension values owned by Oblio.
        
        const insertDimStmt = db.prepare(`
            INSERT INTO dimension_values (id, dimension, slug, label, account_id, data, source, created_at, updated_at)
            VALUES (@id, 'role', @slug, @label, @account_id, '{}', 'tier_1_standard', datetime('now'), datetime('now'))
            ON CONFLICT(dimension, slug, account_id) DO NOTHING
        `);

        for (const role of STANDARD_ROLES) {
             insertDimStmt.run({
                 id: uuidv4(),
                 slug: role.toLowerCase(),
                 label: role,
                 account_id: OBLIO_ACCOUNT_ID
             });
        }

        // 3. OBLIO PRODUCTS (The "Business OS")
        // Oblio sells products itself.
        console.log('   -> Seeding Oblio Products...');
        const OBLIO_PRODUCTS = [
            { slug: 'prod_foundation', name: 'Foundation', summary: 'Core CRM & CMS' },
            { slug: 'prod_growth', name: 'Growth Suite', summary: 'Marketing & Automation' },
            { slug: 'prod_builder', name: 'Builder Pro', summary: 'Visual Editor & Advanced Tools' }
        ];

        for (const prod of OBLIO_PRODUCTS) {
            upsertEntity.run({
                id: uuidv4(),
                account_id: OBLIO_ACCOUNT_ID,
                type: 'product',
                slug: prod.slug,
                name: prod.name,
                summary: prod.summary,
                data: JSON.stringify({ price: 0 }), // Free?
                created_at: now,
                updated_at: now
            });
        }

    })();

    console.log('✅ Tier 1 Seeding Complete.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    initDb();
    seedTier1();
}
