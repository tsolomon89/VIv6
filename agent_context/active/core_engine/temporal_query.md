# Temporal Query Model (Time Travel)

> **Core Principle**: The Database is an append-only Log. "State" is a function of Time.
> **Fact**: `State(t) = Reduce(Events[0...t])`

## 1. The Event Log
The foundational table is `records` where `type=Activity`.
Every Record has:
- `valid_from` (Timestamp)
- `valid_to` (Timestamp, null if current)
- `transaction_id` (Sequence)

## 2. The Time-Slice Query

To view the system "as it was" on January 15th:

```sql
SELECT * FROM records 
WHERE valid_from <= '2024-01-15' 
AND (valid_to IS NULL OR valid_to > '2024-01-15')
```

### For Computed State (Projections)
Projections (like "Pipeline Stage") are harder. We cannot query them directly if they are computed.

**Optimized Approach (Snapshots):**
1.  **Write-Ahead**: When an Event happens, we compute the *new* state and write a `SnapshotRecord`.
    - `Snapshot: Contact=Jane, Stage=MQL, Date=Jan 15`
2.  **Query**:
    - `SELECT * FROM snapshots WHERE date <= '2024-01-15' ORDER BY date DESC LIMIT 1`

## 3. Game Clock vs Wall Clock

The System tracks two times:
1.  **Wall Clock**: When the record was physically written (`created_at`).
    - *Immutable*. Used for Audit.
2.  **Game Clock**: The effective time of the event`effective_date`.
    - *Mutable in Sim Mode*. Used for Logic.

> **Rule**: In Organic Mode, `GameClock == WallClock`. In Sim Mode, `GameClock` is set by the Simulator.

## 4. Determinism
Because the Logic (Workflows/Scoring) is deterministic, re-playing the same Event Log with the same Code Version **MUST** yield the exact same State.
This allows "What-If" analysis:
1.  Fork the Log (copy to Sim Account).
2.  Insert a new Event at $t_{-10}$.
3.  Replay to $t_{now}$.
4.  Observe divergence.
