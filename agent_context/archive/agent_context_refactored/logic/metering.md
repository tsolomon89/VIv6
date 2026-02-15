# Runtime Metering & Entitlement Logic

## 1. Core Logic
Entitlement checks answer: *"Can User U in Account A perform Action X?"*

### Architecture
*   **Source of Truth**: `entities` table (Type='feature') linked to `accounts` (via `user_accounts` and `subscriptions` - *conceptual*).
*   **Universal Schema**:
    *   `feature` Entity has `data.entitlement.metric` (e.g., 'storage', 'seats', 'api_calls').
    *   `feature` Entity has `data.entitlement.limit` (number).
    *   `accounts` have usage data (to be stored in `account.data.usage` or a separate `usage_logs` table - *Decision: Store in Account Data for Phase 3*).

## 2. Enforcement Flow (`checkEntitlement`)
1.  **Identify Context**: `userId`, `accountId`.
2.  **Fetch Entitlements**:
    *   Find all `product` entities active for this Account.
    *   Find all linked `feature` entities (`product` -> `has_feature` -> `feature`).
    *   Aggregate limits (Sum? Max? overrides?). *Policy: Max wins.*
3.  **Fetch Usage**:
    *   Read `account.data.usage[metric]`.
4.  **Compare**:
    *   If `usage < limit`, ALLOW.
    *   Else, DENY.

## 3. Implementation
*   **Module**: `src/core/logic/metering.ts`
*   **Function**: `checkEntitlement(accountId: string, metric: string, cost: number = 1): Promise<boolean>`

## 4. Usage Data Model
```typescript
// Account.data
{
  "usage": {
    "storage_gb": 12.5,
    "mau": 1050,
    "seats": 5
  }
}
```
