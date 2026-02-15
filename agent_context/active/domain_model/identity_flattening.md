# Identity Flattening: The Grand Unification

We reject the distinction between `User`, `Admin`, `Contact`, `Lead`, and `EndUser`.
These are not different *things*. They are different *positions* in the network.

## The Axioms
1.  **There is only Contact**. A person is a Contact.
2.  **There is only Account**. A group/org/context is an Account.
3.  **Roles are Coordinates**. A role exists only at the intersection of Contact and Account.

## The "Wildberger" Coordinate System
Identity is not a scalar property ("I am an Admin").
Identity is a Vector: `(Subject, Context, Role)`.

### 1. The Contact Record
- **ObjectDef**: `contact`
- **Key Field**: `email` (The global handle)
- **Scope**: Can exist in *any* account.
    - My "User Profile" is just the Contact record in the `oblio` (Tier 1) account.
    - My "Lead Record" is a Contact record in the `acme_corp` (Tier 2) account.

### 2. The Account Record
- **ObjectDef**: `account`
- **Key Field**: `domain` (e.g., `victory.com`)
- **Types** (Derived from domain, not stored):
    - **Consumer**: `gmail.com`, `outlook.com`
    - **Business**: `victory.com`, `google.com`
    - **Platform**: `oblio.app`

### 3. The Membership (The Edge)
This is how we define "Users".
A **Membership** is a record that links a Contact to an Account.

```typescript
// Conceptual Record
{
  type: "Membership",
  fields: {
    contact_ref: "contact_jane_uuid",
    account_ref: "account_victory_uuid",
    roles: ["admin", "editor"] // References to Role definitions
  }
}
```

## Scenarios (Projections)

### "The Admin"
**Query**: Find Contact `X` where Membership exists in Account `Y` with Role `Admin`.

### "The Lead"
**Query**: Find Contact `X` where Membership exists in Account `Y` with Role `null` (or `prospect`).

### "The End User"
**Query**: Find Contact `X` (who logged in via `oblio.app`) associated with Account `Y`.

## Authentication
Login is global.
1.  User computes hash of email/password.
2.  System checks **Oblio Tenant** for a Contact with that credential.
3.  If valid, System finds all **Memberships** for that Contact.
4.  User selects which Account Context to enter.
