# Simulator Service (The AI Player)

> **Concept**: The Simulator is an autonomous agent that generates `Activity` records in a "Sim Account" to predict future states.

## 1. Architecture

The Simulator is a **Client** of the System, just like a User.
- **Identity**: It mocks multiple `Contact` records (Synthetic Agents).
- **Context**: It operates exclusively within a `sim_account_id` partition.

## 2. Operation Modes

### Mode A: "The Monte Carlo" (Forecast)
1.  **Clone**: Copy current Real Account state (Snapshot) to Sim Account.
2.  **Accelerate**: Run `GameClock` at 100x speed.
3.  **Act**: For each Synthetic Agent:
    - Roll Dice (weighted by `HealthScore` and `Workflow` probabilities).
    - If Success: Generate `Conversion` Activity.
    - If Fail: Generate `Churn` Activity.
4.  **Report**: Compare end-state revenue vs baseline.

### Mode B: "The Stress Test" (Load)
1.  **Spawn**: Create 10,000 Synthetic Contacts.
2.  **Flood**: Generate random API traffic (Clickstreams).
3.  **Measure**: Monitor `ResourceEconomy` (Latency, Usage Limits).

## 3. The Generative Loop

```typescript
while (gameTime < endTime) {
  // 1. Advance Clock
  gameTime.add(1, 'hour');
  
  // 2. Wake Agents
  const agents = fetchActiveAgents(simAccountId);
  
  // 3. Perform Actions
  agents.forEach(agent => {
    const action = agent.decideNextMove(gameTime); // Probabilistic
    if (action) {
       writeActivity(simAccountId, agent.id, action);
       consumeResource(simAccountId, "action_points", 1);
    }
  });
}
```
