import { db, initDb } from '../core/db.js';
import { fileURLToPath } from 'url';
import { loadSeedState } from '../modules/content/seeding.js';
import { seedTemplates } from './seed_templates.js';
import { seedTaxonomy } from './seed_taxonomy.js';
import { seedAI } from './seed_ai.js';
import { seedPipelineConfig } from './seed_pipeline_config.js';
import { seedFieldLibrary } from './seed_field_library.js';
import { seedPresets } from './seed_presets.js';
import bcrypt from 'bcrypt';

// --- HELPERS ---
function toSlug(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// --- MAIN INGESTOR ---
export function seedFromData() {
    console.log('🚀 Starting RFBA Homoiconic Seed (Inflation Enabled via Module)...');
    
    // 1. Load State
    const state = loadSeedState();
    console.log(`📦 Loaded State: ${state.records.length} records, ${state.domains.length} domains, ${state.users?.length || 0} users.`);

    // 2. Insert Records
    // We use direct SQL for speed and to ensure we can force IDs if needed
    const insertEntity = db.prepare(`
        INSERT INTO records (id, account_id, type, slug, name, summary, description, data, created_at, updated_at)
        VALUES (@id, @account_id, @type, @slug, @name, @summary, @description, @data, @created_at, @updated_at)
        ON CONFLICT(account_id, slug) DO UPDATE SET 
            name = excluded.name, 
            data = excluded.data, 
            summary = excluded.summary,
            description = excluded.description,
            updated_at = datetime('now')
    `);

    let recCount = 0;
    db.transaction(() => {
        for (const record of state.records) {
            try {
                insertEntity.run({
                    description: '', // Default if missing
                    summary: '',
                    ...record,
                    data: JSON.stringify(record.data) // Serialization happens here for DB
                });
                recCount++;
            } catch (err: any) {
                console.error(`   ❌ Error inserting ${record.slug}: ${err.message}`);
            }
        }
    })();
    console.log(`✅ Inserted/Updated ${recCount} records.`);

    // 2.5. Insert System Users (with password hashing)
    const insertUser = db.prepare(`
        INSERT INTO users (id, email, password_hash, name, avatar_url, global_preferences, primary_account_id, created_at, updated_at)
        VALUES (@id, @email, @password_hash, @name, @avatar_url, @global_preferences, @primary_account_id, datetime('now'), datetime('now'))
        ON CONFLICT(email) DO UPDATE SET
            name = excluded.name,
            password_hash = excluded.password_hash,
            updated_at = datetime('now')
    `);

    let userCount = 0;
    if (state.users && state.users.length > 0) {
        db.transaction(() => {
            for (const user of state.users) {
                try {
                    // Hash password synchronously for seeding
                    const passwordHash = user.password ? bcrypt.hashSync(user.password, 12) : null;

                    insertUser.run({
                        id: user.id,
                        email: user.email,
                        password_hash: passwordHash,
                        name: user.name || user.email.split('@')[0],
                        avatar_url: user.avatar_url || null,
                        global_preferences: JSON.stringify(user.global_preferences || {}),
                        primary_account_id: user.primary_account_id || null
                    });
                    userCount++;
                } catch (err: any) {
                    console.error(`   ❌ Error inserting user ${user.email}: ${err.message}`);
                }
            }
        })();
        console.log(`✅ Inserted/Updated ${userCount} users.`);
    }

    // 3. Insert Domains
    // Using createDomain logic or direct SQL? Direct SQL for seeding scripts often safer/simpler if we want to bypass checks.
    // But domains table schema: account_id, hostname, type, is_primary, entity_types, config, created_at, updated_at
    const insertDomain = db.prepare(`
        INSERT INTO domains (account_id, hostname, type, is_primary, entity_types, config, created_at, updated_at)
        VALUES (@account_id, @hostname, @type, @is_primary, @entity_types, @config, datetime('now'), datetime('now'))
        ON CONFLICT(hostname) DO UPDATE SET config = excluded.config, updated_at = datetime('now')
    `);

    let domCount = 0;
    db.transaction(() => {
        for (const domain of state.domains) {
            try {
                insertDomain.run({
                    account_id: domain.account_id,
                    hostname: domain.hostname,
                    type: domain.type,
                    is_primary: domain.is_primary ? 1 : 0,
                    entity_types: JSON.stringify(domain.entity_types || []),
                    config: JSON.stringify(domain.config || {})
                });
                domCount++;
            } catch (err: any) {
                console.error(`   ❌ Error inserting domain ${domain.hostname}: ${err.message}`);
            }
        }
    })();
    console.log(`✅ Inserted/Updated ${domCount} domains.`);

    // 4. Templates
    seedTemplates();

    // 5. Taxonomy (Dimensions & Dependencies for cascading pick-lists)
    seedTaxonomy();

    // 6. AI Agent Integration (fields, approval rules)
    seedAI();

    // 7. Pipeline Stages & Qualifiers (Activity Generation system)
    seedPipelineConfig();

    // 8. Field Library (extract unique fields from object_defs)
    seedFieldLibrary();

    // 9. Webbuilder Presets (visual templates for page sections)
    seedPresets();

    console.log('✅ System Online.');
}

// --- CLI ENTRY POINT ---
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        initDb();
        seedFromData();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
