# OBLIO SYSTEM ARCHITECTURE

> **Purpose**: This document defines the complete Oblio data model and system architecture for AI agents to implement. Read this first.

---

## The Core Insight

**Everything is a record of a thing, and the record aims to be more the thing than the thing itself.**

The system is a universal ledger where:
- Every account (business or household) exists platonically
- Every contact (person) exists platonically  
- Being written, being an Oblio user, or being managed by another account are just states—not different entity types
- The schema is invariant; only the perspective changes

---

## The Three Tiers

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 0: OBLIO OS                                           │
│  • The root system                                          │
│  • Manages core objects, enums, dimension values            │
│  • Everything that ISN'T free text                          │
│  • Has its own Accounts, Contacts, Opportunities            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  TIER 1: ACCOUNTS USING OBLIO                               │
│  • Organizations deployed on the platform                   │
│  • Self-managing (have logins, maintain own data)           │
│  • Have their own Accounts, Contacts, Opportunities         │
│  • See Tier 0 dimension values, can extend locally          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  TIER N: ACCOUNTS OF ACCOUNTS (recursive)                   │
│  • Vendors, customers, franchisees, white-labels            │
│  • Managed (phantom) or self-managing (Oblio user)          │
│  • Same schema, turtles all the way down                    │
└─────────────────────────────────────────────────────────────┘
```

**Key**: A Tier N account can become Tier 1 (get Oblio logins). The data reconciles. The platonic identity persists.

---

## Fundamental Entities

There are only THREE fundamental entities. Everything else is a view, membership, or relationship.

### 1. Account

An Account is any arbitrary grouping: business, household, department, franchise, team.

```typescript
Account {
  id: string                          // Immutable UUID
  slug: string                        // Human-readable, globally unique
  name: string                        // Display name
  
  // Classification
  account_class: 'business' | 'household'  // The ONLY B2B/B2C distinction
  
  // Hierarchy
  parent_id: string | null            // Recursive nesting
  managed_by_account_id: string | null // Who maintains this record
  
  // State
  is_oblio_user: boolean              // Has logins, self-managing
  
  // Flexible data (EAV pattern)
  data: {
    firmographics?: { ... }           // Industry, size, location, etc.
    settings?: { ... }                // Account-specific config
    [key: string]: any                // Extensible
  }
  
  created_at: timestamp
  updated_at: timestamp
}
```

**Invariants**:
- `slug` is globally unique across ALL accounts
- An Account with `managed_by_account_id = null` is a root/self-managing account
- An Account with `is_oblio_user = true` can log in and manage their own data
- `account_class` is the ONLY thing that distinguishes B2B from B2C

### 2. Contact

A Contact is a single human identity. One person, regardless of how many emails or roles.

```typescript
Contact {
  id: string                          // Immutable UUID
  
  // Identity resolution
  primary_email_id: string            // Resolved canonical email
  
  // Flexible data
  data: {
    name?: string
    phone?: string
    preferences?: { ... }
    [key: string]: any
  }
  
  created_at: timestamp
  updated_at: timestamp
}
```

**Invariants**:
- One Contact = one human being
- Multiple emails resolve to one Contact
- A Contact can have memberships to MANY Accounts simultaneously

### 3. Activity

An Activity is any event: page view, form submit, call, email, purchase, login.

```typescript
Activity {
  id: string
  
  // Who
  contact_id: string | null           // May be anonymous
  account_id: string                  // In what account context
  
  // What
  activity_type: string               // 'page_view', 'form_submit', 'purchase', etc.
  
  // Where
  asset_id: string | null             // Which asset (page, email, ad)
  opportunity_id: string | null       // Which opportunity context
  
  // When
  occurred_at: timestamp
  
  // Flexible data
  data: {
    url?: string
    referrer?: string
    utm?: { ... }
    [key: string]: any
  }
}
```

---

## Relationship Entities

These connect the fundamental entities.

### Email (Identity Resolution)

```typescript
Email {
  id: string
  address: string                     // Unique globally
  contact_id: string                  // All emails → one Contact
  is_verified: boolean
  is_primary: boolean
  source: string                      // 'form', 'import', 'oauth', etc.
  created_at: timestamp
}
```

### AccountMembership (The Edge)

This is where role, permissions, and context live—NOT on the Account or Contact.

```typescript
AccountMembership {
  id: string
  contact_id: string                  // The person
  account_id: string                  // The account they belong to
  
  // Role & Permissions
  role: string                        // 'owner', 'admin', 'employee', 'customer', etc.
  permission_level: 'admin' | 'leader' | 'senior' | 'junior'
  role_overrides: json                // Granular permission toggles
  
  // Context
  persona_type: 'DM' | 'EU' | 'IN' | null
  
  // State
  is_active: boolean
  joined_at: timestamp
  left_at: timestamp | null
}
```

**Example**: Ethan works at Comcast AND is a Comcast customer:

```
Contact: Ethan
├── Membership → Comcast Corp
│   role: 'employee'
│   persona_type: 'EU'
│
└── Membership → Ethan's Household (Comcast Customer)
    role: 'account_holder'
    persona_type: 'EU'
```

### AccountLink (Account-to-Account Relationships)

```typescript
AccountLink {
  id: string
  parent_account_id: string           // The "dominant" side
  child_account_id: string            // The "subordinate" side
  
  relationship_type: 'vendor' | 'customer' | 'partner' | 'reseller' | 'franchise' | 'subsidiary'
  
  // Opportunity context if applicable
  opportunity_id: string | null
  
  data: json                          // Relationship-specific data
  created_at: timestamp
}
```

---

## The Catalog (Products → Features → Solutions → UseCases)

The catalog belongs to Accounts. Same schema whether self-managed or phantom.

### Entity (Generic Node)

Rather than separate Product, Feature, Solution tables, we use ONE entity table with a `type` field.

```typescript
Entity {
  id: string
  account_id: string                  // Which account owns this
  
  // Identity
  slug: string                        // Unique within account (or globally, TBD)
  type: 'product' | 'feature' | 'solution' | 'useCase' | 'asset'
  
  // Display
  name: string
  summary: string
  description: string
  
  // Flexible data
  data: {
    // Product-specific
    product_type?: 'B2B' | 'B2C' | 'Partnership' | 'Reseller' | 'HR' | 'Supplier'
    pricing?: { value: number, currency: string, frequency: string }
    personas?: {
      DM: TargetingCriteria
      EU: TargetingCriteria
      IN: TargetingCriteria
    }
    
    // Feature-specific
    // Solution-specific
    // UseCase-specific
    
    [key: string]: any
  }
  
  created_at: timestamp
  updated_at: timestamp
}
```

### EntityRelationship (Catalog Edges)

```typescript
EntityRelationship {
  id: string
  from_entity_id: string
  to_entity_id: string
  
  relationship_type: 'has_feature' | 'delivers' | 'applies_to' | 'targets' | 'requires'
  
  data: json                          // Edge-specific data
  created_at: timestamp
}
```

**Standard Relationships**:
```
Product  ──has_feature──→  Feature
Feature  ──delivers──→     Solution
Solution ──applies_to──→   UseCase
Product  ──targets──→      Persona (targeting criteria)
```

---

## Opportunities (The Pipeline)

An Opportunity is a potential transaction between Accounts.

```typescript
Opportunity {
  id: string
  
  // Parties
  owner_account_id: string            // Who owns this opp (your account)
  target_account_id: string           // The other party
  primary_contact_id: string | null   // Main contact on the opp
  
  // Classification
  opp_type: 'B2B' | 'B2C' | 'Supplier' | 'Partnership' | 'Reseller' | 'HR'
  
  // Stage (what's being transacted)
  stage: 'MQL' | 'SQL' | 'FTP' | 'RTP'
  
  // What's being transacted
  product_ids: string[]               // Which products
  
  // Value
  value: number
  currency: string
  
  // State
  status: 'open' | 'won' | 'lost' | 'churned'
  
  // Flexible
  data: json
  
  created_at: timestamp
  updated_at: timestamp
  closed_at: timestamp | null
}
```

### Opportunity Types Explained

| Type | Direction | What's Transacted | Example |
|------|-----------|-------------------|---------|
| **B2B** | Outbound | Your products → Business account | SaaS sale to enterprise |
| **B2C** | Outbound | Your products → Household account | Consumer purchase |
| **Supplier** | Inbound | Their products → Your account | Procurement |
| **Partnership** | Bidirectional | MQLs/SQLs (lead data) | Referral agreement |
| **Reseller** | Through | Their products via you → End customer | Distribution |
| **HR** | Inbound | Labor → Compensation | Hiring |

### Opportunity Stages Explained

| Stage | Code | Meaning |
|-------|------|---------|
| **MQL** | Marketing Qualified Lead | Matched persona, not yet contacted |
| **SQL** | Sales Qualified Lead | In active sales process |
| **FTP** | First Time Purchase | Transaction agreed/closed |
| **RTP** | Retention Purchase | Renewal, expansion, fulfillment |

**Key Insight**: One org's Supplier opp is another's B2B opp. The Opportunity captures ONE side's view of the transaction.

---

## Personas & Targeting

### Persona Types (Universal)

```typescript
PersonaType = 'DM' | 'EU' | 'IN'

// DM = Decision Maker (can complete the transaction)
// EU = End User (will use the product)
// IN = Influencer (benefits if account buys)
```

### Targeting Criteria (On Products)

```typescript
TargetingCriteria {
  companySize?: string[]      // ['smb', 'mid', 'enterprise']
  department?: string[]       // ['marketing', 'sales', 'revops']
  seniority?: string[]        // ['director', 'vp', 'c-level']
  sector?: string[]           // ['healthcare', 'technology']
  // ... any dimension
}

// Stored on Product
Product.data.personas = {
  DM: { companySize: ['mid', 'enterprise'], seniority: ['director', 'vp'] },
  EU: { department: ['marketing'], seniority: ['manager', 'senior'] },
  IN: { department: ['finance'] }
}
```

### Product-Type-Level Persona (Computed)

```typescript
// Not stored—derived on demand
function getProductTypePersona(account_id, product_type, persona_type) {
  const products = getProductsByType(account_id, product_type)
  return flattenUnion(products.map(p => p.data.personas[persona_type]))
}
```

This gives you "all B2B DM targeting values across all B2B products."

---

## Dimension Values (The Controlled Vocabulary)

Oblio OS (Tier 0) maintains the canonical dimension values. Tier 1+ accounts can use them and optionally extend.

```typescript
DimensionValue {
  id: string
  
  dimension: string                   // 'companySize', 'sector', 'department', etc.
  slug: string                        // 'smb', 'healthcare', 'marketing'
  label: string                       // 'SMB (11-50)', 'Healthcare', 'Marketing'
  
  parent_id: string | null            // Hierarchical (industry → sector)
  
  // Ownership
  account_id: string | null           // null = Oblio OS (global), else account-specific
  
  // Metadata
  data: json                          // Headcount ranges, platform labels, etc.
  
  created_at: timestamp
}
```

**Invariant**: NO FREE TEXT in forms. All selections come from DimensionValue records.

---

## URL = Attribution

The URL encodes the targeting context. This is fundamental to the VIv5 website generator.

```
{subdomain}.{domain}.{tld}/{objectType}/{subject}/{segment}
     │          │              │           │         │
     │          │              │           │         └── Narrows persona properties shown
     │          │              │           └── The specific entity (slug)
     │          │              └── Entity type (product, feature, solution)
     │          └── Channel + Source (implicit)
     └── Opp Type + Persona Type (implicit)
```

### Subdomain Conventions

| Subdomain | Persona Type | Opp Type | Content Focus |
|-----------|-------------|----------|---------------|
| `www` | DM | MQL | Decision maker content |
| `docs` | EU | — | End user documentation |
| `blog` | IN | — | Influencer/awareness content |
| `app` | EU | SQL+ | Logged-in users |
| `store` | DM | FTP | Transaction-ready |

### Full Attribution String

For any asset (not just web pages):

```
productType/oppType/personaType/useCase/objectType/subject/segment/channel/source/medium/version
```

On your own website, most of this is IMPLICIT from the URL structure.

---

## EAV Pattern & Schema Flexibility

The system uses **Entity-Attribute-Value** patterns via JSON `data` columns to avoid migrations during development.

### Why EAV

1. **No migrations** when adding fields during dev
2. **Per-account customization** without schema changes
3. **Flexible querying** via JSON operators
4. **Easy seeding** from JSON files

### Core Tables (Stable)

These columns are stable and queryable:
- `id`, `slug`, `type`, `name` on Entity
- `id`, `account_class`, `parent_id` on Account
- `id`, `contact_id`, `account_id` on Activity

### Data Columns (Flexible)

The `data: json` column holds everything else. Schema validation happens at the application layer, not database layer.

### Field Definitions (Application Layer)

```typescript
FieldDefinition {
  entity_type: string           // 'product', 'account', etc.
  field_key: string             // 'pricing.value', 'firmographics.industry'
  field_type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  constraints: {
    required?: boolean
    max_length?: number
    enum_values?: string[]
    dimension_ref?: string      // Links to DimensionValue
  }
  ui_hints: {
    label: string
    placeholder?: string
    component?: string          // 'text', 'select', 'multiselect', etc.
  }
}
```

Field definitions are stored in JSON/config, not the database schema. The admin UI reads them to render forms dynamically.

---

## Multi-Tenancy Model

### Session Context

Every request operates in ONE account context at a time.

```typescript
Session {
  id: string
  user_id: string                     // The logged-in Contact (who is an Oblio user)
  operating_account_id: string        // Which account they're operating in
  created_at: timestamp
  expires_at: timestamp
}
```

### Data Isolation

All queries MUST filter by `account_id` derived from session:

```sql
-- CORRECT
SELECT * FROM entities WHERE account_id = :session_account_id

-- WRONG (data leak)
SELECT * FROM entities WHERE id = :entity_id
```

### Cross-Account Access

Users can belong to multiple accounts. They switch context, never see data from multiple accounts simultaneously (unless explicitly designed, e.g., Oblio OS admin views).

---

## System Surfaces

Oblio is the core data model. Multiple surfaces expose it:

### 1. VIv5 (Website Generator)

- Reads Entity graph (Products, Features, Solutions)
- Derives pages from relationships
- Renders via templates
- Lead capture POSTs to Oblio API

### 2. Admin UI (Dashboard)

- CRUD for Accounts, Contacts, Entities
- Opportunity management
- Dimension value management
- Activity feed

### 3. MCP Tools (AI Agents)

- Same operations as Admin UI
- Thin wrappers around Core Functions
- AI can seed data, modify entities, trigger builds

### 4. API (Integrations)

- REST or GraphQL
- Webhook subscriptions
- Form submission endpoint
- Build triggers

---

## Implementation Phases

### Phase 0: Core Schema

- [ ] Account table with recursive hierarchy
- [ ] Contact table with identity resolution
- [ ] Email table
- [ ] AccountMembership table
- [ ] Entity table (generic catalog)
- [ ] EntityRelationship table
- [ ] DimensionValue table
- [ ] Activity table
- [ ] Opportunity table

### Phase 1: Oblio OS Bootstrap

- [ ] Seed Oblio OS as root account
- [ ] Seed dimension values (company size, sector, department, etc.)
- [ ] Admin user creation
- [ ] Basic auth flow

### Phase 2: Account Management

- [ ] Create Tier 1 accounts (your brands)
- [ ] Account memberships (invite users)
- [ ] Account hierarchy (parent/child)
- [ ] Managed vs self-managing accounts

### Phase 3: Catalog (Entity Graph)

- [ ] Entity CRUD with EAV data
- [ ] EntityRelationship CRUD
- [ ] Persona targeting on products
- [ ] Derived computations (product-type-level personas)

### Phase 4: VIv5 Integration

- [ ] Page derivation from entity graph
- [ ] Template system with bindings
- [ ] Static build output
- [ ] Lead capture → Opportunity creation

### Phase 5: Opportunities & Activities

- [ ] Opportunity CRUD
- [ ] Activity tracking
- [ ] Stage transitions
- [ ] Persona matching logic

---

## Invariants (Never Violate)

1. **Slug is globally unique** within its namespace (Entity.slug per account, Account.slug globally)
2. **No free text in forms** — all selections from DimensionValue
3. **URL = Attribution** — the URL encodes targeting context
4. **One Contact = one human** — emails resolve to single identity
5. **Membership carries role** — permissions on edge, not node
6. **Schema is invariant** — same tables for managed and phantom accounts
7. **Tier 0 owns vocabulary** — dimension values flow down, not up

---

## Glossary

| Term | Definition |
|------|------------|
| **Account** | Any grouping (business, household, team). The only B2B/B2C distinction is `account_class`. |
| **Contact** | A single human identity. Many emails → one Contact. |
| **Membership** | The edge connecting Contact to Account. Carries role, permissions, context. |
| **Entity** | Generic catalog node (Product, Feature, Solution, UseCase, Asset). |
| **Opportunity** | A potential transaction between two Accounts. |
| **Activity** | Any event (view, click, submit, purchase). |
| **Dimension** | A targeting axis (companySize, sector, department). |
| **DimensionValue** | A value within a dimension (SMB, Healthcare, Marketing). |
| **Persona** | NOT a fictional character. The targeting criteria for DM/EU/IN on a Product. |
| **Binding** | How a template connects to data (`self` or `related.{type}.{cardinality}`). |
| **Managed Account** | Phantom record maintained by another account. |
| **Oblio User** | Account with logins, self-managing. |

---

*This document is the source of truth for the Oblio data model. All implementation must conform to these definitions.*
