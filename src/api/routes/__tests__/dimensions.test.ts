/**
 * Dimensions API Route Tests
 *
 * Tests for /api/dimensions endpoints:
 * - GET /api/dimensions - List dimension values
 * - GET /api/dimensions/types - List dimension types
 * - POST /api/dimensions - Create dimension value
 * - DELETE /api/dimensions/:id - Delete dimension value
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    seedTestDimension,
    db,
} from './setup.js';

describe('Dimensions API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('GET /api/dimensions', () => {
        it('returns empty array when no dimensions exist', async () => {
            const client = getClient();
            const response = await client.get('/dimensions');

            expect(response.status).toBe(200);
            expect(response.data.data).toEqual([]);
        });

        it('returns all dimension values', async () => {
            seedTestDimension({ dimension: 'industry', slug: 'tech', label: 'Technology' });
            seedTestDimension({ dimension: 'industry', slug: 'finance', label: 'Finance' });
            seedTestDimension({ dimension: 'region', slug: 'na', label: 'North America' });

            const client = getClient();
            const response = await client.get('/dimensions');

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(3);
        });

        it('filters by dimension type', async () => {
            seedTestDimension({ dimension: 'industry', slug: 'tech', label: 'Technology' });
            seedTestDimension({ dimension: 'industry', slug: 'finance', label: 'Finance' });
            seedTestDimension({ dimension: 'region', slug: 'na', label: 'North America' });

            const client = getClient();
            const response = await client.get('/dimensions', {
                params: { dimension: 'industry' }
            });

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(2);
            expect(response.data.data.every((d: any) => d.dimension === 'industry')).toBe(true);
        });

        it('returns hierarchical values with parent relationships', async () => {
            const parentId = seedTestDimension({
                dimension: 'location',
                slug: 'usa',
                label: 'United States'
            });
            seedTestDimension({
                dimension: 'location',
                slug: 'ca',
                label: 'California',
                parent_id: parentId
            });
            seedTestDimension({
                dimension: 'location',
                slug: 'ny',
                label: 'New York',
                parent_id: parentId
            });

            const client = getClient();
            const response = await client.get('/dimensions', {
                params: { dimension: 'location' }
            });

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(3);

            const california = response.data.data.find((d: any) => d.slug === 'ca');
            expect(california.parent_id).toBe(parentId);
        });
    });

    describe('GET /api/dimensions/types', () => {
        it('returns dimension types with counts', async () => {
            seedTestDimension({ dimension: 'industry', slug: 'tech', label: 'Technology' });
            seedTestDimension({ dimension: 'industry', slug: 'finance', label: 'Finance' });
            seedTestDimension({ dimension: 'region', slug: 'na', label: 'North America' });

            const client = getClient();
            const response = await client.get('/dimensions/types');

            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(2);

            const industryType = response.data.find((d: any) => d.dimension === 'industry');
            expect(industryType.count).toBe(2);
        });
    });

    describe('POST /api/dimensions', () => {
        it('creates new dimension value', async () => {
            const client = getClient();
            const response = await client.post('/dimensions', {
                dimension: 'industry',
                slug: 'healthcare',
                label: 'Healthcare',
            });

            expect(response.status).toBe(201);
            expect(response.data.dimension).toBe('industry');
            expect(response.data.slug).toBe('healthcare');
            expect(response.data.label).toBe('Healthcare');
        });

        it('creates dimension value with parent', async () => {
            const parentId = seedTestDimension({
                dimension: 'location',
                slug: 'usa',
                label: 'United States'
            });

            const client = getClient();
            const response = await client.post('/dimensions', {
                dimension: 'location',
                slug: 'tx',
                label: 'Texas',
                parent_id: parentId,
            });

            expect(response.status).toBe(201);
            expect(response.data.parent_id).toBe(parentId);
        });

        it('returns 400 for missing required fields', async () => {
            const client = getClient();
            const response = await client.post('/dimensions', {
                dimension: 'industry',
                // Missing slug and label
            });

            expect(response.status).toBe(400);
        });

        it('returns 409 for duplicate dimension value', async () => {
            seedTestDimension({ dimension: 'industry', slug: 'retail', label: 'Retail' });

            const client = getClient();
            const response = await client.post('/dimensions', {
                dimension: 'industry',
                slug: 'retail',
                label: 'Retail',
            });

            expect(response.status).toBe(409);
        });
    });

    describe('DELETE /api/dimensions/:id', () => {
        it('deletes existing dimension value', async () => {
            const id = seedTestDimension({ dimension: 'industry', slug: 'retail', label: 'Retail' });

            const client = getClient();
            const response = await client.delete(`/dimensions/${id}`);

            expect(response.status).toBe(204);

            // Verify deleted
            const val = db.prepare('SELECT * FROM dimension_values WHERE id = ?').get(id);
            expect(val).toBeUndefined();
        });

        it('returns 404 for non-existent dimension value', async () => {
            const client = getClient();
            const response = await client.delete('/dimensions/00000000-0000-0000-0000-000000000099');

            expect(response.status).toBe(404);
        });
    });

    describe('Dimension Dependencies', () => {
        it('GET /api/dimensions/dependencies returns dependencies', async () => {
            const client = getClient();
            const response = await client.get('/dimensions/dependencies');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.data.data)).toBe(true);
        });

        it('POST /api/dimensions/dependencies creates dependency', async () => {
            const industryTech = seedTestDimension({
                dimension: 'industry',
                slug: 'tech',
                label: 'Technology'
            });
            const ucTechStartup = seedTestDimension({
                dimension: 'useCase',
                slug: 'tech-startup',
                label: 'Tech Startup'
            });

            const client = getClient();
            const response = await client.post('/dimensions/dependencies', {
                source_value_id: ucTechStartup,
                target_value_id: industryTech,
            });

            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('id');
        });

        it('returns 400 for missing dependency fields', async () => {
            const client = getClient();
            const response = await client.post('/dimensions/dependencies', {
                // Missing source_value_id and target_value_id
            });

            expect(response.status).toBe(400);
        });
    });
});
