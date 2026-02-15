# VIV5 INTEGRATION — Website Generator Surface

> **Purpose**: VIv5 is the website generation surface of the Oblio data model. This document specifies how VIv5 reads from and writes to Oblio.

---

## What VIv5 Does

```
INPUT                                    OUTPUT
─────                                    ──────
Oblio Entity Graph                       Complete Websites
  (Products, Features, Solutions)  →       All pages exist
                                           All routes work
MD Files in Folders                →       Blog/Docs with routes

Style Tokens                       →       Consistent design

AI First Pass                      →       Content populated
                                           Human edits what matters
```

**VIv5 does NOT own data.** It reads from Oblio, renders pages, and POSTs lead capture back to Oblio.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  OBLIO DATABASE                                             │
│  (Source of Truth)                                          │
│                                                             │
│  • Accounts (your brands)                                   │
│  • Entities (products, features, solutions)                 │
│  • EntityRelationships (has_feature, delivers, applies_to)  │
│  • DimensionValues (targeting vocabulary)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ READ
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  VIV5 BUILD PROCESS                                         │
│                                                             │
│  1. Query entity graph for operating account                │
│  2. Derive pages from relationships                         │
│  3. Apply templates based on bindings                       │
│  4. Generate static JSON + routes                           │
│  5. Output to dist/                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ RENDER
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  STATIC SITE                                                │
│                                                             │
│  • HTML/JS/CSS served from CDN                              │
│  • JSON page data loaded at runtime                         │
│  • Lead capture forms POST to Oblio API                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ WRITE (forms only)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  OBLIO API                                                  │
│                                                             │
│  • Create/update Contact                                    │
│  • Create Opportunity                                       │
│  • Log Activity                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Operating Account

VIv5 builds sites for ONE account at a time—the **operating account**.

```typescript
// Build config
{
  operating_account_id: 'account_oblio',
  domain: 'oblio.app',
  // ... build options
}
```

The operating account's entities become pages. Related accounts (vendors, partners) can contribute products if linked via AccountLink.

---

## Page Derivation

### The Core Function

```typescript
function derivePage(db: Database, entitySlug: string, segment?: string): DerivedPage {
  const entity = getEntityBySlug(db, entitySlug);
  const relationships = getRelationshipsFrom(db, entity.id);
  
  const sections: DerivedSection[] = [];
  
  // 1. Hero section (self binding)
  sections.push({
    slot: 'start',
    binding: { kind: 'self' },
    templateKey: resolveTemplate('self', entity.type),
    data: entity,
  });
  
  // 2. Related sections (from relationships)
  const grouped = groupBy(relationships, 'relationship_type');
  
  for (const [relType, rels] of Object.entries(grouped)) {
    let targets = rels.map(r => getEntity(db, r.to_entity_id));
    
    // Filter by segment if provided
    if (segment) {
      targets = filterBySegment(targets, segment);
    }
    
    if (targets.length === 0) continue;
    
    const targetType = targets[0].type;
    const cardinality = targets.length === 1 ? 'one' : 'many';
    
    sections.push({
      slot: 'free',
      order: getSectionOrder(relType),
      binding: { kind: 'related', target: targetType, cardinality },
      templateKey: resolveTemplate('related', targetType, cardinality),
      data: targets,
    });
  }
  
  // 3. CTA section (self binding, end slot)
  sections.push({
    slot: 'end',
    binding: { kind: 'self' },
    templateKey: resolveTemplate('self', 'cta'),
    data: entity,
  });
  
  return { 
    entity, 
    slug: entity.slug, 
    segment, 
    sections,
    route: buildRoute(entity, segment)
  };
}
```

### Binding Architecture

A section's meaning comes from its **binding**, not its component name.

```typescript
type Binding =
  | { kind: 'self' }
  | { kind: 'related'; target: EntityType; cardinality: 'one' | 'many' }
```

**Templates are indexed by binding signature:**

| Binding | Template Key Pattern |
|---------|---------------------|
| `{ kind: 'self' }` | `self.hero.v1`, `self.cta.v1` |
| `{ kind: 'related', target: 'feature', cardinality: 'many' }` | `related.feature.many.grid.v1` |
| `{ kind: 'related', target: 'solution', cardinality: 'one' }` | `related.solution.one.spotlight.v1` |

### Section Slots

```typescript
type Slot = 'start' | 'end' | 'free'

// start: Always first (hero)
// end: Always last (cta)
// free: Ordered by `order` field, between start and end
```

---

## Route Generation

### Entity Routes

```typescript
function buildRoute(entity: Entity, segment?: string): string {
  const typeToPath = {
    'product': 'products',
    'feature': 'features',
    'solution': 'solutions',
    'useCase': 'use-cases'
  };
  
  const base = `/${typeToPath[entity.type]}/${entity.slug}`;
  return segment ? `${base}/${segment}` : base;
}
```

### Generated Routes

```json
{
  "/": { "page": "brand", "slug": "oblio" },
  "/products/attribution-engine": { "page": "product", "slug": "attribution-engine" },
  "/products/attribution-engine/healthcare": { "page": "product", "slug": "attribution-engine", "segment": "healthcare" },
  "/features/data-integration": { "page": "feature", "slug": "data-integration" },
  "/solutions/automation": { "page": "solution", "slug": "automation" },
  "/industries/healthcare": { "page": "segment", "dimension": "sector", "value": "healthcare" }
}
```

### Segment Pages

Auto-generated for dimension values that are actually targeted:

```typescript
function shouldGenerateSegmentPage(db: Database, dimension: string, value: string): boolean {
  // Only generate if at least one entity targets this value
  const targeting = queryEntitiesTargeting(db, dimension, value);
  return targeting.length > 0;
}
```

---

## Template System

### Template Registry

```typescript
interface SectionTemplate {
  key: string;                      // 'related.feature.many.grid.v1'
  bindingSignature: string;         // 'related.feature.many'
  name: string;                     // 'Feature Grid'
  
  // Content constraints
  constraints: {
    headline: { maxChars: 30, typography: 'display-large' },
    subhead: { maxChars: 90, typography: 'title-medium' },
    // ...
  };
  
  // Visual configuration
  defaultConfig: SectionConfig;
}
```

### Template Resolution

```typescript
function resolveTemplate(
  bindingKind: 'self' | 'related',
  targetType: string,
  cardinality?: 'one' | 'many'
): string {
  const signature = bindingKind === 'self' 
    ? `self.${targetType}`
    : `related.${targetType}.${cardinality}`;
  
  // Find templates matching this signature
  const matching = templates.filter(t => t.bindingSignature === signature);
  
  // Return default or first match
  return matching.find(t => t.isDefault)?.key ?? matching[0]?.key;
}
```

### Template Selection UI

When editing a section:
1. Show current binding
2. Filter available templates by binding signature
3. Allow template swap within compatible templates

---

## Lead Capture

### Form Submission

```typescript
// VIv5 form handler
async function handleFormSubmit(formData: FormData) {
  // All fields are structured selections (no free text)
  const submission = {
    email: formData.email,
    companySize: formData.companySize,     // DimensionValue slug
    department: formData.department,        // DimensionValue slug
    seniority: formData.seniority,          // DimensionValue slug
    sector: formData.sector,                // DimensionValue slug
    // ...
    
    // Attribution from URL
    attribution: {
      url: window.location.pathname,
      referrer: document.referrer,
      // Parsed from URL structure
      objectType: 'product',
      subject: 'attribution-engine',
      segment: 'healthcare'
    }
  };
  
  // POST to Oblio API
  await fetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify(submission)
  });
}
```

### Oblio API Handler

```typescript
// Oblio API receives submission
async function handleLeadSubmission(submission) {
  // 1. Find or create Contact
  const contact = await findOrCreateContact(submission.email);
  
  // 2. Find or create household Account
  const household = await findOrCreateHousehold(contact);
  
  // 3. Match to Product persona
  const { product, personaType, matchScore } = await matchPersona(submission);
  
  // 4. Create Opportunity
  const opportunity = await createOpportunity({
    owner_account_id: operatingAccount.id,
    target_account_id: household.id,
    primary_contact_id: contact.id,
    opp_type: 'B2B',  // or B2C based on matching
    stage: 'MQL',
    product_ids: [product.id],
    data: {
      matchScore,
      personaType,
      attribution: submission.attribution
    }
  });
  
  // 5. Log Activity
  await createActivity({
    contact_id: contact.id,
    account_id: operatingAccount.id,
    activity_type: 'form_submit',
    opportunity_id: opportunity.id,
    data: submission.attribution
  });
}
```

---

## Build Output

### Directory Structure

```
dist/
├── sites/
│   ├── oblio.app/
│   │   ├── pages/
│   │   │   ├── index.json
│   │   │   ├── products/
│   │   │   │   ├── attribution-engine.json
│   │   │   │   └── campaigns-module.json
│   │   │   ├── features/
│   │   │   │   └── data-integration.json
│   │   │   └── segments/
│   │   │       └── healthcare.json
│   │   ├── routes.json
│   │   └── config.json
│   │
│   ├── hiretimothysolomon.com/
│   │   └── ...
│   │
│   └── ftlmarketing.com/
│       └── ...
│
└── shared/
    ├── templates/
    ├── dimension-values/
    └── assets/
```

### Page JSON

```json
{
  "entity": {
    "id": "entity_123",
    "slug": "attribution-engine",
    "type": "product",
    "name": "Attribution Engine",
    "summary": "...",
    "data": { ... }
  },
  "sections": [
    {
      "id": "sec_1",
      "slot": "start",
      "binding": { "kind": "self" },
      "templateKey": "self.hero.product.v1",
      "data": { ... },
      "config": { ... }
    },
    {
      "id": "sec_2",
      "slot": "free",
      "order": 1,
      "binding": { "kind": "related", "target": "feature", "cardinality": "many" },
      "templateKey": "related.feature.many.marquee.v1",
      "data": [ ... ],
      "config": { ... }
    },
    {
      "id": "sec_3",
      "slot": "end",
      "binding": { "kind": "self" },
      "templateKey": "self.cta.v1",
      "data": { ... },
      "config": { ... }
    }
  ],
  "meta": {
    "title": "Attribution Engine | Oblio",
    "description": "...",
    "og": { ... }
  }
}
```

---

## Content Constraints

### Character Limits by Typography Role

```typescript
const constraints = {
  'section.hero.headline': { maxChars: 30, typography: 'display-large' },
  'section.hero.subhead': { maxChars: 90, typography: 'title-medium' },
  'section.hero.description': { maxChars: 200, typography: 'body-large' },
  
  'card.title': { maxChars: 40, typography: 'title-small' },
  'card.description': { maxChars: 120, typography: 'body-medium' },
  
  'tile.label': { maxChars: 20, typography: 'label-medium' },
  'tile.heading': { maxChars: 40, typography: 'title-small' },
  'tile.subtitle': { maxChars: 60, typography: 'body-small' },
  
  'list.item.title': { maxChars: 50, typography: 'title-small' },
};
```

### AI Generation

```typescript
async function generateFirstPass(entity: Entity, template: SectionTemplate): Promise<Content> {
  const constraints = template.constraints;
  
  const content = await ai.generate({
    entity,
    constraints,
    prompt: `
      Generate content for ${entity.name} (${entity.type}).
      
      Constraints:
      - Headline: max ${constraints.headline.maxChars} characters
      - Subhead: max ${constraints.subhead.maxChars} characters
      - Description: max ${constraints.description?.maxChars} characters
      
      Context:
      ${entity.summary}
      ${entity.description}
    `
  });
  
  return content;
}
```

---

## Editor Modes

VIv5 provides three synchronized editor views (see EDITOR_ARCHITECTURE.md):

### 1. Forms-Only View

- Full CRUD over entities, relationships, templates
- Located at `/dashboard`
- "Preview / Locate on page" jumps to Sidebar/Overlay

### 2. Sidebar Workbench

- Split view: page preview (left) + forms (right)
- Responsive testing (drag to resize)
- Click element → show its form

### 3. Overlay HUD

- Full-width page with floating controls
- Quick in-context tweaks
- "Expand to Sidebar" button

### Mode Unlock

- **Production**: Konami code unlocks editor (sandbox mode, no persistence)
- **Local/Staging**: Konami code unlocks editor (connected to DB, changes persist)

---

## Integration Checklist

- [ ] VIv5 reads from Oblio DB (not separate data store)
- [ ] Page derivation uses EntityRelationship graph
- [ ] Templates indexed by binding signature
- [ ] Lead capture POSTs to Oblio API
- [ ] Content constraints enforced (char limits)
- [ ] Routes generated from entity graph
- [ ] Segment pages auto-generated for targeted values
- [ ] Editor modes share selection state
- [ ] Sandbox vs connected mode works correctly

---

*VIv5 is a rendering surface. Oblio is the data layer. Keep them cleanly separated.*
