# PHASE1_TASKS.md — MVP: Declare Entities → Get Websites

> **Goal:** Define entities → get working websites with derived pages, routes, and AI-generated content.
> **Success Metric:** Add an entity, pages appear. Drop an MD file, blog post appears.

---

## What We're Building

```
INPUT                                    OUTPUT
─────                                    ──────
┌─────────────────────────┐              ┌─────────────────────────┐
│  Entity Definitions     │              │  Complete Websites      │
│  • Products             │              │  • All pages exist      │
│  • Features             │       →      │  • All routes work      │
│  • Solutions            │              │  • Content populated    │
│  • Use Cases            │              │  • Styles applied       │
│  • Personas             │              │                         │
└─────────────────────────┘              └─────────────────────────┘

┌─────────────────────────┐              ┌─────────────────────────┐
│  MD Files in Folders    │       →      │  Blog/Docs with Routes  │
└─────────────────────────┘              └─────────────────────────┘

┌─────────────────────────┐              ┌─────────────────────────┐
│  Style Tokens           │       →      │  Consistent Design      │
└─────────────────────────┘              └─────────────────────────┘
```

---

## Task Sequence

### TASK_001: Audit Existing Code ✓
**File:** `TASK_001_AUDIT.md`
**Output:** `AUDIT_REPORT.md`
**Blocking:** All other tasks

The `old-builder/` folder contains working prototypes of:
- Section rendering with scroll-based animations
- On-page editing controls
- Overlay and sidebar editor arrangements
- Template configuration UI

**Do not rewrite.** Extract and connect to data layer.

---

### TASK_002: Database Schema & Core Functions

**Prerequisites:** TASK_001 complete

**Deliverables:**
```
src/core/
├── db.ts              # SQLite connection, migrations
├── schema.sql         # Complete schema
├── entities.ts        # Entity CRUD
├── relationships.ts   # Relationship CRUD
├── targeting.ts       # Use Cases, Segments, Personas
├── idempotency.ts     # Content hashing
└── index.ts           # Public API exports
```

**Key Tables:**
- `entities` — All entity types in one table
- `relationships` — Typed edges between entities
- `use_case_dimensions` — Targeting dimensions (companySize, sector, etc.)
- `use_case_values` — Values within dimensions (SMB, Healthcare, etc.)
- `persona_targeting` — Which values each product targets per DM/EU/IN

**Acceptance Criteria:**
```typescript
import { createEntity, createRelationship, getEntityGraph } from './core';

// Create brand
const brand = createEntity(db, {
  type: 'brand',
  slug: 'oblio',
  name: 'Oblio',
  description: 'Marketing attribution platform',
});

// Create product with persona targeting
const product = createEntity(db, {
  type: 'product',
  slug: 'attribution-engine',
  name: 'Attribution Engine',
  data: {
    personas: {
      DM: { companySize: ['smb', 'mid'], department: ['marketing'] },
      EU: { companySize: ['smb', 'mid'], department: ['marketing'] },
      IN: { department: ['finance'] }
    }
  }
});

// Create relationship
createRelationship(db, {
  from_id: brand.id,
  to_id: product.id,
  type: 'offers',
});

// Query the graph
const graph = getEntityGraph(db, brand.id, { depth: 2 });
```

**Tests Required:**
- [ ] Slug uniqueness is global (not per-type)
- [ ] Idempotency: same content → skip
- [ ] Idempotency: changed content → update
- [ ] Use Case parent/child relationships work
- [ ] Persona targeting values stored and queryable

---

### TASK_003: Seed Data & CLI

**Prerequisites:** TASK_002 complete

**Deliverables:**
```
src/cli/
├── seed.ts            # Seed database
├── build.ts           # Build sites
└── index.ts           # CLI entry point

data/seeds/
├── oblio.json         # Oblio example data
└── targeting.json     # Use Case dimensions/values
```

**Seed Data Structure:**
```
Brands:
├── Timothy Solomon (timothysolomon.com)
├── Hire Timothy (hiretimothysolomon.com)
├── FTL Marketing (ftlmarketing.com)
├── Victory Initiative (victoryinitiative.com)
└── Oblio (oblio.app)

Shared Features (used across brands):
├── Positioning
├── Paid Media
├── Attribution
├── Reporting
├── CRM Schema
└── ...

Shared Solutions:
├── Clarify Position
├── Prove ROI
├── Track Journey
├── Fix Pipeline
└── ...

Use Case Dimensions:
├── Company Size: [Proprietor, Micro, SMB, Mid, Large, Enterprise]
├── Sector: [Healthcare, Technology, Finance, ...]
├── Department: [Marketing, Sales, RevOps, ...]
└── Seniority: [IC, Manager, Director, VP, C-Level]
```

**Acceptance Criteria:**
```bash
npm run db:migrate    # Creates tables
npm run db:seed       # Populates data
npm run db:reset      # Drops and recreates

sqlite3 data/vi.sqlite "SELECT slug, type FROM entities LIMIT 10;"
```

---

### TASK_004: Page Derivation Engine

**Prerequisites:** TASK_003 complete

**Deliverables:**
```
src/core/
├── compiler.ts        # Page derivation logic
├── templates.ts       # Template registry
└── segments.ts        # Segment page logic
```

**Core Function:**
```typescript
function derivePage(db: Database, entitySlug: string, segment?: string): DerivedPage {
  const entity = getEntityBySlug(db, entitySlug);
  const relationships = getRelationshipsFrom(db, entity.id);

  const sections: DerivedSection[] = [];

  // 1. Hero section (self binding)
  sections.push({
    binding: { kind: 'self' },
    templateKey: `self.hero.${entity.type}.v1`,
    data: entity,
  });

  // 2. Related sections (one per relationship type)
  // If segment provided, filter related entities
  for (const [relType, rels] of groupBy(relationships, 'type')) {
    let targets = rels.map(r => getEntity(db, r.to_id));
    
    if (segment) {
      targets = filterBySegment(targets, segment);
    }
    
    if (targets.length === 0) continue;
    
    sections.push({
      binding: { kind: 'related', target: targets[0].type, cardinality: targets.length === 1 ? 'one' : 'many' },
      templateKey: `related.${targets[0].type}.${targets.length === 1 ? 'one' : 'many'}.v1`,
      data: targets,
    });
  }

  // 3. CTA section
  sections.push({
    binding: { kind: 'self' },
    templateKey: `self.cta.v1`,
    data: entity,
  });

  return { entity, slug: entity.slug, segment, sections };
}
```

**Segment Pages:**
```typescript
// /industries/healthcare → all healthcare content
// /industries/healthcare/lead-scoring → healthcare × lead-scoring

function deriveSegmentPage(db: Database, dimension: string, value: string, focusSlug?: string): DerivedPage {
  // Aggregate content matching this segment
  const matchingAssets = queryAssetsBySegment(db, { dimension, value });
  const matchingEntities = queryEntitiesBySegment(db, { dimension, value });
  
  // If focus entity, show it prominently
  const focusEntity = focusSlug ? getEntityBySlug(db, focusSlug) : null;
  
  return {
    slug: focusSlug ? `${dimension}/${value}/${focusSlug}` : `${dimension}/${value}`,
    sections: [
      { binding: { kind: 'segment-hero' }, data: { dimension, value } },
      focusEntity && { binding: { kind: 'focus' }, data: focusEntity },
      { binding: { kind: 'segment-content' }, data: matchingAssets },
      { binding: { kind: 'segment-entities' }, data: matchingEntities },
    ].filter(Boolean)
  };
}
```

---

### TASK_005: Static Build Output

**Prerequisites:** TASK_004 complete

**Deliverables:**
```
dist/
├── sites/
│   ├── oblio.app/
│   │   ├── pages/
│   │   │   ├── products/attribution-engine.json
│   │   │   ├── features/data-integration.json
│   │   │   └── ...
│   │   └── routes.json
│   ├── hiretimothysolomon.com/
│   │   └── ...
│   └── ...
├── shared/
│   ├── features/        # Shared feature data
│   ├── solutions/       # Shared solution data
│   └── targeting/       # Use case dimensions
└── site-manifest.json
```

**Routes include segment pages:**
```json
{
  "/": "brand/oblio",
  "/products/attribution-engine": "products/attribution-engine",
  "/features/data-integration": "features/data-integration",
  "/industries/healthcare": "segments/industries/healthcare",
  "/industries/healthcare/attribution": "segments/industries/healthcare/attribution",
  "/company-size/enterprise": "segments/company-size/enterprise"
}
```

---

### TASK_006: MD File Ingestion

**Prerequisites:** TASK_005 complete

**Deliverables:**
```
src/core/
├── content.ts         # MD file processing
└── content-routes.ts  # Route generation for content
```

**How it works:**
```
content/
├── blog/
│   └── 2024-01-15-attribution-basics.md
└── docs/
    └── getting-started.md

↓ Build process ↓

dist/sites/oblio.app/
├── blog/
│   └── attribution-basics.json
└── docs/
    └── getting-started.json
```

**Frontmatter → Metadata:**
```markdown
---
title: Attribution Basics
date: 2024-01-15
tags: [attribution, marketing]
related: [attribution-engine, data-integration]
---

Content here...
```

**Index pages auto-generate:**
- `/blog` → list of all blog posts
- `/docs` → documentation index

---

### TASK_007: Content Constraints & AI Generation

**Prerequisites:** TASK_006 complete

**Deliverables:**
```
src/core/
├── constraints.ts     # Character limits, rules
└── generator.ts       # AI first-pass content
```

**Constraints Schema:**
```typescript
const contentConstraints = {
  'section.hero.headline': { maxChars: 30, typography: 'display-large' },
  'section.hero.subhead': { maxChars: 90, typography: 'title-medium' },
  'card.title': { maxChars: 40, typography: 'title-small' },
  'card.description': { maxChars: 120, typography: 'body-medium' },
  'tile.label': { maxChars: 20, typography: 'label-medium' },
};
```

**AI Generation:**
```typescript
async function generateFirstPass(entity: Entity, template: Template): Promise<GeneratedContent> {
  const constraints = getConstraintsForTemplate(template);
  
  // AI generates within constraints
  const content = await ai.generate({
    entity,
    template,
    constraints,
    prompt: `Generate content for ${entity.name}. 
             Headline max ${constraints.headline.maxChars} chars.
             Description max ${constraints.description.maxChars} chars.`
  });
  
  return content;
}
```

---

### TASK_008: Template Registry

**Prerequisites:** TASK_007 complete

**Deliverables:**
```
src/templates/
├── registry.ts        # Template lookup
├── self/
│   ├── hero.brand.v1.ts
│   ├── hero.product.v1.ts
│   └── cta.v1.ts
├── related/
│   ├── feature.many.grid.v1.ts
│   ├── feature.many.marquee.v1.ts
│   └── solution.many.stack.v1.ts
└── segment/
    ├── hero.v1.ts
    └── content.v1.ts
```

**Template Structure:**
```typescript
interface SectionTemplate {
  key: string;                    // 'related.feature.many.grid.v1'
  bindingSignature: string;       // 'related.feature.many'
  name: string;                   // 'Feature Grid'
  constraints: ContentConstraints;
  defaultConfig: SectionConfig;   // Uses VIv5 section config format
}
```

---

### TASK_009: Runtime Renderer

**Prerequisites:** TASK_008 complete, AUDIT_REPORT.md available

**Deliverables:**
```
src/renderer/
├── PageLoader.tsx     # Loads JSON, renders sections
├── SectionRenderer.tsx # Renders section by template
└── integration.ts     # Connect to old-builder components
```

**Integration with old-builder:**

The `old-builder/` folder has working section rendering. This task connects it to derived page data:

```typescript
function PageLoader({ slug }: { slug: string }) {
  const pageData = usePageData(slug);  // Load from dist/pages/
  
  return (
    <div className="page">
      {pageData.sections.map(section => (
        <SectionRenderer 
          key={section.id}
          template={section.templateKey}
          binding={section.binding}
          data={section.data}
        />
      ))}
    </div>
  );
}
```

---

### TASK_010: Editor Integration

**Prerequisites:** TASK_009 complete

**Deliverables:**
- Editor tools connected to Core Functions
- Same components in Overlay/Sidebar/Forms views
- Preview mode on production (no backend = no persistence)

**See:** `EDITOR_ARCHITECTURE.md` for full specification.

**Key Integration Points:**
1. Form components call Core Functions, not local state
2. Backend availability detection
3. Graceful preview mode when no backend

---

### TASK_011: MCP Tools

**Prerequisites:** TASK_002 complete (can parallel with GUI tasks)

**Deliverables:**
```
src/mcp/
├── server.ts          # MCP server setup
└── tools.ts           # Tool definitions
```

**Tools:**
- `create_entity`
- `update_entity`
- `delete_entity`
- `create_relationship`
- `query_entities`
- `get_entity_graph`
- `generate_content` (AI first pass)
- `build_site`

**All tools wrap Core Functions.** Same validation, same result as GUI.

---

## Phase 1 Complete Checklist

- [ ] TASK_001: Audit complete
- [ ] TASK_002: Core Functions work, tests pass
- [ ] TASK_003: Seed data loads
- [ ] TASK_004: Page derivation produces correct sections
- [ ] TASK_005: Build outputs valid JSON with routes
- [ ] TASK_006: MD files become blog/docs pages
- [ ] TASK_007: Content constraints enforced, AI generates within bounds
- [ ] TASK_008: Templates registered and selectable
- [ ] TASK_009: Pages render in browser
- [ ] TASK_010: Editor saves to database
- [ ] TASK_011: MCP tools work for AI access

## Definition of Done

**Phase 1 is complete when:**

1. Add a product entity → product page appears at correct URL
2. Add a feature, connect to product → feature section appears on product page
3. Drop MD file in content/blog → blog post appears with route
4. Change style token → all pages reflect change
5. AI generates first-pass content within character limits
6. Human can edit via Overlay or Sidebar mode
7. AI can edit via MCP tools with same result

---

## What's NOT in Phase 1

Deferred to Phase 2+:
- Full campaign/asset group model
- Health scoring
- Workflow execution
- Multi-tenant (multiple users editing same site)
- Advanced persona matching logic
- Integration with actual Oblio CRM
