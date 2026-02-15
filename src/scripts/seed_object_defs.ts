
import { db } from '../core/db.js';
import { randomUUID } from 'crypto';
import { DataRecord } from '../core/types.js';

const SYSTEM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

interface ObjectDef {
    slug: string;
    name: string;
    summary: string;
    icon?: string;
}

const CORE_OBJECTS: ObjectDef[] = [
    // CRM
    { slug: 'contact', name: 'Contact', summary: 'Individual people and stakeholders' },
    { slug: 'account', name: 'Account', summary: 'Companies and organizations' },
    { slug: 'opportunity', name: 'Opportunity', summary: 'Potential deals and revenue tracking' },
    { slug: 'product', name: 'Product', summary: 'Goods and services offered' },
    { slug: 'activity', name: 'Activity', summary: 'Interactions and tasks' },
    
    // Content
    { slug: 'content', name: 'Content', summary: 'Editorial content and articles' },
    { slug: 'asset', name: 'Asset', summary: 'Digital files and media' },
    { slug: 'page', name: 'Page', summary: 'Web pages and landing pages' },
    
    // Growth
    { slug: 'campaign', name: 'Campaign', summary: 'Marketing initiatives' },
    { slug: 'pipeline', name: 'Pipeline', summary: 'Sales and delivery pipelines' },
    { slug: 'workflow', name: 'Workflow', summary: 'Automated processes' },
    
    // System
    { slug: 'object_def', name: 'Object Definition', summary: 'System object types' },
    { slug: 'field_def', name: 'Field Definition', summary: 'Field configurations' },
    { slug: 'dimension_def', name: 'Dimension Definition', summary: 'Taxonomy and categorization' },
    { slug: 'role', name: 'Role', summary: 'User roles and permissions' },
    { slug: 'user', name: 'User', summary: 'System users' }
];

async function seedObjectDefs() {
    console.log('🌱 Seeding Object Definitions...');
    
    const insertStmt = db.prepare(`
        INSERT INTO records (id, type, slug, name, summary, account_id, data, created_at, updated_at)
        VALUES (@id, 'object_def', @slug, @name, @summary, @account_id, @data, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(account_id, slug) DO UPDATE SET
            name = excluded.name,
            summary = excluded.summary,
            updated_at = CURRENT_TIMESTAMP
    `);

    let count = 0;

    db.transaction(() => {
        for (const obj of CORE_OBJECTS) {
            insertStmt.run({
                id: randomUUID(),
                slug: obj.slug,
                name: obj.name,
                summary: obj.summary,
                account_id: SYSTEM_ACCOUNT_ID,
                data: JSON.stringify({
                    icon: obj.icon || 'box',
                    is_system: true
                })
            });
            count++;
        }
    })();

    console.log(`✅ Seeded ${count} Object Definitions.`);
}

seedObjectDefs();
