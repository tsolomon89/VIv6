# Business Physics (The Solved State)

> **Origin**: Derived from the "Original Idea" (User Presentation).
> **Purpose**: These formulas define the **Constraints** and **Equilibrium** of the Game Engine.

In the Simulation, outcomes are not arbitrary. They are the result of specific variables interacting over time.

## 1. The Variables

| Symbol | Definition | Unit | Example |
| :--- | :--- | :--- | :--- |
| **h** | Working Hours per Day | Hours | `7` |
| **q** | Work Days per Week | Days | `5` |
| **e** | FTE Account Executives (Closers) | Count | `1.5` |
| **d** | Duration of Demo | Seconds | `3000` (50 min) |
| **x** | Conv. Rate: Demo to Deal | Decimal | `0.2` (20%) |
| **r** | Conv. Rate: Dial to Answer | Decimal | `0.1` (10%) |
| **t_p** | Avg Presentation Time (Call) | Seconds | `120` |
| **t_a** | Avg Admin Time (Between Calls) | Seconds | `200` |

## 2. Derived Constants

### Working Seconds per Week (`w`)
Total available energy in the system per FTE.
```math
w = 3600 * h * q
```
*Example*: `3600 * 7 * 5 = 126,000 seconds/week`.

### Average Action Cost (`t`)
The cost in time to process one unit of work (one lead attempt).
```math
t = t_p + t_a
```
*Example*: `120 + 200 = 320 seconds`.

## 3. The Capacity Equations

### Weekly Demo Capacity (`c`)
How many Demos can the Account Executive team handle?
```math
c = (w * e) / d
```

### Required Calls (`n`)
How many dials are needed to fill that capacity?
```math
n = c / (x * r)
```
*Logic*: You need `c` deals. `c/x` is Demos. `(c/x)/r` is Answers. *(Note: The formula in the image implies `x` is Answer->Demo, validating `n = c/x` if x is conversion to demo)*.

**Correction based on Image**:
- `x` = Conversion Rate **Answer to Demo**.
- `r` = Conversion Rate **Dial to Answer**.
- Therefore: `Calls -> Answers -> Demos`.
- Formula: `n = c / (x * r)` matches the image `c / (x*r)`.

## 4. The Master Equation (`f`)

Determines the required number of BDM (SDR) employees (`f`) to feed the AE team (`e`).

```math
f = \frac{e * t}{d * x * r}
```

### Application in Simulator
When running `Standard Simulation`:
1.  **Input**: The User sets their desired Revenue (implied by `e` capacity).
2.  **Constraint**: The Simulator explicitly calculates `f` (Required Activities).
3.  **Execution**: The Simulator attempts to perform `f` actions.
    - If `Available_Action_Points < f`, the Simulation **Fails** (Pipeline dries up).
    - If `Available_Action_Points >= f`, the Simulation **Succeeds** (Capacity met).

> **The Insight**: You cannot "Try Harder". You can only change variables (`h`, `x`, `r`) or add resources (`e`, `f`).

## 5. The Entropy of Lead Scoring
Lead Health ($H$) is a dynamic, decaying energetic state.

$$ H(t) = H_0 + \sum E_{act} - \lambda t $$

- **$H_0$**: Initial Energy (e.g., Inbound Form Fill = High, Cold List = Low).
- **$E_{act}$**: Activation Energy injected by Engagement Activities (Call, Email).
- **$\lambda t$**: Entropic Decay over time (The "Forgetting Curve").

### Thresholding
- If $H(t) < H_{critical}$, the system automatically transitions the Opportunity to **Lost**.
- This enables **Auto-Cleaning** of the pipeline; dead leads are removed by physics, not human decision.
