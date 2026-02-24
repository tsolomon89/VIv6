/**
 * Migration: 001_base_schema
 *
 * This migration marks the current schema as the baseline.
 * All tables already exist via schema.sql initialization.
 * This records that we're starting from a known state.
 */

import { db } from '../db.js';

export const name = '001_base_schema';

export function up(): void {
    // Verify core tables exist (they should from schema.sql)
    const tables = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name IN ('records', 'users', 'accounts', '_migrations')
    `).all() as { name: string }[];

    const tableNames = new Set(tables.map(t => t.name));

    const requiredTables = ['records', 'users', 'accounts', '_migrations'];
    const missing = requiredTables.filter(t => !tableNames.has(t));

    if (missing.length > 0) {
        throw new Error(
            `Base schema not initialized. Missing tables: ${missing.join(', ')}. ` +
            'Run initDb() first to create the base schema.'
        );
    }

    // Base schema verified - migration is essentially a marker
}
