# Opportunity Entity Specification

> **Definition**: An **Opportunity** represents a potential or active value-exchange transaction between an Account and a Contact (or another Account).

## 1. The Definitions

### "Value Exchange" (The 'Pays' Concept)
In this system, we define the "Cost" of a transaction by **what is invested** and the **Direction of Cost** (Who pays whom).

*   **Money**: Fiat currency transfer.
*   **Activity**: Time/Effort invested (Non-monetary).
*   **Equity**: Ownership transfer.
*   **Talent**: Trading compensation for labor.

### Opportunity Types (Optimization Goal)
The `opp_type` defines the **Transactional Cost Direction**.

| Code | Name | Definition | Transactional Cost & Direction |
| :--- | :--- | :--- | :--- |
| **B2B** | **Business-to-Business** | Account provides Solutions to a Business. | **Inbound Cost**: Client pays Money -> Org. |
| **B2C** | **Business-to-Consumer** | Account provides Solutions to a Household. | **Inbound Cost**: Customer pays Money -> Org. |
| **SUP** | **Supplier** | Org acquires resources/features from another Org. | **Outbound Cost**: Org pays Money -> Supplier. |
| **PRT** | **Partnership** | Mutual acquisition of marketing sources/reach. | **Zero Cost / Bidirectional**: Org & Partner exchange **Activity**. |
| **AFF** | **Affiliate** | Org acquires a marketing source (The Affiliate). | **Outbound Cost**: Org pays Money -> Affiliate (The Source). |
| **RES** | **Reseller** | Org provides Products to a Distributor. | **Inbound Value**: Reseller pays Value/Reach -> Org. |
| **INV** | **Investor** | Org acquires Capital. | **Outbound Equity**: Org pays Equity -> Investor. |
| **HUM** | **Human Resources** | Org acquires Internal Talent. | **Outbound Comp**: Org pays Salary -> Employee. |

> **Note on "Paying for Sources"**: 
> *   **AFF** is about paying a Source (The Affiliate) to generate leads. 
> *   **PRT** is about sharing Activity with a Source (The Partner) without monetary exchange.
> *   If an Org *sells* "Affiliate Services" (i.e. they are the network), that is a **B2B** product, not an AFF opportunity type for themselves.

## 2. Core Fields (SQL)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Immutable identifier. |
| `account_id` | UUID | The Tenancy Owner (Who is running the Opp). |
| `contact_id` | UUID | The Primary Target (The Lead). |
| `type` | Enum | `B2B`, `B2C`, `SUP`, `PRT`, `AFF`, `RES`, `INV`, `HUM`. |
| `stage` | String | Current status in the funnel (e.g., `MQL`, `SQL`). |
| `value` | Decimal | Projected monetary value (if applicable). |

## 3. Data JSON Schema

```typescript
interface OpportunityData {
    // Context
    pipelineId: string;         // The Logic governing this deal.
    sourceCampaignId?: string;  // Where did this come from?
    
    // Qualification
    currentStage: string;
    probability: number;        // 0-100%
    expectedCloseDate?: string;

    // Type-Specific Data
    partnershipDetails?: {
        agreementType: 'Integration' | 'Co-Marketing';
    };
    employmentDetails?: {       // Only for HUM
        role: string;
        department: string;
    };
}
```

## 4. Workflows & Stages

The `stage` progression depends on the `type`.

*   **B2B/B2C**: `Subscriber` -> `MQL` -> `SQL` -> `Customer` -> `Churned`.
*   **HUM**: `Applied` -> `Screening` -> `Interview` -> `Offer` -> `Hired`.
*   **PRT**: `Identified` -> `Outreach` -> `Negotiation` -> `Active` -> `Terminated`.
