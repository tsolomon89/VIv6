import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../core/db.js';
import { OBLIO_ACCOUNT_ID } from '../../core/constants.js';

const router = Router();

/**
 * Schema Introspection API
 *
 * These endpoints allow clients to discover available object types,
 * field definitions, and activity definitions. This enables:
 * - Dynamic form generation in UI
 * - Schema validation on the client
 * - Activity type discovery for logging
 */

// GET /api/schema/objects - List all object definitions
router.get('/objects', (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = db.prepare(`
      SELECT id, slug, name, summary, data
      FROM records
      WHERE type = 'object_def'
      AND account_id = ?
      ORDER BY name
    `).all(OBLIO_ACCOUNT_ID) as any[];

    const objects = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      summary: r.summary,
      data: JSON.parse(r.data || '{}')
    }));

    res.json({ objects });
  } catch (err) {
    next(err);
  }
});

// GET /api/schema/objects/:slug - Get single object definition with fields
router.get('/objects/:slug', (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = db.prepare(`
      SELECT id, slug, name, summary, data
      FROM records
      WHERE type = 'object_def'
      AND slug = ?
      AND account_id = ?
    `).get(req.params.slug, OBLIO_ACCOUNT_ID) as any;

    if (!row) {
      return res.status(404).json({ error: 'Object definition not found' });
    }

    res.json({
      id: row.id,
      slug: row.slug,
      name: row.name,
      summary: row.summary,
      data: JSON.parse(row.data || '{}')
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/schema/objects/:slug/fields - Get flattened fields for an object
router.get('/objects/:slug/fields', (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = db.prepare(`
      SELECT data
      FROM records
      WHERE type = 'object_def'
      AND slug = ?
      AND account_id = ?
    `).get(req.params.slug, OBLIO_ACCOUNT_ID) as any;

    if (!row) {
      return res.status(404).json({ error: 'Object definition not found' });
    }

    const data = JSON.parse(row.data || '{}');
    const fieldGroups = data.fieldGroups || [];

    // Flatten all fields from all groups
    const fields = fieldGroups.flatMap((group: any) =>
      (group.fields || []).map((field: any) => ({
        ...field,
        fieldGroup: group.name
      }))
    );

    res.json({ fields, objectSlug: req.params.slug });
  } catch (err) {
    next(err);
  }
});

// GET /api/schema/fields - List all field_def records (if stored separately)
router.get('/fields', (req: Request, res: Response, next: NextFunction) => {
  try {
    // First try to get explicit field_def records
    const fieldDefRows = db.prepare(`
      SELECT id, slug, name, summary, data
      FROM records
      WHERE type = 'field_def'
      AND account_id = ?
      ORDER BY name
    `).all(OBLIO_ACCOUNT_ID) as any[];

    if (fieldDefRows.length > 0) {
      const fields = fieldDefRows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        summary: r.summary,
        ...JSON.parse(r.data || '{}')
      }));
      return res.json({ fields, source: 'field_def' });
    }

    // Fallback: Extract fields from object_def.data.fieldGroups
    const objectRows = db.prepare(`
      SELECT slug, name, data
      FROM records
      WHERE type = 'object_def'
      AND account_id = ?
    `).all(OBLIO_ACCOUNT_ID) as any[];

    const fields: any[] = [];
    for (const obj of objectRows) {
      const data = JSON.parse(obj.data || '{}');
      const fieldGroups = data.fieldGroups || [];
      for (const group of fieldGroups) {
        for (const field of (group.fields || [])) {
          fields.push({
            name: field.name,
            type: field.type,
            objectSlug: obj.slug,
            objectName: obj.name,
            fieldGroup: group.name,
            ...field
          });
        }
      }
    }

    res.json({ fields, source: 'object_def' });
  } catch (err) {
    next(err);
  }
});

// GET /api/schema/field-groups - List all field groups across objects
router.get('/field-groups', (req: Request, res: Response, next: NextFunction) => {
  try {
    const objectRows = db.prepare(`
      SELECT slug, name, data
      FROM records
      WHERE type = 'object_def'
      AND account_id = ?
    `).all(OBLIO_ACCOUNT_ID) as any[];

    const fieldGroups: any[] = [];
    for (const obj of objectRows) {
      const data = JSON.parse(obj.data || '{}');
      for (const group of (data.fieldGroups || [])) {
        fieldGroups.push({
          name: group.name,
          objectSlug: obj.slug,
          objectName: obj.name,
          fieldCount: (group.fields || []).length,
          fields: group.fields || []
        });
      }
    }

    res.json({ fieldGroups });
  } catch (err) {
    next(err);
  }
});

// GET /api/schema/dimensions - List all dimension types
router.get('/dimensions', (req: Request, res: Response, next: NextFunction) => {
  try {
    // Include both account-specific AND global (NULL account_id) dimensions
    const rows = db.prepare(`
      SELECT DISTINCT dimension, COUNT(*) as count
      FROM dimension_values
      WHERE account_id = ? OR account_id IS NULL
      GROUP BY dimension
      ORDER BY dimension
    `).all(OBLIO_ACCOUNT_ID) as any[];

    const dimensions = rows.map((r) => ({ dimension: r.dimension, count: r.count }));
    res.json({ dimensions });
  } catch (err) {
    next(err);
  }
});

// GET /api/schema/dimensions/:dimension/values - Get values for a dimension with optional filtering
// Supports cascading/interdependent pick-lists via dimension_dependencies table
// Usage: GET /api/schema/dimensions/job_title/values?filter[department]=engineering
router.get('/dimensions/:dimension/values', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dimension } = req.params;

    // Parse filter from query string - can be filter[dim]=slug or filter.dim=slug
    let filter: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.query)) {
      if (key.startsWith('filter[') && key.endsWith(']') && typeof value === 'string') {
        const filterDim = key.slice(7, -1);
        filter[filterDim] = value;
      }
    }

    let query = `
      SELECT DISTINCT dv.id, dv.slug, dv.label, dv.parent_id, dv.metadata
      FROM dimension_values dv
      WHERE dv.dimension = ?
      AND (dv.account_id = ? OR dv.account_id IS NULL)
    `;
    const params: any[] = [dimension, OBLIO_ACCOUNT_ID];

    // Phase 4: Apply dependency filtering via dimension_dependencies table
    if (Object.keys(filter).length > 0) {
      for (const [filterDim, filterSlug] of Object.entries(filter)) {
        if (!filterSlug) continue;

        // Subquery to find dimension values that have dependencies matching the filter
        // Handles both directions: source->target and target->source (if bidirectional)
        query += `
          AND dv.id IN (
            -- Forward relationship: filter dimension is source, requested dimension is target
            SELECT dd.target_value_id
            FROM dimension_dependencies dd
            JOIN dimension_values fv ON fv.id = dd.source_value_id
            WHERE dd.target_dimension = ?
            AND dd.source_dimension = ?
            AND fv.slug = ?
            AND (dd.account_id = ? OR dd.account_id IS NULL)

            UNION

            -- Reverse relationship (if bidirectional): filter dimension is target, requested is source
            SELECT dd.source_value_id
            FROM dimension_dependencies dd
            JOIN dimension_values fv ON fv.id = dd.target_value_id
            WHERE dd.source_dimension = ?
            AND dd.target_dimension = ?
            AND fv.slug = ?
            AND dd.bidirectional = 1
            AND (dd.account_id = ? OR dd.account_id IS NULL)
          )
        `;
        params.push(
          dimension, filterDim, filterSlug, OBLIO_ACCOUNT_ID,
          dimension, filterDim, filterSlug, OBLIO_ACCOUNT_ID
        );
      }
    }

    query += ' ORDER BY dv.label';

    const rows = db.prepare(query).all(...params) as any[];

    const values = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      label: r.label,
      parentId: r.parent_id,
      metadata: JSON.parse(r.metadata || '{}')
    }));

    res.json({
      dimension,
      values,
      filtered: Object.keys(filter).length > 0,
      filterApplied: filter
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/schema/activity-defs - List all activity definitions
router.get('/activity-defs', (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = db.prepare(`
      SELECT id, slug, name, summary, data
      FROM records
      WHERE type = 'activity_def'
      ORDER BY name
    `).all() as any[];

    const activityDefs = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      summary: r.summary,
      data: JSON.parse(r.data || '{}')
    }));

    res.json({ activityDefs });
  } catch (err) {
    next(err);
  }
});

// GET /api/schema/activity-defs/:slug - Get single activity definition
router.get('/activity-defs/:slug', (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = db.prepare(`
      SELECT id, slug, name, summary, data
      FROM records
      WHERE type = 'activity_def'
      AND slug = ?
    `).get(req.params.slug) as any;

    if (!row) {
      return res.status(404).json({ error: 'Activity definition not found' });
    }

    res.json({
      id: row.id,
      slug: row.slug,
      name: row.name,
      summary: row.summary,
      data: JSON.parse(row.data || '{}')
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/schema/activity-types - List the 4 activity archetypes
router.get('/activity-types', (req: Request, res: Response) => {
  res.json({
    archetypes: [
      { slug: 'data', name: 'Data', description: 'Research activities - creating/updating records' },
      { slug: 'asset', name: 'Asset', description: 'Creative activities - creating content' },
      { slug: 'engagement', name: 'Engagement', description: 'Outreach activities - emails, calls, meetings' },
      { slug: 'admin', name: 'Admin', description: 'Approval activities - governance and review' }
    ]
  });
});

export default router;
