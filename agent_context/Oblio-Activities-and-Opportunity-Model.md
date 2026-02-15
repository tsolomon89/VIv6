# **The Oblio Operating System: An Exhaustive Analysis of Activity Physics, Opportunity Logic, and Strategic Simulation**

## **1\. Introduction: The Convergence of Business Operations and Simulation Strategy**

The architecture of modern enterprise resource planning has historically been divided into two distinct categories: systems of record (Data Warehouses, CRMs) and systems of engagement (Marketing Automation, Sales Enablement). The **Oblio** platform represents a paradigm shift that collapses these categories into a single, unified "Business Operating System." Based on a rigorous analysis of the system's internal documentation, algorithmic sheets, and architectural schematics, Oblio is not merely a tool for tracking past events but a forward-looking **"spreadsheet management simulator"** akin to complex strategy games like *Civilization*.1

This report provides an exhaustive, deep-dive analysis of the Oblio ecosystem, with a specific focus on the **Activities Model**, the **Opportunity Architecture**, and the complex **Financial and Operational Simulation** embedded within the system's "Sheet" documents. By examining the precise mechanisms of how activities are generated, how their states are evaluated via boolean logic, and how these atomic units of work drive the macroscopic scaling of the organization, we reveal a system designed around the "Physics of Business"—where time is treated as a finite resource, labor is modeled as processor capacity, and market strategy is executed through a turn-based simulation engine.

The analysis draws strictly from internal "Oblio" documentation, specifically the "Algo 1" forecasting sheets, system design manifests, and object relationship models, to reconstruct the logic that governs this digital economy.

## **2\. The Physics of the Activity Model**

At the nucleus of the Oblio system lies the **Activity**. In traditional CRM systems, an activity is a passive log entry—a record that a call was made or an email sent. In Oblio, an Activity is a kinetic unit of **"Activation Energy"** designed to counteract the natural "Entropic Decay" of a lead's health score.2 The system models the customer relationship as a thermodynamic system where enthusiasm and intent naturally dissipate over time unless injected with energy via specific, calculated interventions.

### **2.1 The Three Durations: Quantifying Labor Cost**

The primary innovation in Oblio’s activity modeling is its rigorous treatment of Time. The system rejects the notion of abstract "effort" in favor of precise temporal metrics, known as **The Three Durations**.2 These metrics serve as the bridge between human behavior and the system's financial forecasting models.

1. **Default Duration (![][image1]):** This represents the theoretical "Cost" of an action. It is a static value assigned during the initial configuration of the system (e.g., 300 seconds for a "Lead Action").3 It is used for *a priori* capacity planning, allowing the simulation engine to forecast headcount needs before any real-world data exists.  
2. **Baseline Duration (![][image2]):** As the system accumulates data, it calculates the statistical average of historical performance. This creates a feedback loop where the simulation adjusts its "Physics" based on the actual velocity of the workforce.  
3. **Actual Duration (![][image3]):** This is the precise scalar value measuring the human labor expended on a specific instance.

#### **2.1.1 The CRUD Window Mechanics and High-Fidelity Capture**

To capture ![][image3] with high fidelity, Oblio enforces a strict User Experience (UX) constraint known as the **CRUD Window Mechanics**. The system mandates that all "Create, Read, Update, Delete" operations occur within a dedicated Sidebar.2

The measurement logic is absolute:

![][image4]  
Users are expected to keep the sidebar open while performing the task. If the sidebar is closed, the timer halts. This mechanism filters out "multitasking" noise, ensuring that the recorded duration reflects focused cognitive load. This transforms the Sidebar into a "punch clock" for micro-tasks, allowing the system to calculate the **Customer Acquisition Cost (CAC)** based on the "Physics" of labor (Time × Hourly Rate) rather than arbitrary estimates.2

### **2.2 Finite Capacity Constraints (Algo 1\)**

The data harvested from the Three Durations feeds directly into **Algo 1**, the Finite Capacity Constraint algorithm. This algorithm models the workforce not as flexible employees but as parallel processors with a fixed "Activity Capacity" (![][image5]).

The capacity logic is derived from the "Simple (Old)" forecasting model 3, which establishes the fundamental constraints of the game world:

* **Working Seconds in Day:** 21,600 (based on a 6-hour "active" workday).  
* **Average Lead Action Time:** 300 seconds (5 minutes).  
* **Average Call Action Time:** 300 seconds.

Using these constants, the system calculates the maximum throughput of a single human unit:

![][image6]  
This "Physics" dictates the **Employment Plan**. If the pipeline simulation (discussed in Section 4\) requires 1,000 leads to be processed in a month to hit revenue targets, the system calculates the load:

![][image7]  
![][image8]  
This calculation prevents "Backpressure"—the accumulation of unworked leads that plagues unconstrained systems. By treating capacity as finite, Oblio forces the "Player" (the business manager) to either upgrade their units (reduce action time) or deploy more units (hire staff).2

### **2.3 Activity Generation: Procedural Content and The Product Tensor**

How are these Activities created? Oblio employs a **Procedural Content Generation** engine driven by the **Product Tensor**.4 This ensures that the "game world" is populated with meaningful tasks without constant manual input.

#### **2.3.1 The Product Tensor Logic**

The Product Tensor is a multi-dimensional matrix that acts as the "DNA" for all business operations. It combines three variables to generate valid **Use Cases**:

1. **Feature (Noun):** The physical tool (e.g., "Dashboard", "API").  
2. **Solution (Verb):** The functional benefit (e.g., "Analytics", "Automation").  
3. **Persona (Target):** The audience (e.g., "CFO", "Marketing Manager").

**Use Case Vector \= Feature × Solution × Persona**.2

#### **2.3.2 Programmatic Asset Generation (Algo 4\)**

The "Programmatic Content Algo v4" 4 uses this tensor to auto-generate **Asset Activities**. It employs a Context-Free Grammar with specific rules to construct titles and descriptions:

* **Title Rule:** \[Use Case\] \+ \+ \[Feature\] ![][image9] "Business Intelligence Dashboard".  
* **Description Rule A:** "A \[Feature\] feature with solutions for \[Use Case\]."

This procedural generation allows the system to scale its content operations infinitely. However, the system includes a **"Generative Fallback"** mechanism. If the tensor encounters a "null property" (e.g., a missing variable for a specific combination), it triggers a manual **Asset Activity** for a "Creative End User." This is analogous to a "Quest" in a video game: the system identifies a gap in the world and generates a mission for a player to fill it.2

### **2.4 State Evaluation: The Logic of Qualifiers**

Once an Activity is generated and assigned, its completion is governed by **Qualifiers**. These act as the "Transmission" of the system, determining if the energy expended translates into forward motion.2

Qualifiers are Boolean conditions associated with an Activity or Opportunity. An Activity cannot be simply "marked done"; it must be "Won."

* **Winning Logic:** An Activity is Won IF AND ONLY IF ![][image10].  
* **UX Enforcement:** The Sidebar displays these Qualifiers as a checklist. The "Stupify" philosophy prevents the user from submitting the activity until the boolean conditions are met.2

For example, an "Engagement Activity" (e.g., a Discovery Call) might have the following Qualifiers:

1. Budget \> $10,000  
2. Decision\_Maker \== Present  
3. Timeline \== Q1

If the user cannot verify these truths, the Activity is "Lost," and the Activation Energy fails to move the Opportunity to the next state. This binary validation ensures that the pipeline reflects verified reality, not optimistic projections.

## **3\. The Opportunity Architecture: Finite Logical Boundaries**

In Oblio, **Opportunities** are not treated as a continuous probability percentage (e.g., "40% likely to close") but as discrete states or **"Finite Logical Boundaries"**.2 This mirrors the "Level" mechanic in gaming; a player is either Level 1 or Level 2, never Level 1.5.

### **3.1 The Discrete State Model**

The system defines a rigid sequence of opportunity types, representing the lifecycle of the customer entity:

1. **MQL (Marketing Qualified Lead):** The genesis state. Defined by Persona Match \+ Contact Info.  
2. **SQL (Sales Qualified Lead):** The activated state. Defined by Engagement \+ Intent.  
3. **FTP (First Time Purchase):** The "Fixed Point" of value realization. This is the moment transaction ![][image11] occurs.  
4. **RTP (Retention Purchase):** The recursive state (![][image12]).

### **3.2 The Chain Reaction Mechanism**

The transition between these states is automated by the Activity Model. The logic follows a strict causal chain 2:

![][image13]  
This automation removes administrative friction. The user does not "move the opportunity stage"; they simply win the activity. The system then calculates the state change. For instance, "Winning" the Qualifiers of a Primary Product automatically triggers the creation of the next Opportunity Type in the sequence.

### **3.3 The Object Graph and Cardinality**

Opportunities serve as the "center of gravity" for the **Customer Object Graph**.1 The "Data Modelling v3" document 1 outlines the rigorous cardinality governing these relationships:

* **Opportunity ![][image14] Products:** A MANY-to-MANY relationship. The value of an Opportunity is not a manually entered field but the sum of the pricing logic of all associated Product Tensors.  
* **Opportunity ![][image14] Contacts:** A MANY-to-MANY relationship, but with specific role flags: Primary, Decision Maker, Billing.  
* **Opportunity ![][image14] Account:** A strict dependency for B2B pipelines. An Opportunity *must* be anchored to an Account (Organization) via a URL.

This graph structure allows the system to calculate "Entropic Decay" not just on a single deal, but across the entire Account vector. If a "Decision Maker" contact leaves the Account (detected via Work History updates 1), the "Health Score" of the related Opportunity implicitly drops, triggering a new "Engagement Activity" to secure a new champion.

## **4\. Deep Dive: The Simulation Engine and Economic Modeling**

The most complex aspect of Oblio is its capacity for **Strategic Simulation**. The "Sheet" documents, particularly **"Oblio Algo 1 : Activity / Forecasting Algo. \- Complex.csv"** 3 and **"Sheet3.csv"** 3, reveal a sophisticated economic engine that models organizational scaling like a game of *Civilization*.

The system operates on a "Game Clock" 1, allowing managers to simulate years of growth in seconds. The core of this simulation is the **"Sales Pod"**—the fundamental unit of production.

### **4.1 The Pod Scaling Logic (Geometric Progression)**

The "Complex" algorithm relies on a geometric progression strategy for scaling revenue capacity. The organization does not hire individuals; it deploys "Pods."

**The Doubling Rule:** The model hardcodes a doubling of Pod counts annually starting from Year 2 3:

* **Year 1:** 0.5 Pod (Experimental/Beta Phase) – 11 Employees.  
* **Year 2:** 1 Pod  
* **Year 3:** 2 Pods  
* **Year 4:** 4 Pods  
* **Year 5:** 8 Pods  
* ...  
* **Year 10:** 256 Pods – 2,109 Employees.

This exponential growth curve is the central mechanic of the simulation. It implies that the "Player" must secure enough capital in the early rounds (Years 1-3) to fund the massive expansion in the mid-game (Years 4-6).

### **4.2 Pod Composition and Unit Costs**

A standard "Sales Pod" is a combined arms unit designed for autonomy. The "Complex" sheet breaks down the composition 3:

| Role | Count | Function | Starting Salary (Year 2\) | Year 10 Salary |
| :---- | :---- | :---- | :---- | :---- |
| **SDR** | 2 | High-volume outbound (Leads ![][image9] Calls) | $32,000 | $55,296 (SDR 1\) |
| **AE** | 1 | Closing (Calls ![][image9] Deals) | $35,000 (Year 4 start) | $219,620 |
| **CS** | 1 | Retention (FTP ![][image9] RTP) | *Variable* | *Variable* |

**Insight on Salary Ramping:** The model builds in inflation and seniority. An SDR's salary increases by exactly **20% annually** (32k ![][image9] 38.4k ![][image9] 46.08k ![][image9] 55.29k). The Account Executive (AE), however, sees a much more aggressive curve, growing nearly **600%** by Year 10\. This suggests the simulation values the "closer" role significantly higher as the complexity of the organization increases, likely due to the shift toward Enterprise deals (see Section 5).

### **4.3 The Financial Cliff: Budget Explosion**

The "Employment Plan" reveals the financial consequences of the Pod Scaling Strategy. The "Sales Ops" budget—the cost to run the game—explodes:

* **Year 1:** $54,500 (Survival Mode).  
* **Year 5:** $1,267,828 (Growth Mode).  
* **Year 10:** $46,157,303 (Empire Mode).

The simulation explicitly tracks the "Funding Year" for each batch of Pods. For example, **Pods 5, 6, 7, and 8** are all initialized in **Year 5** with a seed capital of **$131,000 each**. This requires the business to have generated sufficient "Retained Earnings" or "Investment Capital" in Years 1-4 to unlock these units. If the "Actual Duration" of activities in Years 1-4 was too high (inefficiency), the CAC would be inflated, profits would be lower, and the Year 5 expansion would be mathematically impossible—leading to a "Game Over" state in the simulation.

## **5\. Market Dynamics and Strategic Evolution**

The "Sheet3" document 3 provides a critical layer of depth to the simulation: the **Market Segmentation Analysis**. As the organization scales its Pod count, the nature of the "Game" changes fundamental. The "Enemy" (the market) evolves.

### **5.1 The Shift from VSB to Enterprise**

The data shows a clear migration of deal volume and market share across four segments: **VSB (Very Small Business)**, **SMB (Small/Medium)**, **MID (Mid-Market)**, and **ENT (Enterprise)**.

#### **Table 1: Market Share Evolution by Pod Count**

3

| Pod Count | VSB Share | SMB Share | MID Share | ENT Share | Dominant Strategy |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **2 Pods** | **25%** | 5% | 9% | \~0% | **"Zerg Rush"** (High Vol, Low Value) |
| **16 Pods** | 10% | **35%** | 30% | 5% | **"Mid-Game Expansion"** |
| **96 Pods** | 5% | 15% | **49%** | 30% | **"Consolidation"** |
| **288 Pods** | 4.5% | 10% | 40% | **43%** | **"Big Game Hunting"** |

### **5.2 Strategic Implications of the Data**

* **Phase 1 (0-8 Pods):** The strategy relies on **VSB** volume. The "Activity Model" here likely prioritizes high-velocity, low-duration tasks (e.g., mass emailing). The "Conversion Rates" in Algo 1 (Simple) 3 reflect this: 1,000 leads ![][image9] 300 Calls ![][image9] 25 Deals. This is a volume game.  
* **Phase 2 (16-96 Pods):** The **MID** segment takes over. This requires a shift in "Qualifiers." The boolean logic for winning an activity likely becomes more complex (e.g., requiring multiple stakeholders).  
* **Phase 3 (144+ Pods):** The **ENT** segment dominates. Note the exponential growth of ENT deals: **0 deals** at 2 Pods ![][image9] **132 deals** at 32 Pods ![][image9] **1,852 deals** at 432 Pods.

**Insight:** The massive salary increase for AEs seen in the "Complex" sheet ($35k \\rightarrow $219k) correlates perfectly with this shift to Enterprise. An AE closing VSB deals is worth $35k; an AE closing ENT deals is worth $220k. The simulation effectively "levels up" the units to match the difficulty of the "Bosses" (Enterprise Clients).

## **6\. The "Stupify" Philosophy and User Experience**

The complexity of the underlying physics (Three Durations, Markov Chains, Tensor Logic) is hidden from the end-user by the **"Stupify"** philosophy.2

### **6.1 The Three-Step UX Pattern**

1. **Select:** The user chooses a high-level template (e.g., "B2B SaaS Sales").  
2. **Setup:** The user configures constraints (Pricing, Persona).  
3. **Stupify:** The system automates the operation.

The goal is to reduce cognitive load to a binary state: **"Do the Activity" or "Don't".**

When the sidebar opens, the user is not asked to "manage a relationship." They are asked to "Complete this Task."

* The **Timer** (![][image3]) runs automatically.  
* The **Qualifiers** present the winning conditions.  
* The **Asset** is auto-generated by the Tensor.

This design acknowledges that while the *business* is a complex simulation, the *user* is a simple processor. By constraining the user's freedom (via the Sidebar and validated fields), the system ensures the data feeding the simulation is accurate.

### **6.2 The Sidebar as the Input Terminal**

The Sidebar is the only valid input terminal for the simulation.

* **Architectural Constraint:** Sidebar.Open() is the trigger for all state changes.  
* **Layout Impact:** Expanding the sidebar compresses the dashboard, visually signaling that "Action" is taking priority over "Analysis".2

## **7\. Conclusion**

Oblio is a comprehensive attempt to digitize the physics of business. By modeling **Time** as a cost, **Activities** as vectors of energy, and **Opportunities** as discrete states, it creates a deterministic environment where business outcomes can be simulated and forecasted with high fidelity.

The "Deep Dive" into the sheets reveals a system that is not static but evolutionary. It models the geometric growth of the organization via **Sales Pods**, predicts the inevitable financial strain of scaling (the "Year 5 Cliff"), and anticipates the strategic necessity of moving upmarket from VSB to Enterprise.

Ultimately, Oblio functions as a **Meta-Game**. The Managers play the "Simulation" (Allocating Pods, managing Budgets, viewing the Game Clock), while the End Users play the "Action Game" (Completing Activities, ticking Qualifiers, beating the Duration Timer). The success of the former is entirely dependent on the strict adherence to the rules of the latter.

#### **Works cited**

1. Oblio Documentation \- 4.) Data Modelling v3, [https://drive.google.com/open?id=1IU9vmBg39FZSNfsfaIugdNMVI8YXpEqa8\_eGHCnhn1Y](https://drive.google.com/open?id=1IU9vmBg39FZSNfsfaIugdNMVI8YXpEqa8_eGHCnhn1Y)  
2. Oblio-Activities-System-Design, [https://drive.google.com/open?id=1ezbNydakqQgpCBQQBKf3vuo7E-gtlznRQilJU9uH22Q](https://drive.google.com/open?id=1ezbNydakqQgpCBQQBKf3vuo7E-gtlznRQilJU9uH22Q)  
3. Oblio Algo. 1 : Activity / Forecasting Algo.  
4. Updated Oblio Algo. 3 : Programmatic Content Algo v4, [https://drive.google.com/open?id=1GdzG9eW4BnT1dBGIycRwb0Vwz2ogyICndhGNyYEJxyw](https://drive.google.com/open?id=1GdzG9eW4BnT1dBGIycRwb0Vwz2ogyICndhGNyYEJxyw)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAA9klEQVR4XmNgGAUUgatA/B9dkFjwG4ifowsSA1gYILa2oksQA8SB+B8Qu6FL4AMcQCwJxJ1AfBiIlYFYDIiZkRXhAyAnr2Eg08k2DJDAUkKXQAOODJBw2YMsWA4V5EEWxAGeMKC5EORkYuP3JxD7IQuAnPwWiX8IiPmR+KDA82WAxMgBBjQXgmwFhTQICDOgmqwJxBeAOA1KT0KSA4PpDJA4/sYAiTIYAMUCyI+KUD4obECGoQBGIJZiwAwwkEJQeIAMgUUnuhqcAORPTygbFp2WQFwIV4EH6DAg/A+K269AXA3ELnAVBADImaDkCgKsDCQk2+EIAP7PJ345xJluAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAA40lEQVR4XmNgGAVEg6tA/B9dkBgA0nQAXZAQYGGAaGxFl8AFohkgGpDxVyA2RlaEDXAAsSQQdwLxYSBWBmIxIGZGVoQLSAPxAyD2RBOHAZwG2QDxbyBWQhO3AuLnQHwaiAXR5MBgDQPuaAD5FRQOWMEDBlSNwgwIp6Uz4AkokCZQwIAASJMflC3CAEkUKxkgtk4HYlaoHBjANHID8UIkSZBNoKiB8TGiiRGIpYCYB1kQCOYzQGyEAZAFuEIeBRwA4qVQNii+nwCxIlwWD1jOAEmCIKfOAmJ+VGn8ABS66F4YEQAAn/wmcfUIjK4AAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAA50lEQVR4XmNgGAUUgatA/B9dkFjwG4ifowsSA1gYILa2oksQA8SB+B8Qu6FL4AMcQCwJxJ1AfBiIlYFYDIiZkRXhAyAnr2Eg08k2DJDAUkKXIAaUM0ACiwddghgAcjJF8fsWiX8IiPmR+KDAA8UCN5IYHIBsBYU0CAgDsR+SnBoQnwDiOCA+AMRFSHJgMJ0BEsffGCBRBgOgWHgCxIpQPkijJkIaAhiBWIoBM8BACkHhATIEFp3oanACXyD2hLJh0WkJxIVwFXiADgPC/3uA+CsQVwOxC1wFAQByJii5ggArAwnJdjgCAJnKIasZOXpqAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAyCAYAAADhjoeLAAAFHUlEQVR4Xu3dW6htUxwH4CGXyC2X3C8RSuQSHkgcknigyItEingghXKJB5IHPCjXCPGAXFNIJO0oKS8U8UBtEkUoRUku49eYoz33Onvvs3HO3ruzvq/+rTnHXGvtOed6OL/GGHOcUgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApsFZtbaebFxFx9fafrJxSt1Q67DJRgBg+vxda5fJxlX0R62DJxunUH6T/DYXTR4AAKbLFqWFgryuFTmfHSYbp9BxtX4dXgGAKXZ0rZ8nG1fRnrX+mmycUo/VemiyEQCYHunB2qfWy7WeqbV3rd3mvWP59ijt88upxWxb2vG7ar03bOd7p9GWpV3/77XOGLZzfwCAKZQ5Uh+W/z9H6oNaXy+zlrJVrRdr3Tl5YEqttbmFAMAqSFBbS6Hg5LL0Awen17qv1gu1Xqp15fzD6/mktOtb7Ps2ZK9a1082LsN+tR5dRi0VlPsDB4u5p9aXtS6o9WOt7eYfBgA2F+ldWyoUrLT0ri12PjvXunq0f0Kt3Uf7C9m31uxk479wYK2TRvsJiIeP9jelhLn8Pgv5oay/DEvmIR450QYAbAYSjj4dthOGnh0dyzyqM0f7S9kYc9givWvpLYqsDffu6Ng5td4Z7e862t6/1k6j/f6E6Y21vivtOnI9kXPoc/XWjbbzJGa+p0sgygMZeXo220fU+rxs+Bo2loS13oOYBzFOLO1c7ijzg2uX3zLXm+vMtfTXyfXs8l2nDNu5Z2cP21n7LvcYAFhj8o/808P2x7WOHbazUGvmpV1S69uhbSXkfPLAQSSsnTs6dlBpxxOaDhm1n1/rqdLOPzI5/7lh+/XSJu6nt+qN0nrpnigtpF46tM/WOrXWNaX1XHW5Lzl2Wa2jar1V2t/PUOZK+Kq0XsQe0jK/L/fgm7LwEG8PbDnfhL0nS7um3Jf0FEZ+04TyW0obQn2k1u21Lq51xdCehxwAgDUkIebPWr+UuXXYEgwSChIOovd4rYSHS1vS47ey/pBfl0CScJIwFpeXFsR672B6jDIXLhLWeujLemY3l9ZD9n2tQ4f2XH9/z+zwmnuQ9+U80rMVCXCLDVFuCgmiP9V6v7Q5cZFAttCQcYZp+292VWnXkbl+kXN+u9arw/F4sLTfO5/L3zltaM/+dcM2ALCGZVhsPBTX/+FfTfeX+b1KM6XNd+sSZHI8vWsJcn0JjPTW7ThsJ7wlfCX89KdQ876Z0oZQE2A+G9oj4WU89JjwttRDAishv8tCgS0PH/RQFxkG7vcr78/nFlrbLvcm9ygBNZXQm/ALAKxxCWx9XlN6qtIDc+3c4VWRobzxZP/Z0s6ry5BoQldCSsJKese2GdojwfP50nrtMuTXry8PJfTwlvc8UOvuWgeUFtbyN9cNx9MLmTltFw77qyGBM8Ez4arLNY0XPs6xmdLuR7YTQhPmEjjHMsct19d7UPtwa4ZK/+t6fADACklPU+Y9PV7rvFpvlsWHJ1fKvaX1qOU/Qk8AmZxInwnzOX5TaQ8mZPgvsp32mWE/Mr+t98Bl+K8PEybUvDa8RpbzeKXMBcMEwXx23JO1GhKoEr6ynMetZf0e0ITs9JrN1Ppo1H5MacuhZA5e7mfcVubm/iXsflHaIsoAAGxCCaj9KVkAANaY9ITmqd4ss9KXMQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAz9Q82Nc4B8zQPVAAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAXCAYAAAA7kX6CAAAAvElEQVR4XmNgGLKAF4gZ0QWBgAuImdEFkcEBIP6PBT8EYkmEMtzAlwGioRxdghAgSaMEA0TxeSBOgrKbgdgDiP8B8XGEUgQwAOJHQDwHiDkZMG0sg/K9oXw4gAUCD5SPrhEEFmIRI0pjPVQMZAAcgPwAEgTFIwhg0wizMR1JjEEeiK8A8T4gFmLA1NgP5ZtA+SiAG4h/AfErIC5hgCicBMRZUPZ0hFLcAN1GogHJGg8wIEIYGROdVkcBJQAAfl88g2vPM2YAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABDCAYAAAAh8FnvAAARKklEQVR4Xu2dfah9WVnHn9BAKTNfSsR0ZrQUc6IiTcyXBh3TyHcTA6UJ/aMQ8Y9kDFLsiohYKqWioMbPESxfShEdFemPnUGExViRo/gC19AkRcMwYYxe9mfWfn77Oevufe753d/93Xu9fj6wuGettfc6a5979jrf9TzPWjtCRERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERETkPPG1Me2P6Stj+r8xvX+jtnGvMX1rTF/qK3bkeWP6wpheP/29a6nj9XfH9IYxvXFM7+7q4YVj+viYXjSmr47p5zarRURERM4vHxjTfUr+96KJtr0pf/cxPXVM95jKjyLYfmdM7y152nldyf/vmO5c8h8b0/+UPGLxP0oeaOMHujIRERGRcwnWKgTT9VP+bmP6+1gWZkcRbCkA71nK7lReIxapr9RzEGUXxvRXG0dE/FfMfRYRERE51/zxmD4cswvyuAXbEO08RNoPT6nyC3FQsD1nKvvZaMcPY7qpHhBNaP5uV1a5w5ieP6ZnjemxY3rwZvXtZa8Y02O6cvihMf1hNBct1j0RERGRMwWxYogl3Jg9RxFs/x3tvGHKI4aqO/PJU76SZfy9d7T37AXbUlnyoTHdUvJY42gLnhnN3YqrFx4+ps9Nr+nTS2K25iEy6Ucv9kREREROjR+MJlB692NyFMHGOeneTP4iWpwaXAnBRh2iLF2viLKM06PdL0+vE8oQkvSJ19Vlm0JPRERE5EyAdel9cXCFZnI5gu2OpQyh9Z/T6ysh2P485vf9k5iteWkxY5Xqr5dEGa7Pb0yvRURERM4kvxjzylBgVWjPUQQbsWa9CEJoZdlSDNtvT2U1hu1d9YBo4uqwGLZXxSzciNWjLV4P82Eb4Drt+yIiIiJyJvinMf1WVzZ0eVgTbLgTf6UvnNiLdh7HJIivT0+vsbz1IuntU1laxn4j2kKICvV1O5LKrWN6VMkPMfebFbG3zVW384Ax/UjMljkWXiT0YWlhgoiIiMiJgfsT8fS2Mb11Sn8ay+7GNcFGkD91j+grRq6NtofaNaUM8fXiku/3YRvi8vZho49vKvmbYxZ8bL7LucTrJa+M1tajo4m5Z5e6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>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,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>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAYCAYAAAAYl8YPAAAAX0lEQVR4XmNgGAWjgKpAAV2AEuABxPzoguQCkEFB6IKUgItALI8uSC7gBuLFQCyDLjENiGeRgRcA8S8g7mOgEOB0GTkA5LLt6ILkgisMVIoAFyAWRBckF7SiC4yC4QYA/C8RC4AA67MAAAAASUVORK5CYII=>

[image10]: <data:image/png;base64,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>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAA6UlEQVR4Xu2SwQqBQRDHRyhKSYq4ochNucpJysUD8CAeQA68gLO7q5MbR2cewMXJ1UXhPzufWoNt48ivfrW7s/PtNPMR/fmKLbzqQ1/O8KAPfYiQvDrSAR+y8ALbOuAiBnNwDNewBDMwbF9ywSXP6cOSGyTNKuoAiMMenMCKihkGJM1K6ABYwiGswZ2KGbjkd/PdwFSw7pM09gEu+WjtVzAJq3BmndfpRV/4Ve40k4bdYM2XdbK9N0xJZnwiGdmdDnkkh2CenhumL+u9E/7YguRHYlqB3uxhgaQ6Hhk30htOKsMmjKrYz3EDgcQknMFkbKoAAAAASUVORK5CYII=>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAZCAYAAAC/zUevAAABVUlEQVR4Xu2UPUsDQRCGR7RQDIgEIoqFH5VVCkknmEK0E1sbC/vUgo0iWIiVhQhin0ZIlT9gmvyBdDaCYpU2jaB5X3YvDEP2DuTYELgHHu52Z2HmdnZPpKBgCujBPzsZmx/4bSdjMiduF25tICYr8Bce2kAM5uEqvIMduA0rcFYvigFb8SoTbsWeuEO5ZQM5w93dsJMJF+IOZckGcmIBPsAvuGtiI9iKPP4PVTvhYRF1eCUpRbAVfTV+g0vito+t4nMGnsAdtc4STODhjgfXcBd4M0gZHvv3BryB1/ARnsF3cQWNI5jAk1rEk7h/xEDcVU04het+jol5ndtw0cdZMK934pEZU01qEUywJuMP5oGXbMJPFbuHz8qWGVNNahEh7Jc3YReew/1kkSIrwb+KYCv0l3/AS/gi7uBashKwiJqdzIK3YlmN2TaegxBZRUTBHsSC6WMIPBQx+CVO7uwAAAAASUVORK5CYII=>

[image13]: <data:image/png;base64,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>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAYCAYAAAAYl8YPAAAAm0lEQVR4Xu2SMQrCMBhGsziIQhEcC+YgHT2Bs9fp2lUoDoKHcPESQk/j1O9HAvror80o5MFbXv6UhDSEQiGLyAAig8dWNoxgLyvGKY5yzQjsQwdGspMPRgebs/lJojzJBbrHSl5lzYVOPuVF9hnavO2z/R9EeZZLdA/3ZIl7eF11DnayG+M7OQ8whC8PkJj7n20YPVoG8Gu98PeMdYgXxmQSDvoAAAAASUVORK5CYII=>