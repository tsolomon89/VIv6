import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { initDb } from '../core/db.js';
import { getRecordBySlug } from '../core/records.js';
import { listDomains } from '../core/domains.js';
import { DEFAULT_ACCOUNT_ID } from '../core/constants.js';

interface TenantSeed {
  tenant_slug?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');
const TENANTS_DIR = path.join(ROOT, 'data', 'seeds', 'tenants');

function loadTenantSlugs(): string[] {
  if (!fs.existsSync(TENANTS_DIR)) {
    throw new Error(`Tenant seed directory not found: ${TENANTS_DIR}`);
  }

  const files = fs
    .readdirSync(TENANTS_DIR)
    .filter((fileName) => fileName.endsWith('.json'))
    .sort();

  const slugs: string[] = [];
  for (const fileName of files) {
    const filePath = path.join(TENANTS_DIR, fileName);
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as TenantSeed;
    const slug = parsed.tenant_slug?.trim();
    if (!slug) {
      throw new Error(`Missing tenant_slug in ${filePath}`);
    }
    slugs.push(slug);
  }

  if (slugs.length === 0) {
    throw new Error('No tenant slugs were found in data/seeds/tenants.');
  }

  return slugs;
}

function resolveOutputFolder(tenantSlug: string): string {
  const tenantAccount = getRecordBySlug(DEFAULT_ACCOUNT_ID, tenantSlug);
  if (!tenantAccount) {
    throw new Error(`No tenant account record found for slug: ${tenantSlug}`);
  }

  const activeDomains = listDomains(tenantAccount.id).filter((domain) => domain.status === 'active');
  const primaryDomain = activeDomains.find((domain) => domain.is_primary) || activeDomains[0];
  return primaryDomain?.hostname || tenantSlug;
}

function runBrandBuild(tenantSlug: string): void {
  const npmExecPath = process.env.npm_execpath;
  if (!npmExecPath) {
    throw new Error('npm_execpath is unavailable; run this script via `npm run`.');
  }

  const result = spawnSync(process.execPath, [npmExecPath, 'run', 'build:brand', '--', `--brand=${tenantSlug}`], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: false,
    maxBuffer: 1024 * 1024 * 20,
  });

  if (result.error || result.status !== 0) {
    const output = `${result.stdout || ''}\n${result.stderr || ''}`.trim();
    const errorMessage = result.error ? `\n${result.error.message}` : '';
    throw new Error(
      `Brand build failed for ${tenantSlug} (exit ${result.status ?? 'null'}).${errorMessage}\n${output}`
    );
  }
}

function assertNoCrossBrandBleed(
  distFolder: string,
  tenantSlug: string,
  tenantSlugs: string[]
): void {
  if (!fs.existsSync(distFolder)) {
    return;
  }

  const entryNames = fs.readdirSync(distFolder, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const otherSlug of tenantSlugs) {
    if (otherSlug === tenantSlug) {
      continue;
    }
    if (entryNames.includes(otherSlug)) {
      throw new Error(
        `Cross-brand bleed detected for ${tenantSlug}: found sibling tenant directory "${otherSlug}" in ${distFolder}`
      );
    }
  }
}

function verifyBrandBuilds(): void {
  initDb();

  const tenantSlugs = loadTenantSlugs();
  console.log(`[verify_brand_builds] Verifying ${tenantSlugs.length} seeded brands...`);

  for (const tenantSlug of tenantSlugs) {
    const outputFolder = resolveOutputFolder(tenantSlug);
    console.log(`[verify_brand_builds] Building ${tenantSlug} -> dist/${outputFolder}`);

    runBrandBuild(tenantSlug);

    const distFolder = path.join(ROOT, 'dist', outputFolder);
    const expectedIndex = path.join(distFolder, 'index.html');
    if (!fs.existsSync(expectedIndex)) {
      throw new Error(
        `Expected artifact missing for ${tenantSlug}: ${path.relative(ROOT, expectedIndex)}`
      );
    }

    assertNoCrossBrandBleed(distFolder, tenantSlug, tenantSlugs);

    console.log(`[verify_brand_builds] PASS ${tenantSlug}: ${path.relative(ROOT, expectedIndex)}`);
  }

  console.log('[verify_brand_builds] All seeded brand builds passed.');
}

try {
  verifyBrandBuilds();
} catch (error) {
  console.error('[verify_brand_builds] FAILURE');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
