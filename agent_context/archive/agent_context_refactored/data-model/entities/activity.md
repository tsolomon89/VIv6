# Activity Entity Specification

> **Definition**: An Activity is an immutable, timestamped record of an event. It is the "Write-Ahead Log" of the business.

## Core Fields (SQL)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Immutable identifier. |
| `account_id` | UUID | The Context Account (where the event happened). |
| `contact_id` | UUID | The Actor (who did it). NULL if anonymous. |
| `activity_type` | String | The event verb (e.g., `page_view`, `form_submit`). |
| `asset_id` | UUID | The Object (what was interacted with). |
| `occurred_at` | Timestamp | When it happened. |

## Standard Activity Types

| Type | Description | Required Metadata (`data` JSON) |
| :--- | :--- | :--- |
| `page_view` | User loaded a page. | `url`, `referrer`, `userAgent` |
| `form_submit` | User submitted a form. | `formId`, `formData` (snapshot) |
| `click` | User clicked a tracked element. | `elementId`, `targetUrl` |
| `login` | User authenticated. | `method` ('email', 'google'), `success` |
| `email_open` | Contact opened an email. | `emailId`, `campaignId` |
| `purchase` | Transaction completed. | `amount`, `currency`, `gatewayId` |

## Data JSON Schema

```typescript
interface ActivityData {
    // Context
    url?: string;
    ip?: string;
    userAgent?: string;
    
    // Session
    sessionId?: string;
    
    // Payload (Event specific)
    formData?: Record<string, any>;
    metadata?: Record<string, any>;
    
    // Attribution (Redundant for easy querying)
    utm?: {
        source?: string;
        medium?: string;
        campaign?: string;
    };
}
```

## Immutable Ledger Architecture

Activities are **Append-Only**.
*   **Update**: NEVER allowed.
*   **Delete**: ONLY via hard deletion policy (GDPR/Compliance). Soft deletes are not sufficient for removing personal data if requested.

## Relationship to Opportunities

Activities drive Opportunity State.
*   `form_submit` -> Creates `MQL` Opportunity.
*   `purchase` -> Transitions Opportunity to `FTP`.

This logic resides in the **Application Service Layer**, not the Database Triggers.
