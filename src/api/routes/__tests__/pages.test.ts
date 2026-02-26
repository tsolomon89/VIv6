/**
 * Pages API Route Tests
 *
 * Tests for /api/pages endpoints:
 * - GET /api/pages - List all pages
 * - GET /api/pages/:slug - Get page by ID or slug
 * - POST /api/pages - Create page
 * - PUT /api/pages/:id - Update page
 * - DELETE /api/pages/:id - Delete page
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    seedTestPage,
    db,
} from './setup.js';

describe('Pages API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('GET /api/pages', () => {
        it('returns empty array when no pages exist', async () => {
            const client = getClient();
            const response = await client.get('/pages');

            expect(response.status).toBe(200);
            expect(response.data.data).toEqual([]);
        });

        it('returns all pages', async () => {
            seedTestPage({ name: 'Home Page', slug: 'home' });
            seedTestPage({ name: 'About Page', slug: 'about' });

            const client = getClient();
            const response = await client.get('/pages');

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(2);
        });

        it('filters pages by subject_type', async () => {
            seedTestPage({ name: 'Product Page', slug: 'product-1', subject_type: 'product' });
            seedTestPage({ name: 'Brand Page', slug: 'brand-1', subject_type: 'brand' });

            const client = getClient();
            const response = await client.get('/pages', {
                params: { subject_type: 'product' }
            });

            expect(response.status).toBe(200);
            expect(response.data.data).toHaveLength(1);
            expect(response.data.data[0].slug).toBe('product-1');
        });
    });

    describe('GET /api/pages/:slug', () => {
        it('returns page by ID', async () => {
            const id = seedTestPage({ name: 'Test Page', slug: 'test-page' });

            const client = getClient();
            const response = await client.get(`/pages/${id}`);

            expect(response.status).toBe(200);
            expect(response.data.id).toBe(id);
            expect(response.data.name).toBe('Test Page');
        });

        it('returns page by slug', async () => {
            seedTestPage({ name: 'Test Page', slug: 'test-page' });

            const client = getClient();
            const response = await client.get('/pages/test-page');

            expect(response.status).toBe(200);
            expect(response.data.slug).toBe('test-page');
        });

        it('returns 404 for non-existent page', async () => {
            const client = getClient();
            const response = await client.get('/pages/non-existent');

            expect(response.status).toBe(404);
            expect(response.data.error).toBe('Page not found');
        });
    });


    describe('GET /api/pages/:id/preview', () => {
        it('returns preview data for page', async () => {
            const id = seedTestPage({ name: 'Preview Page', slug: 'preview-page' });

            const client = getClient();
            const response = await client.get(`/pages/${id}/preview`);

            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('page');
            expect(response.data).toHaveProperty('compiled');
            expect(response.data).toHaveProperty('previewUrl');
        });
    });

    describe('POST /api/pages/:id/sections', () => {
        it('adds section to page', async () => {
            const id = seedTestPage({ name: 'Test Page', slug: 'test-page' });

            const client = getClient();
            const response = await client.post(`/pages/${id}/sections`, {
                binding: { kind: 'self' },
                preset_key: 'hero.v1',
            });

            expect(response.status).toBe(201);
            expect(response.data.section).toHaveProperty('id');
            expect(response.data.section.presentationKey).toBe('hero.v1');
        });
    });

    describe('GET /api/pages/:id/bindings', () => {
        it('returns resolved bindings for page', async () => {
            const id = seedTestPage({ name: 'Test Page', slug: 'test-page' });

            const client = getClient();
            const response = await client.get(`/pages/${id}/bindings`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
        });
    });
});
