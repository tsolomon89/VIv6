# Workflow & Automation Logic

> **Definition**: Workflows are the engine of the "Meta Model". They orchestrate the movement of Contacts through Stages via sequences of Steps.

## Core Concepts

### 1. The Campaign Hierarchy
*   **Campaign**: The Strategy (e.g., "Q3 B2B Nurture").
    *   **Asset Group**: The Segment (e.g., "Healthcare Sector").
        *   **Workflow**: The Tactic (The ruleset).
            *   **Stage**: The Milestone (e.g., "Qualify").
                *   **Sequence**: The Loop (e.g., "Email Drip").
                    *   **Step**: The Action (e.g., "Send Email 1").

### 2. Asset Groups (Segmentation)
Asset Groups allow the same Campaign to deliver different content to different audiences.
*   **Fields**: Segment by `Industry`, `Job Function`, or `Location`.
*   **Example**:
    *   *Asset Group A*: `Industry=Healthcare` -> Sends "Hospital Case Study".
    *   *Asset Group B*: `Industry=Tech` -> Sends "SaaS Case Study".


### 2. Automation Components

#### Steps
A Step combines an **Asset** with an **Engagement Activity**.
*   *Action*: "Send Whitepaper (Asset) via Email (Activity) to Contact."
*   *Trigger*: Time-based (Delay) or Event-based (Previous Step Complete).

#### Sequences
A group of Steps designed to elicit a specific response.
*   *Exit Condition*: Contact performs a specific Activity (e.g., "Simulated Activity" like Clicking a Link or Replying).
*   *Fallback*: If no engagement after Sequence end, trigger "Breakup" step or move to "Cold" stage.

#### Stages
A group of Sequences aligned with an **Opportunity Qualification Goal (OQG)**.
*   *Goal*: "Get MQL Status".
*   *Content*: All sequences in this stage aim to satisfy MQL requirements (Persona Match, Consent, Opt-in).
*   *Transition*: When OQG is met, Contact moves to next Stage (e.g., "Sales Ready").

## The "Meta" Model: Pipelines

Pipelines group Products and their Workflows.

*   **B2C Pipeline**:
    *   shorter sales cycles.
    *   automated "Storefront" workflows.
*   **B2B Pipeline**:
    *   longer sales cycles.
    *   human-touch "Sales" workflows.
    *   Approvals required for FTP stage.

**Logic**: The `Campaign.Pipeline` determines which Workflows are available.

## Activity Generation

Workflows **generate Activities** for End Users.
*   *System*: "Contact reached Step 3."
*   *Workflow*: "Step 3 requires a Phone Call."
*   *Action*: Create `Activity { type: 'call', assigned_to: 'Sales-Junior' }`.
*   *Result*: Task appears in Sales Agent's queue.
