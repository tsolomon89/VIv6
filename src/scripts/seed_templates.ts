
import { db } from '../core/db.js';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';

// Import Templates
import { VICTORY_PAGE_TEMPLATE } from '../themes/victory-studio/templates/victory.js';
import { OBLIO_PAGE_TEMPLATE } from '../themes/victory-studio/templates/oblio.js';
import { KEIMENON_PAGE_TEMPLATE } from '../themes/victory-studio/templates/keimenon.js';
import { INITIAL_PAGE_TEMPLATE, MINIMAL_PAGE_TEMPLATE } from '../themes/victory-studio/data.js';

const TEMPLATES = [
    VICTORY_PAGE_TEMPLATE,
    OBLIO_PAGE_TEMPLATE,
    KEIMENON_PAGE_TEMPLATE,
    INITIAL_PAGE_TEMPLATE,
    MINIMAL_PAGE_TEMPLATE
];

function computeHash(obj: any): string {
    return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
}

console.log('🌱 starting template seed...');

export function seedTemplates() {
    try {
        for (const tpl of TEMPLATES) {
            // Check if exists
            const existing = db.prepare('SELECT id FROM page_templates WHERE key = ?').get(tpl.id) as any;
            
            const now = new Date().toISOString();
            const sectionsJson = JSON.stringify(tpl.sections);
            const hash = computeHash({ key: tpl.id, sections: tpl.sections });
    
            if (existing) {
                console.log(`🔄 Updating: ${tpl.name} (${tpl.id})`);
                db.prepare(`
                    UPDATE page_templates 
                    SET name = ?, description = ?, subject_target = ?, subject_cardinality = ?, sections = ?, updated_at = ?, content_hash = ?
                    WHERE key = ?
                `).run(
                    tpl.name,
                    `Restored via seed script`,
                    tpl.pageSubject.target,
                    tpl.pageSubject.cardinality,
                    sectionsJson,
                    now,
                    hash,
                    tpl.id 
                );
            } else {
                console.log(`✨ Inserting: ${tpl.name} (${tpl.id})`);
                db.prepare(`
                    INSERT INTO page_templates (id, key, name, description, subject_target, subject_cardinality, sections, created_at, updated_at, content_hash)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    uuid(),
                    tpl.id, 
                    tpl.name,
                    `Restored via seed script`,
                    tpl.pageSubject.target,
                    tpl.pageSubject.cardinality,
                    sectionsJson,
                    now,
                    now,
                    hash
                );
            }
        }
        console.log('✅ Template Seed Complete!');
    } catch (err) {
        console.error('❌ Template Seed Error:', err);
    }
}
