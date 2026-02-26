import { db } from '../../core/db.js';
import { DataRecord, DataRecordInput, EntityData, EntityType, RecordRelationship, RecordRelationshipInput } from '../../core/types.js';
import { calculateHash } from '../../core/idempotency.js';
import { hooks } from '../../core/hooks.js';
import { events } from '../../core/events.js';
import { randomUUID } from 'crypto';

// --- Records ---

function enrichHookContext(context: any, extras: Record<string, any>): any {
  if (context && typeof context === 'object') {
    const ctx = context as any;
    if (!ctx.userId && ctx.user?.id) {
      ctx.userId = ctx.user.id;
    }
    for (const [key, value] of Object.entries(extras)) {
      if (ctx[key] === undefined) {
        ctx[key] = value;
      }
    }
    return ctx;
  }

  return { ...extras };
}

export async function createRecord(input: DataRecordInput, context?: any): Promise<DataRecord> {
  const id = input.id || randomUUID();
  const now = new Date().toISOString();

  // Create initial record object (before hook mutation)
  // cast to any or Partial<DataRecord> to allow internal props
  const initialRecord: any = {
    ...input,
    id,
    created_at: now,
    updated_at: now,
    data: input.data || { fieldGroups: [] }
  };

  const hookContext = enrichHookContext(context, { account_id: initialRecord.account_id });

  // Pre-Create Hook
  await hooks.emitPreCreate(input.type, initialRecord, hookContext);

  // Re-construct record with potentially modified data from hooks
  const record: DataRecord = {
    id: initialRecord.id!,
    account_id: initialRecord.account_id,
    type: initialRecord.type,
    slug: initialRecord.slug,
    name: initialRecord.name,
    summary: initialRecord.summary || '',
    description: initialRecord.description || '',
    data: initialRecord.data!, // Hooks ensured data is present
    created_at: initialRecord.created_at || now, // Use hook-modified time or fallback
    updated_at: initialRecord.updated_at || now,
    content_hash: calculateHash(initialRecord.data!)
  };

  const stmt = db.prepare(`
    INSERT INTO records (
      id, account_id, type, slug, name, summary, description, data, created_at, updated_at, content_hash
    ) VALUES (
      @id, @account_id, @type, @slug, @name, @summary, @description, @data, @created_at, @updated_at, @content_hash
    )
  `);

  stmt.run({
    ...record,
    data: JSON.stringify(record.data)
  });

  // Post-Create Hook
  await hooks.emitPostCreate(record.type, record, hookContext);

  // Emit event for build pipeline
  events.emit('record.created', record.id);

  return record;
}

export function getRecord(id: string): DataRecord | undefined {
  const stmt = db.prepare('SELECT * FROM records WHERE id = ?');
  const result = stmt.get(id) as any;
  
  if (!result) return undefined;

  return {
    ...result,
    data: JSON.parse(result.data)
  };
}

export function getRecordBySlug(accountId: string, slug: string): DataRecord | undefined {
  const stmt = db.prepare('SELECT * FROM records WHERE account_id = ? AND slug = ?');
  const result = stmt.get(accountId, slug) as any;

  if (!result) return undefined;

  return {
    ...result,
    data: JSON.parse(result.data)
  };
}

export async function updateRecord(id: string, input: Partial<DataRecordInput>, context?: any): Promise<DataRecord | undefined> {
  const current = getRecord(id);
  if (!current) return undefined;

  // Pre-Update Hook
  // We reconstruct the full input for the hook context, merging current state with updates
  const fullInput: DataRecordInput = {
      ...current,
      ...input,
      type: current.type, // Ensure type is present for hook routing
      account_id: current.account_id 
  };

  const hookContext = enrichHookContext(context, {
    account_id: current.account_id,
    previousRecord: current,
  });
  
  await hooks.emitPreUpdate(current.type, fullInput, hookContext);

  const updated: DataRecord = {
    ...fullInput, // Use the state potentially modified by hooks
    id: current.id, // Ensure ID is string (DataRecord requirement)
    created_at: current.created_at, // Preserve creation time
    updated_at: new Date().toISOString(),
    data: fullInput.data || current.data, // Ensure we use the hook-modified data
    content_hash: fullInput.data ? calculateHash(fullInput.data) : current.content_hash
  };

  
  const stmt = db.prepare(`
    UPDATE records 
    SET 
      type = @type,
      slug = @slug,
      name = @name,
      summary = @summary,
      description = @description,
      data = @data,
      updated_at = @updated_at,
      content_hash = @content_hash
    WHERE id = @id
  `);

  stmt.run({
    ...updated,
    data: JSON.stringify(updated.data)
  });

  // Post-Update Hook
  await hooks.emitPostUpdate(updated.type, updated, hookContext);

  // Emit event for build pipeline
  events.emit('record.updated', updated.id);

  return updated;
}

export async function deleteRecord(id: string, context?: any): Promise<boolean> {
  const current = getRecord(id);
  const hookContext = current
    ? enrichHookContext(context, { account_id: current.account_id, previousRecord: current })
    : context;

  // Emit Pre-Delete Hook
  if (current) {
      await hooks.emitPreDelete(current.type, current, hookContext);
  }

  const stmt = db.prepare('DELETE FROM records WHERE id = ?');
  const result = stmt.run(id);
  
  const success = result.changes > 0;

  // Emit Post-Delete Hook
  if (success && current) {
      await hooks.emitPostDelete(current.type, current, hookContext);
      // Emit event for build pipeline
      events.emit('record.deleted', current.id);
  }

  return success;
}

export function listRecords(accountId: string, type?: EntityType): DataRecord[] {
  let query = 'SELECT * FROM records WHERE account_id = ?';
  const args: any[] = [accountId];

  if (type) {
    query += ' AND type = ?';
    args.push(type);
  }

  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query);
  return stmt.all(...args).map((row: any) => ({
    ...row,
    data: JSON.parse(row.data)
  }));
}

// --- Relationships ---


export async function createRelationship(input: RecordRelationshipInput): Promise<RecordRelationship> {
  const id = input.id || randomUUID();
  const now = new Date().toISOString();
  
  const relationship: RecordRelationship = {
    id,
    from_record_id: input.from_record_id,
    to_record_id: input.to_record_id,
    relationship_type: input.relationship_type,
    data: input.data || {},
    created_at: now
  };

  const stmt = db.prepare(`
    INSERT INTO record_relationships (id, from_record_id, to_record_id, relationship_type, data, created_at)
    VALUES (@id, @from_record_id, @to_record_id, @relationship_type, @data, @created_at)
  `);

  stmt.run({
    ...relationship,
    data: JSON.stringify(relationship.data)
  });

  // --- Oblio Model Sync: Dual-Write to Record Data ---
  try {
      const sourceRecord = getRecord(input.from_record_id);
      if (sourceRecord) {
          const currentData = sourceRecord.data || { fieldGroups: [] };
          const links = (currentData.links as Record<string, string[]>) || {};
          
          // Ensure array exists for this relationship type
          if (!links[input.relationship_type]) {
              links[input.relationship_type] = [];
          }
          
          // Add target ID if not present
          if (!links[input.relationship_type].includes(input.to_record_id)) {
              links[input.relationship_type].push(input.to_record_id);
              
              // Update Record
              await updateRecord(input.from_record_id, {
                  data: { ...currentData, links }
              });
          }
      }
  } catch (e) {
      console.error('[Records] Failed to sync relationship to record data:', e);
      // We don't fail the operation, as the SQL relationship was created.
  }

  return relationship;
}

export function getRelationshipsFrom(fromId: string, type?: string): RecordRelationship[] {
  let query = 'SELECT * FROM record_relationships WHERE from_record_id = ?';
  if (type) {
    query += ' AND relationship_type = ?';
  }
  
  const stmt = db.prepare(query);
  const args = type ? [fromId, type] : [fromId];
  
  return stmt.all(...args).map((row: any) => ({
    ...row,
    data: JSON.parse(row.data)
  }));
}

export function getRelationshipsTo(toId: string, type?: string): RecordRelationship[] {
  let query = 'SELECT * FROM record_relationships WHERE to_record_id = ?';
  if (type) {
    query += ' AND relationship_type = ?';
  }
  
  const stmt = db.prepare(query);
  const args = type ? [toId, type] : [toId];
  
  return stmt.all(...args).map((row: any) => ({
    ...row,
    data: JSON.parse(row.data)
  }));
}

export function getRelationship(id: string): RecordRelationship | undefined {
  const stmt = db.prepare('SELECT * FROM record_relationships WHERE id = ?');
  const result = stmt.get(id) as any;
  if (!result) return undefined;
  
  return {
    ...result,
    data: JSON.parse(result.data)
  };
}

export function listAllRelationships(type?: string): RecordRelationship[] {
  let query = 'SELECT * FROM record_relationships';
  const args: string[] = [];
  if (type) {
    query += ' WHERE relationship_type = ?';
    args.push(type);
  }
  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query);
  return stmt.all(...args).map((row: any) => ({
    ...row,
    data: JSON.parse(row.data)
  }));
}

export async function deleteRelationship(id: string): Promise<boolean> {
  // 1. Get relationship to find IDs
  const rel = getRelationship(id);
  if (!rel) return false;

  const stmt = db.prepare('DELETE FROM record_relationships WHERE id = ?');
  const result = stmt.run(id);

  if (result.changes > 0) {
      // --- Oblio Model Sync: Remove from Record Data ---
      try {
          const sourceRecord = getRecord(rel.from_record_id);
          if (sourceRecord) {
              const currentData = sourceRecord.data || { fieldGroups: [] };
              const links = (currentData.links as Record<string, string[]>) || {};
              
              if (links[rel.relationship_type]) {
                  // Filter out the target ID
                  links[rel.relationship_type] = links[rel.relationship_type].filter(tid => tid !== rel.to_record_id);
                  
                  // Update Record
                  await updateRecord(rel.from_record_id, {
                      data: { ...currentData, links }
                  });
              }
          }
      } catch (e) {
          console.error('[Records] Failed to sync relationship deletion to record data:', e);
      }
      return true;
  }
  return false;
}
