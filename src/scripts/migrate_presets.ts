#!/usr/bin/env npx tsx
/**
 * Migrate Presets Script
 *
 * Imports presentation presets from the legacy webbuilder into VIv5's database.
 * Also seeds the channel and medium dimension values for asset attribution.
 */

import { db, initDb } from '../core/db.js';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
initDb();

// ============================================================================
// Legacy Preset Definitions (from legacy webbuilder presets/registry.ts)
// ============================================================================

const LEGACY_PRESETS = [
  {
    key: 'self.hero.v1',
    name: 'Hero Section',
    signature: { kind: 'self' },
    config: {
      height: { value: 100, endValue: null, isLinked: false },
      pinHeight: 100,
      className: 'bg-[#1A1A1B]',
      children: [
        {
          id: 'hero-tetra-1',
          shape: 'tetrahedron',
          scale: { value: 1.2, endValue: null, isLinked: false },
          rotateY: { value: 0, endValue: 360, isLinked: true },
          hueShift: { value: 0, endValue: null, isLinked: false },
          glow: { value: 0.5, endValue: null, isLinked: false },
          bloom: { value: 0.3, endValue: null, isLinked: false },
        },
        {
          id: 'hero-tile',
          shape: 'tile',
          tileHeading: 'Brand Name',
          tileSubtitle: 'Brand Description',
          tileAlign: 'center',
        },
      ],
    },
  },
  {
    key: 'related.useCase.many.grid.v1',
    name: 'Use Cases Grid',
    signature: { kind: 'related', target: 'useCase', cardinality: 'many' },
    config: {
      height: { value: 80, endValue: null, isLinked: false },
      pinHeight: 80,
      children: [
        {
          id: 'header-tile',
          shape: 'tile',
          tileHeading: 'Use Cases',
          tileSubtitle: 'Explore how our solutions solve your problems',
        },
        {
          id: 'usecase-list',
          shape: 'list',
          listLayout: 'grid',
          listColumns: { value: 4, endValue: null, isLinked: false },
          listGap: { value: 16, endValue: null, isLinked: false },
          listTemplate: {
            shape: 'tile',
            leadingPlacement: 'left',
            leadingKind: 'icon',
          },
          listItems: [],
        },
      ],
    },
  },
  {
    key: 'related.product.many.marquee.v1',
    name: 'Products Marquee',
    signature: { kind: 'related', target: 'product', cardinality: 'many' },
    config: {
      height: { value: 70, endValue: null, isLinked: false },
      pinHeight: 70,
      children: [
        {
          id: 'product-list',
          shape: 'list',
          listLayout: 'marquee',
          listSpeed: { value: 1, endValue: null, isLinked: false },
          marqueeHoverPause: true,
          itemBaseGrayscale: { value: 0.8, endValue: null, isLinked: false },
          itemHoverGrayscale: { value: 0, endValue: null, isLinked: false },
          itemHoverScale: { value: 1.05, endValue: null, isLinked: false },
          renderPolicy: { virtualization: 'window', maxItems: 20 },
          listTemplate: {
            shape: 'card',
            cardWidth: { value: 400, endValue: null, isLinked: false },
            cardHeight: { value: 560, endValue: null, isLinked: false },
            cardElevation: { value: 2, endValue: null, isLinked: false },
          },
          listItems: [],
        },
      ],
    },
  },
  {
    key: 'related.feature.many.grid.v1',
    name: 'Features Grid',
    signature: { kind: 'related', target: 'feature', cardinality: 'many' },
    config: {
      height: { value: 80, endValue: null, isLinked: false },
      pinHeight: 80,
      children: [
        {
          id: 'header-tile',
          shape: 'tile',
          tileHeading: 'Features',
        },
        {
          id: 'feature-list',
          shape: 'list',
          listLayout: 'grid',
          listColumns: { value: 2, endValue: null, isLinked: false },
          listGap: { value: 24, endValue: null, isLinked: false },
          listCount: { value: 4, endValue: null, isLinked: false },
          listTemplate: {
            shape: 'card',
            cardMediaHeight: { value: 360, endValue: null, isLinked: false },
          },
          listItems: [],
        },
      ],
    },
  },
  {
    key: 'related.solution.many.grid.v1',
    name: 'Solutions Grid',
    signature: { kind: 'related', target: 'solution', cardinality: 'many' },
    config: {
      height: { value: 80, endValue: null, isLinked: false },
      pinHeight: 80,
      children: [
        {
          id: 'header-tile',
          shape: 'tile',
          tileHeading: 'Solutions',
          tileLabel: 'Our Services',
          tileSubtitle: 'Comprehensive solutions for your business',
        },
        {
          id: 'solution-list',
          shape: 'list',
          listLayout: 'grid',
          listColumns: { value: 3, endValue: null, isLinked: false },
          listGap: { value: 24, endValue: null, isLinked: false },
          listTemplate: {
            shape: 'card',
            leadingPlacement: 'above',
            leadingKind: 'icon',
            cardRadius: '32px',
            cardElevation: { value: 2, endValue: null, isLinked: false },
          },
          listItems: [],
        },
      ],
    },
  },
  {
    key: 'self.cta.v1',
    name: 'Call to Action',
    signature: { kind: 'self' },
    config: {
      height: { value: 60, endValue: null, isLinked: false },
      pinHeight: 60,
      className: 'bg-black',
      children: [
        {
          id: 'cta-sphere-1',
          shape: 'sphere',
          scale: { value: 0.8, endValue: null, isLinked: false },
          glow: { value: 0.6, endValue: null, isLinked: false },
          bloom: { value: 0.4, endValue: null, isLinked: false },
          offsetX: { value: -30, endValue: null, isLinked: false },
        },
        {
          id: 'cta-sphere-2',
          shape: 'sphere',
          scale: { value: 0.6, endValue: null, isLinked: false },
          glow: { value: 0.4, endValue: null, isLinked: false },
          bloom: { value: 0.3, endValue: null, isLinked: false },
          offsetX: { value: 30, endValue: null, isLinked: false },
        },
        {
          id: 'cta-tile',
          shape: 'tile',
          tileHeading: 'Ready to Get Started?',
          tileSubtitle: 'Contact us today',
          tileAlign: 'center',
        },
        {
          id: 'cta-button',
          shape: 'card',
          cardWidth: { value: 200, endValue: null, isLinked: false },
          cardHeight: { value: 50, endValue: null, isLinked: false },
          cardRadius: '25px',
          cardBackground: '#ffffff',
        },
      ],
    },
  },
  {
    key: 'section.generic.v1',
    name: 'Generic Section',
    signature: { kind: 'self' },
    config: {
      height: { value: 50, endValue: null, isLinked: false },
      pinHeight: 50,
      children: [
        {
          id: 'generic-shape',
          shape: 'tetrahedron',
          animationType: 'rotate',
          scale: { value: 1, endValue: null, isLinked: false },
        },
      ],
    },
  },
];

// ============================================================================
// Asset Attribution Dimension Values
// ============================================================================

const DIMENSION_VALUES = [
  // Channel dimension
  { dimension: 'channel', slug: 'website', label: 'Website' },
  { dimension: 'channel', slug: 'social', label: 'Social' },
  { dimension: 'channel', slug: 'display', label: 'Display' },
  { dimension: 'channel', slug: 'search', label: 'Search' },
  { dimension: 'channel', slug: 'email', label: 'Email' },
  { dimension: 'channel', slug: 'call', label: 'Call' },
  { dimension: 'channel', slug: 'event', label: 'Event' },

  // Medium dimension
  { dimension: 'medium', slug: 'page', label: 'Page' },
  { dimension: 'medium', slug: 'article', label: 'Article' },
  { dimension: 'medium', slug: 'video', label: 'Video' },
  { dimension: 'medium', slug: 'post', label: 'Post' },
  { dimension: 'medium', slug: 'document', label: 'Document' },
  { dimension: 'medium', slug: 'dynamic_ad', label: 'Dynamic Ad' },
  { dimension: 'medium', slug: 'message', label: 'Message' },

  // Referral Type dimension
  { dimension: 'referral_type', slug: 'organic', label: 'Organic' },
  { dimension: 'referral_type', slug: 'paid', label: 'Paid' },
];

// ============================================================================
// Page Templates
// ============================================================================

const PAGE_TEMPLATES = [
  {
    key: 'product-detail',
    name: 'Product Detail Page',
    description: 'Standard product detail page with hero, features, and CTA',
    domain_type: null, // Generic - works for all domains
    subject_target: 'product',
    subject_cardinality: 'one',
    sections: [
      {
        id: 'hero',
        schemaVersion: 1,
        placement: { slot: 'start', order: 0 },
        binding: { kind: 'self' },
        presentationKey: 'self.hero.v1',
      },
      {
        id: 'features',
        schemaVersion: 1,
        placement: { slot: 'free', order: 1 },
        binding: { kind: 'related', target: 'feature', cardinality: 'many' },
        presentationKey: 'related.feature.many.grid.v1',
      },
      {
        id: 'cta',
        schemaVersion: 1,
        placement: { slot: 'end', order: 2 },
        binding: { kind: 'self' },
        presentationKey: 'self.cta.v1',
      },
    ],
  },
  {
    key: 'solution-detail',
    name: 'Solution Detail Page',
    description: 'Solution landing page with use cases and related products',
    domain_type: null,
    subject_target: 'solution',
    subject_cardinality: 'one',
    sections: [
      {
        id: 'hero',
        schemaVersion: 1,
        placement: { slot: 'start', order: 0 },
        binding: { kind: 'self' },
        presentationKey: 'self.hero.v1',
      },
      {
        id: 'use-cases',
        schemaVersion: 1,
        placement: { slot: 'free', order: 1 },
        binding: { kind: 'related', target: 'useCase', cardinality: 'many' },
        presentationKey: 'related.useCase.many.grid.v1',
      },
      {
        id: 'products',
        schemaVersion: 1,
        placement: { slot: 'free', order: 2 },
        binding: { kind: 'related', target: 'product', cardinality: 'many' },
        presentationKey: 'related.product.many.marquee.v1',
      },
      {
        id: 'cta',
        schemaVersion: 1,
        placement: { slot: 'end', order: 3 },
        binding: { kind: 'self' },
        presentationKey: 'self.cta.v1',
      },
    ],
  },
  {
    key: 'brand-home',
    name: 'Brand Home Page',
    description: 'Main landing page showcasing brand, solutions, and products',
    domain_type: null,
    subject_target: 'brand',
    subject_cardinality: 'one',
    sections: [
      {
        id: 'hero',
        schemaVersion: 1,
        placement: { slot: 'start', order: 0 },
        binding: { kind: 'self' },
        presentationKey: 'self.hero.v1',
      },
      {
        id: 'solutions',
        schemaVersion: 1,
        placement: { slot: 'free', order: 1 },
        binding: { kind: 'related', target: 'solution', cardinality: 'many' },
        presentationKey: 'related.solution.many.grid.v1',
      },
      {
        id: 'products',
        schemaVersion: 1,
        placement: { slot: 'free', order: 2 },
        binding: { kind: 'related', target: 'product', cardinality: 'many' },
        presentationKey: 'related.product.many.marquee.v1',
      },
      {
        id: 'cta',
        schemaVersion: 1,
        placement: { slot: 'end', order: 3 },
        binding: { kind: 'self' },
        presentationKey: 'self.cta.v1',
      },
    ],
  },
  {
    key: 'feature-detail',
    name: 'Feature Detail Page',
    description: 'Feature showcase page',
    domain_type: null,
    subject_target: 'feature',
    subject_cardinality: 'one',
    sections: [
      {
        id: 'hero',
        schemaVersion: 1,
        placement: { slot: 'start', order: 0 },
        binding: { kind: 'self' },
        presentationKey: 'self.hero.v1',
      },
      {
        id: 'cta',
        schemaVersion: 1,
        placement: { slot: 'end', order: 1 },
        binding: { kind: 'self' },
        presentationKey: 'self.cta.v1',
      },
    ],
  },
];

// ============================================================================
// Migration Functions
// ============================================================================

function migratePresets(): void {
  console.log('Migrating presentation presets...');

  const insertStmt = db.prepare(`
    INSERT INTO presentation_presets (id, key, name, signature, config, version, account_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, NULL, datetime('now'), datetime('now'))
    ON CONFLICT(key) DO UPDATE SET
      name = excluded.name,
      signature = excluded.signature,
      config = excluded.config,
      version = presentation_presets.version + 1,
      updated_at = datetime('now')
  `);

  let count = 0;
  for (const preset of LEGACY_PRESETS) {
    try {
      insertStmt.run(
        uuid(),
        preset.key,
        preset.name,
        JSON.stringify(preset.signature),
        JSON.stringify(preset.config)
      );
      console.log(`  - ${preset.key}`);
      count++;
    } catch (err) {
      console.warn(`  ! Failed to insert ${preset.key}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`Migrated ${count} presets.`);
}

function seedDimensionValues(): void {
  console.log('Seeding asset attribution dimension values...');

  const insertStmt = db.prepare(`
    INSERT INTO dimension_values (id, dimension, slug, label, parent_id, metadata, source, account_id, created_at, updated_at)
    VALUES (@id, @dimension, @slug, @label, NULL, '{}', 'seed_script', NULL, datetime('now'), datetime('now'))
    ON CONFLICT(dimension, slug, account_id) DO UPDATE SET
      label = excluded.label,
      updated_at = datetime('now')
  `);

  let count = 0;
  for (const value of DIMENSION_VALUES) {
    try {
      insertStmt.run({
        id: uuid(),
        dimension: value.dimension,
        slug: value.slug,
        label: value.label,
      });
      console.log(`  - ${value.dimension}:${value.slug}`);
      count++;
    } catch (err) {
      console.warn(`  ! Failed to insert ${value.dimension}:${value.slug}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`Seeded ${count} dimension values.`);
}

function seedPageTemplates(): void {
  console.log('Seeding page templates...');

  const insertStmt = db.prepare(`
    INSERT INTO page_templates (id, key, name, description, domain_type, subject_target, subject_cardinality, sections, content_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(key) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      domain_type = excluded.domain_type,
      subject_target = excluded.subject_target,
      subject_cardinality = excluded.subject_cardinality,
      sections = excluded.sections,
      content_hash = excluded.content_hash,
      updated_at = datetime('now')
  `);

  let count = 0;
  for (const template of PAGE_TEMPLATES) {
    try {
      const sectionsJson = JSON.stringify(template.sections);
      const contentHash = crypto.createHash('md5').update(sectionsJson).digest('hex');

      insertStmt.run(
        uuid(),
        template.key,
        template.name,
        template.description,
        template.domain_type,
        template.subject_target,
        template.subject_cardinality,
        sectionsJson,
        contentHash
      );
      console.log(`  - ${template.key} (${template.subject_target})`);
      count++;
    } catch (err) {
      console.warn(`  ! Failed to insert ${template.key}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`Seeded ${count} page templates.`);
}

// ============================================================================
// Main
// ============================================================================

function main(): void {
  console.log('='.repeat(60));
  console.log('Webbuilder Integration Migration');
  console.log('='.repeat(60));

  try {
    migratePresets();
    console.log('');
    seedDimensionValues();
    console.log('');
    seedPageTemplates();
    console.log('');
    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
