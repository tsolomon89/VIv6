import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';
import { startServer } from '../../src/api/server.js';
import { resetDb, db } from '../../src/core/db.js';
import { AddressInfo } from 'net';

const API_KEY = 'secret';

describe('E2E: Dimension Schema API', () => {
    let server: any;
    let baseUrl: string;

    beforeAll(async () => {
        process.env.ADMIN_KEY = API_KEY;
        server = await startServer(0);
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}/api`;
    });

    afterAll(() => {
        server.close();
    });

    beforeEach(() => {
        resetDb();
    });

    describe('GET /api/schema/dimensions', () => {
        it('lists available dimension types', async () => {
            // Seed some dimensions
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
                .run('d1', 'sector', 'tech', 'Technology');
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
                .run('d2', 'sector', 'finance', 'Finance');
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
                .run('d3', 'industry', 'software', 'Software');

            const res = await axios.get(`${baseUrl}/schema/dimensions`);
            expect(res.status).toBe(200);
            expect(res.data.dimensions).toBeDefined();
            expect(res.data.dimensions).toContainEqual({ dimension: 'sector', count: 2 });
            expect(res.data.dimensions).toContainEqual({ dimension: 'industry', count: 1 });
        });

        it('returns empty array when no dimensions exist', async () => {
            const res = await axios.get(`${baseUrl}/schema/dimensions`);
            expect(res.status).toBe(200);
            expect(res.data.dimensions).toEqual([]);
        });
    });

    describe('GET /api/schema/dimensions/:dimension/values', () => {
        beforeEach(() => {
            // Seed test dimensions with NULL account_id (global)
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, account_id) VALUES (?, ?, ?, ?, ?)')
                .run('s1', 'sector', 'technology', 'Technology', null);
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, account_id) VALUES (?, ?, ?, ?, ?)')
                .run('i1', 'industry', 'software', 'Software', null);
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, account_id) VALUES (?, ?, ?, ?, ?)')
                .run('i2', 'industry', 'hardware', 'Hardware', null);
            // Dependency: technology -> software (bidirectional)
            db.prepare('INSERT INTO dimension_dependencies (id, source_dimension, source_value_id, target_dimension, target_value_id, bidirectional, account_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
                .run('dep1', 'sector', 's1', 'industry', 'i1', 1, null);
        });

        it('returns all values without filter', async () => {
            const res = await axios.get(`${baseUrl}/schema/dimensions/industry/values`);
            expect(res.status).toBe(200);
            expect(res.data.values).toHaveLength(2);
            expect(res.data.filtered).toBe(false);
            expect(res.data.dimension).toBe('industry');
        });

        it('filters values based on dependency', async () => {
            const res = await axios.get(`${baseUrl}/schema/dimensions/industry/values?filter[sector]=technology`);
            expect(res.status).toBe(200);
            expect(res.data.values).toHaveLength(1);
            expect(res.data.values[0].slug).toBe('software');
            expect(res.data.filtered).toBe(true);
        });

        it('returns empty array for unknown dimension', async () => {
            const res = await axios.get(`${baseUrl}/schema/dimensions/nonexistent/values`);
            expect(res.status).toBe(200);
            expect(res.data.values).toEqual([]);
        });

        it('handles bidirectional filter (reverse lookup)', async () => {
            const res = await axios.get(`${baseUrl}/schema/dimensions/sector/values?filter[industry]=software`);
            expect(res.status).toBe(200);
            expect(res.data.values).toHaveLength(1);
            expect(res.data.values[0].slug).toBe('technology');
        });

        it('includes metadata in response', async () => {
            // Add dimension with metadata
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, metadata, account_id) VALUES (?, ?, ?, ?, ?, ?)')
                .run('sz1', 'company_size', 'small', '1-50 employees', JSON.stringify({ range_start: 1, range_end: 50 }), null);

            const res = await axios.get(`${baseUrl}/schema/dimensions/company_size/values`);
            expect(res.status).toBe(200);
            expect(res.data.values[0].metadata).toEqual({ range_start: 1, range_end: 50 });
        });
    });

    describe('GET /api/dimensions/dependencies', () => {
        beforeEach(() => {
            // Seed dimensions and dependencies
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
                .run('v1', 'sector', 'tech', 'Technology');
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
                .run('v2', 'industry', 'software', 'Software');
            db.prepare('INSERT INTO dimension_dependencies (id, source_dimension, source_value_id, target_dimension, target_value_id) VALUES (?, ?, ?, ?, ?)')
                .run('dep1', 'sector', 'v1', 'industry', 'v2');
        });

        it('lists all dependencies', async () => {
            const res = await axios.get(`${baseUrl}/dimensions/dependencies`);
            expect(res.status).toBe(200);
            expect(res.data.data).toHaveLength(1);
            expect(res.data.data[0].source_slug).toBe('tech');
            expect(res.data.data[0].target_slug).toBe('software');
            expect(res.data.data[0].source_dimension).toBe('sector');
            expect(res.data.data[0].target_dimension).toBe('industry');
        });

        it('filters by source_dimension', async () => {
            // Add another dependency
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
                .run('v3', 'function', 'engineering', 'Engineering');
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
                .run('v4', 'seniority', 'senior', 'Senior');
            db.prepare('INSERT INTO dimension_dependencies (id, source_dimension, source_value_id, target_dimension, target_value_id) VALUES (?, ?, ?, ?, ?)')
                .run('dep2', 'function', 'v3', 'seniority', 'v4');

            const res = await axios.get(`${baseUrl}/dimensions/dependencies?source_dimension=sector`);
            expect(res.status).toBe(200);
            expect(res.data.data).toHaveLength(1);
            expect(res.data.data[0].source_dimension).toBe('sector');
        });

        it('filters by target_dimension', async () => {
            const res = await axios.get(`${baseUrl}/dimensions/dependencies?target_dimension=industry`);
            expect(res.status).toBe(200);
            expect(res.data.data).toHaveLength(1);
            expect(res.data.data[0].target_dimension).toBe('industry');
        });
    });

    describe('GET /api/dimensions', () => {
        it('lists dimension values with optional filters', async () => {
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
                .run('d1', 'sector', 'tech', 'Technology');
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
                .run('d2', 'sector', 'finance', 'Finance');

            const res = await axios.get(`${baseUrl}/dimensions?dimension=sector`);
            expect(res.status).toBe(200);
            expect(res.data.data).toHaveLength(2);
        });
    });

    describe('GET /api/dimensions/types', () => {
        it('lists distinct dimension types with counts', async () => {
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
                .run('d1', 'sector', 'tech', 'Technology');
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
                .run('d2', 'sector', 'finance', 'Finance');
            db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
                .run('d3', 'industry', 'software', 'Software');

            const res = await axios.get(`${baseUrl}/dimensions/types`);
            expect(res.status).toBe(200);
            expect(res.data).toContainEqual({ dimension: 'sector', count: 2 });
            expect(res.data).toContainEqual({ dimension: 'industry', count: 1 });
        });
    });
});
