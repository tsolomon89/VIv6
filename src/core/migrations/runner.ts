/**
 * Migration Runner
 *
 * Manages database schema migrations with version tracking.
 * Migrations are TypeScript files in this directory with names like:
 *   001_base_schema.ts
 *   002_add_feature.ts
 *
 * Each migration exports:
 *   - name: string (migration identifier)
 *   - up(): void (apply the migration)
 */

import { db } from '../db.js';
import { createLogger } from '../logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger('migrations');

export interface MigrationResult {
    applied: string[];
    skipped: string[];
}

export interface MigrationStatus {
    name: string;
    applied_at: string;
}

/**
 * Run all pending migrations
 *
 * - Scans migrations directory for NNN_*.ts files
 * - Skips already-applied migrations (tracked in _migrations table)
 * - Applies each migration in a transaction
 * - Records successful application in _migrations
 */
export async function runMigrations(): Promise<MigrationResult> {
    const result: MigrationResult = { applied: [], skipped: [] };

    // Get already-applied migrations from database
    const applied = db.prepare('SELECT name FROM _migrations').all() as { name: string }[];
    const appliedSet = new Set(applied.map(m => m.name));

    // Get migration files (sorted by name for deterministic order)
    const files = fs.readdirSync(__dirname)
        .filter(f => /^\d{3}_.*\.ts$/.test(f) && f !== 'runner.ts' && f !== 'TEMPLATE.ts')
        .sort();

    for (const file of files) {
        const migrationName = file.replace(/\.ts$/, '');

        if (appliedSet.has(migrationName)) {
            result.skipped.push(migrationName);
            logger.debug({ migration: migrationName }, 'Migration already applied, skipping');
            continue;
        }

        logger.info({ migration: migrationName }, 'Applying migration');

        try {
            // Dynamic import of the migration module
            const migrationPath = path.join(__dirname, file);
            const migration = await import(`file://${migrationPath.replace(/\\/g, '/')}`);

            if (typeof migration.up !== 'function') {
                throw new Error(`Migration ${migrationName} does not export an up() function`);
            }

            // Execute migration in a transaction
            db.transaction(() => {
                // Disable FK checks during migration
                db.pragma('foreign_keys = OFF');

                try {
                    migration.up();

                    // Record successful migration
                    db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migrationName);
                } finally {
                    // Re-enable FK checks
                    db.pragma('foreign_keys = ON');
                }
            })();

            result.applied.push(migrationName);
            logger.info({ migration: migrationName }, 'Migration applied successfully');
        } catch (err) {
            logger.error({ err, migration: migrationName }, 'Migration failed');
            throw err;
        }
    }

    return result;
}

/**
 * Get status of all applied migrations
 */
export function getMigrationStatus(): MigrationStatus[] {
    return db.prepare('SELECT name, applied_at FROM _migrations ORDER BY applied_at').all() as MigrationStatus[];
}

/**
 * Check if a specific migration has been applied
 */
export function isMigrationApplied(name: string): boolean {
    const result = db.prepare('SELECT 1 FROM _migrations WHERE name = ?').get(name);
    return !!result;
}
