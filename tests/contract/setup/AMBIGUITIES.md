# Spec Ambiguities & Resolutions

This document tracks ambiguities discovered in the Oblio specification and their resolutions for testing purposes.

## Open Ambiguities

| ID | Spec Section | Issue | Impact | Status |
|----|--------------|-------|--------|--------|
| AMB-001 | 8.1 | **Russell Paradox of Tenancy**: The spec suggests Oblio (the system) is also a Tenant of itself for B2B purposes. How do we distinguish "Oblio Platform" admin actions from "Oblio Tenant" sales actions? | Tests may incorrectly trigger tenant-level workflows when running as system admin | OPEN |
| AMB-003 | 8.3 | **Activity Generation Logic**: Spec states "Activity Generation is Coming Soon" but describes it as central to the system. How does the system know which Activity to generate next? | L5 tests cannot fully verify activity-driven workflows | OPEN |
| AMB-005 | 4.3 | **Sidebar Timer Precision**: Can Activities be paused/resumed? Does paused time count against duration? | Duration assertions may be flaky | OPEN |

## Resolved Ambiguities

| ID | Spec Section | Issue | Resolution | Test Impact |
|----|--------------|-------|------------|-------------|
| AMB-002 | 8.2 | **Pre-Existence of Contacts**: At what point is a Contact record created? On first "Research Activity" or first external "Form Fill"? | **Resolved**: Assume Contact record is created at Ingestion (CSV upload or API POST). Pre-existence is a conceptual model, not a database state. | Golden Path II tests start with Contact creation |
| AMB-006 | 2.1 | **RBAC Hierarchy Enforcement**: Is role hierarchy (Admin > Leader > Senior > Junior) enforced programmatically or just documentation? | **Resolved**: Currently documentation-only. ODAC capabilities handle actual permissions. Role is metadata, not a permission gate. | RBAC tests should check capabilities, not role names |
| AMB-004 | 5.2 | **Data Activity Trigger**: What exact validation failure triggers a Data Activity for manual cleanup vs. immediate rejection? | **Resolved**: Invalid taxonomy values (e.g., job_title not in dimension_values) are accepted but flagged with `requires_data_cleanup: true` and `invalid_fields` array. This allows data to flow in while marking it for manual review. | Tests check for flag presence, not rejection |

## Testing Assumptions

Based on ambiguity resolutions, tests will operate under these assumptions:

### 1. Tenant Separation (AMB-001)
- Use distinct UUIDs for system account vs. test tenant accounts
- System account: `00000000-0000-0000-0000-000000000000`
- Tenant A: `11111111-1111-4111-8111-111111111111`
- Tenant B: `22222222-2222-4222-8222-222222222222`
- Tests running with X-Api-Key (admin bypass) operate as "system", not as a tenant

### 2. Activity Sequence (AMB-003)
Until dynamic activity generation is implemented, assume hardcoded sequence:
1. MQL Stage: Research → Email
2. SQL Stage: Discovery Call → Demo
3. FTP Stage: Negotiation → Contract
4. RTP Stage: Check-in → Renewal

### 3. Data Validation (AMB-004)
- **Accepted**: Value exists in dimension_values table for that dimension type
- **Rejected + Activity**: Value does not exist, but is a plausible variant (fuzzy match)
- **Rejected + Error**: Value is clearly invalid (wrong type, null when required)

### 4. Duration Tracking (AMB-005)
- `started_at`: Timestamp when activity opened
- `completed_at`: Timestamp when activity submitted
- `duration_seconds`: `completed_at - started_at` (no pause adjustment for now)
- Future: `paused_duration_seconds` field may be added

## How to Add New Ambiguities

When you encounter a spec ambiguity during test development:

1. Add a row to the "Open Ambiguities" table above
2. Assign the next AMB-XXX ID
3. Reference the spec section
4. Describe the impact on testing
5. In your test file, add a comment:
   ```typescript
   /**
    * @ambiguity AMB-XXX
    * @status OPEN
    */
   it.skip('test that depends on ambiguity resolution', ...)
   ```

When an ambiguity is resolved:

1. Move the row to "Resolved Ambiguities"
2. Document the resolution
3. Update affected tests to remove `.skip`
4. Update "Testing Assumptions" if needed
