# Contact Entity Specification

> **Definition**: A "Contact" is a logical concept representing a person's relationship to an Account.
> *   **Internal Contact**: A Member of an Account (backed by a Global User).
> *   **External Contact (Lead)**: A generic CRM record (no login).

## Core Data Model (Flattening)

The system uses a **User-Centric Identity** model.

### 1. User (Identity)
*   **Table**: `users`
*   **Scope**: Global (System-wide).
*   **Data**: Email, Password Hash, Name, Global Avatar.
*   **Function**: Authentication and Identity.

### 2. UserAccount (The "Internal Contact")
*   **Table**: `user_accounts`
*   **Scope**: Account-Specific (Tenancy).
*   **Data**: Role, Permissions, Job Title (for that Account), Preferences.
*   **Function**: Authorization and Representation within a Tenant.

### 3. Contact (The "External Lead")
*   **Table**: `contacts`
*   **Scope**: Account-Specific.
*   **Data**: Name, Email, Lead Score.
*   **Function**: Passive CRM target (marketing, sales) who cannot log in.

> **Invariant**: If a person can log in, they are a **User** linked via **UserAccount**. If they are just a prospect, they are a **Contact**.

## Data JSON Schema (Member Profile)

The `user_accounts.data` column stores the profile specific to that tenant.

```typescript
interface MemberData {
    // Identity Snapshot (Cached/Overridable)
    displayName?: string;   // e.g. "Mike (Marketing)"
    
    // Firmographics (Contextual to this Account)
    department?: string;    // e.g. 'Marketing'
    jobTitle?: string;
    
    // CRM Data
    healthScore?: number;
    lastActiveAt?: string;
    
    // User Preferences (Per Account)
    notifications?: {
        email_digest?: boolean;
    };
}
```
