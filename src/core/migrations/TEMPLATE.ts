/**
 * Migration: XXX_description
 *
 * To create a new migration:
 * 1. Copy this file to NNN_your_description.ts (NNN = next number)
 * 2. Implement the up() function
 * 3. Run: npm run migrate
 *
 * Guidelines:
 * - Migrations run in a transaction with FKs disabled
 * - Use db.exec() for DDL (ALTER TABLE, CREATE INDEX, etc.)
 * - Use db.prepare().run() for DML (INSERT, UPDATE, DELETE)
 * - Migrations are one-way (no automatic rollback)
 * - Name files with leading zeros: 001, 002, 003...
 */

import { db } from '../db.js';

export const name = 'XXX_description';

export function up(): void {
    // ─────────────────────────────────────────────────────────────────
    // Example: Add a new column
    // ─────────────────────────────────────────────────────────────────
    // db.exec('ALTER TABLE records ADD COLUMN new_field TEXT');

    // ─────────────────────────────────────────────────────────────────
    // Example: Create a new table
    // ─────────────────────────────────────────────────────────────────
    // db.exec(`
    //     CREATE TABLE IF NOT EXISTS new_table (
    //         id TEXT PRIMARY KEY,
    //         name TEXT NOT NULL,
    //         created_at TEXT DEFAULT CURRENT_TIMESTAMP
    //     )
    // `);

    // ─────────────────────────────────────────────────────────────────
    // Example: Create an index
    // ─────────────────────────────────────────────────────────────────
    // db.exec('CREATE INDEX IF NOT EXISTS idx_records_type ON records(type)');

    // ─────────────────────────────────────────────────────────────────
    // Example: Migrate data
    // ─────────────────────────────────────────────────────────────────
    // db.prepare('UPDATE records SET new_field = ? WHERE type = ?').run('value', 'some_type');

    // ─────────────────────────────────────────────────────────────────
    // Example: Conditional migration (if feature already exists)
    // ─────────────────────────────────────────────────────────────────
    // const exists = db.prepare(`
    //     SELECT 1 FROM sqlite_master WHERE type='table' AND name='new_table'
    // `).get();
    //
    // if (exists) {
    //     // Already applied manually or from a previous version
    //     return;
    // }

    throw new Error('TEMPLATE migration - copy and implement before running');
}

// Optional: down() for manual rollback (not automatically called)
export function down(): void {
    // Reverse the migration manually if needed
    // db.exec('DROP TABLE IF EXISTS new_table');
    // db.exec('ALTER TABLE records DROP COLUMN new_field');  // Not supported in SQLite!
}
