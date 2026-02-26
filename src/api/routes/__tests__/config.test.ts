/**
 * Config API Route Tests
 *
 * Tests for /api/config endpoints:
 * - GET /api/config - Get brand configuration
 * - PATCH /api/config - Update brand configuration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    db,
} from './setup.js';

describe('Config API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('GET /api/config', () => {
        it('returns config when it exists', async () => {
            // Seed config using brand_config table with correct columns
            db.prepare(`
                INSERT INTO brand_config (id, key, data)
                VALUES (?, 'default', '{"name":"TestBrand","colors":{}}')
            `).run(crypto.randomUUID());

            const client = getClient();
            const response = await client.get('/config');

            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('name', 'TestBrand');
        });

        it('returns 404 when config does not exist', async () => {
            // Ensure brand_config is empty
            db.prepare('DELETE FROM brand_config').run();

            const client = getClient();
            const response = await client.get('/config');

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /api/config', () => {
        it('creates config when it does not exist', async () => {
            // Ensure brand_config is empty
            db.prepare('DELETE FROM brand_config').run();

            const client = getClient();
            const response = await client.patch('/config', {
                name: 'NewBrand',
                colors: { primary: '#000' }
            });

            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('name', 'NewBrand');
        });

        it('merges updates with existing config', async () => {
            // Seed initial config
            db.prepare(`
                INSERT INTO brand_config (id, key, data)
                VALUES (?, 'default', '{"name":"OldBrand","colors":{"primary":"#fff"}}')
            `).run(crypto.randomUUID());

            const client = getClient();
            const response = await client.patch('/config', {
                colors: { primary: '#000' }
            });

            expect(response.status).toBe(200);
            expect(response.data.name).toBe('OldBrand');
            expect(response.data.colors.primary).toBe('#000');
        });
    });
});
