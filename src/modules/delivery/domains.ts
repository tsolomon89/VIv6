
import { db } from '../../core/db.js';
import { randomUUID } from 'crypto';

export type DomainType = 'www' | 'blog' | 'docs' | 'app' | 'custom';
export type DomainStatus = 'active' | 'disabled' | 'pending_verification';

export interface Domain {
  id: string;
  account_id: string;
  hostname: string;
  type: DomainType;
  is_primary: boolean;
  config: Record<string, unknown>;
  entity_types: string[];
  status: DomainStatus;
  created_at: string;
  updated_at: string;
}

export interface DomainInput {
  account_id: string;
  hostname: string;
  type?: DomainType;
  is_primary?: boolean;
  config?: Record<string, unknown>;
  entity_types?: string[];
  status?: DomainStatus;
}

function rowToDomain(row: any): Domain {
  return {
    ...row,
    is_primary: !!row.is_primary,
    config: typeof row.config === 'string' ? JSON.parse(row.config) : (row.config || {}),
    entity_types: typeof row.entity_types === 'string' ? JSON.parse(row.entity_types) : (row.entity_types || []),
  };
}

export function createDomain(input: DomainInput): Domain {
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO domains (id, account_id, hostname, type, is_primary, config, entity_types, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.account_id,
    input.hostname,
    input.type || 'www',
    input.is_primary ? 1 : 0,
    JSON.stringify(input.config || {}),
    JSON.stringify(input.entity_types || []),
    input.status || 'active',
    now,
    now
  );

  return getDomain(id)!;
}

export function getDomain(id: string): Domain | null {
  const row = db.prepare('SELECT * FROM domains WHERE id = ?').get(id) as any;
  return row ? rowToDomain(row) : null;
}

export function getDomainByHostname(hostname: string): Domain | null {
  const row = db.prepare('SELECT * FROM domains WHERE hostname = ?').get(hostname) as any;
  return row ? rowToDomain(row) : null;
}

export function listDomains(accountId?: string): Domain[] {
  if (accountId) {
    return (db.prepare('SELECT * FROM domains WHERE account_id = ? ORDER BY is_primary DESC, hostname').all(accountId) as any[]).map(rowToDomain);
  }
  return (db.prepare('SELECT * FROM domains ORDER BY account_id, is_primary DESC, hostname').all() as any[]).map(rowToDomain);
}

export function getPrimaryDomain(accountId: string): Domain | null {
  const row = db.prepare('SELECT * FROM domains WHERE account_id = ? AND is_primary = 1 LIMIT 1').get(accountId) as any;
  return row ? rowToDomain(row) : null;
}

export function updateDomain(id: string, updates: Partial<DomainInput>): Domain | null {
  const existing = getDomain(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const merged = {
    hostname: updates.hostname ?? existing.hostname,
    type: updates.type ?? existing.type,
    is_primary: updates.is_primary !== undefined ? (updates.is_primary ? 1 : 0) : (existing.is_primary ? 1 : 0),
    config: JSON.stringify(updates.config ?? existing.config),
    entity_types: JSON.stringify(updates.entity_types ?? existing.entity_types),
    status: updates.status ?? existing.status,
  };

  db.prepare(`
    UPDATE domains SET hostname = ?, type = ?, is_primary = ?, config = ?, entity_types = ?, status = ?, updated_at = ?
    WHERE id = ?
  `).run(merged.hostname, merged.type, merged.is_primary, merged.config, merged.entity_types, merged.status, now, id);

  return getDomain(id);
}

export function deleteDomain(id: string): boolean {
  const result = db.prepare('DELETE FROM domains WHERE id = ?').run(id);
  return result.changes > 0;
}
