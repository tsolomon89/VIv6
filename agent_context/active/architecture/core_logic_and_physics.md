# Core Logic and Physics of Oblio

> "I’m always going to die on the hill of data architecture and systems engineering: keeping the AI aligned with the ORM/EAV model."

## 1. The Center of Gravity: Opportunities & Activities
The system's center of gravity is **Opportunities** and **Activities**. 
- **Opportunities**: The "contract before the contract." It asserts: "If this person eventually completes this transaction, these are the steps that must happen." It is the umbrella ledger for all state progression.
- **Activities**: The kinetic history. Any interaction where a record is created, updated, or deleted is an Activity.
    - Every activity must be **attributed** to an Opportunity.
    - "No one goes to the store with a 100% zero chance of buying. The intention necessitates action. The join is the opportunity."

### Relationship Logic
- **Opportunities** are the join. 
- **Activities** are related to Opportunities.
- **Products** are catalog primitives, but "Real Products" (billable, variance, pricing) exist only as instantiated in an Opportunity.
- **Contacts** are related to Accounts, but this relationship is mediated by Opportunity context.

## 2. Identity Flattening: The "User" is a Role
There is no separate "User" table in the "Real World".
- **Strict Rule: Contacts MUST have an Account.**
    - "It’s just 'contacts' or 'accounts'. All accounts have contacts; all contacts have to have an account."
    - Account types are inferred (Business vs Household).
- **Tenancy & Permissions are Derivative (The Opportunity Rule)**
    - The **Opportunity** defines the relationship, permissions, and tenancy.
    - It is the **Context Record** for all CRUD operations.
    - Example: "I’m only a user of Oblio because I have an HR opportunity that links me to it."
    - HR Opportunity -> Grants Tenancy, Permissions, Account Linkage (Staff).
    - B2B Opportunity -> Grants Customer Access.
- **Accounts** are inferred from domains (Business) or are households (Consumer).

**Registration Flow:**
1. Register Email (e.g., `user@ibm.com`).
2. Detect Domain (`ibm.com`) -> Infer/Find Account.
3. Verification -> Associate Contact with Account.
4. Opportunity Creation (HR or Sales) -> Defines "User" state.

## 3. The Audit Trail (Economic Physics)
Every CRUD operation is an auditable event attributed to an activity.
- **Goal**: Maintain an audit trail of every change across CMS and CRM in one unified ontology.
- **Stages**: Opportunity stages define the boundaries of cost and probability.
    - MQL (Marketing Qualified) -> SQL (Sales Qualified) -> FTP (First Time Purchase) -> RTP (Retained).

## 4. Drifts & Anti-Patterns
- **The "User" Drift**: Treating "Users" as a separate silo from "Contacts". Users are just Contacts with active HR/Admin opportunities.
- **The "Catalog" Drift**: Treating the Product Catalog as the authoritative record for transaction data. The Opportunity holds the real transaction constraints.
