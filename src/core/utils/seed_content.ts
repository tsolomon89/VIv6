import fs from 'fs';
import path from 'path';
import { createAccountTool, createEntityTool, linkEntityTool } from '../agent/tools.js';
import { getAccountBySlug } from '../accounts.js';
import { initDb } from '../db.js';

// Configuration
const SOURCE_DIR = 'c:/Development/Projects/VIv5/agent_context/old_docs/context-oblio-dot-app/old_monorepo/websites/sites/oblio-dot-app/content';
const OBLIO_ACCOUNT_SLUG = 'oblio-inc';

// Types
type Frontmatter = {
    title?: string;
    description?: string;
    tagline?: string;
    category?: string;
    forUseCases?: string[];
    forSolutions?: string[];
    [key: string]: any;
};

type ContentFile = {
    slug: string;
    path: string;
    type: 'feature' | 'solution' | 'useCase';
    frontmatter: Frontmatter;
    body: string;
    entityId?: string;
};

// Helpers
function parseMarkdown(content: string): { frontmatter: Frontmatter, body: string } {
    const match = content.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
    if (!match) return { frontmatter: {}, body: content };

    const rawFm = match[1];
    const body = match[2].trim();
    const frontmatter: Frontmatter = {};

    rawFm.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length < 2) return;
        const key = parts[0].trim();
        let value = parts.slice(1).join(':').trim();

        // Basic YAML parsing (strings, arrays)
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        } else if (value.startsWith('[') && value.endsWith(']')) {
             // Simple array parse: ["a", "b"] -> ["a", "b"]
             // We need to strip quotes and split
             const arrayContent = value.slice(1, -1);
             const items = arrayContent.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
             frontmatter[key] = items;
             return; 
        }

        if (key === 'forUseCases' || key === 'forSolutions') {
             // Handle if it wasn't caught by [] check (e.g. multiline YAML, though our sample was single line)
             // For now assume simple format from sample
        }

        frontmatter[key] = value;
    });

    return { frontmatter, body };
}

// Main Execution
async function seed() {
    console.log("🌱 Starting Content Seeding...");
    initDb();

    // 1. Ensure Account
    console.log("Ensuring Oblio Account...");
    let accountId: string;

    const existing = getAccountBySlug(OBLIO_ACCOUNT_SLUG);
    if (existing) {
        console.log(`✅ Account Exists: ${existing.slug}`);
        accountId = existing.id;
    } else {
        try {
            const acc = createAccountTool('Oblio Inc', {
                website: 'https://oblio.app',
                primaryColor: '#000000'
            }); // Note: Auto-slug might not be 'oblio-inc', it might be 'oblio-inc-123' if randomness used or simple 'oblio-inc'
            // Tools auto-slug is: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') -> 'oblio-inc'
            accountId = acc.id;
            console.log(`✅ Account Created: ${acc.id}`);
        } catch (e: any) {
             console.error("Failed to create account", e);
             process.exit(1);
        }
    }

    // 2. Scan Files
    const files: ContentFile[] = [];
    const dirs = {
        'features': 'feature',
        'solutions': 'solution',
        'use-cases': 'useCase'
    };

    for (const [dirName, entityType] of Object.entries(dirs)) {
        const fullPath = path.join(SOURCE_DIR, dirName);
        if (!fs.existsSync(fullPath)) continue;

        const filenames = fs.readdirSync(fullPath).filter(f => f.endsWith('.md'));
        for (const filename of filenames) {
            const content = fs.readFileSync(path.join(fullPath, filename), 'utf-8');
            const { frontmatter, body } = parseMarkdown(content);
            const slug = filename.replace('.md', '');
            
            files.push({
                slug,
                path: path.join(dirName, filename),
                type: entityType as any,
                frontmatter,
                body
            });
        }
    }
    console.log(`Found ${files.length} files to migrate.`);

    // 3. Pass 1: Create Entities
    console.log("--- Pass 1: Creating Entities ---");
    const slugToId = new Map<string, string>();

    for (const file of files) {
        try {
            const data: any = {};
            
            // Map Data based on Type
            if (file.type === 'feature') {
                data.benefit = file.frontmatter.tagline;
                // data.summary = file.body; // Summary not in Zod yet? Added in my edit.
            } else if (file.type === 'solution') {
                data.outcome = file.frontmatter.description;
            } else if (file.type === 'useCase') {
                data.quote = file.frontmatter.tagline;
            }

            const entity = createEntityTool(
                file.type, 
                file.frontmatter.title || file.slug, 
                data, 
                accountId
            );
            
            file.entityId = entity.id;
            slugToId.set(file.slug, entity.id);
            console.log(`✅ Created ${file.type}: ${file.slug}`);
        } catch (e) {
            console.error(`❌ Failed to create ${file.slug}:`, e);
        }
    }

    // 4. Pass 2: Link Relationships
    console.log("--- Pass 2: Linking Entities ---");
    for (const file of files) {
        if (!file.entityId) continue;

        // Relation: forUseCases
        if (file.frontmatter.forUseCases && Array.isArray(file.frontmatter.forUseCases)) {
            for (const targetSlug of file.frontmatter.forUseCases) {
                const targetId = slugToId.get(targetSlug);
                if (targetId) {
                    try {
                        linkEntityTool(file.entityId, targetId, 'enables_use_case');
                        console.log(`🔗 Linked ${file.slug} -> ${targetSlug}`);
                    } catch (e) { console.error(`Failed link: ${e}`); }
                }
            }
        }

        // Relation: forSolutions
        if (file.frontmatter.forSolutions && Array.isArray(file.frontmatter.forSolutions)) {
            for (const targetSlug of file.frontmatter.forSolutions) {
                const targetId = slugToId.get(targetSlug);
                if (targetId) {
                    try {
                        linkEntityTool(targetId, file.entityId, 'uses_feature'); // Direction check?
                        // Assuming Solution USES Feature. 
                        console.log(`🔗 Linked ${targetSlug} -> ${file.slug}`);
                    } catch (e) { console.error(`Failed link: ${e}`); }
                }
            }
        }
    }

    console.log("🎉 Seeding Complete.");
}

seed();
