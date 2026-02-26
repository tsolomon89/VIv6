# **Oblio End-to-End “Golden Path” Workflow Specification & Research Report**

## **IMPORTANT NOTE :**

THIS DOCUMENT DO NOT NECESSARILY REFLECT THE CURRENT CONTACT / USER MODEL IN THE PROJECT AND DOES NOT INCLUDE ANY OF THE AI FEATURES WE HAVE BUILT IN. MUCH OF IT REFERS TO CSV UPLOAD WHICH WE MAYBE BUILT BUT PRINCIPLY THESE COULD JUST BE THE SAME AS THE API AND MCP PATHS WE’VE BUILT. It  should still reflect the general project and plan 

## **1\. Executive Summary**

This report delivers a comprehensive, expert-level specification for the "Golden Path" End-to-End (E2E) workflows within the Oblio Business Operating System (BOS). Derived exclusively from the provided technical documentation, this analysis treats Oblio not merely as a traditional Customer Relationship Management (CRM) platform, but as a deterministic simulation engine modeled on the principles of thermodynamic physics. The objective is to provide a rigorous blueprint for the creation of dependency-ordered E2E tests that validate the system’s core capability to model commercial operations as a closed-loop energy system.

The Oblio architecture creates a radical departure from standard CRUD (Create, Read, Update, Delete) applications by enforcing a strict "Product Tensor" ontology. In this model, the **Product** represents "Potential Energy," **Activities** represent "Activation Energy," and **Revenue** represents "Kinetic Energy." The system operates on a "Solipsistic Universe" premise where every tenant organization functions as a closed system. The workflow is governed by a generative engine that programmatically instantiates downstream business objects—Campaigns, Pipelines, and Opportunities—based on the "seed" definitions of the Product and its associated Personas.

The analysis identifies the primary user journey as a progression through three distinct phases: **Ontological Setup**, **Kinetic Ingestion**, and **Thermodynamic Execution**. This "Golden Path" follows the documented UX philosophy of **"Select → Setup → Stupify,"** designed to reduce cognitive load and enforce high-fidelity data capture via a constrained "Sidebar Paradigm."

Critically, this report establishes the **Capability Dependency Graph (DAG)** required to support this journey, defining the precise order in which system capabilities must be tested. It specifies the **Testable Invariants** for every step—distinguishing between "Records" (Database) and "Structs" (UI)—and highlights significant **Ambiguities** regarding multi-tenancy recursion and object pre-existence that must be resolved to ensure a stable testing environment.

By adhering to this specification, the Coding Agent can construct a robust test suite that validates not only the functional correctness of the software but also the integrity of the underlying business simulation logic.

## ---

**2\. Actors & Roles**

The Oblio system enforces a rigorous separation of duties based on the "Physics of Labor." The system distinguishes between **Internal Actors** (End Users who expend energy/labor) and **External Actors** (Personas who represent the market mass to be moved). Access control, workflow routing, and the "Capacity" algorithms are strictly governed by this dichotomy.

### **2.1 Internal Actors (End Users)**

Internal actors are the employees of the tenant organization using the Oblio platform. Their capabilities and "Kinetic Potential" are defined by a Role-Based Access Control (RBAC) model layered with Departmental specialization. The system models these users not just as account holders, but as "processors" with finite throughput capacity.

#### **2.1.1 Hierarchical Role Structure**

The documentation defines a rigid hierarchy of roles that dictates permission levels and the type of work (Activities) a user can perform.

| Role | Rank | Responsibilities & Capabilities | System Behavior & Invariants |
| :---- | :---- | :---- | :---- |
| **Admin** | 4 | **Governance & Validation.** The Admin possesses the highest level of access. They are exclusively responsible for **Admin Activities** (Approvals), which commit changes to the permanent ledger. They manage billing, user invites, and system-wide settings. | **Invariant:** Only an Admin can transition an object state from Pending to Approved.1 **Invariant:** Admins have full read/write access to all Organization Data. |
| **Leader** | 3 | **Strategy & Content.** Focused on high-level content management and campaign strategy. | **Invariant:** Leaders typically manage Content Groups and Asset generation logic but do not engage in high-volume tactical activities. |
| **Senior** | 2 | **Closing & Retention.** These users are assigned to high-value, late-stage opportunities, specifically **FTP** (First Time Purchase) and **RTP** (Retention Purchase).2 They represent high-cost, high-skill labor. | **Invariant:** Senior users are rarely assigned **MQL** (Marketing Qualified Lead) tasks unless capacity overflow rules are triggered. |
| **Junior** | 1 | **Prospecting & Qualification.** Restricted access. Primarily handles **Data Activities** (Research) and early-stage **MQL** and **SQL** (Sales Qualified Lead) engagement. They represent lower-cost, high-volume labor. | **Invariant:** Read-only access to Settings. **Invariant:** Limited delete permissions to prevent data loss. |

#### **2.1.2 Departmental Context & Routing**

Beyond hierarchy, users are segmented by Department, which governs the *type* of Activities generated for them by the Algo engine.

* **Marketing Department:** This department owns the **MQL** pipeline. They are assigned **Data Activities** (cleaning/enriching records), **Engagement Activities** (outbound campaigns), and **Creative Activities** (asset generation). Their "Product" is a qualified lead.2  
* **Sales Department:** This department owns the **SQL**, **FTP**, and **RTP** pipelines. They are primarily assigned **Engagement Activities** focused on conversion (calls, demos, negotiation). They "consume" the MQLs produced by Marketing.2  
* **Operations Department:** This department owns **Admin Activities**. Their function is governance, ensuring that the data entered by Marketing and Sales meets the ontological standards of the organization.2

### **2.2 External Actors (Personas)**

External actors are the targets of the business process—the "particles" in the system's thermodynamic model. They are not users of the software but are modeled as **Personas**. The system uses these Personas to determine how to route leads and what content to serve.

| Persona Type | Definition | Routing Priority & Logic |
| :---- | :---- | :---- |
| **Decision Maker (DM)** | The economic buyer with budget authority. This is the primary target for conversion.3 | **High Priority.** The system's routing logic ("Algo 2") will always prioritize a Contact matching a DM Persona over one matching an End User. If a Contact matches multiple Personas, the DM match "trumps" the others.2 |
| **End User (EU)** | The individual who will actually use the product daily but may not have purchasing power.3 | **Medium Priority.** Tracked to ensure product adoption and prevent churn during the RTP phase. Targeted with "Use Case" content rather than "ROI" content. |
| **Influencer (IN)** | Stakeholders who impact the decision (e.g., IT security, legal) but do not directly transact.3 | **Low Priority.** Used for "Air Cover" marketing campaigns to build consensus within an Account. |

### **2.3 System Actors (The Engine)**

The documentation implies the existence of non-human actors that perform the heavy lifting of the simulation.

* **The Algo (Generative Engine):** This background process monitors the "Product Tensor" (the web of definitions) and programmatically generates the necessary downstream objects. For example, when a new Product is defined, the Algo automatically instantiates the corresponding Pipelines and Campaigns without human intervention.5  
* **The Simulator (Game Clock):** In the testing/simulation environment, this actor is responsible for generating synthetic events (clicks, form fills) and advancing the "Game Clock" to simulate the passage of time. This allows for the testing of "Entropy" and "Decay" logic.4

## ---

**3\. Capability Graph (Dependency DAG)**

The Oblio system operates on a strict **Dependency Injection** model. Downstream capabilities cannot function—and often do not even exist—without the upstream ontological definitions. This structure dictates that the system must be built and tested in a precise order.

The following **Capability Dependency Graph (DAG)** represents the logical order of operations. E2E tests **must** be ordered sequence-wise; a failure in a lower-order node invalidates all higher-order tests because the "Physics" of the system will have no "Mass" or "Energy" to operate upon.

### **Level 0: System Initialization ( The Big Bang)**

Before any business logic can exist, the "Solipsistic Universe" of the tenant must be established.

* \`\` **Organization Creation:** Establish the Tenant identity, Billing Address, and unique URL identifier. This creates the container for all data.4  
* \`\` **User Setup:** Create the initial Admin User and assign Roles. This establishes the first "Internal Actor" capable of expending energy.7

### **Level 1: Ontological Definition (The Product Tensor)**

This is the most critical phase. The user defines the "Laws of Physics" for their specific business. The system uses these definitions to seed the generative engine.

* \`\` **Product Creation:** Define the Product Name, Pricing (Potential Energy), and Billing Frequency. *(Depends on)*.3  
* \`\` **Feature Definition:** Define the "Nouns" (e.g., "API Access", "4WD"). These are the atomic units of value. *(Depends on)*.3  
* \`\` **Persona Definition:** Define the "Who" (Target Audience). This creates the filtering logic for incoming data. *(Depends on)*.3  
* \`\` **Solution/Use Case Definition:** Map **Feature** \+ **Persona** \= **Use Case**. This defines the "Verbs" (How the product solves a problem for a specific person). *(Depends on,)*.3

### **Level 2: Automated Generation Rules (The Algo)**

Once the ontology is defined, the system's "Algo" takes over to generate the infrastructure.

* \[Cap\_Gen\_01\] **Pipeline Generation:** The system automatically creates Pipelines (e.g., "B2B Pipeline") based on the Product Type selected in Level 1\. *(Depends on)*.5  
* \[Cap\_Gen\_02\] **Campaign Generation:** The system generates a matrix of Campaigns based on the permutation of Product x Persona x Use Case. *(Depends on, \[Cap\_Gen\_01\])*.2

### **Level 3: Data Ingestion & Cleaning (Kinetic Input)**

The system is now ready to receive "Mass" (Contacts).

* \`\` **Contact/Account Ingest:** Uploading CSV files or manual entry of raw contact data. *(Depends on)*.9  
* \`\` **Data Cleaning:** The system validates raw data against the **Oblio Data Asset** (standardized lists of Industries, Job Titles). Dirty data triggers a "Data Activity" for manual review. *(Depends on)*.  
* \`\` **Resolution:** The system maps the Contact to an Account via Domain matching or Work History. It resolves the Contact to a Persona based on Job Title. *(Depends on)*.10

### **Level 4: Opportunity Instantiation (State Creation)**

With a clean, resolved Contact, the system can instantiate an Opportunity.

* \[Cap\_Opp\_01\] **Opportunity Creation:** The system automatically creates an Opportunity (typically MQL stage) if resolution succeeds. *(Depends on, \[Cap\_Gen\_01\])*.8  
* \[Cap\_Opp\_02\] **Qualifier Inheritance:** The Opportunity inherits the boolean logic gates (Qualifiers) defined in the Product. *(Depends on \[Cap\_Opp\_01\],)*.11

### **Level 5: Kinetic Execution (The Workflow Loop)**

The system is now "Live." Users perform work to advance the state.

* \[Cap\_Act\_01\] **Activity Generation:** The system creates a "To-Do" list (Activity) for the user, such as "Research Contact" or "Send Email." *(Depends on \[Cap\_Opp\_01\])*.1  
* \[Cap\_Act\_02\] **Sidebar Execution:** The user opens the Sidebar, performs the task, and checks off the Qualifiers. The system tracks Actual Duration. *(Depends on \[Cap\_Act\_01\])*.12  
* \[Cap\_Act\_03\] **State Transition (Chain Reaction):** "Winning" an Activity (all Qualifiers \= True) triggers the Chain Reaction, automatically moving the Opportunity to the next Stage (e.g., MQL \-\> SQL). *(Depends on \[Cap\_Act\_02\])*.4

## ---

**4\. Golden Path Workflows**

The "Golden Path" represents the ideal, error-free user journey from the moment of setup to the realization of revenue. This journey is divided into three distinct phases that mirror the system's architecture: **Ontological Setup**, **Kinetic Ingestion**, and **Thermodynamic Execution**.

### **4.1 Golden Path I: Ontological Setup (Defining the Physics)**

**Objective:** Establish the "Rules of the Game" by defining the Product and its relationships. This acts as the "Seed" for all downstream automation.

#### **Step 1.1: Organization & User Registration**

* **User Action:** Navigate to /register. Provide First Name, Last Name, Work Email, Phone, Organization Name, and Organization URL.  
* **System Behavior:**  
  * Creates a Organization document in Firestore.  
  * Creates an EndUser document linked to that Organization.  
  * Sets the User Role to Admin (the first user is always Admin).  
* **Testable Invariants:**  
  * EndUser.organizationId must match Organization.id.  
  * EndUser.role must be Admin.  
  * Organization.url must be unique within the tenancy.

#### **Step 1.2: Product Creation (The Seed)**

* **User Action:** Navigate to **Product Creation**. Complete the "Product Details" card.3  
* **Input Data Specification:**  
  * *Name:* "Enterprise SaaS" (Constraint: Max 26 chars).  
  * *URL:* "[https://saas.com](https://saas.com)" (Constraint: Max 64 chars).  
  * *Type:* Select "B2B" from the radio options.  
  * *Pricing:* Currency \= "USD", Value \= "10,000".  
  * *Contract:* Duration \= "Annual".  
  * *Billing:* Frequency \= "Monthly".  
* **System Behavior:**  
  * Validates all text constraints.  
  * Sets the Product Type, which determines that this product requires an **Account** (B2B) rather than just a **Contact** (B2C).3  
* **Testable Invariants:**  
  * Product.name length \<= 26\.  
  * Product.type must be one of the 5 enumerated types.  
  * Product.billingFrequency must be one of.3

#### **Step 1.3: Persona Definition**

* **User Action:** Navigate to **Product Personas**. Define the target audience logic.3  
* **Input Data Specification:**  
  * *Account Persona:* "Tech Startups" (Firmographic Data: Sector="Technology", Size="11-50").  
  * *Decision Maker Persona:* "CTO" (Job Title="CTO", Seniority="Director+").  
  * *End User Persona:* "DevOps Engineer".  
* **System Behavior:**  
  * Links these Personas to the Product.  
  * Establishes the priority logic: Matches on "CTO" will be prioritized over matches on "DevOps Engineer".  
* **Testable Invariants:**  
  * For a B2B Product, at least one **Decision Maker** persona *must* be defined.3  
  * The Persona must consist of fields from the Oblio Data Asset (no free text).

#### **Step 1.4: Feature & Solution Mapping**

* **User Action:** Navigate to **Product Features**. Define the value proposition.3  
* **Input Data Specification:**  
  * *Feature:* "API Access" (The Noun).  
  * *Solution:* "Automate Workflows" (The Verb).  
  * *Use Case:* Create a mapping that links "API Access" \+ "Automate Workflows" \+ "DevOps Engineer".  
* **System Behavior:**  
  * This creates the "Context" that will be used to generate Campaign names and Content.  
* **Testable Invariants:**  
  * Every **Use Case** must link a **Solution** to a **Persona**.5

#### **Step 1.5: Qualifier Definition**

* **User Action:** Navigate to **Product Opportunities**. Set the logical gates for stage progression.3  
* **Input Data Specification:**  
  * *MQL Gate:* "Email Verified" \= True AND "Persona Match" \> 60%.  
  * *SQL Gate:* "Budget Confirmed" \= True.  
* **System Behavior:**  
  * Stores these boolean logic rules to be enforced later in the Sidebar.  
* **Testable Invariants:**  
  * Qualifiers must be strictly Boolean (True/False) or Numeric threshold operations (Match \> X%).4

### ---

**4.2 Golden Path II: The Kinetic Ingestion (Data to Objects)**

**Objective:** Ingest raw market data ("Mass") and convert it into structured business objects via the automated resolution engine.

#### **Step 2.1: Data Ingestion**

* **User Action:** Upload a CSV file containing raw Contact data.13  
* **Input Data:** First Name, Last Name, Email ("jane@ibm.com"), Job Title ("VP Sales").  
* **System Behavior:**  
  * Parses the CSV.  
  * Initiates the **Data Cleaning** protocol against the Oblio Data Asset.

#### **Step 2.2: Automated Resolution & Cleaning**

* **System Process (Internal):**  
  * **Validation:** Checks Job Title against the standardized list. If "VP Sales" exists in the Data Asset, it is accepted. If it is "Vice President of Selling things," the system triggers a **Data Activity** for manual cleanup.  
  * **Account Resolution:** Extracts the domain @ibm.com. Checks if an Account with url \= "ibm.com" exists.  
    * *If Yes:* Links the new Contact to the existing Account.  
    * *If No:* Creates a new Account "IBM", attempts to scrape basic info, and links the Contact.  
  * **Persona Matching:** Compares the Contact's Job Title ("VP Sales") against the Product Personas defined in Path I.  
    * *Match Found:* Assigns the "Decision Maker" Persona to the Contact.10  
* **Testable Invariants:**  
  * Every created Contact *must* be linked to an Account (unless the Product is B2C).  
  * Contact PrimaryPersona must be assigned if the match score exceeds the threshold defined in the Product.10

#### **Step 2.3: Object Generation**

* **System Process (Internal):**  
  * **Pipeline Gen:** Checks the Product Type (B2B). Verifies/Creates the "B2B Pipeline".5  
  * **Campaign Gen:** Checks the permutation of Product (SaaS) \+ Persona (Decision Maker) \+ Use Case. Automatically creates and assigns the Campaign "B2B-SaaS-DM-Auto".8  
  * **Opportunity Gen:** Because the Contact is resolved and matches a Persona, the system automatically creates an **MQL Opportunity**.  
* **Testable Invariants:**  
  * Opportunity.stage must initialize to **MQL** (or the first stage defined).  
  * Opportunity.pipelineId must match Product.pipelineId.  
  * Opportunity.primaryProductId must be set to the Product with the highest value.

### ---

**4.3 Golden Path III: The Thermodynamic Execution (The Activity Loop)**

**Objective:** Users execute Activities to drive the Opportunity through its lifecycle stages, converting Potential Energy into Kinetic Revenue.

#### **Step 3.1: Activity Generation & Assignment**

* **System Process (Internal):**  
  * Based on the Opportunity Stage (MQL), the system generates the next logical **Activity**.  
  * *Type:* **Data Activity** (Research) or **Engagement Activity** (Email).  
  * *Assignment:* Assigns the Activity to a User based on **Role** and **Department**. For an MQL, this is assigned to a **Marketing / Junior** user.2  
* **Testable Invariants:**  
  * Activity assignedTo must match a User with the appropriate Role/Department permissions.

#### **Step 3.2: Execution via Sidebar (The Stupify Flow)**

* **User Action:** User clicks "Work" on the assigned Activity. The **Sidebar** opens.  
* **User Interaction:**  
  * User reviews the Context (Persona details, Product info).  
  * User performs the task (e.g., "Verify Email Address").  
  * **Constraint:** The user *cannot* close the sidebar without completing or cancelling. The timer (Actual Duration) is running.12  
  * User checks the **Qualifier**: "Email Verified" \= True.  
  * User clicks "Submit".  
* **System Behavior:**  
  * Calculates Actual Duration \= (Submit Time \- Open Time).  
  * Updates Activity.status to **Won**.  
* **Testable Invariants:**  
  * Activity.actualDuration \> 0\.  
  * Activity.status \= Won.  
  * The associated Qualifier.value on the Opportunity is updated to True.4

#### **Step 3.3: The Chain Reaction (State Transition)**

* **System Process (Internal):** Triggered by the Activity Win.  
* **System Behavior:**  
  * The system evaluates the Opportunity Qualifiers.  
  * *Condition:* All MQL Gates are met (Email Verified \+ Persona Match).  
  * **The Chain Reaction:**  
    1. Sets MQL Opportunity Status \= **Won**.  
    2. **IMMEDIATELY** creates a new **SQL Opportunity**.11  
    3. Generates a new **Activity** (e.g., "Discovery Call") appropriate for the SQL Stage.  
    4. Re-assigns the new Opportunity/Activity to a **Sales / Senior** User (based on routing rules).11  
* **Testable Invariants:**  
  * Old Opportunity status \= Won.  
  * New Opportunity exists with type \= SQL.  
  * New Opportunity linkedContact \= Old Opportunity linkedContact.

## ---

**5\. Cross-Cutting Invariants (Global Rules)**

These invariants represent the immutable laws of the Oblio "Physics" model. They must be asserted in **every** relevant test case to ensure the system maintains its integrity.

### **5.1 The Sidebar Constraint (Physics of Time)**

* **Rule:** All state-changing work (CRUD) must occur within the Sidebar to capture the energy cost of labor.  
* **Invariant:** Activity.actualDuration is **always** captured for any completed task.  
* **Assertion:** submit\_timestamp \- open\_timestamp \= recorded\_duration.  
* **Implication:** If a test bypasses the Sidebar (e.g., via direct API call without duration), the "Capacity" algorithms will fail, invalidating the simulation.

### **5.2 The "No Free Text" Rule (Ontological Purity)**

* **Rule:** Core defining fields (Industry, Sector, Job Title, Role) must be selected from the Oblio Data Asset (Picklists), not typed freely.  
* **Invariant:** Contact.jobTitle must exist in OblioData.JobTitles.  
* **Assertion:** Inputting non-standard text triggers a **Data Activity** (Clean Request) rather than saving the dirty data directly.  
* **Implication:** The system prioritizes data cleanliness over speed of entry.

### **5.3 The Finite State Machine (Discrete States)**

* **Rule:** Opportunities exist in discrete states (MQL, SQL, FTP, RTP). There are no "percentages" (e.g., 50% probability).5  
* **Invariant:** Opportunity.probability is derived solely from the State, not user input.  
* **Assertion:** Users cannot manually set "Probability". They can only toggle Boolean Qualifiers.

### **5.4 Multi-Tenancy Isolation**

* **Rule:** A user from Organization A can never see, edit, or interact with objects from Organization B.  
* **Invariant:** All database queries must include an implicit clause where organizationId \== current\_user.organizationId.  
* **Assertion:** Accessing record OrgB\_001 with user OrgA\_User must return Permission Denied or Null.

### **5.5 The Product Tensor Origin**

* **Rule:** No Opportunity can exist without a Primary Product. The Product is the source of all Qualifiers and Logic.11  
* **Invariant:** Opportunity.primaryProductId is Not Null.  
* **Assertion:** Attempting to create an orphan Opportunity must fail validation.

## ---

**6\. Test Data & Environment Requirements**

To support the Golden Path tests and validate the simulation logic, the environment must be configured in **Simulated / Game Clock Mode**.

### **6.1 Environment Configuration**

* **Mode:** Simulated (as defined in 6).  
* **Feature Flag:** enableGameClock \= True. This allows the test runner to advance time programmatically, which is essential for testing SLA, Expiry, and Entropy logic.  
* **Database:** Cloud Firestore (or a local emulator).

### **6.2 Seed Data Specifications**

Tests should not rely on "Organic" data which is unpredictable. Instead, strictly defined JSON fixtures based on the **EAV (Entity-Attribute-Value)** model should be used.

**Seed 1: The Product (The Potential Energy)**

JSON

{  
  "objectStructId": "prod\_saas\_001",  
  "name": "Enterprise SaaS",  
  "type": "B2B",  
  "pricing": { "currency": "USD", "amount": 10000 },  
  "billing": "Annual",  
  "contractType": "Annual",  
  "personas": \["pers\_dm\_01", "pers\_eu\_01"\]  
}

**Seed 2: The Data Asset (Mock Validation List)**

JSON

{  
  "jobTitles":,  
  "sectors":,  
  "industries":  
}

**Seed 3: The User (Internal Actor)**

JSON

{  
  "userId": "user\_admin\_01",  
  "role": "Admin",  
  "department": "Operations",  
  "capacity": 28800 // Seconds in a work day  
}

### **6.3 Data Cleaning Test Vectors**

* **Vector A (Clean):** Input JobTitle="CTO". Expect: Auto-accept and immediate processing.  
* **Vector B (Dirty):** Input JobTitle="Chief Tech Officer". Expect: System rejects direct save and triggers a **Data Activity** for manual resolution (mapping "Chief Tech Officer" \-\> "CTO").

## ---

**7\. Observability Requirements for Debuggable E2E**

Tests must be observable. The "Black Box" approach is insufficient for a deterministic simulation engine where the internal state (Physics) matters as much as the output.

### **7.1 Activity Logging**

* **Requirement:** Every modification to a \*Record must generate a corresponding Activity log entry.4  
* **Debug Trace:** In the event of a test failure, the system must dump the Activity history for the target object.  
* **Key Fields:** previousState, newState, modifyingUser, timestamp, triggerActivityId.

### **7.2 Health Scores & Entropy**

* **Requirement:** Monitor Opportunity.healthScore.  
* **Invariant:** In Simulated Mode, if the GameClock is advanced without any Activity occurring, the Health Score must decay deterministically.11  
* **Test:** Advance clock 7 days \-\> Assert Health Score decreases.

### **7.3 State Transition Trace (The Chain Reaction)**

* **Requirement:** Log the specific events of the Chain Reaction.  
* **Log Format:** \[Event\] Activity\_Won(ID) \-\> Qualifier\_True(ID) \-\> Opportunity\_Won(ID) \-\> Opportunity\_Created(NewID).  
* **Failure Analysis:** If the chain breaks, identifying *which* link failed (e.g., the Qualifier didn't flip, or the Next Opp didn't create) is critical for debugging the Algo engine.

## ---

**8\. Ambiguities / Open Questions**

The research process identified several critical ambiguities in the provided documentation that must be resolved before the test suite can be considered fully stable.

### **8.1 The "Russell Paradox" of Tenancy**

* **Issue:** The documentation 2 suggests that Oblio (the system) is also a Tenant of itself for B2B purposes.  
* **Ambiguity:** How does the system distinguish between "Oblio the Platform" admin actions and "Oblio the Tenant" sales actions?  
* **Risk:** Tests running as "Super Admin" might inadvertently trigger tenant-level workflows if the ID space isn't strictly separated.  
* **Resolution Requirement:** Confirm if SystemAdmin and TenantAdmin are distinct roles with distinct OrganizationIDs. For testing, assume strict separation.

### **8.2 The "Pre-Existence" of Contacts**

* **Issue:** The documentation 2 implies that prospects are treated as "Existing" in a potential state before they even register.  
* **Ambiguity:** At what exact point is a Contact record created in the database? Is it upon the first internal "Research Activity" or the first external "Form Fill"?  
* **Impact:** Golden Path II (Ingestion) assumes we create the contact. Golden Path III (Execution) assumes the contact exists.  
* **Resolution Requirement:** Define the specific Trigger Event for Record Creation. For MVP tests, assume Record Creation happens at Ingestion.

### **8.3 Activity Generation Logic (Missing Spec)**

* **Issue:** Snippet 8 explicitly states "Activity Generation is Coming Soon," yet other docs describe it as central to the system.  
* **Ambiguity:** How does the system *know* which specific Activity to generate next? Is it hardcoded (e.g., MQL always \= Research), or configured in the Product Tensor?  
* **Hypothesis:** Based on 14, Workflows are generated from Pipelines.  
* **Action:** For MVP tests, assume a hardcoded sequence: Research \-\> Email \-\> Call until the dynamic generation logic is fully documented.

## ---

**9\. Appendix: Capability Definition Reference**

### **A.1 Entity-Attribute-Value (EAV) Structure**

* **ObjectStruct:** The Schema (Blueprint).  
* **FieldStruct:** The Attribute Definition (Metadata).  
* **RecordStruct:** The Data (Instance).  
* **Rule:** The UI renders Structs, but the DB stores Records. Tests must validate the transformation Record \-\> Struct.

### **A.2 Opportunity Stages & Definitions**

1. **MQL (Marketing Qualified Lead):** Minimum Persona Match \+ Opt-in. The Genesis state.  
2. **SQL (Sales Qualified Lead):** Intent \+ Decision Maker \+ Consult Scheduled. The Activated state.  
3. **FTP (First Time Purchase):** Payment \+ Contract. The Point of Transaction.  
4. **RTP (Retention Purchase):** Renewal \+ Upsell. The Recursive state.11

### **A.3 The "Stupify" UX Philosophy**

* **Select:** User picks an object from the list.  
* **Setup:** User configures variables or context.  
* **Stupify:** User executes binary actions in the Sidebar.  
* **Implication:** E2E tests should interact primarily with the Sidebar elements, not main canvas forms (except during the Setup phase).12

### **A.4 Key Mathematical Formulas**

* **Activity Capacity (![][image1]):** ![][image2] (Workable Time / Avg Duration).  
* **Customer Capacity (![][image3]):** ![][image4] (Capacity x Success Rate).

**End of Report**

#### **Works cited**

1. Oblio Activities System Design, [https://drive.google.com/open?id=1Bjk-LZ5qfCMMkDX28Pc2M2C\_QgPB4IPq5rO1gLBet6o](https://drive.google.com/open?id=1Bjk-LZ5qfCMMkDX28Pc2M2C_QgPB4IPq5rO1gLBet6o)  
2. OBLIO Chat Dump, [https://drive.google.com/open?id=1VJz3pp2uAwyja9ZXEaYCZkAql2p5KkqkquugCQb2PXs](https://drive.google.com/open?id=1VJz3pp2uAwyja9ZXEaYCZkAql2p5KkqkquugCQb2PXs)  
3. Oblio Documentation \- 10.) Application Text \- Setup Text.csv  
4. Oblio Documentation \- 10.) Application Text, [https://drive.google.com/open?id=1OXjKEpEOlhEp9OVhLWVB2Lb78jmEfnQfFpmhQbymLFk](https://drive.google.com/open?id=1OXjKEpEOlhEp9OVhLWVB2Lb78jmEfnQfFpmhQbymLFk)  
5. Documenting-Oblio-Ad-Model, [https://drive.google.com/open?id=1yF7zdNtD37NWQ7POds2TiuqXNlcfEuo06tHz2c5H56c](https://drive.google.com/open?id=1yF7zdNtD37NWQ7POds2TiuqXNlcfEuo06tHz2c5H56c)  
6. Merging-Oblio-System-and-Architecture, [https://drive.google.com/open?id=1BmAtvZAoZPsmJ5\_2d4hq6gHADpQVRoNJH-pcmY3dwyg](https://drive.google.com/open?id=1BmAtvZAoZPsmJ5_2d4hq6gHADpQVRoNJH-pcmY3dwyg)  
7. Oblio Documentation x.) Testing Plan, [https://drive.google.com/open?id=1lPrJfW3C6mTg1kjAGnwfpAV\_H9iLFBOnj2jS6Htj8zY](https://drive.google.com/open?id=1lPrJfW3C6mTg1kjAGnwfpAV_H9iLFBOnj2jS6Htj8zY)  
8. Oblio Documentation \- 7.) Logic & Functions, [https://drive.google.com/open?id=1YLPMYmwSig7w5475hYC9rGlo6LPYg3OjQ-vNmusvyMk](https://drive.google.com/open?id=1YLPMYmwSig7w5475hYC9rGlo6LPYg3OjQ-vNmusvyMk)  
9. Oblio MVP Scope Planning, [https://drive.google.com/open?id=1zZ-rbQUONZW2iXOEDeT-7PcsOwcvAxJe3lu9VCvoR1M](https://drive.google.com/open?id=1zZ-rbQUONZW2iXOEDeT-7PcsOwcvAxJe3lu9VCvoR1M)  
10. Oblio Data Relation Example, [https://drive.google.com/open?id=1C\_ywT-g46uVDeMrKLFe7URTpE5LqgAbaOnXnYgI5xTU](https://drive.google.com/open?id=1C_ywT-g46uVDeMrKLFe7URTpE5LqgAbaOnXnYgI5xTU)  
11. Oblio-Acitivity-Qualification, [https://drive.google.com/open?id=1X-k9hjN8ZYmCd7lbQlikJYXqtr71N8-1Mxf4hQFlh6s](https://drive.google.com/open?id=1X-k9hjN8ZYmCd7lbQlikJYXqtr71N8-1Mxf4hQFlh6s)  
12. Oblio Documentation \- 2.) UI & UX, [https://drive.google.com/open?id=15c4tM6c\_a\_wSTSQIDNCOlqEu8rt0voi1BgDnw3OpOfE](https://drive.google.com/open?id=15c4tM6c_a_wSTSQIDNCOlqEu8rt0voi1BgDnw3OpOfE)  
13. Create Oblio Business Use Case \- 20230608\_142942 \- user.md  
14. Oblio Documentation \- 5.) Objects, [https://drive.google.com/open?id=1S\_aGZPjBtEIzQ8yQvkgxSDtQPbO-vagv4vBpW7ZSQ8k](https://drive.google.com/open?id=1S_aGZPjBtEIzQ8yQvkgxSDtQPbO-vagv4vBpW7ZSQ8k)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAZCAYAAADe1WXtAAABDklEQVR4Xu2TLYtCQRSGX1kVVsyKwWAwLMbNGmwGQSzb9y9sEAz2/Q8Li8G2qGAz3Sh2MYjBosmysMngvodzxXvHD5y52HzggTtzhpe5Z2aABzfwQX/pq1mIwpruad0suFKGBooto+ZEmnp0Bw1th6qOzOgbXUFDe+GyPTE6os90CQ31ggtskSAJlGDBg4bKjp1pQn/9QBcaugnMWSG7m9Iizfl+QkPlwJwo4XiFzmlNgn7TuDEvl945dAJ9kibyPP9wOTRLK9BNhXiic+gCk2uhP3RAO3R8mMzgct+SdHimLgcmLfqiBX/tO23438680C1O+x+JGk7bkTLG1uTpIjCu0n5gHAk5WDmXB3fkH7F2Pqjlcr++AAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAAZCAYAAACM9limAAADH0lEQVR4Xu2YTahNURTHl3xEvj8ioYcBKWWAAaGUAYkBE6VMJBMTSWJ0S4qZrxmRgZkyUgbSLYUYiHyMFKUUoRQlhfVr733veuuec957955zXri/+vfOXnvfu/fde+211nkiffr0+Yt5plrpjcps1fwMjbWD6mS/6vcw9SF+phduqSZ6o/JTOuezeqDa3hpdA59Ux017nOqG6r1qqbFvlrD4XlitWuKNhqkSNuGe71DWq76oTqrGuL5KeCTBjRMLVG+k82Rx65em3Q0NCRufxwoJG3Ped0QOSdicrKtYKizEn+AxCYvb4uy07zvbSNiqeuqNjlMSPJh1ZcHhsLbrvqNs+LH+BLlGTG6vEWxUXXS2kcBn8zwBJqvuqJqqKYO7WqSNaTp7LaQgWDZ423RvNGyTMO8u32FIYyr3mCyY+Jc39ghe2fBGB9eIufOuEaQxXPdaIfAyMYG3TAiak7zRQRYs8lQCLoH3oRR7XiUQc1jcCd/RA2zIbW/MgHmLNobNpX+P76gDXJRr5DNSL6xTvfLGDPjRZKQ8+A7GDOV5pZNXv1iodxaZdhrHYqcZu4U6aac3OorqF14JKEA/qta4Phgvwc5fC8XkpvhMQThg+mCZaoezZYKX4C1514jJb6peq5ZLSKnN2HdQQmDMgtplnjc62Li8jHRNioMy715HJLwyEIOATToqIR7BKgmlACUBLFZdUu1VvVWdjvYWE6R9t718oXVYwoQp+PGl300/m+PBCzd4oyH96Dw9l8FVuSUdTArEl1Uv4vMBCVfYru9C/HtW2hsIjFlr2l1BldyIz7h9Wgjguh4CZVUZJHl44rHqqmk3VO9MOx0cNpt1+Q1zTLsrCM4L4zMumOoJTsdD5YybVwVzfzXtdPK7Y9uujwNNFf43aV9ZDjPL00cMX5JeFX5IiCtcr3OtEW0YO5w03S28e32OzwMSNoLEkK4/sZB4yfrORBtwPdmwWaq7UsI1SsxQzY3PZKW8DPZEOl9Qq4AYRNZhHT4eFa1vpoTrV8u/MCxXZBQmHQKyUkrRPjj/15AISOv8I2yfjEKx2Odf5A9eW6tgIGJ5qAAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAaCAYAAABozQZiAAAA10lEQVR4Xu2SPQ4BURSFr6AQwgI0YgEanUokdqNW6uxAFBJ7sAKZjlIhkaCUSPQaIpyTa5I715iZni/5mnN/3puXEfkT0oIr+IRbOIcBvME8HMJm2Gypig6xceRqHbgUrVdcTfbvQs0XDCfRnggcYMgFSQTwbIM2vMK1JJ9KAji2wUT01IENv9CFdRuE3xH7gmlw8OMRspJ1OAeLPsw6zDcp+PAu6cMNuPEh6cOH6G/Hq3nKcCYxVyYc4JV4+tTVuPgASy6PwAVH0QUXuBD9aXawZ/r+/BgvTXMtfwv55bEAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAZCAYAAABggz2wAAACNElEQVR4Xu2WwUtVQRSHT6RSKJgFpjsRCiJcWSZiIBHhRhei1MpeG/0DIttG4qJtSxHEhbizoK3QAyHCvbhy4UbBIEGoRZH1+3Xu+Oadd6fXe/c+uOj94IPrmXnXOXfmzIxITs6Z5jk8tsEMMgVX4Vv4MIo9KDVXZx/+tsEMcQFOw0P4Bq7BH/AR/Or1+yf3RZPMcqIncN4GRce8aYNxtMEi/CnZTbQTHsBe2yAa5zKuyjZ8DPdEE+USScIl+NoGPfj+SRuswku4A6/bBtHx37JBC//pB3gZ7oomyhlOAt9ZgHdM3FEQnYVaYKIc2ysTJ1elyuQwOSbpOhVFX9btOiSEu/gX72/3AQa82P/SLqU9xMkZvut3CjEhOu2OFdEXxNVBPTAxJusSK0jtM+mzLpXJHpX1iIGD2II3RGeQcsvmj4e9fmnAZH/BIduQAI6fSXK8cXV7ym2p/DrOMa9fGiRNtM8GIrjTcrzBUmuGy7DJxJkgfzhr4kngl2ed3hNdtvXU54INRLgNqsM2OD6LfmVLP/wGl2xDxIjUNttpbEY8NkKJsvSCNXpRwueRS5Sbkg9XwAs4A5/BwfLmWJhU3AyG4iHGRY+9HhPne3hTmjPxvzcLW4uOFvg+pt1tSqyvJ9Ezl2Br9BwirQsDz/OP8Cb8JHqf3RC9334XnbTU4KBDV69GcwU+jZ6ZFGdvEY6KjitVuMTtUuYKOHNwZ34nWqekS9I/ZzMDa+qaNGC55OTknC/+AN0xc6eJpASnAAAAAElFTkSuQmCC>