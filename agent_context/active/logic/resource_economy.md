# Resource Economy & Game Rules

> **Philosophy**: In the Game Engine architecture, "Business Logic" is actually **Resource Mechanics**.
> **Core Mechanics**: Finite Action Capacity (Metering) and Entity Health (Scoring).

## 1. Finite Action Capacity (Metering)

Users (and Agents) have a limited capacity to perform actions within a period.

### Fact Store Implementation
- **Capacity Definition**: A `Product` or `Plan` record defines the limits.
  - `Record: Plan-Pro` -> `Field: max_actions_per_day` -> `Value: 1000`
- **Usage Tracking**: Not a counter, but a **Query**.
  - `Usage = Count(Activity where actor=User AND timestamp > StartOfDay)`
- **Enforcement (The Guard)**:
  - Before writing an `Activity`, the Engine runs the Usage Query.
  - If `Usage >= Capacity`, the write is rejected (or queued).

### Resource Types
- **Hard Resources**: Storage, Seats (traditional limits).
- **Soft Resources**: "Action Points" (Simulated capacity for Agents).

## 2. Entity Health & Probability (Scoring)

"Health" is not a field. It is a **computed projection** of an entity's viability.

### The Deterioration Model (Entropy)
Value decays over time unless maintained by Activity.

- **Formula**: `CurrentScore = BaseScore - (TimeSinceLastActivity * DecayRate)`
- **Implication**: A "Lead" that hasn't been touched in 30 days has a Health of 0 (Dead), even if no one marked it as such.

### Activity Weighting
Different actions add different amounts of energy to the system.
- **Call**: +10 pts
- **Email**: +2 pts
- **Click**: +0.5 pts

### Probabilistic Conversion
The "Health Score" determines the probability of a positive outcome in Simulation Mode.
- `Probability(Conversion) = Sigmoid(HealthScore)`
- High Health = High chance of moving to next pipeline stage.

### Aggregation Logic (Hierarchy)
- **Contact Health**: `Basis Calculation` (Decay + Activity).
- **Opportunity Health**: `Average(Primary_Contacts.Health)`.
- **Account Health**: `Average(All_Contacts.Health)`.

> **Rule**: An Account cannot be healthy if its people are neglected.

## 3. Implementation Patterns

### The "Referee" (Logic Layer)
A pure function that resolves the gamestate.

```typescript
function calculateHealth(contact: RecordStruct, history: Activity[]): number {
  let score = 0;
  // ... apply decay and weights ...
  return score;
}
```

This function is used by:
1.  **CRM UI**: To show "Hot Leads".
2.  **Simulator**: To decide if a synthetic lead buys the product.
