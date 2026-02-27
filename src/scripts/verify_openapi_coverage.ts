import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { swaggerSpec } from '../api/docs/openapi.js';
import { OPENAPI_INTERNAL_EXCLUSIONS } from '../api/docs/openapi_exclusions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function normalizeMountedRoute(route: string): string {
  const trimmed = route.trim().replace(/\/+$/, '');
  const parts = trimmed.split('/').filter(Boolean);
  if (parts.length < 2) {
    return trimmed || '/';
  }
  return `/${parts[0]}/${parts[1]}`;
}

function collectMountedApiRoutes(serverSource: string): Set<string> {
  const mounted = new Set<string>();
  const mountRegex = /^\s*app\.use\(\s*'([^']+)'/gm;
  let match: RegExpExecArray | null;

  while ((match = mountRegex.exec(serverSource)) !== null) {
    const route = match[1] as string;
    if (!route.startsWith('/api')) {
      continue;
    }
    if (route === '/api') {
      continue;
    }
    mounted.add(normalizeMountedRoute(route));
  }

  return mounted;
}

function collectDocumentedApiRoutes(): Set<string> {
  const documented = new Set<string>();
  const paths = Object.keys(swaggerSpec.paths || {});

  for (const route of paths) {
    if (!route.startsWith('/api')) {
      continue;
    }
    documented.add(normalizeMountedRoute(route));
  }

  return documented;
}

function main(): void {
  const serverPath = path.resolve(__dirname, '../api/server.ts');
  const serverSource = fs.readFileSync(serverPath, 'utf8');

  const mounted = collectMountedApiRoutes(serverSource);
  const documented = collectDocumentedApiRoutes();
  const excluded = new Set(OPENAPI_INTERNAL_EXCLUSIONS.map(normalizeMountedRoute));

  const missing = Array.from(mounted)
    .filter((route) => !documented.has(route) && !excluded.has(route))
    .sort();

  console.log(`[OpenAPI Coverage] Mounted: ${mounted.size}`);
  console.log(`[OpenAPI Coverage] Documented roots: ${documented.size}`);
  console.log(`[OpenAPI Coverage] Exclusions: ${excluded.size}`);

  if (missing.length > 0) {
    console.error('[OpenAPI Coverage] FAIL - missing documentation for mounted routes:');
    for (const route of missing) {
      console.error(`  - ${route}`);
    }
    process.exit(1);
  }

  console.log('[OpenAPI Coverage] PASS - all mounted routes are documented or excluded.');
}

main();
