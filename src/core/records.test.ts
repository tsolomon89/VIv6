import { describe, it, expect, beforeEach } from 'vitest';
import { createRecord, getRecord, getRecordBySlug, listRecords, updateRecord, deleteRecord } from './records.js';
import { db } from './db.js';
import { Factory } from '../testing/factories.js';

describe('Core: Records', () => {
    // Setup and Teardown
    beforeEach(async () => {
        try {
            db.pragma('foreign_keys = OFF');
            db.prepare('DELETE FROM record_relationships').run();
            // db.prepare('DELETE FROM records').run(); // Only specific records? No, clear all.
            db.prepare('DELETE FROM records').run();
            // db.prepare('DELETE FROM accounts').run();
            db.pragma('foreign_keys = ON');

            // Seed Account for FK constraints
            await createRecord({
                id: 'account-1',
                type: 'account',
                slug: 'account-1-slug',
                name: 'Test Account',
                account_id: 'system',
                data: { account_class: 'business', type: 'client', fieldGroups: [] }
            });

            // Seed another account for filter tests
            await createRecord({
                id: 'account-2',
                type: 'account',
                slug: 'account-2-slug',
                name: 'Test Account 2',
                account_id: 'system',
                data: { account_class: 'business', type: 'client', fieldGroups: [] }
            });

        } catch (e) {
            console.warn('DB Cleanup/Seeding failed:', e);
        }
    });

    it('should create a record', async () => {
        const input = Factory.createProduct({ 
            slug: 'test-product', 
            name: 'Test Product', 
            account_id: 'account-1' 
        });

        const result = await createRecord(input);

        expect(result.id).toBeDefined();
        expect(result.slug).toBe('test-product');
        expect(result.account_id).toBe('account-1');
        expect(result.data).toBeDefined();
    });

    it('should retrieve a record by ID', async () => {
        const input = Factory.createRecordInput({
            type: 'persona',
            slug: 'test-persona',
            name: 'Persona',
            account_id: 'account-1'
        });
        const created = await createRecord(input);

        const retrieved = getRecord(created.id);
        expect(retrieved).toBeDefined();
        expect(retrieved?.id).toBe(created.id);
        expect(retrieved?.name).toBe('Persona');
    });

    it('should retrieve a record by Slug', async () => {
        const input = Factory.createRecordInput({
            type: 'feature',
            slug: 'cool-feature',
            name: 'Cool Feature',
            account_id: 'account-1'
        });
        await createRecord(input);

        const retrieved = getRecordBySlug('account-1', 'cool-feature');
        expect(retrieved).toBeDefined();
        expect(retrieved?.name).toBe('Cool Feature');
    });

    it('should list records with filters', async () => {
        const accountId = 'account-1';
        const otherAccount = 'account-2';
        
        await createRecord(Factory.createProduct({ slug: 'p1', name: 'P1', account_id: accountId }));
        await createRecord(Factory.createProduct({ slug: 'p2', name: 'P2', account_id: otherAccount }));
        await createRecord(Factory.createRecordInput({ type: 'feature', slug: 'f1', name: 'F1', account_id: accountId }));

        // Filter by Account (Required now)
        const accountItems = listRecords(accountId);
        expect(accountItems.length).toBe(2); // P1 + F1

        // Filter by Account AND Type
        const products = listRecords(accountId, 'product');
        expect(products.length).toBe(1);
        expect(products[0].slug).toBe('p1');
    });

    it('should update a record', async () => {
         const created = await createRecord(Factory.createRecordInput({
            type: 'useCase',
            slug: 'uc-1',
            name: 'Original Name',
            account_id: 'account-1'
        }));

        const updated = await updateRecord(created.id, { name: 'New Name' });
        
        expect(updated?.name).toBe('New Name');
        expect(updated).toBeDefined();

        // Verify persistence
        const fetched = getRecord(created.id);
        expect(fetched?.name).toBe('New Name');
    });

    it('should delete a record', async () => {
       const created = await createRecord(Factory.createRecordInput({
           type: 'solution',
           slug: 'sol-1',
           name: 'Solution',
           account_id: 'account-1'
       }));

       const success = await deleteRecord(created.id);
       expect(success).toBe(true);

       const fetched = getRecord(created.id);
       expect(fetched).toBeUndefined();
   });

    it('should create an activity record (Activation Engine)', async () => {
         const input = Factory.createRecordInput({
             type: 'activity',
             slug: 'activity-1',
             name: 'Activity 1',
             account_id: 'account-1',
             // @ts-ignore
             activity_type: 'data', 
             data: { 
                 fieldGroups: [],
                 qualifiers: { budget: true }
             } as any
         });

         const result = await createRecord(input);
         expect(result.id).toBeDefined();
         expect(result.type).toBe('activity');
         expect(result.account_id).toBe('account-1');
    });

    it('should create an opportunity record (Commercial Engine)', async () => {
         const input = Factory.createRecordInput({
             type: 'opportunity',
             slug: 'opp-1',
             name: 'Deal 1',
             account_id: 'account-1',
             opportunity_stage: 'mql'
         } as any);

         const result = await createRecord(input);
         expect(result.id).toBeDefined();
         expect(result.type).toBe('opportunity');
    });
});

