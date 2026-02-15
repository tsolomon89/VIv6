import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../core/db.js';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';

const router = Router();

// Types
interface PageTemplate {
    id: string;
    key: string;
    name: string;
    description?: string;
    subject_target: string;
    subject_cardinality: string;
    sections: any[];
    created_at?: string;
    updated_at?: string;
}

// Helper: compute content hash
function computeHash(obj: any): string {
    return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
}

// GET /api/templates - List all templates
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    try {
        // const db = getDb(); // REMOVED
        const rows = db.prepare(`
            SELECT id, key, name, description, subject_target, subject_cardinality, 
                   sections, created_at, updated_at
            FROM page_templates
            ORDER BY updated_at DESC
        `).all() as any[];

        const templates = rows.map(row => ({
            ...row,
            sections: JSON.parse(row.sections || '[]')
        }));

        res.json(templates);
    } catch (err) {
        next(err);
    }
});

// GET /api/templates/:key - Get template by key
router.get('/:key', (req: Request, res: Response, next: NextFunction) => {
    try {
        // const db = getDb(); // REMOVED
        const row = db.prepare(`
            SELECT id, key, name, description, subject_target, subject_cardinality, 
                   sections, created_at, updated_at
            FROM page_templates
            WHERE key = ?
        `).get(req.params.key) as any;

        if (!row) {
            return res.status(404).json({ error: 'Template not found' });
        }

        res.json({
            ...row,
            sections: JSON.parse(row.sections || '[]')
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/templates - Create template
router.post('/', (req: Request, res: Response, next: NextFunction) => {
    try {
        const { key, name, description, subject_target, subject_cardinality, sections } = req.body;

        if (!key || !name || !sections) {
            return res.status(400).json({ error: 'Missing required fields: key, name, sections' });
        }

        // const db = getDb(); // REMOVED
        const id = uuid();
        const now = new Date().toISOString();
        const sectionsJson = JSON.stringify(sections);
        const hash = computeHash({ key, sections });

        db.prepare(`
            INSERT INTO page_templates (id, key, name, description, subject_target, subject_cardinality, sections, created_at, updated_at, content_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id, 
            key, 
            name, 
            description || null, 
            subject_target || 'brand', 
            subject_cardinality || 'one', 
            sectionsJson, 
            now, 
            now, 
            hash
        );

        res.status(201).json({ id, key, message: 'Template created' });
    } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'Template with this key already exists' });
        }
        next(err);
    }
});

// PUT /api/templates/:key - Update template
router.put('/:key', (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, subject_target, subject_cardinality, sections } = req.body;
        // const db = getDb(); // REMOVED

        const existing = db.prepare('SELECT id FROM page_templates WHERE key = ?').get(req.params.key) as any;
        if (!existing) {
            return res.status(404).json({ error: 'Template not found' });
        }

        const now = new Date().toISOString();
        const sectionsJson = sections ? JSON.stringify(sections) : undefined;
        const hash = sections ? computeHash({ key: req.params.key, sections }) : undefined;

        // Build dynamic update
        const updates: string[] = [];
        const params: any[] = [];

        if (name !== undefined) { updates.push('name = ?'); params.push(name); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (subject_target !== undefined) { updates.push('subject_target = ?'); params.push(subject_target); }
        if (subject_cardinality !== undefined) { updates.push('subject_cardinality = ?'); params.push(subject_cardinality); }
        if (sectionsJson !== undefined) { updates.push('sections = ?'); params.push(sectionsJson); }
        if (hash !== undefined) { updates.push('content_hash = ?'); params.push(hash); }

        updates.push('updated_at = ?');
        params.push(now);
        params.push(req.params.key);

        db.prepare(`UPDATE page_templates SET ${updates.join(', ')} WHERE key = ?`).run(...params);

        res.json({ key: req.params.key, message: 'Template updated' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/templates/:key - Delete template
router.delete('/:key', (req: Request, res: Response, next: NextFunction) => {
    try {
        // const db = getDb(); // REMOVED
        const result = db.prepare('DELETE FROM page_templates WHERE key = ?').run(req.params.key);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }

        res.json({ message: 'Template deleted' });
    } catch (err) {
        next(err);
    }
});

export default router;
