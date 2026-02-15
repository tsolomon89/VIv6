
import { db, initDb } from '../core/db.js';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

// --- TIER 0 CONSTANTS ---
const OBLIO_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
const OBJECT_DEF_ID = '00000000-0000-0000-0000-000000000001';
const FIELD_DEF_ID = '00000000-0000-0000-0000-000000000002';
const FIELD_GROUP_ID = '00000000-0000-0000-0000-000000000003';

// --- TAXONOMY DATA ---
const INDUSTRIES = [
    { label: 'Software', sector: 'Technology' },
    { label: 'Hardware', sector: 'Technology' },
    { label: 'Biotech', sector: 'Healthcare' },
    { label: 'Pharma', sector: 'Healthcare' },
    { label: 'Investment Banking', sector: 'Finance' },
    { label: 'Retail Banking', sector: 'Finance' },
    { label: 'Higher Education', sector: 'Education' },
    { label: 'E-Commerce', sector: 'Retail' }
];

const COMPANY_SIZES = [
    { label: '1-10', class: 'VSB', start: 1, end: 10 },
    { label: '11-50', class: 'SB', start: 11, end: 50 },
    { label: '51-200', class: 'MM', start: 51, end: 200 },
    { label: '201-500', class: 'MM', start: 201, end: 500 },
    { label: '501-1000', class: 'ENT', start: 501, end: 1000 },
    { label: '1000+', class: 'ENT', start: 1001, end: 999999 }
];

const ROLES = [
    { function: 'Engineering', seniority: 'Senior' },
    { function: 'Engineering', seniority: 'Lead' },
    { function: 'Engineering', seniority: 'CTO' },
    { function: 'Product', seniority: 'Director' },
    { function: 'Product', seniority: 'VP' },
    { function: 'Sales', seniority: 'Manager' },
    { function: 'Marketing', seniority: 'CMO' }
];

// Helper to slugify
function toSlug(text: string): string {
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// --- DATABASE HELPERS ---
// Moved inside seedTier0 to avoid 'table not found' on module load
function getTaxonomyHelpers() {
    const insertDimStmt = db.prepare(`
        INSERT INTO dimension_values (id, dimension, slug, label, parent_id, data, source, account_id, created_at, updated_at)
        VALUES (@id, @dimension, @slug, @label, @parent_id, @data, 'hardcoded_tier_0', @account_id, datetime('now'), datetime('now'))
        ON CONFLICT(dimension, slug, account_id) DO UPDATE SET
            label = excluded.label,
            parent_id = excluded.parent_id,
            data = excluded.data,
            updated_at = datetime('now')
    `);

    const findDimIdStmt = db.prepare('SELECT id FROM dimension_values WHERE dimension = ? AND slug = ? AND account_id = ?');

    function upsertDimension(dimension: string, label: string, parentId: string | null = null, data: any = {}) {
        const slug = toSlug(label);
        const existing = findDimIdStmt.get(dimension, slug, OBLIO_ACCOUNT_ID) as { id: string } | undefined;
        
        const id = existing ? existing.id : uuidv4();
        
        insertDimStmt.run({
            id,
            dimension,
            slug,
            label,
            parent_id: parentId,
            data: JSON.stringify(data),
            account_id: OBLIO_ACCOUNT_ID
        });

        return id;
    }
    return { upsertDimension };
}

export function seedTier0() {
    console.log('🥚 Start Tier 0 Seeding (The Core)...');

    const now = new Date().toISOString();

    db.transaction(() => {
        // 1. OBLIO ROOT ACCOUNT
        console.log('   -> Seeding Oblio Root Account...');
        db.prepare(`
            INSERT INTO accounts (id, slug, name, account_class, type, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at
        `).run(OBLIO_ACCOUNT_ID, 'oblio_root', 'Oblio Platform', 'platform', 'root', now, now);

        // 2. META-OBJECT DEFINITIONS (The Loopback)
        console.log('   -> Seeding Meta-Objects (ObjectDef, FieldDef)...');
        
        const upsertEntity = db.prepare(`
            INSERT INTO entities (id, account_id, type, slug, name, summary, data, created_at, updated_at)
            VALUES (@id, @account_id, @type, @slug, @name, @summary, @data, @created_at, @updated_at)
            ON CONFLICT(id) DO UPDATE SET name = excluded.name, data = excluded.data, updated_at = excluded.updated_at
        `);

        // ObjectDef
        upsertEntity.run({
            id: OBJECT_DEF_ID,
            account_id: OBLIO_ACCOUNT_ID,
            type: 'object_def',
            slug: 'object_def',
            name: 'Object Definition',
            summary: 'Defines the structure of a Record (Table).',
            data: JSON.stringify({ is_system: true }),
            created_at: now,
            updated_at: now
        });

        // FieldDef
        upsertEntity.run({
            id: FIELD_DEF_ID,
            account_id: OBLIO_ACCOUNT_ID,
            type: 'object_def', // It is an ObjectDef OF FieldDef (Wait, type should be object_def. It defines what a FieldDef IS)
            slug: 'field_def',
            name: 'Field Definition',
            summary: 'Defines a Property on an Object.',
            data: JSON.stringify({ is_system: true }),
            created_at: now,
            updated_at: now
        });

        // FieldGroup
         upsertEntity.run({
            id: FIELD_GROUP_ID,
            account_id: OBLIO_ACCOUNT_ID,
            type: 'object_def',
            slug: 'field_group',
            name: 'Field Group',
            summary: 'Visual grouping of fields.',
            data: JSON.stringify({ is_system: true }),
            created_at: now,
            updated_at: now
        });

        // 3. TAXONOMIES (Hardcoded replacement for CSVs)
        console.log('   -> Seeding Taxonomies...');
        
        // Industries & Sectors
        const { upsertDimension } = getTaxonomyHelpers();

        // Industries & Sectors
        const sectorMap = new Map<string, string>();
        for (const item of INDUSTRIES) {
            let sectorId = sectorMap.get(item.sector);
            if (!sectorId) {
                sectorId = upsertDimension('sector', item.sector);
                sectorMap.set(item.sector, sectorId);
            }
            upsertDimension('industry', item.label, sectorId!);
        }

        // Company Sizes
        for (const size of COMPANY_SIZES) {
            upsertDimension('company_size', size.label, null, {
                class: size.class,
                range_start: size.start,
                range_end: size.end
            });
        }

        // Roles & Seniority
        const functions = new Set(ROLES.map(r => r.function));
        const seniorities = new Set(ROLES.map(r => r.seniority));

        for (const f of functions) upsertDimension('function', f);
        for (const s of seniorities) upsertDimension('seniority', s);

    })();

    console.log('✅ Tier 0 Seeding Complete.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        initDb();
        seedTier0();
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
}
