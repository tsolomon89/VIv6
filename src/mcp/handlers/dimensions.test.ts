/**
 * Unit tests for MCP Dimension Tool Handlers
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { db, resetDb } from '../../core/db.js';
import {
  listDimensionTypes,
  listDimensionValues,
  listDimensionDependencies,
  getTargetingSuggestions
} from './dimensions.js';

describe('MCP Dimension Tool Handlers', () => {
  beforeEach(() => {
    resetDb();
  });

  // ==========================================================================
  // listDimensionTypes
  // ==========================================================================
  describe('listDimensionTypes', () => {
    it('returns empty array when no dimensions exist', () => {
      const result = listDimensionTypes();
      expect(result.count).toBe(0);
      expect(result.types).toEqual([]);
    });

    it('returns dimension types with counts', () => {
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
        .run('d1', 'sector', 'tech', 'Technology');
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
        .run('d2', 'sector', 'finance', 'Finance');
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
        .run('d3', 'industry', 'software', 'Software');

      const result = listDimensionTypes();
      expect(result.count).toBe(2);
      expect(result.types).toContainEqual({ dimension: 'sector', count: 2 });
      expect(result.types).toContainEqual({ dimension: 'industry', count: 1 });
    });

    it('orders results alphabetically by dimension', () => {
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
        .run('d1', 'zoo', 'animal', 'Animal');
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
        .run('d2', 'alpha', 'first', 'First');

      const result = listDimensionTypes();
      expect(result.types[0].dimension).toBe('alpha');
      expect(result.types[1].dimension).toBe('zoo');
    });
  });

  // ==========================================================================
  // listDimensionValues
  // ==========================================================================
  describe('listDimensionValues', () => {
    beforeEach(() => {
      // Seed test data with NULL account_id (global dimensions)
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, account_id) VALUES (?, ?, ?, ?, ?)')
        .run('s1', 'sector', 'technology', 'Technology', null);
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, account_id) VALUES (?, ?, ?, ?, ?)')
        .run('i1', 'industry', 'software', 'Software', null);
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, account_id) VALUES (?, ?, ?, ?, ?)')
        .run('i2', 'industry', 'hardware', 'Hardware', null);
    });

    it('returns all values for a dimension', () => {
      const result = listDimensionValues({ dimension: 'industry' });
      expect(result.dimension).toBe('industry');
      expect(result.count).toBe(2);
      expect(result.filtered).toBe(false);
      expect(result.values).toHaveLength(2);
    });

    it('returns empty array for unknown dimension', () => {
      const result = listDimensionValues({ dimension: 'nonexistent' });
      expect(result.count).toBe(0);
      expect(result.values).toEqual([]);
    });

    it('filters by parent_id', () => {
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, parent_id, account_id) VALUES (?, ?, ?, ?, ?, ?)')
        .run('c1', 'city', 'nyc', 'New York', 's1', null);
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, parent_id, account_id) VALUES (?, ?, ?, ?, ?, ?)')
        .run('c2', 'city', 'la', 'Los Angeles', 's1', null);
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, parent_id, account_id) VALUES (?, ?, ?, ?, ?, ?)')
        .run('c3', 'city', 'london', 'London', 'i1', null);

      const result = listDimensionValues({ dimension: 'city', parent_id: 's1' });
      expect(result.count).toBe(2);
      expect(result.values.map(v => v.slug)).toContain('nyc');
      expect(result.values.map(v => v.slug)).toContain('la');
    });

    it('filters by dependency', () => {
      // Add dependency: technology -> software
      db.prepare('INSERT INTO dimension_dependencies (id, source_dimension, source_value_id, target_dimension, target_value_id, bidirectional, account_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run('dep1', 'sector', 's1', 'industry', 'i1', 1, null);

      const result = listDimensionValues({
        dimension: 'industry',
        filter: { sector: 'technology' }
      });
      expect(result.filtered).toBe(true);
      expect(result.count).toBe(1);
      expect(result.values[0].slug).toBe('software');
    });

    it('handles bidirectional filter (reverse lookup)', () => {
      db.prepare('INSERT INTO dimension_dependencies (id, source_dimension, source_value_id, target_dimension, target_value_id, bidirectional, account_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run('dep1', 'sector', 's1', 'industry', 'i1', 1, null);

      const result = listDimensionValues({
        dimension: 'sector',
        filter: { industry: 'software' }
      });
      expect(result.count).toBe(1);
      expect(result.values[0].slug).toBe('technology');
    });

    it('parses JSON metadata', () => {
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, metadata, account_id) VALUES (?, ?, ?, ?, ?, ?)')
        .run('sz1', 'company_size', 'small', '1-50 employees', JSON.stringify({ range_start: 1, range_end: 50 }), null);

      const result = listDimensionValues({ dimension: 'company_size' });
      expect(result.values[0].metadata).toEqual({ range_start: 1, range_end: 50 });
    });

    it('excludes tenant-specific dimensions (non-null account_id)', () => {
      // Create a valid account first to satisfy FK constraint
      const accountId = '11111111-1111-1111-1111-111111111111';
      db.prepare('INSERT INTO records (id, slug, name, type, account_id, data) VALUES (?, ?, ?, ?, ?, ?)')
        .run(accountId, 'test-tenant', 'Test Tenant', 'account', accountId, '{}');

      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, account_id) VALUES (?, ?, ?, ?, ?)')
        .run('t1', 'sector', 'tenant_only', 'Tenant Only', accountId);

      const result = listDimensionValues({ dimension: 'sector' });
      expect(result.values.map(v => v.slug)).not.toContain('tenant_only');
    });

    it('handles default metadata gracefully', () => {
      const result = listDimensionValues({ dimension: 'sector' });
      // SQLite schema has DEFAULT '{}' for metadata, so it's an empty object
      expect(result.values[0].metadata).toEqual({});
    });
  });

  // ==========================================================================
  // listDimensionDependencies
  // ==========================================================================
  describe('listDimensionDependencies', () => {
    beforeEach(() => {
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
        .run('v1', 'sector', 'tech', 'Technology');
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
        .run('v2', 'industry', 'software', 'Software');
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
        .run('v3', 'function', 'engineering', 'Engineering');
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
        .run('v4', 'seniority', 'senior', 'Senior');
      db.prepare('INSERT INTO dimension_dependencies (id, source_dimension, source_value_id, target_dimension, target_value_id) VALUES (?, ?, ?, ?, ?)')
        .run('dep1', 'sector', 'v1', 'industry', 'v2');
      db.prepare('INSERT INTO dimension_dependencies (id, source_dimension, source_value_id, target_dimension, target_value_id) VALUES (?, ?, ?, ?, ?)')
        .run('dep2', 'function', 'v3', 'seniority', 'v4');
    });

    it('lists all dependencies', () => {
      const result = listDimensionDependencies({});
      expect(result.count).toBe(2);
      expect(result.dependencies).toHaveLength(2);
    });

    it('includes source and target slugs/labels', () => {
      const result = listDimensionDependencies({});
      const dep = result.dependencies.find(d => d.id === 'dep1');
      expect(dep).toBeDefined();
      expect(dep!.source_slug).toBe('tech');
      expect(dep!.source_label).toBe('Technology');
      expect(dep!.target_slug).toBe('software');
      expect(dep!.target_label).toBe('Software');
    });

    it('filters by source_dimension', () => {
      const result = listDimensionDependencies({ source_dimension: 'sector' });
      expect(result.count).toBe(1);
      expect(result.dependencies[0].source_dimension).toBe('sector');
    });

    it('filters by target_dimension', () => {
      const result = listDimensionDependencies({ target_dimension: 'industry' });
      expect(result.count).toBe(1);
      expect(result.dependencies[0].target_dimension).toBe('industry');
    });

    it('filters by both source and target', () => {
      const result = listDimensionDependencies({
        source_dimension: 'sector',
        target_dimension: 'industry'
      });
      expect(result.count).toBe(1);
    });

    it('returns empty when no match', () => {
      const result = listDimensionDependencies({ source_dimension: 'nonexistent' });
      expect(result.count).toBe(0);
      expect(result.dependencies).toEqual([]);
    });

    it('limits results to 100', () => {
      // Insert many dependencies (need to insert values first)
      for (let i = 0; i < 110; i++) {
        db.prepare('INSERT INTO dimension_values (id, dimension, slug, label) VALUES (?, ?, ?, ?)')
          .run(`bulk_v${i}`, 'bulk', `slug${i}`, `Label ${i}`);
      }
      for (let i = 0; i < 105; i++) {
        db.prepare('INSERT INTO dimension_dependencies (id, source_dimension, source_value_id, target_dimension, target_value_id) VALUES (?, ?, ?, ?, ?)')
          .run(`bulk_dep${i}`, 'bulk', `bulk_v${i}`, 'bulk', `bulk_v${i + 1}`);
      }

      const result = listDimensionDependencies({ source_dimension: 'bulk' });
      expect(result.dependencies.length).toBeLessThanOrEqual(100);
    });
  });

  // ==========================================================================
  // getTargetingSuggestions
  // ==========================================================================
  describe('getTargetingSuggestions', () => {
    beforeEach(() => {
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, account_id) VALUES (?, ?, ?, ?, ?)')
        .run('d1', 'sector', 'tech', 'Technology', null);
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, account_id) VALUES (?, ?, ?, ?, ?)')
        .run('d2', 'sector', 'finance', 'Finance', null);
      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, account_id) VALUES (?, ?, ?, ?, ?)')
        .run('d3', 'industry', 'software', 'Software', null);
      db.prepare('INSERT INTO dimension_dependencies (id, source_dimension, source_value_id, target_dimension, target_value_id, account_id) VALUES (?, ?, ?, ?, ?, ?)')
        .run('dep1', 'sector', 'd1', 'industry', 'd3', null);
    });

    it('returns entity type in response', () => {
      const result = getTargetingSuggestions({ entity_type: 'persona' });
      expect(result.ObjectType).toBe('persona');
    });

    it('returns available dimensions ordered by count', () => {
      const result = getTargetingSuggestions({ entity_type: 'product' });
      expect(result.availableDimensions).toHaveLength(2);
      // sector has 2 values, industry has 1
      expect(result.availableDimensions[0].dimension).toBe('sector');
      expect(result.availableDimensions[0].count).toBe(2);
    });

    it('returns dimension relationships summary', () => {
      const result = getTargetingSuggestions({ entity_type: 'persona' });
      expect(result.dimensionRelationships).toHaveLength(1);
      expect(result.dimensionRelationships[0]).toMatchObject({
        source_dimension: 'sector',
        target_dimension: 'industry',
        link_count: 1
      });
    });

    it('includes usage tips', () => {
      const result = getTargetingSuggestions({ entity_type: 'persona' });
      expect(result.usage).toBeDefined();
      expect(result.usage.tip).toContain('list_dimension_values');
      expect(result.usage.example).toContain('dimension');
    });

    it('excludes tenant-specific dimensions', () => {
      // Create a valid account first to satisfy FK constraint
      const accountId = '22222222-2222-2222-2222-222222222222';
      db.prepare('INSERT INTO records (id, slug, name, type, account_id, data) VALUES (?, ?, ?, ?, ?, ?)')
        .run(accountId, 'test-tenant-2', 'Test Tenant 2', 'account', accountId, '{}');

      db.prepare('INSERT INTO dimension_values (id, dimension, slug, label, account_id) VALUES (?, ?, ?, ?, ?)')
        .run('t1', 'tenant_dim', 'val', 'Value', accountId);

      const result = getTargetingSuggestions({ entity_type: 'persona' });
      expect(result.availableDimensions.map(d => d.dimension)).not.toContain('tenant_dim');
    });
  });
});

