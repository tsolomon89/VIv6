/**
 * Presets API Route Tests
 *
 * Tests for /api/presets endpoints:
 * - GET /api/presets - List all presets
 * - GET /api/presets/:key - Get preset by key
 * - POST /api/presets - Create preset
 * - PUT /api/presets/:key - Update preset
 * - DELETE /api/presets/:key - Delete preset
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    seedTestPreset,
    db,
} from './setup.js';

describe('Presets API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('GET /api/presets', () => {
        it('returns empty array when no presets exist', async () => {
            const client = getClient();
            const response = await client.get('/presets');

            expect(response.status).toBe(200);
            expect(response.data).toEqual([]);
        });

        it('returns all presets', async () => {
            seedTestPreset({ key: 'hero.v1', name: 'Hero Section' });
            seedTestPreset({ key: 'cta.v1', name: 'CTA Section' });

            const client = getClient();
            const response = await client.get('/presets');

            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(2);
        });
    });

    describe('GET /api/presets/:key', () => {
        it('returns preset by key', async () => {
            seedTestPreset({ key: 'hero.v1', name: 'Hero Section' });

            const client = getClient();
            const response = await client.get('/presets/hero.v1');

            expect(response.status).toBe(200);
            expect(response.data.key).toBe('hero.v1');
            expect(response.data.name).toBe('Hero Section');
        });

        it('returns 404 for non-existent preset', async () => {
            const client = getClient();
            const response = await client.get('/presets/non-existent');

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/presets', () => {
        it('creates new preset', async () => {
            const client = getClient();
            const response = await client.post('/presets', {
                key: 'new-preset.v1',
                name: 'New Preset',
                signature: { kind: 'self' },
                config: { component: 'HeroSection', props: { title: 'Default' } },
            });

            expect(response.status).toBe(201);
            expect(response.data.key).toBe('new-preset.v1');
        });

        it('returns 400 for missing required fields', async () => {
            const client = getClient();
            const response = await client.post('/presets', {
                name: 'No Key',
            });

            expect(response.status).toBe(400);
        });

        it('returns 409 for duplicate key', async () => {
            seedTestPreset({ key: 'existing.v1', name: 'Existing' });

            const client = getClient();
            const response = await client.post('/presets', {
                key: 'existing.v1',
                name: 'Duplicate',
                signature: { kind: 'self' },
                config: { component: 'Test' },
            });

            expect(response.status).toBe(409);
        });
    });

    describe('PUT /api/presets/:key', () => {
        it('updates existing preset', async () => {
            seedTestPreset({ key: 'hero.v1', name: 'Hero Section' });

            const client = getClient();
            const response = await client.put('/presets/hero.v1', {
                name: 'Updated Hero Section',
            });

            expect(response.status).toBe(200);
            expect(response.data.name).toBe('Updated Hero Section');
        });

        it('returns 404 for non-existent preset', async () => {
            const client = getClient();
            const response = await client.put('/presets/non-existent', {
                name: 'Update',
            });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/presets/:key', () => {
        it('deletes existing preset', async () => {
            seedTestPreset({ key: 'to-delete.v1', name: 'To Delete' });

            const client = getClient();
            const response = await client.delete('/presets/to-delete.v1');

            expect(response.status).toBe(204);

            // Verify deleted
            const getResponse = await client.get('/presets/to-delete.v1');
            expect(getResponse.status).toBe(404);
        });

        it('returns 404 for non-existent preset', async () => {
            const client = getClient();
            const response = await client.delete('/presets/non-existent');

            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/presets/compatible', () => {
        it('returns presets compatible with binding signature', async () => {
            seedTestPreset({
                key: 'self-brand.v1',
                name: 'Self Brand',
                signature: { kind: 'self' }
            });

            const client = getClient();
            const response = await client.get('/presets/compatible', {
                params: { binding_kind: 'self' }
            });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
        });
    });

    describe('POST /api/presets/:key/clone', () => {
        it('clones preset with new key', async () => {
            seedTestPreset({
                key: 'original.v1',
                name: 'Original Preset',
                signature: { kind: 'self' },
                config: { component: 'Hero', props: {} }
            });

            const client = getClient();
            const response = await client.post('/presets/original.v1/clone', {
                new_key: 'cloned.v1',
                name: 'Cloned Preset',
            });

            expect(response.status).toBe(201);
            expect(response.data.key).toBe('cloned.v1');
        });

        it('returns 404 for non-existent source preset', async () => {
            const client = getClient();
            const response = await client.post('/presets/non-existent/clone', {
                new_key: 'cloned.v1',
            });

            expect(response.status).toBe(404);
        });

        it('returns 400 for missing new_key', async () => {
            seedTestPreset({ key: 'original.v1', name: 'Original' });

            const client = getClient();
            const response = await client.post('/presets/original.v1/clone', {});

            expect(response.status).toBe(400);
        });
    });
});
