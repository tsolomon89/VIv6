/**
 * Domains API Route Tests
 *
 * Tests for /api/domains endpoints:
 * - GET /api/domains - List domains
 * - GET /api/domains/:id - Get domain by ID
 * - GET /api/domains/resolve/:hostname - Resolve domain by hostname
 * - POST /api/domains - Create domain
 * - PUT /api/domains/:id - Update domain
 * - DELETE /api/domains/:id - Delete domain
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

function seedTestDomain(data: {
    id?: string;
    brand_id: string;  // Named brand_id for API compatibility, stored as account_id
    hostname: string;
    type?: string;
    is_primary?: boolean;
}): string {
    const id = data.id || crypto.randomUUID();
    db.prepare(`
        INSERT INTO domains (id, account_id, hostname, type, is_primary, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
    `).run(
        id,
        data.brand_id,  // API uses brand_id, schema uses account_id
        data.hostname,
        data.type || 'www',
        data.is_primary ? 1 : 0
    );
    return id;
}

describe('Domains API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('GET /api/domains', () => {
        it('returns empty array when no domains exist', async () => {
            const client = getClient();
            const response = await client.get('/domains');

            expect(response.status).toBe(200);
            expect(response.data).toEqual([]);
        });

        it('returns all domains', async () => {
            const brandId = seedTestRecord({ type: 'brand', name: 'Test Brand', slug: 'test-brand' });
            seedTestDomain({ brand_id: brandId, hostname: 'example.com' });
            seedTestDomain({ brand_id: brandId, hostname: 'test.com' });

            const client = getClient();
            const response = await client.get('/domains');

            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(2);
        });

        it('filters by brand_id', async () => {
            const brand1 = seedTestRecord({ type: 'brand', name: 'Brand 1', slug: 'brand-1' });
            const brand2 = seedTestRecord({ type: 'brand', name: 'Brand 2', slug: 'brand-2' });
            seedTestDomain({ brand_id: brand1, hostname: 'brand1.com' });
            seedTestDomain({ brand_id: brand2, hostname: 'brand2.com' });

            const client = getClient();
            const response = await client.get('/domains', {
                params: { brand_id: brand1 }
            });

            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(1);
            expect(response.data[0].hostname).toBe('brand1.com');
        });
    });

    describe('GET /api/domains/:id', () => {
        it('returns domain by ID', async () => {
            const brandId = seedTestRecord({ type: 'brand', name: 'Test Brand', slug: 'test-brand' });
            const domainId = seedTestDomain({ brand_id: brandId, hostname: 'mysite.com' });

            const client = getClient();
            const response = await client.get(`/domains/${domainId}`);

            expect(response.status).toBe(200);
            expect(response.data.hostname).toBe('mysite.com');
        });

        it('returns 404 for non-existent domain', async () => {
            const client = getClient();
            const response = await client.get('/domains/00000000-0000-0000-0000-000000000099');

            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/domains/resolve/:hostname', () => {
        it('resolves domain by hostname', async () => {
            const brandId = seedTestRecord({ type: 'brand', name: 'Test Brand', slug: 'test-brand' });
            seedTestDomain({ brand_id: brandId, hostname: 'resolve.example.com' });

            const client = getClient();
            const response = await client.get('/domains/resolve/resolve.example.com');

            expect(response.status).toBe(200);
            expect(response.data.hostname).toBe('resolve.example.com');
        });

        it('returns 404 for non-existent hostname', async () => {
            const client = getClient();
            const response = await client.get('/domains/resolve/nonexistent.com');

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/domains', () => {
        it('creates new domain', async () => {
            const brandId = seedTestRecord({ type: 'brand', name: 'Test Brand', slug: 'test-brand' });

            const client = getClient();
            const response = await client.post('/domains', {
                brand_id: brandId,
                hostname: 'new-domain.com'
            });

            expect(response.status).toBe(201);
            expect(response.data.hostname).toBe('new-domain.com');
        });

        it('returns 409 for duplicate hostname', async () => {
            const brandId = seedTestRecord({ type: 'brand', name: 'Test Brand', slug: 'test-brand' });
            seedTestDomain({ brand_id: brandId, hostname: 'duplicate.com' });

            const client = getClient();
            const response = await client.post('/domains', {
                brand_id: brandId,
                hostname: 'duplicate.com'
            });

            expect(response.status).toBe(409);
        });
    });

    describe('DELETE /api/domains/:id', () => {
        it('deletes existing domain', async () => {
            const brandId = seedTestRecord({ type: 'brand', name: 'Test Brand', slug: 'test-brand' });
            const domainId = seedTestDomain({ brand_id: brandId, hostname: 'delete-me.com' });

            const client = getClient();
            const response = await client.delete(`/domains/${domainId}`);

            expect(response.status).toBe(204);
        });

        it('returns 404 for non-existent domain', async () => {
            const client = getClient();
            const response = await client.delete('/domains/00000000-0000-0000-0000-000000000099');

            expect(response.status).toBe(404);
        });
    });
});
