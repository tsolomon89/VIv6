import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';
import { startServer } from '../../src/api/server.js';
import { resetDb, db } from '../../src/core/db.js';
import { AddressInfo } from 'net';

const TENANT_A = '11111111-1111-4111-8111-111111111111';
const TENANT_B = '22222222-2222-4222-8222-222222222222';
const API_KEY = 'secret';

describe('E2E: Multi-Tenancy', () => {
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
    // Seed Accounts
    const stmt = db.prepare('INSERT INTO records (id, slug, name, type, account_id, data) VALUES (?, ?, ?, ?, ?, ?)');
    const SYSTEM_ID = '00000000-0000-0000-0000-000000000000';
    stmt.run(TENANT_A, 'tenant-a', 'Tenant A', 'account', SYSTEM_ID, JSON.stringify({ type: 'client' }));
    stmt.run(TENANT_B, 'tenant-b', 'Tenant B', 'account', SYSTEM_ID, JSON.stringify({ type: 'client' }));
  });

  it('should isolate records between tenants', async () => {
      // Create Record for Tenant A
      await axios.post(`${baseUrl}/records`, {
          type: 'product',
          slug: 'product-a',
          name: 'Product A',
          account_id: TENANT_A
      }, { headers: { 'x-api-key': API_KEY } });

      // Create Record for Tenant B
      await axios.post(`${baseUrl}/records`, {
          type: 'product',
          slug: 'product-b',
          name: 'Product B',
          account_id: TENANT_B
      }, { headers: { 'x-api-key': API_KEY } });

      // List as Tenant A
      // GET requests requireTenancy but usually NOT createAuth.
      // Wait, listRecords uses requireTenancy. Does it require x-api-key?
      // records.ts line 29: router.get('/', validateQuery, requireTenancy, ...)
      // It does NOT use requireAuth.
      // requireTenancy likely inspects headers/query params. 
      // It might pass if valid tenant context provided.
      
      const resA = await axios.get(`${baseUrl}/records`, {
          params: { account_id: TENANT_A },
          headers: { 'x-api-key': API_KEY }
      });
      const itemsA = resA.data.data;  // Paginated response: { data: [...], pagination: {...} }
      expect(itemsA.length).toBe(1);
      expect(itemsA[0].slug).toBe('product-a');

      // List as Tenant B
      const resB = await axios.get(`${baseUrl}/records`, {
          params: { account_id: TENANT_B },
          headers: { 'x-api-key': API_KEY }
      });
      const itemsB = resB.data.data;  // Paginated response
      expect(itemsB.length).toBe(1);
      expect(itemsB[0].slug).toBe('product-b');
  });

  it('should prevent moving records between tenants via update', async () => {
      // Create for A
      const createRes = await axios.post(`${baseUrl}/records`, {
          type: 'product',
          slug: 'product-mutable',
          name: 'Original',
          account_id: TENANT_A
      }, { headers: { 'x-api-key': API_KEY } });
      const id = createRes.data.id;

      // Update checks
      // Try to change account_id to B
      const updateRes = await axios.put(`${baseUrl}/records/${id}`, {
          account_id: TENANT_B,
          name: 'Modified' 
      }, {
           params: { account_id: TENANT_A }, // Context
           headers: { 'x-api-key': API_KEY }
      });
      
      expect(updateRes.status).toBe(200);
      expect(updateRes.data.name).toBe('Modified');
      expect(updateRes.data.account_id).toBe(TENANT_A);
      
      // Verify persistence
      const getRes = await axios.get(`${baseUrl}/records/${id}`, { 
          params: { account_id: TENANT_A },
          headers: { 'x-api-key': API_KEY }
      });
      expect(getRes.data.account_id).toBe(TENANT_A);
  });
});
