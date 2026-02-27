import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db.js';
import { up } from './002_build_state_record_id_compat.js';

describe('Migration: 002_build_state_record_id_compat', () => {
  beforeEach(() => {
    db.pragma('foreign_keys = OFF');
    db.exec('DROP TABLE IF EXISTS build_state');
    db.exec('DROP TABLE IF EXISTS records');
    db.exec(`
      CREATE TABLE records (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        type TEXT NOT NULL,
        slug TEXT NOT NULL,
        name TEXT NOT NULL,
        data JSON DEFAULT '{}',
        created_at TEXT,
        updated_at TEXT
      )
    `);
    db.exec(`
      CREATE TABLE build_state (
        entity_id TEXT PRIMARY KEY,
        content_hash TEXT,
        status TEXT DEFAULT 'pending',
        last_built_at TEXT,
        error TEXT
      )
    `);
    db.prepare(`
      INSERT INTO records (id, account_id, type, slug, name, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'rec-1',
      'acct-1',
      'product',
      'record-1',
      'Record 1',
      '{}',
      new Date().toISOString(),
      new Date().toISOString()
    );
    db.prepare(`
      INSERT INTO build_state (entity_id, content_hash, status, last_built_at, error)
      VALUES (?, ?, ?, ?, ?)
    `).run('rec-1', 'hash-1', 'success', new Date().toISOString(), null);
    db.pragma('foreign_keys = ON');
  });

  it('renames legacy entity_id column shape to canonical record_id', () => {
    up();

    const columns = db
      .prepare(`PRAGMA table_info('build_state')`)
      .all() as Array<{ name: string }>;
    const names = new Set(columns.map((column) => column.name));

    expect(names.has('record_id')).toBe(true);
    expect(names.has('entity_id')).toBe(false);

    const row = db
      .prepare('SELECT record_id, content_hash, status FROM build_state WHERE record_id = ?')
      .get('rec-1') as { record_id: string; content_hash: string; status: string } | undefined;

    expect(row).toBeDefined();
    expect(row?.record_id).toBe('rec-1');
    expect(row?.content_hash).toBe('hash-1');
    expect(row?.status).toBe('success');
  });
});
