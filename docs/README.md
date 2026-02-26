# VI v5 (Oblio) System Specification

This is the canonical, retrieval-optimized specification corpus for the **VI v5 (Oblio)** platform. It defines the system's architecture, invariant rules, and core domain models. 

## Design Philosophy

VI v5 operates on a highly normalized, homoiconic data model. Instead of sprawling tables for every business concept, the system revolves around **Records** (Entities) and their **Relationships**, combined with strict **Invariants** that dictate business physics.

Key architectural paradigms:
1. **Identity Flattening**: Users and Accounts are foundational, but the core activity loop operates on primitive Records (Products, Opportunities, Activities).
2. **Opportunity-Centric Model**: The Opportunity is the central tensor connecting a Product to an Account/Contact via a defined Pipeline.
3. **Chain Reaction Physics**: Workflows and activities are generated dynamically through Qualifier evaluations rather than static procedural code.

## Corpus Index

- **[Glossary](glossary.md)**: The definitive lexicon. All terms used in this corpus are defined here.
- **[Architecture & Models](architecture-models.md)**: The physical and logical database structures (EAV/Homoiconic records).
- **[Opportunity Physics](opportunity-physics.md)**: The mechanics of the commercial engine, pipelines, and activity generation.
- **[Invariants & Contracts](invariants-and-rules.md)**: The absolute laws of the system, expressed as MUST/SHOULD/MAY constraints.

## Using this Corpus

This documentation is designed as an executable contract system. When expanding the platform or building integrations:
1. **Check the Glossary**: Do not invent parallel terms (e.g., do not use "Entity" when the glossary defines "Record").
2. **Respect Invariants**: Any new code MUST comply with the constraints defined in [Invariants](invariants-and-rules.md).
3. **Follow the EAV Pattern**: New domains SHOULD be implemented as Record Definitions (`object_def`), not as new SQL tables.
