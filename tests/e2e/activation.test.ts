import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';
import { startServer } from '../../src/api/server.js';
import { resetDb, db } from '../../src/core/db.js';
import { Factory } from '../../src/testing/factories.js';
import { AddressInfo } from 'net';

const TENANT_ID = '11111111-1111-4111-8111-111111111111';
const API_KEY = 'secret';

describe('E2E: Activation Engine', () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    process.env.ADMIN_KEY = API_KEY;
    // Start on random port
    server = await startServer(0);
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}/api`;
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    resetDb();
    // Seed Account
    try {
         db.prepare('INSERT INTO accounts (id, slug, name, account_class, type) VALUES (?, ?, ?, ?, ?)').run(TENANT_ID, 'tenant-a', 'Tenant A', 'business', 'client');
    } catch {}
  });

  it('should enforce taxonomy on activity creation (reject invalid activity_type)', async () => {
    try {
        await axios.post(`${baseUrl}/records`, {
            type: 'activity',
            slug: 'invalid-activity',
            name: 'Invalid Activity',
            account_id: TENANT_ID,
            activity_type: 'INVALID_TYPE', // This should fail validation
            data: {}
        }, {
            headers: { 'x-api-key': API_KEY }
        });
        expect.fail('Should have thrown 400 error');
    } catch (err: any) {
        if (!err.response) throw err;
        
        expect(err.response).toBeDefined();
        // Check for 400 Bad Request (Validation Limit)
        expect(err.response.status).toBe(400);
        expect(JSON.stringify(err.response.data)).toContain('Validation failed');
    }
  });

  it('should accept valid activity creation', async () => {
     const res = await axios.post(`${baseUrl}/records`, {
            type: 'activity',
            slug: 'valid-activity',
            name: 'Valid Activity',
            account_id: TENANT_ID,
            activity_type: 'data', // Valid
            data: { some: 'data' }
     }, {
         headers: { 'x-api-key': API_KEY }
     });

     expect(res.status).toBe(201);
     expect(res.data.id).toBeDefined();
     expect(res.data.type).toBe('activity');
  });
});
