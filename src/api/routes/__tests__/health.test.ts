/**
 * Health Endpoint Tests
 *
 * Tests for Kubernetes-compatible health probes:
 * - /api/health - Full health status
 * - /api/health/live - Liveness probe
 * - /api/health/ready - Readiness probe
 * - /api/health/startup - Startup probe
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestServer, teardownTestServer, resetTestDb, getClient } from './setup.js';

describe('Health API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('GET /api/health', () => {
        it('returns healthy status with database check', async () => {
            const client = getClient();
            const res = await client.get('/health');

            expect(res.status).toBe(200);
            expect(res.data.status).toBe('healthy');
            expect(res.data.timestamp).toBeDefined();
            expect(res.data.checks).toBeDefined();
            expect(res.data.checks.database).toBeDefined();
            expect(res.data.checks.database.status).toBe('up');
            expect(res.data.checks.database.latencyMs).toBeGreaterThanOrEqual(0);
        });

        it('includes service health information', async () => {
            const client = getClient();
            const res = await client.get('/health');

            expect(res.status).toBe(200);
            expect(res.data.checks.services).toBeDefined();
            expect(res.data.checks.services.aiScheduler).toBeDefined();
            expect(res.data.checks.services.workflowScheduler).toBeDefined();
            expect(res.data.checks.services.healthDaemon).toBeDefined();
        });

        it('reports service running/enabled state', async () => {
            const client = getClient();
            const res = await client.get('/health');

            const { aiScheduler } = res.data.checks.services;
            expect(typeof aiScheduler.running).toBe('boolean');
            expect(typeof aiScheduler.enabled).toBe('boolean');
        });
    });

    describe('GET /api/health/live', () => {
        it('returns alive status', async () => {
            const client = getClient();
            const res = await client.get('/health/live');

            expect(res.status).toBe(200);
            expect(res.data.status).toBe('alive');
            expect(res.data.timestamp).toBeDefined();
        });

        it('always returns 200 (liveness check)', async () => {
            const client = getClient();
            const res = await client.get('/health/live');

            // Liveness probe should always return 200 unless process needs restart
            expect(res.status).toBe(200);
        });
    });

    describe('GET /api/health/ready', () => {
        it('returns ready when database is up', async () => {
            const client = getClient();
            const res = await client.get('/health/ready');

            expect(res.status).toBe(200);
            expect(res.data.status).toBe('ready');
            expect(res.data.timestamp).toBeDefined();
            expect(res.data.database).toBeDefined();
            expect(res.data.database.status).toBe('up');
        });

        it('includes database latency', async () => {
            const client = getClient();
            const res = await client.get('/health/ready');

            expect(res.data.database.latencyMs).toBeGreaterThanOrEqual(0);
        });
    });

    describe('GET /api/health/startup', () => {
        it('returns started when initialization complete', async () => {
            const client = getClient();
            const res = await client.get('/health/startup');

            expect(res.status).toBe(200);
            expect(res.data.status).toBe('started');
            expect(res.data.timestamp).toBeDefined();
        });
    });
});
