/**
 * Relationships API Route Tests
 *
 * Tests for /api/relationships endpoints:
 * - GET /api/relationships - List relationships
 * - POST /api/relationships - Create relationship
 * - DELETE /api/relationships/:id - Delete relationship
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    seedTestRecord,
    seedTestRelationship,
    db,
} from './setup.js';

describe('Relationships API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('GET /api/relationships', () => {
        it('returns empty array when no relationships exist', async () => {
            const client = getClient();
            const response = await client.get('/relationships');

            expect(response.status).toBe(200);
            expect(response.data).toEqual([]);
        });

        it('returns all relationships', async () => {
            const product1 = seedTestRecord({ type: 'product', name: 'Product 1', slug: 'product-1' });
            const feature1 = seedTestRecord({ type: 'feature', name: 'Feature 1', slug: 'feature-1' });
            const feature2 = seedTestRecord({ type: 'feature', name: 'Feature 2', slug: 'feature-2' });

            seedTestRelationship({
                from_record_id: product1,
                to_record_id: feature1,
                relationship_type: 'has_feature'
            });
            seedTestRelationship({
                from_record_id: product1,
                to_record_id: feature2,
                relationship_type: 'has_feature'
            });

            const client = getClient();
            const response = await client.get('/relationships');

            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(2);
        });

        it('filters by from_id', async () => {
            const product1 = seedTestRecord({ type: 'product', name: 'Product 1', slug: 'product-1' });
            const product2 = seedTestRecord({ type: 'product', name: 'Product 2', slug: 'product-2' });
            const feature1 = seedTestRecord({ type: 'feature', name: 'Feature 1', slug: 'feature-1' });

            seedTestRelationship({
                from_record_id: product1,
                to_record_id: feature1,
                relationship_type: 'has_feature'
            });
            seedTestRelationship({
                from_record_id: product2,
                to_record_id: feature1,
                relationship_type: 'has_feature'
            });

            const client = getClient();
            const response = await client.get('/relationships', {
                params: { from_id: product1 }
            });

            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(1);
            // API returns from_id (not from_record_id)
            expect(response.data[0].from_id).toBe(product1);
        });

        it('filters by to_id', async () => {
            const product1 = seedTestRecord({ type: 'product', name: 'Product 1', slug: 'product-1' });
            const feature1 = seedTestRecord({ type: 'feature', name: 'Feature 1', slug: 'feature-1' });
            const feature2 = seedTestRecord({ type: 'feature', name: 'Feature 2', slug: 'feature-2' });

            seedTestRelationship({
                from_record_id: product1,
                to_record_id: feature1,
                relationship_type: 'has_feature'
            });
            seedTestRelationship({
                from_record_id: product1,
                to_record_id: feature2,
                relationship_type: 'has_feature'
            });

            const client = getClient();
            const response = await client.get('/relationships', {
                params: { to_id: feature1 }
            });

            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(1);
            // API returns to_id (not to_record_id)
            expect(response.data[0].to_id).toBe(feature1);
        });

        it('filters by type', async () => {
            const product1 = seedTestRecord({ type: 'product', name: 'Product 1', slug: 'product-1' });
            const feature1 = seedTestRecord({ type: 'feature', name: 'Feature 1', slug: 'feature-1' });
            const solution1 = seedTestRecord({ type: 'solution', name: 'Solution 1', slug: 'solution-1' });

            seedTestRelationship({
                from_record_id: product1,
                to_record_id: feature1,
                relationship_type: 'has_feature'
            });
            seedTestRelationship({
                from_record_id: product1,
                to_record_id: solution1,
                relationship_type: 'solves'
            });

            const client = getClient();
            const response = await client.get('/relationships', {
                params: { type: 'has_feature' }
            });

            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(1);
            // API returns type (not relationship_type)
            expect(response.data[0].type).toBe('has_feature');
        });
    });

    describe('POST /api/relationships', () => {
        it('creates new relationship', async () => {
            const product1 = seedTestRecord({ type: 'product', name: 'Product 1', slug: 'product-1' });
            const feature1 = seedTestRecord({ type: 'feature', name: 'Feature 1', slug: 'feature-1' });

            const client = getClient();
            const response = await client.post('/relationships', {
                from_id: product1,
                to_id: feature1,
                type: 'has_feature',
            });

            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('id');
        });

        it('returns 400 for missing required fields', async () => {
            const product1 = seedTestRecord({ type: 'product', name: 'Product 1', slug: 'product-1' });

            const client = getClient();
            const response = await client.post('/relationships', {
                from_id: product1,
                // Missing to_id and type
            });

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /api/relationships/:id', () => {
        it('deletes existing relationship', async () => {
            const product1 = seedTestRecord({ type: 'product', name: 'Product 1', slug: 'product-1' });
            const feature1 = seedTestRecord({ type: 'feature', name: 'Feature 1', slug: 'feature-1' });

            const relId = seedTestRelationship({
                from_record_id: product1,
                to_record_id: feature1,
                relationship_type: 'has_feature'
            });

            const client = getClient();
            const response = await client.delete(`/relationships/${relId}`);

            expect(response.status).toBe(204);

            // Verify deleted
            const rel = db.prepare('SELECT * FROM record_relationships WHERE id = ?').get(relId);
            expect(rel).toBeUndefined();
        });
    });
});
