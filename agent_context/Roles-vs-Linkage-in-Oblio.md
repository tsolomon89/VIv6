# **Phase 10 Architectural Review: Thermodynamic Optimization of Relationship Dynamics and Role Ontologies in the Oblio Business Operating System**

## **1\. Executive Summary: The Kinetic Necessity of Linkage and Automation**

In response to the architectural query regarding Phase 10: Relationship & Role Management, specifically the prioritization between "Roles" and "Linkage" and the implementation of a RecordPicker for the Oblio Business Operating System (BOS), this report provides a comprehensive analysis grounded in the system’s established frameworks of Economic Physics, Solipsistic Space, and Entity-Attribute-Value (EAV) graph architecture.

**The Answer:** You must prioritize **Linkage** (the structural integrity of the Object Graph) before attempting to layer a **Role System** (the permission or persona logic) upon it. However, the proposed solution of a manual RecordPicker component is fundamentally misaligned with the Oblio "Stupify" philosophy and the "No Free Text" data integrity constraints. It introduces entropic friction into the "Causal Bottleneck" of data capture, artificially inflating the "Actual Duration" (![][image1]) of "Data Activities" without generating corresponding "Kinetic Energy" (Revenue).

**Strategic Recommendation:**

1. **Prioritize Basic Linkage:** Establish the graph edges between Contact and Account immediately. A Contact cannot exist as a free-floating particle; it requires the gravitational context of an Account to possess a "Use Case Vector".1  
2. **Reject RecordPicker for Automation:** Replace the manual search component with an **Automated Account Resolution** engine (Algo 2\) that deterministically resolves Contact.Email\_Domain ![][image2] Account.URL ![][image2] Account.ID.2  
3. **Redefine Roles:** The request to add "Admin" or "Viewer" roles conflates **Tenancy Membership** (SaaS Access) with **Commercial Personas** (Buying Power). The "Roles" system must be architected to distinguish between the internal "End User Types" (e.g., Sales Senior, Marketing Junior) defined in your role modles.csv schema 3 and the external "Contact Personas" (Decision Maker, Influencer) required for the **Revenue Forecast Integral**.1

This report exhaustively details the theoretical justifications, schema implementations, and kinetic consequences of these recommendations.

## ---

**2\. Theoretical Foundations: The Metaphysics of Commercial Space**

To properly architect Phase 10, one cannot view the Oblio system as a mere collection of database tables. It is a simulation of commercial thermodynamics, where every data object and user interaction is governed by conservation laws. The architecture of "Linkage" and "Roles" must adhere to these immutable physical principles.

### **2.1 The Solipsistic Space and the Object Graph**

The Oblio system operates on the ontological premise of **Solipsistic Space**.1 In this model, the commercial enterprise exists within a closed "Universe" where objects do not have objective reality outside the tenant's observation. A "Contact" is essentially the "shadow cast by all observations" (Activities) that reference a particular identifier.3

#### **2.1.1 The Contact as a Vector Particle**

A Contact is modeled not as a static Rolodex entry, but as a vector particle traversing the market space.2 It carries "Mass" (Potential Value derived from the Product Tensor) but requires "Activation Energy" (Engagement Activities) to overcome the "Static Friction" of the market.1

* **State Determination:** The Contact exists in discrete states (Suspect, MQL, SQL) separated by "Finite Logical Boundaries".1  
* **Trajectory:** The Contact moves towards a "Purchase State" (Absorbing State in the Markov Chain).  
* **Quadrance and Spread:** The relationship between the Contact and the Ideal Customer Profile (ICP) is measured using **Rational Trigonometry**. "Quadrance" (![][image3]) measures the distance, while "Spread" (![][image4]) measures the divergence from the optimal path.1

#### **2.1.2 The Account as a Gravitational Field**

The Account represents the "Tenancy" unit or the "Massive Body" that creates the context for the Contact.3 In B2B mechanics, the Account creates the gravitational field that defines the Contact's potential energy.

* **Contextual Necessity:** A "Director of Engineering" (Contact) has no definitive "Use Case" until the system knows they are employed by a "Series B Fintech" (Account). The intersection of *Persona* (Contact) and *Solution* (Product) creates the **Use Case Vector**.1  
* **Ontological Constraint:** Therefore, the requirement that "All Contacts must have an Account" is thermodynamically correct. You cannot calculate the "Spread" (Fit) of a Contact without the Firmographic data of the Account (Industry, Size, Revenue). Without the Account, the Contact has "undefined" potential energy.

### **2.2 The Conservation of Energy in Data Entry**

The **Equivalence Principle** serves as the axiomatic foundation of the system, asserting that Money, Debt, Time, and Energy are interchangeable forms of the same fundamental quantity.4

* **Time as Cost:** In the Oblio model, **Time** is a rigorous data stream tracked via the **Sidebar Paradigm**.2 The "Cost" of acquiring a customer is the integral of the "Actual Duration" (![][image1]) of all Activities performed.  
* **The Entropy of Manual Entry:** Every second a user spends manually searching for an Account in a RecordPicker is "Actual Duration" that is *not* being spent on "Engagement Activities" (Revenue generation). This increases the denominator of the efficiency equation without increasing the numerator.  
* **The "Stupify" Imperative:** The UX philosophy is explicitly defined as **SELECT ![][image2] SETUP ![][image2] STUPIFY**.2 The system acts as a constraint engine that forces users to operate within standardized bounds. The architecture must automate all deterministic processes. Account resolution based on email domains is deterministic; therefore, mandating manual entry violates the system's core philosophy.

## ---

**3\. The Architecture of Linkage: The EAV/ORM Substrate**

The user asks about prioritizing "Linkage." To answer this, we must examine the specific data structures that facilitate this connection. Oblio uses a "Records vs. Structs" architecture to manage the tension between database integrity (Firestore) and UI performance (Flutter).

### **3.1 The Schema of Contact-Account Linkage**

According to the **META Model** 3 and **Data Modelling** specifications 3, the linkage between Contact and Account is not a single foreign key but a complex structure involving historical vectors and cached snapshots.

#### **3.1.1 The work Histories Sub-Collection**

The primary mechanism for linking a Contact to an Account is the work Histories sub-collection.3 This models the Contact's trajectory through different organizations over time.

* **Cardinality:** MANY (A contact can have multiple jobs over time).  
* **Data Integrity:** The fields in this collection are marked as validated, implying they must adhere to the "No Free Text" rule and originate from the **Oblio Data Asset**.5

Table 1: The work Histories Schema Definition 3

| Field Name | Type | Relation | Note | Source |
| :---- | :---- | :---- | :---- | :---- |
| account Name | String | ONE | Name of the Employer | csv / ui |
| account URL | String | ONE | Unique Identifier for Resolution | csv / ui |
| job Title | String | ONE | Functional Role | csv / ui |
| department | String | ONE | Context for Persona | csv / ui |
| seniority | String | ONE | Hierarchy Level | csv / ui |
| start date | Date | ONE | Tenure Start | csv / ui |
| end date | Date | ONE | Tenure End | csv / ui |

**Primary Account Logic:**

The system does not rely on a manual "Is Primary" boolean. Instead, the "Current" or "Primary" Account is derived logically from the temporal data:

* The list is ordered by end date.  
* **Rule:** If end date \== NULL, this entry is considered the **Primary Account**.  
* **Tie-Breaker:** If multiple entries have end date \== NULL, the entry with the **newest start date** is designated as the Primary Account.3

**Implication for Phase 10:**

When the user "Creates a Contact," they are effectively creating a **Contact Record** *AND* a simultaneous **Work History Record**. The UI must reflect this reality. The user is not just "picking an Account ID"; they are asserting that "Entity A is employed by Entity B starting at Time T."

#### **3.1.2 The Account Primary Snapshot**

To optimize read performance and avoid expensive recursive queries on every list view load, the system maintains a denormalized snapshot called account Primary directly on the Contact record.3

Table 2: The Account Primary Snapshot Schema 3

| Field Name | Description | Relation |
| :---- | :---- | :---- |
| account ID | The UUID of the Account. | ONE |
| account Name | Cached name for display. | ONE |
| account Logo | Visual identifier. | ONE |
| account Industry | Firmographic segmentation. | ONE |
| account Opportunity Type | E.g., New Business, Expansion. | ONE |
| account Opportunity Status | E.g., Open, Won. | ONE |

**Synchronization Logic:**

This snapshot creates a dependency. When the work Histories collection is updated (e.g., a user adds a new job via the Sidebar), the system must automatically trigger a re-calculation of the account Primary snapshot. This ensures that the "Account Detail View" requested by the user remains consistent without requiring manual updates to the Contact record.

### **3.2 The Problem with the RecordPicker Solution**

The user proposes: *"Implement a RecordPicker component for searching and selecting Accounts during Contact creation."*

From a systems architecture perspective, this is a sub-optimal solution that introduces several critical failure points:

1. **Cognitive Load (Information Bottleneck):** It forces the user to switch mental contexts from "Entering Contact Info" (Personal Data) to "Searching for Account" (Organizational Data). This context switching consumes "Attention," identified by the system as the scarcest resource.2  
2. **Data Fragmentation:** What happens if the Account does not exist in the database? The user hits a dead end. They must cancel the Contact creation, navigate to Account creation, create the Account, and then restart the Contact creation process. This destroys the **Flux** ($ \\Phi $) of the sales process.  
3. **Redundancy:** The Contact's email address (e.g., john.doe@oblio.io) already contains the unique identifier of the Account (oblio.io). Asking the user to manually search for "Oblio" when they have just typed "@oblio.io" is thermodynamic inefficiency.

### **3.3 The Solution: Automated Account Resolution (Algo 2\)**

Instead of a manual RecordPicker, Phase 10 should implement the **Automated Account Resolution Logic** defined in the System Design documents.2

#### **3.3.1 The Resolution Algorithm**

The system should employ a deterministic logic gate during the Contact creation process:

1. **Ingest Email:** The user enters the Contact's email address.  
2. **Parse Domain:** The system extracts the domain (e.g., @example.com).  
3. **Query Graph:** The system queries the Account collection: SELECT Account WHERE URL CONTAINS 'example.com' OR Name LIKE 'Example'.  
4. **Branching Logic:**  
   * **Match Found:** The system automatically links the account ID to the new Contact and populates the account Primary snapshot. The UI displays "Linked to Example Corp" (Read-only confirmation).  
   * **No Match:** The system triggers the **"Research Activity"** protocol.

#### **3.3.2 The "Research Activity" Protocol**

If the Account does not exist, the system should *not* block the user or force inline Account creation.

1. **Create Contact in "Suspect" State:** The Contact is created with Account \= Pending (or a specific "Unresolved" state).  
2. **Generate Data Activity:** The system automatically generates a **Data Activity** (Type: Research) assigned to a **Junior Agent** (or the current user if configured).  
   * **Task:** "Resolve Account for John Doe."  
   * **Constraint:** The Contact cannot transition to **MQL** until this Activity is "Won" (i.e., the Account is linked).2  
3. **The Sidebar Paradigm:** The user opens the Sidebar to perform this specific research task, ensuring that the Actual Duration of this research work is captured and attributed to the cost of that Contact.

**Verdict on Linkage:** Prioritize the **structural linkage** immediately, but implement it via **Automated Resolution** and **Data Activities**, rejecting the manual RecordPicker to preserve system entropy levels.

## ---

**4\. The Ontology of Roles: Disambiguating "Admin/Viewer" vs. "End Users"**

The user requests: *"Add a 'Roles' system so a Contact can be an 'Admin' or 'Viewer' on an Account."*

This statement reveals a critical terminological ambiguity. In the Oblio ecosystem, "Role" can refer to three distinct ontological concepts. To architect Phase 10 correctly, we must disambiguate these definitions using the provided role modles.csv 3 and META model.csv 3 schemas.

### **4.1 Type A: The Commercial Persona (The "Particle")**

If the Contact is a **Prospect** in a CRM context, their "Role" defines their economic power and decision-making authority within the deal.

* **Ontology:** This is the **Persona Hierarchy**.1  
* **Values:**  
  * **Decision Maker (DM):** The economic buyer with budget authority. Dominant signal.  
  * **End User (EU):** The functional user who derives utility but may not control the purchase.  
  * **Influencer (IN):** A peripheral stakeholder who impacts the process via "Spread."  
* **Schema Location:** Stored in contacts : persona Type and account Primary : account Decision Maker Primary.3  
* **Kinetic Impact:** This Role is used to calculate **Lead Score** and **Spread** (![][image5]). A Decision Maker (![][image6]) has a higher weight in the **Revenue Forecast Integral** than an End User (![][image7]).

### **4.2 Type B: The Tenancy Membership (The "SaaS User")**

If the Contact is a **User** of the Oblio software (or the client's software), "Roles" refer to their **Access Control** permissions within the Tenant Account.

* **Ontology:** This is the **RBAC (Role-Based Access Control)** model described in the Tenancy documentation.3  
* **Values:**  
  * **Admin (Rank 4):** Full access to settings, billing, and user management.  
  * **Leader (Rank 3):** Content management.  
  * **Senior (Rank 2):** Standard contributor.  
  * **Junior (Rank 1):** Restricted access, typically read-only ("Viewer").  
* **Schema Location:** Stored in the user\_accounts table.3  
* **Kinetic Impact:** Determines what the user can *do* within the software, not their value to the sales process.

### **4.3 Type C: The Internal End User (The "Agent")**

These are the employees of the organization *using* the Oblio BOS (e.g., the Sales Representatives and Marketing Managers). The role modles.csv file 3 provides an exhaustive definition of these roles, referred to as **End User Types**.

Table 3: Internal "End User Types" Profile Analysis 3

| End User Type | Operational Settings | Activity Distribution | Financial Settings |
| :---- | :---- | :---- | :---- |
| **Admin** | Accepts Tasks: Yes Work Schedules: Yes | **Full Access:** Creative (All Types), Data (All Types), Engagements (All Types) | Has Bonus: Yes Has Commission: Yes Custom Opp Ownership: Yes |
| **Marketing Admin** | Accepts Tasks: No Work Schedules: No | **Full Access:** Creative, Data, Engagements | Has Bonus: Yes Has Commission: Yes |
| **Marketing Junior** | Accepts Tasks: Yes Work Schedules: Yes | **Full Access:** Creative, Data, Engagements | Has Bonus: Yes Has Commission: Yes |
| **Sales Senior** | Accepts Tasks: Yes Work Schedules: Yes | **Full Access:** Creative, Data, Engagements | Has Bonus: Yes Has Commission: Yes |

**Analysis of Type C Roles:**

* **Hierarchy:** The schema explicitly differentiates between **Admin**, **Senior**, and **Junior** levels within departments (Sales, Marketing).  
* **Permissions:** The activity Distribution columns (e.g., activity Distribution Creative Articles, activity Distribution Data Delete) define precisely what *types* of work each role can perform. For example, a "Junior" role might generate "Research" activities, while a "Senior" role approves them.  
* **Incentives:** The schema tracks bonus Condition and commission Type, linking the Role directly to the **Financial Model**.

### **4.4 Resolving the User's Request**

The user asks for "Admin/Viewer" roles for a *Contact*.

* **Scenario 1 (CRM):** If the user is building a CRM, "Admin/Viewer" is likely a misnomer for "Decision Maker/End User." Using "Admin/Viewer" terminology for sales prospects is physically incorrect because a "Viewer" (End User) might still be a critical "Influencer" in the deal.  
* **Scenario 2 (SaaS Platform):** If the user is managing logins for their own product, then "Admin/Viewer" corresponds to **Type B (Tenancy)**.

**Strategic Recommendation:**

Given the context of "Relationship Management" and "Account Detail Views" listing "Opportunities," it is highly probable the user is focused on the **Commercial Persona (Type A)** logic but using **Tenancy (Type B)** terminology.

**You must implement the "Persona Hierarchy" (Type A) first.** Why? Because the BOS is a "Unified Field Theory of Commercial Architecture".1 Its primary purpose is simulating revenue generation. The **Persona** defines the "Potential Energy" of the Contact. Without knowing if a Contact is a "Decision Maker," the system cannot calculate the "Spread" or forecast the revenue.

**Mapping Strategy:**

* Map the user's requested "Admin" role ![][image2] **Decision Maker (DM)**.  
* Map the user's requested "Viewer" role ![][image2] **End User (EU)** or **Influencer (IN)**.

## ---

**5\. The Activity Engine: Kinetic Integration of Roles**

Phase 10 is not merely about defining static data fields; it is about defining how these fields influence the **Kinetic Energy** of the system. The "Roles" you define will determine how the **Activity Engine** routes work and calculates "Lead Health."

### **5.1 Routing Logic and Finite Capacity**

The system operates on **Finite Capacity Constraints** (![][image8]).2 The "Role" of the Contact dictates which "End User Type" (Internal Agent) is assigned the work.

**The Routing Matrix:**

* **Input:** New Contact Created.  
* **Condition:** Contact Persona \= **Decision Maker**.  
* **Logic:** DMs require high-competence handling to minimize "Spread."  
* **Assignment:** The system assigns the resulting **Engagement Activity** (e.g., "Initial Outreach") to a **Sales Senior** or **Sales Admin**.3  
* **Input:** New Contact Created.  
* **Condition:** Contact Persona \= **End User** (Viewer).  
* **Logic:** EUs are lower value but higher volume.  
* **Assignment:** The system assigns the Activity to a **Sales Junior** or **Marketing Junior**.3

This logic ensures that "Activation Energy" is applied efficiently. Assigning a Senior Agent to a low-value "Viewer" creates "Backpressure" in the system, wasting expensive capacity.

### **5.2 Lead Health and Entropic Decay**

The "Roles" system also impacts the **Lead Health** algorithm (Algo 2).2 Lead Health (![][image9]) decays over time due to entropy.

![][image10]

* **Variable Decay Rates:** A "Decision Maker" typically has a faster decay rate (higher urgency, more competition) than a "Viewer."  
* **Variable Activation:** An interaction with a "Decision Maker" injects significantly more "Activation Energy" (![][image11]) into the Opportunity than an interaction with a "Viewer."  
* **Implementation:** Phase 10 must update the Lead Scoring model to weight activities based on the contacts : persona Type field.

## ---

**6\. Implementation Strategy: The Phase 10 Roadmap**

To execute Phase 10 in alignment with the Oblio Architecture and satisfy the requirements for "Linkage" and "Roles," the following roadmap is prescribed.

### **6.1 Phase 10.1: The Algorithmic Substrate (Linkage)**

**Objective:** Establish the Object Graph without increasing manual friction.

1. **Refactor Contact Creation Schema:**  
   * Remove the mandatory manual Account ID requirement in the UI.  
   * Ensure work Histories collection is initialized.  
2. **Implement Automated Resolution (Algo 2):**  
   * **Trigger:** onBlur of the Email field in the Sidebar.  
   * **Action:** Query Account collection by domain.  
   * **Success:** Auto-populate account Name and account ID (Read-only).  
   * **Failure:** Leave Account fields empty; flag Contact for "Research Activity."  
3. **Implement work Histories Logic:**  
   * When an Account is linked, create a new entry in work Histories with start date \= TODAY and end date \= NULL.  
   * Trigger the update of the account Primary snapshot on the Contact record.

### **6.2 Phase 10.2: The Ontological Layer (Roles/Personas)**

**Objective:** Define the "Potential Energy" of the Contact.

1. **Define the Persona Data Asset:**  
   * Create a validated list in the **Oblio Data Asset** 5: \`\`.  
   * Do *not* use "Admin/Viewer" unless specifically provisioning software access.  
2. **Schema Update:**  
   * Enforce validation on contacts : persona Type.  
   * Update contacts : job Title and contacts : seniority fields.  
   * Implement "Job Title Mapping" logic: If Title contains "VP" or "Chief," auto-suggest "Decision Maker."  
3. **Visualization (The "Stupify" View):**  
   * Update the **Account Detail View**.  
   * **Group 1:** Decision Makers (The Checkbook).  
   * **Group 2:** End Users (The Utility).  
   * **Group 3:** Influencers (The Noise).  
   * *Note:* Do not just list Contacts alphabetically. List them by **Buying Power**.

### **6.3 Phase 10.3: The Kinetic Integration**

**Objective:** Automate work distribution based on Roles.

1. **Routing Rules:** Configure the Activity Engine to route DM-related activities to **Senior** roles defined in role modles.csv.  
2. **Scoring:** Update the **Revenue Forecast Integral** to weight the "Spread" calculation based on the Contact's Persona.

## ---

**7\. Simulation: Validating the Workflow**

To confirm the validity of this architecture, we simulate the workflow of a user ("Sales Junior") creating a new Contact under the proposed system.

**Step 1: Initiation**

* **User Action:** Opens Sidebar ![][image2] "Create Contact."  
* **System State:** Sidebar is open. Actual Duration timer starts (![][image12]).

**Step 2: Data Entry**

* **User Action:** Enters Name ("Alice Smith") and Email ("alice@acme.io").  
* **System Action (Algo 2):**  
  * Parses @acme.io.  
  * Queries Account graph. Finds "Acme Corp" (id: 12345).  
  * **UI Update:** "Linked to Acme Corp."  
* **User Action:** Enters Job Title ("VP of Engineering").  
* **System Action (Heuristic):** Detects "VP". Auto-selects Persona: "Decision Maker."  
* **User Action:** Confirms Persona. Submits.

**Step 3: Kinetic Consequence**

* **System Action:**  
  * Creates Contact Record.  
  * Creates work History entry (Acme Corp, Start: Today).  
  * Updates account Primary snapshot.  
  * **Routing:** Because Persona is "Decision Maker," generates an **Engagement Activity** ("Intro Call") and assigns it to **Sales Senior** (bypassing the Junior user who entered the data).  
* **Metric Capture:** Actual Duration \= 12 seconds.

**Contrast with Manual RecordPicker:**

* User enters Email.  
* User searches "Acme".  
* User scrolls list. Selects "Acme Inc."  
* User manually selects "Admin" role.  
* **Metric Capture:** Actual Duration \= 45 seconds. **Efficiency Loss:** 275%.

## ---

**8\. Conclusion**

The "Roles" and "Linkage" systems are not separate features; they are the structural and functional components of the Oblio Object Graph.

**Final Answer:**

1. **Prioritize "Linkage"** as the physical substrate of the system.  
2. **Do not implement the manual RecordPicker.** It is an entropic violation of the "Stupify" philosophy. Use **Automated Account Resolution** based on email domains.  
3. **Implement "Personas" (DM/EU/IN)** rather than "Admin/Viewer" roles for the CRM view, as this aligns with the **Revenue Forecast Integral** and the system's "Economic Physics" foundation.  
4. **Leverage the role modles.csv schema** to automate the kinetic routing of work, ensuring that high-value contacts are handled by high-capacity internal agents.

By following this architectural path, you transform Phase 10 from a data entry task into a thermodynamic optimization of the entire commercial enterprise.

## ---

**Appendix A: Detailed Schema Reference**

### **A.1 Contact-Account Linkage (Meta Model)**

| Field | Relation | Logic | Source |
| :---- | :---- | :---- | :---- |
| work Histories | MANY | Historical record. Primary if end\_date is NULL. | 3 |
| account Primary | ONE | Snapshot of current employer. Derived from work Histories. | 3 |
| account Name | ONE | Direct link to Account Name. | 3 |
| account URL | ONE | Unique Identifier for Resolution. | 3 |

### **A.2 Role/Persona Definitions (User Types)**

| Role Type | Definition | Context | Source |
| :---- | :---- | :---- | :---- |
| **End User** | Internal Employee (Agent). | role modles.csv | 3 |
| **Contact** | External Market Entity (Particle). | commercial architecture | 1 |
| **Persona** | Economic weight (DM, EU, IN). | commercial architecture | 1 |
| **Tenancy Role** | Access Level (Admin, Viewer). | tenancy.md | 3 |

### **A.3 Activity Distribution by Role**

| Internal Role | Activity Types | Focus | Source |
| :---- | :---- | :---- | :---- |
| **Admin** | All (Creative, Data, Engagement). | Strategy/Ops. | 3 |
| **Marketing Junior** | Data (Create/Edit), Creative (Posts). | Volume/Flux. | 3 |
| **Sales Senior** | Engagement (Call/Direct), Approval. | Conversion/Closing. | 3 |

# ---

**Detailed Research Report**

## **1\. Introduction: The Business Operating System (BOS) Paradigm**

The query regarding "Phase 10: Relationship & Role Management" cannot be answered effectively if treated as a standard software feature request. To provide a "systems architect" answer, we must first situate the request within the overarching philosophy of the **Oblio Business Operating System (BOS)**.

### **1.1 Beyond the Data Repository**

The prevailing architecture of modern commerce is characterized by fragmentation. Organizations typically rely on a disjointed assembly of services—CRM, CMS, ERP—that function as isolated data silos. This results in a fundamental disconnection between the "potential energy" of a product and the "kinetic energy" of revenue.4

Oblio rejects this model. It formalizes the commercial enterprise as a **closed thermodynamic system** governed by immutable laws of physics.4

* **The Equivalence Principle:** Money, Debt, Time, and Energy are interchangeable forms of the same fundamental quantity.4  
* **Conservation Law:** The "Universe" (![][image13]) is normalized to unity (![][image14]). Every gain in revenue must be balanced by a precise expenditure of **Activation Energy** (Activities) and **Time** (Duration).4

### **1.2 The User's Query in Context**

The user asks to:

1. Implement a RecordPicker for manual Account selection.  
2. Add a Roles system (Admin/Viewer).  
3. Prioritize between "Roles" and "Linkage".

From the perspective of **Economic Physics**, the user's proposal to use a manual RecordPicker represents a **high-entropy** solution. It relies on human labor (manual search) to establish a connection that should be deterministic (algorithmic resolution). In the Oblio model, **Time is Cost**. Increasing the duration of data entry (![][image1]) directly reduces the efficiency of the system.2

Therefore, the architectural review must focus not just on "features" but on "thermodynamic efficiency."

## ---

**2\. The Mechanics of Linkage: Creating the Object Graph**

The foundation of the Oblio system is the **Object Graph**, specifically the tensor relationship between **Contacts** (Particles) and **Accounts** (Fields).

### **2.1 The "Linkage" Priority**

**Verdict:** Linkage must be prioritized over Roles. **Reasoning:** In the **Solipsistic Space** of Oblio, an object does not exist unless it is observed relative to the tenant.1 A Contact without an Account is a vector without a coordinate system. It has "Mass" (Potential) but no "Context" (Use Case).

* **The Use Case Vector:** The intersection of a **Solution** (Product) and a **Persona** (Contact) creates a "Use Case".1 However, the Persona is often derived from the Contact's position *within* an Account (e.g., "CFO of a Startup"). Without the Account link, the Persona is undefined, and the Use Case cannot be established.  
* **Ontological Necessity:** The constraint "All Contacts must have an Account" is valid and must be enforced at the schema level.

### **2.2 Account Resolution: Automation vs. RecordPicker**

The user proposes a RecordPicker. This implies a workflow:

1. User types Name/Email.  
2. User stops typing.  
3. User clicks "Select Account".  
4. User types "Acme".  
5. System searches "Acme".  
6. User selects "Acme Inc".

**Critique:** This violates the **"Stupify" UX Philosophy** (Select ![][image2] Setup ![][image2] Stupify).2 It imposes cognitive load and operational friction.

**The Architectural Solution: Algorithmic Resolution** The system logic defined in 2 and 3 suggests an automated approach:

* **Logic:** SELECT Account WHERE URL \== WorkHistory.URL OR Name \== WorkHistory.Name.  
* **Mechanism:**  
  1. Extract domain from Contact Email (@acme.com).  
  2. Query Account database for url \== acme.com.  
  3. **If Match:** Auto-link. Display "Linked to Acme Inc" (Read-only).  
  4. **If No Match:**  
     * **Option A (Blocking):** Prompt user to create Account (High friction).  
     * **Option B (Non-Blocking \- Recommended):** Create Contact with Account \= Pending. Trigger a **Data Activity** (Research) for the Operations team to resolve the linkage asynchronously.2

This approach preserves the **Sidebar Paradigm** (capturing Actual Duration) by turning the "linkage failure" into a discrete, measurable "Activity" rather than a blockage in the sales flow.

## ---

**3\. The Roles Ontology: Disambiguating "Roles"**

The user's request to add "Roles" (Admin/Viewer) introduces ambiguity. We must distinguish between **System Roles** and **Commercial Roles**.

### **3.1 System Roles (Tenancy & Permissions)**

If the Contact is a **User** of the software (e.g., a B2B SaaS platform), then "Roles" refer to **Tenancy Access**.

* **Source:** 3 "Contact Account Flattening Tenancy".  
* **Architecture:**  
  * **User:** Global identity.  
  * **Contact:** A User with a membership in an Account.  
  * **RBAC Levels:**  
    * **Rank 4 (Admin):** Full control.  
    * **Rank 1 (Junior/Viewer):** Read-only.  
* **Implementation:** These are stored in the user\_accounts table.

### **3.2 Commercial Roles (Personas & Hierarchy)**

If the Contact is a **Prospect** in the CRM, then "Roles" refer to **Buying Power**.

* **Source:** 1 "The Persona Hierarchy".  
* **Architecture:**  
  * **Decision Maker (DM):** Economic buyer.  
  * **End User (EU):** Functional user.  
  * **Influencer (IN):** Peripheral stakeholder.  
* **Implementation:** Stored in contacts : persona Type.3

### **3.3 The "Seniority" and "Department" Dimensions**

The **Data Modelling** schema 3 provides granular fields for "Seniority" and "Department."

* **Seniority:** Used to align the "Energy" of the sales agent with the prospect. A **Senior Sales Rep** should engage a **Senior Contact** (DM). A **Junior Rep** should engage an **End User** (EU).3  
* **Department:** Defines the "Topic" of the conversation. Marketing Dept ![][image2] Marketing Pitch.

**Recommendation:**

The user's terminology "Admin/Viewer" strongly suggests **Type B (Tenancy)**. However, the context of "Linkage" and "Account Detail View" suggests **Type A (CRM)**.

* **Action:** Implement **Type A (Personas)** as the primary "Role" for the CRM view.  
* **Mapping:** Map "Admin" to "Decision Maker" and "Viewer" to "End User" if the user insists on that terminology, but advise using the standard DM/EU/IN nomenclature to align with the **Revenue Forecast Integral**.

## ---

**4\. Technical Specifications: EAV/ORM and Schema**

The Oblio system relies on a rigorous data architecture to support its theoretical ambitions.

### **4.1 The RecordStruct vs. FieldStruct Model**

To prevent "data contamination," Oblio enforces a "No Free Text" rule for core ontological fields.1

* **Records:** Heavyweight backend objects (Firestore). Source of Truth.  
* **Structs:** Lightweight, immutable frontend objects (Flutter). Used for UI state.

**Constraint:** The "Role" field must be a SelectMany or SelectOne field linked to a **Data Asset** (Fixed Taxonomy). It cannot be a text string typed by the user.

### **4.2 Schema Definition: work Histories**

The linkage is physically stored in the work Histories sub-collection.3

Code snippet

contacts : work Histories : account Name  
contacts : work Histories : account URL  
contacts : work Histories : job Title  
contacts : work Histories : department  
contacts : work Histories : seniority  
contacts : work Histories : start date  
contacts : work Histories : end date

**Logic:**

* The system must enforce that exactly **one** entry has end date \== NULL (The Primary Account).  
* The account Primary snapshot on the Contact record must be a pure function of this sub-collection.

### **4.3 Schema Definition: End User Types (Internal)**

For the internal agents managing these contacts, the role modles.csv 3 defines their capabilities.

* **Admin:** Can assign MQL/SQL, manage all creative assets.  
* **Junior:** Restricted. Likely handles the "Data Activities" (Linkage Resolution).

## ---

**5\. The Activity Engine: Kinetic Consequences**

The decision to prioritize Linkage and Roles has direct downstream effects on the **Activity Engine**.

### **5.1 Entropy and Lead Health**

The **Lead Health** (![][image9]) is a dynamic energetic state subject to "Entropic Decay".1

* **Unlinked Contacts:** A Contact without an Account has maximum entropy (Unknown Context). Its Health is effectively 0\.  
* **Linked Contacts:** Once linked, the "Spread" (![][image5]) can be calculated.  
* **Role Impact:** A "Decision Maker" role injects more "Potential Energy" into the Opportunity than an "End User."

### **5.2 The "Research Activity" (Algo 1 & 2\)**

If the **Automated Resolution** fails, the system must generate a **Research Activity**.2

* **Trigger:** Creation of Contact with Account \== NULL.  
* **Assignment:** Assigned to **Marketing Junior**.3  
* **UX:** The Junior User opens the Sidebar. The "Link Account" widget is the *only* active task. They manually search (using the RecordPicker as a fallback) and submit.  
* **Physics:** This captures the Actual Duration (![][image1]) of the "Search Cost," allowing the business to measure the inefficiency of its data ingestion.

## ---

**6\. Implementation Strategy: Phase 10 Roadmap**

To execute Phase 10 in alignment with the Oblio Architecture:

### **Step 1: The Substrate (Linkage & Automation)**

* **Refactor Contact Creation:** Remove the mandatory manual Account ID field.  
* **Implement Auto-Resolution:** Create a Cloud Function that listens to Contact.email.  
  * Parse Domain.  
  * Query Account.url.  
  * Update work Histories and account Primary.  
* **Implement Fallback:** If resolution fails, flag Contact as Status: Data\_Incomplete.

### **Step 2: The Ontology (Personas/Roles)**

* **Define Taxonomy:** Create the Persona Data Asset: \`\`.  
* **UI Update:** Add a "Persona" dropdown to the Contact Sidebar.  
* **Logic:** Map Job Title keywords (e.g., "VP", "Chief") to default Seniority levels.1

### **Step 3: The Visualization (Account Detail View)**

* **Group by Power:** Do not list Contacts alphabetically. List them by **Persona Hierarchy**.  
  * *Tier 1:* Decision Makers (The Budget).  
  * *Tier 2:* End Users (The Need).  
* **Show "Spread":** Visualise the "Fit" of the Contact relative to the Product Solution.

## ---

**7\. Conclusion**

**The Answer:** Prioritize **Linkage**, but automate it. Do not prioritize "Roles" as a permission system unless building a portal; instead, prioritize **Personas** as a value system.

By rejecting the manual RecordPicker and embracing **Automated Resolution**, you reduce the entropy of the system and respect the **Conservation of Energy**. By defining "Roles" as **Personas** (DM/EU/IN), you enable the **Revenue Forecast Integral** to function, transforming the system from a passive database into a predictive economic engine.

**Proceed with "Basic Linkage" powered by "Algo 2" Automation.**

---

**References:**

* 4 *Merging-Oblio-System-and-Architecture*  
* 1 *Oblio-Business-Operating-System-Commercial-Architecture*  
* 2 *Oblio-Activities-System-Design*  
* 3 *Oblio Documentation \- 4.) Data Modelling v3 \- role modles.csv*  
* 3 *Oblio Documentation \- 4.) Data Modelling v3 \- META model.csv*  
* 3 *CONTACT\_ACCOUT\_FLATTENING\_TENANCY.md*

#### **Works cited**

1. Oblio-Business-Operating-System-Commercial-Architecture  
2. Oblio-Activities-System-Design  
3. Oblio Documentation \- 4.) Data Modelling v3 \- role modles.csv  
4. Merging-Oblio-System-and-Architecture  
5. Oblio Documentation \- 9.) Oblio Data Asset , [https://drive.google.com/open?id=1izQ-Y8zAkWJqCu1yBcyzC5gs1DzcOvQIbxx2bhpAxC8](https://drive.google.com/open?id=1izQ-Y8zAkWJqCu1yBcyzC5gs1DzcOvQIbxx2bhpAxC8)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAZCAYAAAAv3j5gAAABVUlEQVR4Xu2UTyuFQRTGH6GUW4hwxYaPYKUspWwkm2unbHwDVsrGwtZGpKzs7KSEFQufwM7GyspGUZI/z9M5t847N7o0lHp/9eudmXPfuTNnzrxAScknXNP3dPA3eKF36WBu2mC72UgDuRmgb3Q6DeSig1bpJr2kY7SftsYf5UJpO8QfpG0SVgijaSA3q7BCqKSBH7JEz9JBobTlvD/HbgNK233oX9Cu0FdFzoR+pJ3O0RFYRlRYmm/BYwW0G1Wc6KWzIdZJj2Av6stxGmI1euPPK7pId+kzPYBVcIFt2B16gpV5nXn6GvoPdNnb43Td2yqiNW8P44vqbaFDaCwG5Tl+kh5hfyC2YNWaMuV+i1u65+0eWDr0HKTnKC5MF1yXX4tTunU+2l1TnNB92I5XYNdgwmNq6zyFJt6hfbBzFEq73msarUwrFZq43hbdsCpL0XjJP+MDy+o0qe0IL3sAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAYCAYAAAAYl8YPAAAAX0lEQVR4XmNgGAWjgKpAAV2AEuABxPzoguQCkEFB6IKUgItALI8uSC7gBuLFQCyDLjENiGeRgRcA8S8g7mOgEOB0GTkA5LLt6ILkgisMVIoAFyAWRBckF7SiC4yC4QYA/C8RC4AA67MAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAaCAYAAABozQZiAAABFklEQVR4XmNgGAUw4ATE14H4PxAnA3EIEL+C8oWQ1GEAkCRI0UYglkES5wPipUC8B4j5kcTh4BYDRCMrugQSAMm/RxcEmQaSOIQugQZAakAYDoyB+CsQ7wBiTmQJLACkDkXzFKhABLIgDvCPAU3zE6iANLIgDoDhbAwBHECEAaLuLbIgsZo9GCDqliMLEqMZFqjTgZgFWQJdMyjanIFYAUlsFwNEDUYCyYBKGAKxNhCrQsXFGSAGNDBAkqsmVBwFgFLULCC+AsQlSOKMDJDAARmMN02DDPjFAFG4iAFi2HkoNkdSRygRwQEPA8S5IOczA3E+A1pg4QMgzSCXfIHiv6jShAEsJlYzYAlpQkCfAVIYgJw94gEAJflAoNHSa3UAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAAZCAYAAABw43NsAAACuElEQVR4Xu2YTahNURTHl1CMfOajSDKSiVJKyQCJgRGiZGSqDIQkxUCKEi8THyVJJBNJJganTJQywsBHISmUgaJ8+//f2steZ99z7rv3uZ3r9vav/t271zqnt+7/rr32uU9k7HEcOgfNTROZemZD96BxYf0WehbTmXYsgz6LmkiuQL9jOtMND6B3abANu0U7d16aGCQuQ+fT4Cj4Ce1LgzWshm5CG6Gn0IJyenDgVvuX7TYFug2NTxM1pLPxFfTCrQeKQ9CBNNgFNG5reL/KJyqYLPpF7XIxmsfZOaaYCB2GXge9gV66fAo79D50RuIJTWhcbedPgjZDS9JEQ3A77YROQltE583ikKMBfD5bHtZkaoitEe0U1s/8IilvTTttbdtTPDTqWA/9Cq8e3tfSeXT3E7QurDkUL8R0JbNEC+9U/GDtuAU9TGIslIOa9c0QnUH+m2edJ6D30B1RA8l10et813TDY9H7t4k2E8X3laYvhG5AE0Q/JGfDSOaxrW0bdKIdelstnCdFErsrap5RSOu2YVcxRvON7SE208W64YuUu9TrortumLUhwSN8j/Tn58tViQU+h05La+cUUm+eN5nvGRvt5+C9nIueoRBjo5XggPTufiunG2GOaKf5Oq6J1mYUIe4x8za4WC/MK9x6muh2TQ+QvxwR/catcM6YpuGQPwo9kljHKZcvQsxjhwFfjV6Yd8mtV0LfoRUuNgy3qi+If5DzZ6R50esD44lokZ5CtBa/bsq8/W79QWoejnkhDTTo7le3bgqaxG3h4cHlT7dCqs1jrJczj48p3AGEj0j0Z1NMRw5CP0RPRB75Z6HppSuagb8bj0EfJdayV+LzHc21rWyd4dcWS+Mtz2UdsFS0BtbCUVY55wwr0P5l0w/mh1fO2n7XQugJR1Onv4MzmUwmk8lk/hf+AI3bvsmRfadDAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAaCAYAAABl03YlAAAAmUlEQVR4XmNgGAXkAmEgdgNiKSBmRJMDg/lA/AeI9wHxTyCejirNwMAKxLeAWAXKTwPi3whpCCgC4jVAzAnlbwPiGQhpCEgH4v9A/AuIdzAgFGOAqUD8kgGiGIQbkCX1gdgZiS/GAFG0EEkMLPAaWYAB4jtLZIFnQGwFZYPCxh2Iy6BsOOgE4n9A/AiI3wHxNyBmRlYwCggDADQQG8cgxFMzAAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAAB5UlEQVR4Xu2VvytGURjHv0IR8jMSAzYZ+APYDBYGkzJYDAaTBZvFajCrtxQWqyiLsigrWQyvUiaLolB4vve55+3cxz3nZZPup77d9z3f55x7znnOcw9Q8I+oF/WIeo3a/KAqdCPbtxr++zqNl7Ap+ozoTVSqROdj+8RoxC/iX5AfUCtaF72KJoznMyrah47RZTzHgOgEGnOftfJh4IdtTHGr44Ah5kWL0Lgh4zm2RQvQmCPjfaMd1QNjW90iOofu1pNoOmsn8OyMiCahi+czCgfjC1et4RGb1LDoGnpw70QrWRs1orX0N89wWdRXcQPsQHPcbw2P2KSYFqpOdCjag07EcQA9j0zrA+KLT2DqLqGpazCew6X32RopZ9AzRbhA/m92prAFneSPU8fB+MJY4DI0ZsO0O7goTpzMih6hKeXOcQcdXDjHCS2+QgkaGEodK49Vx/QOGs/B3XGMi97T54xo1/OYutARyMBVxmY/Bd3yJWuksPJc6ogrGlbgKbTiHGwPfXYyxAI7oP6xNTw4IZc6wrPEPreiVq+9KW2PfXYSePgYmPd1HRPdQNPLAfNgf/p+pfEccUzeAD6sPLYHK4/fEwaExPuO28/LOg9eqLZP2fOvoJc0mcP32Atkd7GgoKDgz/MFW05/S1f3p24AAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAYAAADJ9/UkAAABjElEQVR4Xu2VL0tFQRDFj2hQfKCi+AcEm0k0iEEwGix2wWiwmJ9geiB+AaNYxCposRlMFj+D8BTRpkWLgjqH2YV5w+7bW0SE+4MDb8/emTs7u3cfUPNP6RcNe9PQKxrzZopD0XdFrYeY48QcNRjmV0Vfbu4yzCX5hD6Uokf0Llp0fnxBjrZo05spYoU57kVTzuPzLCDHk2jBm54JaKIr442LLsyYbeNeR6ahMWfGs/RBt7TICjTRgfHWRDdmvGV+E+4rY3adH+GBK7acFbJ6tu9cdCQ6gSbOBbMD7MQdtGsptkUj3vQwmEk+RA9BL0gfsAhb/ggtmsV74oKKsG1cJdto4ecUGYWegcgeNIbblWIJuqAirJCJuJoIL4kNM94RDZgxW+5jLGz5rTdTtKGJ7Em2DKHz4BGuqlsMF1TppJe+Vb6o5bxr5O8EFrsPvZi6wsqZ5NlPBOZFr6I557egcQ3n83o9hRaQZQYaXEXLIcYzCZ1/g15O/EKa6Dwbv8os9IXc3/inU1NT8/f8AOQkaDSlv7/lAAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAAAcCAYAAADLGVncAAAC/ElEQVR4Xu2ZS6hNURjH/0J5vx/J66QQBoSSgYiIkoQBMSJRlEyIkMjEgJIMpBTJRCE3jxQnJkIxwMCMlDJUSqTr//et1Vln3b3Pvc7dzsPev/p191qrc+8+33p9a12g4L9nNV1K+9M1tJP2cW2P6GH3XAALzJmgfAoWMM9BuiEo557ZdH1Q/kzLQXknHReUG842eoHeokeD+l10YVBuFhpdGmVNZRjsRX7Q0VGbelTrRJkOqW5qOPr7ep9pcUMvuE6/x5W1mERfOEvVTX/QiGuJXoUFqoxsO24WfRZXpjEcFoz3cUOAXq6MbHu1XtRp66K6+fS2e1bnD6KnK804RjvoQDqW7oNtEotd+znYxnEI1ZtLF7T7nIQFTKMoDR+wLHu1HtI6bjfdSPvC1lmlHhdd21Q63T3vhX3Pd3QVPe7qH9C1dBNqDxychwVLv6gW/eiyuLKFmEif0jH0savbQifAgiP0HTSKRLy0aHRqF1Zwa/IJFrC4x+pFm4VesqdmNWIX0Huwteg5bJnZQcfDAinmwAIyAJb4hiiQepdFsM+lomCFCWC7o6kY/vSMCJ796SDE1w2tqk2gpwEbha4v0Uj8ezbDKhIrE1CeojUg9/xE9wEr0SVxZQo36ce/8IR9rH1YSX/RA0ie21dR2Z5bGe2OWuy/0rlRW6YoSEopNMp0dvQon1EwlcQp2WsH9F10UhkZN/wLFCBtyRpNClwJySOulVFqoaS1oBuUa82AZfAKWkEKSnOewJJUHX2+oP1mRUPZ7BQaWd+CtoIIHas+wI454jJ9W2kuiPEB82h3vEbPwi5CdaWtIC6HnVJWwJJvnRd14SA0fZU2KRdsl0ygV8yjV+h9eom+hB2utabpP0xCB/LBdAq96+p0rTOZvnblrcjRKUY7pKalRou/Vtd6pktE4a9xVPfQPe+B3Va8cWVdHuYaTbv9sOmpnFIbg0aeRuIR2AjUDqsb2Tv0lX0s3+iaRsm4pqNH5Tjt0DX1jaiuIIHtsOvpmVF9Kr8B2jmavwKx8MwAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAYCAYAAAD3Va0xAAAA0klEQVR4XmNgGDGAA4gF0AXJAZOA+D8WLAKVRxcH4T1QOazgNwNEETbgxwCRS0eXQAcsDBCFz9ElgIAHiA8A8VUGhCtxApACkEFb0SWAQIkBYsFSIGZEk8MAICf/A2IXdAkgaGWAWGKKLoEOQN5awwAxaD0Qz0LDINcgBz5OYMMACWiQzdgALKYIApC3QAqxeQsEQHLf0AWxAVBsgBRzo0swQAIaJAcKaIJgcKQfUHowA+JsBohBN4BYlQGimRmIxYC4FIh/QuXCGCB5chSMAqoDAF6pOAh7mt20AAAAAElFTkSuQmCC>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAArCAYAAADFV9TYAAADYUlEQVR4Xu3dT4h1cxgH8J9QlJKIxIakZEHZIsoCCwtKxJ41RdZSljY2UqLYkI1Y3yUpZSE26iUlC0QskD+/b+eeeX/zvGdeM+/MnZl3+nzq6Z7fc869c2dWT8/vOWdaAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAODme6/FRTQIAcLz83OOCkvuxxy0lBwBwaC7u8WpNDh7scVNNnmBP9XhsfZy/za093uhx7dYVAADn6JIe/5ZIblVyr6+vj3SSvhvWO0nBcnlNbki6WeP3TQF1R8klHpjfcMAu6vH9sM7P110DAA5UipknSu75Hv+UXHzQ45qabFPRdNuwTmH3+7DetPfa9qIpLmvT73ZVye/Fawvx8rYrWvukx6kel67XX5w+BQCwf1e0qajJ6+hUjw9LLkXYHyUXyecz6hzXqscNJbcpf/V4qeQeatP32qRf1q/3t6nIjV/Xr4+vXwEA9uXhtlzUJHdfyWX9dslFOmsZvK+yBTlup27KXDDeWPKrtvdu1z1tuYO45Ic2zazN5o5kOn3p+F0/nAMAOGeftqlrNm75vdWmAijzbKMUXynwRhmsf7/HO+vjscuW9TfDusrn55qzxdVbV+/szjZ937p1Oc+z7ca7PV5ZH9/bps8EADgW9jK/tmrTMH+VWbVxfm2WGbLDmGPb7/zas217hzDF3m4KRQCAjdtpfu3rdub8WqzamQXbTvNrcVgF29L8WrZj61Zv7lp9scftPR4Z8nn/Tz2+atODcC8czgEAHKl01mpRE0vza5EiruZTwM1FWea5xsItheA8gL8kNwV8+z/x2dbVy/JIjd3Or2X7d/bbcLz0fgCAI5diKgXMWMTEdW15fi2eaafvhJxlPd+I8Pl4ok3bpKuSO2jz/Fq1NL82dvvG4zxXbnxuWo4fHdYAAIcuNxmkoJnj73V+zCXqw19TzNUCL9uMeX86aXVbNNuU6aJtSv2+V/Z4s+TGrd2xsBsLtnQG/2xTRy+v7u4EAM5rSzcj7CRFUS3ijtJ4Y8JhzNYBAByJu3o8XZML8v80X6jJI/Zkmx7kmyLy43IOAOBEyWMvzvZ/QlMQfVmTx8TNPe6uSQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDz0H+k9KpdDnJfZgAAAABJRU5ErkJggg==>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAYCAYAAACbU/80AAABgElEQVR4Xu2UPyuHURTHjzDIJCKDQRgkGUyKsngHNl7Cb7IYLMobkExSJolsUmYjyqiYLAYGpQxS+H6fcy/nOc8/kwz3U99+zz3n3HvOPb97r0jin/MBbXrjX9EFfUJP3lHDqeicJr1C02FOKUx+JhrICRN5dyMxURlc+x4a9A7LCbQrWiWLeIBGcxHV9Igmv/QOwz7U5o2WZ2gG6oAORBfcyEVUMyUazw1EJqEjM94y3wXmRJNHWERdSz1M/CJaSOQWWjXjSjpFK2VSy5toAcPO7mH72XrGs8070CH0Ds2auErYbtuqCLvCRe+gIeezLIkWyt8IN3UsxU2V8iiazMOTy4PJxVvOZ9kTjRk3Nh62FTMegbrN+Bue+AVvNMR3oe4sxGtbBf/CG28krHJbNEkdfBmZoN87Ak0F8ibxfSnA5Lx6PDR1uhJNcAH1ZjN/6Au+svvPDbK73P2A82XwuY3V/1bL2UyRdmgeWgv2c2hM9KWjfRG6Dr51TkgkEgnLFz7aY+KZpvQbAAAAAElFTkSuQmCC>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAZCAYAAABHLbxYAAABTElEQVR4Xu2WMUsDQRCFn6hgIaQQFC21sg7RJmUQLPQPiJWFjVUEbdKmSCuCYJfenxAQtBGsxVZsLESstFBQ39xkw2buVhKQPYv94CvuzR2Z7N4OByQSiXGYpA16Tg9NbYg7+m3DSFToK13rX0/QL3o0uMPjkz7ZMBIH9BTaoOOePnvXGVPQ1WzbQgSq9I1umrwL7WnGDxegS73hh5HYgjYkDfvIokkuvWXdLtIOvaYrdB76YoeQujwzqkMrUsAxihvN5bLtFxh922/o4xju6mNBcg2F8jr0IC27IDK5hkK5C2ZdEJkmfm901QWy7WXNT8EdpprJT/p5dpgE2faXQRm4gg7gEH99mOS35L3fMXkPZgHlQk68MEe3vVosigb+A8zAP4PO0HfomCqLW/pB9+klbdFp/wb5F0so7zA5ZHavQz9K9kwtkUgk/iM/JT9LAxwTOL0AAAAASUVORK5CYII=>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAaCAYAAABozQZiAAAA5ElEQVR4Xu2SPwuBURTGj0EpDDIpkzKYlUFZ5Fv4AHaKT2A1mJVPYbNZxGKxUXwAmSwWnqf7Xp2Oe7PjV7/hfc497znvH5Hf5QgfAfvqjK31fKEIS6pQTq4z/gCowgncwBZMq5oUxDXudWgYw6wNSU1c89wWEti0tKFnCm+wbgsJHXi2IcnDFdyKWz8EV17YkHDlC5zZgoKNvMEbXJnPG1uZcOWKDQlXZnNsZcLJ+tO98N83BifyhQX51DyCORt61hJvPsChDTUNeIVNlfH368IBTKk8SFvc9BPcwbu4qR8b/3w3T/04MNjj9n+MAAAAAElFTkSuQmCC>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAWCAYAAAD5Jg1dAAAAQ0lEQVR4XmNgGJqAEYjt0AVhoA+I3wHxXyD+D8TlqNKYQBKIHzKMKsQBqKeQhwGiqBSIfwLxLiD2BGIxIGZGUjfCAADTzxPXY1NRmgAAAABJRU5ErkJggg==>