# Canonical Glossary

This document serves as the single source of truth for terminology within the VI v5 (Oblio) system system. Do NOT use undefined synonyms.

| Term | Definition | Aliases (Discouraged) |
|---|----|----|
| **Record** | The base atomic unit of data in the system, storing an EAV/Homoiconic structure. Covers objects like product, opportunity, activity, feature, etc. | Entity |
| **Object Definition** (`object_def`) | A meta-record that defines a schema "Type" (e.g., "Contact"). Connects to `FieldGroups` and `Fields`. | Class, Model |
| **Opportunity** | The central tensor that represents a potential or active commercial relationship. Bridges a **Product** to an **Account** / **Contact**. | Deal, Contract |
| **Product** | The abstract representation of what is being offered or consumed (must have `primary_product_id` referenced in Opportunities). | Item, Service |
| **Activity** | An atomic step or interaction. It must have a `duration_seconds` derived from start/completion timestamps. | Task, Event |
| **Pipeline Stage** | A discrete phase within a `pipeline_type` that defines required activities and exit qualifiers before an Opportunity can advance. | Status |
| **Oblio Qualifier** | A dynamic conditional operator (e.g., `>=`) evaluated against Record paths (e.g., `object : fieldGroup : field`) to trigger Workflow Steps. | Rule, Trigger |
| **Workflow Step** | An actionable directive resulting from true Qualifiers, generating an Activity for a Persona or System. | Action |
| **Assignment Pool** | A mechanism for intelligent allocation of Opportunities or Activities (e.g., round-robin or persona-based owner assignment). | Queues |
| **Dimension** | A categorical classification system with hierarchical parent/child `dimension_values`. Used for pick-lists. | Category |
| **Page Asset** | A record of type `page` that acts as an asset attributed to a channel/medium, optionally connected to visual templates. | Website, Landing |
| **ObjectType** | Canonical discriminant enum for `DataRecord.type`. | Deprecated aliases |
| **RecordData** | Canonical payload shape for API/runtime records: `fieldGroups -> fields -> values[]`. | Deprecated aliases |
