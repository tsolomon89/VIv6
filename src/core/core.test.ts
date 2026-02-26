import { describe, it, expect, beforeEach } from 'vitest';
import { db, initDb } from './db.js';
import { createRecord, getRecordBySlug, createRelationship, getRelationshipsFrom } from './records.js';
import { checkIdempotency as checkIdempotencyFunc } from './idempotency.js';

const DEFAULT_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

describe('Core Data Layer', () => {
    beforeEach(() => {
        // Ensure account exists for tests
        try {
            db.prepare('INSERT OR IGNORE INTO accounts (id, slug, name, account_class, type) VALUES (?, ?, ?, ?, ?)').run(DEFAULT_ACCOUNT_ID, 'core-test', 'Core Test', 'business', 'client');
        } catch (e) {
            // INSERT OR IGNORE should not throw, but log if it does
            console.warn('[Test Setup] Account insert error:', e instanceof Error ? e.message : String(e));
        }
    });

    it('should create an entity and retrieve it', async () => {
        const slug = 'test-unit-' + Date.now();
        const entity = await createRecord({
            type: 'brand',
            slug,
            name: 'Unit Test Brand',
            data: { fieldGroups: [], test: true } as any,
            account_id: DEFAULT_ACCOUNT_ID
        });
        
        expect(entity.id).toBeDefined();
        expect(entity.slug).toBe(slug);
        
        const retrieved = getRecordBySlug(DEFAULT_ACCOUNT_ID, slug);
        expect(retrieved).toBeDefined();
        expect(retrieved?.id).toBe(entity.id);
        expect(retrieved?.data).toEqual({ fieldGroups: [], test: true });
    });

    it('should calculate content hash and detect idempotency', async () => {
         const slug = 'test-idem-' + Date.now();
         const input = {
             type: 'product' as const,
             slug,
             name: 'Idempotency Product',
             data: { fieldGroups: [], v: 1 } as any,
             account_id: DEFAULT_ACCOUNT_ID
         };
         
         // First time
         expect(checkIdempotencyFunc(input)).toBe('create');
         await createRecord(input);
         
         // Same content
         // Note: checkIdempotency re-calculates hash from input. 
         // createRecord updates content_hash in DB.
         // Pass input again.
         expect(checkIdempotencyFunc(input)).toBe('skip');
         
         // Changed content
         // createRecord adds fieldGroups if missing, so we must include it in the input we check against?
         // Actually, checkIdempotency calculates hash from INPUT.
         // If we pass explicit fieldGroups, hash changes.
         // Standardize input for tests.
         const changedInput = { ...input, data: { fieldGroups: [], v: 2 } as any };
         expect(checkIdempotencyFunc(changedInput)).toBe('update');
    });

    it('should link entities via relationships', async () => {
        const fromSlug = 'from-' + Date.now();
        const toSlug = 'to-' + Date.now();
        
        const from = await createRecord({ type: 'brand', slug: fromSlug, name: 'From', account_id: DEFAULT_ACCOUNT_ID });
        const to = await createRecord({ type: 'product', slug: toSlug, name: 'To', account_id: DEFAULT_ACCOUNT_ID });
        
        const rel = await createRelationship({
            from_record_id: from.id,
            to_record_id: to.id,
            relationship_type: 'offers'
        });
        
        expect(rel.id).toBeDefined();
        
        const rels = getRelationshipsFrom(from.id);
        expect(rels).toHaveLength(1);
        expect(rels[0].to_record_id).toBe(to.id);
        expect(rels[0].relationship_type).toBe('offers');
    });
});
