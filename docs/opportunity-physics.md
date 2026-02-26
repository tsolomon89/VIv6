# Opportunity Physics

The commercial engine of VI v5 (Oblio) revolves around the interplay between Products, Opportunities, and Workflows (Chain Reactions).

## The Product-Opportunity Tensor

At the heart of the system is the `opportunity` record type.

- **[MUST]** Every Opportunity MUST reference a Product (`primary_product_id`). An Opportunity is essentially a materialized prospect of selling/engaging with a specific Product.
- **[MUST]** Every Opportunity MUST be anchored to a logical principal, preferably both an Account (`primary_account_id`) and a Contact (`primary_contact_id`), depending on B2B or B2C configuration.
- **[MUST]** The `pipeline_type` MUST be defined upon Opportunity creation. Valid pipelines fall back to definitions generated dynamically from seeded `pipeline_stage` records (e.g., `B2B`, `B2C`, `Partnership`).

## The Pipeline Lifecycle

Opportunities transition through finite defined stages within their Pipeline. 

- `mql` (Marketing Qualified Lead)
- `sql` (Sales Qualified Lead)
- `ftp` (First Time Purchaser / Free Trial Provider)
- `rtp` (Return/Retained Purchaser / Paid)

**Sequence of Transition:**
1. Workflows generate activities based on the current `pipeline_stage`.
2. As activities are completed, their parameters generate state changes.
3. Every Stage requires fulfilling exit qualifiers.
4. When `exit_qualifiers` evaluate to true, the state progresses to `next_stage`.

## Chain Reaction (Workflow Generation)

Workflows are dynamically compiled and instantiated as atomic Activities using `OblioQualifier`.

- **Oblio Qualifier Structure**: A qualitative assessment of a record property. 
  - *Path*: "object : fieldGroup : field"
  - *Operator*: `=`, `>`, `<`, `!=`, `>=`, `<=`, `Non-Null`
  - *Target*: A boolean, string, or numeric value.
- **[MUST]** Whenever a data change or activity completion occurs, the system MUST re-evaluate the relevant `OblioQualifier` rules. If all default qualifiers pass, a new Activity is generated.
- **Assignment**: Activity owners MUST be assigned based on the `assignment_rule`, pulling from the available `AssignmentPoolData` (e.g., "round-robin").

## Interactive Kanban Orchestration
- Opportunites visualize as cards on Stage swimlanes.
- Drag-and-drop operations evaluate the underlying Workflows and generate compensating activities, allowing for programmatic state mutations via GUI interactions.
