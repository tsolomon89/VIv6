/**
 * Reseed API Route Tests
 *
 * Tests for /api/reseed endpoints:
 * - POST /api/reseed/preview - Preview seed diff
 * - POST /api/reseed/apply - Apply seed operations
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import path from 'path';
import { db } from '../../../core/db.js';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
} from './setup.js';

describe('Reseed API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('POST /api/reseed/preview', () => {
        it('returns diff operations', async () => {
            const client = getClient();
            const response = await client.post('/reseed/preview');

            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('ops');
            expect(response.data).toHaveProperty('stats');
            expect(Array.isArray(response.data.ops)).toBe(true);
        });

        it('includes stats with counts', async () => {
            const client = getClient();
            const response = await client.post('/reseed/preview');

            expect(response.status).toBe(200);
            expect(response.data.stats).toHaveProperty('created');
            expect(response.data.stats).toHaveProperty('updated');
            expect(response.data.stats).toHaveProperty('noop');
        });
    });

    describe('POST /api/reseed/apply', () => {
        it('applies empty ops array successfully', async () => {
            const client = getClient();
            const response = await client.post('/reseed/apply', {
                ops: []
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(response.data.applied).toBe(0);
        });

        it('applies create operations', async () => {
            const client = getClient();
            const response = await client.post('/reseed/apply', {
                ops: [
                    {
                        action: 'create',
                        type: 'record',
                        key: 'new-record',
                        summary: 'Create new record',
                        payload: {
                            type: 'product',
                            slug: 'new-seeded-product',
                            name: 'New Seeded Product',
                            account_id: '00000000-0000-0000-0000-000000000000',
                            data: { fieldGroups: [] }
                        }
                    }
                ]
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
        });

        it('skips noop operations', async () => {
            const client = getClient();
            const response = await client.post('/reseed/apply', {
                ops: [
                    {
                        action: 'noop',
                        type: 'record',
                        key: 'existing-record',
                        summary: 'No change needed'
                    }
                ]
            });

            expect(response.status).toBe(200);
            expect(response.data.applied).toBe(0);
        });

        it('returns 400 for missing ops', async () => {
            const client = getClient();
            const response = await client.post('/reseed/apply', {});

            expect(response.status).toBe(400);
        });

        it('remains successful when plugin reconcile reports missing executors', async () => {
            db.prepare(`
                INSERT INTO records (id, type, slug, name, account_id, data, created_at, updated_at)
                VALUES (?, 'interpreter_executor_def', ?, ?, ?, ?, datetime('now'), datetime('now'))
            `).run(
                crypto.randomUUID(),
                'test-invalid-runtime-plugin',
                'test.invalid_runtime_plugin',
                '00000000-0000-0000-0000-000000000000',
                JSON.stringify({
                    key: 'test.invalid_runtime_plugin',
                    slug: 'test-invalid-runtime-plugin',
                    name: 'Invalid Runtime Plugin',
                    is_active: true,
                    metadata: {
                        runtime_registration: {
                            module: path.join('src', 'modules', 'ops', '__test_plugins__', 'interpreter_executor_plugin.ts'),
                            export: 'missingExportName',
                        },
                    },
                })
            );

            const client = getClient();
            const response = await client.post('/reseed/apply', { ops: [] });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
        });
    });
});
