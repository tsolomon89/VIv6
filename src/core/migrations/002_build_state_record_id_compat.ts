/**
 * Migration: 002_build_state_record_id_compat
 *
 * Ensures legacy databases that still use build_state.entity_id are upgraded
 * to the canonical build_state.record_id schema.
 */

import { db } from '../db.js';

export const name = '002_build_state_record_id_compat';

export function up(): void {
  const columns = db
    .prepare(`PRAGMA table_info('build_state')`)
    .all() as Array<{ name: string }>;

  if (columns.length === 0) {
    return;
  }

  const columnNames = new Set(columns.map((column) => column.name));
  if (columnNames.has('record_id')) {
    return;
  }

  if (!columnNames.has('entity_id')) {
    throw new Error(
      'build_state exists but has neither record_id nor entity_id; manual migration required'
    );
  }

  db.exec(`
    CREATE TABLE build_state_new (
      record_id TEXT PRIMARY KEY,
      content_hash TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      last_built_at TEXT,
      error TEXT,
      FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    INSERT INTO build_state_new (record_id, content_hash, status, last_built_at, error)
    SELECT
      entity_id,
      COALESCE(content_hash, ''),
      COALESCE(status, 'pending'),
      last_built_at,
      error
    FROM build_state
  `);

  db.exec('DROP TABLE build_state');
  db.exec('ALTER TABLE build_state_new RENAME TO build_state');
}
