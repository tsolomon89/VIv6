/**
 * API Route Test Setup
 *
 * Provides common utilities for testing API routes:
 * - Test server management
 * - Database reset between tests
 * - Authentication helpers
 * - Request builders
 */

import { startServer } from '../../server.js';
import { resetDb, db } from '../../../core/db.js';
import { calculateHash } from '../../../core/idempotency.js';
import axios, { AxiosInstance } from 'axios';
import { AddressInfo } from 'net';
import type { Server } from 'http';

// Set ADMIN_KEY for test authentication before any server starts
const TEST_ADMIN_KEY = 'test-admin-key-12345';
process.env.ADMIN_KEY = TEST_ADMIN_KEY;

let server: Server | null = null;
let baseUrl: string = '';
let apiClient: AxiosInstance;

/**
 * Start the test server on a random port
 */
export async function setupTestServer(): Promise<{ server: Server; baseUrl: string; client: AxiosInstance }> {
    server = await startServer(0); // Port 0 = random available port
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}/api`;

    apiClient = axios.create({
        baseURL: baseUrl,
        validateStatus: () => true, // Don't throw on non-2xx
        headers: {
            'Content-Type': 'application/json',
            // Use x-api-key header for admin bypass (matches allowApiKeyBypass middleware)
            'x-api-key': TEST_ADMIN_KEY,
            // Account context for ODAC
            'x-account-id': '00000000-0000-0000-0000-000000000000',
        },
    });

    return { server, baseUrl, client: apiClient };
}

/**
 * Close the test server
 */
export async function teardownTestServer(): Promise<void> {
    if (server) {
        await new Promise<void>((resolve) => server!.close(() => resolve()));
        server = null;
    }
}

/**
 * Reset database to clean state
 */
export function resetTestDb(): void {
    resetDb();
}

/**
 * Get the API client
 */
export function getClient(): AxiosInstance {
    if (!apiClient) {
        throw new Error('Test server not initialized. Call setupTestServer() first.');
    }
    return apiClient;
}

/**
 * Get base URL
 */
export function getBaseUrl(): string {
    return baseUrl;
}

/**
 * Seed a test record directly into the database
 */
export function seedTestRecord(data: {
    id?: string;
    type: string;
    name: string;
    slug: string;
    description?: string;
    account_id?: string;
    data?: Record<string, any>;
}): string {
    const id = data.id || crypto.randomUUID();
    const accountId = data.account_id || '00000000-0000-0000-0000-000000000000';
    const recordData = data.data || {};
    // Compute actual content hash for idempotency checks
    const contentHash = calculateHash(recordData);

    db.prepare(`
        INSERT INTO records (id, type, name, slug, description, account_id, data, content_hash, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
        id,
        data.type,
        data.name,
        data.slug,
        data.description || '',
        accountId,
        JSON.stringify(recordData),
        contentHash
    );

    return id;
}

/**
 * Seed a test dimension value
 */
export function seedTestDimension(data: {
    id?: string;
    dimension: string;
    slug: string;
    label: string;
    parent_id?: string;
    account_id?: string;
}): string {
    const id = data.id || crypto.randomUUID();

    db.prepare(`
        INSERT INTO dimension_values (id, dimension, slug, label, parent_id, account_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        id,
        data.dimension,
        data.slug,
        data.label,
        data.parent_id || null,
        data.account_id || null
    );

    return id;
}

/**
 * Seed a test user
 */
export function seedTestUser(data: {
    id?: string;
    email: string;
    name: string;
    role?: string;
    account_id?: string;
}): string {
    const id = data.id || crypto.randomUUID();
    const accountId = data.account_id || '00000000-0000-0000-0000-000000000000';

    db.prepare(`
        INSERT INTO users (id, email, name, role, account_id, password_hash, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
        id,
        data.email,
        data.name,
        data.role || 'admin',
        accountId,
        '$2b$10$test-hash' // Fake bcrypt hash for testing
    );

    return id;
}

export { db };
