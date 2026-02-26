/**
 * Schema API Route Tests
 *
 * Tests for /api/schema endpoints:
 * - GET /api/schema/objects - List object definitions
 * - GET /api/schema/dimensions - List dimension types
 * - GET /api/schema/dimensions/:dimension/values - Get dimension values
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    seedTestRecord,
    seedTestDimension,
} from './setup.js';

describe('Schema API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('GET /api/schema/objects', () => {
        it('returns empty array when no object definitions exist', async () => {
            const client = getClient();
            const response = await client.get('/schema/objects');

            expect(response.status).toBe(200);
            // API returns { objects: [...] }
            expect(response.data).toHaveProperty('objects');
            expect(response.data.objects).toEqual([]);
        });

        it('returns object definitions', async () => {
            // Seed object_def records
            seedTestRecord({
                type: 'object_def',
                name: 'Product Definition',
                slug: 'product',
                data: { fieldGroups: [] }
            });

            const client = getClient();
            const response = await client.get('/schema/objects');

            expect(response.status).toBe(200);
            expect(response.data.objects.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/schema/objects/:slug', () => {
        it('returns object definition by slug', async () => {
            seedTestRecord({
                type: 'object_def',
                name: 'Feature Definition',
                slug: 'feature',
                data: { fieldGroups: [] }
            });

            const client = getClient();
            const response = await client.get('/schema/objects/feature');

            expect(response.status).toBe(200);
            expect(response.data.slug).toBe('feature');
        });

        it('returns 404 for non-existent object', async () => {
            const client = getClient();
            const response = await client.get('/schema/objects/non-existent');

            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/schema/dimensions', () => {
        it('returns dimension types with counts', async () => {
            seedTestDimension({ dimension: 'industry', slug: 'tech', label: 'Technology' });
            seedTestDimension({ dimension: 'industry', slug: 'finance', label: 'Finance' });
            seedTestDimension({ dimension: 'region', slug: 'na', label: 'North America' });

            const client = getClient();
            const response = await client.get('/schema/dimensions');

            expect(response.status).toBe(200);
            // API returns { dimensions: [...] }
            expect(response.data).toHaveProperty('dimensions');
            expect(Array.isArray(response.data.dimensions)).toBe(true);
        });
    });

    describe('GET /api/schema/dimensions/:dimension/values', () => {
        it('returns values for dimension', async () => {
            seedTestDimension({ dimension: 'industry', slug: 'tech', label: 'Technology' });
            seedTestDimension({ dimension: 'industry', slug: 'finance', label: 'Finance' });

            const client = getClient();
            const response = await client.get('/schema/dimensions/industry/values');

            expect(response.status).toBe(200);
            // API returns { dimension, values, filtered, filterApplied }
            expect(response.data).toHaveProperty('values');
            expect(Array.isArray(response.data.values)).toBe(true);
        });

        it('returns empty array for non-existent dimension', async () => {
            const client = getClient();
            const response = await client.get('/schema/dimensions/nonexistent/values');

            expect(response.status).toBe(200);
            // API returns { dimension, values: [], filtered, filterApplied }
            expect(response.data.values).toEqual([]);
        });
    });

    describe('GET /api/schema/activity-types', () => {
        it('returns activity archetypes', async () => {
            const client = getClient();
            const response = await client.get('/schema/activity-types');

            expect(response.status).toBe(200);
            // API returns { archetypes: [...] }
            expect(response.data).toHaveProperty('archetypes');
            expect(Array.isArray(response.data.archetypes)).toBe(true);
            // Should include data, asset, engagement, admin
            expect(response.data.archetypes.length).toBe(4);
        });
    });
});
