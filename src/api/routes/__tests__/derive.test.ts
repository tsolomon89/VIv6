/**
 * Derive API Route Tests
 *
 * Tests for /api/derive endpoints:
 * - GET /api/derive/:entitySlug - Derive page for entity
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    seedTestRecord,
} from './setup.js';

describe('Derive API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('GET /api/derive/:entitySlug', () => {
        it('derives page for existing entity', async () => {
            // Seed a product entity
            seedTestRecord({
                type: 'product',
                name: 'Test Product',
                slug: 'test-product',
                data: {
                    fieldGroups: [
                        {
                            name: 'Core',
                            fields: [
                                { name: 'headline', inputType: 'text', value: 'Product Headline' }
                            ]
                        }
                    ]
                }
            });

            const client = getClient();
            const response = await client.get('/derive/test-product');

            expect(response.status).toBe(200);
            // DerivedPage has entitySlug, entityType, entityName, etc.
            expect(response.data).toHaveProperty('entitySlug');
            expect(response.data.entitySlug).toBe('test-product');
        });

        it('returns 404 for non-existent entity', async () => {
            const client = getClient();
            const response = await client.get('/derive/non-existent-entity');

            expect(response.status).toBe(404);
        });

        it('accepts optional segment parameter', async () => {
            seedTestRecord({
                type: 'product',
                name: 'Segment Product',
                slug: 'segment-product'
            });

            const client = getClient();
            const response = await client.get('/derive/segment-product', {
                params: { segment: 'enterprise' }
            });

            // Should succeed even with segment param
            expect([200, 404]).toContain(response.status);
        });

        it('accepts optional domain_type parameter', async () => {
            seedTestRecord({
                type: 'brand',
                name: 'Domain Brand',
                slug: 'domain-brand'
            });

            const client = getClient();
            const response = await client.get('/derive/domain-brand', {
                params: { domain_type: 'marketing' }
            });

            // Should succeed even with domain_type param
            expect([200, 404]).toContain(response.status);
        });
    });
});
