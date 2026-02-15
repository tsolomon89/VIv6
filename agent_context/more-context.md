FieldGroups are essentially named arrays of Fields. A FieldGroup is the set of fields we render together in a single UI surface—typically a “card” (or whatever the equivalent container is).

The key constraint: FieldGroups (and the fields inside them) should be Tier-1 configuration (“seeded defaults”), not hardcoded application behavior—except for the minimal bootstrapping script that generates the initial seed.

At Tier-0, the platform only knows about the reductive document structure:

record → object → fieldGroup → field → value

Tier-0 is the universal shape the platform can read and store; it should not contain product/opinionated domain semantics beyond that structure.

At Tier-1, we introduce the domain abstractions as data: Account, and then everything built on top of it—Products, Features, Solutions, Use Cases, Opportunities, Types, etc. These are not “special” because the app code says so; they are special only because the seed data defines them, and the user (or AI) can extend/alter them as content.

In other words: the application should mostly be a generic interpreter of Tier-0 structure + Tier-1 configuration. The “Oblio model” should be programmed into the seed (as defaults and conventions), not baked into the app (as fixed routes, fixed schemas, or fixed UI assumptions), beyond the minimal engine needed to read/render/edit the structure.

---

The user is describing a two-layer machine:

1) A generic interpreter (Tier-0 runtime layer) that knows almost nothing about the domain, and  
2) A seeded “language package” (Tier-1) that defines the domain (business model + UI model) in data.

That’s not “config-driven UI” as a cute trick. It’s closer to: Oblio is a virtual machine; the seed is the program. The app is an interpreter for a declarative ontology.

## The unifying invariant

The Tier-0 runtime layer must never “know” that Accounts exist.  
It only knows how to interpret structures and rules.

So the invariant is:

Semantics live in seed data; the Tier-0 runtime layer only enforces invariants about interpretation.

In tier language:

Tier 0 = grammar + runtime  
“Here is what an object/field/value is.”

Tier 1 = dictionary + style guide + law book  
“Here is what Account means, which fields it has, how it renders, what it can do, what it links to.”

Tier 2 = actual sentences written in that language  
Tenant content + overrides + instances.

That’s the clean separation.

---

## What the “generic interpreter” actually is

Think of it as five cooperating interpreters (all generic):

### Model Interpreter (data-shape)
- Can read Tier-0 primitives: record → object → fieldGroup → field → value  
- Understands types (string, number, ref, list, richtext, etc.) as generic primitives, not business objects

### Schema Interpreter (meaning-as-data)
- Treats Tier-1 “object types” as data: Account is just a declared object type with declared fields  
- Same for relationships (“Account has Contacts”), pipelines, stages, etc.

### UI Interpreter (layout-as-data)
- FieldGroups are declared UI surfaces (“cards”), not hardcoded React components per object  
- Rendering is a function of:
  - fieldGroup metadata (layout, order, visibility)
  - field metadata (widget, validation, formatting)
  - context (view mode vs edit mode, permissions, device size, etc.)

### Action Interpreter (behavior-as-data)
- CRUD is generic  
- “Business actions” exist, but they’re declared: e.g., Convert Opportunity, Advance Stage, Generate Asset  
- The runtime routes actions based on action definitions, not on object-specific switch statements

### Policy Interpreter (tenancy & permissions)
- “Who can see/edit what” is declarative  
- Dogfooding (Oblio-as-tenant) is expressed as policy + seed privileges, not special-cased code

Put differently: the Tier-0 runtime layer is a runtime for a “business ontology package.” The business model is not embedded in functions; it’s embedded in data the runtime can interpret.

---

## Necessary conditions (what must be true for this to work)

These are the non-negotiables—if any are missing, the system will leak hardcoding back in.

### 1) A complete Tier-0 runtime layer with strict boundaries
Tier 0 must define the full set of primitives the seed is allowed to use. If Tier 1 can’t express something, devs will “just add a quick if-statement,” and you lose the whole game.

Tier 0 must be able to express (at minimum):
- Identity & referencing (stable IDs, ref fields, collections)
- Typing (including ref types and polymorphic refs if needed)
- Validation (required, ranges, regex, uniqueness, constraints)
- Computed/derived fields (even if limited; otherwise hardcoding returns)
- Relationship semantics (one-to-one, one-to-many, many-to-many; inverse links)
- Presentation metadata (widgets, formatting, grouping, ordering)
- Workflow/state (pipelines/stages or generic state machines)
- Permissions/tenancy (visibility/edit rights; role rules; scope rules)
- Versioning/migrations (seeds evolve; you need evolution without hacks)

### 2) “Meaning is data” all the way down
The Tier-1 seed must contain:
- object type definitions (Account, Contact, Product, etc.)
- field definitions (type, constraints, widgets, defaults)
- fieldGroup definitions (cards, tabs, sections)
- view definitions (list/table views, filters, sorts)
- action definitions (what actions exist, where they appear, what they require)
- workflow definitions (states, transitions, allowed actions per state)
- policy definitions (roles, scopes, exposure rules)

If any of those live in code, the interpreter becomes a half-interpreter.

### 3) Deterministic interpretation
Same seed + same Tier-2 data → same UI + same behavior. That means:
- seed has explicit precedence rules (tenant overrides vs base seed)
- no “implicit magic” (e.g., “if object name contains ‘Account’ then…”)
- explicit fallback behavior when metadata is missing

### 4) A “closed world” default: anything not declared doesn’t exist
This prevents semantic drift. If someone wants a new object type, they add it to seed. If someone wants a new UI surface, they add a fieldGroup. No silent behavior.

### 5) Seed as the business model (not “starter data”)
The seed is not sample content. It’s the domain package. It defines the ontology, the UI contract, and the behavioral contract.

---

## Tier-1 also defines behavior (not just meaning)

For anything involving system mechanics—rules, calculations, workflows, automation—Tier 1 isn’t only “schema-like data.” Tier 1 is also the packaged set of actions / function calls / scripts that define behavior relative to the Tier-0 runtime.

Yes, Tier 1 can get messy—but that’s not fundamentally worse than any other schema + business-logic layer. It will be managed with structure, versioning, and constraints.

The key point remains: the platform (Tier 0) is a generic interpreter. It can support almost anything, but whether the application actually works—tenancy boundaries, relationship meaning, how records render across surfaces, which actions exist, and when they’re allowed—must be determined by Tier-1 configuration, not by hardcoded assumptions in the Tier-0 runtime.

### The implicit premise to make explicit
Tier 1 may define behavior only through Tier-0 declared primitives (a DSL, rule engine, registered actions, or sandboxed scripts with explicit capabilities). “Code as configuration” is fine as long as it’s capability-bounded and interpretable, not “arbitrary code can do anything.”

---

## Minimal falsification tests (fast way to tell if this is real)

### Test A — New object type without code changes
- Add a new Tier-1 object type: Supplier (or anything)
- Declare fields + fieldGroups + list view + a simple workflow
- Restart/reload

The UI must automatically produce:
- create/edit/view pages
- correct widgets
- validation
- list/table view
- permissions
- relationships

If you had to touch app code (beyond adding a new generic widget primitive), the “interpreter” is not an interpreter—it’s a configurable app with object-shaped holes.

### Test B — Swap the seed
Replace the entire Tier-1 package with a totally different domain (e.g., “library system” instead of “CRM-ish objects”).  
If the Tier-0 runtime layer survives unchanged and the app still functions, you’ve built a real interpreter.

---

## The hidden trap you’re trying to avoid

The trap is semantic backflow: “just this one special case” becomes 50 special cases and the seed becomes decorative.

Semantic backflow usually enters through:
- hardcoded routes (“/accounts/:id”)
- hardcoded components (“AccountCard”)
- hardcoded business actions (“convertLead()”)
- hardcoded permissions (“admins can…”)
- hardcoded assumptions about “common fields” (name/email/phone)

The antidote is to treat those as seeded declarations and make the Tier-0 runtime layer boringly strict.

---

## The crisp way to state the project

You’re building Oblio as:

A runtime that interprets a seeded ontology into a working application.  
The “app” is the interpreter; the “product” is the seed package.

That framing is useful because it makes the north star measurable: every time you’re tempted to hardcode “Account-ness,” you ask: is this a missing Tier-0 primitive or missing Tier-1 declaration?

========
# ACOUNTS / CONTACTS / OPPORTUNITIES / ACTIVITIES

We’ve made significant progress on making Oblio real—seemingly even building a no-code editor with MCPs that an AI can talk to, so it can create not just copy, but full page designs. It’s still coming together, but I’m always going to die on the hill of data architecture and systems engineering: keeping the AI aligned with the ORM/EAV model (and the other terms we’ve used before—untraditional, to say the least).

The main alignment problem I’m trying to solve is how we handle accounts, contacts, opportunities, and activities—especially across tiers and tenancy. In my framing, the “tier 1 abstractions” (contacts, accounts, products, etc.) are controlled by tenancy relative to an Oblio account. But the Oblio account itself is a tier 2 tenant. And I think I’ve established that all *active records* are effectively tier 2, because they exist in the context of a tenant doing real work.

Where things get fuzzy is the “center of gravity” of the system. It’s not really products. The whole system is opportunities and activities. Products matter, but mostly as catalog primitives; the real world is tracked by what happened (activities) and why it happened (opportunities).

So: I may have a catalog of things. That creates my library of content. But what makes a “product” a product—what makes it billable, how we describe it in marketing copy, what page sections it needs, how we charge for it—that becomes concrete only when it’s expressed as an opportunity (a real transaction path with real constraints, pricing, discounting, and variance).

From there, a page is an asset related to some segment of many products and some opportunity stage (or all opportunity stages). The point of the asset is to move someone through the pipeline and, ultimately, fill a shopping cart. The opportunity itself is like the contract before the contract: it asserts, “If this person eventually completes this transaction, these are the steps that must happen.” Since we know the steps, we now have a checklist (qualifications), and we keep a ledger of events as they happen (activities).

An activity is any interaction where a record is created, updated, or deleted—any CRUD event that matters. And that CRUD event happens somewhere: through a channel/medium on an asset (a page, form, admin screen, import job, API, etc.). Whether the user did it, or the contact did it, or a user did it on behalf of a contact is secondary. The point is: there is an attributable event, recorded with an audit trail, tied back to the opportunity journey. If the event meets criteria, it checks off qualification boxes. And “the contract” is not just closing the sale—it includes the prerequisite steps that led to closing, plus what must happen after closing to maintain and renew over time.

The thing I want the AI to hold clearly is this: all contacts are on the same level. They’re just people in the system. They can be related to many accounts. Their relationship to accounts—like everything else—is mediated by opportunity.

Example: I’m a user of Oblio because I have an HR opportunity that links me to it. That HR opportunity is what gives me tenancy, permissions, and (functionally) an account relationship: my pay, my role, and my work are tied to outcomes of opportunities I create or close. My interview, hiring, onboarding, retention, day-to-day tasks—those are activities associated to that HR opportunity. And then I’m also generating other product-type opportunities (B2C, B2B, etc.), plus operational/admin activities (approvals, sign-offs, internal changes), all of which must be documented.

Now, to make the join logic explicit:

Activities are related to opportunities. Activities are the record of what happened relative to some product context and some contact(s). An opportunity may have:
- a primary contact assigned (owner),
- other internal contacts working it,
- third-party contacts on the consumer/prospect side interacting with it.

Some activities involve only internal members, some only external members, some both. But the opportunity is the umbrella ledger: it relates to all activities that occur in pursuit of that opportunity’s state progression. At the activity level, we care that the activity completed. We don’t need to cram “qualification” semantics into the activity itself. The activity has a defined goal (visit page → view form → submit form, etc.). Many activities direct toward completing a form. When the form is completed, the activity is the record of that form submission with attribution: which assets influenced it, and which asset it happened on. Every activity has an asset, because data had to be updated somewhere.

This is also why “parent/child” language gets confusing. Sometimes activities feel like children of opportunities. Sometimes opportunities feel like children of activities. And products are children of opportunities in the sense that the “actual transaction” (with real pricing/discounts/variance) is expressed there, not purely in the catalog. The direction depends on the lens, and that lens-dependence is important.

Also: we attribute activity to the OPP (literally “opp”). No one goes to the store with a 100% zero chance of buying. The intention necessitates action. The join is the opportunity.

That’s the clean rule: I’m only a user of Oblio because I’m an HR opp. That’s what gives me tenancy, permission, account linkage, pay, and it ties my work to outcomes of the opps I create or close.

Now for accounts/contacts:

Contacts have accounts. Accounts (and their types) are largely inferred from the contact’s email domain. If someone has a private domain email (e.g., ibm.com), they’re likely associated with the IBM business account. If they have a consumer email (e.g., Gmail), they’re likely in a consumer/household account. Accounts can always have multiple users. A personal account can represent a household with multiple decision makers. Households are effectively small private businesses; we treat consumer accounts similarly, but with different features/services depending on B2B vs B2C vs HR-type product.

Contacts are never “free of accounts” in the practical system. Even if someone hasn’t registered yet, we treat them as if they already exist in the world as an account/contact pair in a potential opportunity space. The account “status” is then defined effectively by opportunity state. If they’re not FTP, they’re not purchasing customers yet. If they have an active RTP, they’re active/retained. If it’s closed-lost or churned, they’re no longer a customer, and we know their account state.

So we treat a prospect as if they already closed, and we model the conditions for closure—then we evaluate: did these things happen?

- Marketing qualification means they gave basic contact details and consented to being contacted.
- Sales qualification is, at minimum, a filled shopping cart (or the functional equivalent), possibly plus sales negotiation if required.
- FTP is when the ball is fully in the prospect’s court: we’re waiting for the final “yes” (confirm terms, complete transaction). Delivery/fulfillment might be triggered at payment or might be treated as part of RTP—depending on the product rules. But the first-time transaction is defined in the state itself.
- RTP then covers onboarding, retention, renewal steps over the contract period defined by the product and finalized (in practice) by the opportunity.

This also shows why the “real products and transactions” are stored/reflected in opportunities, not only in the product catalog. Catalog prices change; discounts exist; deals vary. We may compare products by name across opportunities, but we don’t necessarily want to treat the catalog as the authoritative record for transactional specifics.

Registration example (IBM):

Imagine I’m the first person registering for IBM. Anyone can spoof an ibm.com address, but they still need to verify they received the verification email. The vision is to have a database of businesses and their domains/URLs—so it’s as if thousands (or more) of business accounts already exist in the system.

If someone registers with an ibm.com email:
1) They verify their email.
2) If an IBM account already exists and has an admin, the admin may need to approve new users (depending on the system’s settings).
3) If no admin exists, the first verified registrant becomes the default admin (similar to how many B2B SaaS products work if a company hasn’t registered before).
4) The admin can approve subsequent users.

For personal accounts, it’s simpler: register email → create account → optionally add additional emails later. If the system detects an email is already associated with another account, it can offer merge/create-separate workflows. Similar logic applies for business accounts: detect domain → attach to existing business account if present → verify → approval rules.

Because I want high adoption (infinite seats), the system should encourage registering many users. The point is not restricting seats; the point is measuring real customer acquisition cost and operational cost by evaluating activities accomplished while using the application.

Finally, the simplest ontological summary:

Treat every CRUD operation as an auditable event that must be attributed to an activity. Activities are tier-1-classified primitives with rules that guarantee an audit trail for every meaningful change across the business’s data. Oblio is connected to all opportunities, because all B2B opportunities are clients, and tier 2 data includes “itself” in the recursion (a little Russell-paradox twist, which is always fun).

The architecture goal is: in a tenant’s database, maintain an audit trail of every change across CMS and CRM in one unified ontology. Use standard CRM primitives, but make them rigorous. “Opportunity” is the correct word. An MQL stage is the opportunity to become a marketing qualified lead. When that becomes true, the next stage opens: the opportunity to become sales-qualified. When that becomes true, the opportunity to make a first purchase (FTP) opens. If the next stage never exists (for practical purposes), that person was never going to close—despite expressed intention in the early stages.

Opportunity stages define the boundaries where we can say interest has been ratified in the contractual journey. It’s not too dissimilar from a “proof of contract” mechanism: each step is a recorded event in a structured path from point A to point B (revenue). It may close or not; we care about measuring outcomes so we can model a predictive future that might reflect reality. We need the boundaries of cost to bring people into that probability space, so we can see whether this scales. Because if cost of acquisition exceeds revenue (and exceeds available capital), the system runs out of runway.
