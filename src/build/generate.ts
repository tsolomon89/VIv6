import fs from 'fs-extra';
import path from 'path';
import { initDb, db } from '../core/db.js';
import { DataRecord, Field } from '../core/types.js';
import { listRecords, getRecordBySlug } from '../core/records.js';
import { listContentFiles, parseMarkdownFile } from '../core/content.js';
import { registerPartials, renderTemplate, renderLayout } from './renderer.js';
import { assemblePageContext } from './assembler.js';
import { generateAnalyticsHead, generateAnalyticsBody, AnalyticsConfig } from './analyticsRegistry.js';
import { listDomains } from '../core/domains.js';
import { DEFAULT_ACCOUNT_ID } from '../core/constants.js';

const args = process.argv.slice(2);
const TARGET_BRAND = parseBrandArg(args);
const TEMPLATES_DIR = path.resolve('src/templates');
const PROJECT_ROOT = process.cwd();

interface SectionTemplate {
  key: string;
  config: string;
}

interface PageTemplateRow {
  key: string;
  subject_target: string;
  sections: string;
}

interface PageTemplate {
  key: string;
  subject_target: string;
  sections: any[];
}

interface BrandConfig {
  gtmId?: string;
  gaId?: string;
  fbPixelId?: string;
  customScripts?: string[];
  [key: string]: unknown;
}

interface BuildScope {
  accountId: string;
  outputDir: string;
  brandConfig: BrandConfig;
  scopeRecord?: DataRecord;
}

function parseBrandArg(argv: string[]): string | null {
  const equalsArg = argv.find((arg) => arg.startsWith('--brand='));
  if (equalsArg) {
    const value = equalsArg.slice('--brand='.length).trim();
    return value.length > 0 ? value : null;
  }

  const brandIndex = argv.findIndex((arg) => arg === '--brand');
  if (brandIndex >= 0) {
    const next = argv[brandIndex + 1];
    if (next && !next.startsWith('--')) {
      return next.trim();
    }
  }

  return null;
}

function normalizeToArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined || value === null) {
    return [];
  }
  return [value];
}

function isTruthyValue(value: unknown): boolean {
  if (value === true) {
    return true;
  }
  if (typeof value === 'string') {
    return ['true', '1', 'yes'].includes(value.toLowerCase());
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return false;
}

function readFieldValues(record: DataRecord, fieldName: string): unknown[] {
  const groups = record.data?.fieldGroups;
  if (!Array.isArray(groups)) {
    return [];
  }

  for (const group of groups) {
    const fields = Array.isArray(group?.fields) ? (group.fields as Field[]) : [];
    const field = fields.find((entry) => entry?.name === fieldName);
    if (field) {
      return normalizeToArray(field.values);
    }
  }

  return [];
}

function isSiteOwnerRecord(record: DataRecord): boolean {
  if (record.type !== 'brand') {
    return false;
  }

  if (isTruthyValue(record.data?.is_site_owner)) {
    return true;
  }

  const fieldValues = readFieldValues(record, 'Is Site Owner');
  return fieldValues.some((value) => isTruthyValue(value));
}

function getPageTemplate(record: DataRecord, templates: PageTemplate[]): PageTemplate | undefined {
  const specificKey = `${record.slug}-home`;
  const specific = templates.find((tpl) => tpl.key === specificKey);
  if (specific) {
    return specific;
  }

  const generic = templates.find(
    (tpl) => tpl.subject_target === record.type && !tpl.key.includes('-')
  );
  if (generic) {
    return generic;
  }

  return templates.find((tpl) => tpl.subject_target === record.type);
}

function getOutputPath(outputDir: string, record: DataRecord, rootRecordId?: string): string {
  const isRoot = rootRecordId ? record.id === rootRecordId : record.slug === 'brand' || record.slug === 'home';
  if (isRoot) {
    return path.join(outputDir, 'index.html');
  }
  return path.join(outputDir, record.slug, 'index.html');
}

function selectRootRecord(records: DataRecord[], scopeRecord?: DataRecord): DataRecord | undefined {
  if (records.length === 0) {
    return scopeRecord;
  }

  return (
    records.find((record) => isSiteOwnerRecord(record)) ||
    records.find((record) => record.slug === 'home') ||
    records.find((record) => record.type === 'brand') ||
    (scopeRecord ? records.find((record) => record.id === scopeRecord.id) : undefined) ||
    records[0]
  );
}

function resolveBuildScope(targetBrand: string | null): BuildScope {
  if (!targetBrand) {
    return {
      accountId: DEFAULT_ACCOUNT_ID,
      outputDir: path.resolve('dist'),
      brandConfig: {},
    };
  }

  const scopeRecord = getRecordBySlug(DEFAULT_ACCOUNT_ID, targetBrand);
  if (!scopeRecord) {
    throw new Error(`Brand account not found for slug: ${targetBrand}`);
  }

  const activeDomains = listDomains(scopeRecord.id).filter((domain) => domain.status === 'active');
  const primaryDomain = activeDomains.find((domain) => domain.is_primary) || activeDomains[0];
  const outputKey = primaryDomain?.hostname || targetBrand;

  return {
    accountId: scopeRecord.id,
    outputDir: path.resolve('dist', outputKey),
    brandConfig: (primaryDomain?.config || {}) as BrandConfig,
    scopeRecord,
  };
}

function loadTemplates() {
  let sectionTemplates = new Map<string, any>();
  let pageTemplates: PageTemplate[] = [];

  try {
    const sectionRows = db
      .prepare('SELECT key, config FROM section_templates')
      .all() as SectionTemplate[];

    sectionTemplates = new Map(
      sectionRows.map((row) => [row.key, JSON.parse(row.config)])
    );

    const pageRows = db
      .prepare('SELECT key, subject_target, sections FROM page_templates')
      .all() as PageTemplateRow[];

    pageTemplates = pageRows.map((row) => ({
      key: row.key,
      subject_target: row.subject_target,
      sections:
        typeof row.sections === 'string'
          ? (JSON.parse(row.sections) as any[])
          : Array.isArray(row.sections)
            ? (row.sections as unknown as any[])
            : [],
    }));
  } catch {
    console.warn(
      'Warning: template tables are unavailable or empty, using fallback section rendering.'
    );
  }

  return { sectionTemplates, pageTemplates };
}

async function build(): Promise<void> {
  console.log('Starting build...');

  initDb();

  const scope = resolveBuildScope(TARGET_BRAND);
  if (TARGET_BRAND) {
    console.log(`Scoping build to tenant slug: ${TARGET_BRAND}`);
    console.log(`Resolved account scope: ${scope.accountId}`);
    console.log(`Output directory: ${scope.outputDir}`);
  }

  await fs.ensureDir(scope.outputDir);
  await fs.emptyDir(scope.outputDir);

  await registerPartials(TEMPLATES_DIR);
  const layoutPath = path.join(TEMPLATES_DIR, 'layout.hbs');

  const { sectionTemplates, pageTemplates } = loadTemplates();
  console.log(`Loaded ${sectionTemplates.size} section templates`);
  console.log(`Loaded ${pageTemplates.length} page templates`);

  const records = listRecords(scope.accountId, undefined);
  if (TARGET_BRAND && scope.scopeRecord && !records.find((record) => record.id === scope.scopeRecord?.id)) {
    records.push(scope.scopeRecord);
  }

  if (records.length === 0) {
    throw new Error(`No records found for scoped build (${TARGET_BRAND || scope.accountId}).`);
  }

  const rootRecord = selectRootRecord(records, scope.scopeRecord);
  const rootRecordId = rootRecord?.id;
  console.log(`Found ${records.length} records to render`);
  if (rootRecord) {
    console.log(`Root record: ${rootRecord.slug} (${rootRecord.type})`);
  }

  const themePath = path.join(PROJECT_ROOT, 'src/themes/victory-studio/dist');
  const themeHtmlPath = path.join(themePath, 'index.html');
  const useReactTheme = await fs.pathExists(themeHtmlPath);
  const themeHtml = useReactTheme ? await fs.readFile(themeHtmlPath, 'utf-8') : '';
  const themeAssetsPath = path.join(themePath, 'assets');
  let copiedThemeAssets = false;

  for (const record of records) {
    console.log(`Building: ${record.slug} (${record.type})`);

    const context = assemblePageContext(record);
    const fullContext: Record<string, unknown> = {
      ...context,
      brand: { ...context.record, ...scope.brandConfig },
      year: new Date().getFullYear(),
      theme: scope.brandConfig,
    };

    const pageTemplate = getPageTemplate(record, pageTemplates);
    if (pageTemplate) {
      console.log(`  Template: ${pageTemplate.key}`);
    }

    const outputPath = getOutputPath(scope.outputDir, record, rootRecordId);
    await fs.ensureDir(path.dirname(outputPath));

    if (useReactTheme) {
      const isRootRecord = rootRecordId
        ? record.id === rootRecordId
        : record.slug === 'brand' || record.slug === 'home';

      const themeSections = (pageTemplate?.sections || []).map((section: any, index: number) => ({
        schemaVersion: 1,
        id: section.uniqueId || `section-${index}`,
        presentationKey: section.templateKey || 'section.generic.v1',
        placement: { slot: index === 0 ? 'start' : 'free', order: section.order ?? index },
        binding: section.binding?.relationship
          ? { kind: 'collection', relationship: section.binding.relationship }
          : { kind: 'self' },
        overrides: section.overrides || {},
      }));

      const payload = {
        schemaVersion: 1,
        id: record.id,
        name: record.name,
        pageContext: { kind: isRootRecord ? 'index' : 'detail' },
        pageSubject: { target: record.type, cardinality: 'one' },
        sections: themeSections,
        themeConfig: scope.brandConfig,
      };

      const injection = `<script id="vi-config">window.VI_CONFIG = ${JSON.stringify(payload)};</script>`;
      const analyticsConfig: AnalyticsConfig = {
        gtmId: scope.brandConfig.gtmId,
        gaId: scope.brandConfig.gaId,
        fbPixelId: scope.brandConfig.fbPixelId,
        customScripts: scope.brandConfig.customScripts,
      };
      const analyticsHead = generateAnalyticsHead(analyticsConfig);
      const analyticsBody = generateAnalyticsBody(analyticsConfig);
      const finalHtml = themeHtml
        .replace('</head>', `${analyticsHead}\n${injection}</head>`)
        .replace(/<body([^>]*)>/, `<body$1>\n${analyticsBody}`);

      await fs.writeFile(outputPath, finalHtml);

      if (!copiedThemeAssets && (await fs.pathExists(themeAssetsPath))) {
        await fs.copy(themeAssetsPath, path.join(scope.outputDir, 'assets'));
        copiedThemeAssets = true;
      }

      continue;
    }

    let bodyHtml = '';

    if (pageTemplate) {
      for (const section of pageTemplate.sections) {
        const sectionTemplate = sectionTemplates.get(section.templateKey);
        if (!sectionTemplate) {
          console.warn(`  Missing section template: ${section.templateKey}`);
          continue;
        }

        let sectionData: Record<string, unknown> = { ...fullContext };
        if (section.binding?.relationship) {
          const relatedItems = ((fullContext.related as Record<string, unknown[]>)?.[
            section.binding.relationship
          ] || []) as unknown[];
          if (relatedItems.length === 0) {
            continue;
          }
          sectionData = { ...sectionData, items: relatedItems };
        }

        bodyHtml += await renderTemplate(
          path.join(TEMPLATES_DIR, sectionTemplate.templatePath),
          sectionData
        );
      }
    } else {
      const heroTemplate = sectionTemplates.get('hero.default.v1');
      if (heroTemplate) {
        bodyHtml += await renderTemplate(path.join(TEMPLATES_DIR, heroTemplate.templatePath), fullContext);
      }
    }

    const fullHtml = await renderLayout(layoutPath, bodyHtml, fullContext);
    await fs.writeFile(outputPath, fullHtml);
  }

  const contentDir = path.resolve('content');
  if (await fs.pathExists(contentDir) && useReactTheme) {
    console.log('Scanning content directory...');
    const contentFiles = await listContentFiles(contentDir);
    console.log(`Found ${contentFiles.length} markdown files`);

    for (const file of contentFiles) {
      console.log(`Building content: ${file.path}`);
      const { html, metadata } = await parseMarkdownFile(path.join(contentDir, file.path));

      const payload = {
        schemaVersion: 1,
        id: `content-${file.slug}`,
        name: metadata.title || file.slug,
        pageContext: { kind: 'detail' },
        pageSubject: { target: 'article', cardinality: 'one' },
        sections: [
          {
            schemaVersion: 1,
            id: 'main-content',
            placement: { slot: 'free' },
            binding: { kind: 'self' },
            presentationKey: 'content.default.v1',
            overrides: {
              height: { value: 200, endValue: null, isLinked: false },
              pinHeight: 0,
              children: [
                {
                  id: 'article-container',
                  shape: 'div',
                  className: 'w-full min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto',
                  children: [
                    {
                      id: 'article-title',
                      shape: 'text',
                      content: metadata.title || file.slug,
                      className:
                        'text-5xl md:text-6xl font-bold mb-8 text-white tracking-tighter',
                    },
                    metadata.date
                      ? {
                          id: 'article-meta',
                          shape: 'text',
                          content: new Date(metadata.date).toLocaleDateString(),
                          className:
                            'text-white/50 mb-12 font-mono text-sm uppercase tracking-widest',
                        }
                      : { id: 'meta-skip', shape: 'div' },
                    {
                      id: 'article-body',
                      shape: 'richtext',
                      content: html,
                      className: 'prose prose-invert prose-lg max-w-none',
                    },
                  ],
                },
              ],
            },
          },
        ],
        themeConfig: { ...scope.brandConfig, ...metadata },
      };

      const injection = `<script id="vi-config">window.VI_CONFIG = ${JSON.stringify(payload)};</script>`;
      const analyticsConfig: AnalyticsConfig = {
        gtmId: scope.brandConfig.gtmId,
        gaId: scope.brandConfig.gaId,
        fbPixelId: scope.brandConfig.fbPixelId,
        customScripts: scope.brandConfig.customScripts,
      };
      const analyticsHead = generateAnalyticsHead(analyticsConfig);
      const analyticsBody = generateAnalyticsBody(analyticsConfig);
      const finalHtml = themeHtml
        .replace('</head>', `${analyticsHead}\n${injection}</head>`)
        .replace(/<body([^>]*)>/, `<body$1>\n${analyticsBody}`);

      const contentOutDir = path.join(scope.outputDir, file.contentType, file.slug);
      await fs.ensureDir(contentOutDir);
      await fs.writeFile(path.join(contentOutDir, 'index.html'), finalHtml);
    }
  }

  console.log('Build complete');
}

build().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
