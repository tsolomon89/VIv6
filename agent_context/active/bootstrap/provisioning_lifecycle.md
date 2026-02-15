# Provisioning Lifecycle

> **Context**: How a new Tenant (Account) creates logic, data, and users.
> **Mechanism**: "CRM Action creates Tenant".

## 1. The Trigger
A new Tenant is born when an `Activity` of type `SubscriptionStarted` or `AccountCreated` is recorded in the **Oblio Mapping** (Tier 1).

## 2. The Provisioning Sequence
The `ProvisioningAgent` (a background worker) reacts to the trigger:

### Phase A: The Record (Identity)
1.  **Validate**: Check if `domain` or `slug` is unique in Tier 1.
2.  **Create**: Insert `RecordStruct` (Type=`Account`) into Tier 1.
    - ID: `acc-victory-uuid`
    - Name: "Victory Initiative"
    - Status: "Provisioning"

### Phase B: The Inheritance (Schema binding)
The new Account does not need its own Schema. It inherits from Tier 1.
- `Account.schema_ref` -> `oblio-schema-v1`
- *No tables are created.* The system simply recognizes `account_id = acc-victory-uuid` as a valid valid partition.

### Phase C: The Membership (The Owner)
1.  **Find/Create** the Contact record for the Owner (`tim@victory.com`).
2.  **Create Membership**: Link `Contact` to `Account`.
    - Role: `Admin` (Reference to `rec-role-admin`).

### Phase D: Seeding (The Starter Pack)
If the Plan includes default content (e.g., "Agency Template"):
1.  **Clone Records**: The Agent copies specific Template Records from the `oblio-templates` Account into the new `acc-victory-uuid` partition.
2.  **Rewrite Refs**: Internal references within the template are updated to point to the new copies (preserving graph integrity).

## 3. Decommissioning (Game Over)
When a Tenant cancels:
1.  **Status Change**: Update Tier 1 Account Record to `Archived`.
2.  **Access Revocation**: The Query Engine rejects queries with `account_id = acc-victory-uuid` unless the user is a SuperAdmin.
3.  **Data Retention**: The data remains (Immutable Log) but is inaccessible.
