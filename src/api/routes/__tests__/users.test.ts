/**
 * Users API Route Tests
 *
 * Tests for /api/users endpoints:
 * - POST /api/users/invite - Invite user to account
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    db,
} from './setup.js';

describe('Users API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('POST /api/users/invite', () => {
        it('invites new user to account', async () => {
            const client = getClient();
            const response = await client.post('/users/invite', {
                email: 'newuser@example.com',
                role: 'member'
            });

            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('user');
            expect(response.data).toHaveProperty('link');
            expect(response.data.link.role).toBe('member');
        });

        it('returns 400 for missing email', async () => {
            const client = getClient();
            const response = await client.post('/users/invite', {
                role: 'admin'
                // Missing email
            });

            expect(response.status).toBe(400);
        });

        it('handles existing user gracefully', async () => {
            // First invite
            const client = getClient();
            await client.post('/users/invite', {
                email: 'existing@example.com',
                role: 'member'
            });

            // Second invite with same email should not fail
            const response = await client.post('/users/invite', {
                email: 'existing@example.com',
                role: 'admin'
            });

            // Should succeed (updates role or handles gracefully)
            expect([200, 201]).toContain(response.status);
        });

        it('uses default role when not specified', async () => {
            const client = getClient();
            const response = await client.post('/users/invite', {
                email: 'defaultrole@example.com'
            });

            expect(response.status).toBe(201);
            expect(response.data.link).toHaveProperty('role');
        });
    });
});
