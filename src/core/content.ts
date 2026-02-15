import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export interface ContentAsset {
    slug: string;
    path: string;           // Relative path, e.g., 'blog/my-post.md'
    url: string;            // Resulting URL, e.g., '/blog/my-post'
    contentType: string;    // 'blog', 'doc', etc. (from folder name)
    metadata: Record<string, any>;
    bodyCallbacks: () => Promise<string>; // Lazy load body
}

/**
 * Lists all markdown files in the content directory.
 * @param contentDir Absolute path to the content root directory
 */
export async function listContentFiles(contentDir: string): Promise<ContentAsset[]> {
    if (!await fs.pathExists(contentDir)) {
        return [];
    }

    const assets: ContentAsset[] = [];

    async function scan(dir: string) {
        const files = await fs.readdir(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                await scan(fullPath);
            } else if (file.endsWith('.md')) {
                const relativePath = path.relative(contentDir, fullPath);
                // e.g. blog/2024-01-01-hello.md -> blog, 2024-01-01-hello
                const parts = relativePath.split(path.sep);
                const folder = parts.length > 1 ? parts[0] : 'page';
                const name = path.basename(file, '.md');
                
                // Construct URL: /folder/name
                const url = `/${folder}/${name}`;

                assets.push({
                    slug: name,
                    path: relativePath,
                    url,
                    contentType: folder,
                    metadata: {}, // Will be populated on load
                    bodyCallbacks: async () => {
                        const raw = await fs.readFile(fullPath, 'utf-8');
                        const { content, data } = matter(raw);
                        // Store metadata in the closure's scope or return it? 
                        // Actually, we usually want metadata upfront for listing.
                        // Let's refactor to read frontmatter immediately, but process HTML lazily?
                        // For static builds, we can just read it all.
                        return marked.parse(content) as string;
                    } 
                });
            }
        }
    }

    await scan(contentDir);
    
    // Pass 2: Populate metadata for all (lightweight enough for FS)
    // We do this so we can filter/sort by date/title without reading full body logic if simplified
    // But honestly for an SSG, reading all frontmatter is fine.
    const enrichedAssets = await Promise.all(assets.map(async (asset) => {
         const fullPath = path.join(contentDir, asset.path);
         const raw = await fs.readFile(fullPath, 'utf-8');
         const { data } = matter(raw);
         return {
             ...asset,
             metadata: data
         };
    }));

    return enrichedAssets;
}

/**
 * Parse a specific markdown file
 */
export async function parseMarkdownFile(filePath: string) {
    const raw = await fs.readFile(filePath, 'utf-8');
    const { content, data } = matter(raw);
    const html = await marked.parse(content);
    return {
        metadata: data,
        html
    };
}
