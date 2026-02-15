/**
 * Records API Route Tests
 *
 * Tests for /api/records endpoints:
 * - GET /api/records - List records
 * - GET /api/records/:id - Get single record
 * - POST /api/records - Create record
 * - PUT /api/records/:id - Update record
 * - DELETE /api/records/:id - Delete record
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    seedTestRecord,
    db,
} from './setup.js';

describe('Records API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('GET /api/records', () => {
        it('returns empty array when no records exist', async () => {
            const client = getClient();
            const response = await client.get('/records');

            expect(response.status).toBe(200);
            expect(response.data).toEqual([]);
        });

        it('returns all records', async () => {
            seedTestRecord({
                type: 'product',
                name: 'Product 1',
                slug: 'product-1',
            });
            seedTestRecord({
                type: 'product',
                name: 'Product 2',
                slug: 'product-2',
            });

            const client = getClient();
            const response = await client.get('/records');

            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(2);
        });

        it('filters records by type', async () => {
            seedTestRecord({
                type: 'product',
                name: 'Product 1',
                slug: 'product-1',
            });
            seedTestRecord({
                type: 'feature',
                name: 'Feature 1',
                slug: 'feature-1',
            });

            const client = getClient();
            const response = await client.get('/records', {
                params: { type: 'product' },
            });

            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(1);
            expect(response.data[0].name).toBe('Product 1');
        });

        it('returns records with data property as EntityData structure', async () => {
            seedTestRecord({
                type: 'product',
                name: 'Product 1',
                slug: 'product-1',
                data: { fieldGroups: [{ name: 'General', fields: [] }] },
            });

            const client = getClient();
            const response = await client.get('/records');

            expect(response.status).toBe(200);
            expect(response.data[0]).toHaveProperty('data');
        });
    });

    describe('GET /api/records/:id', () => {
        it('returns record by ID', async () => {
            const id = seedTestRecord({
                type: 'product',
                name: 'Test Product',
                slug: 'test-product',
            });

            const client = getClient();
            const response = await client.get(`/records/${id}`);

            expect(response.status).toBe(200);
            expect(response.data.id).toBe(id);
            expect(response.data.name).toBe('Test Product');
        });

        it('returns record by slug', async () => {
            seedTestRecord({
                type: 'product',
                name: 'Test Product',
                slug: 'test-product',
            });

            const client = getClient();
            const response = await client.get('/records/test-product');

            expect(response.status).toBe(200);
            expect(response.data.slug).toBe('test-product');
        });

        it('returns 404 for non-existent record', async () => {
            const client = getClient();
            const response = await client.get('/records/non-existent-id');

            expect(response.status).toBe(404);
            expect(response.data.error).toBe('Record not found');
        });
    });

    describe('POST /api/records', () => {
        it('creates new record', async () => {
            const client = getClient();
            const response = await client.post('/records', {
                type: 'product',
                name: 'New Product',
                slug: 'new-product',
                description: 'A new product',
                data: { fieldGroups: [] },
            });

            expect(response.status).toBe(201);
            expect(response.data.name).toBe('New Product');
            expect(response.data.slug).toBe('new-product');
            expect(response.data._idempotency).toBe('created');
        });

        it('returns 400 for invalid input', async () => {
            const client = getClient();
            const response = await client.post('/records', {
                // Missing required fields
                name: 'Invalid Record',
            });

            expect(response.status).toBe(400);
        });

        it('handles idempotent creation (skip existing)', async () => {
            // Seed with same data structure that will be posted
            seedTestRecord({
                type: 'product',
                name: 'Existing Product',
                slug: 'existing-product',
                data: { fieldGroups: [] },  // Match the POST data structure
            });

            const client = getClient();
            const response = await client.post('/records', {
                type: 'product',
                name: 'Existing Product',
                slug: 'existing-product',
                data: { fieldGroups: [] },
            });

            // Should return 200 with skip flag, not create duplicate
            expect(response.status).toBe(200);
            expect(response.data._idempotency).toBe('skipped');
        });
    });

    describe('PUT /api/records/:id', () => {
        it('updates existing record', async () => {
            const id = seedTestRecord({
                type: 'product',
                name: 'Original Name',
                slug: 'original-name',
            });

            const client = getClient();
            const response = await client.put(`/records/${id}`, {
                name: 'Updated Name',
            });

            expect(response.status).toBe(200);
            expect(response.data.name).toBe('Updated Name');
        });

        it('returns 404 for non-existent record', async () => {
            const client = getClient();
            const response = await client.put('/records/non-existent-id', {
                name: 'Updated Name',
            });

            expect(response.status).toBe(404);
        });

        it('preserves unchanged fields', async () => {
            const id = seedTestRecord({
                type: 'product',
                name: 'Product',
                slug: 'product-slug',
                description: 'Original description',
            });

            const client = getClient();
            const response = await client.put(`/records/${id}`, {
                name: 'Updated Name',
            });

            expect(response.status).toBe(200);
            expect(response.data.name).toBe('Updated Name');
            expect(response.data.slug).toBe('product-slug');
        });
    });

    describe('DELETE /api/records/:id', () => {
        it('deletes existing record', async () => {
            const id = seedTestRecord({
                type: 'product',
                name: 'To Delete',
                slug: 'to-delete',
            });

            const client = getClient();
            const response = await client.delete(`/records/${id}`);

            expect(response.status).toBe(204);

            // Verify deleted
            const getResponse = await client.get(`/records/${id}`);
            expect(getResponse.status).toBe(404);
        });

        it('returns 404 for non-existent record', async () => {
            const client = getClient();
            const response = await client.delete('/records/non-existent-id');

            expect(response.status).toBe(404);
        });
    });
});
