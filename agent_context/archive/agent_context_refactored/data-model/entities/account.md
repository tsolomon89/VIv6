# Account Entity Specification

> **Definition**: The **Account** is the fundamental unit of tenancy and security. All data, nodes, and jobs are strictly isolated by `account_id`.

## Core Fields (SQL)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Immutable identifier. |
| `name` | String | Organization name. |
| `slug` | String | Unique URL identifier. |
| `type` | Enum | `client` (Tenant) or `admin` (System). |
| `class` | Enum | `free`, `professional`, `business` (Feature Tiers). |
| `parent_account_id` | UUID | For hierarchy (e.g., Parent Org -> Child Org). |

## Tenancy & Isolation

> **Critical Rule**: Every database query for Resources (Nodes, Products, Opportunities) **MUST** include `WHERE account_id = ?`.

### 1. Session Context
*   A User logs in -> Returns `tempToken`.
*   User selects **Operating Account** -> Returns `Session` linked to specific `account_id`.
*   All subsequent API calls are scoped to that `account_id`.

### 2. Cross-Account Access
*   A User can belong to multiple Accounts (via `user_accounts` table).
*   To switch context, the User must re-authenticate (or swap token) to the new Account.
*   **NO** cross-account joins are allowed in standard application logic.

## Data JSON Schema

```typescript
interface AccountData {
    // Branding
    logo_url?: string;
    primary_color?: string;
    
    // Settings
    features?: {
        enable_crm?: boolean;
        enable_attribution?: boolean;
    };

    // Firmographics (The Account's own data)
    industry?: string;
    size_range?: string;
}
```

## Membership Model (Internal)

Accounts have **Members**, defined by the `user_accounts` table.

*   **Relationship**: User <-> Account (M:N).
*   **Roles**: `Admin`, `Leader`, `Senior`, `Junior`.
*   **Overrides**: JSON column `role_overrides` for granular permission toggles.

## Account Links (CRM / External)

Accounts can be related to other Accounts via the `account_links` table.

*   **Managed By**: An Admin Account manages a Client Account (`admin` -> `client`).
*   **Partner**: Two accounts collaborating.
*   **Vendor**: Supply chain relationship.

> **Note**: This replaces the need for "Contacts" to act as the bridge between organizations. The relationship is direct: Account to Account.
