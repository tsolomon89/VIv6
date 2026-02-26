# Canonical Glossary

> **Rule**: Every key term in the system is defined here. No synonyms allowed.

## A
- **Account**: A Tenant or Organization record. The primary boundary of data ownership.
- **Activity**: An event record (`obj_activity`) representing an action taken by a User or Actor.
- **Actor**: The entity performing an Activity (usually a `User` or `System`).
- **Asset**: A semantic content node (`obj_asset`) such as an Image, Email, or Page.
- **Attribution**: The process of linking an Effect (Conversion) to a Cause (Activity/Asset).

## C
- **Campaign**: A Logic Orchestrator (`obj_campaign`) that manages groupings of Assets and Workflows.
- **Channel**: The distribution method of an Asset (e.g., `email`, `social`).
- **Context**: The runtime state, including Current Account, User, and Environment.

## D
- **DataRecord**: The Data Transfer Object (DTO) representing the flat DB projection of a Record, used in API transit and business logic.

## F
- **Feature**: A functional capability (`obj_feature`) sold as part of a Product.
- **FieldDef**: A Meta-Record (`obj_field_def`) defining a single attribute of an Object.

## H
- **Health Score**: A computed value (0-100) representing the viability of an entity, subject to entropic decay.
- **Homoiconic**: "Same Representation". The property where the System's Schema is stored as System Data.

## M
- **Medium**: The form factor of an Asset (e.g., `pdf`, `video`).
- **Meta-Object**: A record that defines other records (`ObjectDef`, `FieldDef`).

## O
- **ObjectDef**: A Meta-Record (`obj_object_def`) defining a Type of Record (Schema).
- **Oblio**: Tenant #0. The root tenant that owns the Canonical Schema.
- **Opportunity**: A record tracking a potential sale or conversion process.

## P
- **Persona**: A target audience definition (`obj_persona`).
- **Pipeline**: A high-level grouping of Opportunity Types.
- **Product**: A sellable unit (`obj_product`) containing Features.

## R
- **RecordStruct**: The strict, denormalized, hydrated UI format (TypeScript interface). Distinct from the flat `DataRecord`.
- **Resource Economy**: The set of rules governing Action Capacity and Entity Health.

## S
- **SceneConfig**: The data record controlling the Visual Engine's state.
- **Schema**: The collection of `ObjectDef` and `FieldDef` records.
- **Solution**: A Record (`obj_solution`) describing the Value Proposition of a Feature.
- **Struct**: The UI format. Denormalized, hydrated TypeScript interface.

## U
- **UI Contract**: The rules governing data flow between the Fact Store (Record) and the View (Struct).
- **Use Case**: A context (`obj_use_case`) describing how a Solution applies to a specific market/persona.

## V
- **Visual Engine**: The runtime system that renders the `SceneConfig` and manages the Editor overlays.
