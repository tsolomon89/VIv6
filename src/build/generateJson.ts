import fs from 'fs-extra';
import path from 'path';
import { initDb, db } from '../core/db.js';
import { listRecords, getRecordBySlug } from '../core/records.js';
import { derivePage } from '../core/compiler.js';
import { listDomains, Domain } from '../core/domains.js';
import { createHash } from 'crypto';
import { SYSTEM_ACCOUNT_ID } from '../core/constants.js';

// Parse CLI args
const args = process.argv.slice(2);
const brandArg = args.find(a => a.startsWith('--brand='));
const TARGET_BRAND = brandArg ? brandArg.split('=')[1] : null;

interface RouteEntry {
  path: string;
  record: string;
  template: string | null;
  segment?: string;
}

async function buildDomain(
  domain: Domain,
  brandRecord: { id: string; slug: string },
) {
  const DIST_DIR = path.resolve('dist', 'sites', domain.hostname);
  await fs.ensureDir(path.join(DIST_DIR, 'pages'));

  // Fetch records scoped to this brand
  const allRecords = listRecords(brandRecord.id);
  // Include the brand record itself
  if (!allRecords.find(e => e.id === brandRecord.id)) {
    const brand = getRecordBySlug(brandRecord.id, brandRecord.slug);
    if (brand) allRecords.push(brand);
  }

  // Filter by domain's object_types scope (if specified)
  const scopedRecords = domain.object_types.length > 0
    ? allRecords.filter(e => domain.object_types.includes(e.type) || e.type === 'brand')
    : allRecords;

  console.log(`  [${domain.hostname}] ${scopedRecords.length} records (type=${domain.type})`);

  const routes: RouteEntry[] = [];
  let built = 0;
  let skipped = 0;

  for (const record of scopedRecords) {
    const derived = derivePage(record.slug, undefined, domain.type);
    if (!derived) {
      skipped++;
      continue;
    }

    // Idempotency check via content hash
    const contentHash = createHash('md5').update(JSON.stringify(derived)).digest('hex');
    const existingBuild = db.prepare(
      'SELECT content_hash FROM build_state WHERE record_id = ?'
    ).get(record.id) as { content_hash: string } | undefined;

    if (existingBuild?.content_hash === contentHash) {
      skipped++;
      continue;
    }

    // Write main page JSON
    const typePlural = derived.route.split('/')[1];
    const pageDir = path.join(DIST_DIR, 'pages', typePlural);
    await fs.ensureDir(pageDir);
    await fs.writeJson(path.join(pageDir, `${record.slug}.json`), derived, { spaces: 2 });

    routes.push({ path: derived.route, record: record.id, template: null });

    // Write segment pages
    for (const seg of derived.segmentPages) {
      const segDerived = derivePage(record.slug, seg.segment, domain.type);
      if (segDerived) {
        const segDir = path.join(DIST_DIR, 'pages', typePlural, record.slug);
        await fs.ensureDir(segDir);
        await fs.writeJson(path.join(segDir, `${seg.segment}.json`), segDerived, { spaces: 2 });
        routes.push({ path: seg.path, record: record.id, template: seg.template, segment: seg.segment });
      }
    }

    // Update build_state
    db.prepare(`
      INSERT INTO build_state (record_id, content_hash, status, last_built_at)
      VALUES (?, ?, 'success', ?)
      ON CONFLICT(record_id) DO UPDATE SET
        content_hash = excluded.content_hash,
        status = 'success',
        last_built_at = excluded.last_built_at,
        error = NULL
    `).run(record.id, contentHash, new Date().toISOString());

    built++;
  }

  // Write routes.json
  await fs.writeJson(path.join(DIST_DIR, 'routes.json'), routes, { spaces: 2 });

  // Write site.json manifest
  await fs.writeJson(path.join(DIST_DIR, 'site.json'), {
    hostname: domain.hostname,
    brandId: brandRecord.id,
    brandSlug: brandRecord.slug,
    type: domain.type,
    config: domain.config,
    generatedAt: new Date().toISOString(),
    routeCount: routes.length,
  }, { spaces: 2 });

  console.log(`  [${domain.hostname}] ${built} built, ${skipped} skipped, ${routes.length} routes`);
  return { built, skipped, routes: routes.length };
}

async function buildJson() {
  console.log('Starting JSON Build...');
  initDb();

  if (!TARGET_BRAND) {
    // Build all brands that have domains
    const allDomains = listDomains();
    if (allDomains.length === 0) {
      console.log('No domains configured. Nothing to build.');
      return;
    }

    // Group domains by account_id
    const byBrand = new Map<string, Domain[]>();
    for (const d of allDomains) {
      if (!byBrand.has(d.account_id)) byBrand.set(d.account_id, []);
      byBrand.get(d.account_id)!.push(d);
    }

    for (const [brandId, domains] of byBrand) {
      // Find brand record
      const brandRecord = listRecords(brandId, 'brand').find(e => e.id === brandId);
      if (!brandRecord) {
        console.log(`Skipping brand_id=${brandId} (record not found)`);
        continue;
      }
      console.log(`Building brand: ${brandRecord.name} (${domains.length} domains)`);
      for (const domain of domains) {
        if (domain.status !== 'active') continue;
        await buildDomain(domain, { id: brandRecord.id, slug: brandRecord.slug });
      }
    }
  } else {
    const brandRecord = getRecordBySlug(SYSTEM_ACCOUNT_ID, TARGET_BRAND);
    if (!brandRecord) throw new Error(`Brand not found: ${TARGET_BRAND}`);

    const domains = listDomains(brandRecord.id);

    if (domains.length === 0) {
      // Fallback: no domains table entries, use legacy single-domain approach
      console.log(`No domains for brand "${TARGET_BRAND}", using legacy fallback.`);
      const brandData = brandRecord.data?.fieldGroups?.find((g: any) => g.name === 'Configuration');
      const domainField = brandData?.fields?.find((f: any) => f.name === 'Domain');
      const hostname = (domainField?.values?.[0] as string) || TARGET_BRAND;

      // Create a synthetic domain for backward compat
      const syntheticDomain: Domain = {
        id: 'legacy',
        account_id: brandRecord.id,
        hostname,
        type: 'www',
        is_primary: true,
        config: {},
        object_types: [],
        status: 'active',
        created_at: '',
        updated_at: '',
      };
      await buildDomain(syntheticDomain, { id: brandRecord.id, slug: brandRecord.slug });
    } else {
      console.log(`Building brand: ${brandRecord.name} (${domains.length} domains)`);
      for (const domain of domains) {
        if (domain.status !== 'active') continue;
        await buildDomain(domain, { id: brandRecord.id, slug: brandRecord.slug });
      }
    }
  }

  console.log('Build complete!');
}

buildJson().catch(err => {
  console.error('Build Failed:', err);
  process.exit(1);
});
