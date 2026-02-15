# Health Scoring Logic

> **Definition**: Health Scores quantify the engagement and value of Contacts and Accounts. They are composite metrics derived from `Lifespan`, `deterioration`, and `Activity`.

## Contact Health Score

**Formula**: `HealthScore = Sum(Daily Deterioration) + Sum(Activity Scores)`

### 1. Daily Score Deterioration
Quantifies the natural decay of a lead's value over time.

*   `Deterioration Rate = 1 / Contact Lifespan (Days)`
*   *Example*: If Lifespan = 70 days, daily decay = -0.014 points.

### 2. Activity Score
Quantifies the value of a specific engagement.

*   `Activity Score = Total Activity Value / Contact Lifespan`
*   **Total Activity Value**: Sum of weighted values for all activities.
    *   `Engagement Task Activities`: Assigned to End Users (e.g., Call, Email).
    *   `Engagement Activities`: Performed by Contact (e.g., Click, Open).

### 3. Contact Lifespan
The duration a Contact remains active in a Campaign.
*   **Default**: 70 Days (GDPR Guidelines).
*   **Impact**: Shorter lifespan = Higher urgency = Higher weighted activity scores.

## Account Health Score

**Formula**: `Average(Primary Contacts' Health Scores)`

*   Aggregates the health of all **Decision Makers (DM)** and **Influencers (IN)** linked to the Account.
*   End Users (EU) are typically excluded from Account Health unless specified by Campaign settings.

## Opportunity Health Score

**Formula**: `Average(Primary Contacts' Health Scores)` linked to the Opportunity.

*   Used to prioritize Sales efforts.
*   High Health + High Value = High Priority.

## Engagement Goals

Campaigns define expected engagement frequency.
*   **Engagement Goal**: "Contact should convert/engage every X days."
*   **Metric**: `Frequency = Lifespan / Goal`
