# **The Oblio Business Operating System: An Exhaustive Architectural Analysis of the Pipeline-to-Asset Model**

## **1\. Introduction: The Paradigm Shift to Economic Physics**

The contemporary landscape of customer relationship management (CRM) and business intelligence has historically been defined by static ledgers—passive databases that record interactions after they occur. The Oblio Business Operating System (BOS) represents a radical departure from this convention, re-imagining the commercial enterprise not as a collection of records, but as a deterministic, physics-based computational engine. By defining the organization as a "Solipsistic Space," Oblio establishes a closed thermodynamic system where business operations obey conservation laws analogous to those in physics.  
This report provides a comprehensive, expert-level analysis of the Oblio system, specifically dissecting the hierarchical data model: **Pipeline \\rightarrow Campaign \\rightarrow Asset Group \\rightarrow Asset**. This hierarchy is not merely a taxonomical convenience but the structural backbone of a "Real-Time Strategy" simulation engine designed to optimize the "Cost-to-Value" chain. Through a rigorous examination of attributions, identifiers, naming conventions, and programmatic generation logic, this document elucidates how Oblio transforms the chaotic entropy of the marketplace into a structured, predictable, and optimizeable "Rational Metric Space".

## **2\. Theoretical Foundations: The Physics of Commerce**

To fully comprehend the logic governing the Pipeline-to-Asset hierarchy, one must first deconstruct the theoretical framework of "Economic Physics" that underpins the entire operating system. Oblio posits that commercial entities exist within a finite metric space where standard business dimensions can be equated to physical quantities.

### **2.1 The Solipsistic Space and Conservation Laws**

The concept of "Solipsistic Space" serves as the foundational ontology for the system. In this model, the organization (System A) functions as both the observer and the actor within a closed loop. The external reality of the market is filtered through the organization's specific ontology, meaning that for the system, nothing exists unless it is defined within its internal tensor.  
Within this space, the system enforces an **Equivalence Principle**, asserting that **Money, Debt, Time, and Energy** are interchangeable forms of the same fundamental quantity. This theoretical stance has profound implications for the data model:

* **Cost as Energy:** Expenses, such as employee salaries or advertising spend, are treated as energy expended by the system. While these costs are incurred continuously (like metabolic burn), they are typically ledgered periodically.  
* **Value as Potential Energy (U\_p):** Products are not static inventory but reservoirs of potential energy. The features, pricing, and contract duration of a product define the maximum potential value that can be extracted from a customer interaction.  
* **Revenue as Kinetic Energy (U\_k):** Revenue is the realization of potential energy into kinetic motion—the active flow of value back into the organization.

### **2.2 The Cost-to-Value Chain**

The operational logic of the entire hierarchy is driven by the **Cost-to-Value Chain**, a linear progression designed to optimize the conversion of energy. The chain is expressed as:  
The primary objective of the Pipeline and Campaign structures is to manage the efficiency of this chain.

* **PAID (The Transaction Event):** This is the bridge where energy (Cost) is successfully transformed. The system bifurcates this event into **FTP** (First-Time Purchase), the initial transaction, and **RTP** (Retention Purchase), which sustains the system's momentum.  
* **Value and Debt:** Uniquely, the model views all received money as a form of debt distributed back into the system, emphasizing the cyclical nature of commercial energy flow.

### **2.3 Maxwell’s Demon and the Causal Bottleneck**

In a high-entropy market, identifying high-value signals is computationally expensive. Oblio utilizes AI agents acting as "Maxwell’s Demon" at the "Causal Bottleneck". This theoretical construct explains the rigid naming conventions and identifiers found in the Asset hierarchy: they act as filters to reduce entropy. By enforcing strict schemas and rejecting unstructured data (free text), the system minimizes "noise" and maximizes the fidelity of the signal passing from the Asset level up to the Pipeline level.

## **3\. The Ontological Tensor: Data Architecture Fundamentals**

Before examining the hierarchy levels, it is necessary to define the data objects that populate them. Oblio rejects standard relational SQL models in favor of a "Tensor" or graph-based architecture, where the **Product** serves as the "seed" for all downstream relationships.

### **3.1 The Product Tensor**

The Product is the absolute origin of the system's ontology. It defines the "physics" of the commercial universe—pricing, billing frequency, and contract duration. The Product Tensor is composed of three granular elements that dictate how Assets are generated and named:

1. **Features (The "Thing"):** Features are strictly defined as **Nouns**. They represent the tangible components of the product (e.g., "API Access," "Tutor"). Naming conventions limit features to 30 characters and a maximum of two words to ensure atomic clarity.  
2. **Solutions (The "Action"):** Solutions are strictly defined as **Verbs**. They describe *how* a feature solves a problem (e.g., "Automating," "Learning"). Like features, they are limited to 30 characters.  
3. **Use Cases (The "Context"):** A Use Case is mathematically defined as the intersection of a Solution and a Persona Property (U \= P \\cap S). This intersection defines the narrative context for Campaigns and Assets.

### **3.2 The Logic of Personas**

Personas in Oblio are not vague narrative descriptions but rigid data structures ("Audience Vectors"). They are categorized into three distinct types that fundamentally alter the targeting logic of the Campaign hierarchy :

* **Decision Makers (DM):** The primary target who holds the budget and authority to transact (e.g., Parents in a B2C education context, Directors in B2B).  
* **End Users (EU):** The individuals who utilize the product but may not have purchasing power (e.g., Students, Staff).  
* **Influencers (IN):** Entities that sway the decision but neither buy nor use the product (e.g., Teachers, Consultants).

This "Dominance Logic" ensures that the hierarchy prioritizes the path of least resistance to revenue, typically prioritizing DMs over EUs in the "Cost-to-Value" calculation.

## **4\. Level 1: The Pipeline**

The **Pipeline** represents the highest level of the acquisition hierarchy. It serves as the strategic container, aggregating Product Types and Opportunity Types to facilitate high-level forecasting and reporting.

### **4.1 Definition and Scope**

A Pipeline is defined as the structural relationship between a **Product** and the market entity (Contact or Account). It determines the fundamental commercial nature of the engagement, such as Business-to-Business (B2B), Business-to-Consumer (B2C), Partnerships, or Reseller agreements.

### **4.2 Programmatic Generation Logic**

Pipelines are not manually instantiated by users in an ad-hoc manner. Instead, they are programmatically generated based on the **Product Type** attribute of the Product object.

* **Mechanism:** When a user defines a Product and selects a type (e.g., "B2B"), the system's generative logic automatically constructs a corresponding Pipeline.  
* **Grouping Logic:** The Pipeline acts as a "collection bucket," grouping all Opportunities of a specific type with Products of the same type. This ensures that the system's reporting engine can aggregate "Kinetic Energy" (Revenue) accurately without manual sorting.

### **4.3 Identifiers and Naming Conventions**

The Pipeline is identified by a strict combination of attributes that define the "physics" of the enclosed opportunities.  
**Primary Identifiers :**

1. **Product Type:** The category of offering (e.g., B2B, B2C). 2\. **Opportunity Type:** The stage of the lifecycle (e.g., MQL, SQL).  
2. **Persona Type:** The target role (e.g., Decision Maker).  
3. **Use Case:** The problem being solved.

**Naming Convention Formula:** The system generates Pipeline names using a concatenation formula to ensure uniformity across the Solipsistic Space:  
Pipeline Name \= Product Type \+ Opportunity Type *Example:* B2B • MQL or B2C • RES.

## **5\. Level 2: Campaigns**

Descending the hierarchy, **Campaigns** represent the operational execution of the Pipeline's strategy. A Campaign is the specific matrix where an Audience (Persona) meets an Offering (Product) within a specific Context (Use Case).

### **5.1 The Targeting Lattice and Matrix Logic**

Campaigns in Oblio are generated via a "Targeting Lattice." The system calculates the total number of required campaigns using a combinatorial formula, ensuring that every possible segment of the addressable market is covered.  
This formulaic approach prevents "holes" in the marketing strategy, ensuring that if a Product exists for a Persona, a corresponding Campaign is generated to capture that potential energy.

### **5.2 The "All" Classifier Logic**

A distinctive feature of the Oblio hierarchy is the **"All" Classifier**. This mechanism introduces flexibility into the rigid lattice structure, allowing for both precision targeting and broad awareness funnels.

* **Generalized Targeting:** By setting an identifier to "All" (e.g., "All Use Cases"), the system creates a Campaign that captures broad, undefined traffic. This is critical for top-of-funnel awareness where the prospect's specific intent is not yet known.  
* **Precision Targeting:** Conversely, setting a specific value (e.g., "Agriculture Use Case") creates a narrow funnel.  
* **Attribution Mechanism:** The "All" classifier plays a vital role in attribution. The system compares the specific data entered by a prospect (e.g., "I work in Agriculture") against the Campaign's targeting fields. If no specific match exists, the attribution logic defaults to the "All" bucket, ensuring no data is lost to the "void".

### **5.3 Identifiers and Naming Conventions**

Campaigns inherit the identifiers from the Pipeline and add granularity regarding the audience.  
**Primary Identifiers :**

1. **Product Type**  
2. **Opportunity Type**  
3. **Persona Type**  
4. **Use Case**  
5. **Before Identifiers:** A reserved field for historical context or pre-qualifying conditions.

**Naming Convention Formula:**  
Campaign Name \= Pipeline Name \+ Persona Type \+ Use Case *Example:* B2B • MQL • Decision Maker • Marketing.  
This naming convention allows any agent (human or AI) to instantly understand the strategic intent of the campaign simply by reading its name, without needing to inspect its internal settings.

## **6\. Level 3: Asset Groups (Ad Groups)**

**Asset Groups** serve as the semantic bridge between the broad strategy of a Campaign and the specific execution of an Asset. They function as the layer for granular segmentation and thematic focus.

### **6.1 Segmentation and Logic**

While Campaigns define the "Who" (Persona) and "Why" (Use Case), Asset Groups define the "What" (Subject). They segment specific audiences from the Campaign using detailed demographic or firmographic properties.

* **Group Subject:** The primary topic or keyword of the group, typically the name of a specific Feature or Solution (e.g., "Marketing Automation").  
* **Subject Type:** Explicitly defines the nature of the focus. Is this Asset Group promoting the *Brand*, a *Product*, or a specific *Feature*?.  
* **Group Segment:** This is the critical differentiator. It relates to a specific property from a Persona profile that is *not* the Use Case (e.g., Industry, Job Function, Location, Employee Count). This allows the system to run multiple variations of a message within the same Campaign (e.g., different Asset Groups for "Directors" vs. "VPs" within the same "Decision Maker" Campaign).

### **6.2 The Seven Key Identifiers**

At the Asset Group level, the hierarchy reaches its maximum logical density, defined by **seven core identifiers**. These identifiers create a unique "coordinate" for the group within the Solipsistic Space :

| Identifier | Definition | Example |
| :---- | :---- | :---- |
| **1\. Product Type** | Inherited from Pipeline. | B2B |
| **2\. Opportunity Type** | Inherited from Pipeline. | MQL |
| **3\. Persona Type** | Inherited from Campaign. | Decision Maker |
| **4\. Use Case** | Inherited from Campaign. | Marketing |
| **5\. Subject Type** | The nature of the focus. | Feature |
| **6\. Subject** | The specific topic name/CTA. | Automation |
| **7\. Segment** | The demographic slice. | SMB (Small Business) |

### **6.3 Keyword Generation Rules**

To ensure alignment between the Asset Group and user intent (Search), Oblio programmatically generates target keywords using a concatenation logic.  
**Formula:** Asset Group Keywords \= Asset Group Focus (Name) \+ Asset Group Audience (Property) \+ Use Case *Logic:* This combines the "What" (Focus), the "Who" (Audience), and the "Context" (Use Case) to create high-intent keyword clusters automatically, reducing the manual labor of SEO/PPC management.

### **6.4 Naming Convention**

The naming convention for Asset Groups is the most complex in the system, reflecting its role as the connector of all other entities.  
**Formula:** Product Type \+ Opportunity Type \+ Persona Type \+ Use Case \+ Segment \+ Object Type \+ Object *Example:* B2B • MQL • Decision Maker • Marketing • Director • Brand • Oblio.

## **7\. Level 4: Assets (Ads)**

The **Asset** is the atomic unit of execution in the Oblio system. It represents the actual media—text, image, video, document—that is presented to the market. However, within the logic of Economic Physics, an Asset is not just "content"; it is an **Action-Trigger** designed to catalyze a state change in the prospect.

### **7.1 The Action-Trigger Logic**

Every Asset must be linked to a specific **Qualification**—a measurable action that signifies successful engagement.

* **Content Page Assets:** The qualification is the act of clicking a specific button to proceed to the next asset (e.g., a form).  
* **Form Assets:** The qualification is the submission of the "minimum contact materials" required to transition the Opportunity state (e.g., becoming an Open MQL). This logic ensures that no Asset exists passively; every asset is a "worker" contributing to the Kinetic Energy (Revenue) of the system.

### **7.2 Attribution Fields and Logic**

Assets are the primary vehicles for attribution in Oblio. They inherit all seven identifiers from their parent Asset Group and add granular operational parameters to track exactly *where* and *how* the interaction occurred.

#### **Table 7.1: Asset Attribution Fields**

| Field | Definition | Options/Examples |
| :---- | :---- | :---- |
| **Source** | The placement of the Asset; the root referring URL. | google.com, facebook.com, brand.co |
| **Referral Type** | Indicates if the source includes a cost. | **Paid**, **Organic** |
| **Medium** | The specific type of rich media used. | Dynamic Ad, Post, Message, Article, Document, Page, Video |
| **Channel** | How the Source distributes the Medium. | Social, Display, Search, Website, Email, Call, Event |
| **Version** | Tracks the specific iteration for A/B testing. | V.01, V.02 |

### **7.3 Naming Conventions and Identifiers**

Unlike other objects, Assets rely on a **Unique Headline** as their primary human-readable identifier.

* **The "Name is the Thing":** Assets avoid context-specific keys like productName. They use a universal name field, with the context derived from the parent object. However, a stable **Numerical ID** is mandated as the "true coordinate" to prevent data loss if the headline changes.  
* **Headline Constraint:** Headlines are strictly limited to **90 characters** to ensure compatibility across ad networks and UI constraints.

**Naming Convention Formula:**  
Asset Name \= Unique Headline \+ Version *Or for Activity Tracking:* Asset Name \+ Workflow \+ Channel \+ Medium \+ Source Type \+ Source *Example:* ThisIsUpToThirtyCharacters • V.0234 • W.00.00.00 • email • message • organic • gmail.

## **8\. Programmatic Generation and Data Architecture**

Oblio distinguishes itself from traditional CRMs through its capacity for **Programmatic Generation**. It acts as a "Spreadsheet Management Simulator," automating the creation of complex data structures to reduce the "entropic friction" of manual data entry.

### **8.1 The Fetch-Transform-Display Pattern**

The system employs a rigorous architectural pattern to manage data flow between the backend (Firebase/Firestore) and the frontend (Flutter UI). This pattern ensures that the "Solipsistic Space" remains stable and performant.

#### **8.1.1 Records vs. Structs**

The architecture strictly enforces a separation of concerns:

* **Records (\*Record):** Heavyweight backend objects used for database interactions (Fetch, Write, Query). These contain metadata and DocumentReference pointers.  
* **Structs (\*Struct):** Lightweight, immutable data transfer objects used for UI rendering and state management.  
* **The Golden Rule:** "Records \\rightarrow Database, Structs \\rightarrow UI." Records are immediately converted to Structs upon fetching.

#### **8.1.2 Immutable Update Flow**

1. **User Interaction:** A user modifies a value in the UI (e.g., changes a Campaign Name).  
2. **Local Update:** The system creates a *new* immutable instance of the Struct with the updated value (using update\*Struct()), rather than mutating the existing object.  
3. **Save:** The new Struct is converted back into a Firestore-compatible map and committed to the database.

### **8.2 Simulated "Game Clock" Mode**

The system features a **Simulated Mode** that treats business operations like a Real-Time Strategy (RTS) game.

* **Synthetic Data:** AI models deterministically generate synthetic contacts, accounts, and engagement histories based on seed data.  
* **Time Advancement:** Users can advance the "Game Clock" (e.g., skip forward one month) to test strategic outcomes and forecast revenue.  
* **Finite Capacity Logic:** The generation is constrained by "Finite Capacity." The system calculates the maximum number of actions a team can physically perform based on working hours and average activity duration. This prevents the simulation from producing unrealistic forecasts where infinite calls are made in zero time.

### **8.3 Automated Logic and Triggers**

Programmatic generation extends to the creation of business objects based on triggers, ensuring the hierarchy builds itself :

* **Pipeline Generation:** Automatically generated from Product Type.  
* **Campaign Generation:** Automatically generated from the Product/Persona/Opportunity matrix.  
* **Asset Logic:** If an Asset is generated with missing fields (e.g., no ad copy), the system automatically triggers an **Asset Activity** for a human user to complete the data.  
* **Account Resolution:** If a new contact is added with a business email, the system automatically attempts to link them to an existing Account or triggers a "Research Activity" to create one.

## **9\. Opportunity States and Qualification Logic**

The flow of data through the Pipeline \\rightarrow Asset model is not random; it is governed by **Opportunity States** and **Qualifiers**. These act as the "physics engine" determining the movement and velocity of particles (Contacts) through the system.

### **9.1 Opportunity States**

Opportunities are discrete logical boundaries. A lead is either in a state or not; there are no "fuzzy" percentages.

#### **Table 9.1: Opportunity State Definitions**

| State | Definition | Trigger / Requirement |
| :---- | :---- | :---- |
| **MQL (Marketing Qualified Lead)** | The genesis state. | **Trigger:** Minimum Persona Match \+ Engagement (e.g., Newsletter sign-up, Demo request). |
| **SQL (Sales Qualified Lead)** | The activated state of intent. | **Trigger:** Explicit intent (e.g., Shopping cart filled) \+ Decision Maker confirmed \+ Consult scheduled. |
| **FTP (First Time Purchase)** | The point of transaction. | **Trigger:** Payment confirmed \+ Contract signed. |
| **RTP (Retention Purchase)** | The recursive state for LTV. | **Trigger:** Onboarding complete \+ Renewal/Upsell engagement. |

### **9.2 Qualification Triggers**

Movement between states is controlled by **Qualifiers**—Boolean logic gates.

* **The Chain Reaction:** "Winning" an Activity (marking Qualifiers as TRUE) automatically triggers the creation of the next Opportunity Type. For example, winning an MQL Opportunity (by verifying Persona and Intent) automatically opens an SQL Opportunity.  
* **UX Enforcement ("Stupify"):** The system enforces this logic via the UI. Users cannot arbitrarily move a deal; they must check off the Qualifiers in the Sidebar. The system prevents submission until conditions are met, ensuring data integrity.

## **10\. The Activity Engine: Kinetic Energy**

The entire hierarchy exists to facilitate **Activities**. In the Oblio model, Activities are the "atoms of work" that inject "Activation Energy" into the system to overcome market friction.

### **10.1 Activity Archetypes**

Every operation in the system is categorized into one of four rigid archetypes :

1. **Data Activities (Research):** The creation or enrichment of records.  
2. **Asset Activities (Creative):** The generation of content (Assets).  
3. **Engagement Activities (Kinetic):** The direct transfer of Assets to Contacts (e.g., calls, emails). This is the primary source of Activation Energy.  
4. **Admin Activities (Approval):** Governance and validation.

### **10.2 Capacity Planning**

The system tracks the **Actual Duration** of activities via a "Sidebar Paradigm," where users must keep a sidebar open to perform tasks. This allows the system to calculate the precise energy cost of acquisition and enforce finite capacity limits on the programmatic generation of tasks.

## **11\. Case Study Implementation: Spires / Profs URL Structure**

The "Profs / Spires" documentation provides a concrete, real-world application of the Oblio naming and structural logic, specifically regarding URL hierarchies for a tutoring platform. This case study demonstrates how the abstract hierarchy translates into a tangible web structure.

### **11.1 URL Hierarchy**

The URL structure mirrors the Asset Group segmentation logic, creating a nested hierarchy that serves both SEO (Search Engine Optimization) and user navigation:

1. **Subject:** website.com/mathematics/ (The broad Category/Campaign).  
2. **Level:** website.com/mathematics/a-levels/ (The Segment/Feature).  
3. **Module:** website.com/mathematics/fundamentals/ (The Specific Detail).

### **11.2 Content Blueprints**

Pages are categorized to align with the **Subject Types** defined in the Asset Group model:

* **Product Pages:** Core offerings (e.g., brand.co/tutors/\[tutor-name\]).  
* **Feature Pages:** Components added to a purchase (e.g., brand.co/subjects/biology/a-level).  
* **Solution Pages:** Addressing challenges (e.g., brand.co/services/academic-support).  
* **Use Case Pages:** Targeted reviews/social proof (e.g., brand.co/reviews/parents).

### **11.3 Persona Targeting**

The content strategy explicitly targets the three Oblio Persona Types, tailoring the "Asset" (Content) to the specific audience vector:

* **Decision Makers (DM):** Parents. *Focus:* Reliability, Results.  
* **End Users (EU):** Students. *Focus:* Relatability, Empathy.  
* **Influencers (IN):** Teachers. *Focus:* Expertise, Data.

## **12\. AI Orchestration: The "Real Team" Pattern**

To manage this complex, high-dimensional hierarchy, Oblio utilizes an AI architecture known as the **"Real Team" Pattern**. This involves instantiating specialized sub-agents with sharded contexts to ensure data integrity and system health.

1. **The Architect:** The coordinator. Monitors global system health and holds the "Constitution" (Level 0 rules).  
2. **The Physicist:** The data scientist. Manages the mathematical models (Rational Trigonometry, Entropy), calculates capacity, and runs the attribution logic.  
3. **The Librarian:** The data steward. Enforces the strict schema (No Free Text), validates entries, and manages the "Sequestering" of noisy data.  
4. **The Creative:** The generator. Uses Context-Free Grammar to programmatically generate Asset headlines and copy based on the Product-Feature-Solution tensor.

## **13\. Conclusion**

The Oblio Pipeline \\rightarrow Campaign \\rightarrow Asset Group \\rightarrow Asset model represents a sophisticated synthesis of economic theory, physics, and data architecture. By rejecting the passive nature of traditional CRMs in favor of a deterministic, generative simulation, Oblio provides a rigid yet flexible framework for optimizing the Cost-to-Value chain. Through its strict naming conventions, mandatory identifiers, and "Solipsistic" logic, the system effectively reduces the entropy of the marketplace, transforming the chaotic noise of customer interactions into a clear, actionable signal. The result is a Business Operating System that does not merely record the past, but actively computes the future.

#### **Works cited**

1\. Oblio AI Agent Data and Model Research, https://drive.google.com/open?id=1m16ERb827AJG1XsbUT\_uq5ECMd6KKUkMid0vtrk3Wz8 2\. Oblio Model : a causal bottleneck, https://drive.google.com/open?id=1kw0hUPwOpV0ArXt9-tyKYTM2o6Eik\_cyhGMvw\_BFbR0 3\. OBLIO Chat Dump, https://drive.google.com/open?id=1VJz3pp2uAwyja9ZXEaYCZkAql2p5KkqkquugCQb2PXs 4\. Merging-Oblio-System-and-Architecture, https://drive.google.com/open?id=1BmAtvZAoZPsmJ5\_2d4hq6gHADpQVRoNJH-pcmY3dwyg 5\. Oblio Activities and Opportunity Model, https://drive.google.com/open?id=1lB38UXkEChYzelgrZRvFEpYWJU5g7R6rCZ05O56XfRQ 6\. Oblio Documentation \- 9.) Oblio Data Asset , https://drive.google.com/open?id=1izQ-Y8zAkWJqCu1yBcyzC5gs1DzcOvQIbxx2bhpAxC8 7\. Oblio Admin?, https://drive.google.com/open?id=1z5zWO1EsnP-G5FAnPxw6eTo2wa9\_A\_yyzV\_5pJl8dRI 8\. Profs / Spires \- URL Structure Doc, https://drive.google.com/open?id=15tTIenxrxgOu1E5kR-Rxs40a5VungF7x\_R7FGidbk\_U 9\. Oblio-Data-Model, https://drive.google.com/open?id=12jac7ENuo13K3dcjpCpWyVNgL02eqos-8odWoxoaXis 10\. Oblio Documentation \- 6.) Primary Fields, https://drive.google.com/open?id=1ievh0LBYtcYRcv2qvioJFtG6qGP3Kouh-cZVrdBx3UU 11\. Oblio GPT, https://drive.google.com/open?id=1UbXfoDxxLcCsOy230Uo-gvExhnEBF98jwg-73IM4gJI 12\. Oblio Documentation \- Meta, https://drive.google.com/open?id=1jcpYLzZyMuEYjhNTK1YV49ShOF5BKd1vqknemUzTwlc 13\. Oblio Documentation \- 4.) Data Modelling v3, https://drive.google.com/open?id=1IU9vmBg39FZSNfsfaIugdNMVI8YXpEqa8\_eGHCnhn1Y 14\. Oblio-Activities-System-Design, https://drive.google.com/open?id=1ezbNydakqQgpCBQQBKf3vuo7E-gtlznRQilJU9uH22Q