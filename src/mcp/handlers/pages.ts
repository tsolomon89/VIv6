/**
 * MCP Page Tool Handlers
 *
 * Tools for AI agents to create and manage page assets.
 */

import { v4 as uuid } from 'uuid';
import { db } from '../../core/db.js';
import { SYSTEM_ACCOUNT_ID } from '../../core/constants.js';
import { createRecord, getRecord, getRecordBySlug, updateRecord, listRecords } from '../../core/records.js';
import { createRelationship, getRelationshipsFrom } from '../../core/relationships.js';
import type { DataRecord, PageAssetData, EntityType } from '../../core/types.js';
import {
  compilePage,
  resolveBinding,
  getPreset,
  listPresets,
  listCompatiblePresets,
  type SectionInstance,
  type PageTemplate,
  type Binding,
} from '../../modules/webbuilder/index.js';

// ============================================================================
// TYPES
// ============================================================================

export interface CreatePageAssetArgs {
  template_key?: string;
  name: string;
  slug: string;
  subject_type?: string;
  subject_id?: string;
  account_id?: string;
  source?: string;
  version?: string;
}

export interface CreatePageAssetResult {
  page: DataRecord;
  subject_linked: boolean;
}

export interface ListPageAssetsArgs {
  account_id?: string;
  subject_type?: string;
}

export interface ListPageAssetsResult {
  count: number;
  pages: Array<{
    id: string;
    slug: string;
    name: string;
    subject_type: string | null;
    template_key: string | null;
    created_at: string;
  }>;
}

export interface UpdatePageSectionArgs {
  page_id: string;
  section_id: string;
  overrides: Record<string, unknown>;
}

export interface UpdatePageSectionResult {
  success: boolean;
  section: SectionInstance | null;
}

export interface AddPageSectionArgs {
  page_id: string;
  binding: Binding;
  preset_key: string;
  placement?: {
    slot: 'start' | 'end' | 'free';
    order?: number;
  };
}

export interface AddPageSectionResult {
  success: boolean;
  section: SectionInstance;
}

export interface ResolvePageBindingsArgs {
  page_id: string;
  account_id?: string;
}

export interface ResolvePageBindingsResult {
  page_id: string;
  sections: Array<{
    section_id: string;
    binding: Binding;
    resolved_count: number;
    records: Array<{ id: string; slug: string; name: string; type: string }>;
  }>;
}

export interface LinkPageToEntityArgs {
  page_id: string;
  entity_id: string;
  relationship_type?: string;
}

export interface LinkPageToEntityResult {
  success: boolean;
  relationship_type: string;
  from: string;
  to: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getPageTemplate(key: string): PageTemplate | null {
  const row = db.prepare(`
    SELECT * FROM page_templates WHERE key = ?
  `).get(key) as any;

  if (!row) return null;

  return {
    schemaVersion: 1,
    id: row.id,
    name: row.name,
    pageContext: { kind: 'detail' },
    pageSubject: {
      target: row.subject_target as any,
      cardinality: row.subject_cardinality as 'one' | 'many',
    },
    sections: JSON.parse(row.sections || '[]'),
  };
}

function isPageRecord(record: DataRecord): boolean {
  return record.type === 'page';
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * Create a page asset from a template
 */
export async function createPageAsset(args: CreatePageAssetArgs): Promise<CreatePageAssetResult> {
  const accountId = args.account_id || SYSTEM_ACCOUNT_ID;

  // Load template if provided
  let sections: SectionInstance[] = [];
  let pageSubject = { target: 'brand' as const, cardinality: 'one' as const };

  if (args.template_key) {
    const template = getPageTemplate(args.template_key);
    if (!template) {
      throw new Error(`Template not found: ${args.template_key}`);
    }
    sections = template.sections;
    pageSubject = template.pageSubject;
  }

  // Override subject type if provided
  if (args.subject_type) {
    pageSubject.target = args.subject_type as any;
  }

  // Create page record
  const pageData: PageAssetData = {
    fieldGroups: [],
    attribution: {
      channel: 'website',
      medium: 'page',
      source: args.source || 'brand.co',
      referralType: 'organic',
      version: args.version || 'V.01',
    },
    pageConfig: {
      schemaVersion: 1,
      pageContext: { kind: 'detail' },
      pageSubject,
      templateKey: args.template_key,
    },
    sections,
  };

  const record = await createRecord({
    type: 'page' as EntityType,
    name: args.name,
    slug: args.slug,
    account_id: accountId,
    data: pageData,
  });

  // Link to subject entity if provided
  let subjectLinked = false;
  if (args.subject_id) {
    await createRelationship({
      from_record_id: record.id,
      to_record_id: args.subject_id,
      relationship_type: 'subject_of',
    });
    subjectLinked = true;
  }

  return {
    page: record,
    subject_linked: subjectLinked,
  };
}

/**
 * List all page assets
 */
export function listPageAssets(args: ListPageAssetsArgs): ListPageAssetsResult {
  const accountId = args.account_id || SYSTEM_ACCOUNT_ID;
  const records = listRecords(accountId, 'page' as EntityType);

  let filtered = records;
  if (args.subject_type) {
    filtered = records.filter(r => {
      const pageData = r.data as PageAssetData;
      return pageData.pageConfig?.pageSubject?.target === args.subject_type;
    });
  }

  return {
    count: filtered.length,
    pages: filtered.map(r => {
      const pageData = r.data as PageAssetData;
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        subject_type: pageData.pageConfig?.pageSubject?.target || null,
        template_key: pageData.pageConfig?.templateKey || null,
        created_at: r.created_at,
      };
    }),
  };
}

/**
 * Update a specific section of a page
 */
export async function updatePageSection(args: UpdatePageSectionArgs): Promise<UpdatePageSectionResult> {
  const record = getRecord(args.page_id);
  if (!record || !isPageRecord(record)) {
    throw new Error(`Page not found: ${args.page_id}`);
  }

  const pageData = record.data as PageAssetData;
  const sections = [...(pageData.sections as SectionInstance[] || [])];
  const sectionIndex = sections.findIndex(s => s.id === args.section_id);

  if (sectionIndex === -1) {
    throw new Error(`Section not found: ${args.section_id}`);
  }

  // Merge overrides
  sections[sectionIndex] = {
    ...sections[sectionIndex],
    overrides: {
      ...(sections[sectionIndex].overrides || {}),
      ...args.overrides,
    },
  };

  await updateRecord(args.page_id, {
    data: {
      ...pageData,
      sections,
    },
  });

  return {
    success: true,
    section: sections[sectionIndex],
  };
}

/**
 * Add a new section to a page
 */
export async function addPageSection(args: AddPageSectionArgs): Promise<AddPageSectionResult> {
  const record = getRecord(args.page_id);
  if (!record || !isPageRecord(record)) {
    throw new Error(`Page not found: ${args.page_id}`);
  }

  // Validate preset exists and is compatible
  const preset = getPreset(args.preset_key);
  if (!preset) {
    throw new Error(`Preset not found: ${args.preset_key}`);
  }

  const pageData = record.data as PageAssetData;
  const sections = [...(pageData.sections as SectionInstance[] || [])];

  // Create new section
  const newSection: SectionInstance = {
    schemaVersion: 1,
    id: uuid(),
    placement: args.placement || { slot: 'free', order: sections.length },
    binding: args.binding,
    presentationKey: args.preset_key,
  };

  sections.push(newSection);

  await updateRecord(args.page_id, {
    data: {
      ...pageData,
      sections,
    },
  });

  return {
    success: true,
    section: newSection,
  };
}

/**
 * Resolve all bindings for a page
 */
export async function resolvePageBindings(args: ResolvePageBindingsArgs): Promise<ResolvePageBindingsResult> {
  const accountId = args.account_id || SYSTEM_ACCOUNT_ID;

  const record = getRecord(args.page_id);
  if (!record || !isPageRecord(record)) {
    throw new Error(`Page not found: ${args.page_id}`);
  }

  const pageData = record.data as PageAssetData;
  const sections = pageData.sections as SectionInstance[] || [];

  const resolved = await Promise.all(
    sections.map(async (section) => {
      const binding = await resolveBinding(record, section.binding, accountId);
      return {
        section_id: section.id,
        binding: section.binding,
        resolved_count: binding.records.length,
        records: binding.records.map(r => ({
          id: r.id,
          slug: r.slug,
          name: r.name,
          type: r.type,
        })),
      };
    })
  );

  return {
    page_id: args.page_id,
    sections: resolved,
  };
}

/**
 * Link a page to display an entity
 */
export async function linkPageToEntity(args: LinkPageToEntityArgs): Promise<LinkPageToEntityResult> {
  const record = getRecord(args.page_id);
  if (!record || !isPageRecord(record)) {
    throw new Error(`Page not found: ${args.page_id}`);
  }

  const targetRecord = getRecord(args.entity_id);
  if (!targetRecord) {
    throw new Error(`Target entity not found: ${args.entity_id}`);
  }

  // Determine relationship type
  const relType = args.relationship_type === 'subject'
    ? 'subject_of'
    : args.relationship_type || `displays_${targetRecord.type}`;

  await createRelationship({
    from_record_id: args.page_id,
    to_record_id: args.entity_id,
    relationship_type: relType,
  });

  return {
    success: true,
    relationship_type: relType,
    from: args.page_id,
    to: args.entity_id,
  };
}
