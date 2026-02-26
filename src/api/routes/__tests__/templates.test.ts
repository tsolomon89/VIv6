/**
 * Templates API Route Tests
 *
 * Tests for /api/templates endpoints:
 * - GET /api/templates - List templates
 * - GET /api/templates/:key - Get template by key
 * - POST /api/templates - Create template
 * - PUT /api/templates/:key - Update template
 * - DELETE /api/templates/:key - Delete template
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    db,
} from './setup.js';

function seedTestTemplate(data: {
    key: string;
    name: string;
    sections?: object[];
    subject_target?: string;
}): string {
    const sections = data.sections || [];
    db.prepare(`
        INSERT INTO page_templates (id, key, name, sections, subject_target, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
        crypto.randomUUID(),
        data.key,
        data.name,
        JSON.stringify(sections),
        data.subject_target || null
    );
    return data.key;
}

describe('Templates API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('GET /api/templates', () => {
        it('returns empty array when no templates exist', async () => {
            const client = getClient();
            const response = await client.get('/templates');

            expect(response.status).toBe(200);
            expect(response.data).toEqual([]);
        });

        it('returns all templates', async () => {
            seedTestTemplate({ key: 'hero-page', name: 'Hero Page' });
            seedTestTemplate({ key: 'landing-page', name: 'Landing Page' });

            const client = getClient();
            const response = await client.get('/templates');

            expect(response.status).toBe(200);
            expect(response.data).toHaveLength(2);
        });
    });

    describe('GET /api/templates/:key', () => {
        it('returns template by key', async () => {
            seedTestTemplate({ key: 'product-page', name: 'Product Page' });

            const client = getClient();
            const response = await client.get('/templates/product-page');

            expect(response.status).toBe(200);
            expect(response.data.key).toBe('product-page');
            expect(response.data.name).toBe('Product Page');
        });

        it('returns 404 for non-existent template', async () => {
            const client = getClient();
            const response = await client.get('/templates/non-existent');

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/templates', () => {
        it('creates new template', async () => {
            const client = getClient();
            const response = await client.post('/templates', {
                key: 'new-template',
                name: 'New Template',
                sections: [{ id: 'hero', type: 'hero' }]
            });

            expect(response.status).toBe(201);
            expect(response.data.key).toBe('new-template');
        });

        it('returns 400 for missing required fields', async () => {
            const client = getClient();
            const response = await client.post('/templates', {
                name: 'No Key Template'
                // Missing key and sections
            });

            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/templates/:key', () => {
        it('updates existing template', async () => {
            seedTestTemplate({ key: 'edit-me', name: 'Original Name' });

            const client = getClient();
            const response = await client.put('/templates/edit-me', {
                name: 'Updated Name'
            });

            expect(response.status).toBe(200);
            // API returns { key, message } on update
            expect(response.data.key).toBe('edit-me');
            expect(response.data.message).toBe('Template updated');
        });

        it('returns 404 for non-existent template', async () => {
            const client = getClient();
            const response = await client.put('/templates/non-existent', {
                name: 'Update'
            });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/templates/:key', () => {
        it('deletes existing template', async () => {
            seedTestTemplate({ key: 'delete-me', name: 'To Delete' });

            const client = getClient();
            const response = await client.delete('/templates/delete-me');

            // API returns 200 with { message } on delete
            expect(response.status).toBe(200);
            expect(response.data.message).toBe('Template deleted');

            // Verify deleted
            const getResponse = await client.get('/templates/delete-me');
            expect(getResponse.status).toBe(404);
        });

        it('returns 404 for non-existent template', async () => {
            const client = getClient();
            const response = await client.delete('/templates/non-existent');

            expect(response.status).toBe(404);
        });
    });
});
