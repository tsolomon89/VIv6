# Campaign Entity Specification

> **Definition**: A Campaign is a strategic grouping of Assets and Activities designed to achieve specific Qualification Goals for a specific Audience.

## Core Fields (SQL - `entities` table with type='campaign')

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Immutable identifier. |
| `slug` | String | Unique identifier (e.g., `q3-2024-web-promo`). |
| `name` | String | Derived from parameters (Product + Persona + OppType). |
| `type` | String | `campaign`. |

## The Campaign Definition (Audience)

A Campaign is defined by the intersection of four properties:
1.  **Pipeline**: The Product Line (e.g., B2B, B2C).
2.  **Persona**: The Target Audience (e.g., Decision Maker).
3.  **Opportunity Type**: The Funnel Stage (e.g., MQL).
4.  **Use Case**: The specific context (e.g., "University Students").

*   **Formula**: `Campaign = Product + Persona + OppType + UseCase`

## Data JSON Schema

```typescript
interface CampaignData {
    // Definition
    pipelineId: string;         // Reference to Product Group
    personaType: 'DM' | 'EU' | 'IN';
    opportunityType: 'MQL' | 'SQL' | 'FTP' | 'RTP';
    useCaseId: string;          // Reference to Use Case Entity

    // Settings
    contactLifespanDays: number; // Default: 70 (GDPR)
    engagementGoalFrequency: number; 
    
    // Performance
    goals?: {
        conversionRate?: number;
        costPerAcquisition?: number;
    };
}
```

## Asset Groups

An **Asset Group** segments the Campaign Audience further by specific attributes (Industry, Location, etc.) to deliver targeted Assets.

*   **Structure**: Campaign -> Asset Group -> Assets.
*   **Segmentation**: 
    *   `Industry` (e.g., Healthcare)
    *   `Job Function` (e.g., HR)
    *   `Location` (e.g., UK)

## Workflows

A Campaign executes a **Workflow** to automate engagement.

*   **Step**: An Asset + Engagement Activity (e.g., "Send Email 1").
*   **Sequence**: A series of Steps (e.g., "Nurture Sequence").
*   **Stage**: A group of Sequences targeting a specific Qualification Goal.

**Logic**: 
1.  If `Activity` happens? -> Proceed to next Step.
2.  If `Qualification Goal` met? -> Proceed to next Stage.
3.  If `Duration` > `Lifespan`? -> Remove Contact from Campaign.
