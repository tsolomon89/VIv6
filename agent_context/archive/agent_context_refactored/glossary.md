# Canonical Glossary

> **Statement of Intent:** This document defines the *only* valid vocabulary for the VIv5 / Oblio system. Synonyms are explicitly forbidden to prevent drift.

## Core Entities

| Term | Definition | Forbidden Synonyms |
| :--- | :--- | :--- |
| **Account** | A grouping of people and resources. Can be a business, household, or team. The *only* distinction between B2B and B2C is `account_class`. | Company, Org, Tenant, Workspace |
| **Contact** | A single human identity. Distinct from "User" (which implies a login). One Contact can have many Emails and many AccountMemberships. | Person, User (unless specifically referring to login state), Lead |
| **Entity** | A generic catalog node (Product, Feature, Solution, UseCase, Asset). Stored in the `entities` table. | Item, Object, Node |
| **Opportunity** | A potential transaction between two Accounts. Captures one side's view of the deal (e.g., "Supplier Opportunity" vs "B2B Sales Opportunity"). | Deal, Lead (ambiguous) |
| **Activity** | An immutable event record (view, click, submit, purchase). | Event, Log, Action |
| **Dimension** | A targeting axis (e.g., `companySize`, `sector`). | Category, Tag, Field |
| **DimensionValue** | A controlled vocabulary item within a Dimension (e.g., `SMB`, `Healthcare`). | Option, Choice |
| **Service Definition** | A Product (`type='product'`). Defines the "container" of value (e.g., SaaS Subscription, Retainer). | SKU, Item |
| **Entitlement** | A Feature (`type='feature'`). A specific capability or limit granted by a Product (e.g., "5 Users", "Reporting Engine"). | Feature (ambiguous), Usage Limit |

## System Architecture Concepts

| Term | Definition | Forbidden Synonyms |
| :--- | :--- | :--- |
| **Record** | A persistence entity (heavy) used for Database operations (e.g., `DataRecord`). Contains metadata (`snapshotData`) and refs. | Document, DB Row |
| **Struct** | A UI data transfer object (light). Immutable, serializable, and used for rendering/state. | DTO, Model, ViewObject |
| **Oblio OS** | The root system (Tier 0) that owns the canonical DimensionValues and administers the platform. | SuperAdmin, Root, System |
| **Tier 1 Account** | An Account that is "deployed" on the platform (has logins, manages its own data). | Client, Customer (ambiguous) |
| **Managed Account** | An Account record that is owned/maintained by another Account (Tier 1 or Tier N). It does not (yet) have its own logins. | Phantom Account, Shadow Account |
| **Tier 0/1/2** | The Bootstrapping hierarchy: **Tier 0** (Code/Schema), **Tier 1** (Platform Tenant/Oblio OS), **Tier 2** (Client Tenants). | Levels, Layers |

## Inventory & Logic

| Term | Definition | Forbidden Synonyms |
| :--- | :--- | :--- |
| **Inventory Graph** | The derived relationship chain: `Product` -> `Feature` -> `Solution` -> `UseCase`. | Product Tree, Offering Map |
| **Derivation** | The process of generating a web page from an Entity and its Relationships (Inventory Graph). | Generation, Build |
| **Binding** | The connection between a Template slot and a Data source (e.g., `related.feature.many`). | Mapping, Hook |
| **North Star** | The guiding principle that adding an Entity *automatically* creates its Landing Page without manual design. | Vision, Goal |

## Identity & Access

| Term | Definition | Forbidden Synonyms |
| :--- | :--- | :--- |
| **Membership** | The edge connecting a Contact to an Account (`account_memberships`). Carries Role and Permissions. | UserAccount, Access |
| **Role** | The permission set (Admin/Leader/Senior/Junior) assigned to a Membership. | Rank, Level |
| **Attribution** | The process of decoding a URL or Asset ID into its targeting context (`personaType`, `oppType`, `source`). | Tracking, Source |
| **Slug** | A human-readable, URL-safe unique identifier. | URL Part, ID, Key |
