/**
 * Pipeline Configuration Seeder
 *
 * Seeds pipeline stage configurations and qualifier definitions.
 * Part of the Activity Generation system.
 */

import fs from 'fs';
import path from 'path';
import { db } from '../core/db.js';
import { getAllQualifierDefinitions } from './parse_qualifiers_csv.js';

const PROJECT_ROOT = path.resolve(import.meta.dirname || __dirname, '../../');
const STAGES_FILE = path.join(PROJECT_ROOT, 'data/seeds/tier_1_schema/pipeline_stages.json');

export function seedPipelineConfig(): void {
    console.log('🔄 Seeding Pipeline Configuration...');

    const insertRecord = db.prepare(`
        INSERT INTO records (id, account_id, type, slug, name, summary, description, data, created_at, updated_at)
        VALUES (@id, @account_id, @type, @slug, @name, @summary, @description, @data, datetime('now'), datetime('now'))
        ON CONFLICT(account_id, slug) DO UPDATE SET
            name = excluded.name,
            summary = excluded.summary,
            data = excluded.data,
            updated_at = datetime('now')
    `);

    // 1. Seed Pipeline Stages
    if (fs.existsSync(STAGES_FILE)) {
        const stages = JSON.parse(fs.readFileSync(STAGES_FILE, 'utf-8'));

        db.transaction(() => {
            for (const stage of stages) {
                try {
                    insertRecord.run({
                        id: stage.id,
                        account_id: stage.account_id || '00000000-0000-0000-0000-000000000000',
                        type: stage.type || 'pipeline_stage',
                        slug: stage.slug,
                        name: stage.name,
                        summary: stage.summary || '',
                        description: stage.description || '',
                        data: JSON.stringify(stage.data || {})
                    });
                } catch (err) {
                    console.warn(`  Failed to seed stage ${stage.slug}:`, err instanceof Error ? err.message : String(err));
                }
            }
        })();

        console.log(`✅ Seeded ${stages.length} pipeline stages.`);
    } else {
        console.warn(`⚠️  Pipeline stages file not found: ${STAGES_FILE}`);
    }

    // 2. Seed Qualifier Definitions from CSV
    try {
        const qualifiers = getAllQualifierDefinitions();

        if (qualifiers.length > 0) {
            db.transaction(() => {
                for (const qual of qualifiers) {
                    try {
                        insertRecord.run({
                            id: qual.id,
                            account_id: qual.account_id || '00000000-0000-0000-0000-000000000000',
                            type: qual.type || 'qualifier_def',
                            slug: qual.slug,
                            name: qual.name,
                            summary: qual.summary || '',
                            description: '',
                            data: JSON.stringify(qual.data || {})
                        });
                    } catch (err) {
                        console.warn(`  Failed to seed qualifier ${qual.slug}:`, err instanceof Error ? err.message : String(err));
                    }
                }
            })();

            console.log(`✅ Seeded ${qualifiers.length} qualifier definitions from CSV.`);
        } else {
            console.log('ℹ️  No qualifiers found in CSV files.');
        }
    } catch (err) {
        console.warn('⚠️  Failed to parse qualifier CSVs:', err instanceof Error ? err.message : String(err));
    }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Running pipeline config seeder...');
    seedPipelineConfig();
    console.log('Done.');
}
