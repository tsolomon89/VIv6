# System Invariants and Rules

The VI v5 (Oblio) platform enforces immutable business physics. 

> [!WARNING]
> **Phase 14 Architectural Shift**: Hardcoded TypeScript invariants (previously in `src/core/invariants.ts`) have been migrated to the **Data-Driven ConstraintEngine** (`src/modules/ops/constraints.ts`). 
> Validation rules are now stored directly in the database as `validation_constraint` records, checked during `pre_create` and `pre_update` lifecycle hooks.

## 1. The ConstraintEngine (`ConstraintType`)

Engineers MUST NOT write procedural validation logic for standard data validation. Instead, use the ConstraintEngine by seeding a `validation_constraint` record.

Supported constraints include:
- `required_field` / `required_fields`
- `exists_in` (e.g., verifying a value exists in another table or enum)
- `max_length` / `min_value` / `max_value`
- `relationship_exists`
- `pattern` (Regex evaluation)
- `trigger_activity` (If a condition is met, enforce that a workflow activity is triggered)

## 2. Legacy / Core Rules (Migrated to DB constraints)

- **[MUST]** `INV-PRODUCT-NAME`: `max_length: 26`. A Product's name MUST NOT exceed 26 characters in length to ensure physical UI layout integrity across mobile and widget components.
- **[MUST]** `INV-ACTIVITY-DURATION`: An Activity CANNOT be completed without a positive duration.
- **[MUST]** `INV-PRODUCT-TENSOR`: Every Opportunity MUST explicitly map to a valid Product Reference ID.
- **[MUST]** `INV-PIPELINE-TYPE`: Every Opportunity MUST declare a valid `pipeline_type`, checked dynamically via `exists_in_pipeline_stages`.
- **[MUST]** `INV-USECASE`: A Use Case Record MUST encapsulate both a Solution (`linked_solution_id`) and a Persona (`linked_persona_id`).

## 3. Architectural Precedence Rule
- **[Decision]** `EAV-OVER-DDL`: Before proposing any database schema alterations (`ALTER TABLE`), engineers MUST determine if the problem can be modeled using the Universal Schema (`records` array) combined with dynamic Object definitions (`object_def` / `field_def`) and the `ConstraintEngine`. Direct DDL modification is forbidden outside of core engine upgrades.
