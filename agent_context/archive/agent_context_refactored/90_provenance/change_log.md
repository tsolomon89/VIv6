# Change Log

## [2.2.0] - 2026-02-02 (Pass 10 - Runtime Analysis)

### added
- `60_open_questions/runtime_gaps.md`: **New Module**. Documents known gaps in Enforcement, Provisioning, and Migration logic.

### changed
- `manifest.yaml`: Index updated to 2.2.0.
- `data-model/entities/catalog-item.md`: Added pointer to Runtime Gaps regarding Entitlement enforcement.
- `infrastructure/system-operations.md`: Added pointer to Runtime Gaps regarding Provisioning automation.

## [2.1.0] - 2026-02-02 (Pass 9 - Architecture Refinement)

### changed
- `infrastructure/system-operations.md`: Added **Bootstrapping Strategy** (Tier 0/1/2) and **Deployment Architecture** ("One App, Many Domains").
- `data-model/entities/catalog-item.md`: Redefined Products as **Service Definitions** and Features as **Entitlements**. Removed Retail/SKU concepts.
- `architecture/core-philosophy.md`: Reconciled "Everything is a Record" with specialized SQL tables (`contacts`, `opportunities`).
- `data-model/schema.md`: Updated `opp_type` Enum to match canonical definitions.
- `manifest.yaml`: Index updated to 2.1.0.

## [2.0.0] - 2026-02-02 (Pass 8 - Release)

### added
- `README.md`: **New Root**. The definitive "How-To" for Agents using this corpus. Replaces `CLAUDE.md`.
- `DEPRECATION_NOTICE.md`: **New Module**. Officially deprecates `old_docs`, `eav_docs`, and `new_docs`.

### changed
- `manifest.yaml`: Index updated to 2.0.0.

## [1.6.0] - 2026-02-02 (Pass 7)

### added
- `infrastructure/system-operations.md`: **New Module**. Documents Build Pipeline, CLI (`seed`, `build`), and Multi-tenancy routing.
- `implementation/visual-engine.md`: **New Module**. Documents Creator Mode, Scroll Timeline, and Storm Engine.
- `implementation/api-contracts.md`: **New Module**. Documents Core Functions, MCP Tools, and API Endpoints.

### changed
- `workflows/page-generation.md`: Updated to align with the specific inputs/outputs defined in Phase 1 tasks.
- `manifest.yaml`: Index updated to 1.6.0.

## [1.5.0] - 2026-02-02 (Pass 6)

### changed
- `glossary.md`: Updated with canonical definitions for "Struct", "Record", "Inventory Graph", "Binding", and "North Star" to verify consistency across Architecture/Logic modules.
- `manifest.yaml`: Index updated to 1.5.0.

## [1.4.0] - 2026-02-02 (Pass 5)

### added
- `architecture/editor-subsystem.md`: **New Module**. Documents the "One Editor, Three Views" (Forms/Sidebar/Overlay) architecture.
- `logic/inventory-graph.md`: **New Module**. Formalizes the "Inventory v2" graph logic (Derived relationships).

### changed
- `data-model/entities/catalog-item.md`: Added cross-reference to `logic/inventory-graph.md` to explain the edge logic.
- `manifest.yaml`: Index updated to 1.4.0.

## [1.3.0] - 2026-02-02 (Pass 4)

### added
- `architecture/ui-data-binding.md`: **New Module**. Documents the critical "Record vs Struct" pattern for UI/Headless data flow.

### changed
- `data-model/entities/contact.md`: Updated to clarify the physical mapping between `User` (Identity) and `AccountMembership` (Context).
- `data-model/entities/account.md`: Updated to reinforce strict tenancy isolation (Session Context, `account_id` queries).
- `logic/end-user-roles.md`: Aligned Role definitions (Admin/Leader/Senior/Junior) with the EAV documentation.
- `manifest.yaml`: Index updated to 1.3.0.

## [1.2.0] - 2026-02-02 (Pass 3)

### added
- `data-model/entities/contact.md`: Added Spec for Contact + Demographics + Firmographics.
- `data-model/entities/campaign.md`: Added Spec for Campaigns + Asset Groups.
- `logic/scoring.md`: **New Module**. Captures detailed Health Score formulas (Lifespan, Deterioration).
- `logic/end-user-roles.md`: **New Module**. Captures Staff roles (Junior/Senior/Admin) and assignment logic.
- `logic/workflow-automation.md`: **New Module**. Captures the "Meta Model" of Workflows/Stages/Sequences.

### changed
- `data-model/entities/opportunity.md`: Updated with detailed Qualification Goals (OQG) and Stage logic.
- `data-model/entities/catalog-item.md`: Updated with detailed JSON schemas for all Item types (including Asset metadata).
- `manifest.yaml`: Index updated to 1.2.0.

## [1.1.0] - 2026-02-02 (Pass 2)

### added
- `data-model/entities/opportunity.md`: Specification for Opportunity types and stages.
- `data-model/entities/activity.md`: Specification for Activity event logging.
- `data-model/entities/dimension-value.md`: Specification for controlled vocabulary and inheritance.
- `90_provenance/change_log.md`: This file.

### changed
- `manifest.yaml`: Updated to version 1.1.0, including new modules.

## [1.0.0] - 2026-02-02 (Pass 1)

### added
- Initial corpus structure.
- `glossary.md`: Canonical vocabulary.
- `architecture/core-philosophy.md`: Fundamental principles.
- `data-model/schema.md`: SQL Schema contract.
- `data-model/entities/account.md`: Account entity spec.
- `data-model/entities/catalog-item.md`: Catalog entity spec.
- `workflows/page-generation.md`: Page build process.
- `workflows/targeting-attribution.md`: Attribution logic.
- `decisions/adr-001-sqlite-eav.md`: Decision record for SQLite choice.
