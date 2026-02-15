import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';

import { startServer } from '../../src/api/server.js';
import { AddressInfo } from 'net';
import { resetDb } from '../../src/core/db.js';

// Set ADMIN_KEY for test authentication before any server starts
const TEST_ADMIN_KEY = 'test-admin-key-12345';
process.env.ADMIN_KEY = TEST_ADMIN_KEY;

describe('Commercial Engine E2E Lifecycle (Phase 12)', () => {
    let server: any;
    let API_URL: string;

    const ADMIN_KEY = TEST_ADMIN_KEY;
    const SYSTEM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000'; // System account UUID
    
    // We need axios config for Auth
    const axiosConfig = {
        headers: {
            'x-api-key': ADMIN_KEY,
            'x-account-id': SYSTEM_ACCOUNT_ID,
            // x-user-id not needed due to admin bypass in tenancy middleware
        }
    };

    // State for sharing between tests
    let mqlId: string;

    beforeAll(async () => {
        // Reset DB to ensure tables exist
        resetDb();

        // Start on random port
        server = await startServer(0);
        const address = server.address() as AddressInfo;
        API_URL = `http://127.0.0.1:${address.port}/api`;

        // Ensure server health
        try {
            await axios.get(`${API_URL}/health`);
        } catch (e) {
            console.error('Server not reachable');
            throw e;
        }

        // Reseed DB (Optional but good for clean state)
        // We use the 2-step reseed API
        try {
            const previewRes = await axios.post(`${API_URL}/reseed/preview`, {}, axiosConfig);
            expect(previewRes.status).toBe(200);
            
            const ops = previewRes.data.ops;
            const applyRes = await axios.post(`${API_URL}/reseed/apply`, { ops }, axiosConfig);
            expect(applyRes.status).toBe(200);
        } catch (e) {
            console.error('Reseed failed', e);
            throw e;
        }
    });

    it('should execute full commercial lifecycle (MQL -> SQL -> FTP -> RTP)', async () => {
        // --- Step 1: MQL Creation ---
        const uniqueSlug = `test-opp-${Date.now()}`;
        const mqlInput = {
            type: 'opportunity',
            slug: uniqueSlug,
            name: 'Test Commercial Opportunity',
            data: {
                amount: 100000,
                projected_revenue: 100000,
                probability: 0.1, // MQL default
                target_close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // +90 days
            }
        };

        const res = await axios.post(`${API_URL}/records`, mqlInput, axiosConfig);
        expect(res.status).toBe(201);
        
        const mql = res.data;
        mqlId = mql.id;
        
        expect(mql.id).toBeDefined();
        // Check stage default
        expect(mql.data.opportunity_stage).toBe('mql');
        
        // Check Yield Calculation (Hook)
        const yieldVal = mql.data.projected_yield;
        expect(yieldVal).toBeGreaterThan(100);
        expect(yieldVal).toBeLessThan(120);

        // --- Step 2: Transition to SQL ---
        expect(mqlId).toBeDefined();

        // Fetch current to get full data
        const currentRes = await axios.get(`${API_URL}/records/${mqlId}`, axiosConfig);
        const current = currentRes.data;

        // Update to SQL
        const sqlUpdate = {
            id: mqlId,
            type: 'opportunity',
            slug: current.slug,
            name: current.name,
            account_id: SYSTEM_ACCOUNT_ID,
            data: {
                ...current.data,
                intent_verified: true, // Gate requirement
                opportunity_stage: 'sql',
            }
        };

        const sqlRes = await axios.put(`${API_URL}/records/${mqlId}`, sqlUpdate, axiosConfig);
        const sql = sqlRes.data;

        expect(sql.data.opportunity_stage).toBe('sql');
        expect(sql.data.intent_verified).toBe(true);
        expect(sql.data.probability).toBe(0.4); // Hook sets STAGE_PROBABILITY['sql']

        // Yield Recalculation
        // 100000 * 0.4 / 90 = 444.44
        const sqlYield = sql.data.projected_yield;
        expect(sqlYield).toBeGreaterThan(440);
        expect(sqlYield).toBeLessThan(450);

        // --- Step 3: Transition to FTP (Closed Won) ---
        // Fetch current 
        const sqlCurrentRes = await axios.get(`${API_URL}/records/${mqlId}`, axiosConfig);
        const sqlCurrent = sqlCurrentRes.data;

        const ftpUpdate = {
            id: mqlId,
            type: 'opportunity',
            slug: sqlCurrent.slug,
            name: sqlCurrent.name,
            account_id: SYSTEM_ACCOUNT_ID,
            data: {
                ...sqlCurrent.data,
                opportunity_stage: 'ftp'
            }
        };

        const ftpRes = await axios.put(`${API_URL}/records/${mqlId}`, ftpUpdate, axiosConfig);
        const ftp = ftpRes.data;

        expect(ftp.data.opportunity_stage).toBe('ftp');
        expect(ftp.data.probability).toBe(1.0); // FTP = 100%

        // --- Step 4: Verify RTP Generation ---
        // We can query relationships API or list records filtered by 'rtp'
        const listRes = await axios.get(`${API_URL}/records?type=opportunity&account_id=${SYSTEM_ACCOUNT_ID}`, axiosConfig);
        const allOpps = listRes.data;
        
        const rtp = allOpps.find((o: any) => o.data.opportunity_stage === 'rtp' && o.data.source_opportunity_id === mqlId);
        
        expect(rtp).toBeDefined();
        if (rtp) {
             expect(rtp.name).toContain('Renew:');
             expect(rtp.data.projected_revenue).toBe(100000); // Carried over
        }
    });

    afterAll(() => {
        server.close();
    });
});
