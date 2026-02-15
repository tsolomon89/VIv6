# Workflow Engine (The Scripted Agent)

> **Definition**: Workflows are deterministic scripts that "play the game" on behalf of the System.
> **Role**: They are simple, rule-based Agents.

## 1. The Campaign Hierarchy

A Campaign is a Strategy Record that contains rules for targeting and engagement.

- **Campaign** ("Q3 Nurture")
    - **Asset Group** ("Healthcare Segment")
        - **Workflow** ("Drip Sequence")
            - **Step** ("Send Email 1")

## 2. Execution Logic

A Workflow is an **Activity Generator**.

### The Step Record
```typescript
RecordStruct {
  typeObject: "WorkflowStep",
  fields: {
    action: "send_email",
    delay_hours: 24,
    next_step: "step-2-id"
  }
}
```

### The Engine Loop
1.  **Trigger**: `Activity` (e.g., Form Submit).
2.  **Match**: Find active Workflows for this Contact/Segment.
3.  **Enroll**: Create a `WorkflowEnrollment` record (State: `Step 1`).
4.  **Execute**:
    - Check Delay.
    - If Ready, Generate `Activity` (Type=`Email`, Actor=`System`).
    - Advance State to `Step 2`.

## 3. Exit Conditions (Game Win/Loss)
- **Win**: Contact performs Desired Activity (e.g., "Replies").
    - Action: Upgrade Stage to `MQL`.
- **Loss**: Sequence ends with no engagement.
    - Action: Downgrade Health Score.

## 4. Generative Logic (The Autopilot)
The Engine attempts to "play the game" by generating assets and strategies automatically.

### Campaign Generation (Recursive Match)
- **Trigger**: New Product Created.
- **Logic**: `SELECT Campaign WHERE Product.type == Campaign.type`.
- **Action**: If NULL, **Generate** new Campaign based on Templates.

### Asset Generation (Combinatorial)
- **Logic**: Cartesian product of `Features x Solutions x Persona`.
- **Grammar**: Uses Context-Free Grammar to generate headlines/copy.
- **Human-in-the-Loop**: If a property is NULL (cannot generate), the Engine creates a **Creative Activity** for a human user.

## 5. Meta-Model: Pipelines
Pipelines are higher-order groupings of Workflows.
- **B2C**: Short interval, automated steps.
- **B2B**: Long interval, "Task" steps (assigning human agents).
