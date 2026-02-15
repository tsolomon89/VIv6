import { db } from './db.js';

export interface BrandConfig {
  key: string;
  data: any;
}

export function getBrandConfig(key: string = 'default'): any | undefined {
  const stmt = db.prepare('SELECT data FROM brand_config WHERE key = ?');
  const result = stmt.get(key) as { data: string };
  if (!result) return undefined;
  return JSON.parse(result.data);
}

export function updateBrandConfig(data: any, key: string = 'default'): void {
  const stmt = db.prepare(`
    INSERT INTO brand_config (id, key, data) VALUES ((SELECT id FROM brand_config WHERE key = @key), @key, @data)
    ON CONFLICT(key) DO UPDATE SET data = excluded.data
  `);
  
  // Note: randomUUID if missing handled by trigger or we need to query ID first if completely new.
  // Actually simpler: if ID exists reuse, else random.
  // Since seed guarantees default exists, simpler update:
  
  const updateStmt = db.prepare('UPDATE brand_config SET data = ? WHERE key = ?');
  const info = updateStmt.run(JSON.stringify(data), key);
  
  if (info.changes === 0) {
    // Insert if missing (Unlikely given seed)
    const { randomUUID } = require('crypto');
    const insert = db.prepare('INSERT INTO brand_config (id, key, data) VALUES (?, ?, ?)');
    insert.run(randomUUID(), key, JSON.stringify(data));
  }
}
