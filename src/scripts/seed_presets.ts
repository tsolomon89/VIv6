/**
 * Seed Presentation Presets
 *
 * Seeds webbuilder presentation presets from JSON file.
 * Presets define reusable visual templates for page sections.
 */

import { db } from '../core/db.js';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PresetSeedData {
    key: string;
    name: string;
    signature: object;
    config: object;
}

export function seedPresets(): void {
    console.log('📐 Seeding presentation presets...');

    // Load presets from JSON
    const presetsPath = join(__dirname, '../../data/seeds/tier_2_webbuilder/presets.json');
    let presets: PresetSeedData[];

    try {
        const data = readFileSync(presetsPath, 'utf-8');
        presets = JSON.parse(data);
    } catch (err) {
        console.warn(`   ⚠️  No presets file found at ${presetsPath}. Skipping preset seeding.`);
        return;
    }

    // Upsert presets
    const upsertStmt = db.prepare(`
        INSERT INTO presentation_presets (id, key, name, signature, config, version, account_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, NULL, datetime('now'), datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
            name = excluded.name,
            signature = excluded.signature,
            config = excluded.config,
            version = version + 1,
            updated_at = datetime('now')
    `);

    let count = 0;
    db.transaction(() => {
        for (const preset of presets) {
            try {
                // Generate ID from key for consistent IDs
                const id = `preset-${preset.key.replace(/\./g, '-')}`;

                upsertStmt.run(
                    id,
                    preset.key,
                    preset.name,
                    JSON.stringify(preset.signature),
                    JSON.stringify(preset.config)
                );
                count++;
            } catch (err: any) {
                console.error(`   ❌ Error inserting preset ${preset.key}: ${err.message}`);
            }
        }
    })();

    console.log(`   ✅ Seeded ${count} presentation presets.`);
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        seedPresets();
        console.log('Done.');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
