## Consolidated from Session Review — 2026-02-14

This document synthesizes all architectural concepts, specifications, and design principles discussed during the gap analysis session.

---

## Part 1: Core Architecture Philosophy

### 1.1 The Generic Interpreter Model

The system is designed as a **generic interpreter** that reads a self-describing data model and produces:
- UI surfaces (cards, field groups, views, widgets)
- Behaviors (actions, workflows, calculations)
- Enforcement (tenancy + permissions)

**Critical Principle:** The business model is packaged as Tier-1 seed/configuration, NOT hardcoded into the application.

### 1.2 The Tier Model

#### Tier 0 — Reductive Structure + Interpreter Rules

Tier 0 is the universal structure the platform can store and interpret. It must NOT contain domain semantics like "Account" or "Opportunity" as special-cased codepaths.

**Reductive Shape:**
```
record → object → fieldGroup → field → value
```

**Tier-0 Responsibilities:**
- Reading/writing the above structure
- Reference semantics (IDs, refs)
- Type system for values (string/number/ref/list/richtext/etc.)
- Deterministic interpretation rules
- Tenancy boundary enforcement
- Generic CRUD + audit event capability

#### Tier 1 — Seeded Domain Package

Tier 1 defines what exists and how it behaves:
- Object type definitions (Account, Contact, Opportunity, Activity, Product)
- Field definitions + widgets + validation
- FieldGroups (UI cards/sections)
- Views (tables/lists/filters/sorts)
- Actions/workflows/calculations
- Policy definitions (roles/scopes/exposure)

**Key Insight:** These are special ONLY because Tier-1 says so, not because the app hardcodes them.

#### Tier 2 — Tenant Instances + Overrides

- Real operational data (instances)
- Tenant-specific adjustments to Tier-1 config

**Oblio dogfoods itself:** Oblio's working tenant is Tier-2, while Oblio's domain package is Tier-1.

---

## Part 2: Five Cooperating Interpreters

The architecture specifies five interpreters that work together:

| Interpreter | Purpose | Reads From |
|-------------|---------|------------|
| **Model** | Data shape | RecordStruct hierarchy |
| **Schema** | Meaning as data | object_def records |
| **UI** | Layout as data | fieldGroup definitions |
| **Action** | Behavior as data | workflow/action definitions |
| **Policy** | Tenancy + permissions | role/policy definitions |

---

## Part 3: FieldGroups

**Definition:** FieldGroups are named arrays of Fields — a unit of UI layout representing fields rendered together in a surface like a "card."

**Constraint:** FieldGroups (and contained fields) must be Tier-1 configuration, not hardcoded UI. Only the minimal bootstrapping script that creates the initial seed is allowed to be "special."

---

## Part 4: Center of Gravity — Opportunities and Activities

### 4.1 Opportunity

An **Opportunity** is the "contract before the contract" — pure potential plus the state/stage progression that makes the potential concrete.

- An opportunity exists even before it closes
- Someone responding remains "in opportunity," just in a different state
- Products matter as catalog primitives; the real world is tracked by opportunities and what happened relative to them

**Stage Progression:**
```
MQL → SQL → FTP → RTP
```

| Stage | Definition |
|-------|------------|
| MQL | Marketing Qualified Lead — Persona match + contact info |
| SQL | Sales Qualified Lead — Engagement + intent confirmed |
| FTP | First Time Purchase — Transaction n=1, fixed point of value realization |
| RTP | Retention Purchase — Transaction n>1, recursive state |

### 4.2 Activity

An **Activity** is an attributable event record — any meaningful CRUD operation that matters is an auditable event.

**Activity Types:**
| Type | UI Label | Definition |
|------|----------|------------|
| Data | Research | Create/update/enrich Contact and Account objects |
| Asset | Creative | Create/version/publish Asset objects |
| Engagement | Engagement | Kinetic transfer of Asset to Contact |
| Admin | Approval | Governance operations, approving changes |

**Duration Tracking:**
- `default_duration` — Theoretical time task should take
- `baseline_duration` — Statistical average of historical performance
- `actual_duration` — Precise scalar measuring human labor expended

**Activity relates to Opportunity:** Activities are related to opportunities. The opportunity is the umbrella ledger for activities that occur in pursuit of opportunity progression.

---

## Part 5: Qualification Model

### 5.1 The World-Fact vs. The Record

The system treats entities like Contacts similarly to Opportunities:
- The **Contact (world-fact)** exists "out there" regardless of whether the system has written it down
- The system creates/updates a **ContactRecord** only when signals arrive

Before sufficient signals, the system may hold an anonymous/partial hypothesis (a "lead-shaped blob" / uncertain identity).

**Key Insight:** Qualification does NOT create the contact. Qualification reduces uncertainty about the contact and their contactability.

### 5.2 Contactability is the First Hard Boundary

The ability to contact the contact is the first invariant precondition:
- Without a reachable channel + consent, nothing else in the pipeline can physically happen

**Practical Boundary:** MQL won requires two-way communication to be open and agreed upon (consent + a reachable/verified channel).

### 5.3 Qualifiers vs. Qualifications

| Concept | Definition |
|---------|------------|
| Qualifiers | Boolean logic conditions defined in Opportunity Stage (e.g., "Budget > $10k") |
| Qualifications | Physical fields in the database (e.g., Budget_Amount integer field) |

**Activation Logic:**
```
Activity Won → Qualifier True → Opportunity Won → Next Opportunity Created
```

---

## Part 6: Login/Access is NOT Separate Ontology

"Can this person log in?" is not a separate concept like "membership." It is a **qualification step** within the opportunity's progression.

**Examples:**
- "Create Account" form submission is a signal; it is not necessarily MQL
- Consent capture and email/phone verification reduce uncertainty and ratify contactability
- First login may be provisional and still prompt verification

**Rule:** Access/permissions are derived from:
```
opportunity_stage + completed_qualifications (ratified by activities) + policy
```

Avoid hardcoded role/permission logic scattered across the app; compute it from declared rules.

---

## Part 7: Accounts, Contacts, and Join Logic

### 7.1 Contact ↔ Account Relationships

- Contacts are people in the system
- Contacts can relate to many accounts
- Account linkage is mediated by opportunity context

**Heuristics:**
- Email domain can infer likely account association (business vs consumer domain)
- Household/consumer accounts are treated similarly to small businesses

### 7.2 Opportunity as the Join

Activities relate to opportunities; opportunities relate to the set of contacts involved.

An opportunity may have:
- A primary contact (owner)
- Internal contacts working it
- External contacts (prospect/customer)

Some activities are internal-only, external-only, or mixed — the join remains the opportunity.

### 7.3 WorkHistories Linking

Contacts are linked to Accounts via a `workHistories` sub-collection (relationship type: `work_history`).

**Auto-linking Algorithm (ALGO 2):**
1. Extract email domain from Contact
2. Match against Account websites
3. Create `work_history` relationship with metadata (role, start_date)

---

## Part 8: Role Ontology

Three distinct "Role" concepts exist:

| Type | Name | Examples | Purpose |
|------|------|----------|---------|
| A | Commercial Personas | Decision Maker, End User, Influencer | Classification for routing/targeting |
| B | Tenancy Membership | Admin, Editor, Viewer | Access control within tenant |
| C | Internal End User Types | Sales Senior, Marketing Junior | Activity routing and capacity |

### 8.1 Kinetic Routing (ALGO 4)

Route contacts to agents based on persona:
- `decision_maker` / `vp|chief|head` → Admin-level agent
- `influencer` → Editor-level agent
- Others → Junior-level agent

---

## Part 9: Determinism + Anti-Hardcoding Rules

### 9.1 Deterministic Interpretation

Same Tier-1 package + same Tier-2 data must yield the same:
- UI surfaces
- Behaviors
- Enforcement outcomes

### 9.2 Closed-World Default

Anything not declared in Tier-1 does not silently exist. If a new object type or surface is desired, add it to Tier-1.

### 9.3 Semantic Backflow is the Failure Mode

Avoid introducing domain assumptions into code:
- Hardcoded routes
- Hardcoded entity-specific components
- Hardcoded permission checks
- Hardcoded "special objects" (Account-ness, Contact-ness, etc.)

If something can't be expressed through Tier-0 primitives + Tier-1 declarations, the system will drift into special cases.

---

## Part 10: Minimal Falsification Tests

The implementation is aligned if these tests pass without domain-specific code changes:

### Test 1: New Object Type
Define a new Tier-1 object type with fields, fieldGroups, views, a simple workflow. UI must generate create/edit/view + widgets + validation + permissions + relationships.

### Test 2: Seed Swap
Replace the Tier-1 package with a different domain package (e.g., library system). The interpreter must still work unchanged.

### Test 3: Qualification Gating
- Unverified contact cannot become SQL/checkout
- Consent + verified channel enables MQL won transition
- Provisional login can exist but is restricted until verification completes

### Test 4: Opportunity-Led Join
Activities tie to opportunities; opportunities tie to contacts/accounts involved. No special-case join logic by object name.

---

## Part 11: Activity Engine Physics

### 11.1 Economic Physics Model

The system treats business operations as physics:
- **Money** = Kinetic Energy (Active Claims)
- **Product Value** = Potential Energy
- **Work** = Activities (quantized units of state change)

Efficiency = converting Activity Duration (Time/Work) into Revenue (Energy).

### 11.2 Activation Energy

Activities inject "Activation Energy" into Lead's Health Score, counteracting entropic decay.

**Three Modes of Activation:**
1. **State Activation** — Triggers transition in Opportunity status
2. **Energy Activation** — Injects energy into Lead's Health Score
3. **Workflow Activation** — Completion activates next Step/Stage

### 11.3 Lead Health and Decay

Leads have a "health score" that decays over time without engagement. Activities counteract this decay.

**Missing from implementation:**
- Health calculation formula
- Decay daemon
- Activation energy injection

---

## Part 12: Workflow Engine

### 12.1 Hierarchy

```
Pipeline → Stage → Sequence → Step
```

### 12.2 Workflow Execution

```
Trigger → Match → Enroll → Execute
```

**Step Types:**
- Wait (delay)
- Send (engagement)
- Update (field change)
- Branch (conditional)

### 12.3 Current Status

**NOT IMPLEMENTED** — Only basic `stage` field exists on opportunities.

---

## Part 13: Build System Intent

### 13.1 Purpose

The `dist/` folder is meant to be a **static marketing website** — pre-rendered HTML pages for deployment.

### 13.2 What Should Be Published

- Products, features, solutions
- Use cases, personas
- Blog posts, content pages

### 13.3 What Should NOT Be Published

- Dimension values (ind_fintech, sector_tech)
- Meta objects (object_def, field_def, field_group)
- CRM records (contacts, opportunities)
- Internal/draft content

### 13.4 Filtering Mechanism

The `page_templates` table was designed to control which entity types get pages. Entities without matching templates should be skipped.

---

## Part 14: Implementation Posture

When implementing features, always ask:
1. Is this a Tier-0 primitive the interpreter needs?
2. Or is this Tier-1 configuration/seed that should be expressed as data?

**Default:** Put domain semantics, UI layout, workflows, and permissions into Tier-1. Keep Tier-0 small, generic, and strict.

---

## Appendix A: Key Vocabulary

| Term | Definition |
|------|------------|
| Record | The universal container for all data |
| Object | A typed record with schema from object_def |
| FieldGroup | Named array of fields for UI rendering |
| Field | Single data point with type and validation |
| Value | The actual data stored in a field |
| Opportunity | Contract-before-contract tracking progression |
| Activity | Auditable event record with attribution |
| Qualifier | Boolean condition for stage transitions |
| Qualification | Field that qualifiers evaluate against |
| Persona | Commercial classification of a contact |
| Role | Access/permission level within tenant |
| Dimension | Taxonomy category (industry, sector, etc.) |
| Tenant | Isolated account with its own data |

---

## Appendix B: File References

| Purpose | Location |
|---------|----------|
| Core types | `src/core/types.ts` |
| Database schema | `src/core/schema.sql` |
| Seed definitions | `data/seeds/tier_1_schema/definitions.json` |
| CRM logic | `src/modules/crm/crm.ts` |
| Hooks system | `src/core/hooks.ts` |
| Build generator | `src/build/generate.ts` |
| UI field renderer | `src/ui/src/components/DynamicFieldRenderer.tsx` |
| Studio config | `src/ui/src/features/Studio/config/studio-config.ts` |
| Canonical docs | `agent_context/active/` |

---

## Appendix C: Gap Analysis Summary

| Category | Alignment |
|----------|-----------|
| Tier-0 Runtime | 95% |
| RecordStruct/EAV | 80% |
| UI Interpreter | 90% |
| Schema Interpreter | 90% |
| Model Interpreter | 85% |
| Policy Interpreter | 40% |
| Action Interpreter | 20% |
| Activity Engine | 25% |
| Workflow Engine | 10% |
| **Overall** | **60%** |
