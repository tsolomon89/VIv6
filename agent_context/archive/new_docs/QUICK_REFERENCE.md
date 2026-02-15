# QUICK REFERENCE

> **For AI Agents**: Cheat sheet for Oblio concepts. When in doubt, check here first.

---

## Entity Types

| Type | What It Is | Example |
|------|-----------|---------|
| `product` | What is sold | Attribution Engine, Fractional Growth Lead |
| `feature` | Part/capability of a product | Data Integration, Reporting |
| `solution` | Outcome a feature enables | Automation, Prove ROI |
| `useCase` | Top-level targeting value | SMB, Healthcare, Marketing |
| `asset` | Content piece | Page, blog post, email |

---

## Relationship Types

| Type | From → To | Example |
|------|-----------|---------|
| `has_feature` | product → feature | Attribution Engine has Data Integration |
| `delivers` | feature → solution | Data Integration delivers Automation |
| `applies_to` | solution → useCase | Automation applies to SMB |
| `targets` | product → useCase | Attribution Engine targets Enterprise |
| `requires` | entity → entity | Module requires Core Platform |

---

## Account vs Contact

| | Account | Contact |
|-|---------|---------|
| **Is** | Any grouping (business, household) | A single human |
| **Has** | Products, opportunities, activities | Emails, memberships |
| **B2B/B2C** | `account_class: 'business' \| 'household'` | N/A |

---

## Persona Types

| Code | Name | Meaning |
|------|------|---------|
| `DM` | Decision Maker | Can complete the transaction |
| `EU` | End User | Will use the product |
| `IN` | Influencer | Benefits if account buys |

---

## Opportunity Types

| Type | Direction | What's Transacted |
|------|-----------|-------------------|
| `B2B` | Outbound | Your products → Business |
| `B2C` | Outbound | Your products → Consumer |
| `Supplier` | Inbound | Their products → You |
| `Partnership` | Bidirectional | Lead data |
| `Reseller` | Through | Their products via you |
| `HR` | Inbound | Labor |

---

## Opportunity Stages

| Stage | Code | What It Means |
|-------|------|---------------|
| MQL | Marketing Qualified Lead | Matched persona, not contacted |
| SQL | Sales Qualified Lead | In active sales process |
| FTP | First Time Purchase | Transaction closed |
| RTP | Retention Purchase | Renewal/expansion |

---

## Binding Types

| Binding | Template Pattern | Used For |
|---------|-----------------|----------|
| `{ kind: 'self' }` | `self.hero.v1`, `self.cta.v1` | Hero, CTA sections |
| `{ kind: 'related', target: 'feature', cardinality: 'many' }` | `related.feature.many.grid.v1` | Feature lists |
| `{ kind: 'related', target: 'solution', cardinality: 'one' }` | `related.solution.one.spotlight.v1` | Single solution highlight |

---

## Section Slots

| Slot | Position | Editable Order |
|------|----------|----------------|
| `start` | Always first | No |
| `end` | Always last | No |
| `free` | Middle | Yes (via `order` field) |

---

## URL Structure

```
{subdomain}.{domain}.{tld}/{objectType}/{subject}/{segment}
```

| Part | Encodes |
|------|---------|
| subdomain | Persona type (www=DM, docs=EU, blog=IN) |
| domain | Channel + Source |
| objectType | Entity type |
| subject | Entity slug |
| segment | Filters content shown |

---

## Subdomain Conventions

| Subdomain | Persona | Content |
|-----------|---------|---------|
| `www` | DM | Decision maker content |
| `docs` | EU | Documentation |
| `blog` | IN | Awareness content |
| `app` | EU | Logged-in users |
| `store` | DM | Transaction-ready |

---

## Key Invariants

1. **Slug is globally unique** (for accounts) or unique within account (for entities)
2. **No free text in forms** — all selections from DimensionValue
3. **URL = Attribution** — URL structure encodes targeting
4. **One Contact = one human** — emails resolve to single identity
5. **Membership carries role** — permissions on edge, not node
6. **Brand = Account** — no separate Brand table

---

## Database Tables (Core)

| Table | Purpose |
|-------|---------|
| `accounts` | Businesses, households, teams |
| `contacts` | Human identities |
| `emails` | Identity resolution |
| `account_memberships` | Contact ↔ Account edges |
| `account_links` | Account ↔ Account relationships |
| `entities` | Catalog (products, features, etc.) |
| `entity_relationships` | Catalog edges |
| `dimension_values` | Targeting vocabulary |
| `opportunities` | Pipeline |
| `activities` | Events |

---

## EAV Pattern

**Stable columns**: `id`, `slug`, `type`, `account_id`, `name`

**Flexible data**: `data JSON` column for everything else

**Validation**: Application layer via FieldDefinitions, not DB constraints

---

## File Locations

| File | Contains |
|------|----------|
| `OBLIO_SYSTEM.md` | Full architecture |
| `VIV5_INTEGRATION.md` | Website generator spec |
| `SCHEMA.md` | Database schema |
| `IMPLEMENTATION_GUIDE.md` | Step-by-step build guide |
| `QUICK_REFERENCE.md` | This file |

---

## Common Mistakes

| Wrong | Right |
|-------|-------|
| Separate Brand table | Brand = Account |
| Persona as entity type | Persona targeting stored on Product |
| Free text in forms | Structured selections from DimensionValue |
| B2B/B2C as separate systems | One system, `account_class` differs |
| Page-global element positions | Section-local coordinates |
| "Hero" as template type | "Hero" = self binding + start slot |

---

## Commands

```bash
npm run db:migrate    # Create tables
npm run db:seed       # Populate data
npm run db:reset      # Drop and recreate
npm run dev           # Run dev server
npm run build         # Build for production
npm test              # Run tests
```

---

*Keep this open while implementing. When confused, re-read OBLIO_SYSTEM.md.*
