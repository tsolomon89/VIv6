# CLAUDE.md — Victory Initiative

> **Read this first.** This file orients you to the project.

---

## What Victory Initiative Does

**The problem:** I have too many websites and too many products to build them one-off or separately. I need a programmatic system.

**The solution:** Victory Initiative (VIv5)

**Input:**
- Entity definitions (Products, Features, Solutions, Use Cases, Personas)
- MD files dropped in folders
- Brand styles (colors, typography, morphism settings)

**Output:**
- All required pages exist with correct routing
- All content fields populated with AI-generated defaults
- Human edits what needs editing

**The workflow:**
```
Add entity       → Pages appear
Drop MD file     → Blog/docs/wiki appears
Change relationship → Affected pages update
Change style token  → All pages reflect it
```

You don't build pages. You declare what exists. The system builds the pages.

---

## The Three Ingest Paths

| Input | What Happens |
|-------|--------------|
| **Entity CRUD** | Derived pages regenerate. New product → product page + feature pages + solution pages + segment pages all exist. |
| **MD file drop** | File parsed. Frontmatter → metadata. Content → body. Folder path → URL. Index auto-generates. |
| **Style change** | All templates re-render with new tokens. One change propagates everywhere. |

---

## URL = Attribution

This is the core insight. The URL **is** the targeting data.

```
{subdomain}.{domain}.com/{objectType}/{subject}/{segment}
     │          │              │          │         │
     │          │              │          │         └── Narrows persona properties shown
     │          │              │          └── The specific entity (slug)
     │          │              └── Entity type (product, brand, feature, solution)
     │          └── Channel + Source (implicit)
     └── Opp Type + Persona Type (implicit)
```

**Example:**
```
www.domain.com/products/attribution-engine
```

Implicitly encodes:
- **Opp Type:** MQL (www = marketing qualified)
- **Persona Type:** DM (www = decision makers browsing to evaluate)
- **Channel:** website
- **Source:** domain.com
- **Object Type:** product
- **Subject:** attribution-engine

The full attribution string for any asset:
```
productType/oppType/personaType/useCase/objectType/subject/segment/channel/source/medium/version
```

But on your website, most of this is **implicit** from subdomain + domain + path.

---

## System Boundary: VIv5 vs Oblio CRM

**VIv5 is the website channel of a universal attribution system.**

| | VIv5 (This Repo) | Oblio CRM (Future) |
|-|-----------------|---------------------|
| **Job** | Generate websites & content | Manage contacts & opportunities |
| **Owns** | Entities, templates, pages | Contacts, accounts, workflows |
| **Channel** | Website (one channel) | All channels |

VIv5 is not a website builder that will connect to a CRM later. It's the website surface of the same data model Oblio will fully implement. Build VIv5 right → merging with Oblio is trivial.

**VIv5 does NOT implement:** Contacts, Accounts, Opportunities, Workflows, Health Scoring, Activity Tracking.

**Integration:** Form submissions POST to Oblio CRM (or stopgap). VIv5 captures structured data; CRM manages relationships.

---

## Key Concepts

### Entities
Generic nodes with a `type` field: `brand`, `product`, `feature`, `solution`, `useCase`, `persona`.

**Critical:** `slug` is GLOBALLY unique (not per-type). The slug IS the identity; type is just the lens.

### Relationships
Typed edges between entities:
- `offers`: brand → product
- `has_feature`: product → feature
- `solves_with`: feature → solution
- `used_in`: solution → useCase
- `targets`: product → persona

### Use Cases & Segments
**Use Case** = Top-level targeting value (no parent)
**Segment** = Child targeting value (has parent)

| Dimension | Use Cases | Segments |
|-----------|-----------|----------|
| Company Size | SMB, Mid, Enterprise | *(headcount is metadata)* |
| Seniority | Senior, Executive, IC | — |
| Department | Marketing, Sales, RevOps | — |
| Job Title | — | Marketing Director *(child of Seniority × Department)* |
| Sector | Healthcare, Technology | — |
| Industry | — | Payers, Providers *(children of Sector)* |

### Personas (Targeting Lists)
A Persona is NOT a fictional character. It's the **list of targeting values** you'd pass to Google/Meta/LinkedIn.

When you create a Product, you define three lists:
- **DM (Decision Maker):** Values indicating someone can complete the transaction
- **EU (End User):** Values indicating someone will use the product
- **IN (Influencer):** Values indicating someone otherwise benefits

Matching works by set intersection at form submission. The product with the most matching values becomes the primary product for the opportunity.

### The No Free Text Principle
**All customer-facing input must be structured selections.**

Free text fields:
- Add friction
- Contaminate pipeline with unstructured data
- Make it impossible to diagnose conversion problems

Structured fields:
- Enable automatic persona matching
- Reveal targeting mismatches
- Show exactly what to fix when CVR is poor

---

## AI Workflow

**AI does first pass. Human edits.**

The AI uses the system's language:
- Character limits per typography role
- Template constraints
- Composition rules

This is no different from ad copy: "headline max 30 characters."

The AI **never generates CSS** — it uses the tools and tokens we've built.

---

## Architecture

```
GUI (human) ──────┐
                  │ direct import
                  ▼
            Core Functions ◄──── MCP Tools (AI)
            (TypeScript)              │
                  │                   │ thin wrapper
                  ▼                   │
              SQLite ◄────────────────┘
```

**One source of truth.** GUI and AI both call the same Core Functions.

---

## Key Files

| File | Purpose |
|------|---------|
| `SPECS_TASKS_V2.md` | Complete specification |
| `NORTH_STAR.md` | Project vision |
| `GLOSSARY.md` | Terminology |
| `EDITOR_ARCHITECTURE.md` | Editor system design |
| `old-builder/` | Working prototype (study this) |
| `src/` | New implementation |
| `data/vi.sqlite` | Database |

---

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Run dev server
npm test             # Run tests
npm run build        # Build for production
npm run db:migrate   # Create tables
npm run db:seed      # Populate example data
```

---

## Don't

- Don't build pages manually — derive them from entities
- Don't use free text fields — structured selections only
- Don't use Tailwind — semantic CSS tokens
- Don't create separate classes per entity type — one Entity with `type` field
- Don't hardcode section types — derive from bindings
- Don't build an HTTP API — Core Functions imported directly
- Don't implement CRM features — that's Oblio

## Do

- Study `old-builder/` patterns before writing new code
- Make slug globally unique
- Use the same form components in all editor views
- Let AI generate first-pass content within constraints
- Keep lead capture minimal — POST to external endpoint
- Implement segment pages for dimension-centric URLs
- Think "URL = attribution"
