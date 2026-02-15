# Tenant Provisioning Logic

## 1. Goal
Standardize how new Tenants (Accounts) are initialized to ensure they have:
1.  Correct Owner (User linkage).
2.  Correct Entitlements (Product assignment).
3.  Default Data (Templates/Entities).

## 2. Workflow: `provisionTenant`
Input:
*   `ownerId`: User ID (must exist).
*   `slug`: Desired account slug.
*   `name`: Account name.
*   `planId`: Product ID (optional, defaults to Free).

Steps:
1.  **Validation**: Check slug availability.
2.  **Create Account**: Insert into `accounts` table.
3.  **Link User**: Insert into `user_accounts` with role='owner'.
4.  **Assign Product**:
    *   If `planId` provided, find Product Entity.
    *   Update `account.data.active_product_ids`.
5.  **Seed Defaults** (Future Enhancement):
    *   Copy 'global' templates to account-specific templates?
    *   Or relying on Inheritance? (Design Decision: Use Inheritance for now).

## 3. Implementation
*   **Module**: `src/core/logic/provisioning.ts`
*   **Function**: `provisionTenant(input: ProvisionInput): Promise<Account>`

## 4. Automation
This function should be called by:
*   `auth.callback` (On Signup)
*   `stripe.webhook` (On Subscription)
*   `admin.ui` (Manual creation)
