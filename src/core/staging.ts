import { DataRecord, DataRecordInput, RecordRelationship, RecordRelationshipInput, EntityData } from './types.js';
import { calculateHash } from './idempotency.js';
import { randomUUID } from 'crypto';

/**
 * Creates an in-memory DataRecord object (Staged) without persisting it.
 * Useful for previewing seed data or dry-runs.
 */
export function makeEntity(input: DataRecordInput, fixedId?: string): DataRecord {
  const id = fixedId || randomUUID();
  const now = new Date().toISOString();

  // Default data structure
  const data: EntityData = input.data || { fieldGroups: [] };

  // Calculate content hash for change detection
  const content_hash = calculateHash({ ...input, data });

  return {
    id,
    type: input.type,
    slug: input.slug,
    name: input.name,
    description: input.description,
    data,
    created_at: now,
    updated_at: now,
    content_hash,
    account_id: input.account_id
  };
}

/**
 * Creates an in-memory RecordRelationship object (Staged).
 * Note: Does not validate that from_id/to_id exist in DB, as this is for staging.
 */
export function makeRelationship(input: RecordRelationshipInput, fixedId?: string): RecordRelationship {
  const id = fixedId || randomUUID();
  const now = new Date().toISOString();

  // We can't easily resolve from_type/to_type here without context,
  // so we might need to rely on the caller or optional inputs if we want full fidelity.
  // For the Seed script, we usually have the objects.
  // But strictly, RecordRelationshipInput doesn't have the types.
  // We'll augment RecordRelationshipInput or just be loose here for staging.

  // For now, let's assume the input *might* have them if we cast, or we leave them empty/placeholder
  // if this is just for diffing the *edge* (from/to/type).

  // Actually, for the Diff view, we primarily care about (from_id, to_id, type).
  // But wait, seed script creates relationships using object references:
  // createRelationship({ from_record_id: victory.id ... })
  // If `victory` is a staged record, it has an ID.

  return {
    id,
    from_record_id: input.from_record_id,
    to_record_id: input.to_record_id,
    relationship_type: input.relationship_type,
    data: input.data || {},
    created_at: now
  };
}
