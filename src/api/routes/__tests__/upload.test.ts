/**
 * Upload API Route Tests
 *
 * Tests for /api/upload endpoints:
 * - POST /api/upload - Upload file
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
    setupTestServer,
    teardownTestServer,
    resetTestDb,
    getClient,
} from './setup.js';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

describe('Upload API', () => {
    beforeAll(async () => {
        await setupTestServer();
    });

    afterAll(async () => {
        await teardownTestServer();
    });

    beforeEach(() => {
        resetTestDb();
    });

    describe('POST /api/upload', () => {
        it('uploads image file successfully', async () => {
            // Create a minimal valid PNG (1x1 pixel)
            const pngData = Buffer.from([
                0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
                0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
                0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
                0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
                0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
                0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
                0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
                0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
                0x44, 0xAE, 0x42, 0x60, 0x82
            ]);

            const formData = new FormData();
            formData.append('file', pngData, {
                filename: 'test.png',
                contentType: 'image/png'
            });

            const client = getClient();
            const response = await client.post('/upload', formData, {
                headers: {
                    ...formData.getHeaders(),
                }
            });

            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('url');
            expect(response.data).toHaveProperty('filename');
            expect(response.data.mimetype).toBe('image/png');
        });

        it('rejects non-image files', async () => {
            const formData = new FormData();
            formData.append('file', Buffer.from('not an image'), {
                filename: 'test.txt',
                contentType: 'text/plain'
            });

            const client = getClient();
            const response = await client.post('/upload', formData, {
                headers: {
                    ...formData.getHeaders(),
                }
            });

            expect(response.status).toBe(400);
        });

        it('returns 400 when no file provided', async () => {
            // Send a file in wrong field name - multer will reject with "Unexpected field"
            const formData = new FormData();
            formData.append('wrong_field', Buffer.from('some data'), {
                filename: 'test.png',
                contentType: 'image/png'
            });

            const client = getClient();
            const response = await client.post('/upload', formData, {
                headers: {
                    ...formData.getHeaders(),
                }
            });

            // Multer returns 400 with "Unexpected field" when file is in wrong field
            expect(response.status).toBe(400);
        });
    });
});
