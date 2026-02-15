
export enum PersonaType {
    DecisionMaker = 'decision_maker',
    EndUser = 'end_user',
    Influencer = 'influencer'
}

export enum SpiresRole {
    Admin = 'role_admin',
    Editor = 'role_editor',
    Member = 'role_member'
}

export interface KineticRoutingRule {
    routing_target: string; // e.g., 'role_admin'
    decay_rate: number;     // e.g., 0.8
}

export interface PersonaMetadata {
    power_level: number;
    kinetic_routing?: KineticRoutingRule;
}

export interface PersonaDefinition {
    slug: string;
    metadata: PersonaMetadata;
}
