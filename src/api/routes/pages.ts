/**
 * Pages API Routes
 *
 * CRUD operations for page assets with webbuilder integration.
 * Pages are assets where channel='website' and medium='page'.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import {
  createRecord,
  getRecord,
  getRecordBySlug,
  updateRecord,
  deleteRecord,
  listRecords,
} from '../../core/records.js';
import { createRelationship, getRelationshipsFrom } from '../../core/relationships.js';
import { protectedRoute } from '../../modules/auth/middleware.js';
import { DEFAULT_ACCOUNT_ID } from '../../core/constants.js';
import { db } from '../../core/db.js';
import type { DataRecord, PageAssetData } from '../../core/types.js';
import {
  compilePage,
  resolveBinding,
  type SectionInstance,
  type PageTemplate,
  type Binding,
  type PageSubject,
} from '../../modules/webbuilder/index.js';
import { parsePagination, paginatedResponse } from '../middleware/pagination.js';

const router = Router();

// ============================================================================
// Helper Functions
// ============================================================================

function getPageTemplate(key: string): PageTemplate | null {
  const row = db.prepare(`
    SELECT * FROM page_templates WHERE key = ?
  `).get(key) as { sections: string; subject_target: string; subject_cardinality: string; name: string; id: string } | undefined;

  if (!row) return null;

  return {
    schemaVersion: 1,
    id: row.id,
    name: row.name,
    pageContext: { kind: 'detail' }, // Default
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
// Routes
// ============================================================================

/**
 * GET /api/pages - List all page assets
 */
router.get('/', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;
    const subjectType = req.query.subject_type as string | undefined;
    const pagination = parsePagination(req);

    const records = listRecords(accountId, 'page');

    // Optional filter by subject type
    let filtered = records;
    if (subjectType) {
      filtered = records.filter(r => {
        const pageData = r.data as PageAssetData;
        return pageData.pageConfig?.pageSubject?.target === subjectType;
      });
    }

    // Apply pagination
    const total = filtered.length;
    const paginatedData = filtered.slice(pagination.offset, pagination.offset + pagination.limit);

    res.json(paginatedResponse(paginatedData, total, pagination));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/pages/:slug - Get page with resolved bindings
 */
router.get('/:slug', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;
    const resolve = req.query.resolve !== 'false'; // Default to resolving

    // Try by ID first, then by slug
    let record = getRecord(slug);
    if (!record) {
      record = getRecordBySlug(accountId, slug);
    }

    if (!record || !isPageRecord(record)) {
      res.status(404).json({
        error: 'Page not found',
        status: 404,
      });
      return;
    }

    if (resolve) {
      // Compile sections with resolved bindings
      const pageData = record.data as PageAssetData;
      const sections = pageData.sections as SectionInstance[] || [];
      const compiled = await compilePage(sections, record, accountId);

      res.json({
        ...record,
        compiledSections: compiled,
      });
    } else {
      res.json(record);
    }
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/pages - Create page from template
 */
router.post('/', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      template_key,
      name,
      slug,
      subject_id,
      account_id,
      source = 'brand.co',
      version = 'V.01',
    } = req.body;

    const accountId = account_id || DEFAULT_ACCOUNT_ID;

    // Load template if provided
    let sections: SectionInstance[] = [];
    let pageSubject: PageSubject = { target: 'brand', cardinality: 'one' };

    if (template_key) {
      const template = getPageTemplate(template_key);
      if (!template) {
        res.status(400).json({
          error: `Template not found: ${template_key}`,
          status: 400,
        });
        return;
      }
      sections = template.sections;
      pageSubject = template.pageSubject;
    }

    // Create page record
    const pageData: PageAssetData = {
      fieldGroups: [],
      attribution: {
        channel: 'website',
        medium: 'page',
        source,
        referralType: 'organic',
        version,
      },
      pageConfig: {
        schemaVersion: 1,
        pageContext: { kind: 'detail' },
        pageSubject,
        templateKey: template_key,
      },
      sections,
    };

    const record = await createRecord({
      type: 'page',
      name,
      slug,
      account_id: accountId,
      data: pageData,
    });

    // Link to subject entity if provided
    if (subject_id) {
      await createRelationship({
        from_record_id: record.id,
        to_record_id: subject_id,
        relationship_type: 'subject_of',
      });
    }

    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/pages/:id - Update page
 */
router.put('/:id', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const updates = req.body;

    const existing = getRecord(id);
    if (!existing || !isPageRecord(existing)) {
      res.status(404).json({
        error: 'Page not found',
        status: 404,
      });
      return;
    }

    const record = await updateRecord(id, updates);
    if (!record) {
      res.status(500).json({
        error: 'Failed to update page',
        status: 500,
      });
      return;
    }

    res.json(record);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/pages/:id - Delete page
 */
router.delete('/:id', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const existing = getRecord(id);
    if (!existing || !isPageRecord(existing)) {
      res.status(404).json({
        error: 'Page not found',
        status: 404,
      });
      return;
    }

    const deleted = await deleteRecord(id);
    if (!deleted) {
      res.status(500).json({
        error: 'Failed to delete page',
        status: 500,
      });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/pages/:id/preview - Get compiled page data for preview
 */
router.get('/:id/preview', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;

    const record = getRecord(id);
    if (!record || !isPageRecord(record)) {
      res.status(404).json({
        error: 'Page not found',
        status: 404,
      });
      return;
    }

    // Compile sections
    const pageData = record.data as PageAssetData;
    const sections = pageData.sections as SectionInstance[] || [];
    const compiled = await compilePage(sections, record, accountId);

    // Return preview data (actual HTML rendering would be handled by frontend)
    res.json({
      page: record,
      compiled,
      previewUrl: `/preview/${record.slug}`,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/pages/:id/sections - Add section to page
 */
router.post('/:id/sections', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { binding, preset_key, placement, overrides } = req.body;

    const record = getRecord(id);
    if (!record || !isPageRecord(record)) {
      res.status(404).json({
        error: 'Page not found',
        status: 404,
      });
      return;
    }

    const pageData = record.data as PageAssetData;
    const sections = [...(pageData.sections as SectionInstance[] || [])];

    // Create new section
    const newSection: SectionInstance = {
      schemaVersion: 1,
      id: uuid(),
      placement: placement || { slot: 'free', order: sections.length },
      binding: binding || { kind: 'self' },
      presentationKey: preset_key,
      overrides,
    };

    sections.push(newSection);

    // Update page
    const updated = await updateRecord(id, {
      data: {
        ...pageData,
        sections,
      },
    });

    res.status(201).json({
      section: newSection,
      page: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/pages/:id/sections/:sectionId - Update section
 */
router.put('/:id/sections/:sectionId', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const sectionId = req.params.sectionId as string;
    const updates = req.body;

    const record = getRecord(id);
    if (!record || !isPageRecord(record)) {
      res.status(404).json({
        error: 'Page not found',
        status: 404,
      });
      return;
    }

    const pageData = record.data as PageAssetData;
    const sections = [...(pageData.sections as SectionInstance[] || [])];
    const sectionIndex = sections.findIndex(s => s.id === sectionId);

    if (sectionIndex === -1) {
      res.status(404).json({
        error: 'Section not found',
        status: 404,
      });
      return;
    }

    // Merge updates into section
    sections[sectionIndex] = {
      ...sections[sectionIndex],
      ...updates,
    };

    // Update page
    const updated = await updateRecord(id, {
      data: {
        ...pageData,
        sections,
      },
    });

    res.json({
      section: sections[sectionIndex],
      page: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/pages/:id/sections/:sectionId - Remove section
 */
router.delete('/:id/sections/:sectionId', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const sectionId = req.params.sectionId as string;

    const record = getRecord(id);
    if (!record || !isPageRecord(record)) {
      res.status(404).json({
        error: 'Page not found',
        status: 404,
      });
      return;
    }

    const pageData = record.data as PageAssetData;
    const sections = (pageData.sections as SectionInstance[] || []).filter(s => s.id !== sectionId);

    // Update page
    const updated = await updateRecord(id, {
      data: {
        ...pageData,
        sections,
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/pages/:id/link - Link page to display entity
 */
router.post('/:id/link', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { entity_id, relationship_type = 'displays' } = req.body;

    const record = getRecord(id);
    if (!record || !isPageRecord(record)) {
      res.status(404).json({
        error: 'Page not found',
        status: 404,
      });
      return;
    }

    const targetRecord = getRecord(entity_id);
    if (!targetRecord) {
      res.status(400).json({
        error: 'Target entity not found',
        status: 400,
      });
      return;
    }

    // Create relationship
    const relType: string = relationship_type === 'subject'
      ? 'subject_of'
      : `displays_${targetRecord.type}`;

    await createRelationship({
      from_record_id: id,
      to_record_id: entity_id,
      relationship_type: relType,
    });

    res.status(201).json({
      relationship_type: relType,
      from: id,
      to: entity_id,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/pages/:id/bindings - Resolve all bindings for a page
 */
router.get('/:id/bindings', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const accountId = (req.query.account_id as string) || DEFAULT_ACCOUNT_ID;

    const record = getRecord(id);
    if (!record || !isPageRecord(record)) {
      res.status(404).json({
        error: 'Page not found',
        status: 404,
      });
      return;
    }

    const pageData = record.data as PageAssetData;
    const sections = pageData.sections as SectionInstance[] || [];

    // Resolve each section's binding
    const resolved = await Promise.all(
      sections.map(async (section) => ({
        sectionId: section.id,
        binding: section.binding,
        resolved: await resolveBinding(record, section.binding, accountId),
      }))
    );

    res.json(resolved);
  } catch (err) {
    next(err);
  }
});

export default router;
