
import { db } from '../core/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../');

// Paths to CSVs
const DATA_DIR = path.join(PROJECT_ROOT, 'agent_context/archive/data_models');
const FILE_INDUSTRY = path.join(DATA_DIR, 'Oblio Documentation - 9.) Oblio Data Asset  - Sector_Industry.csv');
const FILE_SIZE = path.join(DATA_DIR, 'Oblio Documentation - 9.) Oblio Data Asset  - Comp. Size _ Emp #.csv');
const FILE_ROLE = path.join(DATA_DIR, 'Oblio Documentation - 9.) Oblio Data Asset  - Title _ Dept. _ Senority (1).csv');

// Helper to slugify (exported for testing)
export function toSlug(text: string): string {
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// Database Helpers
// Use NULL for global dimensions (account_id NULL = Global per schema)
const ROOT_ACCOUNT_ID: string | null = null;

// Lazy-initialized prepared statements (for test compatibility)
let _insertStmt: ReturnType<typeof db.prepare> | null = null;
let _findIdStmt: ReturnType<typeof db.prepare> | null = null;
let _insertDepStmt: ReturnType<typeof db.prepare> | null = null;
let _findDepStmt: ReturnType<typeof db.prepare> | null = null;

function getInsertStmt() {
    if (!_insertStmt) {
        _insertStmt = db.prepare(`
            INSERT INTO dimension_values (id, dimension, slug, label, parent_id, metadata, source, account_id, created_at, updated_at)
            VALUES (@id, @dimension, @slug, @label, @parent_id, @metadata, 'seed_script', @account_id, datetime('now'), datetime('now'))
            ON CONFLICT(dimension, slug, account_id) DO UPDATE SET
                label = excluded.label,
                parent_id = excluded.parent_id,
                metadata = excluded.metadata,
                updated_at = datetime('now')
        `);
    }
    return _insertStmt;
}

function getFindIdStmt() {
    if (!_findIdStmt) {
        _findIdStmt = db.prepare('SELECT id FROM dimension_values WHERE dimension = ? AND slug = ? AND account_id IS NULL');
    }
    return _findIdStmt;
}

function getInsertDepStmt() {
    if (!_insertDepStmt) {
        _insertDepStmt = db.prepare(`
            INSERT INTO dimension_dependencies (id, source_dimension, source_value_id, target_dimension, target_value_id, bidirectional, weight, source, account_id, created_at, updated_at)
            VALUES (@id, @source_dimension, @source_value_id, @target_dimension, @target_value_id, @bidirectional, @weight, 'seed_script', @account_id, datetime('now'), datetime('now'))
        `);
    }
    return _insertDepStmt;
}

function getFindDepStmt() {
    if (!_findDepStmt) {
        _findDepStmt = db.prepare(`
            SELECT id FROM dimension_dependencies
            WHERE source_value_id = ? AND target_value_id = ? AND account_id IS NULL
        `);
    }
    return _findDepStmt;
}

// Reset statements for testing (call when db is reset)
export function resetStatements() {
    _insertStmt = null;
    _findIdStmt = null;
    _insertDepStmt = null;
    _findDepStmt = null;
}

// Exported for testing
export function createDependency(
    sourceDim: string,
    sourceSlug: string,
    targetDim: string,
    targetSlug: string,
    bidirectional: number = 1,
    weight: number = 100
): boolean {
    const sourceId = getFindIdStmt().get(sourceDim, sourceSlug) as { id: string } | undefined;
    const targetId = getFindIdStmt().get(targetDim, targetSlug) as { id: string } | undefined;

    if (!sourceId || !targetId) {
        return false;
    }

    // Check if dependency already exists (idempotent)
    const existingDep = getFindDepStmt().get(sourceId.id, targetId.id) as { id: string } | undefined;
    if (existingDep) {
        return true; // Already exists, count as success
    }

    try {
        getInsertDepStmt().run({
            id: uuidv4(),
            source_dimension: sourceDim,
            source_value_id: sourceId.id,
            target_dimension: targetDim,
            target_value_id: targetId.id,
            bidirectional,
            weight,
            account_id: null
        });
        return true;
    } catch {
        return false;
    }
}

// Exported for testing
export function upsertDimension(dimension: string, label: string, parentId: string | null = null, metadata: any = {}) {
    const slug = toSlug(label);
    const existing = getFindIdStmt().get(dimension, slug) as { id: string } | undefined;

    // If already exists, return existing id (skip insert for idempotency)
    if (existing) {
        return existing.id;
    }

    const id = uuidv4();

    try {
        getInsertStmt().run({
            id,
            dimension,
            slug,
            label,
            parent_id: parentId,
            metadata: JSON.stringify(metadata),
            account_id: null
        });
    } catch (err: any) {
        console.error(`Error upserting ${dimension}/${slug} with id=${id}:`, err.message);
        throw err;
    }

    return id;
}

// --- SEEDERS ---

// Simple CSV parser that handles quoted fields (exported for testing)
export function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function seedIndustries() {
    console.log('🏭 Seeding Industries...');
    if (!fs.existsSync(FILE_INDUSTRY)) {
        console.warn(`⚠️ File not found: ${FILE_INDUSTRY}`);
        return;
    }

    const content = fs.readFileSync(FILE_INDUSTRY, 'utf-8');
    const lines = content.split('\n').slice(1).filter(l => l.trim());

    // Cache sectors by SLUG to avoid duplicate inserts
    const sectorMap = new Map<string, string>();

    for (const line of lines) {
        // Industry,Industry Sector
        // Dairy,Agriculture
        const parts = parseCSVLine(line);
        if (parts.length < 2) continue;

        const industryLabel = parts[0].trim();
        const sectorLabel = parts[1].trim();

        if (!sectorLabel || !industryLabel) continue;

        // Use slug as key to handle label variations
        const sectorSlug = toSlug(sectorLabel);

        // Ensure Sector exists
        let sectorId = sectorMap.get(sectorSlug);
        if (!sectorId) {
            sectorId = upsertDimension('sector', sectorLabel);
            sectorMap.set(sectorSlug, sectorId);
        }

        // Upsert Industry with parent
        upsertDimension('industry', industryLabel, sectorId);
    }
    console.log(`✅ Seeded ${lines.length} industries across ${sectorMap.size} sectors.`);
}

function seedCompanySize() {
    console.log('🏢 Seeding Company Sizes...');
    if (!fs.existsSync(FILE_SIZE)) {
        console.warn(`⚠️ File not found: ${FILE_SIZE}`);
        return;
    }

    const content = fs.readFileSync(FILE_SIZE, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    
    // Header: Company Size Class, Size Emp# Start, Size Emp# Size Stop, Headcount, Linkedin, Company ARR Range
    // Skip line 0
    let count = 0;

    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length < 5) continue;

        const sizeClass = parts[0]; // VSB
        const rangeLabel = parts[4]; // "2-10 employees" (Linkedin column is usually cleanest)
        const start = parseInt(parts[1]) || 0;
        const stop = parseInt(parts[2]) || 0;

        if (!rangeLabel) continue;

        // Upsert the specific range node
        // Slug: vsb_2_10
        upsertDimension('company_size', rangeLabel, null, {
            class: sizeClass,
            range_start: start,
            range_end: stop
        });
        count++;
    }
    console.log(`✅ Seeded ${count} company size ranges.`);
}

function seedJobRoles() {
    console.log('💼 Seeding Job Roles (Functions & Seniority)...');
    if (!fs.existsSync(FILE_ROLE)) {
        console.warn(`⚠️ File not found: ${FILE_ROLE}`);
        return;
    }

    const content = fs.readFileSync(FILE_ROLE, 'utf-8');
    const lines = content.split('\n').slice(1).filter(l => l.trim());

    const functions = new Set<string>();
    const seniorities = new Set<string>();

    for (const line of lines) {
        // Job Title, Department, Seniority, ...
        // Accounting Analyst, Accounting, Senior, ...
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 3) continue;

        const dept = parts[1];
        const seniority = parts[2];

        if (dept && dept !== 'Department') functions.add(dept);
        if (seniority && seniority !== 'Seniority') seniorities.add(seniority);
    }

    // Seed Functions
    for (const func of functions) {
        upsertDimension('function', func);
    }
    console.log(`✅ Seeded ${functions.size} functions.`);

    // Seed Seniorities
    for (const sen of seniorities) {
        upsertDimension('seniority', sen);
    }
    console.log(`✅ Seeded ${seniorities.size} seniorities.`);
}

// --- PHASE 4: DEPENDENCY SEEDERS ---

function seedIndustryDependencies() {
    console.log('🔗 Seeding Industry-Sector Dependencies...');

    // Query industries that have parent_id (sector) relationships
    const industries = db.prepare(`
        SELECT dv.id, dv.slug, dv.parent_id, pv.slug as parent_slug, pv.dimension as parent_dimension
        FROM dimension_values dv
        LEFT JOIN dimension_values pv ON pv.id = dv.parent_id
        WHERE dv.dimension = 'industry'
        AND dv.parent_id IS NOT NULL
        AND dv.account_id IS NULL
    `).all() as any[];

    let depCount = 0;

    for (const ind of industries) {
        if (ind.parent_id && ind.parent_slug) {
            // Sector -> Industry dependency (bidirectional)
            if (createDependency('sector', ind.parent_slug, 'industry', ind.slug, 1, 100)) {
                depCount++;
            }
        }
    }

    console.log(`✅ Seeded ${depCount} sector-industry dependencies.`);
}

function seedJobRoleDependencies() {
    console.log('🔗 Seeding Job Role Dependencies (Function <-> Seniority)...');

    if (!fs.existsSync(FILE_ROLE)) {
        console.warn(`⚠️ File not found: ${FILE_ROLE}`);
        return;
    }

    const content = fs.readFileSync(FILE_ROLE, 'utf-8');
    const lines = content.split('\n').slice(1).filter(l => l.trim());

    // Build unique (function, seniority) pairs from the CSV
    const pairs = new Set<string>();

    for (const line of lines) {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 3) continue;

        const dept = parts[1];
        const seniority = parts[2];

        if (!dept || !seniority) continue;
        if (dept === 'Department' || seniority === 'Seniority') continue;

        // Store unique pair as "function_slug|seniority_slug"
        pairs.add(`${toSlug(dept)}|${toSlug(seniority)}`);
    }

    let depCount = 0;

    for (const pair of pairs) {
        const [funcSlug, senSlug] = pair.split('|');
        if (createDependency('function', funcSlug, 'seniority', senSlug, 1, 100)) {
            depCount++;
        }
    }

    console.log(`✅ Seeded ${depCount} function-seniority dependencies.`);
}

// --- MAIN ---

export function seedTaxonomy() {
    console.log('🌱 Starting Taxonomy Seed...');
    try {
        db.transaction(() => {
            // Phase 1: Seed dimension values
            seedIndustries();
            seedCompanySize();
            seedJobRoles();

            // Phase 4: Seed dependencies (after values exist)
            seedIndustryDependencies();
            seedJobRoleDependencies();
        })();
        console.log('🏁 Taxonomy Seed Complete!');
    } catch (err) {
        console.error('❌ Taxonomy Seed Failed:', err);
    }
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    seedTaxonomy();
}
