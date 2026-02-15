# **The Oblio Business Operating System: A Unified Field Theory of Commercial Architecture, Activity Dynamics, and Economic Physics**

## **Abstract**

This comprehensive technical report provides an exhaustive architectural specification of the **Oblio** system, a "Business Operating System" designed to formalize commercial operations into a rigorous, physics-based computational model. Unlike traditional Customer Relationship Management (CRM) or Enterprise Resource Planning (ERP) tools, which function primarily as passive data repositories, Oblio operates as a discrete-time, absorbing Markov process. The system postulates that business outcomes are not random, but the result of deterministic "Activities" occurring within a finite, rational metric space.

The central focus of this analysis is the **Activity Engine**—the kinetic core of the system. We will explore how "Activities" function as the fundamental operators that "activate" changes in state, encompassing their taxonomy, the thermodynamic principles of "Activation Energy" applied to lead scoring, and the strict user experience (UX) constraints designed to capture high-fidelity temporal data. Furthermore, we will detail the "Stochastic Attribution" models, the generative ontologies for asset creation, and the recursive logic gates that govern the transition of opportunities through the pipeline. This document is intended for system-design architects and assumes a familiarity with database theory, stochastic processes, and information theory.

## ---

**Part I: The Metaphysics of Commercial Space**

### **1.1 The Theoretical Foundation: Solipsistic Space and Economic Physics**

To understand the mechanics of "Activities" within Oblio, one must first accept the system's underlying ontological premise: the commercial enterprise exists within a "Solipsistic Space" governed by conservation laws analogous to thermodynamics.1 The documentation explicitly links the flow of capital and attention to the laws of physics, specifically referencing the equivalence of Cost, Value, Time, and Energy.

#### **1.1.1 The Conservation of Energy (![][image1])**

The Oblio formalism posits that the total energy of the commercial system is conserved. In this model, "Money" (![][image2]) is defined not merely as currency, but as "Active Claims" or **Kinetic Energy**.1 Conversely, "Product Value" is treated as **Potential Energy** stored within the contract structures and feature sets. The goal of the Oblio system is to facilitate the transformation of Potential Energy (Product) into Kinetic Energy (Revenue) through the application of Work.

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

The BOS framework operates on three levels of abstraction 8:

1. **Intermediary Framework:** It acts as the middleware linking disparate services (Ad Networks, CRMs, Social Media) and human agents.  
2. **Data Integration Layer:** It standardizes unstructured data from these sources into a strict ontology.  
3. **Constraint Engine:** It forces End Users to operate within "Standardized Constraints." Users cannot simply "work"; they must perform specific *types* of work (Activities) on specific *objects* (Opportunities) within specific *time bounds* (Durations).

This "Stupify" philosophy—Select, Setup, Stupify—aims to automate the complexity of business management, reducing the cognitive load on the End User to a simple binary state: "Do the Activity" or "Don't".2

## ---

**Part II: The Activity Engine**

### **2.1 The Definition of an "Activity"**

An **Activity** in Oblio is the atomic unit of system state change. It is formally defined as a recorded event that creates, updates, or engages with an object within the system.3 It is the "event log" of the BOS.

Crucially, an Activity is not a passive record; it is an **Active Operator** or "Activator." In the context of system "Activates," we distinguish three modes of activation inherent in the Activity object 1:

1. **State Activation:** The Activity triggers a transition in the Opportunity status (e.g., from Open to Won).  
2. **Energy Activation:** The Activity injects "Activation Energy" (![][image8]) into a Lead's Health Score, counteracting entropic decay.  
3. **Workflow Activation:** The completion (or failure) of an Activity activates the next Step or Stage in a sequential Workflow.1

### **2.2 Taxonomy of Activity Types**

The system categorizes all kinetic operations into four strict functional archetypes. While the UI may present softer terminology (Research, Creative), the backend logic enforces rigid behaviors and specific "Conversion" triggers for each.3

#### **2.2.1 Data Activities (UI: "Research")**

* **Definition:** Operations involving the creation, update, or enrichment of Contact and Account objects.  
* **Conversion Trigger:** A Data Activity is "Activated" or "Converted" when a specific property state changes from NULL to NOT NULL.  
  * *Example:* A "Find Email" activity is active until the email field is populated.  
* **Assignment Logic:** The system automatically generates these based on "Forecasting Goals." If the algorithm predicts a shortfall in MQLs, it generates a batch of Data Activities assigned to Junior End Users.3

#### **2.2.2 Asset Activities (UI: "Creative")**

* **Definition:** Operations involving the creation, versioning, and publishing of Asset objects (media, ads, content).  
* **Conversion Trigger:** These activities convert when an Asset transitions from "Draft" to "Active Version."  
* **Generative Fallback:** Oblio uses a Context-Free Grammar (Algo 3\) to auto-generate Assets. When the system encounters a "null property" (e.g., it cannot generate a specific headline), it generates an Asset Activity assigned to a Creative End User to "fill the gap".5

#### **2.2.3 Engagement Activities (UI: "Engagement")**

* **Definition:** The kinetic transfer of an Asset to a Contact. This includes both the *outbound* vector (User sends email) and the *inbound* vector (Contact clicks link).  
* **Conversion Trigger:**  
  * *Outbound:* The User "activates" the Asset by placing it in a Channel.  
  * *Inbound:* The Contact "activates" the Qualifier by engaging (e.g., clicking or replying).  
* **Workflow dependency:** Engagement Activities are almost exclusively the children of **Workflow Steps**. A Step defines: "Use Asset X with Contact Y via Engagement Z".4

#### **2.2.4 Admin Activities (UI: "Approval")**

* **Definition:** Governance operations. Approving changes to Data, Assets, or high-value Engagements.  
* **Conversion Trigger:** The activity converts when the Admin changes the object state from "Pending" to "Approved" (or "Rejected").  
* **Assignment:** Strictly routed to users with Role \= Senior or Role \= Admin via the Operations Department.5

### **2.3 The Physics of Time: Duration and Capacity**

A distinct architectural feature of Oblio is its rigorous tracking of time, which it equates to "Cost."

#### **2.3.1 The Three Durations**

Every Activity object tracks three specific temporal metrics 5:

1. **Default Duration (![][image9]):** The theoretical time a task *should* take (e.g., 5 minutes). Used for initial capacity planning.  
2. **Baseline Duration (![][image10]):** The statistical average of historical performance.  
3. **Actual Duration (![][image11]):** The precise scalar value measuring the human labor expended.

#### **2.3.2 The CRUD Window Mechanics**

To capture ![][image11] with high fidelity, Oblio enforces a specific UX pattern. Completing Activities happens in the **Sidebar**.9

* **The Rule:** End Users are expected to keep the Sidebar open while completing the Activity.  
* **The Measurement:** The system measures the delta between Sidebar.Open() and Sidebar.Submit().  
* **The Implication:** This converts "Labor" into a measurable data stream. The "Cost" of a specific Opportunity is calculated by summing the ![][image11] of all related Activities.

#### **2.3.3 Finite Capacity Constraints & Division of Labor**

The system uses these durations to enforce **Finite Capacity**. A human agent is modeled as a processor with a fixed throughput limit. The **Activity Capacity (![][image12])** is calculated as 1:

![][image13]  
Where ![][image14] is the total scheduled workable time and ![][image15] is the average activity duration.

Furthermore, the system uses a **Division of Labor Formula** to forecast the required staffing mix (Junior ![][image16] vs. Senior ![][image17]) to maintain flow without backpressure 1:

![][image18]  
Where ![][image19] are the durations for Senior/Junior activities and ![][image20] is the conversion rate of Junior activities. This prevents the system from assigning more "Activation" tasks than the workforce can physically execute.1

### **2.4 Qualifiers vs. Qualifications: The Logic of Activation**

If Activities are the engine, **Qualifiers** are the transmission. They determine if the energy expended by an Activity successfully translates into forward motion.6

* **Qualifiers (The Condition):** Boolean logic defined in the Opportunity Stage (e.g., "Budget is greater than $10k"). These act as the "objectives" for Activities.  
* **Qualifications (The Field):** The physical fields in the database (e.g., the Budget\_Amount integer field).5  
* **The "Activation" Logic:**  
  * An Activity is "Won" only if its related Qualifiers are TRUE.  
  * *Chain Reaction:* Activity Won ![][image21] Qualifier True ![][image21] Opportunity Won ![][image21] Next Opportunity Created.6

## ---

**Part III: The Ontological Core (Object Models)**

The Activity Engine operates upon a rigid ontology. This section details the data structures that Activities manipulate.

### **3.1 The Product Tensor**

The Product is the seed of the Oblio universe. It is not a flat record but a tensor bundle containing the rules for all downstream logic.1

* **Core Properties:** Pricing Logic, Type (B2B, B2C, etc.).  
* **The Feature-Solution Mapping (![][image22]):**  
  * **Features (Nouns):** Physical aspects (e.g., "4WD," "API Access").  
  * **Solutions (Verbs):** Functional benefits (e.g., "Off-road capability," "Automation").1  
  * **Relation:** A many-to-many map where ![][image23].  
* **Personas:** Defines the Audience (Decision Maker, End User, Influencer).

### **3.2 The Use Case Vector Space**

The intersection of the "How" (Solution) and the "Who" (Persona) creates the **Use Case**.7

![][image24]  
Where ![][image6] is the Solution and ![][image25] is the Persona dimension. Use Cases are the primary pivot point for **Asset Generation**.

### **3.3 The Customer Object Graph**

The recipients of Activities are modeled as specific vectors in the market space.

* **Contacts:** Individuals identified by a unique Email.  
* **Accounts:** Organizations identified by a unique URL. B2B Opportunities strictly require an Account.6  
* **End User Accounts (EUA):** The representation of the client company using Oblio.

### **3.4 Opportunity Types: The "Finite Logical Boundaries"**

Opportunities are not continuous; they are discrete states. The system defines a fixed sequence 3:

1. **MQL (Marketing Qualified Lead):** Persona Match \+ Contact Info.  
2. **SQL (Sales Qualified Lead):** Engagement \+ Intent confirmed.  
3. **FTP (First Time Purchase):** Transaction ![][image26]. The "Fixed Point" of value realization.  
4. **RTP (Retention Purchase):** Transaction ![][image27]. The recursive state.

## ---

**Part IV: The Stochastic Model and Attribution**

Oblio's "Physics" is mathematically formalized as an **Absorbing Markov Chain**. This model allows for the precise calculation of attribution, forecasting, and the "entropy" of customer relationships.

### **4.1 The Markov State Space**

The customer journey is modeled as a stochastic process ![][image28] over a finite state space ![][image29] 1:

![][image30]

#### **4.1.1 The Transition Matrix (![][image31])**

The dynamics are governed by the matrix ![][image31].

* **Recursive Loop:** The entry ![][image32] (RTP to RTP) represents the **Retention Loop**.  
* **Absorbing Barriers:** ![][image33] and ![][image34] are absorbing states (![][image35]).

### **4.2 The Fundamental Matrix & "Expected Effort"**

Oblio calculates the **Cost of Acquisition (CAC)** using the Fundamental Matrix ![][image36] for absorbing chains.

![][image37]

* **Interpretation:** ![][image38] represents the expected number of steps (Activities) required to reach absorption.

### **4.3 The Entropy of Lead Scoring (Algo 2\)**

Lead Health ![][image39] is a dynamic, decaying energetic state.1

![][image40]

* **Entropic Decay (![][image41]):** A lead's "Health" naturally decays.  
* **Activation Energy (![][image8]):** Engagement Activities act as "kicks" that inject energy back into the system.1

### **4.4 The "Value Gradient" and Duration**

The duration of a sales cycle (![][image42]) is inversely proportional to the "Value Gradient" ![][image43].1

![][image44]

* **Implication:** If the discrepancy between the Customer's Pain and the Product's Value is high (steep gradient), the deal closes quickly. If the gradient is shallow, time ![][image45].

### **4.5 Revenue Forecasting Integral**

Oblio uses an integral to forecast revenue ![][image46] based on capacity ![][image47] and the "Spread" ![][image6] (attribution distance) 1:

![][image48]  
Where ![][image49] is the Flux (Capacity), ![][image50] is the Efficiency (Conversion Rate), and ![][image51] is the Value Density (Price).

## ---

**Part V: Automation and Generative Logic**

Oblio is designed to be "Generative." It uses logic gates and context-free grammars to generate the system configuration.

### **5.1 The "Is Equal" Recursive Logic**

The system evaluates relations recursively.7

* **Campaign Logic:** If Product\_Type \+ Use\_Case matches an existing Campaign, relate it. Else, **Activate** "Create Campaign."  
* **Account Resolution:** If WorkHistory.URL matches an existing Account, relate it. Else, **Activate** "Create Account" or generate a Research Activity.

### **5.2 Algorithmic Asset Generation (Algo 3\)**

The system employs a combinatorial grammar to generate marketing Assets.1

![][image52]

* **Human-in-the-loop:** If the generator produces an Asset with NULL properties, it **activates** an Asset Activity for a human Creative User.

### **5.3 Workflows and Departmental Routing**

Workflows serve as the "operating instructions" for the Activity Engine. They are strictly hierarchical and routed by Department.5

* **Department Defaults:**  
  * **Marketing:** Defaults to Data, Engagement, and Creative Activities for MQLs.  
  * **Sales:** Defaults to Engagement Activities for all types *except* MQL.  
  * **Operations:** Defaults to Approval/Admin Activities.  
* **Workflow Structure:**  
  * **Step:** The atomic unit. A tuple of ![][image53].  
  * **Timeout Logic:** If a Contact does not respond (activate inbound) within a set duration, the workflow triggers the next Step automatically.4

## ---

**Part VI: User Experience Architecture**

The Oblio UX is not designed for "delight" but for **Data Integrity**.

### **6.1 The Sidebar Paradigm**

The central UX constraint is the **Sidebar**.9

* **Function:** All CRUD operations occur in a sidebar that expands from the right.  
* **Constraint:** The user must keep the sidebar open to record ![][image11] (Actual Duration).  
* **Purpose:** This enforces the link between "Time" and "Record."

### **6.2 Widget Hierarchy**

* **Dashboard Cards:** Show high-level performance metrics.  
* **Activity Tab:** A table view of the event log (Activities) capable of export for audit.9

### **6.3 The "Stupify" Philosophy**

The documentation outlines a three-step UX philosophy 2:

1. **SELECT:** Pick a Template.  
2. **SETUP:** Configure the specific constraints.  
3. **STUPIFY:** "Let Oblio automate everything."  
   This abstracts the complexity of the Markov models away from the End User.

## ---

**Part VII: System Recommendations & Implementation Strategy**

### **7.1 Architecture Recommendations**

1. **Database Design:** Use a Graph Database (e.g., Neo4j) to handle the Tensor nature of Products and Object Graphs.  
2. **Event Bus:** Implement a robust Event Bus (e.g., Kafka) to handle asynchronous "Activation" triggers (Qualifiers ![][image21] Won ![][image21] Next Opp).  
3. **Time Series Precision:** Ensure backend handles "Pause/Resume" states in the Activity Timer for accurate ![][image11] capture.

### **7.2 Scalability Considerations**

* **Pre-computation:** Pre-compute the Fundamental Matrix ![][image38] for large cohorts to avoid real-time calculation latency.  
* **Entropy Daemons:** Implement event-driven "Decay Daemons" to update Lead Health scores without database thrashing.

### **7.3 Conclusion**

The Oblio Business Operating System applies the laws of physics to commerce. By defining **Activities** as the fundamental unit of work ("Activators") and **Qualifiers** as the unit of progress, it creates a closed-loop system where economic outcomes can be simulated via the **Revenue Forecast Integral** and optimized via **Finite Capacity** constraints.

---

**Citations:** .1

#### **Works cited**

1. Formalizing Oblio's Marketing Model, [https://drive.google.com/open?id=1ZZO92TtnzFHhTrTPIxVHTWSJIcK9wEXtTpYjWu0yiU8](https://drive.google.com/open?id=1ZZO92TtnzFHhTrTPIxVHTWSJIcK9wEXtTpYjWu0yiU8)  
2. Oblio Documentation X.) Web Content, [https://drive.google.com/open?id=1bMzDhI\_oTJ3zA5jcMa9n22q-MeGBWj3MnEjigQ3gl2Y](https://drive.google.com/open?id=1bMzDhI_oTJ3zA5jcMa9n22q-MeGBWj3MnEjigQ3gl2Y)  
3. Oblio Documentation \- 6.) Primary Fields, [https://drive.google.com/open?id=1ievh0LBYtcYRcv2qvioJFtG6qGP3Kouh-cZVrdBx3UU](https://drive.google.com/open?id=1ievh0LBYtcYRcv2qvioJFtG6qGP3Kouh-cZVrdBx3UU)  
4. Oblio Documentation \- 5.) Objects, [https://drive.google.com/open?id=1S\_aGZPjBtEIzQ8yQvkgxSDtQPbO-vagv4vBpW7ZSQ8k](https://drive.google.com/open?id=1S_aGZPjBtEIzQ8yQvkgxSDtQPbO-vagv4vBpW7ZSQ8k)  
5. OBLIO Chat Dump, [https://drive.google.com/open?id=1VJz3pp2uAwyja9ZXEaYCZkAql2p5KkqkquugCQb2PXs](https://drive.google.com/open?id=1VJz3pp2uAwyja9ZXEaYCZkAql2p5KkqkquugCQb2PXs)  
6. Oblio Documentation \- 2.) UI & UX, [https://drive.google.com/open?id=15c4tM6c\_a\_wSTSQIDNCOlqEu8rt0voi1BgDnw3OpOfE](https://drive.google.com/open?id=15c4tM6c_a_wSTSQIDNCOlqEu8rt0voi1BgDnw3OpOfE)  
7. Oblio Documentation \- 7.) Logic & Functions, [https://drive.google.com/open?id=1YLPMYmwSig7w5475hYC9rGlo6LPYg3OjQ-vNmusvyMk](https://drive.google.com/open?id=1YLPMYmwSig7w5475hYC9rGlo6LPYg3OjQ-vNmusvyMk)  
8. Oblio Documentation \- 2.) Application Overview, [https://drive.google.com/open?id=1v4u-JA\_T0mJRkbptfgYW3lzJQasBluDcFyIIyarE0p4](https://drive.google.com/open?id=1v4u-JA_T0mJRkbptfgYW3lzJQasBluDcFyIIyarE0p4)  
9. Oblio Documentation \- 5.) UI & UX, [https://drive.google.com/open?id=15LZyOoefh7L0Clf3FnfkaKX2E3zNAKtVO8tt3QjjXqQ](https://drive.google.com/open?id=15LZyOoefh7L0Clf3FnfkaKX2E3zNAKtVO8tt3QjjXqQ)

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

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAZCAYAAADqrKTxAAAAo0lEQVR4XmNgGLJAAIh50AXxAREgvgrE/7FgosAaBohiaXQJfABmIwe6BD4A0vAPXRAfYGSAaHqAJo4XmDJANJWjS+AD6QwQp7mgS+ACsGDfykBCIICc9o2BDKeB/GODLgEDPxkgCtSgfHEgvg4VY4EpQgewJMIJ5WdA+SDDcIIeIP4BxBFAvAiI7wCxEwMknnACkCTIabOAuBGIWVGlR8EAAwDWdyMYQgrsywAAAABJRU5ErkJggg==>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAZCAYAAADqrKTxAAAA50lEQVR4XmNgGJKAEYjVgLgRiBcCcTFUnBuIxWCK0MEeIP4PxLsZIBqvAHEEEM8CYh4kdWDAD8SHgFgFXQIITjBADMIAGQw4JICgFYjfoguCwEMG3JomQTEGgGnSRJcAAgEg5kAXBIFgIP7LANEIwyB+J7IidAAK6nAGVE0wzIqkjiBYygDRVIQuATLFGl0QCkD+A4VaOTaJC+iCUCDJAAmgaHQJUFA+RxeEghgGiPNA/kUBBxhwSADBLSjGAHeAWAeIfzFAgnglED8A4n9ArABXhQb0oDQo7fkyQBImKGUrwBSMggEFAIkCMGOsXRlxAAAAAElFTkSuQmCC>

[image18]: <data:image/png;base64,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>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAAAZCAYAAACSP2gVAAAC7klEQVR4Xu2YT+hMURTHj/yJKIlIyJ9slJRsKcqCBQv5V+wsWFhZEAtsLCk/dlhQUrKwUbLgpyRJifwppcYCpSyt5M/5dOc15525984bM29+/fI+9a25582778y5555z34g0NDT8p6xSrfXGieKQ6k9FfWvfUzdHVTPNuB8fL7TvGRrfVSfNeJrqjuqrhJUs2KL6acZ1sUH12ozJJHycamz4SDDw0YKPB5xtYJ6r5pvxElVLdU/Kq7hY9c6M6+Ks6pYZk034aMFHAoSPFnzc6GwDsUa10tlOSHj4Vmdn/NTZ6uCVapEZv5C4j78l7uM8ZxsIJiRdLWwvAmS3F2xSXXa2YTNFNeZs56XsY6oEAD763zN0qDMEaCLYr5rrjQ62ED6e8hdGBcEhfUdNkRm9SJWAkZAqfh5q1w0JHWNcdal0tcxq1RdvjEAxvu+NEVoSfLQNJMYC1WPptP/rkr6HrbnLG2OwKkyWS9/1qo9mfFDyGXdVqm1ZgnPYGyPwrCrzFZCVHBNSzJGwyGRmT1LdwUILtsV6qYROk+KNhJrRq3i+l+5uFaPfEtCSEIAUR1QvVef8BU/q/OP5ofpgxrNU68zYwsM5m3ySfPvl2k5vjFC1BFj4fmpuuiZbi8MpmZZdRLKGlcltL3gm4aGfVRclPCTGMtVN6aQwgUqxTcpnnxRVSoCFH8z2ombGIDDTJfg2LsHXEjOkU8S8chPDHtUj1VsJBdFzRcLDi+6EMzHICuZIcVe6fbM+5uBI4M9VBftUp9ufyWCyPLeIlVjoxmyv2MTY/Y9J1TXOPnWd0Kmpqe1FbfTBziVET0i/B87GO5yv/hTt287Gd445WwEvpryQDgMOmb9Um6VTU7u2jYROzCJaCNJ2Z+sLjvUc79k2wNs1/wL4k+811Rln2yvdgSygvXtn/5XlqicSMvq4xP99YBc89EYJAdrhjf1AC54toZgy0QpJF+iqkDlVWns/UOt2S74TTxoo9IMGuaGhYXLyF6IRqtSOC6BnAAAAAElFTkSuQmCC>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAZCAYAAABzVH1EAAACaUlEQVR4Xu2WvWtVQRDFjySCwQRR00gSeAQbC22M2BgwYAIhxELFRiubWFgpaBUsxH/AwsLEQiQKYiEEG7UIpFCwsVAEsVAQhUBKiyh+nJPZzduMd6958D6a+4PD483cu3d2Z3Z2gYqKjnCeuk09oWYT+ww1kvwX26h9TnuDvWMcol5Sf6i31B1qibpEdVFfqeH4cOAI7PmcNJ7ebQuD1Oug2mbXOsqQgrrpHYE+ahn2/m7nG4O9e8PZW8IH2Md2eUdAE/1CnfSOwAFqlbrlHbBS09jvvKOZqI61UvqQVj1HL6zE9FuEMqUxNCHPOZjvqXc0k8PUd+oV8tkQcSI5XsCCVYml9FCL1Bo16nxNReWiAPwGbpS4sYWyrFKcpn5Tz+JDrSQGsNM7GiTtUqlqyTMtJV3JMvZQ270xoGxqDL/R1Rh+UcedPWWB+oF6HDp/itgPa/1ZtjqRN8iXnwLWGKecPZ4v15y9CJXgCW9MmMd/4tzqRB5S3d4YUMdS6/UdK3Yr3QbKUCP5RA04e4oO55/Ix7DeicpSqk72HPnrRu786IedG/r4MefzTKI8axdhZ9Fn/HvYbjAOq+OrKA72PuyakiNXVvHDau1q8VrJB5ueqKOM5spqCLaPYvvXuFk0gY+wgFZgF0VtwPfBV8Q91MsyVZr6qWDTQaibw+nEF9G++0bt8I7AHKzJaNzHsEUpRZc6lYlWX7feGvKTaIR4iz6K4vFiRovQYeoXKpe5tqOVVeO4EP4vwTa6RwfqI2fTPrrsbB1DzUPXoYPhv5rBlbp7g7vUdWc7i/Km0HZUYmeoCe+oqKhoPn8BH2qKlLgJkdIAAAAASUVORK5CYII=>

[image21]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAYCAYAAAAYl8YPAAAAX0lEQVR4XmNgGAWjgKpAAV2AEuABxPzoguQCkEFB6IKUgItALI8uSC7gBuLFQCyDLjENiGeRgRcA8S8g7mOgEOB0GTkA5LLt6ILkgisMVIoAFyAWRBckF7SiC4yC4QYA/C8RC4AA67MAAAAASUVORK5CYII=>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAYCAYAAADOMhxqAAAA5klEQVR4XmNgGHJAF4g10QXxgTVAHI0uiA8cBGJBdEFcgIOBRNOlgVgfXRAdSALxFCB+B8SvgfglEP8FYj5kRTDADMQ/gHgjEHMC8VYgZgRiVyC+BcTyCKUMDGVA/J8BohAEXID4GEKa4QkQP0fig63/icQvB+I5SPyHQPwVxgGFBsj0Vrg0A8N5IDZG4oPkr8I4PFABkKkwgBz+IGeiy4OdswPKZmFAhD/IL+8Z0DwMAiBP/wNibgZI+IPSjzBUbBWSOgwAcl4nEIsDMSuaHFYAcg4owRENbBggHiYa1AGxN7rgcAMA8ZwmXJ194MUAAAAASUVORK5CYII=>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHUAAAAZCAYAAAAPMmGdAAAEQUlEQVR4Xu2ZXahVRRTHl1RQFIUlfmDilTDIDxR88APxoRSCMMRQix70LYjyRVB6ifPSg6IiKooiRE9KKRiYCUac21NIqEQhCIGFIBQWiYUppevn2tOds86effbZd5/Dfdg/+HPPXjN779mzZmatmSvS0NDQ0DABWah6yRsHyFTVDKdpHTUmHs+JtfNxX5DgGdVXqsd8gYN6G1SXVadVS1WPROVXVNuj69KcVL3tjTXytFjD7pfURICOXaG6Ld3tQz+otoTKORxVXfBGB/3in4vORnVw8m/RdWlGVZO9sUbOqOZF139LvvO+Vm30xiHzhGqv6oDY6rFerK2rs3Kc/YLq38zOTHo+KwuwEp0Te1aKP1RXnW2S2DPvOft81THVo85eCDcMExp+0xsnCIfF2kcHw47setH/NQxmMY6h7B1X9mamFE+J3feRLxCzX3Q22sK7Fjh7kpnS3eBBMkWs4S1nHwSM7H7DCrM0nnlfiLUXR3jWipW9HtmWqP6S4lkV7vvGFxRwQ/WtN+bBMrJNtUx6B/S6WCm2vPB3GByX4g7uxY+SHyqAAXNdNSeyMWtT9QPMOOqgZ11ZCpKuW94YICbcUX0utuYzEpnea8TW+NljVbt4UuzhNIZlqV8Y7W3Vx9Kd/ebNhDpg0J73xj7gW32MgzfE4irZawz9Q87Qi62quzLm3LekM+v1hDDQBbORmNHKfrP0fheVc1NRfMX5LbGPiZecsixX/SNjHxJrT1SvTspuLVLQtp+cLcS4vOWTmZ2cUQ62SbFjT3UWd8CqkOtUUmM6NYD3Yyf+LBYPBgWZYm7DSvKK2Fahiphtf4ptI8pCbKW976qOiO0lueY7QiLloQ9RHszEQ6rFOfbg2JBle0Ic7gJjO7r2+1OWjUE6lfcTg6oybKe+KtYnrGa0nT0rW7OUQyHlVFaML1Unst+eT8XegfPyyHUqJyEY4zT6kli2FqCc5WMQEL95fsvZh8F01SfSn0Nhv9gkmCXlY37KqfvEvj+VtIWYWWmmxglOvPRuEos9eaMohqXiRSkerR7qHpQKG+ga+EDsu/olZOnxoC9DW/JXO2z0/4izBzh9IldJkUyUiKecdEC8h2N0EPhnZ9cpcA4jrkyiNKL6TGyEk8Lz/H47qA6+l2rvZZbSiUWnQnkwcPM6/5qYneQq3gcD76BP33P2mNRzHzrlZbEHkDT9rvpP7Hyx7MxbJ5YozPUFEQyYcDITtLujxnCgHf60pyy0uUr8Tx0+0L+shnGfoF9V70f1UnD40PbGGGbPTrGzzaqpfi8YfWwFflGtkvKDpk54Z79xFHAIHV7lvyOEL05+5viCDFbFXWJZ8GYp3pvG0J7CswG/P22olzIH+v3AgT5hr3BikASMemNDrZBkcUo3XkIeM+LsXXyoes0bG2plvCdZAfKXKmGgYUDgWM6eq8JZOw4tG3cbGhoaGgbPA1b/C87ntX3oAAAAAElFTkSuQmCC>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAArCAYAAADFV9TYAAACbklEQVR4Xu3cv+tNfxwH8LekiDJQKBQrgyKTfEsWhWyUxWZUDMrC4g9glJLBZpEsGJAsJmVSFomNDJQQr1fnfdzzeTu+3eFz6ebxqGfn5+d+ztmevd/ve0sBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4C/7XrOuvQAAwOJYEzkUWdVemNLK0hU2AAAW2X+Ru5Fl9Xh15ETkSX/DlA5EXrcnAQDmRZahve3JPyDL15HI0vZCtTvyqUzK2tCjyLP25IhdpZsGvR8511wDAJgLOdV4NHI9crKe2xr58vOOX22YIvm5/+dKZFvdfzu8MPC4bp+XSWlbX7qytiKyM7Klnm9lGfwWWRLZV7rp0I0L7gAAmBO36/ZzZHvdvxi5WfdnJQtUlq7MveZayrVqOY3Zy9K2OXK1dH/TuzzYH8rP799neT0GAJhba8vCQpMjXvsHx7Pwoky+uZnTlq0cpcsRtF6Ojn0tC8taypHBVj778H3y2Po1AGCunS7dGq9elp0clcoiN+bVFBkbNevtKZMpzhulK29jLtRtlrWcQk1PSzfKlrK8Ha/7Q2cjLwfHd0o3apjvBAAwl7IA9SNVOY2YhS3XfmXxmYX8/H792rGaMbcim8qkrPVyHVs+87XSPWfrcORB3c9imP8v1+U97G8AAJg3fal5EzkY+Rh5X8bL0GLIspX/613kfHOt9aGMP8elyI725ED+7EdOg+YatzOle5/81ikAADNwqnSFMqdac5tfQPjdT4EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/mh+ZTVb6mYEMwgAAAABJRU5ErkJggg==>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAZCAYAAAAIcL+IAAAA0klEQVR4Xu2SzwqBURDFj1CUnfInC2UnW/ECNpIn8A4WlvZewt7O1gt4BlZWSikbewpnmns1d5S1hVO/vvudOfebZvqAn1SG1EmP9F0tUZs8AzNX+9AQGmz4gtcCGiz4gteZPLwZVSVdkod+7ZSWgRHZkhopkjU0OLchWcGVdIw3gLaV51ty824N6CAbmEHkIMF9NIInoaStbF+CK+O1oBMnbWNwbDy7P7kkoBRMGzwGTzQhuViYkhu5kANpkh10E8sYipI2FZIN77LwMvQv+uu7XkOiJllUWY3HAAAAAElFTkSuQmCC>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAZCAYAAADTyxWqAAAA5UlEQVR4Xu2TMQrCQBBFpxCxVKxEG+3sLS3tLS1sBA8heggrD+ABbL2ChQewVhAEwRMI6v/EyGSyrmERtMiDV+Qn+WR2NyI5oYzhPaNnOI9ec3OBU3VdgCt4gi2VkyscmizBFlbVdR3u4RqWVE52sGuyF23YNNlEopF6JicbWLFhDF/gWBqOyDI7IllI+nkvXBeWfQUW3WwYAhefZVx8HyNYtqGFa8iymb3xZACX8ABryVtpuJMc0bWTpA87kqHMd74sH8v4NfyqdyNqnGVFSf9/sfzNeKhdOMtC+d+yI2zYMOeHPABqFjb8fafqPwAAAABJRU5ErkJggg==>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAYCAYAAADtaU2/AAABHElEQVR4Xu2TMUuCURSGj6iQiK0iteQmBCIOLS5JLk6NDU36AxQaInH1Dwj+i9YWf4A0trg7CEHg6CRY78ttuLx+5od+X4s+8Az3HOXlnO9esxPHQht+h/Tr9z+RsIAv3jkFX+EnLHr1W7jyzgeRgY9Sq5kLGEi9DKdS25sSvJLas7m13kmd54nUImVmLvhM6rHDNTP4X+GUDJ1rI24uzAW/aWNPKlrYBi/W2jYvFknAnBa3cAObcKmNILhmTso1X0qP8H13YR0mpRdE1UIGc0pO29NGAHz/H7ClDY+dwQV4Dcfmvu8I3sM8THu/U9h7gH14Lj2yM/hQuPYGfJJ6rMEMfTc3tRJ5cBZ2zK35r08RWTCf0tDC3egTR84PxJc0mSKpquYAAAAASUVORK5CYII=>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAABPElEQVR4Xu2UsWoCURBFJ4ggWoixDUhKv0CESJoU2gVS2UiwSZO0EawknYWd6QIp/QLBwg8I5ANsbATBztRpYu7luTg7sYk7hYUHDu7OLDvPefNW5EQC0vDcBhVZGziEBtzsMcLGaUbl/0UVfsMPmFfxGvyC9yp2MHwxC/zAuoqv4TM8U7FEXEpoxxJewE8Je+YKVxv1fQrf4mk/2DIWubYJTwYSigzFcR80d7AioQALPcTTybmBq+01x5lFJru0DyzAf0I4zizCc+NCCc7k76hyjFmIY21JwavtL/ftFpZjTxh4Ft5tUHb78mgT4Am+wB58hS04FzMoUc+1+lPS2ZOnEU0Jh7Uv4cX8lo1hTj3jAgeFEraU7XXFrnwk4RC3xfEQs1V65QvYlfAZ0m1PBKeqoO65L0V1f+II+QV2rUJBm9EEWwAAAABJRU5ErkJggg==>

[image29]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAXCAYAAAA7kX6CAAAAw0lEQVR4XmNgGHKAFYjFgViSABYGYkaoHjD4TyS+CsQiUD1gEAzEf6HYFVkCCUgA8VcgNkYWBDl1FgPE1FvIEmgAZLAnuiAIvGeAaC5Gl4CCOUBcji4IAmUMEI0gA8zQ5EAAZFsyuiAMyDMgAgMlBIkBIL+ANKqiSxACvQwQzSQBkN9AIQwKaXRQBcSt6IIgAPIfKDqwaQKBNQxYQpWbAaIJpBkXADnfBVkAlgCwRQEIMANxEgOWlAMLRUIYI62OAmoCABoiM2TH+gxMAAAAAElFTkSuQmCC>

[image30]: <data:image/png;base64,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>

[image31]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAAvklEQVR4XmNgGDZAAIglsWCCoBWI/xPANUDMB9OADXxjgCisQpcAgvcMEDkWdAkYAEn+A2IXdAkgeMgAkRdHlwABQQaI5FYg5kCTAwGQoSB5fnQJENBnwO1kRgaE37GCOUD8BIhl0MT1gPg6EK9gwGEryMmngfg1EM8H4llQvJABYhvIv8xw1WggmgGiKAhdghgAsg2kWRNdghgAcjJIMy+6BDEAb0jiA7BoeIsugQ+AEj3MRmRchKxoFIxcAADlATHfoDcDkwAAAABJRU5ErkJggg==>

[image32]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAZCAYAAAArK+5dAAABNElEQVR4Xu2TMS9EQRSFj8QmxIpIJAoSWqUCkSg0+wtQ+QGUopH1G2g2EqJRqf0BnVJL4w9sRUdBhHNyZ7J375vdYnXyTvIl7507mXPnvnlArVq1siZJizTS+wTZJlN5wV91QcbID+mSxeTfke+8aFTNkU0yDgu4d7WT5Kk2sjQOaYu8khVXu4UFzDpPOiKHwZNmyE00sw7IA5l23iMsIH6Ld9jpotqwWkWav7rtBF+LFeClLuWVAt4wIGCNfKB/PLpZ2ujSeRvkDNUTqMHj5BUDNB5t5gN2yAtZct41WUY1YJ2cJ68Y8AwLeIId8xPVcWmT/J/4AHW/l54HBnzBbpA2mEfvZmU1yZV79wGr6AUXA/L9jx0PUxxRVjFgARawHwtDpAtxGk2Yp1qfdh36q2v9M/0CaXc/yymL8xAAAAAASUVORK5CYII=>

[image33]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAZCAYAAACo79dmAAAB1klEQVR4Xu2WzytEURTHj/yIKEQkSZSFKAt2KIqFhZINhS2lWJCU/8DOjqRkZ6EoKWUzS7GWlcKCNaVEfny/nXuaO3deUjP0puZbn3rve+/0vu/cc+8bkbzy+rWWwXNoxlUP4Cs046h+0aCxD1sBEuBdciDsFZgAd6JhC1KH4yMGOwZl4EY0LCsdOzEgg1olE6JhG2xCnDQu2gKmPdGwrZ4XC7GaF6BNtJJkXTRsnzfPNCjJ0+INnIGalBl/qA5JPjxk1Jvnawd8hmYGqgMzoRmqGOyCosBnSIadC3zTJbgNzQw05PhR56Kf1lDd4EW0glHii6yGZqABMBaakuoXgmbRVmoBVc5PEydeg/pwQJJhudGixI9GVD9TXK0VMAumRIthp0wPmAeTYBg0gUPRltp2v0kR+yPsTVMJOIoY94O1gwNJbx2GpD7AtOdb73Pj8mPTBapBuRtfA4/uOutitZYCj5XrBKWiD/aPPAtrZznveYqYThxZFyvCzdXoeawol5BiS/mtw5NmQ/RlXsGi8/nCte6aKzEi+gdqwXlZkfWytQCXlkHv3T39U9Eqcpn3QaUbewK9ontlS5J9bCuxKbrZ/lUMwY8EQ0X51tsm3nMf5ZVXzusbR7NdRjzsBkQAAAAASUVORK5CYII=>

[image34]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAZCAYAAABkdu2NAAACc0lEQVR4Xu2XT4iNURjGH2Eif4ZGpMhQs8DCYmajZqz8WYgkhcTCgoVmM5RSUzNNFjJKkywkslKyICkLiyklUXYopSixsFDKFGI8T+95m/ee+12bubndr++pX/ec95zv3vN+75/vu0ClSqXQafItN5ZJn8h0biyLBmDOldLBxWSS/EJJHXxFDpIPMAfn1C63t+TMA7KQvIM5qIiWQnJKznnEJmEOrvYN7a79sPR03YI5uCHY2laK2nPSA4uYuABzsD/si1pKJmCRHiUvyW5yOa1vgtWxUn1VsrVMmzHzWMjZE/ZFfSH3w7yLPIVlgmsJuUvmBdt/13xyE/WHkGNy8GRml+TENdi1Udq7Mcw1PhvmLdEz2GtZrl7ynVzP7HfIn8zmyqOtFO4mfWRt7RK2kS1hvpzMTWOViDJCpaPvVDlIWte59NlN9qVxQ2nxDYprxB1Us4n6QV5kNteCMPYXhkfkBOy7dqS1TnKGvE5z6SvZStaQG7DavUoukidpzyDsmhEyRo6RSyh4Vq9Efa25Osi9gnVvNhofSeN/aS/sZrg+kyFYKQyTQ2QqrS3CTK1qTRHUfnXwo7AMEIfJR1gDlHRDH8Oub5oaNR6lW0x1pef7MJezsSPfhpWHJEdirergD9Nnrp9kexqvJ+fDWlP0m1zJjdQ4apuOIuCH1kFGYC8Tyh5JKes3SodUap5KczngTkTFiCnauklK9+Nx02yl7ql6cSn/d8F+KCpGTI5orH8pXi/6r6luvI68hTnuz9BzKH7B0E3wiCmN9ZzVdXkjbIp2kgMoTiMpf4ddgfqOtyzYNHbl17q0NzYUjRv9fqVKlVqkvxIYdE7AGaBbAAAAAElFTkSuQmCC>

[image35]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAYCAYAAACvKj4oAAABjElEQVR4Xu2WzSsFURjGX0kpHxHRjdhIWVsoWVhQNuqGhVK2/gALK2VvJzYWykLZ2Skp2VtZSN2lxEpKKN+ep/dM973jNjMXmcH51a/beWem5plzznuuiMfj8XwPNbAvXPztbMNb+Azf4Hjp5b9DP7yT/xxwDx7AY9gFb+AufISz5r6sEhtwFVaJruNL2OnqO/AluOmL1MNcBbboY4mIDDgCm2GraMAZc23B1RpMLYtEBqx1v0PwSkpb7ZZoQH4AwlnOu9+AOthrxmkQGZDwhRlmJVTnQwwYwLNm2IwJZ571NIkNyJc8gROhOsM9hGqfZR6eVeC+PpaI2IBzomHs8pyEBdjtxgy/JtppCWdtER65cZrEBgz22rroiw/Ca9jjrrfBDdGmc+Fqo7ARHsJqV/tpmkQ7/jJ8hZuiW4gd2PYJeRJtMAzXLsXGE+YeTpvxEjw348zC2Uuy1E5FP0AA9y3P0EzTIR/Pv3KMiR4lA1Kcfn4ULgcu18wyZWQ3jYLX7X7jvxPuA4/H4ynLO+HIUTsc96taAAAAAElFTkSuQmCC>

[image36]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH4AAAAZCAYAAAD30ppqAAADyElEQVR4Xu2a36tMURTHl/yIEEok6V5CiZKkm+JFFA8kSeQP4MEDCbl5uOVd8ih1USJ5VYqHefAgihdSeEB+PEhKKOTH+tx9drNntc+cMzN3zpnmnk99u3PWPjNn71l7r73WnitSUVHRd0xW7bPGiv5lhmqn6r3qu2mLMl21KBAzJoTrBcZWJnNU91RTbYO4vlo719OMrUgGVcdVb8X1e0lDa53nqpPW2AanJKfjL6j+BTrS2CxrVV+TNi8GUBYXVQ+tMeGgNPbTi5VQNJNUW8Q9/65qr+pMcn0zuM8zpPpkjW2Q2/Gel6oHqr+q7aYNauI+tEyIPHfEhbU05qkeJeJ1GSwX5+ARYwfG8FR1XtzkCFmtuqSaYuyt0LLjb6t2i+vwddMGr1SbrLFg9idqho9QfIFlMKB6IS4y2W3Hg3O+qNYYOxMhZp8rjdtxqFnBfdCS4+ertiavfXi03JLOZmKnrBc3oKw+4HD6v8o2FACO49l/bIOBsXBfbHJ+FBd526Ulx7OSFyevCfl0amG9eSwBPBRclwHPj01ICyGe+8oI896hbEfN8PddsQ3i8iciVrvkdjwriNXsIcwQbsK9lGhAVMiDrRKyxJ5nK4kYfCE/rDFCWsTqNktV71Svpb6I0vCTmMTaguPa6f9M1Q2pj/+D6lzDHQYcGmbJTAT2+J+qjYltOLHnYZe40iWvHqtWjr2zOc8k30pg0J+tsQB2iHt21pbIdjAq7l6qEIuvTLoOsy9c8UCtzMOZwcvEJXZl8yZRM3wIja2kGIyTJCyPjkl6sgaEbZ6dVTpSMVE5sbhiE4T3F+J4nB4r03zIIMw/MW1lkMfxfrXEVlKM8XS8Pw/JcjwO577NtiGhMMdzYuQz+hBWOx24rLrW2FQKeRxPlsx2QElXNH5vznI8iRf3xVY7FOZ46ncSMosvn0ioNpi2ZnQruatJ82y17PqdKohFNCpuH98jrj8kykfFjfG0uBp/IHlPjHaTu5Ygax+2xgSf5JFU5c3ou4mvz9NoNcx3g8PiHL1OdV+1QtyEYHGNiOtf1vlC1jg7ghnHh4div7NgK7t+96Qd4HDYYceSNp4iOKH6Ja6vV8XlR/RnSOpHtLOTvzE4wKlZ40QGR+Jk6uVeh5qaZI+k8IC4QyUPE/dscG1hksSS7QlNnh9peg3O0muqb+LOLTjO3RbeEMCPNLEfbyqU35L+xfUirHBKZr8FEQViZSHOxumDxl6RQMjn+Db25fUqOJXf45sldlQE4/GPGH0Nzue/WvoFcgKcnqesraioqKioSOM/TBzulPLmI/EAAAAASUVORK5CYII=>

[image37]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAArCAYAAADFV9TYAAAEPElEQVR4Xu3dz6ttYxgH8Fco8isRCYNbYqIMlAkjUQwYMBJzBkoxEGUg+QeklKQMJMpIYmCwjPwqSnR169YhkgEmKMmP9bTWa7/7uWvvwznrnHP37vOpp73Ws/duv2fvwf32vu9atxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALbWrX19M1G3tS8CAODovDE+XtzXznh8fl9XjccAAFvjlb7+7uvX/MQurijD+7rUPyzXjo/39/X4eHxJX2eMx/vxYW4cgo/LPGMHADbIX2UIVKuqisBWA092exle+1FfL/b1S19n9/VJ85quOT4KMZYrc3MffsqN3ttl8b3d0fTvbPrtd7pXP+QGALD9Isy04aqKMFetCmyxH+zN1IsZoAgmMatVdc3xUZgjKFUPleVA1oq/+au+fk79mGm8O/X2KgLy1G8BAGyxHK6qz5vjqcB2oq/3Uq/6ugz7xqquOT5s7f61ObRBNosly2Nl+E4vb/oP9nVec75fcwZQAOA0F2Em/vGv4SpCxi3j8ZPjY8iB7Z4yvO+spteKwNbq0vlBiFAUS7JP93Xm2Pu0LJYij4+9/bi0r29zs9GNj7HX792m/1lz3HqgDGN+rK+r03PrnCzLgRAA2GIxsxZhJkJD1KoQlgPb72V6GXWVLjcal5VhyXC3WiWu+Ixxvzqez7VXbErsR6ufk0XorcuesWQaY6gXCMT+ttZFZXnMT4znL/z7ivXi97grNwGA7ZT3r+W9V1UObBEuYkbrv+pyY0bfl2E854zn75RhZm0v7u3r5txsxHeQl4arCL9xy5AqxvRwGWbl8n3fvizD8+3rnx171SN9PdWct9aNAwDYMhEQYnmzem18vH6sqg1sMQMX77tx8fSSCCft/rXQpfM5zTmjFjOH65Yb1wWl2L/Wer4sgm0Nk1Udc76hb1R4qSxmOtul1WrdOACALZL3r7V20vnUDNvUhQohZo+yLjcacT+zHFqmapU/yjCeqaXcuUX4ei43R106P7cM44rxZbEPLp67ID8xai9smAqjMRv3aG4CANsnwsdUGIhwFkt5udcGtri1xZ/NefV+mb6xa5cbM4plzPg7nml6MbapcezXDWX6b4kZuXamsoowmvevhWvKMOaYSavi3nX192h/l6nfKK7OXTXDCQBsgbiCsi7JraosB7ZwXxleG1eExi1APlh+ekmXGzO7rgwhLcbzW5n3FhqtCIF5xiyWUev3VpeUq2Pl1P1r1YV9fVcW740l1Xp1626BLcZwEIEUANhgU4Ht/+hyY4MdL8NVngdppzn+sTkOcaHCF6kHACCwNeL/In0rN2cWgfD1vl4up/5H9fHZBx0YAYANFIEt9oitunpylVjii3uodam/6WLf3E25eQjiM+OzAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA09A8QAeAN2dWZXQAAAABJRU5ErkJggg==>

[image38]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAYCAYAAAD3Va0xAAABBUlEQVR4XmNgGDGAA4glkTAzqjSYL4YmhhVMAuL/SDgHVZpBH4g/QeVgeA+KCjRwG4hPAPE/IPZAkwOBA0Bcji6IDlgYIIr4GSA2vkeVBoPrQCyOLogORIDYBcqGOR8drGGAWIgXpDMgFDUwQAyKgMsyMMgAsQ0SHysAGQCyDQZ0GCBe2wHEnFAxkGtBrsYLQDZdRRMDBTbIVVMYIMljK6o0dgDyFrKLQAAW6E+AWAmI76BKYweg2IAFNDIAGQIybAEQL0WVwg5A3pJGF2SAeAtkEChdgVyNF4ACswpdEApAkbCcAWIRzoAG5Z9QIN4FxI+AOB4qhg5AgQ7yFiO6xCgYBdQCAJCJLoFnQiXRAAAAAElFTkSuQmCC>

[image39]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAYCAYAAACIhL/AAAAB8UlEQVR4Xu2WTyuEURTGH6EIUaSwouwsWFBkycKCjfz5BhZs5QPIF7BRdhayURZSFhbiK1BSipWslKKkcB7n3pl3jvO+g5nZ4FdPzZznzr3n3nPP+w7wzx+jTtRigz9gSHRrgxlw7LQNeqyL3hy1Bd/GqaPgJbkUrdpgBnOiOxvM4gW6uMcU1FuwRmBctGSDAW70XDRhDejvVmzQowaagFeiRtExdJF4qkn6RPfQOTyYAOfmPB705m3QwoU58MAaQg808W1RlfFITCCNXWT7rNyODVpYulfRmDWENegCg9YIXIlubBCf7y31WDBC4X324jlYGu6SCe6JNo14epzcKy95EJ3aoNARxN/S5+f2ghHKFrJPGKPQY+ZJecTdp0GPi3h0QX2vQSLFrshHeTnAKy+h92SDCbIS5OZZAd7jNIomyO7kgAZrQCemxwZJIy3BeHXSKhMpmmApzz/Cu+t1P8t7DZ2DVItac26e2IQupTz/ImldPAmduyl8P0E+2SRuF/N5xnfnInSSC1EvNCnulN22LHoO3iz0ne3B0/PuKBsjJsjrsyGqLRihcIM8hIoxDN2I9ybhQYwg/S1CuAnvZMtGvehQ1G2NL8DEz+A/H8sKS/fdhbixfVGzNSpFxf4PlpN+0YANOnSKZuD/+fjn9/MOr859l2v9Kl8AAAAASUVORK5CYII=>

[image40]: <data:image/png;base64,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>

[image41]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAZCAYAAACFHfjcAAACsUlEQVR4Xu2Yz8tNQRjHH6GIkh+RJPmxUYqQIkqhSCQslD+AhSxYqHdlY2clWcjGQjZ2IsriZqWsbUhdEkVSokh+PB9zxjn3e2fOvd333Hh1PvVd3Od75tyZZ+aZmXvNWlpaxsgi1yHXPDUyzC00Wa66Hmgww0wLzw7bx5FY67rt+uk6K16KOxaeVc2ykCCNo2u/W5ZMc71yrZF4HQ8tJG/sfLXQ6WGJg0xxzvXDtVsNZ7aFxC9Ro+CEhffOkXhst1zijfPIypkdBp79qEFnhuuW641rlXiw1ULSc9A2l+CDrlMabJp1rg823BdRTnT2khrOdtc314QaBV3XYw1WoC1JTEGSSSLJHBssvXuujg3eDA9bSMRxNSyUBV6qLICSuaHBCrSlHznwz2iwaVZa+KILalSYb2FGmRkGxAZW1WerLzE8ElmFzXOpa6OVCeZzakJ4f0eDTcPSoyNP1KhAWbx3fXK9TKhuEyU5ePvUKKCscntLBP+5BmGX9c9KTleKNik2WBjIawudZZZSsC/gkxAlJpKjMQUzzIxuUsPKTbZuNcKLQn00lYh3Fi4tly0MZlmv/QfKAp8SUTgS8bhrpKhLBN/XtXAy1JFNRBNscz11rXDttbChHet5ooSyyC19ljbehBoFdYmIp01dWcDYEsGRiaqct3ytMtBR7g8R2h/QoPXfH+5aejLGslnud313HZE4M0an9E5BORBP3QPi0qYscicG0J4jVulYbyLuW/rU4JnrGpwMvIyX8oMmBV68AXKB4XNVJHCnhdlVD6U2U+haOpGbLexTb13PxIuw6nKlNTILXVs0WGG966gGG+Cm5a/YrKTVrulqFLDqOpZeKVOOQT+6csR2i9WYyuxwndTgAPa4vmjwf4B7zT/1x8zfgsFdtLABDuK0a4EGW1paavkFT9+6LisZyagAAAAASUVORK5CYII=>

[image42]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAaCAYAAAB7GkaWAAAAiUlEQVR4XmNgGOSAEYjDgJgVXQIEooF4DxBzo0uAdM0H4lZ0CRDQBOK3QKyELAgy6j8WzAOS5ABiSQaIkSBBEBuE4QBmJAhjAD8GiK7T6BIgAHI+SBJkPwZ4DsRfgdgYyge5Aw5AutYAMQsQmwHxRXTJpQyQgADZG4wsuR2I/wLxUyCOgCoaMQAA4aob4lcTC3EAAAAASUVORK5CYII=>

[image43]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAYCAYAAACbU/80AAABd0lEQVR4Xu2UsStHURTHvwopv5IUKQqrSTIaDTZZGPwBBrsMv1Imu9GKkj9AMrDJTEpZpExSBmXB+b7zbo7zu+/97vtNv+F96tt795x7zr3v3HMfUNMljHegkSxSGTDvZFDUZ8Y90Pl8kn789+OnA51nkYr3fYoWjH9G9OrmLBs/dnPjsWgCrV9rNSm6EQ0x0DAPzXHk7AF+/SVa4zLo3IMm2HI+S5gXSzIMjX/yDqEhusDfEUSZhSa48w7DtOjZG3N47ox/8Q5hQ3TvjTHeoUlsg1m4+KY3GsL5WnpFp3BNV8QBNAF3HIPVGfVGQ2wDS9DqJsHdHkKTrDvftmjM2TzsfruBHdGtGScRupmdHuDCD2ZcxBs0NvwXeGSsQGW+oInYvYSLswLtuILG8bquiaasswon0ESr+fgRev/bcQaNW0FaxQphx7Jzv0XX0OuXAqvEDfA2zTlfZRYR7+oyWDHOZ/OV/nRS+RA1vbEEnv2+N9bU1HQ1v7kEWDDap1B2AAAAAElFTkSuQmCC>

[image44]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA6CAYAAAAN3QXmAAAFkklEQVR4Xu3dT6htUxwH8CUUIR4iUk9meoOXXpKi3gAxQGHGnAwpwkSMzCSlRDJSMhP5l5SJGDAgRQphIpRQKOyvfVZ33/X2Offe894959x7Pp/61dlrnXv3fecM3re1159SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYiC+6OtjVx23HCji1q7e6erDtAABYFzd29VlXR7r6t6sDm7uX6qquDnX1TRHYAIA19lNX17WNK0ZgAwDW1mmlH1U7pe1YMQIbALC2bunqn7ZxBQlsAMDaen9Sq05gAwDWVh6H3tc2riCBDQBYS2eVPrBd1nasIIENAFhLN5U+sJ3UdqyQM7s62tWfpd+L7ZKuLhi+AQBgP3ut9IGN41c/y3faDgBgf8imtRntWrS/u/qubWRuX5V+1S0AsA9lZCaP/hYpj0Fz3xfbDuaWzzPzAgGAfebCspx90C4vfcBYxsjefpKNh28o/fdYHy/fMagcrXXu4Pro5D0AwB5xUVdPlH4ftLw+eXP3/zISlr6taqcjdA+XPmCc33awbR+V/kivOlpZ97PL9/HupO1w6Q+vTyjP6/Mm7wEA9pCvy3JGuTJvzoKD+T3e1eeD63yetw2u45fSf8aZ23Z70wcA7CHLmL8Wue+vbeMMb5f+Z9a5Xi8bcp3RteF1O3+tjrxlSxIAYI/Kgev5D30Zct+MCjGffH7ZEy6mfY81sKUONn0AwB5xTVc/TV7f2NXZg75qN+awZd5aQkTmsTGfYUCr32OC252D9jwSTVCrj0Yzlw0A2GMydy0T1c/o6pmmbzfVEw6yUpT5/NDVpaVfAfp16b/HHJ2V0PZtV7919dfkvfeWjZG29AEAe8zFZWejYydC9l5LeJjnSKqEy6Nt4wJk9PH+tvEEyb/pgbZxInP3pskRWdnWI7L60wgaAHDC5CD1nHIwj4TLmwfXL5WN0aNZ9fTk/VnoMGwfhsZhe0JUlSD04eB6N2S/tLGVnJ+0DQAAi5BAlLMv59EGtjrh/rFy7Ly6WglbeV+VEb4/BtfVoTIemj7t6vS28Tg91dVzTduPZfPfGQIbALBwdeXivHu/tYEtXi7TT2vI6FhG4YYyMT9/Q2tsfleC2m6cd/p7V0eatpwD+mjTJrABAAt3WenDUrtn2HaNBbaEqvzO65v2SFhr53YlKLWB7aEyvkr27rJ5NWvulbBZj3rK64yK1etbN946U3v/yGPYdm86gQ0AWLgEoLGwsl1jgS3eKMduEJsg9WrTFvXczQOT64SwJze6N3mnqysH1zm+K5P9Hyn977in9KOG33d1V+l/9yz52YS8jLDlcW1dNFC1n43ABgAsXLafyBmY85oW2NKesHP1oC1zxMbmntXHsvWR5JeDvlYWSCRYjUmYy+95s6tnm75ZXijHzl+rBDYAYOky1yxzteY1LbDFB2VjlC2hLKNu0yQY5ezNa7u6oukbmhXYom5Ku5MtSsbmr1UCGwCwVHVFZ/sYcCdmBbbMQasjZ3nEOWt/uWwr8nzpQ94sOT5r2ga/B0sfvnLPBLftqKN7NeC1n4XABgAsVY5Q2m6wmWZWYIts4ZEQtVUQy8hZwlG7jUYrjy7H7lfDYYJXglte5xFplS1C0tYuZMhoXd1S5PFy7P0FNgBg4eq5oYdLH6JyZunx2CqwZVL/WFBqZR+4LBLYSkbrXhlcJ3DVsJfK31NXndaK3D+Pf8f+1hwZ9XPZOLy9ygra95o2gQ0AWIjPSx9OxvY526mtAttuaEe9tiurUKfNVRvzQulH5oYENgBgYc5pG+a0jMCWkbixPd62Musc0FYerX7VNhaBDQDYg5YR2CLz09oNeLcyPI90KxmFHFtpKrABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAK+Q+VMTtZFqscgQAAAABJRU5ErkJggg==>

[image45]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAZCAYAAABkdu2NAAAByElEQVR4Xu2WzStEYRTGH6GIkshXvmJFdorIwoYdC/wR1hZsZ2NhQbJRsrMkWyUl7FhIsZmllCxkp1A4z5w7zXvPzFxz647F9P7qae59zr13zpn33PMO4PF4PP/Ig+jHmpXEl+jZmpVCDXT11m0gAS5Ezdb8b9pF36JZG0iAa9GENUukSjQXiMeFqBYNiqZFdeGQGp2iDdEV9MI26E1J0S26tWYJpEX3oiXRDrTDqKYgzs9D0a6oJ/D4XXui2uA8A9vzCOVpzyyLojFrRsAE90X1jncDLfAEWtyZ6BP5K8v4gmtMQQfMgGtGkIL+SnF1B01wHPlJWVasEdCH3Epuo/BzWkXnrrEGvaHRNSNIIT/5UhSnQK5eMT6gz5m0gQDWceoabM9y738s6Ek0YwNF4DtXjE1ovmnoilryCmR7vjrnl8i9yEnQD/0TEYdR6GS3MK836ODJtqodiMswLcqLOEFJi2jeiSVBCtEtVwgOvlWEW7lBdAAdWOQRmvsWwsPoBWbIcMxyD3yHbhdJw32QL35cOkTHyK0Up+Nw6AotjHlnr+GxXdHMr9SF0odMXIbw91CJgtvLiDUdWBD38l6Y/c/j8Xg8ngh+AS6bXbZ5k5/BAAAAAElFTkSuQmCC>

[image46]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAACKklEQVR4Xu2WTyhnURTHj6LIlFAkIzVqJAsas5lix8KChQ3F3qRZWVCkbCQ1KzWbaUoWdnZCykK2tspiNqOUMluUFM53zju/3/XtvvdofrMY+dS3Xufc++695899T+SVF0SFqlHVRHoKmPtdVcOOFDB2n40x5lT3GVpTtRdGFylTzajO2JEBNn8odpgncS22CWZFzN5H9i3ViViUY0yKRaWa7FWqn6oWskfBwndsVIbEfKtkv1Etks0pV22qltiRgPd9YSNTKzZwmx1iL4cPJ3eaVUdi82L0qm5V79iRgHfiUJl0iS2M+mJ+i/nqA1u/akOsrmJMi81BqmK4P5MfYgX7VordOKU6FasprguMHyEbwMbRuedii6Z1co/qSvWGHQ5SgFSEHef1NR+McyrF0jzIjgCkDhtLA2mFP61JZFxsE0hJyFpiD9MGcLoDsdPGQJFjXlqRA0QPWYhF8Q++OFIX4vcXL563KTQB5g2zIyB3U546pCXEu66D7HmbQuchNWmdB3I35fXDwAZfrO3Xxe4vxu8nv9PQfTtFd4HMQkdLY+HYp8IL3iciop3JM1p6NnkO8Sh6Z06o9greImgSvPsRCJsvGmosGPM1sS0nag18WZfnR9Wl6kLVTT4H0USkng2i+F7sy75APqQJN/InsjsfVG1sDPglFtGSk/dBTgN1dqxqYEcpwF8D/iw+syOHAdUoG0vJP/vJ+1uwsW9idZbHrqqOja/89zwAdY994lrVmaUAAAAASUVORK5CYII=>

[image47]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAXCAYAAAA7kX6CAAAAvElEQVR4XmNgGLKAF4gZ0QWBgAuImdEFkcEBIP6PBT8EYkmEMtzAlwGioRxdghAgSaMEA0TxeSBOgrKbgdgDiP8B8XGEUgQwAOJHQDwHiDkZMG0sg/K9oXw4gAUCD5SPrhEEFmIRI0pjPVQMZAAcgPwAEgTFIwhg0wizMR1JjEEeiK8A8T4gFmLA1NgP5ZtA+SiAG4h/AfErIC5hgCicBMRZUPZ0hFLcAN1GogHJGg8wIEIYGROdVkcBJQAAfl88g2vPM2YAAAAASUVORK5CYII=>

[image48]: <data:image/png;base64,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>

[image49]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAYCAYAAACIhL/AAAAB8klEQVR4Xu2WSytFURiGP6Fck5S7lKSUP0CGlAkDlxibkCFiquQPiJRMjEzMZCKDkwkxQJEJRYkYGGFA4X1be529+87a+9xkgKeeOvtd65z9nXXbW+SfP0YpzNEhKIK5OgyQD1dhmW5IkXs4oEMXMfjp8AbW+N0SmIG3OkyDYfigwyh6xRQ2qxscFMILWKUb0qRbUrhfA5yCT2IKfIMnsEXcU89sCbbrhgzhPUd0aKkW0+EYjnqf52EP/ID7ftc4dfAalqs8U97hhg7JoZiCmrxrPcUs4AjewWYvI5Ni+rng6HLq9Xq2nvpd4+zCFx0S+6US71oXSNYd2ZqXueCu1EUF5dLQ2HskwClkA48ZElXgWCCLifsf74nZmZYDuBC4DoP3cxa4I6ahzbvWBXKHcrpovZeRmLgL1LBPvw4dhBZIisXs2kc4LabjIpzwPq/4XePEJHmBBfBKUjuGIgsk/DHu2ksxHZ/hJqwIdgqwLWZ5RNEqZvFzAJLBZRBZoEVPcRhRu5jkiTk2gus2itBdbOFINYq/Ibg2B2GluJ/FXWJG0HWIE3tOdqo8DC6Fcx1mgx2hsCcJ/1SHDiPgoPTpMFu4Zud0mAE8g8/EzNa38wrHdZgGfOHYksxf15LyY++D2cAil8Wsy3SohUMSvtH++d18AbZcfSCNXJk4AAAAAElFTkSuQmCC>

[image50]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAAZCAYAAABw43NsAAACK0lEQVR4Xu2YzSttURjGX6HI10QkA+WaKZQMGDMwIHUHVxkamKCYGBrIn2AiJSMlMwMTg1MGBooJGUjde7syECNuKB/P094ra79nn2Od4+us0/7VL8679tn2ebxr7XW2SEJCgseswSbYqAc84wL+1EUHyuEyrNMDoBq2wT09YGB4meCJp3SxAGmBC7BEDzjC4BggP6+GAaZ00aDDq4I38NmykBmAj7qYB1vwVBclx/DK4Aj8AW+l8MNbh/90MQ+GJf6z5hSejQ/h8frGdDEP2DSbsFfVvQ+Pa5KZDTYV8D/sUfV8mQ218TY8LuB/YHv4uluiH64T7sIaq2bYkei6reV7NTx/SoLADN6Gxym0GP5eD48lGl6/BCHxJmfD0A9hR/i6VYJj34LHnUl02/Yl4ZnbvYszEr8t0ExI8Pcf4DisjQ7LkGS/fsLty6rEd6eG+112On8avA2vRaJT7TI67BQeu+hE3PaA3xbeZ7EEz+U1QN4kDC7hcbo+6WIGiiY8E5aBizmvxw4vboHX7MMrXcxA3Pm8Dc+epqOS3kGckrpTNPcS3GhcGJT0PHIOz15nbLP9hz+aFQm+dv2F13AeVkaOCOB1Zdskc3xSF2Mwm2R2n03O4RUKnKLsqgY9YMHO4le0TPTBUl2MoRn+lvQG8TY8Fz7ywcCRLkqRh8ctz4Zk704X7uAvXRSH8JKHoe94GMpFlXdWn+mCB7rowDTc1sWQOUnfMiUkJPjHC5kWnqnCoyR7AAAAAElFTkSuQmCC>

[image51]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAYCAYAAACSuF9OAAABsklEQVR4Xu2WvS9EQRTFryCREBqhIFkRjZAoJDQKJQWNSCT+AP8B0b1GpRFRiUSlEZ3oFC8qoZIQrU4hSCRKH+fsvLGzd2f27ew2xP6Sk5c5d2fefXPnY0Wa/COWoClt1sg9tK7NRmAiL9qMYBp60mYjfEBz2oxkDDqA2nQgFiaSaLNOvqTBsVqgQ2hGB+rkEbrUpqZbTEnS7LntxCagN6jL8VyOxXy1TxxLw5IxFmQEuoVGs/ammA6cGTKv2i4FqUzC1U3ppz9sSJWE+BIGE8ebhN6lVKLQAImYUrrta6cdYkH84xUZh16zp8V24JOEEtKk0JE2PQQT4tY7gXaVfyamQ2/WrjUh/oblzSOY0AD0AC0qn7vA7bCm2j46xCx8boA8ViUwnv3yYccriNkZvCIsebuMrIiZWSaWR3CX2dLsQ+3QIHQBLUv5jmLp7rK4D3tObelAgHPoWZvkU0x5WqE+yZ+BRJsOPDp8x4IPTgKrUwEDqTYD9Is5XXt0IBImzQuWd1oZfAET0gu6GlfQqTYjYDI70JDyi8xCexJ/6/6q/0MWli60wEN0ikmG67XJ3+cbggZhZyfTSCQAAAAASUVORK5CYII=>

[image52]: <data:image/png;base64,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>

[image53]: <data:image/png;base64,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>