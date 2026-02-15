# **The Oblio Business Operating System: A Unified Field Theory of Commercial Architecture, Activity Dynamics, and Economic Physics**

## **Abstract**

This comprehensive technical report provides an exhaustive architectural specification of the **Oblio** system, a "Business Operating System" designed to formalize commercial operations into a rigorous, physics-based computational model. Unlike traditional Customer Relationship Management (CRM) or Enterprise Resource Planning (ERP) tools, which function primarily as passive data repositories, Oblio operates as a discrete-time, absorbing Markov process. The system postulates that business outcomes are not random, but the result of deterministic "Activities" occurring within a finite, rational metric space.

The central focus of this analysis is the **Activity Engine**—the kinetic core of the system. We will explore how "Activities" function as the fundamental operators that "activate" changes in state, encompassing their taxonomy, the thermodynamic principles of "Activation Energy" applied to lead scoring, and the strict user experience (UX) constraints designed to capture high-fidelity temporal data. Furthermore, we will detail the "Stochastic Attribution" models, the generative ontologies for asset creation, and the recursive logic gates that govern the transition of opportunities through the pipeline. This document is intended for system-design architects and assumes a familiarity with database theory, stochastic processes, and information theory.

## ---

**Part I: The Metaphysics of Commercial Space**

### **1.1 The Theoretical Foundation: Solipsistic Space and Economic Physics**

To understand the mechanics of "Activities" within Oblio, one must first accept the system's underlying ontological premise: the commercial enterprise exists within a "Solipsistic Space" governed by conservation laws analogous to thermodynamics.1 The documentation explicitly links the flow of capital and attention to the laws of physics, specifically referencing the equivalence of Cost, Value, Time, and Energy.

#### **1.1.1 The Conservation of Energy (![][image1])**

The Oblio formalism posits that the total energy of the commercial system is conserved. In this model, "Money" (![][image2]) is defined not merely as currency, but as "Active Claims" or **Kinetic Energy**. Conversely, "Product Value" is treated as **Potential Energy** stored within the contract structures and feature sets. The goal of the Oblio system is to facilitate the transformation of Potential Energy (Product) into Kinetic Energy (Revenue) through the application of Work.

This "Work" is quantized into discrete units called **Activities**. Therefore, the efficiency of a business is not measured by qualitative sentiment but by the thermodynamic efficiency of converting Activity Duration (Time/Work) into Revenue (Energy).1

#### **1.1.2 The Causal Bottleneck and Information Theory**

The system architecture identifies "Attention" as the scarcest resource in the commercial ecosystem. This is mathematically modeled using the "Information Bottleneck" method. The documentation describes a "Causal Bottleneck" which serves as an optimization filter. In a noisy market, only specific signals (Activities) can penetrate the noise to "activate" a prospect's interest.

This theoretical stance dictates the system's data model. Every object in Oblio—whether a Contact, an Asset, or an Opportunity—is designed to strip away entropy (noise) and preserve only the signal required to traverse this bottleneck. This is why the system enforces "Finite Logical Boundaries" between stages (MQL, SQL, FTP), rather than allowing a continuous, undefined flow. The transitions between these states require specific "Activation Energy," supplied by Engagement Activities.1

#### **1.1.3 Rational Trigonometry and Attribution "Spread"**

A unique feature of the Oblio mathematical model is its rejection of standard Euclidean distance in favor of Norman Wildberger’s **Rational Trigonometry**. In traditional attribution models, the "distance" between a marketing touchpoint and a sale is often calculated using "fuzzy" probabilistic logic (e.g., "70% likelihood"). Oblio replaces these irrational numbers with **Quadrance** (squared distance) and **Spread** (squared sine of the angle).

* **Quadrance (![][image3]):** Represents the separation between the Customer's current state (![][image4]) and the Purchase state (![][image5]).  
* **Spread (![][image6]):** Represents the divergence from the optimal path.

By using rational numbers (integers and fractions) rather than approximating irrationals, the system ensures that "Attribution" is computationally exact. An Activity effectively reduces the Quadrance between the prospect and the sale. This allows for precise forecasting where the "Spread" ![][image7] serves as an efficiency coefficient in the Revenue Forecast Integral.1

### **1.2 The "Business Operating System" Paradigm**

Oblio is distinct from a CRM in that it claims to be a **Business Operating System (BOS)**. A CRM manages *relationships*; a BOS manages the *physics* of the operation.

The BOS framework operates on three levels of abstraction 2:

1. **Intermediary Framework:** It acts as the middleware linking disparate services (Ad Networks, CRMs, Social Media) and human agents.  
2. **Data Integration Layer:** It standardizes unstructured data from these sources into a strict ontology.  
3. **Constraint Engine:** It forces End Users to operate within "Standardized Constraints." Users cannot simply "work"; they must perform specific *types* of work (Activities) on specific *objects* (Opportunities) within specific *time bounds* (Durations).

This "Stupify" philosophy—Select, Setup, Stupify—aims to automate the complexity of business management, reducing the cognitive load on the End User to a simple binary state: "Do the Activity" or "Don't".3

## ---

**Part II: The Activity Engine**

### **2.1 The Definition of an "Activity"**

An **Activity** in Oblio is the atomic unit of system state change. It is formally defined as a recorded event that creates, updates, or engages with an object within the system.4 It is the "event log" of the BOS.

Crucially, an Activity is not a passive record; it is an **Active Operator**. In the context of the user query regarding "activates," we can distinguish three modes of activation inherent in the Activity object:

1. **State Activation:** The Activity triggers a transition in the Opportunity status (e.g., from Open to Won).  
2. **Energy Activation:** The Activity injects "Activation Energy" (![][image8]) into a Lead's Health Score, counteracting entropic decay.  
3. **Workflow Activation:** The completion (or failure) of an Activity activates the next Step or Stage in a sequential Workflow.1

### **2.2 Taxonomy of Activity Types**

The system categorizes all kinetic operations into four strict functional archetypes. While the UI may present softer terminology (Research, Creative), the backend logic enforces rigid behaviors for each.6

#### **2.2.1 Data Activities (UI: "Research")**

* **Definition:** Operations involving the creation, update, or enrichment of Contact and Account objects.  
* **The "Activation" Mechanism:** A Data Activity is "Activated" or "Converted" when a specific property state changes from NULL to NOT NULL.  
  * *Example:* A "Find Email" activity is active until the email field is populated.  
  * *System Logic:* The system automatically generates these activities based on "Forecasting Goals." If the algorithm predicts a shortfall in MQLs, it calculates the number of fresh Contacts required and generates a batch of Data Activities assigned to Junior End Users.4  
* **Context:** Requires a target Object (Contact/Account) but not necessarily an Asset.

#### **2.2.2 Asset Activities (UI: "Creative")**

* **Definition:** Operations involving the creation, versioning, and publishing of Asset objects (media, ads, content).  
* **The "Activation" Mechanism:** These activities activate the *means* of communication. They manage the transition of an Asset from "Draft" to "Active Version."  
* **Generative Fallback:** Oblio uses a Context-Free Grammar (Algo 3\) to auto-generate Assets. However, when the system encounters a "null property" (e.g., it cannot generate a specific headline), it generates an Asset Activity assigned to a Creative End User to "fill the gap".8  
* **Properties:** Tracks Source, Medium, and Channel as placement variables.

#### **2.2.3 Engagement Activities (UI: "Engagement")**

* **Definition:** The kinetic transfer of an Asset to a Contact. This includes both the *outbound* vector (User sends email) and the *inbound* vector (Contact clicks link).  
* **The "Activation" Mechanism:** This is the primary source of **Activation Energy (![][image8])** in the lead scoring model.  
  * *Outbound Activation:* The User "activates" the Asset by placing it in a Channel (e.g., sending an email).  
  * *Inbound Activation:* The Contact "activates" the Qualifier by engaging (e.g., clicking).  
* **Workflow dependency:** Engagement Activities are almost exclusively the children of **Workflow Steps**. A Step defines: "Use Asset X with Contact Y via Engagement Z".5

#### **2.2.4 Admin Activities (UI: "Approval")**

* **Definition:** Governance operations. Approving changes to Data, Assets, or high-value Engagements.  
* **The "Activation" Mechanism:** These activities "activate" the changes made by other users, committing them to the permanent ledger. Until an Admin Activity is completed, the changes may remain in a "Pending" or "Draft" state.  
* **Assignment:** Strictly routed to users with Role \= Senior or Role \= Admin.6

### **2.3 The Physics of Time: Duration and Capacity**

A distinct architectural feature of Oblio is its rigorous tracking of time, which it equates to "Cost."

#### **2.3.1 The Three Durations**

Every Activity object tracks three specific temporal metrics 8:

1. **Default Duration (![][image9]):** The theoretical time a task *should* take (e.g., 5 minutes). Used for initial capacity planning.  
2. **Baseline Duration (![][image10]):** The statistical average of historical performance.  
3. **Actual Duration (![][image11]):** The precise scalar value measuring the human labor expended.

#### **2.3.2 The CRUD Window Mechanics**

To capture ![][image11] with high fidelity, Oblio enforces a specific UX pattern. Completing Activities happens in the **Sidebar**.6

* **The Rule:** End Users are expected to keep the Sidebar open while completing the Activity.  
* **The Measurement:** The system measures the delta between Sidebar.Open() and Sidebar.Submit().  
* **The Implication:** This converts "Labor" into a measurable data stream. The "Cost" of a specific Opportunity is calculated by summing the ![][image11] of all related Activities and multiplying by the End User's hourly rate. This provides a "Physics-based" CAC (Customer Acquisition Cost) rather than an estimated one.

#### **2.3.3 Finite Capacity Constraints (Algo 1\)**

The system uses these durations to enforce **Finite Capacity**. A human agent is modeled as a processor with a fixed throughput limit. The **Activity Capacity (![][image12])** is calculated as:

![][image13]  
Where ![][image14] is the total scheduled workable time and ![][image15] is the average activity duration. This prevents the system from assigning more "Activation" tasks than the workforce can physically execute, avoiding the "Backpressure" phenomenon common in unconstrained CRM workflows.1

### **2.4 Qualifiers: The Logic of Activation**

If Activities are the engine, **Qualifiers** are the transmission. They determine if the energy expended by an Activity successfully translates into forward motion.6

* **Definition:** Qualifiers are Boolean conditions related to an Activity or Opportunity.  
* **The "Activation" Logic:**  
  * An Activity is "Won" only if its related Qualifiers are TRUE.  
  * Example: For an SQL Opportunity, the Qualifier might be Budget\_Confirmed \== TRUE and Decision\_Maker\_Identified \== TRUE.  
* **UX Implementation:** Qualifiers are highlighted in the Sidebar. The End User cannot "Close" an Activity successfully without checking off these Qualifiers.  
* **Automated Transition:** "Winning" the Qualifiers of a Primary Product automatically **activates** the creation of the next Opportunity Type.  
  * *Chain Reaction:* Activity Won ![][image16] Qualifier True ![][image16] Opportunity Won ![][image16] Next Opportunity Created.6

## ---

**Part III: The Ontological Core (Object Models)**

The Activity Engine operates upon a rigid ontology. This section details the data structures that Activities manipulate.

### **3.1 The Product Tensor**

The Product is the seed of the Oblio universe. It is not a flat record but a tensor bundle containing the rules for all downstream logic.1

* **Core Properties:**  
  * Pricing Logic: Value, Contract Duration, Billing Frequency.  
  * Type: B2B, B2C, Reseller, Partnership, Investment.  
* **The Feature-Solution Mapping (![][image17]):**  
  * **Features (Nouns):** Physical aspects of the product (e.g., "4WD," "API Access").  
  * **Solutions (Verbs):** Functional benefits (e.g., "Off-road capability," "Automation").  
  * **Relation:** A many-to-many map where ![][image18]. A single Feature can map to multiple Solutions, and vice versa.  
* **Personas:** Defines the Audience.  
  * Decision Maker (DM)  
  * End User (EU)  
  * Influencer (IN)

### **3.2 The Use Case Vector Space**

The intersection of the "How" (Solution) and the "Who" (Persona) creates the **Use Case**.9

![][image19]  
Where ![][image6] is the Solution and ![][image20] is the Persona dimension.

* **Significance:** Use Cases are the primary pivot point for **Asset Generation**. An Asset is targeted not at a "Product" generally, but at a specific Use Case (e.g., "Automation *for* CFOs").

### **3.3 The Customer Object Graph**

The recipients of Activities are modeled as specific vectors in the market space.

* **Contacts:** Individuals identified by a unique Email. They store Demographic and Firmographic data.  
* **Accounts:** Organizations identified by a unique URL.  
  * *Relation:* Contacts are linked to Accounts via Work History (with start/end dates).  
  * *Logic:* B2B Opportunities strictly require an Account; B2C do not.6  
* **End User Accounts (EUA):** The representation of the client company using Oblio.  
  * *Structure:* Groups End Users, stores Billing Data, and aggregates Usage Analytics.  
  * *Identifier:* Unique URL (e.g., the client's domain).5

### **3.4 Opportunity Types: The "Finite Logical Boundaries"**

Opportunities are not continuous; they are discrete states. The system defines a fixed sequence 4:

1. **MQL (Marketing Qualified Lead):** Persona Match \+ Contact Info.  
2. **SQL (Sales Qualified Lead):** Engagement \+ Intent confirmed.  
3. **FTP (First Time Purchase):** Transaction ![][image21]. The "Fixed Point" of value realization.  
4. **RTP (Retention Purchase):** Transaction ![][image22]. The recursive state.

## ---

**Part IV: The Stochastic Model and Attribution**

Oblio's "Physics" is mathematically formalized as an **Absorbing Markov Chain**. This model allows for the precise calculation of attribution, forecasting, and the "entropy" of customer relationships.

### **4.1 The Markov State Space**

The customer journey is modeled as a stochastic process ![][image23] over a finite state space ![][image24] 1:

![][image25]

#### **4.1.1 The Transition Matrix (![][image26])**

The dynamics are governed by the matrix ![][image26], where ![][image27] is the probability of transitioning from state ![][image28] to ![][image29].

* **Sparsity:** The matrix is upper-triangular for the acquisition phase (you can't skip from Suspect to FTP without passing the logical boundaries of MQL/SQL).  
* **Recursive Loop:** The entry ![][image30] (RTP to RTP) represents the **Retention Loop**. This is a critical component of the model, where the "RTP" state is essentially a nested Markov chain containing the entire acquisition logic within itself for every renewal cycle.  
* **Absorbing Barriers:** ![][image31] and ![][image32] are absorbing states (![][image33]). Once a lead enters these states (entropy maximized), they exit the active calculation.

### **4.2 The Fundamental Matrix & "Expected Effort"**

Oblio calculates the **Cost of Acquisition (CAC)** using the Fundamental Matrix ![][image34] for absorbing chains.

![][image35]

* **Interpretation:** ![][image36] represents the expected number of steps (Activities) required to reach absorption. By multiplying this by the cost vector ![][image37] (the monetary cost of the time duration ![][image11] for each step), the system derives a physics-based cost model.  
* **Application:** This allows the architect to simulate scenarios: "If we reduce the duration of the 'Demo' Activity by 5 minutes, how does that impact the global CAC?"

### **4.3 The Entropy of Lead Scoring (Algo 2\)**

In most CRMs, lead scores are static integers. In Oblio, Lead Health ![][image38] is a dynamic, decaying energetic state.1

![][image39]

* **Entropic Decay (![][image40]):** A lead's "Health" (interest) naturally decays over time. This models the "forgetting curve."  
* **Activation Energy (![][image8]):** Engagement Activities (calls, emails, ad impressions) act as "kicks" (![][image41]) that inject energy back into the system, raising ![][image38].  
* **Thresholding:** If ![][image38] falls below a critical threshold ![][image42], the system automatically transitions the Opportunity to ![][image31]. This automates the "cleaning" of the pipeline, ensuring only "active" matter remains in the Causal Bottleneck.

### **4.4 The "Value Gradient" and Duration**

The model also links **Time** to **Value** via the gradient ![][image43].

![][image44]

* **Theory:** The duration of a sales cycle (![][image45]) is inversely proportional to the "Value Gradient."  
* **Implication:** If the perceived difference between the Customer's Pain and the Product's Value is high (steep gradient), the deal closes quickly. If the gradient is shallow (low differentiation), time ![][image46]. This provides a mathematical explanation for "stalled" deals—they lack sufficient Value Potential to overcome the friction of the process.

## ---

**Part V: Automation and Generative Logic**

Oblio is designed to be "Generative." It does not rely on users to manually create every Campaign or Asset. Instead, it uses logic gates and context-free grammars to generate the system configuration.

### **5.1 The "Is Equal" Recursive Logic**

The "Logic & Functions" documentation 9 details a recursive matching algorithm used to manage object relations without duplication.

#### **5.1.1 Campaign Generation Logic**

When a Product is created or updated, the system evaluates:

1. **Query:** SELECT Campaign WHERE Product\_Type \== P.Type AND Use\_Case \== P.Use\_Case  
2. **Condition:**  
   * If Result\!= NULL: Relate the Product and its Assets to the existing Campaign.  
   * If Result \== NULL: **Activate** the "Create Campaign" function.  
     * Generate Campaign Name based on Product\_Type \+ Use\_Case \+ Persona.  
     * Set defaults based on constraints.

#### **5.1.2 Account Resolution Logic**

When a Contact is created with Work History data:

1. **Query:** SELECT Account WHERE URL \== WorkHistory.URL OR Name \== WorkHistory.Name  
2. **Condition:**  
   * If Result\!= NULL: Link Contact to existing Account.  
   * If Result \== NULL: **Activate** the "Create Account" function.  
   * *Self-Correction:* If the URL is missing, generate a "Research Activity" for an End User to find it.

### **5.2 Algorithmic Asset Generation (Algo 3\)**

The system employs a combinatorial grammar to generate marketing Assets.1

![][image47]

* **Mechanism:** By iterating through the set of Features (![][image48]) and Solutions (![][image49]) defined in the Product, the system generates all valid permutations of headlines and ad copy.  
* **Activation of Human Creativity:** If the generator produces an Asset with NULL properties (e.g., the grammar fails to find a suitable Adjective), it **activates** an Asset Activity assigned to a Creative User to manually complete the Asset. This ensures that the automation is "Human-in-the-loop."

### **5.3 Workflows: The Orchestration of Activity**

Workflows serve as the "operating instructions" for the Activity Engine. They are strictly hierarchical.5

| Level | Definition | Activation Logic |
| :---- | :---- | :---- |
| **Pipeline** | Grouping by Product Type | Active for all Opportunities of type ![][image50]. |
| **Stage** | Grouping of Sequences | **Goal:** Trigger specific Qualifiers. **Activates:** Next Stage upon success. |
| **Sequence** | Grouping of Steps | Container for specific Asset Groups or Audiences. |
| **Step** | Atomic Action Unit | **Activates:** An Engagement Activity. **Timeout:** If no response, activates Next Step. |

**The Step Logic:** A Step is defined as a tuple: ![][image51].

* When a Step is activated, it assigns the Activity to the User.  
* If the User completes the Activity (Activates the Asset), the system waits for the Contact's response (Inbound Activation).  
* If the timeout threshold is reached without response, the system effectively "skips" to the next Step, maintaining momentum.

## ---

**Part VI: User Experience Architecture**

The Oblio UX is not designed for "delight" in the traditional consumer sense, but for **Data Integrity**. It acts as the input terminal for the physics engine.

### **6.1 The Sidebar Paradigm**

The central UX constraint is the **Sidebar**.6

* **Function:** All CRUD (Create, Read, Update, Delete) operations occur in a sidebar that expands from the right, compressing the main dashboard.  
* **Constraint:** The user is *architecturally constrained* to keep the sidebar open while working.  
* **Purpose:** This is the only way to accurately capture Actual Duration (![][image11]). If the user closes the sidebar, the timer stops. This enforces the link between "Time" and "Record."

### **6.2 Widget Hierarchy**

The system uses a strict hierarchy of widgets to display data.7

* **Dashboard Cards:** Show high-level performance metrics and filtered lists of assigned Activities.  
* **Record Tile Widget:** A persistent summary of the active Object, visible across all tabs.  
* **Tab Controller:**  
  * **Overview:** Expansion cards for related objects.  
  * **Details:** Grouped cards for properties.  
  * **Activity Tab:** A table view of the event log (Activities).  
  * **Version Tab:** A table view of property changes (Audit Trail).

### **6.3 The "Stupify" Philosophy**

The documentation outlines a three-step UX philosophy 3:

1. **SELECT:** Pick a Template (e.g., "B2B SaaS Sales").  
2. **SETUP:** Configure the specific constraints (Pricing, Personas).  
3. **STUPIFY:** "Let Oblio automate everything."  
   This philosophy aims to abstract the complexity of the Markov models and Entropy calculations away from the End User, presenting them only with simple, binary choices in the Sidebar: "Call this person," "Click this button," "Confirm this Qualifier."

## ---

**Part VII: System Recommendations & Implementation Strategy**

### **7.1 Architecture Recommendations**

For a Systems Architect implementing Oblio, the following structural decisions are paramount:

1. **Database Design:** Must support the "Tensor" nature of Products. A standard relational model is likely insufficient for the Feature/Solution/Persona many-to-many mappings. A Graph Database (e.g., Neo4j) or a highly structured NoSQL document store (e.g., MongoDB with strict validation) is recommended to handle the Object Graph.  
2. **Event Bus:** The Activity Engine requires a robust Event Bus (e.g., Kafka) to handle the "Activation" triggers. The transition from "Qualifier True" to "Opportunity Won" to "Next Opportunity Created" must be handled asynchronously and reliably.  
3. **Time Series Precision:** The Duration tracking requires high-precision timestamps. The backend must be able to handle "Pause/Resume" states in the Activity Timer to account for user interruptions.

### **7.2 Scalability Considerations**

* **Computation of ![][image36]:** Calculating the Fundamental Matrix ![][image36] for the Markov Chain can be computationally expensive if performed in real-time for every lead. It is recommended to pre-compute ![][image36] based on aggregated cohorts and update it periodically (e.g., nightly).  
* **Entropy Daemons:** The Lead Scoring model (![][image52]) implies a continuous decay. Implementing this requires a "Decay Daemon" that periodically updates the Health Score of all active Opportunities. To avoid database thrashing, this should be event-driven or batched.

### **7.3 Conclusion**

The Oblio Business Operating System represents a sophisticated attempt to apply the laws of physics and information theory to the chaotic world of commerce. By rigorously defining **Activities** as the fundamental unit of work and **Qualifiers** as the unit of progress, it creates a closed-loop system where economic outcomes can be simulated, optimized, and forecasted with mathematical precision. The system does not merely *record* business; it *activates* it.

---

**Citations:** .1

#### **Works cited**

1. Formalizing Oblio's Marketing Model, [https://drive.google.com/open?id=1ZZO92TtnzFHhTrTPIxVHTWSJIcK9wEXtTpYjWu0yiU8](https://drive.google.com/open?id=1ZZO92TtnzFHhTrTPIxVHTWSJIcK9wEXtTpYjWu0yiU8)  
2. Oblio Documentation \- 2.) Application Overview, [https://drive.google.com/open?id=1v4u-JA\_T0mJRkbptfgYW3lzJQasBluDcFyIIyarE0p4](https://drive.google.com/open?id=1v4u-JA_T0mJRkbptfgYW3lzJQasBluDcFyIIyarE0p4)  
3. Oblio Documentation X.) Web Content, [https://drive.google.com/open?id=1bMzDhI\_oTJ3zA5jcMa9n22q-MeGBWj3MnEjigQ3gl2Y](https://drive.google.com/open?id=1bMzDhI_oTJ3zA5jcMa9n22q-MeGBWj3MnEjigQ3gl2Y)  
4. Oblio Documentation \- 6.) Primary Fields, [https://drive.google.com/open?id=1ievh0LBYtcYRcv2qvioJFtG6qGP3Kouh-cZVrdBx3UU](https://drive.google.com/open?id=1ievh0LBYtcYRcv2qvioJFtG6qGP3Kouh-cZVrdBx3UU)  
5. Oblio Documentation \- 5.) Objects, [https://drive.google.com/open?id=1S\_aGZPjBtEIzQ8yQvkgxSDtQPbO-vagv4vBpW7ZSQ8k](https://drive.google.com/open?id=1S_aGZPjBtEIzQ8yQvkgxSDtQPbO-vagv4vBpW7ZSQ8k)  
6. Oblio Documentation \- 2.) UI & UX, [https://drive.google.com/open?id=15c4tM6c\_a\_wSTSQIDNCOlqEu8rt0voi1BgDnw3OpOfE](https://drive.google.com/open?id=15c4tM6c_a_wSTSQIDNCOlqEu8rt0voi1BgDnw3OpOfE)  
7. Oblio Documentation \- 5.) UI & UX, [https://drive.google.com/open?id=15LZyOoefh7L0Clf3FnfkaKX2E3zNAKtVO8tt3QjjXqQ](https://drive.google.com/open?id=15LZyOoefh7L0Clf3FnfkaKX2E3zNAKtVO8tt3QjjXqQ)  
8. OBLIO Chat Dump, [https://drive.google.com/open?id=1VJz3pp2uAwyja9ZXEaYCZkAql2p5KkqkquugCQb2PXs](https://drive.google.com/open?id=1VJz3pp2uAwyja9ZXEaYCZkAql2p5KkqkquugCQb2PXs)  
9. Oblio Documentation \- 7.) Logic & Functions, [https://drive.google.com/open?id=1YLPMYmwSig7w5475hYC9rGlo6LPYg3OjQ-vNmusvyMk](https://drive.google.com/open?id=1YLPMYmwSig7w5475hYC9rGlo6LPYg3OjQ-vNmusvyMk)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAZCAYAAACclhZ6AAABPUlEQVR4Xu2VoU4DQRCGhwRBQgUNqsHhqpvUYRoshuB4AJI+Aq6iprK6pk9QhUOQYJAYHCRQgUOCIGlg/uy22fy5m+uK3p7YL/nMzCbd/246J5LJ1MaResDFAPSOudhU3tS/AtdMC3o3QT8FQ3WfiyG45A8XAz7VUy7WxLm438cdV+qD2goPhLTFHXzhRsC9esjFmjhRr8QFmEtFmEtxYa654cEbwdNpApVh8L/4Vnvc8CBIqhFjzDBd9UudccODbXbHRQNsvk6kMZhhthmxDy4aLNRlpDGYYR7FhcESKOJW4t7MrjHDYMQQZo8bHgQZczEhZhj+SDIYsaZsMmCGwRYrC9NXz7hYQdIF8CTFYbDlXqV8/FJhhgEDcYHe1Wf119eaEgTfv/UEsRfBuQ24/EQdSfnHM5PJZDKZbfkHMhRVer5d9eMAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAABT0lEQVR4Xu2TLUsFQRSGX8EgGEQQRBREmxgMgmAVg2C0WMwGTTf4B/wDBpMfmMRiNWmyWiwWQbiKKCJi0iJ+vC9nF2fO7LiXG+U+8LDsnJl3Zs/uAh3aYJeu+MEa1uiIH/T00W966At/0EUf6LgveOZh4Y++kGGGvtI9X6hiFRb+5QsZrmHzG77g6acX9B62oDsuR6h9Z/QWNncqLqdMwCafwBYMxOWIHdic/eI6GJdTjugBrO9qi1pUxRLs1Dr9FSy8lhu6TIdpkx4jbc0ifaOjxf0LWgy/o2O0B9aaJmyjEH0Zeokl72ghXKELwf0sbNE27DvWSRWqloRozocbS1hH/ALLn0lfjjZW8CdsoxDNUZuy6MRPfhD212mx3EAaLLLhk8X1HPb4nk38hlcFi8rw6aIgt5BfXEeZ8UznysGhoKD+tsspvaS9vtDhn/ADq+BNEetKhAIAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAaCAYAAABozQZiAAABFklEQVR4XmNgGAUw4ATE14H4PxAnA3EIEL+C8oWQ1GEAkCRI0UYglkES5wPipUC8B4j5kcTh4BYDRCMrugQSAMm/RxcEmQaSOIQugQZAakAYDoyB+CsQ7wBiTmQJLACkDkXzFKhABLIgDvCPAU3zE6iANLIgDoDhbAwBHECEAaLuLbIgsZo9GCDqliMLEqMZFqjTgZgFWQJdMyjanIFYAUlsFwNEDUYCyYBKGAKxNhCrQsXFGSAGNDBAkqsmVBwFgFLULCC+AsQlSOKMDJDAARmMN02DDPjFAFG4iAFi2HkoNkdSRygRwQEPA8S5IOczA3E+A1pg4QMgzSCXfIHiv6jShAEsJlYzYAlpQkCfAVIYgJw94gEAJflAoNHSa3UAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAYCAYAAAD3Va0xAAABJElEQVR4Xu2UMWvCQBiGP5GCgtitIChCKUKX7t1dddBF6CjorB0El9Khc6Fjtw7+hG4OoVOHDm6Kk52cxFlB7ftyF3NeEol21AcezntzfvddTBQ5OWKwAB34ATM6f4JX+nMk+nAD6/AZLmFNVOGUtyycS/gFbwLyb1ix8lAcUZ0E0ZGI3ZBfCS/0Zgf7YPssREfwFsZ3VkSkClfiFaOcJ81Fh8BOuuIVW8D7nRUHkoY9UcXa1rVA2MHADjV8GFnowciKop4tH2U4sUPNNZyJ2syFx54a8y2OqF35apjk4ViPJAdf4Rr+wIZY3+GOvNiCF0Y+hHNj7sJj8Xg+7vTIV6EE3+Gj+DskCfipx3+RhS92eAxNUT8Au3fv3dHwP8m8l2ci8AdbFzM1p+0TvgAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAB9ElEQVR4Xu2WMSxlQRSGzyYkK1grESIkRESWCIUSnUZBYYsVdIpV22ITjZCo0IhKIwqFRCtRKB6V0IiS3QSRqDYqBWL5f2fuvfOOQYK8J/G+5Mt7c+7ceeeemTvzRHJ8UD7BBpiCS7DSxcdhufueVTbgLRyGE/AK9osmXJR0yzwlcAvWB+LbsM/EM86IaOVCTMFGG8w0x/J4gnM2kA2iBEOV+moD2eA7vBFNMpLtAr9TNuH28kPSE6QLMN/r9274ApdFkxz14oWSbEUhT55wH5bBTa//qehMMdYkAViddht0cD1ykN/2AriAq167Gu7AaVghyYM0u+sD8NB9JxyXu0PEGjz32jFMYs8GHTxFONCgvSAPK0u4sUdrtg6eSbK5cyzOSATv7/baLAJjD+AWwoFCDMF50fXpUwr/ilaKTMI8OBv30Or4P8jjky8iqRKtLqscwcPg0mvHpEQHsknUwAP3aWkVnV4m9Q2up1++hwk89uBdkj69/O3/8JcXi/kjuk545nKxrsAj0WOvNu6VwMEWYYdrz8CfyeUYu8YiPouut07RaadP7rMt7pNnbo/otsInsRWN4PTuik4T4fS2JZdjmGCvDYredwSLTfzN4AsTXMwefEFSEv73MybP3/8qOL3XNmhg5ULTS7he/9lgjhw5XsAd7VxryJ/qDdIAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAaCAYAAABl03YlAAAAmUlEQVR4XmNgGAXkAmEgdgNiKSBmRJMDg/lA/AeI9wHxTyCejirNwMAKxLeAWAXKTwPi3whpCCgC4jVAzAnlbwPiGQhpCEgH4v9A/AuIdzAgFGOAqUD8kgGiGIQbkCX1gdgZiS/GAFG0EEkMLPAaWYAB4jtLZIFnQGwFZYPCxh2Iy6BsOOgE4n9A/AiI3wHxNyBmRlYwCggDADQQG8cgxFMzAAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAZCAYAAAC7OJeSAAABp0lEQVR4Xu2WzStFQRjGX6GIko/IQmInxUIW9igLO8XCn2DFjpU/g5QsbGQrGwuxkTVZuAukFNkoinw9jznnnpm3Ofd83LtA91e/xX3emdc5c2fmEqnyjzmA6zpMCedxfkWoh6ewXRdS0gKPxPQpi054Bht1ISOcfwl7dCELc/BThzn5ggs6zMIz3NVhTtjnVYeaBjgDB3VBzNss6zAni2L6eamBT3Ay+NwLN6KyNMEXOGplIdyUbBznQzS0yIiYlW7WBdInZunqxKzOnrgP0yHmYYetjPBU8LgOiXmhfnjtjPDDcXewSxfIuJi3+IBLsNst/3zmH9G5ZhMe69BDyX56qd/ccunJFhdwW4ceEvutwoJED2RfbImTA3j0uTmTiO3Hr8be2eFA7pMQbjRuOG68OFrhIxzQBQ+xGzjcKyFj4r8DOG5ahxacdy7uS8QxJe4CFFmB7/AG3sM12OaMMCRdeluS/lZlH/bzwiPKr8d71AJO4K0OLTi/VocxXMFDlWWikj+U7MN+ZTEPJ3SYEc6f1WFefs0/V4QX5I4OU7Iv/sNR5W/wDXYyWBrj/njlAAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAZCAYAAAC/zUevAAABpElEQVR4Xu2VvytGURjHH6EohYgU2ZQSCYNSUgaLH8WglMVgMaGsFv8Ai6RkVyyWNzPKppRFYTFhYqDw/facw+O4V6/3vdd0P/Xpved5zn3POfc891yRjIzfWYfveTrq7kmNV9GBoiiBT7AnTCSNX20cN7ApDCZJo+gEjkysAR6Y9iGsMO3EGRCdxJqJjcBj054z14lTBvfgG9yHW3BXdFIzpl+qcCuu4Au8dT7IPxWiZ0V01cNBfNtc14nWSGpwKziJZhMrhdOmvQArTfuvtMOzMGi5Fp1EXOVXy/cCLYR5eB8GLZwAizIO1stqECuHve43hAfbhGg9Mc+au4Q7sMr0+4Sr5yTuwoSjEz7CDhMbhOdwCZ64vKfNxabgBuyGm6Jj5ODYV1eRVpfIx353D+FKTkW3iLB4LyJyrJ9lF+eTYT3UunbR8A2yBxr/nI85KuepF/1IJgZf5y7TfoZ9cBIuys9zhU+BRenvGTe5guFR7gfilvKj1iL6CjI+5HIcfFZ0W/gUuBXs77exaGpEDy8OxMLmtYdtfmmZs/Cg49mTkRHLB8bwVzOnfjW4AAAAAElFTkSuQmCC>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAYCAYAAACfpi8JAAABpUlEQVR4Xu2VzysFURTHj1DEwk5CfqaUssBOSdlYkPzIgh3lPyCysbCyE3vWbG2sZmVB2Vl7JIrsUJIf3293Lucd45meGW/zPvXpzT1n3syde+6cESlSJB5z8D2mt+F/UuEeLqtxGdyHN7BVxQfhixonSiWcNbF+cTdcN/FueGZiidEJW0xsSVwZhkyc4yMTS5WMuIlUmPi/w7JwIgWFq8BJXNnED5TCahv8hWHYaIOWenETObCJCPbEncsLx6UXbsALm7Bwo77J940ahX/N464IWwFbQhPsMLksWBauBMvSYHJRcPUyNpgDPtyrDUbBE7kaKzahKIcncAZei2uGngFxfWYSbsISlZuC5/AuzLWp3Cd1sAseiqv5NhyDteJu7OGFF2FzOD6FgU+CBzgdHvN6VSpHAnGl/DN8Et3in+FoeMwNy4lcwjXY7k9SPMFxG8yHQLJbPMvCzkwW4IjKRfEIe2wwH7bkqxQTcFfc54GbnL/cN4Ql5ErxO+bxL0Ji3Vo3sBp1TLifuK/0JvX0SbyWkBqc3A6cFzfJgsGJHMNVmyiSiw9lk01pVDGD5AAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAZCAYAAABdEVzWAAAB10lEQVR4Xu2WyytFQRzHf/KIkDdJ8sjGAgvsPFJSFnaKUjYKZUcRC92Nf8BjLSsl7GRBuUUSGwskNlaUQikLyeP7vTPD3LldeXQOi/upT935zjmdX/ObOeeKxIjhD33w9Yte63t84QaOW+MEuAyvYLmVt8Ana+w5+zDHGhfBC7gGk628EJ5YY0+phGVONiaqba1OzvGuk3kGH8bW2bCNLMxuI2mEs07mK9xHLOzfwaJe3PCv4cZnYdz4LhXwSCJPqy9wz7GwCXdCw1MahGlO7jk8kWyjeyINXNEpN/SaaO8vGxZeDdtgvDNXB5ucjMTBUlFzieFToed0SPh7NAKuElfrszay6C3YA9dhhp5rhiNwCN7Bdp2TObgIJ+GKlU/DQ9gLd6w8RJJEfg+N/FTxBWxogI/W+EHUCgbhnpUfw1xrzHv6YZWWDMJu/ZuFrerfP4JFsFgDix8Wtcpm32XBeVHtMzyLunYD5sFUuAkv4SnshCnvV/+ABS0pgEui9sw9rNE5W1wPu0Q9jK3L13MHcACmw22dGdy99y0Coj5XXI1RWKLzW1irx2ewGM6IKv5cPlaD+4nvQhIQtbokW9Qq/woWlemGojLTPp4wu5X8VxLtHs7FiOE7b62hXtGi/j2BAAAAAElFTkSuQmCC>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAZCAYAAAAmNZ4aAAABg0lEQVR4Xu2VzysFURTHj/yIUn5GUsRCWUnWFkqWKHbKxsJeSuz9A1jYyd7WRhavFKIsJaXslLK0kML3053XHDdPzDxv83zqU3POfTN37rnn3TH7p1pYku8/9DG5pyw8yXUX18kD+SAHXX5Cvro4Nxeyw8W98l4eykaX75HXLs7FsByIcmsWyjoZ5YlPo1xmeBil9VBmJvZlhnG5E+XKCvvIxBWHSd/i5F9DYzExjVVR2HMm3ogHckADX8bJGDqaMscdnYdlC2dFSUr9f2Na5JSsiQcs5GblmKyX3fJG7slm97tPsEpW+12Zedi5XJBX8taNDckzOS+35ajctbB1R3I6/alZQzLwlZSH/SnCKp5dfCe3kmtWwwtRjSa5muSpAPvblsSZYBJ/Vr9YugqqtenGinRa+nKZKcjj5JrT7kS2yz65YqEiHlZLY40k8Ywb+xUcl4Xkek7uWzjnaUQm5esFTLhooeSsljL3W9iGzNRa2p2t7hp4Ab5gcbd3WbjvnyriA55lSqsanZV2AAAAAElFTkSuQmCC>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAZCAYAAAC/zUevAAABtklEQVR4Xu2WPyhFURzHf0IpSiF/SnlsShZKig0bg8mAMllMioFMktFGyWawYTERd6MYDEqJTZQyWpT4ft/vnJx3rpeLcxW9T3269/1+t3d+93f+vCdS4A8xClfhLlxw4pOw0/mcCu3wGL7CC7gOIzgFi+EdbLEPh6YRnhozuaks7AwLW/ITIbkSHaTSTxhY5C0c8hMhKIKLogXwbfNRITotvAanAz7BE8nfBWKLSAW2mF1IbbElgQXQcj/xm9giPqMKlvrBUCQt4lx+PmWHcMwPkqRFbMESP/hFnmGfHySRaBHVXtzCHbMvupVdeHq2wgEvbimDg6LfWwub4BFsdh+y9MMXOCvxgcim6NHtwy29DMdFj/JpJzcjOn0T8AyuwB1zz+/6aJxs8Fq0Iw+iP1ps3aXJuXBKNiT3jR5Fu0KG4Yi57xItiMxJgjVl28tK+euZkXgBhM9wULs+eI1EDzNOwZ7EB7NxXoPAeXYXco/o23fDOnjj5Ai3NRcjp5z0Orlv0ybaCcJFeyB69M/L+1TZ86Qebov+B7k3z6+ZXBC44jmFpMa5J9wRDc5nwsJSO+wK/B/eADLpS25vPi7CAAAAAElFTkSuQmCC>

[image13]: <data:image/png;base64,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>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAZCAYAAACo79dmAAAB+UlEQVR4Xu2Wv0uVYRTHj5hiJCkkQlhIDUo25iKoIEgUVEgEIY0OrdUiOungoiAqgv+Cg+BiW4NTRnttQUEQKK5BRdn3w/M83uOTr4TCe71wP/Dhvue8v877/LxmderUJhPy4D/djfdUjX055eILckN+kzddfkT+cnFVeC+vuLhLfpavZYvLX5UfXVw6t+SNLDdpoctHszzx2yxXKhRAt3sYAhTrhwAMydUsV3UYlxRbE1Donzx5HmFyUSyTq0xYafbkG3kpO1cIY5hip/MTJXBNzuXJk2AlYAjkK0EZ8M5HebKIovXVw3p83cXpuovysstDgxyTwy5338L9+MDleQ7vbY0x17GuF8KX0apFQ6BfbspPstfCg7fjued2tAt75I58Ihdkt4XrZ+VXuWahF9MazzLJjgkUOi+3YnxIs/27/yfZhtk0Ei9lk3wn2+Qz+d2dp2CgKL8rpo96IR9bWBppdVqWX+BDedZ4zPEuPvhM0BIz8XhFfqicsjvxlx7yrdxhoViKzu9JMAR+ynXZl507NXQdsxa+xBgG4i+8skrhtNKSvB1jeiv1gOe3hcn10ELLM14Xj1xxCnhR2oZ/WGhBhsby4RWh0Hvx+K5VxiJQyKCLE+kfHsVy/DR6ZtplZzxmFh+3cpA7bjan2Z7jn8HHN7q4Tp2a5C9wH19/BW8DCAAAAABJRU5ErkJggg==>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAYCAYAAACfpi8JAAABgUlEQVR4Xu2VvyuFURjHH6EoxUSi/NiUMiuLMrBI7shm8A+I2E0WCaMyGVgtpltKStkYlHoHUUrKJoXvt+c97nMfL93bPZfl/dSnznnOue/58Zx7jkhOTmUswI8KfUx/Uxee4KqpN8Ej+AAHTXwcvpl6VFrhvIuNiQ647uIj8MrFojEEB1xsRTQNEy7O+pmL1ZVEdCItLv7nMC2cyL/CXeAk7nzDDzTCNh+MQY/oRI59QwaHon2nfEMMeFDf5ftBzSL8zaPvCNPCnWBael1bFty9xAdjwF3gbqz5BkMzvIBz8F70MiTtcAlep3XyDEdFF7UHb+Eu3ICnpt8X3XAYnojmfAfOwC7RgQMNcBn2p/VLWEzLi6ID2kPOgfkNtk2Kfps3OOM1XYxbUn7Fv8JpUz+A52mZTwPPWyCkPcrdVJTylTAtvJkDiZSeBabZHnju1m8pr4ptKaWiAPdFn4ewyhc4C/vgDeyEm2kbJ2Ef0JqxF1iHKQcYY59QDvh+OTlV8QkIqkvDlufoIAAAAABJRU5ErkJggg==>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAYCAYAAAAYl8YPAAAAX0lEQVR4XmNgGAWjgKpAAV2AEuABxPzoguQCkEFB6IKUgItALI8uSC7gBuLFQCyDLjENiGeRgRcA8S8g7mOgEOB0GTkA5LLt6ILkgisMVIoAFyAWRBckF7SiC4yC4QYA/C8RC4AA67MAAAAASUVORK5CYII=>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAYCAYAAADOMhxqAAAA5klEQVR4XmNgGHJAF4g10QXxgTVAHI0uiA8cBGJBdEFcgIOBRNOlgVgfXRAdSALxFCB+B8SvgfglEP8FYj5kRTDADMQ/gHgjEHMC8VYgZgRiVyC+BcTyCKUMDGVA/J8BohAEXID4GEKa4QkQP0fig63/icQvB+I5SPyHQPwVxgGFBsj0Vrg0A8N5IDZG4oPkr8I4PFABkKkwgBz+IGeiy4OdswPKZmFAhD/IL+8Z0DwMAiBP/wNibgZI+IPSjzBUbBWSOgwAcl4nEIsDMSuaHFYAcg4owRENbBggHiYa1AGxN7rgcAMA8ZwmXJ194MUAAAAASUVORK5CYII=>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHUAAAAZCAYAAAAPMmGdAAAEQUlEQVR4Xu2ZXahVRRTHl1RQFIUlfmDilTDIDxR88APxoRSCMMRQix70LYjyRVB6ifPSg6IiKooiRE9KKRiYCUac21NIqEQhCIGFIBQWiYUppevn2tOds86effbZd5/Dfdg/+HPPXjN779mzZmatmSvS0NDQ0DABWah6yRsHyFTVDKdpHTUmHs+JtfNxX5DgGdVXqsd8gYN6G1SXVadVS1WPROVXVNuj69KcVL3tjTXytFjD7pfURICOXaG6Ld3tQz+otoTKORxVXfBGB/3in4vORnVw8m/RdWlGVZO9sUbOqOZF139LvvO+Vm30xiHzhGqv6oDY6rFerK2rs3Kc/YLq38zOTHo+KwuwEp0Te1aKP1RXnW2S2DPvOft81THVo85eCDcMExp+0xsnCIfF2kcHw47setH/NQxmMY6h7B1X9mamFE+J3feRLxCzX3Q22sK7Fjh7kpnS3eBBMkWs4S1nHwSM7H7DCrM0nnlfiLUXR3jWipW9HtmWqP6S4lkV7vvGFxRwQ/WtN+bBMrJNtUx6B/S6WCm2vPB3GByX4g7uxY+SHyqAAXNdNSeyMWtT9QPMOOqgZ11ZCpKuW94YICbcUX0utuYzEpnea8TW+NljVbt4UuzhNIZlqV8Y7W3Vx9Kd/ebNhDpg0J73xj7gW32MgzfE4irZawz9Q87Qi62quzLm3LekM+v1hDDQBbORmNHKfrP0fheVc1NRfMX5LbGPiZecsixX/SNjHxJrT1SvTspuLVLQtp+cLcS4vOWTmZ2cUQ62SbFjT3UWd8CqkOtUUmM6NYD3Yyf+LBYPBgWZYm7DSvKK2Fahiphtf4ptI8pCbKW976qOiO0lueY7QiLloQ9RHszEQ6rFOfbg2JBle0Ic7gJjO7r2+1OWjUE6lfcTg6oybKe+KtYnrGa0nT0rW7OUQyHlVFaML1Unst+eT8XegfPyyHUqJyEY4zT6kli2FqCc5WMQEL95fsvZh8F01SfSn0Nhv9gkmCXlY37KqfvEvj+VtIWYWWmmxglOvPRuEos9eaMohqXiRSkerR7qHpQKG+ga+EDsu/olZOnxoC9DW/JXO2z0/4izBzh9IldJkUyUiKecdEC8h2N0EPhnZ9cpcA4jrkyiNKL6TGyEk8Lz/H47qA6+l2rvZZbSiUWnQnkwcPM6/5qYneQq3gcD76BP33P2mNRzHzrlZbEHkDT9rvpP7Hyx7MxbJ5YozPUFEQyYcDITtLujxnCgHf60pyy0uUr8Tx0+0L+shnGfoF9V70f1UnD40PbGGGbPTrGzzaqpfi8YfWwFflGtkvKDpk54Z79xFHAIHV7lvyOEL05+5viCDFbFXWJZ8GYp3pvG0J7CswG/P22olzIH+v3AgT5hr3BikASMemNDrZBkcUo3XkIeM+LsXXyoes0bG2plvCdZAfKXKmGgYUDgWM6eq8JZOw4tG3cbGhoaGgbPA1b/C87ntX3oAAAAAElFTkSuQmCC>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAArCAYAAADFV9TYAAACbklEQVR4Xu3cv+tNfxwH8LekiDJQKBQrgyKTfEsWhWyUxWZUDMrC4g9glJLBZpEsGJAsJmVSFomNDJQQr1fnfdzzeTu+3eFz6ebxqGfn5+d+ztmevd/ve0sBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4C/7XrOuvQAAwOJYEzkUWdVemNLK0hU2AAAW2X+Ru5Fl9Xh15ETkSX/DlA5EXrcnAQDmRZahve3JPyDL15HI0vZCtTvyqUzK2tCjyLP25IhdpZsGvR8511wDAJgLOdV4NHI9crKe2xr58vOOX22YIvm5/+dKZFvdfzu8MPC4bp+XSWlbX7qytiKyM7Klnm9lGfwWWRLZV7rp0I0L7gAAmBO36/ZzZHvdvxi5WfdnJQtUlq7MveZayrVqOY3Zy9K2OXK1dH/TuzzYH8rP799neT0GAJhba8vCQpMjXvsHx7Pwoky+uZnTlq0cpcsRtF6Ojn0tC8taypHBVj778H3y2Po1AGCunS7dGq9elp0clcoiN+bVFBkbNevtKZMpzhulK29jLtRtlrWcQk1PSzfKlrK8Ha/7Q2cjLwfHd0o3apjvBAAwl7IA9SNVOY2YhS3XfmXxmYX8/H792rGaMbcim8qkrPVyHVs+87XSPWfrcORB3c9imP8v1+U97G8AAJg3fal5EzkY+Rh5X8bL0GLIspX/613kfHOt9aGMP8elyI725ED+7EdOg+YatzOle5/81ikAADNwqnSFMqdac5tfQPjdT4EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/mh+ZTVb6mYEMwgAAAABJRU5ErkJggg==>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAZCAYAAAAIcL+IAAAA0klEQVR4Xu2SzwqBURDFj1CUnfInC2UnW/ECNpIn8A4WlvZewt7O1gt4BlZWSikbewpnmns1d5S1hVO/vvudOfebZvqAn1SG1EmP9F0tUZs8AzNX+9AQGmz4gtcCGiz4gteZPLwZVSVdkod+7ZSWgRHZkhopkjU0OLchWcGVdIw3gLaV51ty824N6CAbmEHkIMF9NIInoaStbF+CK+O1oBMnbWNwbDy7P7kkoBRMGzwGTzQhuViYkhu5kANpkh10E8sYipI2FZIN77LwMvQv+uu7XkOiJllUWY3HAAAAAElFTkSuQmCC>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAZCAYAAADTyxWqAAAA5UlEQVR4Xu2TMQrCQBBFpxCxVKxEG+3sLS3tLS1sBA8heggrD+ABbL2ChQewVhAEwRMI6v/EyGSyrmERtMiDV+Qn+WR2NyI5oYzhPaNnOI9ec3OBU3VdgCt4gi2VkyscmizBFlbVdR3u4RqWVE52sGuyF23YNNlEopF6JicbWLFhDF/gWBqOyDI7IllI+nkvXBeWfQUW3WwYAhefZVx8HyNYtqGFa8iymb3xZACX8ABryVtpuJMc0bWTpA87kqHMd74sH8v4NfyqdyNqnGVFSf9/sfzNeKhdOMtC+d+yI2zYMOeHPABqFjb8fafqPwAAAABJRU5ErkJggg==>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAYCAYAAADtaU2/AAABHElEQVR4Xu2TMUuCURSGj6iQiK0iteQmBCIOLS5JLk6NDU36AxQaInH1Dwj+i9YWf4A0trg7CEHg6CRY78ttuLx+5od+X4s+8Az3HOXlnO9esxPHQht+h/Tr9z+RsIAv3jkFX+EnLHr1W7jyzgeRgY9Sq5kLGEi9DKdS25sSvJLas7m13kmd54nUImVmLvhM6rHDNTP4X+GUDJ1rI24uzAW/aWNPKlrYBi/W2jYvFknAnBa3cAObcKmNILhmTso1X0qP8H13YR0mpRdE1UIGc0pO29NGAHz/H7ClDY+dwQV4Dcfmvu8I3sM8THu/U9h7gH14Lj2yM/hQuPYGfJJ6rMEMfTc3tRJ5cBZ2zK35r08RWTCf0tDC3egTR84PxJc0mSKpquYAAAAASUVORK5CYII=>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAABPElEQVR4Xu2UsWoCURBFJ4ggWoixDUhKv0CESJoU2gVS2UiwSZO0EawknYWd6QIp/QLBwg8I5ANsbATBztRpYu7luTg7sYk7hYUHDu7OLDvPefNW5EQC0vDcBhVZGziEBtzsMcLGaUbl/0UVfsMPmFfxGvyC9yp2MHwxC/zAuoqv4TM8U7FEXEpoxxJewE8Je+YKVxv1fQrf4mk/2DIWubYJTwYSigzFcR80d7AioQALPcTTybmBq+01x5lFJru0DyzAf0I4zizCc+NCCc7k76hyjFmIY21JwavtL/ftFpZjTxh4Ft5tUHb78mgT4Am+wB58hS04FzMoUc+1+lPS2ZOnEU0Jh7Uv4cX8lo1hTj3jAgeFEraU7XXFrnwk4RC3xfEQs1V65QvYlfAZ0m1PBKeqoO65L0V1f+II+QV2rUJBm9EEWwAAAABJRU5ErkJggg==>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAXCAYAAAA7kX6CAAAAw0lEQVR4XmNgGHKAFYjFgViSABYGYkaoHjD4TyS+CsQiUD1gEAzEf6HYFVkCCUgA8VcgNkYWBDl1FgPE1FvIEmgAZLAnuiAIvGeAaC5Gl4CCOUBcji4IAmUMEI0gA8zQ5EAAZFsyuiAMyDMgAgMlBIkBIL+ANKqiSxACvQwQzSQBkN9AIQwKaXRQBcSt6IIgAPIfKDqwaQKBNQxYQpWbAaIJpBkXADnfBVkAlgCwRQEIMANxEgOWlAMLRUIYI62OAmoCABoiM2TH+gxMAAAAAElFTkSuQmCC>

[image25]: <data:image/png;base64,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>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAAvklEQVR4XmNgGDZAAIglsWCCoBWI/xPANUDMB9OADXxjgCisQpcAgvcMEDkWdAkYAEn+A2IXdAkgeMgAkRdHlwABQQaI5FYg5kCTAwGQoSB5fnQJENBnwO1kRgaE37GCOUD8BIhl0MT1gPg6EK9gwGEryMmngfg1EM8H4llQvJABYhvIv8xw1WggmgGiKAhdghgAsg2kWRNdghgAcjJIMy+6BDEAb0jiA7BoeIsugQ+AEj3MRmRchKxoFIxcAADlATHfoDcDkwAAAABJRU5ErkJggg==>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAYCAYAAAD+vg1LAAABR0lEQVR4Xu2UwSpFURSGf0kpSUoMiIkJL6BEGVDMhIFSykAeQRl7AjExUAZMkSgTL2BkIGVmwkhKUUj8v7XPtc5yknNndL/6Op1/79Y+e+91L1Cjxv/hhJ7Sc9pNH+gxfaHzbl5p1mkdfae3tCvle/Qtm1SWUdpK22CF59zYcsqaXfZrGtNziN7RPje2AyushYV2NZmenga6ELJPNFFF1kL+CCucoQIj7j2jiY7FUOgYLuhUyFX0OWSlWIIV8ccwTa9oT3rXohuwzsloobv0gB66vEJ2lpuw7Q7Se9qbxtvpFuwyb1ImVukw7AivXV7hFXZxKtqBrwuNPNHZGMJadCWGQl97FsMCLmELR/RDUtvm6MT3/i1iHNaSA8i3m3Z3lJ45Zpzqjp/QeH3IJlDwtdWiu1iELaK/g6LjqQq12Tbdp/1h7I/yAZAqNinMP53IAAAAAElFTkSuQmCC>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAZCAYAAAD9jjQ4AAAAjUlEQVR4XmNgGBwgGYiV0QVBQByI/wNxA5o4HNgAMTO6IE7ACMRqQOyLLgECu4GYnwEiuRBZAuQIHSi7HIiXMkBMAgMOKG0JxD+BWBEmgQxaGSDegOuCAREgvgrE/9AlQGA+A0QXSLcSEJ9AlrwLxL8ZIAGQA8RTkCULGCBGvgZib2QJGAB5yQpdcJgAAMOLE8UhhdbtAAAAAElFTkSuQmCC>

[image29]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAaCAYAAABl03YlAAAAuklEQVR4XtWRMQuBURSGj1Bkk7IosxmbkbIwWGxWNjL6QxarzWCWspCf4DdI4bnu9/WdzmUx8dRT9573dM/tXpH/YoINW9Tk8YFbUw/oiG/+jjTWsWcDzQ4PeMSByV5UcYgpbOIGC7qhhnu1X+AKM6omWSxG6xyucZ7EIS28YcUGGneCe0h34ltKeMK7DTTxqIsNNGPxo9zFPxKPattgif1o7RrOWE5izxVn4r9jJP7FA7riv2Bqg1/mCSM8HLtYDKCaAAAAAElFTkSuQmCC>

[image30]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAZCAYAAAArK+5dAAABNElEQVR4Xu2TMS9EQRSFj8QmxIpIJAoSWqUCkSg0+wtQ+QGUopH1G2g2EqJRqf0BnVJL4w9sRUdBhHNyZ7J375vdYnXyTvIl7507mXPnvnlArVq1siZJizTS+wTZJlN5wV91QcbID+mSxeTfke+8aFTNkU0yDgu4d7WT5Kk2sjQOaYu8khVXu4UFzDpPOiKHwZNmyE00sw7IA5l23iMsIH6Ld9jpotqwWkWav7rtBF+LFeClLuWVAt4wIGCNfKB/PLpZ2ujSeRvkDNUTqMHj5BUDNB5t5gN2yAtZct41WUY1YJ2cJ68Y8AwLeIId8xPVcWmT/J/4AHW/l54HBnzBbpA2mEfvZmU1yZV79wGr6AUXA/L9jx0PUxxRVjFgARawHwtDpAtxGk2Yp1qfdh36q2v9M/0CaXc/yymL8xAAAAAASUVORK5CYII=>

[image31]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAZCAYAAACo79dmAAAB1klEQVR4Xu2WzytEURTHj/yIKEQkSZSFKAt2KIqFhZINhS2lWJCU/8DOjqRkZ6EoKWUzS7GWlcKCNaVEfny/nXuaO3deUjP0puZbn3rve+/0vu/cc+8bkbzy+rWWwXNoxlUP4Cs046h+0aCxD1sBEuBdciDsFZgAd6JhC1KH4yMGOwZl4EY0LCsdOzEgg1olE6JhG2xCnDQu2gKmPdGwrZ4XC7GaF6BNtJJkXTRsnzfPNCjJ0+INnIGalBl/qA5JPjxk1Jvnawd8hmYGqgMzoRmqGOyCosBnSIadC3zTJbgNzQw05PhR56Kf1lDd4EW0glHii6yGZqABMBaakuoXgmbRVmoBVc5PEydeg/pwQJJhudGixI9GVD9TXK0VMAumRIthp0wPmAeTYBg0gUPRltp2v0kR+yPsTVMJOIoY94O1gwNJbx2GpD7AtOdb73Pj8mPTBapBuRtfA4/uOutitZYCj5XrBKWiD/aPPAtrZznveYqYThxZFyvCzdXoeawol5BiS/mtw5NmQ/RlXsGi8/nCte6aKzEi+gdqwXlZkfWytQCXlkHv3T39U9Eqcpn3QaUbewK9ontlS5J9bCuxKbrZ/lUMwY8EQ0X51tsm3nMf5ZVXzusbR7NdRjzsBkQAAAAASUVORK5CYII=>

[image32]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAZCAYAAABkdu2NAAACc0lEQVR4Xu2XT4iNURjGH2Eif4ZGpMhQs8DCYmajZqz8WYgkhcTCgoVmM5RSUzNNFjJKkywkslKyICkLiyklUXYopSixsFDKFGI8T+95m/ee+12bubndr++pX/ec95zv3vN+75/vu0ClSqXQafItN5ZJn8h0biyLBmDOldLBxWSS/EJJHXxFDpIPMAfn1C63t+TMA7KQvIM5qIiWQnJKznnEJmEOrvYN7a79sPR03YI5uCHY2laK2nPSA4uYuABzsD/si1pKJmCRHiUvyW5yOa1vgtWxUn1VsrVMmzHzWMjZE/ZFfSH3w7yLPIVlgmsJuUvmBdt/13xyE/WHkGNy8GRml+TENdi1Udq7Mcw1PhvmLdEz2GtZrl7ynVzP7HfIn8zmyqOtFO4mfWRt7RK2kS1hvpzMTWOViDJCpaPvVDlIWte59NlN9qVxQ2nxDYprxB1Us4n6QV5kNteCMPYXhkfkBOy7dqS1TnKGvE5z6SvZStaQG7DavUoukidpzyDsmhEyRo6RSyh4Vq9Efa25Osi9gnVvNhofSeN/aS/sZrg+kyFYKQyTQ2QqrS3CTK1qTRHUfnXwo7AMEIfJR1gDlHRDH8Oub5oaNR6lW0x1pef7MJezsSPfhpWHJEdirergD9Nnrp9kexqvJ+fDWlP0m1zJjdQ4apuOIuCH1kFGYC8Tyh5JKes3SodUap5KczngTkTFiCnauklK9+Nx02yl7ql6cSn/d8F+KCpGTI5orH8pXi/6r6luvI68hTnuz9BzKH7B0E3wiCmN9ZzVdXkjbIp2kgMoTiMpf4ddgfqOtyzYNHbl17q0NzYUjRv9fqVKlVqkvxIYdE7AGaBbAAAAAElFTkSuQmCC>

[image33]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAYCAYAAACvKj4oAAABjElEQVR4Xu2WzSsFURjGX0kpHxHRjdhIWVsoWVhQNuqGhVK2/gALK2VvJzYWykLZ2Skp2VtZSN2lxEpKKN+ep/dM973jNjMXmcH51a/beWem5plzznuuiMfj8XwPNbAvXPztbMNb+Azf4Hjp5b9DP7yT/xxwDx7AY9gFb+AufISz5r6sEhtwFVaJruNL2OnqO/AluOmL1MNcBbboY4mIDDgCm2GraMAZc23B1RpMLYtEBqx1v0PwSkpb7ZZoQH4AwlnOu9+AOthrxmkQGZDwhRlmJVTnQwwYwLNm2IwJZ571NIkNyJc8gROhOsM9hGqfZR6eVeC+PpaI2IBzomHs8pyEBdjtxgy/JtppCWdtER65cZrEBgz22rroiw/Ca9jjrrfBDdGmc+Fqo7ARHsJqV/tpmkQ7/jJ8hZuiW4gd2PYJeRJtMAzXLsXGE+YeTpvxEjw348zC2Uuy1E5FP0AA9y3P0EzTIR/Pv3KMiR4lA1Kcfn4ULgcu18wyZWQ3jYLX7X7jvxPuA4/H4ynLO+HIUTsc96taAAAAAElFTkSuQmCC>

[image34]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH4AAAAZCAYAAAD30ppqAAADyElEQVR4Xu2a36tMURTHl/yIEEok6V5CiZKkm+JFFA8kSeQP4MEDCbl5uOVd8ih1USJ5VYqHefAgihdSeEB+PEhKKOTH+tx9drNntc+cMzN3zpnmnk99u3PWPjNn71l7r73WnitSUVHRd0xW7bPGiv5lhmqn6r3qu2mLMl21KBAzJoTrBcZWJnNU91RTbYO4vlo719OMrUgGVcdVb8X1e0lDa53nqpPW2AanJKfjL6j+BTrS2CxrVV+TNi8GUBYXVQ+tMeGgNPbTi5VQNJNUW8Q9/65qr+pMcn0zuM8zpPpkjW2Q2/Gel6oHqr+q7aYNauI+tEyIPHfEhbU05qkeJeJ1GSwX5+ARYwfG8FR1XtzkCFmtuqSaYuyt0LLjb6t2i+vwddMGr1SbrLFg9idqho9QfIFlMKB6IS4y2W3Hg3O+qNYYOxMhZp8rjdtxqFnBfdCS4+ertiavfXi03JLOZmKnrBc3oKw+4HD6v8o2FACO49l/bIOBsXBfbHJ+FBd526Ulx7OSFyevCfl0amG9eSwBPBRclwHPj01ICyGe+8oI896hbEfN8PddsQ3i8iciVrvkdjwriNXsIcwQbsK9lGhAVMiDrRKyxJ5nK4kYfCE/rDFCWsTqNktV71Svpb6I0vCTmMTaguPa6f9M1Q2pj/+D6lzDHQYcGmbJTAT2+J+qjYltOLHnYZe40iWvHqtWjr2zOc8k30pg0J+tsQB2iHt21pbIdjAq7l6qEIuvTLoOsy9c8UCtzMOZwcvEJXZl8yZRM3wIja2kGIyTJCyPjkl6sgaEbZ6dVTpSMVE5sbhiE4T3F+J4nB4r03zIIMw/MW1lkMfxfrXEVlKM8XS8Pw/JcjwO577NtiGhMMdzYuQz+hBWOx24rLrW2FQKeRxPlsx2QElXNH5vznI8iRf3xVY7FOZ46ncSMosvn0ioNpi2ZnQruatJ82y17PqdKohFNCpuH98jrj8kykfFjfG0uBp/IHlPjHaTu5Ygax+2xgSf5JFU5c3ou4mvz9NoNcx3g8PiHL1OdV+1QtyEYHGNiOtf1vlC1jg7ghnHh4div7NgK7t+96Qd4HDYYceSNp4iOKH6Ja6vV8XlR/RnSOpHtLOTvzE4wKlZ40QGR+Jk6uVeh5qaZI+k8IC4QyUPE/dscG1hksSS7QlNnh9peg3O0muqb+LOLTjO3RbeEMCPNLEfbyqU35L+xfUirHBKZr8FEQViZSHOxumDxl6RQMjn+Db25fUqOJXf45sldlQE4/GPGH0Nzue/WvoFcgKcnqesraioqKioSOM/TBzulPLmI/EAAAAASUVORK5CYII=>

[image35]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAArCAYAAADFV9TYAAAEPElEQVR4Xu3dz6ttYxgH8Fco8isRCYNbYqIMlAkjUQwYMBJzBkoxEGUg+QeklKQMJMpIYmCwjPwqSnR169YhkgEmKMmP9bTWa7/7uWvvwznrnHP37vOpp73Ws/duv2fvwf32vu9atxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALbWrX19M1G3tS8CAODovDE+XtzXznh8fl9XjccAAFvjlb7+7uvX/MQurijD+7rUPyzXjo/39/X4eHxJX2eMx/vxYW4cgo/LPGMHADbIX2UIVKuqisBWA092exle+1FfL/b1S19n9/VJ85quOT4KMZYrc3MffsqN3ttl8b3d0fTvbPrtd7pXP+QGALD9Isy04aqKMFetCmyxH+zN1IsZoAgmMatVdc3xUZgjKFUPleVA1oq/+au+fk79mGm8O/X2KgLy1G8BAGyxHK6qz5vjqcB2oq/3Uq/6ugz7xqquOT5s7f61ObRBNosly2Nl+E4vb/oP9nVec75fcwZQAOA0F2Em/vGv4SpCxi3j8ZPjY8iB7Z4yvO+spteKwNbq0vlBiFAUS7JP93Xm2Pu0LJYij4+9/bi0r29zs9GNj7HX792m/1lz3HqgDGN+rK+r03PrnCzLgRAA2GIxsxZhJkJD1KoQlgPb72V6GXWVLjcal5VhyXC3WiWu+Ixxvzqez7VXbErsR6ufk0XorcuesWQaY6gXCMT+ttZFZXnMT4znL/z7ivXi97grNwGA7ZT3r+W9V1UObBEuYkbrv+pyY0bfl2E854zn75RhZm0v7u3r5txsxHeQl4arCL9xy5AqxvRwGWbl8n3fvizD8+3rnx171SN9PdWct9aNAwDYMhEQYnmzem18vH6sqg1sMQMX77tx8fSSCCft/rXQpfM5zTmjFjOH65Yb1wWl2L/Wer4sgm0Nk1Udc76hb1R4qSxmOtul1WrdOACALZL3r7V20vnUDNvUhQohZo+yLjcacT+zHFqmapU/yjCeqaXcuUX4ei43R106P7cM44rxZbEPLp67ID8xai9smAqjMRv3aG4CANsnwsdUGIhwFkt5udcGtri1xZ/NefV+mb6xa5cbM4plzPg7nml6MbapcezXDWX6b4kZuXamsoowmvevhWvKMOaYSavi3nX192h/l6nfKK7OXTXDCQBsgbiCsi7JraosB7ZwXxleG1eExi1APlh+ekmXGzO7rgwhLcbzW5n3FhqtCIF5xiyWUev3VpeUq2Pl1P1r1YV9fVcW740l1Xp1626BLcZwEIEUANhgU4Ht/+hyY4MdL8NVngdppzn+sTkOcaHCF6kHACCwNeL/In0rN2cWgfD1vl4up/5H9fHZBx0YAYANFIEt9oitunpylVjii3uodam/6WLf3E25eQjiM+OzAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA09A8QAeAN2dWZXQAAAABJRU5ErkJggg==>

[image36]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAYCAYAAAD3Va0xAAABBUlEQVR4XmNgGDGAA4glkTAzqjSYL4YmhhVMAuL/SDgHVZpBH4g/QeVgeA+KCjRwG4hPAPE/IPZAkwOBA0Bcji6IDlgYIIr4GSA2vkeVBoPrQCyOLogORIDYBcqGOR8drGGAWIgXpDMgFDUwQAyKgMsyMMgAsQ0SHysAGQCyDQZ0GCBe2wHEnFAxkGtBrsYLQDZdRRMDBTbIVVMYIMljK6o0dgDyFrKLQAAW6E+AWAmI76BKYweg2IAFNDIAGQIybAEQL0WVwg5A3pJGF2SAeAtkEChdgVyNF4ACswpdEApAkbCcAWIRzoAG5Z9QIN4FxI+AOB4qhg5AgQ7yFiO6xCgYBdQCAJCJLoFnQiXRAAAAAElFTkSuQmCC>

[image37]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAYCAYAAADDLGwtAAAAhElEQVR4XmNgGAUDCpyAuAuIZwHxNCAWRpVmYGAEYh8g/g/Fj4D4FxQHIaljeA1V0ADl8wDxAajYXagYGMBMckESA5n0F4gLYQIg3TCFxjBBbIBohSAAU1iOJm7KAAkBONjDAFH4EIi10cSfIfHBgBOI7zAgTAdhaxQVaIAViMWh9PAEAHyYIPwxjB+ZAAAAAElFTkSuQmCC>

[image38]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAYCAYAAACIhL/AAAAB8UlEQVR4Xu2WTyuEURTGH6EIUaSwouwsWFBkycKCjfz5BhZs5QPIF7BRdhayURZSFhbiK1BSipWslKKkcB7n3pl3jvO+g5nZ4FdPzZznzr3n3nPP+w7wzx+jTtRigz9gSHRrgxlw7LQNeqyL3hy1Bd/GqaPgJbkUrdpgBnOiOxvM4gW6uMcU1FuwRmBctGSDAW70XDRhDejvVmzQowaagFeiRtExdJF4qkn6RPfQOTyYAOfmPB705m3QwoU58MAaQg808W1RlfFITCCNXWT7rNyODVpYulfRmDWENegCg9YIXIlubBCf7y31WDBC4X324jlYGu6SCe6JNo14epzcKy95EJ3aoNARxN/S5+f2ghHKFrJPGKPQY+ZJecTdp0GPi3h0QX2vQSLFrshHeTnAKy+h92SDCbIS5OZZAd7jNIomyO7kgAZrQCemxwZJIy3BeHXSKhMpmmApzz/Cu+t1P8t7DZ2DVItac26e2IQupTz/ImldPAmduyl8P0E+2SRuF/N5xnfnInSSC1EvNCnulN22LHoO3iz0ne3B0/PuKBsjJsjrsyGqLRihcIM8hIoxDN2I9ybhQYwg/S1CuAnvZMtGvehQ1G2NL8DEz+A/H8sKS/fdhbixfVGzNSpFxf4PlpN+0YANOnSKZuD/+fjn9/MOr859l2v9Kl8AAAAASUVORK5CYII=>

[image39]: <data:image/png;base64,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>

[image40]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAZCAYAAACFHfjcAAACsUlEQVR4Xu2Yz8tNQRjHH6GIkh+RJPmxUYqQIkqhSCQslD+AhSxYqHdlY2clWcjGQjZ2IsriZqWsbUhdEkVSokh+PB9zxjn3e2fOvd333Hh1PvVd3Od75tyZZ+aZmXvNWlpaxsgi1yHXPDUyzC00Wa66Hmgww0wLzw7bx5FY67rt+uk6K16KOxaeVc2ykCCNo2u/W5ZMc71yrZF4HQ8tJG/sfLXQ6WGJg0xxzvXDtVsNZ7aFxC9Ro+CEhffOkXhst1zijfPIypkdBp79qEFnhuuW641rlXiw1ULSc9A2l+CDrlMabJp1rg823BdRTnT2khrOdtc314QaBV3XYw1WoC1JTEGSSSLJHBssvXuujg3eDA9bSMRxNSyUBV6qLICSuaHBCrSlHznwz2iwaVZa+KILalSYb2FGmRkGxAZW1WerLzE8ElmFzXOpa6OVCeZzakJ4f0eDTcPSoyNP1KhAWbx3fXK9TKhuEyU5ePvUKKCscntLBP+5BmGX9c9KTleKNik2WBjIawudZZZSsC/gkxAlJpKjMQUzzIxuUsPKTbZuNcKLQn00lYh3Fi4tly0MZlmv/QfKAp8SUTgS8bhrpKhLBN/XtXAy1JFNRBNscz11rXDttbChHet5ooSyyC19ljbehBoFdYmIp01dWcDYEsGRiaqct3ytMtBR7g8R2h/QoPXfH+5aejLGslnud313HZE4M0an9E5BORBP3QPi0qYscicG0J4jVulYbyLuW/rU4JnrGpwMvIyX8oMmBV68AXKB4XNVJHCnhdlVD6U2U+haOpGbLexTb13PxIuw6nKlNTILXVs0WGG966gGG+Cm5a/YrKTVrulqFLDqOpZeKVOOQT+6csR2i9WYyuxwndTgAPa4vmjwf4B7zT/1x8zfgsFdtLABDuK0a4EGW1paavkFT9+6LisZyagAAAAASUVORK5CYII=>

[image41]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAbCAYAAACuj6WAAAAA0klEQVR4XmNgGPwgAogPArEmEH8F4v9AbIyiAggWAnEQlA1SeByIWRHSEABSNAeIWdAlkIElEP8E4kPoEsiAE4h3MEDcgtO0SUD8C4j/AvFtIJZFlWZgMAHiPUAsA8QxDBDTcpAVmAHxeyDmh/LFGSCK1sBVQAVAbkEXOwDjgBwIEiiHCUABSGwpjCMCxP+A2AUuDQEgRVUwDsj+h0AsCZdmYJAG4hMMCDeCrfsGxKYwASDIYEBEDxyAfLYAylYF4rsMWOIMBJgZIFbyoEuMAuIAAEmrI6JXqDPDAAAAAElFTkSuQmCC>

[image42]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAZCAYAAACy0zfoAAAByklEQVR4Xu2WvyuFURjHH6GEUKQUiYHRgEFRBorFiMVkMLMope5iFBn8Gmw2ZbLdUAYDq81k8RcwkB/fr+ecHM899w7u2/sq91Of3nvOc27n3PM859xXpMI/oA622M6/wg78iNjm4raf5l0sNV5FJ44xIxpbsoG08LsSY0N08aM2kAZMIRd2ZgOgFz7CY1hlYqkwLLo47pAl05TWwBP4Dk/hoZG7Fh6QVOGkd/AFPkT0tZhJSpkuTj5hAw7Gnm3nL1mGfbazFEwpF8DCtzSIxrizSWBr9xwuBO0CODG/xIVYuGDGeFKTYBzWBm2WUrGMfVHO/caJhmCXa3fAadH6ZPqaXH81HHRP0g674QXscX0F8KRyYTyRlkZ4KbqzsZM6B+/hCryGs/AIbsJd0R92BZvhNlx3MbIlejPcit4IPw4bV+13LHRR9Bc+RWLh9nNMLmhz4k7RnVsTLQe/q2QAjsB51yZ+XOLwZSGWar7h8F+GT0tOvlNYalxZ8ODwrYRp97CW6kV3l0VumRLt7xddJMe9udiYeybGKmwN2geiVwJTFavffXgjWp+TotcJx7Ee94JxicEXVNZYuIP8XCxV4TjCmgyvlQoVMuETaG5qR1Jl5pIAAAAASUVORK5CYII=>

[image43]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAYCAYAAACbU/80AAABd0lEQVR4Xu2UsStHURTHvwopv5IUKQqrSTIaDTZZGPwBBrsMv1Imu9GKkj9AMrDJTEpZpExSBmXB+b7zbo7zu+/97vtNv+F96tt795x7zr3v3HMfUNMljHegkSxSGTDvZFDUZ8Y90Pl8kn789+OnA51nkYr3fYoWjH9G9OrmLBs/dnPjsWgCrV9rNSm6EQ0x0DAPzXHk7AF+/SVa4zLo3IMm2HI+S5gXSzIMjX/yDqEhusDfEUSZhSa48w7DtOjZG3N47ox/8Q5hQ3TvjTHeoUlsg1m4+KY3GsL5WnpFp3BNV8QBNAF3HIPVGfVGQ2wDS9DqJsHdHkKTrDvftmjM2TzsfruBHdGtGScRupmdHuDCD2ZcxBs0NvwXeGSsQGW+oInYvYSLswLtuILG8bquiaasswon0ESr+fgRev/bcQaNW0FaxQphx7Jzv0XX0OuXAqvEDfA2zTlfZRYR7+oyWDHOZ/OV/nRS+RA1vbEEnv2+N9bU1HQ1v7kEWDDap1B2AAAAAElFTkSuQmCC>

[image44]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA6CAYAAAAN3QXmAAAFkklEQVR4Xu3dT6htUxwH8CUUIR4iUk9meoOXXpKi3gAxQGHGnAwpwkSMzCSlRDJSMhP5l5SJGDAgRQphIpRQKOyvfVZ33/X2Offe894959x7Pp/61dlrnXv3fecM3re1159SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYiC+6OtjVx23HCji1q7e6erDtAABYFzd29VlXR7r6t6sDm7uX6qquDnX1TRHYAIA19lNX17WNK0ZgAwDW1mmlH1U7pe1YMQIbALC2bunqn7ZxBQlsAMDaen9Sq05gAwDWVh6H3tc2riCBDQBYS2eVPrBd1nasIIENAFhLN5U+sJ3UdqyQM7s62tWfpd+L7ZKuLhi+AQBgP3ut9IGN41c/y3faDgBgf8imtRntWrS/u/qubWRuX5V+1S0AsA9lZCaP/hYpj0Fz3xfbDuaWzzPzAgGAfebCspx90C4vfcBYxsjefpKNh28o/fdYHy/fMagcrXXu4Pro5D0AwB5xUVdPlH4ftLw+eXP3/zISlr6taqcjdA+XPmCc33awbR+V/kivOlpZ97PL9/HupO1w6Q+vTyjP6/Mm7wEA9pCvy3JGuTJvzoKD+T3e1eeD63yetw2u45fSf8aZ23Z70wcA7CHLmL8Wue+vbeMMb5f+Z9a5Xi8bcp3RteF1O3+tjrxlSxIAYI/Kgev5D30Zct+MCjGffH7ZEy6mfY81sKUONn0AwB5xTVc/TV7f2NXZg75qN+awZd5aQkTmsTGfYUCr32OC252D9jwSTVCrj0Yzlw0A2GMydy0T1c/o6pmmbzfVEw6yUpT5/NDVpaVfAfp16b/HHJ2V0PZtV7919dfkvfeWjZG29AEAe8zFZWejYydC9l5LeJjnSKqEy6Nt4wJk9PH+tvEEyb/pgbZxInP3pskRWdnWI7L60wgaAHDC5CD1nHIwj4TLmwfXL5WN0aNZ9fTk/VnoMGwfhsZhe0JUlSD04eB6N2S/tLGVnJ+0DQAAi5BAlLMv59EGtjrh/rFy7Ly6WglbeV+VEb4/BtfVoTIemj7t6vS28Tg91dVzTduPZfPfGQIbALBwdeXivHu/tYEtXi7TT2vI6FhG4YYyMT9/Q2tsfleC2m6cd/p7V0eatpwD+mjTJrABAAt3WenDUrtn2HaNBbaEqvzO65v2SFhr53YlKLWB7aEyvkr27rJ5NWvulbBZj3rK64yK1etbN946U3v/yGPYdm86gQ0AWLgEoLGwsl1jgS3eKMduEJsg9WrTFvXczQOT64SwJze6N3mnqysH1zm+K5P9Hyn977in9KOG33d1V+l/9yz52YS8jLDlcW1dNFC1n43ABgAsXLafyBmY85oW2NKesHP1oC1zxMbmntXHsvWR5JeDvlYWSCRYjUmYy+95s6tnm75ZXijHzl+rBDYAYOky1yxzteY1LbDFB2VjlC2hLKNu0yQY5ezNa7u6oukbmhXYom5Ku5MtSsbmr1UCGwCwVHVFZ/sYcCdmBbbMQasjZ3nEOWt/uWwr8nzpQ94sOT5r2ga/B0sfvnLPBLftqKN7NeC1n4XABgAsVY5Q2m6wmWZWYIts4ZEQtVUQy8hZwlG7jUYrjy7H7lfDYYJXglte5xFplS1C0tYuZMhoXd1S5PFy7P0FNgBg4eq5oYdLH6JyZunx2CqwZVL/WFBqZR+4LBLYSkbrXhlcJ3DVsJfK31NXndaK3D+Pf8f+1hwZ9XPZOLy9ygra95o2gQ0AWIjPSx9OxvY526mtAttuaEe9tiurUKfNVRvzQulH5oYENgBgYc5pG+a0jMCWkbixPd62Musc0FYerX7VNhaBDQDYg5YR2CLz09oNeLcyPI90KxmFHFtpKrABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAK+Q+VMTtZFqscgQAAAABJRU5ErkJggg==>

[image45]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAaCAYAAAB7GkaWAAAAiUlEQVR4XmNgGOSAEYjDgJgVXQIEooF4DxBzo0uAdM0H4lZ0CRDQBOK3QKyELAgy6j8WzAOS5ABiSQaIkSBBEBuE4QBmJAhjAD8GiK7T6BIgAHI+SBJkPwZ4DsRfgdgYyge5Aw5AutYAMQsQmwHxRXTJpQyQgADZG4wsuR2I/wLxUyCOgCoaMQAA4aob4lcTC3EAAAAASUVORK5CYII=>

[image46]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAZCAYAAABkdu2NAAAByElEQVR4Xu2WzStEYRTGH6GIkshXvmJFdorIwoYdC/wR1hZsZ2NhQbJRsrMkWyUl7FhIsZmllCxkp1A4z5w7zXvPzFxz647F9P7qae59zr13zpn33PMO4PF4PP/Ig+jHmpXEl+jZmpVCDXT11m0gAS5Ezdb8b9pF36JZG0iAa9GENUukSjQXiMeFqBYNiqZFdeGQGp2iDdEV9MI26E1J0S26tWYJpEX3oiXRDrTDqKYgzs9D0a6oJ/D4XXui2uA8A9vzCOVpzyyLojFrRsAE90X1jncDLfAEWtyZ6BP5K8v4gmtMQQfMgGtGkIL+SnF1B01wHPlJWVasEdCH3Epuo/BzWkXnrrEGvaHRNSNIIT/5UhSnQK5eMT6gz5m0gQDWceoabM9y738s6Ek0YwNF4DtXjE1ovmnoilryCmR7vjrnl8i9yEnQD/0TEYdR6GS3MK836ODJtqodiMswLcqLOEFJi2jeiSVBCtEtVwgOvlWEW7lBdAAdWOQRmvsWwsPoBWbIcMxyD3yHbhdJw32QL35cOkTHyK0Up+Nw6AotjHlnr+GxXdHMr9SF0odMXIbw91CJgtvLiDUdWBD38l6Y/c/j8Xg8ngh+AS6bXbZ5k5/BAAAAAElFTkSuQmCC>

[image47]: <data:image/png;base64,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>

[image48]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAWCAYAAADJqhx8AAAAs0lEQVR4XmNgGPaAB4glsWCcgBGIzYH4LxD/JwLLQLQhwEogzkXiL2WAKAS5BBk0AfFsNDGs4CsDxACyAUjzE3RBYoE0A8SAaHQJYoEfEH8CYgcG1BgQQ1KDEygyQJz+CogfIeHrQGyPpA4nyGGAOF8EXYJY8I+BgsBjYYDYPgVdAhdgBuKrQOzNAEmJII1zGCAGEQWSGSA2ggLJjAGSeORRVBAB9jNADOgEYj40uVFAawAAK/4oo8XdGPsAAAAASUVORK5CYII=>

[image49]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAYCAYAAAAh8HdUAAAA30lEQVR4Xu2SrQoCQRSFj5gE/xAxCXarYBAtVrEZBKPFIBgtNjHYxBfwCQx2EcFm9yXsBoM/Z7iuM3NdcLt+8JV797AzZxf4Hcr0SB8hhhKnd7qhNVqlE9hQ3j4qVOiF1vWC7CGhmJpj9lqYsGZKW3poGEJCNzqCHPUrGbqFPb8p4+M4YeTgt2WCps1ImDc0YcMDfw2kIXfI6gXZQUInOHUXXsNeMFAkIXV7oS4k1A4GihQ90AWcUsaQ0CoYKBr0SkvuMAF72TOd0w7t0zXkdyq+n3ZYwq/ZrTvSd/oTlSdFhDYt4ofiYQAAAABJRU5ErkJggg==>

[image50]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAWCAYAAAD0OH0aAAAAqklEQVR4XmNgGMFgBxD/B+IyIA6B4lVQsVYksYcwDW+BuBLGAQIWIF4DxM+BWAlJ3BFEcAJxDJIgCNgA8W8GiOnIQB9EaAKxIppEOQPEOS5o4uh8OHjAANHAgSaOE4CcA9JAFACZClL8BF0CF5BmgGjYii6BC4A8/I8BjweRAcg5IJNBzpFBk8MKQKaCTK9Cl0AHkkCsA8S7GCDunwrEAUAsDsSsSOpGJgAApsoeUdcK8MMAAAAASUVORK5CYII=>

[image51]: <data:image/png;base64,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>

[image52]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABeklEQVR4XuWVvyuFURjHv2IQSiElSgzKppRSbFIGBruV3UBhsEgZZTdajGziLX+DUhaDMhkNSHy/Pee6zzld7/3xXkq+9em+53nPPT++5z3PA1RXF2lNg83SEHlIg9QHOXTtPnJDBl2sJs2QlzQIm2DJtSfJM2lzsVyNk0VySrL4FUZDTNaVdEzeXDtXGnyfrJJXxFZIc+SIDDhuYRZV1Qliz59gE5bUTs5hu/CSZWtJrKI0oGyR5GeG2AoN/Eg6XawFZo/Oq6q0koXwrD8sk+nya+zB+njpgLWomg5YO9DX0U0uYH/edu8z2A68ZM16EsuVv1j6vn/skv096fCayT9UB35h+1uI78ElWXHtwrpHnPw0WZqXGtI87FarNuim95NhckVGXL+6tUHuwnMv4uSntC0KSSveDc8qh94enUche7RSFRHlI2kT5drwXa2uS5pAGVW5X6lYKbmHHMCseQ/9ZsNvQ7qGDawSukPOyBQZg5VJtSe+elfQJ7XZU0S01vPKAAAAAElFTkSuQmCC>