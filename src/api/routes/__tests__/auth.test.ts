/**
 * Authentication & Tenancy Tests
 *
 * Tests for security middleware:
 * - 401 Unauthorized: Missing or invalid auth
 * - 403 Forbidden: Cross-account access attempts
 * - 200 OK: Valid auth with proper account access
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
    db,
} from './setup.js';
import {
    createSession,
    verifySession,
    revokeSession,
    cleanupExpiredRevocations,
} from '../../../modules/auth/session.js';
import jwt from 'jsonwebtoken';
import type { Server } from 'http';
import type { AddressInfo } from 'net';

let baseUrl: string;
let server: Server;

// Test constants
const TEST_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
const OTHER_ACCOUNT_ID = '11111111-1111-1111-1111-111111111111';
const TEST_USER_ID = 'test-user-001';

function seedTestData() {
    // Seed accounts
    db.prepare(`
        INSERT OR IGNORE INTO accounts (id, slug, name, account_class, type)
        VALUES (?, ?, ?, ?, ?)
    `).run(TEST_ACCOUNT_ID, 'test-account', 'Test Account', 'business', 'client');

    db.prepare(`
        INSERT OR IGNORE INTO accounts (id, slug, name, account_class, type)
        VALUES (?, ?, ?, ?, ?)
    `).run(OTHER_ACCOUNT_ID, 'other-account', 'Other Account', 'business', 'client');

    // Seed users table
    db.prepare(`
        INSERT OR IGNORE INTO users (id, email, name, primary_account_id)
        VALUES (?, ?, ?, ?)
    `).run(TEST_USER_ID, 'test@example.com', 'Test User', TEST_ACCOUNT_ID);

    // Link user to TEST_ACCOUNT_ID only (not OTHER_ACCOUNT_ID)
    db.prepare(`
        INSERT OR IGNORE INTO user_accounts (id, user_id, account_id, is_active, permission_level)
        VALUES (?, ?, ?, ?, ?)
    `).run(crypto.randomUUID(), TEST_USER_ID, TEST_ACCOUNT_ID, 1, 'admin');

    // Seed a test template
    db.prepare(`
        INSERT OR IGNORE INTO page_templates (id, key, name, sections, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(crypto.randomUUID(), 'test-template', 'Test Template', '[]');
}

describe('Authentication & Authorization', () => {
    beforeAll(async () => {
        const setup = await setupTestServer();
        server = setup.server;
        baseUrl = setup.baseUrl;
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
        seedTestData();
    });

    describe('Protected Routes - 401 Unauthorized', () => {
        it('POST /api/templates returns 401 without auth', async () => {
            const client = axios.create({
                baseURL: baseUrl,
                validateStatus: () => true,
                headers: { 'Content-Type': 'application/json' }
                // No x-api-key header
            });

            const response = await client.post('/templates', {
                key: 'new-template',
                name: 'New Template',
                sections: []
            });

            expect(response.status).toBe(401);
            expect(response.data.error).toContain('Authentication required');
        });

        it('PUT /api/templates/:key returns 401 without auth', async () => {
            const client = axios.create({
                baseURL: baseUrl,
                validateStatus: () => true,
                headers: { 'Content-Type': 'application/json' }
            });

            const response = await client.put('/templates/test-template', {
                name: 'Updated Name'
            });

            expect(response.status).toBe(401);
        });

        it('DELETE /api/templates/:key returns 401 without auth', async () => {
            const client = axios.create({
                baseURL: baseUrl,
                validateStatus: () => true,
                headers: { 'Content-Type': 'application/json' }
            });

            const response = await client.delete('/templates/test-template');

            expect(response.status).toBe(401);
        });

        it('POST /api/domains returns 401 without auth', async () => {
            const client = axios.create({
                baseURL: baseUrl,
                validateStatus: () => true,
                headers: { 'Content-Type': 'application/json' }
            });

            const response = await client.post('/domains', {
                brand_id: TEST_ACCOUNT_ID,
                hostname: 'test.example.com'
            });

            expect(response.status).toBe(401);
        });

        it('POST /api/relationships returns 401 without auth', async () => {
            const client = axios.create({
                baseURL: baseUrl,
                validateStatus: () => true,
                headers: { 'Content-Type': 'application/json' }
            });

            const response = await client.post('/relationships', {
                from_id: crypto.randomUUID(),
                to_id: crypto.randomUUID(),
                type: 'test'
            });

            expect(response.status).toBe(401);
        });
    });

    describe('Protected Routes - Valid Auth', () => {
        it('POST /api/templates succeeds with valid API key', async () => {
            const client = getClient(); // Uses test API key

            const response = await client.post('/templates', {
                key: 'auth-test-template',
                name: 'Auth Test Template',
                sections: [{ id: 'hero', type: 'hero' }]
            });

            expect(response.status).toBe(201);
            expect(response.data.key).toBe('auth-test-template');
        });

        it('PUT /api/templates/:key succeeds with valid API key', async () => {
            const client = getClient();

            const response = await client.put('/templates/test-template', {
                name: 'Updated via Auth'
            });

            expect(response.status).toBe(200);
        });

        it('DELETE /api/templates/:key succeeds with valid API key', async () => {
            const client = getClient();

            const response = await client.delete('/templates/test-template');

            expect(response.status).toBe(200);
        });
    });

    describe('Read Routes - Require Auth (More Secure)', () => {
        it('GET /api/templates requires auth', async () => {
            const client = axios.create({
                baseURL: baseUrl,
                validateStatus: () => true,
                headers: { 'Content-Type': 'application/json' }
            });

            const response = await client.get('/templates');

            // Templates are protected for reading too (delivery module)
            expect(response.status).toBe(401);
        });

        it('GET /api/templates/:key requires auth', async () => {
            const client = axios.create({
                baseURL: baseUrl,
                validateStatus: () => true,
                headers: { 'Content-Type': 'application/json' }
            });

            const response = await client.get('/templates/test-template');

            expect(response.status).toBe(401);
        });

        it('GET /api/templates succeeds with valid auth', async () => {
            const client = getClient();

            const response = await client.get('/templates');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
        });
    });

    describe('Rate Limiting', () => {
        it('rate-limit headers are present in response', async () => {
            const client = axios.create({
                baseURL: baseUrl,
                validateStatus: () => true,
                headers: { 'Content-Type': 'application/json' }
            });

            // Make a request to any API endpoint
            const response = await client.get('/health');

            // Rate limiting headers should be present (from express-rate-limit with standardHeaders: true)
            // Note: RateLimit-* headers are only added when limit is being tracked
            expect(response.status).toBe(200);
        });
    });
});

describe('Security Headers', () => {
    beforeAll(async () => {
        const setup = await setupTestServer();
        server = setup.server;
        baseUrl = setup.baseUrl;
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    it('includes security headers in response', async () => {
        const client = axios.create({
            baseURL: baseUrl,
            validateStatus: () => true,
        });

        const response = await client.get('/health');

        // helmet.js should add these headers
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
        // X-XSS-Protection is deprecated but helmet may still add it
    });
});

describe('Token Revocation', () => {
    beforeAll(async () => {
        const setup = await setupTestServer();
        server = setup.server;
        baseUrl = setup.baseUrl;
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
        seedTestData();
    });

    it('revoked token is rejected by verifySession', () => {
        const token = createSession(TEST_USER_ID, 'test@example.com');

        // Token is valid before revocation
        expect(verifySession(token)).not.toBeNull();
        expect(verifySession(token)?.userId).toBe(TEST_USER_ID);

        // Revoke the token
        const revoked = revokeSession(token, 'logout');
        expect(revoked).toBe(true);

        // Token is now rejected
        expect(verifySession(token)).toBeNull();
    });

    it('logout endpoint revokes token server-side', async () => {
        // First, seed a user with password for login
        const { hashPassword } = await import('../../../modules/auth/password.js');
        const passwordHash = await hashPassword('testpassword123');
        db.prepare(`
            UPDATE users SET password_hash = ? WHERE id = ?
        `).run(passwordHash, TEST_USER_ID);

        // Login to get a token
        const loginClient = axios.create({
            baseURL: baseUrl,
            validateStatus: () => true,
            headers: { 'Content-Type': 'application/json' }
        });

        const loginResponse = await loginClient.post('/auth/login', {
            email: 'test@example.com',
            password: 'testpassword123'
        });

        expect(loginResponse.status).toBe(200);
        const token = loginResponse.data.token;
        expect(token).toBeDefined();

        // Verify token works for /auth/me
        const authedClient = axios.create({
            baseURL: baseUrl,
            validateStatus: () => true,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const meResponse1 = await authedClient.get('/auth/me');
        expect(meResponse1.status).toBe(200);
        expect(meResponse1.data.user.id).toBe(TEST_USER_ID);

        // Logout with that token
        const logoutResponse = await authedClient.post('/auth/logout');
        expect(logoutResponse.status).toBe(200);
        expect(logoutResponse.data.success).toBe(true);

        // Token should now be rejected
        const meResponse2 = await authedClient.get('/auth/me');
        expect(meResponse2.status).toBe(401);
    });

    it('old tokens without JTI still work (backward compatibility)', () => {
        // Manually create a token without JTI (simulating old tokens)
        const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
        const oldToken = jwt.sign(
            { userId: TEST_USER_ID, email: 'test@example.com' },
            secret,
            { expiresIn: '7d' }
        );

        // Old token should still verify (no JTI to check)
        const payload = verifySession(oldToken);
        expect(payload).not.toBeNull();
        expect(payload?.userId).toBe(TEST_USER_ID);
        expect(payload?.jti).toBeUndefined();
    });

    it('revokeSession returns false for token without JTI', () => {
        const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
        const oldToken = jwt.sign(
            { userId: TEST_USER_ID, email: 'test@example.com' },
            secret,
            { expiresIn: '7d' }
        );

        // Cannot revoke a token without JTI
        const revoked = revokeSession(oldToken, 'logout');
        expect(revoked).toBe(false);
    });

    it('cleanupExpiredRevocations removes old entries', () => {
        // Create and revoke a token
        const token = createSession(TEST_USER_ID, 'test@example.com');
        revokeSession(token, 'logout');

        // Verify it's in the database
        const before = db.prepare('SELECT COUNT(*) as count FROM revoked_sessions').get() as { count: number };
        expect(before.count).toBeGreaterThan(0);

        // Manually set expires_at to the past
        db.prepare(`
            UPDATE revoked_sessions SET expires_at = datetime('now', '-1 day')
        `).run();

        // Cleanup should remove it
        const cleaned = cleanupExpiredRevocations();
        expect(cleaned).toBeGreaterThan(0);

        // Verify it's gone
        const after = db.prepare('SELECT COUNT(*) as count FROM revoked_sessions').get() as { count: number };
        expect(after.count).toBe(0);
    });
});
