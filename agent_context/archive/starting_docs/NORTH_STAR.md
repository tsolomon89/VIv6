# NORTH_STAR.md — What Victory Initiative Does

## One Sentence

Victory Initiative turns entity definitions into complete websites — you declare what exists, the system builds the pages.

---

## The Problem

I have too many websites and too many products to build them one-off or separately.

Each website needs:
- Product pages
- Feature pages
- Solution pages
- Segment landing pages
- Blog/documentation
- Proper routing
- Consistent styling
- Content for every section

Multiply this by multiple brands and domains. Building each manually is impossible.

---

## The Solution

**Victory Initiative is a programmatic website generator.**

```
INPUT                              OUTPUT
─────                              ──────
Entity definitions                 All pages exist
  (Products, Features,      →      All routes configured
   Solutions, Use Cases,           All content populated (AI first pass)
   Personas)                       Human edits what needs editing

MD files in folders         →      Blog/docs/wiki with routing

Style tokens                →      Consistent design everywhere
```

**The workflow:**
```
Add entity          → Pages appear
Drop MD file        → Blog post appears
Change relationship → Affected pages update
Change style token  → All pages reflect it
```

You don't build pages. You declare what exists.

---

## Why This Works

### The Hidden Combinatorics

A business has:
- Products (what you sell)
- Features (what it does)
- Solutions (what problems it solves)
- Use Cases (contexts of usage)
- Personas (who it's for)

These create a graph. The graph determines what pages must exist.

```
Brand: Oblio
├── Product: Attribution Engine
│   ├── Feature: Data Integration
│   │   └── Solution: Automation
│   ├── Feature: Lead Scoring
│   │   └── Solution: Prioritization
│   └── Feature: Health Tracking
│       └── Solution: Optimization
└── Personas: Marketing Director (DM), Analyst (EU), CFO (IN)
```

From this graph, the system derives:
- `/products/attribution-engine` (product page with feature sections)
- `/features/data-integration` (feature page with solution sections)
- `/solutions/automation` (solution page)
- `/roles/marketing-director` (segment page aggregating relevant content)
- etc.

### URL = Attribution

The URL **is** the targeting data:

```
www.domain.com/products/attribution-engine
│        │         │            │
│        │         │            └── Subject (entity slug)
│        │         └── Object type
│        └── Channel + Source (implicit)
└── Opp Type + Persona Type (www = DM + MQL)
```

Every URL encodes its attribution context. No UTM parameters needed for your own site — the address IS the targeting.

### Entity Graph → Page Structure

You don't design pages. The system walks relationships and generates sections:

```
Entity: attribution-engine (product)
   │
   ├── has_feature → data-integration
   ├── has_feature → lead-scoring
   └── has_feature → health-tracking

Derived Page:
   ├── Section 1: Hero (self binding)
   ├── Section 2: Features (related.feature.many binding)
   └── Section 3: CTA (self binding)
```

Same entity, viewed through different URLs, shows filtered content:

```
/products/attribution-engine           → All features
/products/attribution-engine/healthcare → Only healthcare-relevant features
```

---

## The Three Ingest Paths

### 1. Entity CRUD

Create/update/delete entities and relationships → pages regenerate.

```typescript
createEntity({ type: 'product', slug: 'new-product', name: 'New Product', ... });
// → /products/new-product now exists
// → Feature pages link back to it
// → Segment pages include it where relevant
```

### 2. MD File Drop

Drop markdown files → blog/docs appear with proper routing.

```
content/
├── blog/
│   ├── 2024-01-15-attribution-basics.md  → /blog/attribution-basics
│   └── 2024-01-20-lead-scoring-guide.md  → /blog/lead-scoring-guide
└── docs/
    ├── getting-started.md                 → /docs/getting-started
    └── api-reference.md                   → /docs/api-reference
```

Frontmatter → metadata. Folder structure → URL structure. Index pages auto-generate.

### 3. Style Tokens

Change a token → all pages reflect it.

```css
--vi-brand-primary: #3B82F6;  /* Change once */
/* Every button, link, accent updates */
```

Morphism settings, typography scales, spacing — one source of truth.

---

## AI Content Generation

**AI does first pass. Human edits.**

The AI uses the system's constraints:
- Character limits per typography slot
- Template-specific field requirements
- Composition rules

```yaml
hero.headline: 30 chars max, display-large
hero.subhead: 90 chars max, title-medium
card.title: 40 chars max, title-small
card.description: 120 chars max, body-medium
```

This is no different from ad copy constraints. The AI generates within bounds. Human reviews and adjusts.

---

## The No Free Text Principle

**All customer-facing input must be structured selections.**

When a user fills out a form:
- They select from predefined options
- Their selections are matched against product personas
- The best-matching product becomes primary
- Mismatches reveal targeting problems

Free text = undiagnosable conversion problems.
Structured input = clear signal on what to fix.

---

## Targeting Model

### Use Cases vs Segments

**Use Case** = Top-level targeting value (no parent)
**Segment** = Child targeting value (has parent)

| Dimension | Use Cases (top-level) | Segments (children) |
|-----------|----------------------|---------------------|
| Company Size | SMB, Mid, Enterprise | — |
| Sector | Healthcare, Technology | — |
| Industry | — | Payers, Providers (children of Healthcare) |
| Department | Marketing, Sales | — |
| Job Title | — | Marketing Director (child of Seniority × Department) |

### Personas as Targeting Lists

A Persona is NOT "Sarah, 34, likes coffee."

A Persona is the **list of targeting parameter values** you'd pass to an ad platform:

```typescript
product.personas = {
  DM: {
    companySize: ['smb', 'mid', 'large'],
    department: ['marketing', 'revops'],
    seniority: ['director', 'vp', 'c-level']
  },
  EU: {
    companySize: ['smb', 'mid', 'large'],
    department: ['marketing'],
    seniority: ['manager', 'senior']
  },
  IN: {
    department: ['finance'],
    seniority: ['director', 'vp']
  }
}
```

**DM** = Decision Maker (can complete the transaction)
**EU** = End User (will use the product)
**IN** = Influencer (benefits if account buys)

Matching by set intersection. Most matches → primary product.

---

## Relationship to Oblio

**VIv5 is the website channel of a universal attribution system.**

The full asset address for any content:
```
productType/oppType/personaType/useCase/objectType/subject/segment/channel/source/medium/version
```

VIv5 implements `channel=website, source=own-domain`.

Oblio CRM will implement all channels. Same data model. Building VIv5 right means merging with Oblio is trivial — there's nothing to reconcile.

---

## Success Looks Like

```bash
# Starting from empty database
npm run db:migrate
npm run db:seed

# Build the site
npm run build

# View it
npm run dev
# → http://localhost:3000/products/attribution-engine shows working page
```

Using the editor:
- Add a new feature
- Connect it to the product
- See it appear on the product page immediately

Using MCP tools:
- AI creates entities
- AI triggers builds
- Same result as human using editor

Dropping content:
- Put markdown file in `content/blog/`
- It appears at `/blog/{slug}` with proper navigation

---

## This Is Not

- ❌ A traditional CMS (no blank pages to fill)
- ❌ A design tool (templates exist, you customize them)
- ❌ A CRM (no contact management)
- ❌ A one-off website builder

## This Is

- ✅ A programmatic multi-site generator
- ✅ An entity graph → pages derivation engine
- ✅ An AI-assisted content first-draft system
- ✅ The website channel of a universal attribution model
