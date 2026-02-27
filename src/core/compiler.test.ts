import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db.js';
import { createRecord } from './records.js';
import { createRelationship } from './records.js'; // createRelationship is re-exported from records.js
import { derivePage } from './compiler.js';
import { Factory } from '../testing/factories.js';
import { randomUUID } from 'crypto';

const DEFAULT_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

function seedEntity(type: string, slug: string, name: string, data: Record<string, any> = {}) {
  // Use Factory to ensure consistent structure
  const input = Factory.createRecordInput({
      type: type as any,
      slug,
      name,
      data: data as any, // Factory will add default fieldGroups if missing in data? No, Factory.createRecordInput uses ...overrides.
      // But we pass data in overrides.
      // If data is {}, factory uses it.
      // createRecord adds fieldGroups.
      account_id: DEFAULT_ACCOUNT_ID
  });
  return createRecord(input);
}

async function relate(fromId: string, toId: string, type: string) {
  return await createRelationship({ from_record_id: fromId, to_record_id: toId, relationship_type: type });
}

describe('Core: Compiler (derivePage)', () => {
  beforeEach(async () => {
    try {
        db.pragma('foreign_keys = OFF');
        // create table if not exists for testing (needed for segment filtering)
        db.prepare(`
          CREATE TABLE IF NOT EXISTS entity_targeting (
            entity_id TEXT NOT NULL,
            dimension TEXT NOT NULL,
            slug TEXT NOT NULL,
            persona TEXT NOT NULL,
            UNIQUE(entity_id, dimension, slug, persona)
          )
        `).run();

        db.prepare('DELETE FROM entity_targeting').run();
        db.prepare('DELETE FROM record_relationships').run();
        db.prepare('DELETE FROM records').run();
        db.prepare('DELETE FROM page_templates').run();
        // db.prepare('DELETE FROM accounts').run(); // Removed
        db.pragma('foreign_keys = ON');

         // Seed Account
         await createRecord({
             id: DEFAULT_ACCOUNT_ID,
             type: 'account',
             slug: 'system-account',
             name: 'System',
             account_id: 'system',
             data: { 
                 account_class: 'business', 
                 type: 'client',
                 fieldGroups: [] 
             }
         });
    } catch (e) {
        console.warn('DB Cleanup failed:', e);
    }
  });

  // --- Basic derivation ---

  it('should return null for non-existent entity', () => {
    expect(derivePage('does-not-exist')).toBeNull();
  });

  it('should derive a page for a standalone entity with no relationships', async () => {
    await seedEntity('product', 'my-product', 'My Product', {
      headline: 'Hello'
    });

    const page = derivePage('my-product');
    expect(page).not.toBeNull();
    expect(page!.entitySlug).toBe('my-product');
    expect(page!.ObjectType).toBe('product');
    expect(page!.entityName).toBe('My Product');
    expect(page!.route).toBe('/products/my-product');

    // Should have exactly one section: self-hero
    expect(page!.sections).toHaveLength(1);
    const hero = page!.sections[0];
    expect(hero.id).toBe('self-hero');
    expect(hero.binding.kind).toBe('self');
    expect(hero.placement.slot).toBe('start');
    expect(hero.entities).toHaveLength(1);
    expect(hero.entities[0].data.headline).toBe('Hello');

    expect(page!.segmentPages).toHaveLength(0);
  });

  // --- Auto-derived sections from relationships ---

  it('should auto-derive related sections from relationships', async () => {
    const product = await seedEntity('product', 'prod-1', 'Product 1');
    const feat1 = await seedEntity('feature', 'feat-1', 'Feature 1');
    const feat2 = await seedEntity('feature', 'feat-2', 'Feature 2');
    await relate(product.id, feat1.id, 'has_feature');
    await relate(product.id, feat2.id, 'has_feature');

    const page = derivePage('prod-1')!;
    expect(page.sections).toHaveLength(2); // self-hero + related-has_feature

    const relatedSection = page.sections[1];
    expect(relatedSection.id).toBe('related-has_feature');
    expect(relatedSection.binding.kind).toBe('related');
    expect(relatedSection.binding.target).toBe('feature');
    expect(relatedSection.binding.cardinality).toBe('many');
    expect(relatedSection.binding.relationKey).toBe('has_feature');
    expect(relatedSection.entities).toHaveLength(2);
    expect(relatedSection.entities.map(e => e.slug).sort()).toEqual(['feat-1', 'feat-2']);
  });

  it('should set cardinality to "one" when only a single related entity', async () => {
    const product = await seedEntity('product', 'prod-1', 'Product 1');
    const solution = await seedEntity('solution', 'sol-1', 'Solution 1');
    await relate(product.id, solution.id, 'solves_with');

    const page = derivePage('prod-1')!;
    const relatedSection = page.sections[1];
    expect(relatedSection.binding.cardinality).toBe('one');
    expect(relatedSection.entities).toHaveLength(1);
  });

  it('should generate sections for multiple relationship types', async () => {
    const product = await seedEntity('product', 'prod-1', 'Product 1');
    const feat = await seedEntity('feature', 'feat-1', 'Feature 1');
    const sol = await seedEntity('solution', 'sol-1', 'Solution 1');
    await relate(product.id, feat.id, 'has_feature');
    await relate(product.id, sol.id, 'solves_with');

    const page = derivePage('prod-1')!;
    expect(page.sections).toHaveLength(3); // self + 2 related
    expect(page.sections.map(s => s.id)).toEqual([
      'self-hero',
      'related-has_feature',
      'related-solves_with',
    ]);
  });

  // --- Route generation ---

  it('should pluralize entity types correctly in routes', async () => {
    await seedEntity('brand', 'acme', 'Acme');
    expect(derivePage('acme')!.route).toBe('/brands/acme');

    await seedEntity('useCase', 'healthcare', 'Healthcare');
    expect(derivePage('healthcare')!.route).toBe('/use-cases/healthcare');

    await seedEntity('persona', 'cmo', 'CMO');
    expect(derivePage('cmo')!.route).toBe('/personas/cmo');
  });

  // --- Segment pages ---

  it('should generate segment pages from used_in relationships', async () => {
    const product = await seedEntity('product', 'prod-1', 'Product 1');
    const uc1 = await seedEntity('useCase', 'healthcare', 'Healthcare');
    const uc2 = await seedEntity('useCase', 'finance', 'Finance');
    await relate(product.id, uc1.id, 'used_in');
    await relate(product.id, uc2.id, 'used_in');

    const page = derivePage('prod-1')!;
    expect(page.segmentPages).toHaveLength(2);
    expect(page.segmentPages.map(sp => sp.segment).sort()).toEqual(['finance', 'healthcare']);
    expect(page.segmentPages[0].path).toContain('/products/prod-1/');
    expect(page.segmentPages[0].entity).toBe(product.id);
  });

  // --- Segment filtering ---

  it('should filter related entities by segment', async () => {
    const product = await seedEntity('product', 'prod-1', 'Product 1');
    const uc = await seedEntity('useCase', 'healthcare', 'Healthcare');
    const feat1 = await seedEntity('feature', 'feat-health', 'Health Feature');
    const feat2 = await seedEntity('feature', 'feat-generic', 'Generic Feature');

    await relate(product.id, feat1.id, 'has_feature');
    await relate(product.id, feat2.id, 'has_feature');
    await relate(product.id, uc.id, 'used_in');
    // feat1 is also related to the healthcare use case
    await relate(feat1.id, uc.id, 'used_in');
    // feat2 is NOT related to healthcare

    const page = derivePage('prod-1', 'healthcare')!;
    const featureSection = page.sections.find(s => s.id === 'related-has_feature');
    expect(featureSection).toBeDefined();
    // Only feat1 should remain (it has a relationship to the healthcare use case)
    expect(featureSection!.entities).toHaveLength(1);
    expect(featureSection!.entities[0].slug).toBe('feat-health');
  });

  it('should drop related sections entirely if segment filters all entities out', async () => {
    const product = await seedEntity('product', 'prod-1', 'Product 1');
    const uc = await seedEntity('useCase', 'healthcare', 'Healthcare');
    const feat = await seedEntity('feature', 'feat-generic', 'Generic Feature');

    await relate(product.id, feat.id, 'has_feature');
    await relate(product.id, uc.id, 'used_in');
    // feat is NOT related to healthcare

    const page = derivePage('prod-1', 'healthcare')!;
    // self-hero + used_in section, but has_feature section should be absent
    const featureSection = page.sections.find(s => s.id === 'related-has_feature');
    expect(featureSection).toBeUndefined();
  });

  // --- Template-driven sections ---

  it('should use page template sections when a template exists', async () => {
    const product = await seedEntity('product', 'prod-1', 'Product 1');
    const feat = await seedEntity('feature', 'feat-1', 'Feature 1');
    await relate(product.id, feat.id, 'has_feature');

    // Insert a page template for product type
    const now = new Date().toISOString();
    db.prepare(`
        INSERT INTO page_templates (id, key, name, subject_target, subject_cardinality, sections, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        randomUUID(), 'product-detail', 'Product Detail', 'product', 'one',
        JSON.stringify([
        { id: 'hero', binding: { kind: 'self' }, presentationKey: 'hero-v1', placement: { slot: 'start', order: 0 } },
        { id: 'features', binding: { kind: 'related', target: 'feature', cardinality: 'many', relationKey: 'has_feature' }, presentationKey: 'grid-v1', placement: { slot: 'free', order: 1 } },
        ]),
        now, now
    );

    const page = derivePage('prod-1')!;
    expect(page.sections).toHaveLength(2);

    expect(page.sections[0].id).toBe('hero');
    expect(page.sections[0].presentationKey).toBe('hero-v1');
    expect(page.sections[0].entities[0].slug).toBe('prod-1');

    expect(page.sections[1].id).toBe('features');
    expect(page.sections[1].presentationKey).toBe('grid-v1');
    expect(page.sections[1].entities).toHaveLength(1);
    expect(page.sections[1].entities[0].slug).toBe('feat-1');
  });

  it('should resolve template binding by target type when no relationKey', async () => {
    const product = await seedEntity('product', 'prod-1', 'Product 1');
    const sol = await seedEntity('solution', 'sol-1', 'Solution 1');
    await relate(product.id, sol.id, 'solves_with');

    const now = new Date().toISOString();
    db.prepare(`
        INSERT INTO page_templates (id, key, name, subject_target, subject_cardinality, sections, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        randomUUID(), 'product-detail', 'Product Detail', 'product', 'one',
        JSON.stringify([
        { id: 'solutions', binding: { kind: 'related', target: 'solution', cardinality: 'many' }, placement: { slot: 'free', order: 0 } },
        ]),
        now, now
    );

    const page = derivePage('prod-1')!;
    expect(page.sections[0].entities).toHaveLength(1);
    expect(page.sections[0].entities[0].slug).toBe('sol-1');
  });

  it('should apply cardinality:one to template bindings', async () => {
    const product = await seedEntity('product', 'prod-1', 'Product 1');
    const sol1 = await seedEntity('solution', 'sol-1', 'Solution 1');
    const sol2 = await seedEntity('solution', 'sol-2', 'Solution 2');
    await relate(product.id, sol1.id, 'solves_with');
    await relate(product.id, sol2.id, 'solves_with');

    const now = new Date().toISOString();
    db.prepare(`
        INSERT INTO page_templates (id, key, name, subject_target, subject_cardinality, sections, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        randomUUID(), 'product-detail', 'Product Detail', 'product', 'one',
        JSON.stringify([
        { id: 'featured-solution', binding: { kind: 'related', target: 'solution', cardinality: 'one' }, placement: { slot: 'free', order: 0 } },
        ]),
        now, now
    );

    const page = derivePage('prod-1')!;
    // cardinality:one should limit to first match
    expect(page.sections[0].entities).toHaveLength(1);
  });

  // --- Data flattening ---

  it('should flatten fieldGroups data in derived entities', async () => {
    await seedEntity('product', 'prod-1', 'Product 1', {
        // Mock RecordStruct for Reader.project
        idRecord: 'rec-1',
        objectStruct: {
            fieldGroupStructs: [
                {
                    nameFieldGroup: 'Hero',
                    fieldStructs: [
                        { nameField: 'headline', inputType: 'text', propertyStructs: [{ valueProperty: 'Big Title' }] },
                        { nameField: 'subheadline', inputType: 'text', propertyStructs: [{ valueProperty: 'Subtitle' }] }
                    ]
                },
                {
                    nameFieldGroup: 'Details',
                    fieldStructs: [
                        { nameField: 'price', inputType: 'number', propertyStructs: [{ valueProperty: 99 }] }
                    ]
                }
            ]
        }
    });

    const page = derivePage('prod-1')!;
    const data = page.sections[0].entities[0].data;
    expect(data.headline).toBe('Big Title');
    expect(data.subheadline).toBe('Subtitle');
    expect(data.price).toBe(99);
  });

  it('should return empty data object when entity has no fieldGroups', async () => {
    await seedEntity('product', 'prod-1', 'Product 1', {});

    const page = derivePage('prod-1')!;
    expect(page.sections[0].entities[0].data).toEqual({});
  });
});

