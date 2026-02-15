# Stochastic Attribution & Lead Physics

> **Concept**: The Customer Journey is approximated as an **Absorbing Markov Chain**.
> **Goal**: To calculate the "Physics-based" Cost of Acquisition (CAC) and Attribution "Spread".

## 1. The Markov State Space

The journey is a stochastic process $X_t$ over a finite state space $S$.

$$ S = \{Suspect, MQL, SQL, FTP, RTP, Churned, Lost\} $$

### The Transition Matrix ($Q$)
The dynamics are governed by a matrix where $P_{ij}$ is the probability of moving from state $i$ to $j$.

- **Sparsity**: Upper-triangular (cannot skip stages).
- **Recursive Loop**: $RTP \rightarrow RTP$ is a nested renewal loop.
- **Absorbing States**: `Churned` and `Lost` (Entropy Maximized).

## 2. The Fundamental Matrix ($N$)

We calculate the **Expected Effort** using the Fundamental Matrix for absorbing chains:

$$ N = (I - Q)^{-1} $$

- **$N_{ij}$**: The expected number of steps (Activities) spent in state $j$ starting from $i$.
- **Physics Calculation**: $Cost = N \times DurationVector \times HourlyRate$.

## 3. Entropy & Lead Health

Lead Health is a dynamic, energetic state, not a static score.

$$ H(t) = H_0 + \sum E_{act} - \lambda t $$

- **Entropic Decay ($\lambda t$)**: Health decays over time (The "Forgetting Curve").
- **Activation Energy ($E_{act}$)**: Activities (Calls, Emails) inject energy.
- **Micro-State Collapse**: If $H(t) < Threshold$, the state collapses to `Lost`.

## 4. Rational Attribution (Trigonometry)

We use **Rational Trigonometry** to measure the "distance" of an Activity from the Sale.

- **Quadrance ($Q$)**: Squared distance to conversion.
- **Spread ($s$)**: Divergence from the optimal path (efficiency coefficient).
- **Logic**: Attribution is not "fuzzy" (70%); it is geometrically exact based on the graph distance.
