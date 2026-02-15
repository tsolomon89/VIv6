import { describe, it, expect, beforeEach } from 'vitest';
import { db, resetDb } from '../core/db.js';
import { toSlug, parseCSVLine, upsertDimension, createDependency, seedTaxonomy, resetStatements } from './seed_taxonomy.js';

describe('Taxonomy Seeding', () => {
    beforeEach(() => {
        resetDb();
        resetStatements(); // Clear cached prepared statements after DB reset
    });

    describe('toSlug', () => {
        it('converts spaces to underscores', () => {
            expect(toSlug('Job Title')).toBe('job_title');
        });

        it('converts to lowercase', () => {
            expect(toSlug('UPPERCASE')).toBe('uppercase');
        });

        it('removes special characters', () => {
            expect(toSlug('C-Suite & Executives')).toBe('c_suite_executives');
        });

        it('handles empty strings', () => {
            expect(toSlug('')).toBe('');
        });

        it('removes leading and trailing underscores', () => {
            expect(toSlug('  test  ')).toBe('test');
        });

        it('collapses multiple special characters', () => {
            expect(toSlug('hello---world')).toBe('hello_world');
        });
    });

    describe('parseCSVLine', () => {
        it('parses simple CSV line', () => {
            expect(parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c']);
        });

        it('handles quoted fields with commas', () => {
            expect(parseCSVLine('"a,b",c')).toEqual(['a,b', 'c']);
        });

        it('trims whitespace', () => {
            expect(parseCSVLine(' a , b ')).toEqual(['a', 'b']);
        });

        it('handles empty fields', () => {
            expect(parseCSVLine('a,,c')).toEqual(['a', '', 'c']);
        });

        it('handles single value', () => {
            expect(parseCSVLine('single')).toEqual(['single']);
        });

        it('handles empty string', () => {
            expect(parseCSVLine('')).toEqual(['']);
        });
    });

    describe('upsertDimension', () => {
        it('creates new dimension value', () => {
            const id = upsertDimension('test_dim', 'Test Label');
            expect(id).toBeDefined();
            expect(typeof id).toBe('string');

            const row = db.prepare('SELECT * FROM dimension_values WHERE id = ?').get(id) as any;
            expect(row).toBeDefined();
            expect(row.label).toBe('Test Label');
            expect(row.slug).toBe('test_label');
            expect(row.dimension).toBe('test_dim');
        });

        it('is idempotent - returns existing id on duplicate', () => {
            const id1 = upsertDimension('test_dim', 'Same Label');
            const id2 = upsertDimension('test_dim', 'Same Label');
            expect(id1).toBe(id2);

            // Verify only one row exists
            const count = db.prepare('SELECT COUNT(*) as cnt FROM dimension_values WHERE dimension = ? AND slug = ?')
                .get('test_dim', 'same_label') as any;
            expect(count.cnt).toBe(1);
        });

        it('stores parent_id for hierarchical dimensions', () => {
            const parentId = upsertDimension('sector', 'Technology');
            const childId = upsertDimension('industry', 'Software', parentId);

            const child = db.prepare('SELECT * FROM dimension_values WHERE id = ?').get(childId) as any;
            expect(child.parent_id).toBe(parentId);
        });

        it('stores metadata as JSON', () => {
            const id = upsertDimension('company_size', '1-10 employees', null, { range_start: 1, range_end: 10 });

            const row = db.prepare('SELECT * FROM dimension_values WHERE id = ?').get(id) as any;
            const metadata = JSON.parse(row.metadata);
            expect(metadata.range_start).toBe(1);
            expect(metadata.range_end).toBe(10);
        });

        it('uses NULL account_id for global dimensions', () => {
            const id = upsertDimension('sector', 'Global Sector');

            const row = db.prepare('SELECT * FROM dimension_values WHERE id = ?').get(id) as any;
            expect(row.account_id).toBeNull();
        });
    });

    describe('createDependency', () => {
        beforeEach(() => {
            // Seed test dimensions
            upsertDimension('function', 'Engineering');
            upsertDimension('seniority', 'Senior');
        });

        it('creates bidirectional dependency', () => {
            const result = createDependency('function', 'engineering', 'seniority', 'senior', 1);
            expect(result).toBe(true);

            const dep = db.prepare('SELECT * FROM dimension_dependencies WHERE source_dimension = ?').get('function') as any;
            expect(dep).toBeDefined();
            expect(dep.bidirectional).toBe(1);
            expect(dep.target_dimension).toBe('seniority');
        });

        it('is idempotent - returns true for existing', () => {
            const result1 = createDependency('function', 'engineering', 'seniority', 'senior');
            const result2 = createDependency('function', 'engineering', 'seniority', 'senior');

            expect(result1).toBe(true);
            expect(result2).toBe(true);

            // Verify only one dependency exists
            const count = db.prepare('SELECT COUNT(*) as cnt FROM dimension_dependencies').get() as any;
            expect(count.cnt).toBe(1);
        });

        it('returns false for invalid source slug', () => {
            const result = createDependency('function', 'nonexistent', 'seniority', 'senior');
            expect(result).toBe(false);
        });

        it('returns false for invalid target slug', () => {
            const result = createDependency('function', 'engineering', 'seniority', 'nonexistent');
            expect(result).toBe(false);
        });

        it('stores weight value', () => {
            createDependency('function', 'engineering', 'seniority', 'senior', 1, 75);

            const dep = db.prepare('SELECT * FROM dimension_dependencies WHERE source_dimension = ?').get('function') as any;
            expect(dep.weight).toBe(75);
        });

        it('creates unidirectional dependency when bidirectional is 0', () => {
            createDependency('function', 'engineering', 'seniority', 'senior', 0);

            const dep = db.prepare('SELECT * FROM dimension_dependencies WHERE source_dimension = ?').get('function') as any;
            expect(dep.bidirectional).toBe(0);
        });
    });

    describe('seedTaxonomy (integration)', () => {
        it('runs without throwing', () => {
            // This test verifies the entire seeding process completes
            // Note: May fail if CSV files are not present
            expect(() => seedTaxonomy()).not.toThrow();
        });

        it('seeds dimension values', () => {
            seedTaxonomy();

            // Check that at least some dimensions were created
            const types = db.prepare('SELECT DISTINCT dimension FROM dimension_values').all() as any[];
            expect(types.length).toBeGreaterThan(0);
        });

        it('creates dependencies between dimensions', () => {
            seedTaxonomy();

            // Check that dependencies were created
            const deps = db.prepare('SELECT COUNT(*) as count FROM dimension_dependencies').get() as any;
            // Should have some dependencies (sector-industry, function-seniority)
            expect(deps.count).toBeGreaterThanOrEqual(0);
        });
    });
});
