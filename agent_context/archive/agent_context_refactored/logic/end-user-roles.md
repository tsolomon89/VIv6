# End User & Role Logic

> **Definition**: End Users are internal staff members who manage the system. Their **Role** determines their permissions and their **Team** determines their assignments.

## Role Hierarchy (RBAC)

Roles are defined per-account in the `user_accounts` table.

| Role | Rank | Key Permissions | Assignment Logic |
| :--- | :--- | :--- | :--- |
| **Admin** | 4 | Full System Access (Billing, Users, Settings). | Admin/Dispute Activities. |
| **Leader** | 3 | Manage Content & View Team Settings. | Escalation points. |
| **Senior** | 2 | Standard Write Access. | FTP (Closing) / RTP (Retention). |
| **Junior** | 1 | Restricted Access (Read-only or Task-based). | MQL (Qualifying) / SQL (Booking). |

## Granular Overrides (`role_overrides`)

The `role_overrides` JSON column allows toggling specific capabilities independent of the base role.

```json
{
  "can_delete_nodes": false,
  "can_invite_users": true,
  "can_export_data": false
}
```

## Departments & Routing

| Department | Primary Responsibility | Opportunity Ownership |
| :--- | :--- | :--- |
| **Marketing** | Lead Gen | MQL |
| **Sales** | Closing | SQL, FTP |
| **Success** | Retention | RTP |
| **Operations** | Governance | Admin Tasks |

## Assignment Logic

1.  **Capacity Check**: Ensure User has available hours.
2.  **Role Match**: `MQL` -> `Junior`, `FTP` -> `Senior`.
3.  **Team Match**: User must be in the same Region/Team as the Contact.
