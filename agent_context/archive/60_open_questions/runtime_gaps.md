# Open Questions: Runtime & Implementation Gaps

> **Context**: The Architecture (What) is defined. The Implementation details (How) for specific runtime behaviors have gaps.

## 1. Entitlement Enforcement (Metering)
**The Spec**: `catalog-item.md` defines Features as "Entitlements" (e.g., "5 Users", "100GB Storage").
**The Gap**: Where does the **Enforcement Logic** live?
*   *Option A*: Middleware (Blocks request if over limit).
*   *Option B*: Application Service (Checks limit before `INSERT`).
*   *Option C*: Async "Health Check" (Downgrades account if over limit).
*   **Question**: Do we need a `logic/metering.md` spec?

## 2. Automated Provisioning
**The Spec**: `opportunity.md` defines `stage='won'`. `system-operations.md` defines `Tier 2` Accounts.
**The Gap**: What connects them?
*   When a B2B Opportunity is "Won", does the system **automatically** run the `db:seed` equivalent to create the new Tenant Account and invite the user?
*   Or is "Provisioning" currently a manual Admin Dashboard process?

## 3. Domain Management (Vercel Integration)
**The Spec**: "One App, Many Domains" via Middleware.
**The Gap**: How do new domains attach to the Vercel Project?
*   *Manual*: You login to Vercel dashboard and add `client-site.com`.
*   *Vercel Platforms API*: The Admin Dashboard calls Vercel API to add the domain programmatically.
*   **Implication**: If manual, "Self-Service" signups cannot go live on their own domain instantly.

## 4. Legacy Content Migration
**The Spec**: `old_docs` are deprecated.
**The Gap**: We have "Marketing Copy" and "Product Lists" in `old_docs/context-oblio-dot-app`.
*   **Question**: Are we writing a `migrate.ts` script to parse these MD/JSON files into the SQLite `entities` table?
*   Or are we re-entering them manually into the new CMS interface?
