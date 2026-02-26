import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../core/db.js';
import { getEntitiesTargeting } from '../../core/targeting-sync.js';
import { randomUUID } from 'crypto';
import { protectedRoute } from '../../modules/auth/middleware.js';
import { parsePagination, paginatedResponse, applyPaginationToQuery, createCountQuery } from '../middleware/pagination.js';

const router = Router();

// GET /api/dimensions - List dimension values, filterable by dimension type
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dimension, parent_id, brand_id } = req.query;
    const pagination = parsePagination(req);

    let baseQuery = 'SELECT * FROM dimension_values';
    const conditions: string[] = [];
    const args: string[] = [];

    if (dimension && typeof dimension === 'string') {
      conditions.push('dimension = ?');
      args.push(dimension);
    }
    if (parent_id && typeof parent_id === 'string') {
      conditions.push('parent_id = ?');
      args.push(parent_id);
    }
    if (brand_id && typeof brand_id === 'string') {
      conditions.push('(brand_id = ? OR brand_id IS NULL)');
      args.push(brand_id);
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }
    baseQuery += ' ORDER BY dimension, label';

    // Get total count
    const countResult = db.prepare(createCountQuery(baseQuery)).get(...args) as { total: number };
    const total = countResult?.total || 0;

    // Get paginated results
    const paginatedQuery = applyPaginationToQuery(baseQuery, pagination);
    const rows = db.prepare(paginatedQuery).all(...args).map((row: any) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    }));

    res.json(paginatedResponse(rows, total, pagination));
  } catch (err) {
    next(err);
  }
});

// GET /api/dimensions/types - List distinct dimension types
router.get('/types', (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = db.prepare(
      'SELECT dimension, COUNT(*) as count FROM dimension_values GROUP BY dimension ORDER BY dimension'
    ).all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/dimensions - Create a dimension value
router.post('/', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dimension, slug, label, parent_id, metadata, source, account_id } = req.body;
    if (!dimension || !slug || !label) {
      res.status(400).json({ error: 'dimension, slug, and label are required', status: 400 });
      return;
    }

    // Check for existing record (handles NULL account_id correctly)
    const existing = account_id
      ? db.prepare('SELECT id FROM dimension_values WHERE dimension = ? AND slug = ? AND account_id = ?').get(dimension, slug, account_id)
      : db.prepare('SELECT id FROM dimension_values WHERE dimension = ? AND slug = ? AND account_id IS NULL').get(dimension, slug);

    if (existing) {
      res.status(409).json({ error: `Dimension value already exists: ${dimension}/${slug}`, status: 409 });
      return;
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO dimension_values (id, dimension, slug, label, parent_id, metadata, source, account_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, dimension, slug, label, parent_id || null, metadata ? JSON.stringify(metadata) : null, source || 'manual', account_id || null, now, now);

    res.status(201).json({ id, dimension, slug, label, parent_id, metadata, source, account_id: account_id || null, created_at: now, updated_at: now });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint')) {
      res.status(409).json({ error: `Dimension value already exists: ${req.body.dimension}/${req.body.slug}`, status: 409 });
      return;
    }
    next(err);
  }
});

// GET /api/dimensions/targeting - Reverse query: which entities target a dimension value?
router.get('/targeting', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dimension, slug, persona } = req.query;
    if (!dimension || !slug || typeof dimension !== 'string' || typeof slug !== 'string') {
      res.status(400).json({ error: 'dimension and slug query params are required', status: 400 });
      return;
    }
    const p = typeof persona === 'string' ? persona : undefined;
    res.json(getEntitiesTargeting(dimension, slug, p));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/dimensions/:id
router.delete('/:id', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = db.prepare('DELETE FROM dimension_values WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Not found', status: 404 });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/dimensions/import - CSV import with normalization
router.post('/import', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows, mappings } = req.body;
    // rows: array of parsed CSV rows
    // mappings: { dimension: string, slugColumn: string, labelColumn: string, parentDimension?: string, parentColumn?: string, metadataColumns?: string[] }

    if (!rows || !Array.isArray(rows) || !mappings) {
      res.status(400).json({ error: 'rows (array) and mappings (object) are required', status: 400 });
      return;
    }

    const { dimension, slugColumn, labelColumn, parentDimension, parentColumn, metadataColumns, brandId } = mappings;
    const now = new Date().toISOString();

    // Phase 1: Extract and deduplicate parent values if hierarchical
    const parentMap = new Map<string, string>(); // slug -> id
    if (parentDimension && parentColumn) {
      const uniqueParents = new Set<string>();
      for (const row of rows) {
        const parentVal = row[parentColumn]?.trim();
        if (parentVal) uniqueParents.add(parentVal);
      }

      const insertParent = db.prepare(`
        INSERT INTO dimension_values (id, dimension, slug, label, brand_id, source, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'csv_import', ?, ?)
        ON CONFLICT(dimension, slug, brand_id) DO NOTHING
      `);

      const getParent = db.prepare('SELECT id FROM dimension_values WHERE dimension = ? AND slug = ? AND (brand_id = ? OR (brand_id IS NULL AND ? IS NULL))');

      for (const parentLabel of uniqueParents) {
        const parentSlug = slugify(parentLabel);
        const id = randomUUID();
        insertParent.run(id, parentDimension, parentSlug, parentLabel, brandId || null, now, now);
        const existing = getParent.get(parentDimension, parentSlug, brandId || null, brandId || null) as { id: string } | undefined;
        parentMap.set(parentSlug, existing?.id || id);
      }
    }

    // Phase 2: Insert dimension values
    const insertValue = db.prepare(`
      INSERT INTO dimension_values (id, dimension, slug, label, parent_id, metadata, brand_id, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'csv_import', ?, ?)
      ON CONFLICT(dimension, slug, brand_id) DO NOTHING
    `);

    let created = 0;
    let skipped = 0;

    for (const row of rows) {
      const label = row[labelColumn]?.trim();
      if (!label) { skipped++; continue; }

      const slug = row[slugColumn] ? slugify(row[slugColumn].trim()) : slugify(label);
      const parentVal = parentColumn ? row[parentColumn]?.trim() : null;
      const parentId = parentVal ? parentMap.get(slugify(parentVal)) || null : null;

      // Build metadata from extra columns
      let metadata: Record<string, any> | null = null;
      if (metadataColumns && metadataColumns.length > 0) {
        metadata = {};
        for (const col of metadataColumns) {
          if (row[col] !== undefined && row[col] !== '') {
            metadata[col] = row[col];
          }
        }
        if (Object.keys(metadata).length === 0) metadata = null;
      }

      const id = randomUUID();
      try {
        const result = insertValue.run(id, dimension, slug, label, parentId, metadata ? JSON.stringify(metadata) : null, brandId || null, now, now);
        if (result.changes > 0) created++; else skipped++;
      } catch (err) {
        console.warn(`Skipped dimension value "${slug}": ${err instanceof Error ? err.message : String(err)}`);
        skipped++;
      }
    }

    res.json({
      created,
      skipped,
      parents: parentMap.size,
      total: rows.length,
    });
  } catch (err) {
    next(err);
  }
});

function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ============================================================
// Phase 4: Dimension Dependency CRUD Endpoints
// ============================================================

// GET /api/dimensions/dependencies - List dependencies with optional filtering
router.get('/dependencies', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source_dimension, target_dimension } = req.query;
    const pagination = parsePagination(req);

    let baseQuery = `
      SELECT dd.*,
             sv.slug as source_slug, sv.label as source_label,
             tv.slug as target_slug, tv.label as target_label
      FROM dimension_dependencies dd
      JOIN dimension_values sv ON sv.id = dd.source_value_id
      JOIN dimension_values tv ON tv.id = dd.target_value_id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (source_dimension && typeof source_dimension === 'string') {
      baseQuery += ' AND dd.source_dimension = ?';
      params.push(source_dimension);
    }
    if (target_dimension && typeof target_dimension === 'string') {
      baseQuery += ' AND dd.target_dimension = ?';
      params.push(target_dimension);
    }

    baseQuery += ' ORDER BY dd.source_dimension, sv.label, tv.label';

    // Get total count
    const countResult = db.prepare(createCountQuery(baseQuery)).get(...params) as { total: number };
    const total = countResult?.total || 0;

    // Get paginated results
    const paginatedQuery = applyPaginationToQuery(baseQuery, pagination);
    const rows = db.prepare(paginatedQuery).all(...params);

    res.json(paginatedResponse(rows, total, pagination));
  } catch (err) {
    next(err);
  }
});

// POST /api/dimensions/dependencies - Create a single dependency
router.post('/dependencies', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { source_value_id, target_value_id, bidirectional, weight, metadata } = req.body;

    if (!source_value_id || !target_value_id) {
      res.status(400).json({ error: 'source_value_id and target_value_id are required', status: 400 });
      return;
    }

    // Lookup dimensions from value IDs
    const sourceVal = db.prepare('SELECT dimension FROM dimension_values WHERE id = ?').get(source_value_id) as { dimension: string } | undefined;
    const targetVal = db.prepare('SELECT dimension FROM dimension_values WHERE id = ?').get(target_value_id) as { dimension: string } | undefined;

    if (!sourceVal || !targetVal) {
      res.status(400).json({ error: 'Invalid source or target value ID', status: 400 });
      return;
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO dimension_dependencies
      (id, source_dimension, source_value_id, target_dimension, target_value_id, bidirectional, weight, metadata, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?)
    `).run(
      id,
      sourceVal.dimension,
      source_value_id,
      targetVal.dimension,
      target_value_id,
      bidirectional ?? 1,
      weight ?? 100,
      metadata ? JSON.stringify(metadata) : null,
      now, now
    );

    res.status(201).json({
      id,
      source_dimension: sourceVal.dimension,
      target_dimension: targetVal.dimension,
      bidirectional: bidirectional ?? 1
    });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint')) {
      res.status(409).json({ error: 'Dependency already exists', status: 409 });
      return;
    }
    next(err);
  }
});

// DELETE /api/dimensions/dependencies/:id - Delete a dependency
router.delete('/dependencies/:id', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = db.prepare('DELETE FROM dimension_dependencies WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Dependency not found', status: 404 });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/dimensions/dependencies/bulk - Bulk import dependencies
router.post('/dependencies/bulk', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dependencies } = req.body;

    if (!Array.isArray(dependencies)) {
      res.status(400).json({ error: 'dependencies must be an array', status: 400 });
      return;
    }

    const insertStmt = db.prepare(`
      INSERT INTO dimension_dependencies
      (id, source_dimension, source_value_id, target_dimension, target_value_id, bidirectional, weight, source, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'bulk_import', datetime('now'), datetime('now'))
      ON CONFLICT(source_value_id, target_value_id, account_id) DO NOTHING
    `);

    const lookupDim = db.prepare('SELECT dimension FROM dimension_values WHERE id = ?');

    let created = 0;
    let skipped = 0;

    const transaction = db.transaction(() => {
      for (const dep of dependencies) {
        const sourceVal = lookupDim.get(dep.source_value_id) as { dimension: string } | undefined;
        const targetVal = lookupDim.get(dep.target_value_id) as { dimension: string } | undefined;

        if (!sourceVal || !targetVal) {
          skipped++;
          continue;
        }

        try {
          const result = insertStmt.run(
            randomUUID(),
            sourceVal.dimension,
            dep.source_value_id,
            targetVal.dimension,
            dep.target_value_id,
            dep.bidirectional ?? 1,
            dep.weight ?? 100
          );
          if (result.changes > 0) created++;
          else skipped++;
        } catch (err) {
          console.warn(`Skipped dependency: ${err instanceof Error ? err.message : String(err)}`);
          skipped++;
        }
      }
    });

    transaction();

    res.json({ created, skipped, total: dependencies.length });
  } catch (err) {
    next(err);
  }
});

export default router;
