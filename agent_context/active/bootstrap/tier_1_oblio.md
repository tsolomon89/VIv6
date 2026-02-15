# Tier 1: The Oblio Tenant

> **Principle**: Oblio is not a "Super Admin" panel. Oblio is just Tenant #0.
> **Definition**: Oblio is the specific *instance* of the platform that sells the platform.

## 1. The Root Account
- **Account ID**: `00000000-0000-0000-0000-000000000000` (Tier 0 Constant)
- **Name**: "Oblio Platform"
- **Domain**: `oblio.app`

## 2. The Core Responsibilities
Oblio has two distinct roles:
1.  **Schema Steward**: It owns the `ObjectDef` records that define the system structure.
2.  **Service Provider**: It acts as the vendor selling "Business OS" to other tenants.

### A. The "Meta-Object" Stewardship (The Kernel)
As defined in `core_engine/schema_as_data.md`, the Schema IS Data.
Oblio owns the bootstrapping definitions that make the system homoiconic.

| Meta-Object | Record ID | Owner |
| :--- | :--- | :--- |
| **ObjectDef** | `...0001` | Oblio |
| **FieldDef** | `...0002` | Oblio |
| **ActivityDef** | `...0004` | Oblio |

### B. The Universal Domain Model (The Schema)
Oblio defines the *Canonical Objects* that all tenants use.
Tenants create *instances* of these objects, but Oblio defines their structure.

**CRM Core:**
- `ObjectDef: contact` (People)
- `ObjectDef: account` (Companies/Tenants)
- `ObjectDef: activity` (Events/Logs)

**The Pipeline (Standard Qualification):**
- `OpportunityTypeDef: mql` (Marketing Qualified)
- `OpportunityTypeDef: sql` (Sales Qualified)
- `OpportunityTypeDef: ftp` (First Time Purchase)
- `OpportunityTypeDef: rtp` (Retention Purchase)

**Product Catalog (The Graph):**
- `ObjectDef: product` (Sellable SKUs)
- `ObjectDef: feature` (Functional Capabilities)
- `ObjectDef: solution` (Value Problems Solved)
- `ObjectDef: use_case` (Market Contexts)
- `ObjectDef: persona` (Target Audience)

**Assets & Logic:**
- `ObjectDef: asset` (Content, Emails, Images)
- `ObjectDef: campaign` (Logic Orchestrators)
- **Standard Mediums**: `ad`, `message`, `page`, `document` (Defined in `standard_definitions.md`)

> **Inheritance Rule**: When Tenant #2 (Victory) boots up, it sees this Schema.
> Victory creates a `Product` record (e.g., "Victory Strategy") using Oblio's `ObjectDef: product`.

### C. The Standard Library
Oblio also owns the standard definitions used by the Logic Engine (see `standard_definitions.md`).
- **Standard Roles**: Admin, Member, Guest.
- **Activity Archetypes**: Data, Asset, Engagement.
- **Dimensions**: Industry, Seniority, Department.

## 3. The Product: "Business OS"
Oblio sells products. These are `Product` records (`rec_prod_foundation`) within the Oblio partition.

| Product Name | Slug | Entitlements (Features) |
| :--- | :--- | :--- |
| **Foundation** | `prod_foundation` | `feat_crm` (Contacts, Accounts) |
| **Growth Suite** | `prod_growth` | `feat_email`, `feat_marketing` |
| **Builder Pro** | `prod_builder` | `feat_visual_editor` |

## 4. Tenant Management (Dogfooding)
How does Oblio create a new Tenant? It uses the standard **CRM Flow**.

1.  **Lead Capture**: User signs up (`tim@victory.com`).
2.  **Conversion**: Oblio's CRM creates a `Contact` and `Account` ("Victory Initiative").
3.  **Provisioning Workflow**:
    - **Trigger**: "Victory Initiative" purchases "Growth Suite".
    - **Action 1**: Generate new Tenant UUID.
    - **Action 2**: Create `Tenant` record (infrastructure mapping).
    - **Action 3**: Create `Subscription` record linking Tenant -> Product.

> **Implication**: The "Tenant Registry" is just the `records` table filtered by `account_id = oblio` and `type = Account`.

## 5. Global vs Local Extension
- **Global**: Oblio defines `ObjectDef("Contact")` with fields `email`, `name`.
- **Local**: Victory cannot delete `email`.
- **Extension**: Victory CAN create `FieldDef("political_party")` and attach it to `ObjectDef("Contact")` *within their partition scope*.

The UI merges the Global Schema + Local Extensions when rendering the "Contact" form for Victory.
