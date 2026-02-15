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
  // Use account_id scope? For now, just check slug globally or assume account context is missing in this helper?
  // The original code query ignored account_id/brand_id.
  // We'll keep it simple: find by slug. 
  // BUT slugs are unique per account now. 
  // If input has account_id, use it.
  
  let stmt;
  let existing;

  if (input.account_id) {
      stmt = db.prepare('SELECT id, content_hash FROM records WHERE slug = ? AND account_id = ?');
      existing = stmt.get(input.slug, input.account_id) as { id: string, content_hash: string } | undefined;
  } else {
      // Fallback: just check slug (might result in collision if multiple accounts use same slug)
      // This helper might need refactoring for multi-tenancy.
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
