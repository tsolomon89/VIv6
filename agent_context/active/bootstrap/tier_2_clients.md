# Tier 2: The First Clients (Your Projects)

> **Principle**: Your own projects are not "System Config". They are **Customer Accounts** inside Oblio.
> **Implementation**: These are defined as JSON Seed Files in `data/seeds/tenants/`.

## 1. The Relationship

Tier 2 consists of the first set of **Tenants** created in the system.
Crucially, these are created as **Account Records** within the Tier 1 (Oblio) partition.

- **Oblio** (Tier 1) is the Service Provider.
- **Victory Initiative** (Tier 2) is a Customer of Oblio.
- **Tim Solomon** (Tier 2) is a Customer of Oblio.

## 2. Seeded Tenants

The bootstrapping script (`npm run db:seed`) reads from `data/seeds/tenants/*.json` to generate these accounts.

| Tenant Name | Account Slug | Domain | ID (Static) |
| :--- | :--- | :--- | :--- |
| **Victory Initiative** | `victory_initiative` | `victoryinitiative.com` | `acc_vi_000000000000000001` |
| **Tim Solomon** | `tim_solomon` | `timsolomon.com` | `acc_tim_000000000000000002` |
| **Keimenon** | `keimenon` | `keimenon.com` | `acc_kei_000000000000000003` |

## 3. Seed Data Structure

The system expects a strict JSON format for these seeds to ensure they can be hydrated into `RecordStructs`.

### Path: `data/seeds/tenants/victory_initiative.json`

```json
{
  "tenant_slug": "victory_initiative",
  "account_id": "acc_vi_000000000000000001",
  "domain": "victoryinitiative.com",
  "owner": {
    "email": "tim@victory.com",
    "name": "Tim Solomon"
  },
  "subscription": {
    "plan_id": "plan_enterprise",
    "status": "active"
  },
  "initial_records": [
    {
      "typeObject": "Project",
      "fields": [
        { "nameField": "title", "value": "Campaign Alpha" },
        { "nameField": "budget", "value": 50000 }
      ]
    }
  ]
}
```

### Ingestion Logic
1.  **Read JSON**: The seeder parses the file.
2.  **Create Account**: Inserts `Account` record into Tier 1 (Oblio).
3.  **Create Owner**: Inserts `Contact` record into Tier 1 (Oblio).
4.  **Link**: Creates Membership `(Contact=Tim, Account=Victory, Role=Owner)`.
5.  **Context Switch**: The seeder switches context to `account_id = acc_vi`.
6.  **Hydrate Records**: The `initial_records` are inserted into the new Account partition.

## 4. Domain Routing

When a request hits `victoryinitiative.com`:
1.  **Middleware** checks the Domain Registry (a cached projection of Tier 1 data).
2.  **Resolution**: Maps domain -> `acc_vi_...001`.
3.  **Context**: The App boots with `CurrentAccount = acc_vi`.
4.  **Content**: The CMS renders pages from the `acc_vi` partition.
