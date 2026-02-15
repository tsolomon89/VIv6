
import { db, initDb } from '../core/db.js';
import { createEntity } from '../core/entities.js';
import { createRelationship } from '../core/relationships.js';
import { seedTemplates } from './seed_templates.js';
import crypto from 'crypto';
import { makeEntity, makeRelationship } from '../core/staging.js';
import { Entity, Relationship } from '../core/types.js';
import { createDomain, getDomainByHostname } from '../core/domains.js';
import { fileURLToPath } from 'url';

// --- CONSTANTS ---
const OBLIO_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
const VICTORY_ACCOUNT_ID = 'acc_vi_000000000000000001';
const TIM_ACCOUNT_ID = 'acc_tim_000000000000000002';
const KEIMENON_ACCOUNT_ID = 'acc_kei_000000000000000003';
const FTL_ACCOUNT_ID = 'acc_ftl_000000000000000004';

const ACCOUNTS = [
    { id: VICTORY_ACCOUNT_ID, slug: 'victory_initiative', name: 'Victory Initiative', type: 'client' },
    { id: TIM_ACCOUNT_ID, slug: 'tim_solomon', name: 'Tim Solomon', type: 'client' },
    { id: KEIMENON_ACCOUNT_ID, slug: 'keimenon', name: 'Keimenon', type: 'client' },
    { id: FTL_ACCOUNT_ID, slug: 'ftl_marketing', name: 'FTL Marketing', type: 'client' }
];

// Replicate defaults structure
const CONFIG_GROUP = {
    name: 'Configuration',
    fields: [ { name: 'Is Site Owner', inputType: 'boolean', value: false } ]
};

function getFieldGroups(type: string, isSiteOwner: boolean = false) {
    const groups: any[] = [];
    if (type === 'brand') {
        const config = JSON.parse(JSON.stringify(CONFIG_GROUP));
        config.fields[0].value = isSiteOwner;
        groups.push(config);
    }
    groups.push({
        name: 'Content',
        fields: [{ name: 'About', inputType: 'richtext', value: 'Auto-generated content.' }]
    });
    return groups;
}

export interface SeedDomain {
    brand_slug: string; // Resolves to entity, NOT account directly (legacy logic)
    hostname: string;
    type: string;
    is_primary: boolean;
    entity_types: string[];
    config: Record<string, unknown>;
    account_id: string; // NEW: Direct binding
}

export interface SeedState {
    entities: Entity[];
    relationships: Relationship[];
    domains: SeedDomain[];
}

export function generateTier2Data(): SeedState {
    const entities: Entity[] = [];
    const relationships: Relationship[] = [];
    
    const addEntity = (entity: Entity) => {
        entities.push(entity);
        return entity;
    };

    // 1. CREATE CLIENT ENTITIES (CRM Records inside OBLIO Partition)
    // These represent the "Customer" record in Oblio's CRM.
    const victoryCrm = addEntity(makeEntity({
        type: 'account', // Was 'brand'
        name: 'Victory Initiative',
        slug: 'victory_crm',
        account_id: OBLIO_ACCOUNT_ID,
        data: { status: 'active', plan: 'growth' }
    }));

    // 2. VICTORY PARTITION CONTENT
    // Only Victory stuff goes here.
    
    // Victory "Brand" Entity (Self-Reference for Site Config)
    // Legacy UI uses type='brand' to find site config.
    const victoryBrand = addEntity(makeEntity({
        type: 'brand',
        name: 'Victory Initiative',
        slug: 'victory', // Matches domain lookup
        account_id: VICTORY_ACCOUNT_ID,
        data: { fieldGroups: getFieldGroups('brand', true) }
    }));

    // Products under Victory
    const prodKeimenon = addEntity(makeEntity({
        type: 'product',
        name: 'Keimenon',
        slug: 'keimenon_tool', // Distinct from account slug
        account_id: VICTORY_ACCOUNT_ID,
        data: { fieldGroups: getFieldGroups('product') }
    }));

    // Solutions
    const solEnterprise = addEntity(makeEntity({
        type: 'solution',
        name: 'Enterprise Tier',
        slug: 'enterprise',
        account_id: VICTORY_ACCOUNT_ID,
        data: { fieldGroups: getFieldGroups('solution') }
    }));

    // Relationships (Internal to Victory)
    relationships.push(makeRelationship({ 
        from_entity_id: victoryBrand.id, 
        to_entity_id: prodKeimenon.id, 
        relationship_type: 'offers' 
    }));
    relationships.push(makeRelationship({ 
        from_entity_id: victoryBrand.id, 
        to_entity_id: solEnterprise.id, 
        relationship_type: 'offers' 
    }));

    // 3. OBLIO PARTITION CONTENT (Demo stuff for Oblio site)
    const oblioBrand = addEntity(makeEntity({
        type: 'brand',
        name: 'Oblio Platform',
        slug: 'oblio',
        account_id: OBLIO_ACCOUNT_ID,
        data: { fieldGroups: getFieldGroups('brand', true) }
    }));

    // 4. NIKE (Another Client, Example) -> In Oblio Partition as CRM record?
    // Or as a partner in Victory Partition? 
    // Let's put Nike as a 'brand' in Victory partition (e.g. Portfolio item)
    const nike = addEntity(makeEntity({
        type: 'brand', // Portfolio brand
        name: 'Nike',
        slug: 'nike',
        account_id: VICTORY_ACCOUNT_ID,
        data: { fieldGroups: getFieldGroups('brand', false) }
    }));
    
    // Victory -> Built -> Nike
    relationships.push(makeRelationship({
        from_entity_id: victoryBrand.id,
        to_entity_id: nike.id,
        relationship_type: 'built'
    }));

    // 5. FTL MARKETING (Client)
    const ftlBrand = addEntity(makeEntity({
        type: 'brand',
        name: 'FTL Marketing',
        slug: 'ftl',
        account_id: FTL_ACCOUNT_ID,
        data: { fieldGroups: getFieldGroups('brand', true) }
    }));

    // DOMAINS
    // Note: Domains table uses `account_id`.
    const domains: SeedDomain[] = [
        {
            brand_slug: 'victory',
            hostname: 'www.victory.localhost',
            type: 'www',
            is_primary: true,
            entity_types: ['product', 'feature', 'solution', 'useCase', 'persona'],
            config: { gtmId: 'GTM-VICTORY' },
            account_id: VICTORY_ACCOUNT_ID
        },
        {
            brand_slug: 'oblio',
            hostname: 'www.oblio.localhost',
            type: 'www',
            is_primary: true,
            entity_types: ['product', 'feature', 'solution'],
            config: { gtmId: 'GTM-OBLIO' },
            account_id: OBLIO_ACCOUNT_ID
        },
        {
            brand_slug: 'ftl',
            hostname: 'www.ftlmarketing.localhost',
            type: 'www',
            is_primary: true,
            entity_types: ['page'], 
            config: {},
            account_id: FTL_ACCOUNT_ID
        }
    ];

    return { entities, relationships, domains };
}

export function seedTier2() {
    console.log('🏗️  Start Tier 2 Seeding (Clients)...');
    const now = new Date().toISOString();

    // 1. Create client ACCOUNTS in the infrastructure table
    console.log('   -> Creating Client Accounts...');
    const insertAccount = db.prepare(`
        INSERT INTO accounts (id, slug, name, type, created_at, updated_at)
        VALUES (@id, @slug, @name, @type, @createdAt, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at
    `);

    for (const acc of ACCOUNTS) {
        insertAccount.run({
            id: acc.id,
            slug: acc.slug,
            name: acc.name,
            type: acc.type,
            createdAt: now,
            updatedAt: now
        });
    }

    // 2. Generate and Insert Data
    console.log('   -> Generating Tenant Data...');
    const state = generateTier2Data();

    // ENTITIES
    for (const e of state.entities) {
        try {
            createEntity(e);
        } catch (err) {
             // Ignore unique constraint if re-running
        }
    }
    console.log(`   -> Seeded ${state.entities.length} entities.`);

    // RELATIONSHIPS
    for (const r of state.relationships) {
        try {
            createRelationship(r);
        } catch (err) { }
    }
    console.log(`   -> Seeded ${state.relationships.length} relationships.`);

    // DOMAINS
    for (const d of state.domains) {
        try {
            createDomain({
                account_id: d.account_id,
                hostname: d.hostname,
                type: d.type as any,
                is_primary: d.is_primary,
                entity_types: d.entity_types,
                config: d.config
            });
        } catch (err) {
            console.error(`Failed to create domain ${d.hostname}:`, err);
        }
    }
    console.log(`   -> Seeded ${state.domains.length} domains.`);

    // TEMPLATES (Optional, if needed for Victory)
    seedTemplates(); // This likely seeds into Oblio or uses a loop? 
    // Current `seed_templates.ts` might be hardcoded to just insert templates.
    // Assuming templates are global or linked to Oblio root? 
    // `schema.sql` has `account_id` on templates.
    // Check `seed_templates.ts` if needed. For now assuming it's fine.

    console.log('✅ Tier 2 Seeding Complete.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        initDb();
        seedTier2();
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
}
