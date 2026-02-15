# Security Model: RBAC & Tenancy

> **Principle**: Security is not an overlay; it is a query constraint.
> **Enforcement**: Middleware applies constraints *before* the SQL generation.

## 1. Tenancy Isolation (The Hard Shell)
Every record belongs to an Account.
- **Root Tenant**: `oblio` (ID: `...000`).
- **Client Tenant**: `victory` (ID: `acc_vi_...`).

### The Golden Rule
> `SELECT * FROM records WHERE account_id = :current_account`

This filter is applied to **100%** of user queries.
- **Exception**: System processes (background workers) can query across tenants.

## 2. Role-Based Access Control (RBAC)

RBAC is defined by **Permission Levels** stored on the `Membership` record (Context link between User and Account).

### Standard Levels
| Level | Slug | Scope |
| :--- | :--- | :--- |
| **4** | `admin` | **Unlimited**. Can delete the Account. Billing access. |
| **3** | `leader` | **Manager**. Can publish content, invite members. |
| **2** | `senior` | **Writer**. Can create/edit records. Cannot delete. |
| **1** | `junior` | **Reader**. Read-only access. Can comment. |
| **0** | `guest` | **Limited**. Specific record access only. |

### Capability Check
```typescript
function can(user: User, action: Action, record: Record): boolean {
  if (user.isSystem) return true;
  if (record.account_id !== user.currentAccount.id) return false;
  
  const membership = user.membership;
  if (action === 'delete') return membership.level >= 4;
  if (action === 'write') return membership.level >= 2;
  return true;
}
```

## 3. The "Sandbox" Mode (Public/Anon Security)
The Visual Editor has a unique security state: **Sandbox**.

- **Trigger**: "Konami Code" on public site.
- **State**: User is **Authenticated** (System knows they are an Editor) but **Unscoped** (No persistent write access to production DB from this context).
- **Policy**:
    - Reads: Allowed (Public data).
    - Writes: **Blocked** by API Gateway unless explicitly in "Connected" mode.
    - Local State: Mutable (In-memory Redux/Recoil).

## 4. API Security
- **Authentication**: JWT (Stateless).
- **Authorization**: Middleware checks `Authorization` header -> decodes JWT -> Hydrates `Context`.
- **Scope**: API keys are scoped to specific `Permission Levels`.
