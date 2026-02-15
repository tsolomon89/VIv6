# GLOSSARY.md — Victory Initiative Terminology

Quick reference for concepts and terms. When in doubt, check here.

---

## The Big Picture

**Victory Initiative** = Programmatic website generator. Declare entities → pages appear.

**Oblio** = The full attribution/CRM system. VIv5 is the website channel of Oblio's data model.

**URL = Attribution** = The URL encodes targeting context. `www.domain.com/products/x` implicitly means DM persona, MQL stage, website channel.

---

## Core Concepts

### Entity
A node in the graph. All entities share the same structure — only the `type` field differs.

```typescript
interface Entity {
  id: string;          // UUID, internal reference
  slug: string;        // Globally unique semantic identifier
  type: EntityType;    // 'brand' | 'product' | 'feature' | 'solution' | 'useCase' | 'persona'
  name: string;
  description: string;
  data: EntityData;    // Field groups and fields
}
```

**Key insight:** Slug is identity, type is lens.

### Relationship
A typed edge between two entities. The edge label determines meaning.

```typescript
interface Relationship {
  id: string;
  from_id: string;
  to_id: string;
  type: RelationshipType;
  properties?: Record<string, unknown>;
}
```

### Binding
How a template connects to data. Determines what data a section receives.

```typescript
type Binding =
  | { kind: 'self' }
  | { kind: 'related'; target: EntityType; cardinality: 'one' | 'many' }
```

A section knows it's a "Features section" because its binding says `{ kind: 'related', target: 'feature', cardinality: 'many' }`.

### Derivation
Automatic generation of page structure from entity relationships.

```
Entity: attribution-engine (product)
   │
   ├── has_feature → data-integration
   ├── has_feature → lead-scoring
   └── has_feature → health-tracking

Derived Page:
   ├── Section: Hero (self binding)
   ├── Section: Features (related.feature.many)
   └── Section: CTA (self binding)
```

### Template
A reusable section configuration indexed by binding signature.

```
Template Key: related.feature.many.grid.v1
              │       │       │    │    │
              │       │       │    │    └── Version
              │       │       │    └── Layout variant
              │       │       └── Cardinality
              │       └── Target type
              └── Binding kind
```

---

## Entity Types

| Type | What It Is | Example |
|------|-----------|---------|
| `brand` | The company/business | Oblio |
| `product` | What the brand sells | Attribution Engine |
| `feature` | Aspect of a product (noun) | Data Integration |
| `solution` | How feature solves problem | Automation |
| `useCase` | Top-level targeting value | Enterprise, Healthcare |
| `persona` | Targeting value lists for DM/EU/IN | Marketing Director persona |

---

## Relationship Types

| Type | From → To | Meaning |
|------|-----------|---------|
| `offers` | brand → product | Brand sells this product |
| `has_feature` | product → feature | Product includes this capability |
| `solves_with` | feature → solution | Feature enables this outcome |
| `used_in` | solution → useCase | Solution applies in this context |
| `targets` | product → persona | Product designed for this user |
| `has_segment` | useCase → useCase | Parent/child in targeting hierarchy |

---

## Targeting Terminology

### Use Case
A **top-level targeting value** — a value with no parent in its dimension hierarchy.

Examples: SMB (company size), Healthcare (sector), Marketing (department)

### Segment
A **child targeting value** — a value that has a parent.

Examples:
- "Payers" is a segment of "Healthcare"
- "Marketing Director" is a segment of "Marketing" × "Director"

### How to tell the difference
- No parent → Use Case
- Has parent → Segment

| Dimension | Use Cases (top-level) | Segments (children) |
|-----------|----------------------|---------------------|
| Company Size | SMB, Mid, Enterprise | *(headcount is metadata, not children)* |
| Seniority | IC, Manager, Director, VP, C-Level | — |
| Department | Marketing, Sales, RevOps | — |
| Job Title | — | Marketing Director *(child of Seniority × Dept)* |
| Sector | Healthcare, Technology, Finance | — |
| Industry | — | Payers, Providers *(children of Healthcare)* |

### Persona
NOT a fictional character. A Persona is **lists of targeting values** grouped by role:

```typescript
interface ProductPersonas {
  DM: TargetingCriteria;  // Decision Maker — can complete transaction
  EU: TargetingCriteria;  // End User — will use the product
  IN: TargetingCriteria;  // Influencer — benefits if account buys
}

interface TargetingCriteria {
  companySize?: string[];   // ['smb', 'mid', 'large']
  department?: string[];    // ['marketing', 'revops']
  seniority?: string[];     // ['director', 'vp']
  sector?: string[];        // ['technology', 'healthcare']
  // ... any targeting dimension
}
```

### Persona Matching
When a user submits a form with structured selections:
1. Compare their selections to each product's persona values
2. Count matching values
3. Most matches → primary product for opportunity
4. Bucket (DM/EU/IN) determined by which list matched

---

## URL = Attribution

The URL encodes the full targeting context.

```
{subdomain}.{domain}.com/{objectType}/{subject}/{segment}
```

| Component | Encodes |
|-----------|---------|
| Subdomain | Opp Type + Persona Type default |
| Domain | Channel + Source |
| Object Type | Entity type (product, feature, solution) |
| Subject | Entity slug |
| Segment | Narrows content shown |

**Example:**
```
www.domain.com/products/attribution-engine
```
- www = DM persona, MQL stage
- domain.com = website channel, own domain source
- products = object type
- attribution-engine = subject

**Full attribution string** (for all assets, not just web):
```
productType/oppType/personaType/useCase/objectType/subject/segment/channel/source/medium/version
```

---

## The No Free Text Principle

**All customer-facing input must be structured selections from a defined taxonomy.**

Why:
- Enables automatic persona matching
- Reveals targeting mismatches
- Shows exactly what to fix when conversion fails
- If they select unexpected value but convert → new segment discovered
- If ad targets X but they select Y → targeting to fix

Free text = undiagnosable problems.

---

## Opportunity Types

| Code | Name | Stage | What It Means |
|------|------|-------|---------------|
| MQL | Marketing Qualified Lead | 1 | Close match to persona, not yet contacted |
| SQL | Sales Qualified Lead | 2 | Met marketing requirements, in sales process |
| FTP | First Time Purchase | 3 | In active sales cycle, negotiating |
| RTP | Retention Purchase | 4 | Existing customer, renewal/expansion |

**www.brand.com defaults to MQL** — visitors are evaluating, not buying yet.

---

## Persona Types

| Code | Name | Role |
|------|------|------|
| DM | Decision Maker | Can complete the transaction |
| EU | End User | Will use the product |
| IN | Influencer | Benefits but doesn't use directly |

**www.brand.com defaults to DM** — people browsing company websites to evaluate solutions.

---

## Product Types

| Type | Account Required | Description |
|------|-----------------|-------------|
| B2B | Yes | Business to business |
| B2C | No | Business to consumer |
| Partnership | Yes | Cooperative arrangement |
| Reseller | Yes | Resells to others |
| Investment | Yes | Selling equity |

---

## Content Terms

### Asset
Any content piece. Has type, attribution, versioning.

### Asset Types
| Type | Description | Headline Max |
|------|-------------|--------------|
| Page | Product/feature/solution pages | 60 chars |
| Article | Long form blog posts | — |
| Post | Social media | 280 chars |
| Dynamic Ad | Ad creative | 90 chars |
| Document | PDFs, ebooks | — |
| Message | Emails, direct | — |

### Content Constraints
Character limits tied to typography roles:

```yaml
section.hero.headline: 30 chars, display-large
section.hero.subhead: 90 chars, title-medium
card.title: 40 chars, title-small
card.description: 120 chars, body-medium
tile.label: 20 chars, label-medium
```

AI generates within these bounds. Human edits.

---

## Architecture Terms

### Core Functions
TypeScript functions that perform all data operations. GUI and MCP tools both call these directly.

### MCP (Model Context Protocol)
Protocol for AI agents to call tools. MCP tools are thin wrappers around Core Functions.

### Idempotency
Running the same operation multiple times produces the same result. Achieved via content hashing.

### Compilation
Converting database state to static JSON/HTML for deployment.

---

## Editor Terms

### Overlay Mode
Editor panel floats on top of live page. For quick tweaks.

### Sidebar Mode
Page in resizable column + forms in separate column. For detailed editing with responsive testing.

### Preview Mode
Editor tools active but no backend — changes don't persist. Available on production site via Konami code.

---

## System Boundary

| | VIv5 | Oblio CRM |
|-|------|-----------|
| **Job** | Generate websites | Manage contacts/opportunities |
| **Owns** | Entities, templates, pages | Contacts, accounts, workflows |
| **Channel** | Website only | All channels |

VIv5 is the website channel. Oblio is the full system. Same data model.

---

## Common Mistakes

### "Slug is unique per type" — WRONG
Slug is globally unique. If "data-integration" exists as a feature, you cannot create "data-integration" as a solution.

### "Personas are fictional characters" — WRONG
Personas are lists of targeting parameter values. "Marketing Director at Mid-Market Healthcare" = the intersection of those values, not a person named Sarah.

### "Use Cases are user stories" — WRONG
Use Cases are top-level targeting values (company size, sector, department). Not "As a user, I want to..."

### "Pages are created manually" — WRONG
Pages are derived from the entity graph. You create entities; pages emerge.

### "Free text is fine for forms" — WRONG
All input must be structured selections. Free text = undiagnosable conversion problems.
