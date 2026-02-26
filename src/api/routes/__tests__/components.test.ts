/**
 * Components API Route Tests
 *
 * Tests for /api/components endpoints:
 * - GET /api/components - Get component registry
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
} from './setup.js';
import fs from 'fs';
import path from 'path';

describe('Components API', () => {
    const componentsPath = path.resolve(process.cwd(), 'data/components.json');
    let originalComponents: string | null = null;

    beforeAll(async () => {
        await setupTestServer();
        // Backup existing components file if it exists
        if (fs.existsSync(componentsPath)) {
            originalComponents = fs.readFileSync(componentsPath, 'utf-8');
        }
    });

    afterAll(async () => {
        // Restore original components file
        if (originalComponents !== null) {
            fs.writeFileSync(componentsPath, originalComponents);
        }
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('GET /api/components', () => {
        it('returns component registry when file exists', async () => {
            // Ensure components file exists
            const testComponents = {
                HeroSection: { props: { title: 'string' } },
                CTASection: { props: { text: 'string' } }
            };

            // Ensure data directory exists
            const dataDir = path.dirname(componentsPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            fs.writeFileSync(componentsPath, JSON.stringify(testComponents));

            const client = getClient();
            const response = await client.get('/components');

            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('HeroSection');
        });

        it('returns 503 when component registry is not generated', async () => {
            // Remove components file
            if (fs.existsSync(componentsPath)) {
                fs.unlinkSync(componentsPath);
            }

            const client = getClient();
            const response = await client.get('/components');

            expect(response.status).toBe(503);
        });
    });
});
