tsof energy transfer, and details the "Opportunity State Architecture" which replaces continuous probability with discrete, finite logical boundaries. Furthermore, it examines the "Extension Definitions"—the specific data structures and field mappings—that allow the system to instantiate these theoretical concepts into a functional reality. By treating the business as a "Game" in the game-theoretic sense, specifically modeling organizational scaling like a civilization-building simulation, Oblio attempts to solve the fundamental problem of aligning human labor with mathematical optimality.1

## ---

**2\. The Ontological Origin: The Product Tensor and Generative Logic**

In the Oblio ontology, complexity is not additive; it is generative. The system adheres to a monistic architecture where all downstream objects—Pipelines, Campaigns, Opportunities, and Activities—are derived from a single point of origin: the **Product**. This entity is not merely a stock-keeping unit (SKU) or a pricing entry but a "tensor bundle" of interrelated data points that define the commercial physics of the entire ecosystem.2

### **2.1 The Product Tensor Structure**

The **Product Tensor** serves as the "absolute origin" of the system's logic. It is the seed from which the "Solipsistic Space" of the pipeline is generated. A Product is defined by a three-dimensional vector space that encapsulates the offering, the problem it solves, and the entity it solves it for.

| Vector Component | Definition | Role in Generative Logic |
| :---- | :---- | :---- |
| **Feature (Noun)** | The physical tool, attribute, or specification of the offering (e.g., "4WD," "API Access," "Encryption"). | Acts as the "Subject" for Asset generation. |
| **Solution (Verb)** | The functional benefit or action derived from the feature (e.g., "Off-road driving," "Automation," "Security"). | Acts as the "Predicate" for marketing claims. |
| **Persona (Target)** | The specific audience segment defined by a property such as industry, job role, or location. | Acts as the "Object" or target of the vector. |

The intersection of these vectors creates the **Use Case Vector** (![][image1]), defined mathematically as the cross-product of the Solution (![][image2]) and the Persona (![][image3]):

![][image4]  
This vector space (![][image1]) allows the system to programmatically generate the entire marketing and sales ontology without manual intervention. For example, if a Product is defined with the Feature "4WD" and the Solution "Off-road driving" targeting the Persona "Agriculture Sector," the system's "Context-Free Grammar" (referenced as Algo 3\) can automatically extrapolate the necessary Asset Groups, Headlines, and Campaign targeting parameters.4 This ensures that every "Activity" performed by a human agent is mathematically aligned with the core definition of the Product.

### **2.2 The Synonymy of Product Type and Pipeline Type**

A critical architectural constraint within Oblio is the functional synonymy between **Product Type** and **Pipeline Type**. In traditional systems, a pipeline is often an arbitrary container that can hold various disparate products. In Oblio, the Pipeline is an extension of the Product itself.3

The documentation confirms that these are effectively the same entity within the backend generation logic.

* **Programmatic Generation:** Pipelines are strictly generative. When a user defines a Product and selects a Product Type (e.g., "B2B" or "SaaS"), the system automatically instantiates the corresponding Pipeline structure.  
* **The Container Logic:** The Pipeline functions as a "collection bucket" that groups all Opportunities and Products sharing the same type. This allows the reporting engine to measure "Kinetic Energy" (Revenue) by filtering through a unified structural lens, preventing the analytical noise that comes from mixing dissimilar business models.3  
* **Naming Formula:** The identity of the pipeline is derived via a concatenation formula:  
  ![][image5]  
  For example, a B2B product targeting Marketing Qualified Leads results in a pipeline explicitly named B2B • MQL.3

This distinct typing dictates the fundamental objects required for an Opportunity to exist. A "B2B" Product Type necessitates an **Account** object (Organization) as the anchor for the opportunity, whereas a "B2C" Product Type anchors directly to a **Contact**.2 This distinction is enforced at the database level; a B2B opportunity cannot exist without a valid link to an Account record, ensuring that the data model accurately reflects the commercial reality of the transaction.

### **2.3 Account Dependency and Graph Cardinality**

The "Data Modelling v3" documentation outlines the rigorous cardinality governing these relationships. The Product Type determines the graph structure of the Opportunity.

* **B2B / Partnership / Reseller / Investment:** These types require an **Account**. The system tracks "Decision Makers," "Influencers," and "End Users" relative to this Account entity. The "Health Score" of the Opportunity is calculated as an aggregate of the interaction frequencies of all contacts linked to that Account.1  
* **B2C:** These relate directly to **Contacts**. The "Health Score" is a direct reflection of the individual's engagement.

This graph structure allows the system to calculate "Entropic Decay" across an entire organization. If a key Decision Maker leaves the Account (detected via a "Work History" update in a Data Activity), the system implicitly drops the Health Score of the related Opportunity, triggering an automated "Engagement Activity" to secure a new champion.1

## ---

**3\. The Kinetic Model: Activities as Activation Energy**

If the Product Tensor constitutes the "matter" of the Oblio universe, **Activities** constitute the "energy." The system rejects the passive logging model of traditional CRM. Instead, it models Activities as "kinetic units" of work—operators that inject "Activation Energy" into the system to counteract the natural "Entropic Decay" of customer interest.1

### **3.1 The Physics of Entropic Decay**

The underlying philosophy is based on the Second Law of Thermodynamics. In a vacuum, a lead's interest (represented by the Health Score) will naturally degrade over time.

* **Entropy (![][image2]):** The measure of disorder or disengagement in the relationship.  
* **Activation Energy (![][image6]):** The work required to move the relationship from a lower energy state (disengaged) to a higher energy state (engaged/won).  
* **The Health Score:** This is not a static integer but a dynamic value that decays. It is calculated as the average of the Contact Health Scores of the related Primary Contacts.  
* **Automated Remediation:** If the Health Score drops below a critical threshold due to a lack of energy injection (inactivity), the system automatically schedules "Engagement Activities" (e.g., "Re-engage Contact") to restore the energy balance.1

### **3.2 Taxonomy of Activity Types**

The system defines four rigid functional archetypes for Activities. These are not arbitrary categories but distinct "operators" that effect specific changes in the object graph.1

#### **3.2.1 Data Activities (Research)**

* **Function:** These are operations used to create, update, or enrich **Contact** and **Account** records.  
* **Trigger Mechanism:** These are largely automated by "Forecasting Goals." If the simulation engine predicts a shortfall in Marketing Qualified Leads (MQLs) needed to meet revenue targets, it automatically generates batch Data Activities (e.g., "Find Email," "Verify Job Title") to fill missing properties.5  
* **Target User:** Typically assigned to **Junior End Users** or research teams.  
* **State Conversion:** A Data Activity is considered "Converted" when a specific target field (the Qualification) changes from NULL to NOT NULL.6

#### **3.2.2 Asset Activities (Creative)**

* **Function:** Tasks involving the creation, versioning, and publishing of media **Assets** (headlines, images, copy, video).  
* **Trigger Mechanism:** Activated by the "Generative Engine" (Algo 3). When the algorithmic content generator operates on the Product Tensor but encounters a "null property" (e.g., it cannot synthesize a specific headline or finding a matching image), it creates a task for a human "Creative End User" to bridge the gap.4  
* **Output:** A valid, publishable Asset object linked to the Product Tensor.

#### **3.2.3 Engagement Activities (Kinetic Transfer)**

* **Function:** The primary source of Activation Energy. This represents the kinetic transfer of an Asset to a Contact (outbound) or the Contact interacting with an Asset (inbound).  
* **Structure:** Defined as a tuple of ![][image7].6  
* **Examples:** Sending an email, a prospect clicking a link, a discovery call, a demo.  
* **Target User:** **Sales** and **Marketing End Users**.

#### **3.2.4 Admin Activities (Approval)**

* **Function:** Governance operations. These activities "activate" changes made by other users, committing them to the permanent ledger.  
* **Role:** Strictly routed to **Senior** or **Admin** users.  
* **Context:** Approving a quote, validating a contract, or assigning new bulk activities.2

### **3.3 The Three Durations: Quantifying Labor Cost**

To accurately simulate the economics of the organization, Oblio tracks three distinct time metrics for every activity. This allows the system to model human agents as "processors" with finite throughput, ensuring that the "Game" remains balanced.1

| Duration Metric | Definition | Usage in Simulation |
| :---- | :---- | :---- |
| **Default Duration (![][image8])** | The theoretical "Cost" or static value assigned to an activity type for a priori capacity planning (e.g., 300 seconds for a "Lead Action"). | Used for initial forecasting and capacity allocation. |
| **Baseline Duration (![][image9])** | The statistical average of historical performance for a specific task type. | Used by the simulation engine to adjust its "physics" based on the actual velocity of the workforce. |
| **Actual Duration (![][image10])** | The precise scalar value of human labor expended on a specific instance. | Captured via the "CRUD window" in the Sidebar UX, acting as a "Game Clock." |

**Capacity Formula:**

The system calculates the Activity Capacity of an End User (![][image11]) using these durations:

![][image12]  
Where ![][image13] is the total scheduled workable time. This formula prevents "backpressure" or system starvation by ensuring that the volume of assigned activities does not exceed the physical processing power of the sales pods.

### **3.4 The "Stupify" UX Philosophy**

The execution of these activities is governed by the "Stupify" user experience philosophy. The goal is to reduce cognitive load to binary choices to ensure high-fidelity data capture.

* **Select, Setup, Stupify:** The user selects a template, sets up the constraints (Product, Persona), and then the system "Stupifies" the execution.  
* **Sidebar Constraint:** All operations must occur in a Sidebar UX. The user is architecturally forced to keep this sidebar open to accurately capture the **Actual Duration**, effectively converting work into a high-fidelity data stream.  
* **Abstraction:** By complicating the backend (Markov models, entropy calculations) and simplifying the frontend (checklists), the system ensures that the "Game" is played correctly by the human agents.6

## ---

**4\. The Logic of Validation: Extension Definitions of Qualifiers**

A central tenet of the Oblio system is the rigorous distinction between the *existence* of data and the *validation* of that data. This is codified in the separation of **Qualifications** (the physical data fields) and **Qualifiers** (the boolean logic gates).

### **4.1 Intension vs. Extension in Data Modeling**

The system architecture utilizes a finitist set theory approach to data.

* **Intension (Structs):** The schema or blueprint. In the code, these are ObjectStruct, FieldStruct, and FieldGroupStruct. They define "what" an object is (e.g., a Contact has a Name).  
* **Extension (Records):** The set of actual facts. These are RecordStruct and PropertyStruct. They represent the concrete instances (e.g., Contact \#123 is "John Doe").

### **4.2 Extension Definitions: Qualifications**

**Qualifications** refer to the specific, extensional database fields that reside within the system's schema.6 They represent the "matter" of the record to be modified.

* **Technical Structure:** Defined in the FieldStruct (metadata) and PropertyStruct (value).  
* **Examples:**  
  * Budget\_Amount (Integer)  
  * Decision\_Maker\_ID (Reference)  
  * Contract\_Signed\_Date (Timestamp)  
* **Function:** These fields hold the raw information required to define the object's state.

### **4.3 Extension Definitions: Qualifiers**

**Qualifiers** are the **Boolean logic gates** that evaluate the Qualifications. They represent the "Validation Layer" over the raw data.1

* **Technical Structure:** Defined as opportunity Qualifications within the Product and Opportunity collections.8  
* **Fields:**  
  * qualification Id: Unique Identifier.  
  * qualification Product ID: Link to the governing Product.  
  * qualification Match: The percentage or value required to trigger a match.  
  * qualification Complete: A Boolean status flag.  
  * qualification Expiry: A timestamp defining the validity period of the validation.  
* **Function:** They act as the "Transmission" of the system. An Activity cannot be "Won" unless its Qualifiers evaluate to TRUE.

### **4.4 The "Won" State Logic**

In Oblio, an Activity is never simply "completed"; it is either **Won** or **Lost**. This binary outcome is determined solely by the Qualifiers.

![][image14]  
For example, in a "Discovery Call" (Engagement Activity), the Qualifiers might be:

1. Budget \> $10,000  
2. Timeline \== Q1  
3. Decision Maker \== Present

If the user conducts the call (expending Duration) but cannot verify these truths (checking the boxes in the Sidebar), the Activity is marked "Lost." Consequently, the Activation Energy fails to transfer to the Opportunity, and the state of the deal remains static or decays. This mechanism ensures that the pipeline reflects "verified reality" rather than "optimistic projections".1

## ---

**5\. Opportunity State Architecture: Finite Logical Boundaries**

Oblio rejects the concept of "probability percentages" (e.g., "Deal is 40% likely to close") in favor of a **Discrete State Model**. Opportunities exist within **Finite Logical Boundaries**, mirroring the leveling mechanics of a video game. An Opportunity is either Level 1 or Level 2; it is never Level 1.5. This structure eliminates subjective forecasting by tying state changes to verified qualifications.1

### **5.1 Standard Opportunity Types**

The system defines a rigid sequence of four standard Opportunity Types, representing the lifecycle of the customer entity.2

#### **5.1.1 Marketing Qualified Lead (MQL)**

* **Definition:** The genesis state.  
* **Primary Focus:** Persona Matching.  
* **OQG Configuration:** Requires a minimum Persona Match score (defined in the Product Tensor). Must include completion of "inbound" actions such as website registration, newsletter signup, or GDPR opt-in.  
* **Associated Activities:** Primarily **Data Activities** (enrichment) and **Engagement Activities** (automated marketing assets).

#### **5.1.2 Sales Qualified Lead (SQL)**

* **Definition:** The activated state of intent.  
* **Primary Focus:** Engagement and Validation.  
* **OQG Configuration:** The contact has met minimum marketing requirements (MQL \= Won) and has engaged with specific high-value Assets. Goals include establishing direct contact via phone/email, assigning a Decision Maker role to a contact, and confirming product interest.  
* **Associated Activities:** High-intensity **Engagement Activities** (calls, demos) assigned to Sales End Users.

#### **5.1.3 First Time Purchase (FTP)**

* **Definition:** The "Fixed Point" of value realization. The moment transaction occurs.  
* **Primary Focus:** Transactional Completion.  
* **OQG Configuration:** Contacts are committed to the sales cycle. Needs and decision-makers are identified. Goals involve receiving payment confirmation, signing contracts, and approving documents.  
* **Outcome:** Transition to a "Customer" state.

#### **5.1.4 Retention Purchase (RTP)**

* **Definition:** The recursive state (![][image15]).  
* **Primary Focus:** Onboarding and Lifetime Value (LTV).  
* **OQG Configuration:** Renewal of contracts or purchase of additional features. Goals shift to customer success, support, and product experience.  
* **Associated Activities:** **Engagement Activities** focused on usage, satisfaction, and upsell.

### **5.2 Configuration Relative to Products**

The configuration of these Opportunity Types is strictly controlled by the **Product**. When a Product is created, the system administrator manually configures the specific Opportunity Qualification Goals (OQGs) for each of the four stages relative to that Product.2

* **Primary Product Dominance:** While an Opportunity acts as a container for many Products (a MANY-to-MANY relationship), it has only **one** "Primary Product" (typically the one with the highest value).  
* **Inheritance:** The Opportunity inherits the Qualification Goals, Pricing, and Contract terms of this Primary Product.  
* **Product-Specific Logic:**  
  * **B2B Products:** Configure OQGs to require Account-level validation (e.g., "Account Revenue \> $10M").  
  * **B2C Products:** Configure OQGs to require Contact-level validation (e.g., "Age \> 25").  
  * **Reseller Products:** Configure OQGs to track attribution (e.g., "Sourced by Partner X").

This architecture ensures that a "B2B • MQL" has fundamentally different winning criteria than a "B2C • MQL," even though they share the same generic stage name.

## ---

**6\. The Chain Reaction Mechanism and Automation**

The most sophisticated aspect of Oblio's process engineering is the **Chain Reaction Mechanism**. This logic automates the transition between opportunity states, effectively removing the need for a user to "manage" the pipeline. The user manages the *Activity*; the system manages the *Opportunity*.1

### **6.1 The Causal Sequence**

The documentation extracts a precise logic gate for this forward motion:

![][image16]

1. **Activity Won:** The user completes the task and checks off the Boolean Qualifiers in the Sidebar. The system sets Activity.Status \= Won.  
2. **Qualifier True:** The system updates the opportunity Qualifications sub-collection, marking specific goals as qualification Complete \= TRUE.8  
3. **Opportunity Won:** When the threshold of OQGs for the current stage (e.g., MQL) is met, the Opportunity Status automatically flips to **WON**.2  
4. **Next Opportunity Created:** The system immediately instantiates a new Opportunity of the *next* logical type (e.g., SQL) for the same Contact/Account, carrying over the relevant context.9

### **6.2 Automated "Lost" Logic**

Conversely, the system uses "Entropy" logic (Algo 2\) to automate the "Lost" state.

* **Decay:** If the Health Score (derived from Contact engagement) drops below a defined floor.  
* **Failure:** If a threshold of Qualification Goals evaluates to FALSE (e.g., "Budget" is confirmed as insufficient).  
* **Result:** The Opportunity is marked **LOST**. This prevents the pipeline from being clogged with "zombie" deals that have no realistic chance of closing.2

### **6.3 Workflow Dynamics**

The Chain Reaction is orchestrated by **Workflows**. Workflows are hierarchical structures unique to a Pipeline:

* **Stages:** Ordered by the sequence of Opportunity Qualifiers.  
* **Sequences:** Linked to specific Asset Groups.  
* **Steps:** The atomic tuple of ![][image17].

**Timeout Logic:** If a Step (e.g., "Send Email") is completed but the Contact does not engage within a set duration (failing to trigger an "inbound" Qualifier), the Workflow automatically triggers the *next* sequential Step. This ensures the system maintains momentum even in the absence of customer feedback.4

## ---

**7\. The Simulation Engine: Formulas and Workforce Dynamics**

Oblio is not just a workflow tool; it is a simulation engine that models organizational scaling. It uses sophisticated formulas to balance the "flow" of opportunities against the "capacity" of the workforce, modeling the sales team as a series of parallel processors.

### **7.1 Workflow Formulas**

The "Workflow Settings" documentation 2 outlines the specific formulas used to govern these dynamics. These variables determine the "Physics" of the simulation.

| Variable | Definition | Formula / Logic | Implication |
| :---- | :---- | :---- | :---- |
| **![][image18]** | **Number of Stages** | **![][image19]** | The complexity of the workflow cannot exceed the number of validation points available. |
| ![][image20] | **Workflow Conversion** | **![][image21]** | Represents the efficiency of the process (Win Rate). |
| ![][image22] | **Workflow Duration** | **![][image23]** | Represents the total labor time required to close a deal (Cycle Time). |
| ![][image11] | **User Duration** | **![][image24]** | Represents the total labor supply available from the sales team. |
| ![][image25] | **Open Goal** | **![][image26]** | Defines the maximum number of Open Opportunities the team can handle (Capacity / Duration). |
| ![][image27] | **Won Goal** | **![][image28]** | The theoretical maximum number of Won deals given current capacity and conversion rates. |

### **7.2 Scaling Logic and Pod Architecture**

The system uses these metrics to solve for staffing requirements. The document "Oblio Activities System Design" presents a geometric progression for "Sales Pods" (![][image29]), modeling the organization like a game of *Civilization*.1

The staffing mix is calculated to prevent bottlenecks using an "extension" formula:

![][image30]  
Where:

* ![][image31] \= Number of Junior Staff (Researchers/MQL handlers)  
* ![][image2] \= Number of Senior Staff (Closers/SQL handlers)  
* ![][image13] \= Total Workable Time  
* ![][image32] \= Time spent on Sales Activities  
* ![][image33] \= Time spent on Junior Activities  
* ![][image34] \= Junior Conversion Rate

This formula ensures that Senior "closers" are always fed a sufficient supply of qualified leads by Junior "researchers" without creating an oversupply (inventory glut) or undersupply (starvation).

## ---

**8\. Performance and Gamification: Rank and Goals**

The final layer of the Oblio architecture is the **Performance System**, which gamifies the user experience by tracking progress against the goals derived from the formulas above.

### **8.1 Rank and Goal Periods**

**Rank** is the parent object that evaluates a user's performance over a rankedPeriod. It compares the user's output against their specific Goals.2

* **Activity Goals:** Measured by **Volume** (Number of Activities). These are tracked separately but used to calculate averages for Opportunity Goals. They focus on *Input* (Work Done).  
* **Opportunity Goals:** Measured by **Value** (Currency/Revenue). These represent the average performance metrics over the goalPeriod. They focus on *Output* (Value Created).

### **8.2 The Four Performance Metrics**

Both Goal types are measured using four standardized metrics 2:

1. **Time:** The duration the Activity remains open (The "CRUD Window").  
2. **Close:** The ratio of Closed to Open goals (Efficiency).  
3. **Won:** The ratio of Won to Lost outcomes (Efficacy, driven by Qualifiers).  
4. **Conversion %:** The statistical likelihood of a Contact moving to the next stage.

### **8.3 Forecasting and "The Game"**

The system uses these historical metrics to project future performance. By integrating the **Baseline Duration (![][image9])** and **Conversion %** into the forecasting integral, Oblio can predict the "Flux" of revenue. This allows managers to "simulate years of growth in seconds" 1, adjusting the number of Pods or the intensity of Activity Goals to achieve the desired Commercial outcome.

## ---

**9\. Conclusion**

The Oblio Business Operating System is a comprehensive attempt to apply the rigors of physics and finite mathematics to the typically chaotic domain of sales and marketing. By defining **Activities** as units of energy, **Qualifiers** as binary logic gates, and **Opportunities** as discrete states, the system creates a deterministic environment where outcomes are the calculated result of inputs rather than the product of chance.

The architecture relies heavily on the **Product Tensor** as the single source of truth, generating Pipelines and Campaigns programmatically. The **Chain Reaction** mechanism automates the lifecycle, ensuring that the pipeline advances not through manual data entry, but through the verified completion of work. This "Stupified" user experience, backed by a complex simulation engine, aims to align human behavior with the mathematical optimal path for organizational growth. The rigorous distinction between **Intensional Types** and **Extensional Records** ensures that this simulation remains robust, scalable, and computationally efficient.

#### **Works cited**

1. Oblio Activities and Opportunity Model, [https://drive.google.com/open?id=1lB38UXkEChYzelgrZRvFEpYWJU5g7R6rCZ05O56XfRQ](https://drive.google.com/open?id=1lB38UXkEChYzelgrZRvFEpYWJU5g7R6rCZ05O56XfRQ)  
2. Oblio Documentation \- 6.) Primary Fields, [https://drive.google.com/open?id=1ievh0LBYtcYRcv2qvioJFtG6qGP3Kouh-cZVrdBx3UU](https://drive.google.com/open?id=1ievh0LBYtcYRcv2qvioJFtG6qGP3Kouh-cZVrdBx3UU)  
3. Documenting-Oblio-Ad-Model, [https://drive.google.com/open?id=1yF7zdNtD37NWQ7POds2TiuqXNlcfEuo06tHz2c5H56c](https://drive.google.com/open?id=1yF7zdNtD37NWQ7POds2TiuqXNlcfEuo06tHz2c5H56c)  
4. Oblio-Business-Operating-System-Commercial-Architecture, [https://drive.google.com/open?id=1mOTeRa6vy3iYySPzkFglDyi0M1s622RPigSUt5O\_jrs](https://drive.google.com/open?id=1mOTeRa6vy3iYySPzkFglDyi0M1s622RPigSUt5O_jrs)  
5. Oblio Activities System Design, [https://drive.google.com/open?id=1Bjk-LZ5qfCMMkDX28Pc2M2C\_QgPB4IPq5rO1gLBet6o](https://drive.google.com/open?id=1Bjk-LZ5qfCMMkDX28Pc2M2C_QgPB4IPq5rO1gLBet6o)  
6. Oblio-Activities-System-Design, [https://drive.google.com/open?id=1ezbNydakqQgpCBQQBKf3vuo7E-gtlznRQilJU9uH22Q](https://drive.google.com/open?id=1ezbNydakqQgpCBQQBKf3vuo7E-gtlznRQilJU9uH22Q)  
7. Oblio Docmentation : DataStruct, [https://drive.google.com/open?id=1zCVLZRwWQfb\_ule9ofoe5NE5vbTWQiXRl4Uo66n8D74](https://drive.google.com/open?id=1zCVLZRwWQfb_ule9ofoe5NE5vbTWQiXRl4Uo66n8D74)  
8. Oblio Documentation \- 4.) Data Modelling v3, [https://drive.google.com/open?id=1IU9vmBg39FZSNfsfaIugdNMVI8YXpEqa8\_eGHCnhn1Y](https://drive.google.com/open?id=1IU9vmBg39FZSNfsfaIugdNMVI8YXpEqa8_eGHCnhn1Y)  
9. Oblio Documentation \- 7.) Logic & Functions, [https://drive.google.com/open?id=1Al9iYESL9QnAVW-fpTJ36yivurXlCuoOraHR8DG61xg](https://drive.google.com/open?id=1Al9iYESL9QnAVW-fpTJ36yivurXlCuoOraHR8DG61xg)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAaCAYAAABozQZiAAAA5ElEQVR4Xu2SPwuBURTGj0EpDDIpkzKYlUFZ5Fv4AHaKT2A1mJVPYbNZxGKxUXwAmSwWnqf7Xp2Oe7PjV7/hfc497znvH5Hf5QgfAfvqjK31fKEIS6pQTq4z/gCowgncwBZMq5oUxDXudWgYw6wNSU1c89wWEti0tKFnCm+wbgsJHXi2IcnDFdyKWz8EV17YkHDlC5zZgoKNvMEbXJnPG1uZcOWKDQlXZnNsZcLJ+tO98N83BifyhQX51DyCORt61hJvPsChDTUNeIVNlfH368IBTKk8SFvc9BPcwbu4qR8b/3w3T/04MNjj9n+MAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAZCAYAAADqrKTxAAAA50lEQVR4XmNgGJKAEYjVgLgRiBcCcTFUnBuIxWCK0MEeIP4PxLsZIBqvAHEEEM8CYh4kdWDAD8SHgFgFXQIITjBADMIAGQw4JICgFYjfoguCwEMG3JomQTEGgGnSRJcAAgEg5kAXBIFgIP7LANEIwyB+J7IidAAK6nAGVE0wzIqkjiBYygDRVIQuATLFGl0QCkD+A4VaOTaJC+iCUCDJAAmgaHQJUFA+RxeEghgGiPNA/kUBBxhwSADBLSjGAHeAWAeIfzFAgnglED8A4n9ArABXhQb0oDQo7fkyQBImKGUrwBSMggEFAIkCMGOsXRlxAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAAvklEQVR4XmNgGDZAAIglsWCCoBWI/xPANUDMB9OADXxjgCisQpcAgvcMEDkWdAkYAEn+A2IXdAkgeMgAkRdHlwABQQaI5FYg5kCTAwGQoSB5fnQJENBnwO1kRgaE37GCOUD8BIhl0MT1gPg6EK9gwGEryMmngfg1EM8H4llQvJABYhvIv8xw1WggmgGiKAhdghgAsg2kWRNdghgAcjJIMy+6BDEAb0jiA7BoeIsugQ+AEj3MRmRchKxoFIxcAADlATHfoDcDkwAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAArCAYAAADFV9TYAAACN0lEQVR4Xu3bT8tMYRgH4EcoxcKKhEhZWFlIvoAdNqyUhR35AiKLd+MDYKGkrJSljbKwkJWFrZRsSJSSsrDz576bmczc73nNTGa8R11X/WrmN9OcM7u75zlPawAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC98bNk57D/PNa9HHbLdC3yJnIp8iNyNnJk4huLU//zKHkPAAC9lMPZ/VqGp7VYkiuRc6XLAWpD6RbpW+Rq6b5E7pYOAKAXcjjqWs36UIslyetX72qxQDkI5jX3lP5j5G3pAADW3aHWvZq1JXK9dMuS1z9fuu3l/biVyL5atrX76nBbPSSOhriLpQcAWHc3I19rGY5HDtSy2BHZNUOmed0mnyXbP/Fpt9ttcjhbKe//JLc935fuVeRB6QAAeiGfX7tXy/CoFkuWhx0et99D2yxyaDvY5hvWUg6oLyJ3hrnQVq8wAgD0Rg5HR2vZ/t2zXHXQyq3YvKdtpe+yuQ1OlObq2KxGW5+5FQwA0Hs5FHUNR3sjp0vX5XkbHA6YlrXsjpwq3aY22wpbDmujQW389TR5uGKW3wcA6I0cXnJwGpln+PlblyPPSpdblGdKV3XdY1fXJbd/cxsYAOC/sbUNhrYnkU+RW5MfL1UOWMfa4PoPI98jJye+0e1GLYY2Rk7UcigPP4yej5vnOTkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABbqF4NTY/nB9q93AAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAArCAYAAADFV9TYAAAK8UlEQVR4Xu2dWYguRxmGP3FB0bjkuCCKEolCVNyPEHHHqMENNBBFb8QLF3IhBhWD4AnihUhAxSsRTrwIGhdExAURbBTcwQUl4IJHMYqKiqJCjrj0Q9d7/u//pvqfPjP/nJk5vg8U01XVXV1b1/d2VfU/EcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYcKCdG9+COu3M+acvcdXQPHd3zR3dpids2lCOX604p7m7pOIcfd+4VO9sTd/d80hZ50OiePbqHlHCzfx41uq+M7heje32JM8YY838Egu2Jo/vv6P4QK+P+yhb2hNWp8bcWdlkK2wsIhzeP7j+je3ILw+iT9pU6aUtIsL0gpvR/muLIx+tG9+/RPTKFH3cQbAhiyvvGWLXp01rYm1anbgXajjp8SY3YB5RhE7fE1F+vaY5y4eT/6+g+cu7s4wcvENTpVSmMvkzYc1PYYXPfGrAFemMBL3n7ebmjPknznbHeZ+hHHL+3+Y0x5kiDcWSw+lUJ542ecM0+vXB0H1xF7wuE2j/aX0HaBzXTxX2Y0aM815a4zxf/xQJlrSLqihaOUdwm9J16r71CH3h7DSx8vfgl2DLMTB02H60BC/nL6N5dA2MSLpTzgTXikKjtsC3qWPDy0Q3Jf75cEjtnKOvz8Z7R3TP5jTHmyDEn2BjMCGd2Ztv0BNtBwn1wGEHKhOETezWqR51qkIC27IXvl20KttfE7oLte8XfE2w/Kv7DYC99i5klynKXGtE4M7rbauAhoFmrC8FvY3+CjRlnXlYy9Tl4emz/RcYYY7bKnGD7UAsHibcs4OR/7ej+HNNyzcdifeniZEzLUze1v6IKNo5JS36lPcSU5pea/z4tHpT2B9rfq1NcRYINuBcGQFSj+vOYhN2n27FARChfDxvd7THNhHwypr1GZ0Z3dnTXx/rswItjqtsPx3p6B001SMAsKeEIVpVniNVy9xfOnRnxndHd3OLrzCozEZx/6+h+P7rfxOpelFX1BNR79gP1Q5tRX9SL8vT9dixX8z9HTV/kNhti6uu0N376geLJM/f+dUx5+lqs84nRfWZ0P45p+SwL/k3UvrUEZnx7ZRHKP6iu6a/ki36N/7oWn+v+dEztxLPKcnLuo8w60zeZZaJdNAut66mrH47uX6N7fEzpKF3Fg/IjwV3bXuMI55FfPdffaPEwNxbIqU5zGAzJv+Qlk/N6/Uv3x6lc8lMuxTNjdzpWdcFzLu4R05aPG0b31dF9PMUZY8yekWC7IybjiUOMMHDnjw96M2748/4vDWYYgxPtWJyKSXxBFWxQ/RokZVgwJhgzqGkD/rlZiSzYEH2c+4bmr0aVuMe2Y+6XxYrq4P0pDL8MnOpSBuvymAZuQflPJX/mpTEJht0c4nAJ5OPLsWrT77awe6dzVB745+i+2I4RJog7gXjXEh1l55osWhAA2fgNsd4+mtkTCN2cPnHaszTE7jNsFfWVHnwMUeMQYIJ8I0QyPxvd59ox5UZYCJ4TjPQSat9agkTPHFmwwRCTmMztQfxV7Vh1nwUa+/v+2I45L8/YMcuE/xnNr+sRIcxsPqWEV4ZYb796nkQc6cGrm//+587ojwVD8gvO47kByndL+7sE0uwJNjgdU7z2Up6M6VkWEpy6F+MO5z+m+TmmHgX9Je/JM8aYPdETbGxMr7MIc4It+xEkhF0W00CKCBDPi+lrN1gq2LIhxQgM7bimDQijPEhmsmADBAMOqlF9UTomLserDlg+EdnYVMHG32zceSu/UHuryEcWbDfG+gwlUJ5aj1ANDnuIVA7qjfgMBmypYMPI5ToDRIOM3xDbFWy6n8rOXz6qEeRbMyniVEzPA5yJaaZE/CTm71WpfWsJEtZz9ARbvQ9tpZejKpgA8aAwXkryBxoSPpuuh7nwIZYJNtEbV3pjwZD8AiGtfDLmZOG5G6Q5J9h4mWA8kcg6Fesvg/T32kfpL6diNQaoPwN1/JbkN8aYPTG3JFrpDazVr3MYnDAiWQTibmrnLRVsLNWJLNh6aeNyXjJVsKnMb4udxo79LmdH9+2YjHOOV/lYFhL49SZeBdsQ00xGzuO7WtxBs8kgCeJru6sMKhNkI8vfKnBIY6lgqwa8MsROY7gbpLcpTRl2jC6zhZmeYKvlzcJXrvK42HnOLzthD9AFMzCTzD2zwc9UQTfEzj6MX89Or77Vxohyyl7rG7/qpHc9zIUPceEEG/lXWiznZyG+G1y36fm4LlYvKXWJvCfYhpheSFW+2u7nkzdjjOmyTcGmL0uZTWNAy4Irs1Sw5TxlwbYp7R5VsAFLotwjGzv9xImMJXHDudj5OqiCTWmejtWs4m4cxJLoJoMEPcGm5R2MoVC5gb91CfF8BNv92vHcF3lDrJahOc7CcQ7Sy/eryLBjhPPyJvQEG/1X6RG319mRKqSWwFIh935OjWgQl8XCEDvvw4wOLxtQBRMwu0kYP23zu9j5Eyikp37bux5y+Kb81Ov17IveM9UbC1SeH6Rw0PI6QlzP7RJIc9PzQVqc89RYbZEQPcFG/qj33hK8McZsBYmMvHTXozew4s972O5oYSDDn5fhtKl9qWDLA3sWbL20+bpQ+2IqpHuyBsa0STsbFwwzBkyw8X5oDlQHNZ9zgk1+LS9jBOoMz0HBfVnK3ERPsAHLtogbgci5vh1rD1uu6/o7bJQ/Gy3Syn7q/R2xMrDUk2YgWI5T/X0q5vclZkg7p99DfbP+wC/5rgKU/GmfIkI698PLY6domKMKqaW8Iqa8VgGS956JIdb3sEloaD+VBFNOiz187FMEBIm2BwDiBD8vL1AFl7gkVuHMCgrKnMtd214zUKI3rvTGAvVTZhgz+s3IJcI+wzWbBBt8K/plJy95Dxt1z3n6uRXq79p2DCdifc+mMcacN0OsjJ1cHjgFYql3DsfMVGHgOH5VrH+ogFFnjxRfpukLSQ3QctWvAT07CQCcBm6lTRjpP6uFZ2Rs6rWCgbYa1dtG9/fR/SlWX0Oyp6/WQc33k4p/iAk2+SNo2JiPADxoaj5xPep5FWa5zsaUd9o1Q5m4hhm/b8ZUr/g160C9YtCoR8qNWK734Tr8vCjkGR4ZP4RJ3UdZqeWs98iwuR3RVtEMGzMk5IXyvnXtjOnHakmXfk7cbvkStW+dDyzNc89bY1pSI1/1a10YYhK21DftwTWPTvF6BlgSJp42yR9dAOdzDm1Fu+j6+izWsYGvH0lPYh7Uftyrtn19ZmofrPeTaLs6po+gSO/hLSyz28umqPfL+ejxiOh/JER/f1+s6pQ0aK8M9Uib3R79djPGmAsKA1UdxI05SrDsB3N7nCTYDoL9CLalDLH5PnMzZMcdza6z3H1ljtgnWYwzO9ib4UWwzYk8Y4w5kvTeLI05KrDEzdd+GHf9jEuFZePel7LHBf7bAMvIeckzo5m6iw3KdEVMvw+3Tdgby4wY9fnZEieY0buhBhpjzFHlmuQuLXHGHBVujmlPWA8Mfu7Hxw2WCnP+62wQz+VxLt8mnhnT3so5obpXWO5n79qNNaLxsrh469QYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhhjjDFmA/8D+wdjfePbgvEAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAZCAYAAAA14t7uAAABPUlEQVR4XmNgGAX0BpOA+D+R2BeqhyTwmwGiGRtgBOKvQGyMLkEMgLkKF3gIxJLogoSAOAPE0D1IYmJAvAGJvxWIOZD4RAEbBojBrUhiHkB8DImfjMQmCrAA8Rog/gfE64F4FhAvZIBYFI2kjmQACoa7QPwLiB9B8TsGCiILBsoZIK5zQROfg8QWZoCEOUkAFAwgg2WQxJiBOAKJnwPEnEh8osADBojBuGKcnwE1EokGIENBEYcLgMK/AU0M5CM3IOZGE4cDkCtBBj9Hl4ACPSB+D8Q6SGJqQHwCiOOA+AAQFyHJMcgzYJYDuLAlVA8IgJLmEyBWhPJBhmoipMkHIENAkQ2yAJb+eVBUkAlApZsnlA3KraCCC+SjQrgKMgEorP2gbFC5AspE1QyYeYAsAPI6LLOwMkBSyCigEwAAsI1GeH0QlNcAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAWCAYAAAAvg9c4AAABO0lEQVR4Xu2TPytGYRjGL0kphlcpiTKY3olSJjYDg4GU4f0ADCaLmHwGo+wWq0E+gslEZhZlURQDruu9nzf3uV/PcZzY/OpX5zzXcz//znOAf/6aPjpCR4MN3+mn9MMGuaPvdDK9d1xM7a+0J9VU5hlW/BW7sGw+BmVoBSq6jYFjgz7RmRjkGIINehoDxzKsz2oMcrToG12IgWMbNuhODHIcwbY+HgOH+lRe6RR9pHsxcOgcdZ4XsKOKvMQGbV0rKNv6FqzPfmjv0LVDza4C3dccOu/cdRNd56xtlRVMwPLDGJAm7Fac+May+zlNr2D5QMg00Q0+/7D2ovQySzdTwzVdc+qjqf2errfLihyjuJAH91wbTag/TIzRA5fVRoMupec5VLy736ErdknP6Qo9K8b1GaS96XnYB7/GB7+WPcUX7vpjAAAAAElFTkSuQmCC>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAZCAYAAADaILXQAAABS0lEQVR4Xu2UvUoDURCFj4RAJIGYIEjARhDSCAp2gp1NijS2voJ9SCdInkEQIaX4AKKV2FuLLyD4BFqk0Mxx9uo42b3ZrCFVPjiQnb87O5m9wJIclEUbopbTmg0qykD0NUVDUTskFOEDWiiNPtR36B15YfKnNyasiu4T8fdMNKDFb73D0IXGHHvHNHahiT3vMITisZhUrkSvok3vMDBm5s45kifoSCrOFwgx76J954tyAu3oyDsMp9CYs+T5QPQGPZAHZ8IdZmJsJNwSxmwZ2zo0d8XYJuDpTMwaCeGK+m+A4+FbR4ntd1P0ILoT1Y2d3bLrbegWpXZPI4tzUzx7oheov+p8HMmz6Aba/QX0jvqGFxOTsjSCdvST4GBBbk6AOYyfCxwJOw+weMc8/4tH/H6pO6JzZMy9CNfQq5pju8TfP3sulEQ1b1yyeMbrh0nACIXSEgAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAXCAYAAADk3wSdAAABOElEQVR4Xu2UvUoDQRSFr0TBoOAPQhCEYGPKCLb6ABYW+gBp09iL6UN6a8EXsA1GhGCfKlXAOqSzEbSw0JyTO0sml53dzZJ0+eCDy56ZO7nsZEVWLJsNWIKHxl1/0bw04X+KT7ASbZiHH9EGcdyLZhc2SIOb/uxDRxF2nKwzsSfatG0DjyvRNTc2CFEV3XBnA4+oadKaGR7hEB7ZwINrMv9Sjt4THX3TZBHRmm94ZrJYOPoXbNjAg43YkI15QCq8gxwraXS+da45tkEIns4NodEJr1roDseSdD/3YRe+wB2TncAWrMGRH6yJNuWbt5zCgWi+ZbIy/BDdTyZT8IPBIuSv6L3kxyaOT/js6nX4Po3yw4PrruYX7sHLcsOml64+l4x/iDRuYR++wWv4OhvnZxsWXH3gBwtjDMmFRyVe4UT3AAAAAElFTkSuQmCC>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAWCAYAAADAQbwGAAABN0lEQVR4Xu2UsUoDQRCGJ8SAQlCIEBFSHHb2KRXSWPgOKQM2VhZBhFSS1iqksEhjYWMhSNpwpeAbWAd9B0X0/53dsDeu3sVolw8+kps5/pvb7EZkyX/ThkN4C3tB/Qg2g+sfWYfv8AVumt4znMAUVrOtOA344EyyrU84MR/Wt40YG6I3P9pGAKdK4Y6pf6EEz0UDOcV3+MDc1x2Ihh3bhmEFtmwxxlQ0MPdVisIw+mcUDazBii3GKBp4LbqOubxKfmAC903tUPQgeGa//gF8g13RLWS5gpfBdR2O4Bl8cjX+oCf+BoZwy3BKnl1PWfRhF3AtqPMcd+C96DIQTrs3u8PBgF3RaRicSHxiD882J1uFY/e5EKnoujGU4duZ7i/ggbiBp6L/QnfZ9vxwT26571yuQnt0Lj4At1AyJP07IAQAAAAASUVORK5CYII=>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA5CAYAAACLSXdIAAADI0lEQVR4Xu3dv+tVZRgA8Cf8gZCVohRiILQ5RENT4uDg4KJDLYF/QIubQ9RUQ3s4SQTS0BY0uYl8sSGoyUGHIEIRhUBcsiGxep/ee7zv9733W4He8z1cPx94uOc87xnu+PCe9zxPBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwOpdL/HXv8QfJd588jQAAKN6ocRPzf3xEo9KfNbkvi2xv7kHAGBEp0ocaO6/ibqr9kaT+7K5BgBgZH0xlrtrWbC1Lnb3AABsk51Ri7U7/QIAANNwMmrB9nG/AADANFyOurv2er8AAMA0/Bl21wAAJmtP1Nehy3bXPi9xbXZ9psRbJW7E5i9JAQBYkROx2Cg340LzzNESv8+uf4zauy0Lu4NPngAAWDMvRi2AfivxRYlfoxZAbQPbKdkbtT9bGgq392e/AABr51yJxyV2dPkfStzrclORO2k5+WBXzP/jR/NlAID18V7U1435SrF3OjaPg5qaLNZypy3/ezsZAQBgbQxNabd6lZgFm0P8AADb6JNYHPn0tHLH69B/hN0wAID/6VaJ+30SAIDpyGLt5z7Z2NcnRnD1GQUAwFrIYi17mC3zWol3+iQAAON6N7Y+w3a9uf66xM3m/kFz3XOGDQDgGcsdttsx78GWxdQv8+V/viTNImtoTpsNdoeGtQAAjOSVqGOfPo06v7N3OOb92E7OAgCACcnB6vn69EjUUVWvxjgzO4/H4jzRIb6PxckMAADPtfxidCiQxvx69KWoBdp3Xf7YLL9sQgMAACM6E7Uwyx2+XrYl+bBPAgAwrislNqJ+fdrLxr8bfRIAgHFttbuWci1bjgAAsE2yhUgWZXmOrZc7brmWHybsLvG4xNlNTwAAsHLD+bVlzsXmtUsl9jf3AACMYCMWvw5Nu6IWa0ea3MMSb5d4uckBALBiy86v5SSGzB9tctnaYxiXtTG7BwBghb6KxUa5Q5xvnhvkztoHs+t7Uc++AQAwIaejzjvNnbW73RoAABOQZ9ryrFuOzfI6FAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1szfoLqFzF99YswAAAAASUVORK5CYII=>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAZCAYAAAA14t7uAAABKElEQVR4XmNgGAX0AslA/J9I/AqqhyjwFogrkfgsQLwGiJ8DsRKSuCMQ/0biEwSngFgYiS8NxA+AeCsQcyCJSwLxNSQ+XqAJxIpoYuUMEG+7oImD+MfQxHACkGKQ15EBKBhABiMHAwjYAvEUNDGSACgcQQZTHYAM/YcuSCkARRzIYFDEURWAwhxkcBW6BKUAlCJAwYCeIigCuNIvMgCld1kkPkwdJxDzIYmjAJArQa7FFQwmQLweiO8CsToQ8wDxAahcOhC3QtlgwMaAWR7AMCirgzIQDBQCMSsQnwBifiCOBuJvSPIgw8kGoFzaAGVPAuKrCCkGYyQ2yQAUuTJQ9kMoHwQsoTTZAORdWFb/yQAJV1DwTISroAAIALEYlA1KFbhS0CigIQAAMn47AqlGTiYAAAAASUVORK5CYII=>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAArCAYAAADFV9TYAAAImElEQVR4Xu3da8h16RjA8Vso58NQCL3NGIQRhaYRyjE+kMMo8mGSDyQUQkgN8sEXOdWU1BsSaSQfnH14GiWhHCJyyEskhFKUkcP6z72u2de+nnvvZ+/97Gfzvv6/unv2utfaa6+99lrrvvZ132s/rUmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmXrNtN5d9TuU2dsaNnTOVVtXKF207lqO3vtcF7ifLXQR0Fjxks9//kplqRcEy8vFYeyKem8rOpXDuVb86PdXoc4/U8yOWX83K1nnLzVB4/zw9HbXkZpkOtf1Opq+X9tzxLkrTWS1q/aL6oztjAA6Zyv1L387Z5APSo1l/7/qnucVO5S5rexQ+n8ttS97mp/KPU3bPt9r4vBVdN5fJaOaOBJWg7pDu2fizct9S/dyo/KHXaHvs2vhhxzjId5xn1+ZyNACv7yVyyWE+9BuD57Xg9yz671D24LQd7kqQV+Gb9o6n8us7YAJm0elE+rQ+20wdsT2u9cchBB+ul7u6pju0/dGCSvbZWbOE0zw2fbz1Qqr5XK7ZA43++LWdQblxa4jiew3JX1xmT+7Q+7w51hrby8fS4Bmz4Wno8CtiiLj9nXcBGYFbP41HAhhoISpIKghUCmWe24wFO9pCpvHIqb5zK7ee6u7XxxZrpJ5e6Ve4xlXNtETSQsauNwi4iAHhOqvvOXEfDE76bHoc7T+VZU3l7W7xX5G0leHhu6126u3pzW17/tngu6zgNPvtvT+VDqXy09e7ijP3JPuHvKMALfH6frZUbOJrKn2vljGNhdJxdSu41lYfNjx+eZ+zRK9LjUcD2nvR4FLC9ZVB32oDtI/PfN6Q6SdIA3aFkMMDFdNQ9yLffF8yPI3OFuFjTrcljGnOCiHe2RfcKQQ7f7GmMuXizDF2mLEOwQ3dIvuDHOq9MdSBQov558/Sjp/LPqTzo1iWOuzAX0PXJth+1RWAwGqd1w1Re1hZdR59svWsHsQ1faD1o4b0yHctug3USTPIeT1NYxwvb7sg2fr3UfbFMk4X82PyYMWW10c52yczFGMocXGcEMsy/d53xP+517XhQNMK5Qjcwx9S/2vIXiqx+9qOy6bHIsuu2LQdsnMNcF5i+7NYlOs6rfP5mqwK2L7f+xeD3bRGwSZJOQHdoYNxX7RYl80YjEmgQnp6mRxdrsjN5PEyMTYrG5PtpHuo6VjUkBBKfmB9fPpVr0rwRAoBodK5v/fV5DnVkyGiEcraIgKAGI3ctdbwvgtxQt/0kbMM32vGG7zRY10/b7tm+K1ofzxbIuoUHtuX3T4Cbu84y9kNkibYRN3+wr0cYkF4/l2wfXcNn5ZG1ojhqy/ubc40s5VnbJmADWVOGTVTrsp+cJ3X9LBsZNr6sGbBJ0gYIWriA1pK7Rbmg5qCuGl2sa8AGAkEyNbwmf7O6jlUNSYxlAmOvThKZmye03h0aqCPwqIEjDckoMMjbx/uia3A07yQsxx2PT6oz9uApra97022p4o5RAvQ8xu9brd+sEQjqI+NY8bmTTc3dq1FykFvlrO0I88jIjrAt645PvKstj3/7cOuvuQrHGe8zfCU93qc4PiNzGOfjIWwbsIHpmgVdF7Cxjrp+lh11iXKj0cWWQZWkgyFoie7QwAU1N640dn9J0xXLk1XhwhwX4lHARtD097bIdGX1gh+NGHV1LBXdmQQVOSuxDneK/rgtd/XSGNMdU7ue2MbaSEWDxLg28L7yNtVt3wRZPfbpr/ZUWNdpxsLh+tY/l5pFGQWoqzJho2B8ExGIxxeFx7bF+3l9Wz22DYzLqsda9bdasQWyXZwDZyGCpkAQWTPcWf3cR4WxcJvYNWAjIM84Zqiv5ynOt/G5PrrpgGUlSSuMGkKCmfxzGDFOK2dduJhH40pjyMWasSwEPBgFbGA9dAdWNeiJ6SvmksVYmlUNTUVQmoMBxA0W+T0FxsXlIJZlcxDD+8oNTt32bewy3qvaxzpAEEmwVccwXmiLxpjf16uNeMVvqO0SPP6h9eDs06038h9oPYC5eZ4eed/8N28Tr82NJC+dyhNbDwRY97tb/7wJOC7My3LTCAPtCXK+2vpYTILFd0zloVO5biq/aP05jJXk50VuuuWZfX7dVxVDB+qxl8WXgUCmkIH9h7BrwBbXBsahBfZx7JfA55CXCayjBmx06dfXkiS15R+MrQ1Gro9AhLtBCWSo+1NbHqfE4H/qIzMQ3YqUGrQx/uyqUjd6PTI6TI/u4MS6LERF1icHoCAAqL/HFiLLFO+VACTkbY0GLcoow3ASAoVV3Yub4LmbZlQ2MdqvMRCefXFDWz1+LTvfenCzKhhYhS5d9iVdqBxv3PyBUQBI8HXl/JjnBJ6Hq1vPitLVFhnjt7V+jEXG7cWtf4EgoOILB4H6W1s/TiOYz/uEgC6ey7i6k7rwzrUecK7zmtb3LWMQDzF+LQK1WuoXptGxHec6N1PwGWXcPc48Au7ftOM3stTzpZaTurUlSReJaEBpVK/JM3Qw3N27bYBJIEDZNnijgSe7iVGQGDefIL4Y8DpkyjKyYwRjgS8buds2gvl4LeTMcw72eQ83zo/XDRPYBcElgYskSRc1GjMa2311AWp7fAY5+DlL8d83KOfKPDJjuTubjA7BFJmyz8x1/EwGXfR/bD1rSqB5p6l8af77iHm5CAZfPf/lrk5em+5WMmiMX+O5rIMvCwSSvHa+KWEf6F6tmWBJki463FnJz3qsGs+ks8MYo2tTOdRnwBizfHfnJti23L3HdM3u5Wl+CoXfGctyV2eex7bwXDK8J41f2wZDAGLfPrXMkyRJ0hZ+13oWjx+SliRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkv5L/gPCpvpREP/B7QAAAABJRU5ErkJggg==>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAAZCAYAAADQfBuCAAADsElEQVR4Xu2ZTahNURTHl3xESCISehIDJZSRogwokomRYsTAxMiAvJGJAUWSkRQSRQYmJpJEGSBSyETdgSiSCIV87N/bd7nrrLvPuefe+74G+1f/dNZa++599sfa6zwimUwmkxlnzAla4DS/EDE+8WOeFzSxENE/k6W9H+Zrgg0q43TQ3xpqBH1I2FP6KvFFJyV8XnuCpsn4YpG0j9PqlbSP2ceU6X3QyaClQe8Sfqt7UmMRf0kMTrEs6G3QHWffJbEN/yrsmCcSF03ZITGOfz1/pLzfsYQJuyxxcplky3KJY77WfF4ZdFiKJ/K6xBjflnm280UfxLFZLPR/Juhb0FrnK0BjJjEFi/AlaIOx8cPngz4GrTB2uOieOdWpOGBg9D3dO8aYuUEvgm4GTXW+GRLHzDvBfokb1tKQGOPbvgxab57pIxUHhyT6DniHwp1DAINUGLguFIM6bnzALmDSWRQL7R6aZ00JPk6hX2RPaL8c9YYe0GyyyTskTjw+Jp3N+LjoHqLsIDwImm2ey+JYSNYD/07n+48OxL7wPonHHRYHbWy5hkilSWCRr5jnrRLjUmmSewLfb+/oky1Bs7yxS85JHFsqhZ1q+nZLXNgThYjW3c6G9ZD+7CYl7o15Vki/n4KeS6wX2uBHWCCO/TqJlc3qoB9SPNKeRxI7nekdjtuSjtsssdg5JrG6Gm6eBQ14YxdwNTBuhXlhkbA9NfYUehAGvcPBPKfidEN/dvYCpMnXEgOtGkELW2Ft6N3UCa2czhpdbdqYgI5VU4/QD5umV/x8qJjsTmPmbiL9pdKsRbPWLWnNDWP+KbF+8Ke9gF6ApDSFyxd7GQycNno5V0Hcd2/sklVSXPi6uiBxEii/u4E7iHHbOx+417HvdXYLm70h6aLGQh9krfvSno1qkSpb+dGqNEkBQhs6rUKrLy7xfhjthdMFGnR2/b7zVbOFU8Zp8209ZcVdbRoSB2N3Bzm2qjzXF+vUKZuBOL5VRhvGf0k6pJsSSGGpVKd3V9V7awbzbT2aJlNFWy1onCpHy6j6fvPwgh0/IEcIqrEBb6xB2febLc99JW1pSPtBSKHfb2SlruHHaZwqW8vQF+uUmxnQXYmxtBlN+BTodSdrCvOpTt+H+dretB1Rp6HuX4LqFncF2Ik08qoqNnysFd98ir64j7HFz0jTywe4pjgv+z24pmmjGubPegeDpgTdaNpT8lnJ+xFVfSawxBuGEU4bV8A2Gf7/LchkMplMJpPJZDKZFP8AGu4+p/UufIUAAAAASUVORK5CYII=>

[image16]: <data:image/png;base64,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>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJEAAAAXCAYAAAALMa3mAAAFvklEQVR4Xu2aW6htYxSAh1B03M+J5HroPLjUIU4SkltIJOeBIuXFkbyexNNRPFAeCKdck8QDeRLFw3QJoUQuJWoTCSFCIZfxNeYwxxr7n3PNuay99rb3+mrUmv+Ya87/H/+4/WtvkTlz5syZM2dVcqbK3yo7VXZNusxGlS9UdsmKOZ3sq1Kp7JXGVxKXqXyicr/K7knXyXqVd1Vukn6OcYWYwx2SFVOEeVQqN6TxPhAE16hslX7rmRWnqvyiclJWrDCOFNtf9rk3LGrI4r4Se8kTKrsl3VAOVTk4DyoHib2DeQ1ls8pPKguy2NFvTtezYn+Vt8TW9EbSzZo+NmCej+bBLoY6ERuEUNIobf+FLVJ2Irhb5dI82AOyzwUqpxXGH09js+J0le/ENue3pJslfW2wpE50lNgGIZ6NJoUy+qa0O9G0uUpszssBWYjS/IPYHOiPloO+NlhSJ7pSrNR4uSEbdYHnXy/WqJ0so80aEcEzSk5E80mpOysrerCf2DPPUdmzHmMevoHLAXY6XuV5sTnQH7WBjbDZHSr7iDW7UYcd0V1Y67L9CM77xJ4Re8IhNlgyJyILfRau/xJ7WVtf9LHKn+Ha7wec5Or6mh4GQ7B4FoqhDq/vjz3REWKOhyHOr8e4/1Ox9xwt1lRvUnlIbK48l7EDVV6XxmmRPcRAd0qtI2P4OPPguZ+LzW1S6If8gHCMWFmjLyplo/dVngnXl6t8X39mnuhiIKLzfWOcNXBAAmzDNQE8zgaZwU7kKW5DViTIQh+Faz7zvY1hzMFJ0N0TxtiQGAUX19c5khwcKDfWGAznopw6OFZ8D/BsdyKnku4oRLeQxj5UOSONDYV+iCwEZEayEX1RKRux3rh5ZPy368+sPW8sOnci9pE94TsOGZB3OZV028DhHlqN3hDZMWO08ZSMbhaNLy8rHQXZZDb73DBGxjkvXE/iRGwC33kkjL0nizdkEicqpfrXpJwxhnCbNGUVtom9Z0cYc1gv8/BsQ5b3AwLOgu6i+hrQHSAWtJVYQMUS9qyMrqlK1208J3ZfnHeRO8UeyheOHVUV4aEl4chPqYsQMXkTM5M4ERBdbgjScem3pEmcyB3fHZLsUcqyQyCIvIxn+SPc51DuPMO73B70JR0O5y0JmYnylcWppNsGDs6zXeUbWZz9iuDdv+fBBJv1gDS11IUxJkWpiyylE5EN+R4LbdvoSZyIjEOvQuaAHdLe7/WFbP2CLLabO0EJnOIusdKa70N3dtJdJ40T3fjvnWUqaX9v5EVpbNyLPo01KTjWWoc+ipeRjSJEc8m5aH5JveBO5O+t6jGnzYl8sx9TeTnpnD5OxLXPxcEpuYeNp5SVOEzs1NSHr6XphyJeZuiXIvRgMavzY+mC2DyxU874C2LroIQRXKWG/ZLwuZLxNgDu6ZWBnHFO5M1grLWRHC3gJ4W8yUSKR/cWlV+lee9LMmrUNicCShjPx2glSk5EvxDnSY+XMw3Xvp5SVB+n8q2UNyuDvV5R2TsrpOmLPOs5rDeWZ4L0A7F5YadcutGxDjhRrHRyonM4Vb4arvvYAKbmRHhoJY1R84P5HHXZmYhWb76prTTA1PzICWJ6NobfP8AzlEtpbiycMlyK8jwfdyQcmx6C0s374lE5wjG/7U86OM6TYgeRmDUzeQ4x2nHOrHeH5eeKW8TsxU8LP0rjFNgAHT0hOo736GJw09tyjGd+X4rZf13Q97UBc5qKE02LTWIZpi2TUSbb+qIucMi2Z3bBu4jQNt6R0Z8QShDRXU40Kd4y8JsO84z/UeHOwBg67mmD4CoFmDPOBivOiVY6T4sZDYckMnPJKEHPNK6c/Z8Z7ET8fsMfVNeqE1FCMBon0K3SHeGA8/DD3moGezyYB8fB32D44k4Z/09pqw0ODteq3Cv297pxUJ5XK/5PaQ/LgON95FaxB5CVyE5z1haUr5/FTuJrLZHMWQ7+AW7/lJBWtACgAAAAAElFTkSuQmCC>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABNUlEQVR4Xu2TsWoCQRCGR4KFIKaLWIgoEkgT0griG8QiNoKlT2BSSNLEV9AynYW1reWhTcp0CQFBH0BSBzHx/2/3cut6p3fW+eDDvdm92XFvR+SfU0nAS+jAIczp+DO80OOj3MA5vDZij/AXDozYQc7hFJYD4q/wzoqH4ojaOYguTNvBMJYSnijy3yIsn4noB7yCZzsrItKAG/GTUT6nzEVxYCVP4if7hpWdFTHJwJGoZPfWXCCs4M0OangZmahlTwRRhws7qCnBlajNCG99DSZhFt7qsYsjalcuMinAT/1LeOh9UW3Dj+DBa+PCHX9gR4zs4B1+Gc95UWtmcGzE2VIuXl+xFVjqC3yQ/Qo91rCqx/yaTWMuFqyA50N6sOhPRYfn1dZjVtyDk7/ZGPBlu20iN/NRtpWANJYfssDKAAAAAElFTkSuQmCC>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPYAAAAWCAYAAADzVmFKAAAB90lEQVR4Xu3bv2tTURjG8VeKg7ToVnEoUhHFpQgOIkiHQscW0UXoZv8AUQdpEQyunVpwcSkOru0qnUIddNNNEQvqLl0c/IE/nodzY3JPI6TJvS2B7wcecnPOhUxv3pNzTyIAAAAAAECdjijnlKbyVDlVjD9UxotrAEPkorKjTHWMLSl/lLWOsTr5szfzQQD9OaFsK2e7jL9SrmfjVfNK4bLyVXmQzQHoUzNSZ+7mvjKWD1bkpvJJuaUcy+YADMjF9b/CrmMZ7iJ2Mb9VrmVzACri5bYL23mnXFBGSndUY0X5FmnZ7eU3gBrdUH5Fu7gdv69qeezd9cfKVpQ35wAcAHfq5WgX93flSumO/p1XfkQqcACH4LjyLFJx383mBjGprCsbkQodQA3cod/kgwUvn13YC/lERfzl4cdbL4Pf20Cl5pWP+WDhjPIlUvGbi29aOaqcVOaK60GMKreV18pMNgegT81IXTnvmKeV98WreRNtNdIxU2+qtfgxWevY6aC8C+/HXx/yCQD74478W7kT5e7rAtvteD8R6Z4XUT7y6SOo7t5VcXFfygcB7E/r0ZOPjnpp/US5F3s7eMtP5Wpx7d1ynxwDMOQ6O3Qj0i737L9ZAEPHv7cXi2t39IbyPHo7EvpI+dxj/OUB4IC4mPNjpnX9OQQAANhfMvlRJgpFoCEAAAAASUVORK5CYII=>

[image20]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAABF0lEQVR4XmNgGAWUghggngbEG4C4Fkk8HYhNkPhYAR8Q/wfiX0AsjCb3HIj3AfEBIOZBlUIFMkB8GooVUKXAAORCkCWt6BLIgJ8BougWugQSALniABAroYnDASMQNzNADALZigvADMLprSkMEENy0CXQAAsQO6ALIoMnDBCDcDqZWAAyBIQpBsQaJATErOiCyIBYg5YzQMIJJ/jNQNggBSC2RRcEAg4g9oVxXIH4LxCXMUCSAjpYDMSz0MRAXrwOxPJA3AATBGkGRT3IVaC8BQPMDBBL+oCYE0kcBIKAOALKNkeWAAGQRk0GiO0gAxUYsLtQEogfAjE3ugSpQByI76ILkgtAGfwwA8T169HkSAagYgbkTeoBAKzOLDKqi+mHAAAAAElFTkSuQmCC>

[image21]: <data:image/png;base64,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>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAXCAYAAADpwXTaAAABOElEQVR4Xu2Ur0tDURTHj+jSBIM2FYfNYtFoGhiMLpu1mGcyidgNBsH/wLA6NNw2wTQYCGNxSTAaFES/35175n13vl/O6Ac+cDnncO955773RP75aw7gFbyHp3DVx2fgthXlsQk78BP24A108B3OwiZct+I0VuCjt5ZMjeEBNJe+aOFCnAgYSs5mnMGZaBHnlIXzprIFX+GDZHdFHDyPgyHWeu5Qi2BDrcaJ31D4hjJ4s0XRzTYkfRQ7tii62TGci4OeE1s40c0Wx6lJ7kTf/BB2egEPRb+OEbvwQ7SY71wML+YaVoLYmuhLbvWJJ2Nw4IPPsCV62hOsB3XGC7z1az66+04p/IjZOrvg36ImP3dKeOiRXy/DyyBXGm6259e8yUaQKw1vtit6MfuwnUyXZ150NGQpTEzNF3h/PMUAegNfAAAAAElFTkSuQmCC>

[image23]: <data:image/png;base64,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>

[image24]: <data:image/png;base64,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>

[image25]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAWCAYAAAAinad/AAABGUlEQVR4Xu2UoW4CQRCGp4EKAikkCAQlXOrwqCpMRUXfAI9B11X1FRoEwVSgeAVC8BhEFVhC36GkKf/P3DZ7U+7YEGS/5Evu/lnmdid3iPxzabpwAKfwBTbi/Aq23aIsbuAP/IJVU7uHM9F6ydT+cAsXsVGy9Asb0UzKootWtmCYw08b+nAGr6LNOKcs5rGpvIk26tvCETqwbkOfjWizO1s4h6ChhhLajLO9tqEltBlnmrehZSenm0VwaUNQg0+w6IIH+A2fRY9i4cKhJI/YhB9eNnYFNuARuDt+i46c6IPWsODlZAS33v27d32AP26J7oJNIzm+U8IH97z7zK/iFGzGWTk497N5FH3ZJ6J/DGknCIbDr9jwIuwBzbgxnG6+w1oAAAAASUVORK5CYII=>

[image26]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAWCAYAAACcy/8iAAABT0lEQVR4Xu2XsStFURzHv0JRSlGklJtNZLIqi9Fi9XaLTWwmWU0yyGZgtMhgsRkslFLKopfFnyDx/fq92z3vdPFuPfG7737q0+v8fu/W+53fOeeeB1RUdBQ1uk9P6VYQX6Vzwdg9s/SKvtM7ekAv6Rrtps90Mv2yZ8bpdcOkOfWJOq5J2IkTHhmEFfMQJwIGYJ12390uug0rWF38irRgfbpmD1as9uh39NCFOOiROqzg316qWhljBRyGrb62o2Jlx9BqwUO0Nw56pNWCj2H72D2v+LnghM7HwYKs06cCXsD2cdtZpG90E/mHxBHsthWzQW/oCr1F/rP/Ev1QvZLUZd2dU3SN1GTs0v4gLrSX7+lEY7xMZ7K0D1TgFKybKjxBftf66BmaX2P6Q7EUjEvFKH0MxtP0BfmTUwp0Uh8iW+Yn9DxLlxedoCNxsKLi7/gAcDA8Jv+n54kAAAAASUVORK5CYII=>

[image27]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAABRElEQVR4Xu2Ur0sEQRiG30MNgj9Ag8Ww2MxnVQxn8C8QwX7FbBBMYvRAUIMoBsPVC2Y5sAgmq1kwmiyK6PvetyOzH97e3CJYfOBhd7+5e3dmdmaAf/6aLXpKO3QvqjfpUvScxBT9pG901rU90xvapRPFpnLm6X1uVmzqoRHopQe+oYxp2J8efUOEetmlC67elxrdhwWrV/0IwcnTcAwL3fYNjlG66otlPMGCk4eYikLlr5MaPEPHfLGM1OA2bJ6Tecfg4Iwuu9o6ipsojGYlFNboB92BLT3PFT2LnhV2TndhH140csVLfu2Faamp1zobAiOwl7boeFTXObFJ72DTI7QbtXPFZX79RkGLsN7pBRl+HkFAZ4eWqAJDz8VRdF+JWzpJ6/Q1qm9E95V4gIWf0EN6Qa8Lv6iIpkkfMkzXHIZc50PzBVDyNbRENYWMAAAAAElFTkSuQmCC>

[image28]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAAAWCAYAAAAy/emjAAACoklEQVR4Xu2YT4hNURzHf0IRQ7GQhjyzEwtFFkKzYGGh7CRTZjcpK0IpNrIkJjNKJk0WthbspFcslA2zmWInNYspVjYkfh+/d5pzf+77c7nvzbl1P/Wte37nve753t/5nXPPFampqampqVkexlTTqqeqa1F8QrU/aqfOFjEvL8S8bG/FV4h5qQQbVL9U31WbXd+C6qWqqVqf7UqSWTEv1yXr5aCYF/qaUTxZtqnettTIdv2BWYeZm74jQfDCWPGSR2W8bBQb6AffEUGVNFUjLp4aLFl42eE7IvBC1STthbX2hpgZZlI7QmJSXsbwgg/Uif/1ska11wcjGMc5HyzKPTEj532HY5Vq1AcTgodRxMuwDxaEe1B1nnHJjxfms5iZQZf11oLiwXdip5iXQS1RjOei6oCLcf849s/0UvpV4IqYj0nf0WdIzqKUWCmBXhOzSbXaBxOChODjgu9wMKvxUhahcr6IvYqXRq+JeSK2NqcKCcHHGd/hYG/AS1n0rWJ+SPfENFSHXey4ZA9uoZqOqNZG8XZ8Kih/4PUcEvPS7WzyTv72AqOqkz7YBaqFpLCncD3eui6FY6qfqsuSv8E+Vj2I2jygh6qrYpstHG0Jvkr3Wdsv8MIkw4tnnZgXvxzfV81Hbca/J2q3o+9vZSSDm2CIb2OBlWJGb0u2AvhOdlr1RpaWBGYpp214JEtJGjR4YZLhJa4wvHwU8+Lh9/H5jf+eiNp5cB8mZd43w9Irh8HvEqsOEtSQ/AoKhNdSEhIqB+7K8u9FeKFq8HJWzEsevIY/FzswAuPGC6/eleWVaki1T/Utip+KrlOHL8+zUXu36o50npDJ814sOVOqW6oZ1bPML6rBazEfc6pLrq+SMKtYx8PsYvb5jbUKBB8sfzU17fkNhtCGisuInsYAAAAASUVORK5CYII=>

[image29]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHUAAAAZCAYAAAAPMmGdAAAD5UlEQVR4Xu2ZS8hNURTHl1CeeZOQj6REHnlNJAOPgUgeGTAwwcQEIUo+ZIqIgUeKQlEI6YvBLQPKAEVKFBJFMmJAHutnne3uu+8533347nfPdc+v/t1z1nm0z15rr732viLNRz9V99DYQAxQdQmNzcw01dDo+KHqV6Rvf+8Q2e/ZL3j2zqararHquGqlZycgz3rnTU1P1bXANkn1XjXWs3Hf1ei3nhxV7VGtV31Rjfau0e5R3nlFrBWLFD5yt2ffqJrhnacd0tUZ1ZHwgtiIvBwdcx+dmYb0TLtORccjVS9Vw/KX5YFYKi6byap7Yi9+ojqhyqk2iaWFd1IY3fWmt2qVWDv3SvGcM1j1VLU8sMNbsdEKK8Tm3CTo1LlS6HT6Y4JYG3zmqKZH9oVS3KZSPFJtiI6Hq15Hvw7OZ3rniRARRABqKbz0B0Yujj4QXqgjs1SrxToNLRJr4x3vniVSnGYdS8Xub5PCFOczRbVT7P1DVDcjO/c7+xqx9wDOJ5BoQ4tqi1h2qwYCiCzDd/rkVDsCWyzPxRqWFK04ncimI9JAD9UV1YjA7godB04NI93Bs69UswO7g7n1umpMdH5MtU3VTSw9OjuO+xQdMzW5voLxkh/J/cXakaQQsofLJD45KTG4iDRX9TEak+gj9jJ+0wAjjw/+qZrv2ck0fIvrpPacynM8n0TSdd7pBw5znj9n75K8U6uF0TkuOsYvBIQjJyVGKrmfCuu+JI9ScE5NC4yWw6obUtju0KnMb9QBpNEQoj3OaQ7mra+BrZcUO/W72Jy9OTonRbs0XQ2kdlfAAfVCX++cbyQ7JEJE0cC4OacjGSTF6aY9VZsRwvTrgtGf11iv3pX8vQe9ayFTVZfEOvaQWColu1E4nlbdFiso2yRfRH1WzYuOq8G1yylMtRR+4bRTgHswrOA6Gua/NxVonz1WEazf+Jbzgb1VCiO/UggCt3Hhg40KGGdSHDlqvfPDxgiZKpEwspMYKOlYwyWxXew7kqaQrVLbju4smF9L+qFcp7J2qnWK/heY19pLo3QE1WQjQ+F0KzTGUa5TSw75OkKl2Cr5CCYlohCq/DQHZimYW1kulSQn5lQKmThIZxQDcamLteIyKW8vslaF0mPVusDGZkC5z/+XLFD9EJuT4hx3TqzyC2ERTkqmA+nYuGdrDQFHJXhSrI2IijRuwd504JAXYiP2g9gmPn9JPYuuhbAm8zcqWLehzsStr8Pyv9zppClwm9NEO//OtEi8Q0m5LKz9uYk1YGc7NaMDYcOabTHHRNVHiQ+AjAbBbWa7P5IvSplldkb6oZqN22XJyMjIyMjIyGh4fgMescXqVRMKmAAAAABJRU5ErkJggg==>

[image30]: <data:image/png;base64,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>

[image31]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAZCAYAAADqrKTxAAAAo0lEQVR4XmNgGLJAAIh50AXxAREgvgrE/7FgosAaBohiaXQJfABmIwe6BD4A0vAPXRAfYGSAaHqAJo4XmDJANJWjS+AD6QwQp7mgS+ACsGDfykBCIICc9o2BDKeB/GODLgEDPxkgCtSgfHEgvg4VY4EpQgewJMIJ5WdA+SDDcIIeIP4BxBFAvAiI7wCxEwMknnACkCTIabOAuBGIWVGlR8EAAwDWdyMYQgrsywAAAABJRU5ErkJggg==>

[image32]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAYCAYAAACbU/80AAABe0lEQVR4Xu2VTStEYRTHj1BEyYaE8rZRig9go1iarFDsfAE7kbKysBSWFpRsbG2sZiXFkmwpL6V8AoX/v3Nn5tzjPrfbzGBzf/Vr5pznvjwv5z6PSE6OsgK/MvoW3VNX3uG6iZvgGXyFQyY/BT9MXBda4bLLTYq+aNvlx+Gdy9XMKBx0uTXR6Z52ecaXLvcrPIh2oMXl/wxOPzvwL3DUfPmTb0hgGM7BRtgQ/YZY9IkQvaIdOPcNDtbOMVyCRbgXa40zAl98MgQL8FN+FqDlFO6buA/emNhzK7qs/LxT4fRz5Jx+PjQE94cNE/fAIxNb2uEMfIz+p8JRc/T24UlciS7TM9wVXf8k+uGJ6IuLoh1NhA1j8EL0wQeixdUNm811JSbgvVS259V4c5kdWJBKB+yuWjVdLuZOyun1o2PenyNpdZWZTZ8A17DT5RYkvjQs7lkTVwWnkAVYWhZ+9zzEOspXKIdwy+XmRTtREzwz2kRrg6MZkHAB5uRk4ht8Ukdq46U4ewAAAABJRU5ErkJggg==>

[image33]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAYAAADJ9/UkAAABYUlEQVR4Xu2VzSpHURTFt3xElIGRfBQzYyPFQDE1MlAYGXgE8RxeQKYMzYwpD2CmKKWUGQPJx1qdg30W5/z/ujcG7q9Wt71395579l37XLOG/8oG9NqmbuM9tXEHbbu4CzqAbqBJl5+HnlxcC2fQkItHoEvoCOp1+WHo3MWVmYImJLdlocULkmd8IrlK8IFss4ct5+K+5WQO2pVc7fC7cvE/gQu/aPI3oNm4OM3WCrr/fQTvofW0/EEHdA2NakGhB/iwHS1koC84kn4qlGnoIV6L0OlsuTo9x5KV/dEH7Vvw0azUEnLzXeLYwj05DqExCy+4KrUE7pa7brflhC0v+WMtXrk4u5rQEwvficcuD6ESuU/UbemZwLbvubgyAxZazs+lLELPlm6m1KGWzECP9vkfoNm+tDKyKfEVdCG5H7FiYQc8jgctmE1nlzNNV49L/tTCC1SiH1q24IVOqTU0FHkD0phQqcBMK9QAAAAASUVORK5CYII=>

[image34]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAZCAYAAABzVH1EAAACaUlEQVR4Xu2WvWtVQRDFjySCwQRR00gSeAQbC22M2BgwYAIhxELFRiubWFgpaBUsxH/AwsLEQiQKYiEEG7UIpFCwsVAEsVAQhUBKiyh+nJPZzduMd6958D6a+4PD483cu3d2Z3Z2gYqKjnCeuk09oWYT+ww1kvwX26h9TnuDvWMcol5Sf6i31B1qibpEdVFfqeH4cOAI7PmcNJ7ebQuD1Oug2mbXOsqQgrrpHYE+ahn2/m7nG4O9e8PZW8IH2Md2eUdAE/1CnfSOwAFqlbrlHbBS09jvvKOZqI61UvqQVj1HL6zE9FuEMqUxNCHPOZjvqXc0k8PUd+oV8tkQcSI5XsCCVYml9FCL1Bo16nxNReWiAPwGbpS4sYWyrFKcpn5Tz+JDrSQGsNM7GiTtUqlqyTMtJV3JMvZQ270xoGxqDL/R1Rh+UcedPWWB+oF6HDp/itgPa/1ZtjqRN8iXnwLWGKecPZ4v15y9CJXgCW9MmMd/4tzqRB5S3d4YUMdS6/UdK3Yr3QbKUCP5RA04e4oO55/Ix7DeicpSqk72HPnrRu786IedG/r4MefzTKI8axdhZ9Fn/HvYbjAOq+OrKA72PuyakiNXVvHDau1q8VrJB5ueqKOM5spqCLaPYvvXuFk0gY+wgFZgF0VtwPfBV8Q91MsyVZr6qWDTQaibw+nEF9G++0bt8I7AHKzJaNzHsEUpRZc6lYlWX7feGvKTaIR4iz6K4vFiRovQYeoXKpe5tqOVVeO4EP4vwTa6RwfqI2fTPrrsbB1DzUPXoYPhv5rBlbp7g7vUdWc7i/Km0HZUYmeoCe+oqKhoPn8BH2qKlLgJkdIAAAAASUVORK5CYII=>