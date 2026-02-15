

import { db } from '../../core/db.js';
// Correct import paths to cross-module boundaries
import { getRecordBySlug, getRecord } from '../../core/records.js';
import { getRelationshipsFrom } from '../content/services.js';
import { DataRecord, EntityType, RecordRelationship } from '../../core/types.js';
import { Reader } from '../../contracts/Reader.js';
import { RELATIONSHIP_MAP } from '../../core/config/logic_maps.js';
import { findPageTemplateStrategy } from '../../core/strategies/page_templates.js';
import { resolveView, parseViewDefinition, executeView, ViewFilter, ViewSort } from '../ops/views.js';
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';

// --- Types ---

export type Binding = {
  kind: 'self';
} | {
  kind: 'related';
  target: EntityType;
  cardinality: 'one' | 'many';
  relationKey?: string;
  scope?: {
    filter?: ViewFilter[];
    sort?: ViewSort[];
    limit?: number;
  };
} | {
  kind: 'view';
  viewSlug: string;
  params?: Record<string, any>;
};

export interface DerivedSection {
  id: string;
  binding: { kind: string; target?: string; cardinality?: string; relationKey?: string };
  presentationKey: string | null; // Resolved from page_templates or null if auto-derived
  placement: { slot: string; order: number };
  config: Record<string, any>; // Visual configuration
  entities: Array<{ id: string; slug: string; name: string; type: string; data: Record<string, any> }>;
}

export interface DerivedRoute {
  path: string;
  entity: string;
  template: string | null;
  segment?: string;
}

export interface DerivedPage {
  entityId: string;
  entitySlug: string;
  entityType: string;
  entityName: string;
  route: string;
  sections: DerivedSection[];
  segmentPages: DerivedRoute[];
}

// --- Core derivation ---

export function derivePage(entitySlug: string, segment?: string, domainType?: string): DerivedPage | null {
  const entity = getRecordBySlug(DEFAULT_ACCOUNT_ID, entitySlug);
  if (!entity) return null;

  const relationships = getRelationshipsFrom(entity.id);
  const relsByType = groupRelationships(relationships);

  // Try to find a page template for this entity type (domain-specific first, then generic)
  const pageTemplate = findPageTemplateStrategy(entity.type, domainType);

  let sections: DerivedSection[];

  if (pageTemplate && pageTemplate.sections?.length > 0) {
    // Use explicit template sections
    sections = pageTemplate.sections.map((s: any, i: number) => {
      return resolveSection(s, i, entity, relsByType, segment);
    });
  } else {
    // Auto-derive sections from entity type and relationships
    sections = autoderiveSections(entity, relsByType, segment);
  }

  // Determine segment pages
  const segmentPages = deriveSegmentPages(entity, relsByType);

  return {
    entityId: entity.id,
    entitySlug: entity.slug,
    entityType: entity.type,
    entityName: entity.name,
    route: `/${pluralize(entity.type)}/${entity.slug}`,
    sections,
    segmentPages,
  };
}

function resolveSection(
  templateSection: any,
  index: number,
  entity: DataRecord,
  relsByType: Map<string, Array<{ rel: RecordRelationship; entity: DataRecord }>>,
  segment?: string
): DerivedSection {
  const binding = templateSection.binding || { kind: 'self' };
  const entities = resolveBindingEntities(binding, entity, relsByType, segment);

  return {
    id: templateSection.id || `section-${index}`,
    binding,
    presentationKey: templateSection.presentationKey || null,
    placement: templateSection.placement || { slot: 'free', order: index },
    config: templateSection.config || {}, 
    entities,
  };
}

function autoderiveSections(
  entity: DataRecord,
  relsByType: Map<string, Array<{ rel: RecordRelationship; entity: DataRecord }>>,
  segment?: string
): DerivedSection[] {
  const sections: DerivedSection[] = [];
  let order = 0;

  // Section 0: Self hero (includes computed derivation fields)
  sections.push({
    id: 'self-hero',
    binding: { kind: 'self' },
    presentationKey: null,
    placement: { slot: 'start', order: order++ },
    config: {}, // No hardcoded 'hero' abstraction
    entities: [{
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      type: entity.type,
      data: Reader.projectWithDerivations(entity),
    }],
  });

  // Auto-generate sections for each relationship type found
  for (const [relType, items] of relsByType) {
    const targetType = items[0]?.entity.type;
    if (!targetType) continue;

    let filtered = items;
    if (segment) {
      filtered = filterBySegment(items, segment);
    }
    if (filtered.length === 0) continue;

    sections.push({
      id: `related-${relType}`,
      binding: {
        kind: 'related',
        target: targetType,
        cardinality: filtered.length === 1 ? 'one' : 'many',
        relationKey: relType,
      },
      presentationKey: null,
      placement: { slot: 'free', order: order++ },
      config: {}, // No hardcoded 'list' abstraction
      entities: filtered.map(item => ({
        id: item.entity.id,
        slug: item.entity.slug,
        name: item.entity.name,
        type: item.entity.type,
        data: Reader.project(item.entity.data),
      })),
    });
  }

  return sections;
}

function resolveBindingEntities(
  binding: any,
  entity: DataRecord,
  relsByType: Map<string, Array<{ rel: RecordRelationship; entity: DataRecord }>>,
  segment?: string
): DerivedSection['entities'] {
  if (binding.kind === 'self') {
    // For 'self' binding, include computed derivation fields
    return [{
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      type: entity.type,
      data: Reader.projectWithDerivations(entity),
    }];
  }

  // NEW: View-based binding resolution
  if (binding.kind === 'view') {
    const viewResult = resolveView(
      entity.account_id || DEFAULT_ACCOUNT_ID,
      binding.viewSlug,
      {
        params: binding.params,
        sourceEntity: entity
      }
    );

    return viewResult.records.map(record => ({
      id: record.id,
      slug: record.slug,
      name: record.name,
      type: record.type,
      data: Reader.project(record.data),
    }));
  }

  if (binding.kind === 'related') {
    // Find matching relationships by target type or relationKey
    let items: Array<{ rel: RecordRelationship; entity: DataRecord }> = [];

    if (binding.relationKey) {
      items = relsByType.get(binding.relationKey) || [];
    } else if (binding.target) {
      // Find by target entity type
      for (const [, relItems] of relsByType) {
        const matching = relItems.filter(i => i.entity.type === binding.target);
        items.push(...matching);
      }
    }

    if (segment) {
      items = filterBySegment(items, segment);
    }

    // NEW: Apply scope filters if present
    if (binding.scope?.filter && binding.scope.filter.length > 0) {
      items = items.filter(item => {
        return binding.scope!.filter!.every((f: ViewFilter) => {
          const fieldValue = getFieldValueFromEntity(item.entity, f.field);
          return evaluateFilterCondition(fieldValue, f.op, f.value);
        });
      });
    }

    // NEW: Apply scope sorting if present
    if (binding.scope?.sort && binding.scope.sort.length > 0) {
      items = [...items].sort((a, b) => {
        for (const sort of binding.scope!.sort!) {
          const aVal = getFieldValueFromEntity(a.entity, sort.field);
          const bVal = getFieldValueFromEntity(b.entity, sort.field);

          let comparison = 0;
          if (aVal < bVal) comparison = -1;
          else if (aVal > bVal) comparison = 1;

          if (comparison !== 0) {
            return sort.direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    // NEW: Apply scope limit if present
    if (binding.scope?.limit && binding.scope.limit > 0) {
      items = items.slice(0, binding.scope.limit);
    }

    // Apply cardinality (after scope processing)
    if (binding.cardinality === 'one' && items.length > 0) {
      items = [items[0]];
    }

    return items.map(item => ({
      id: item.entity.id,
      slug: item.entity.slug,
      name: item.entity.name,
      type: item.entity.type,
      data: Reader.project(item.entity.data),
    }));
  }

  return [];
}

// Helper functions for scope-based filtering
function getFieldValueFromEntity(entity: DataRecord, fieldPath: string): any {
  // Handle top-level record fields
  if (fieldPath === 'name') return entity.name;
  if (fieldPath === 'slug') return entity.slug;
  if (fieldPath === 'type') return entity.type;
  if (fieldPath === 'created_at') return entity.created_at;
  if (fieldPath === 'updated_at') return entity.updated_at;

  // Handle data fields (flat structure)
  if (entity.data[fieldPath] !== undefined) {
    return entity.data[fieldPath];
  }

  // Handle nested paths
  const parts = fieldPath.split('.');
  let value: any = entity;
  for (const part of parts) {
    if (value === null || value === undefined) return undefined;
    value = value[part];
  }

  return value;
}

function evaluateFilterCondition(fieldValue: any, op: string, compareValue: any): boolean {
  switch (op) {
    case 'eq': return fieldValue === compareValue;
    case 'neq': return fieldValue !== compareValue;
    case 'gt': return fieldValue > compareValue;
    case 'gte': return fieldValue >= compareValue;
    case 'lt': return fieldValue < compareValue;
    case 'lte': return fieldValue <= compareValue;
    case 'contains':
      if (typeof fieldValue === 'string') {
        return fieldValue.includes(String(compareValue));
      }
      return false;
    case 'in':
      if (Array.isArray(compareValue)) {
        return compareValue.includes(fieldValue);
      }
      return false;
    case 'not_in':
      if (Array.isArray(compareValue)) {
        return !compareValue.includes(fieldValue);
      }
      return true;
    default:
      return true;
  }
}

function deriveSegmentPages(
  entity: DataRecord,
  relsByType: Map<string, Array<{ rel: RecordRelationship; entity: DataRecord }>>,
): DerivedRoute[] {
  const routes: DerivedRoute[] = [];

  // Look for useCase relationships — each use case generates a segment page
  const useCaseItems = relsByType.get('used_in') || [];
  for (const item of useCaseItems) {
    routes.push({
      path: `/${pluralize(entity.type)}/${entity.slug}/${item.entity.slug}`,
      entity: entity.id,
      template: null,
      segment: item.entity.slug,
    });
  }

  return routes;
}

// --- Helpers ---

function groupRelationships(relationships: RecordRelationship[]): Map<string, Array<{ rel: RecordRelationship; entity: DataRecord }>> {
  const map = new Map<string, Array<{ rel: RecordRelationship; entity: DataRecord }>>();

  for (const rel of relationships) {
    const target = getRecord(rel.to_record_id);
    if (!target) continue;

    if (!map.has(rel.relationship_type)) {
      map.set(rel.relationship_type, []);
    }
    map.get(rel.relationship_type)!.push({ rel, entity: target });
  }

  return map;
}

function filterBySegment(
  items: Array<{ rel: RecordRelationship; entity: DataRecord }>,
  segment: string
): Array<{ rel: RecordRelationship; entity: DataRecord }> {
  // Filter related entities that are also related to the segment's use case.
  // Look up the segment entity by slug, then check if each item has a
  // relationship to that segment entity.
  const segmentEntity = getRecordBySlug(DEFAULT_ACCOUNT_ID, segment);
  if (!segmentEntity) return items;

  return items.filter(item => {
    const itemRels = getRelationshipsFrom(item.entity.id);
    return itemRels.some(r => r.to_record_id === segmentEntity.id);
  });
}

function pluralize(type: string): string {
  const map: Record<string, string> = {
    brand: 'brands',
    product: 'products',
    feature: 'features',
    solution: 'solutions',
    useCase: 'use-cases',
    persona: 'personas',
  };
  return map[type] || type + 's';
}
