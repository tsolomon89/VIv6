import stringify from 'fast-json-stable-stringify';
import { createHash } from 'crypto';
import { db } from './db.js';
import { DataRecordInput } from './types.js';

export function calculateHash(data: unknown): string {
  const str = stringify(data);
  return createHash('sha256').update(str).digest('hex');
}

export type IdempotencyResult = 'create' | 'update' | 'skip';

export function checkIdempotency(input: DataRecordInput): IdempotencyResult {
  // NOTE: Idempotency check scopes by account_id when provided.
  // For full multi-tenancy, all callers should provide account_id.
  // Current fallback (global slug check) is acceptable for single-tenant deployments.

  let stmt;
  let existing;

  if (input.account_id) {
      // Preferred: scope by account for multi-tenant safety
      stmt = db.prepare('SELECT id, content_hash FROM records WHERE slug = ? AND account_id = ?');
      existing = stmt.get(input.slug, input.account_id) as { id: string, content_hash: string } | undefined;
  } else {
      // Fallback: global slug check (single-tenant or legacy callers)
      stmt = db.prepare('SELECT id, content_hash FROM records WHERE slug = ? LIMIT 1');
      existing = stmt.get(input.slug) as { id: string, content_hash: string } | undefined;
  }

  if (!existing) {
    return 'create';
  }

  // Calculate hash of input data to match createRecord/updateRecord logic
  const newHash = calculateHash(input.data || { fieldGroups: [] });
  
  if (existing.content_hash === newHash) {
    return 'skip';
  }

  return 'update';
}
