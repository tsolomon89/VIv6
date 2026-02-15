
import { z } from 'zod';

// --- Base Entity Schema (Universal) ---
export const BaseEntitySchema = z.object({
    id: z.string().uuid().optional(),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    name: z.string().min(1, "Name is required").max(60, "Name too long"),
    description: z.string().optional().describe("max:200|role:body-medium"),
    account_id: z.string().uuid().optional(), // Required for insertion, but optional for validation before context is known
});

// --- Specific Data Schemas ---

// Account Data (Replaces Brand)
export const AccountDataSchema = z.object({
    website: z.string().url().optional(),
    logoUrl: z.string().optional(),
    primaryColor: z.string().optional(),
    socials: z.object({
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
    }).optional(),
    // Runtime Features (Phase 3)
    usage: z.record(z.string(), z.number()).optional(),
    active_product_ids: z.array(z.string().uuid()).optional(),
});

// Product Data
export const ProductDataSchema = z.object({
    tagline: z.string().max(60).optional(),
    category: z.string().optional(),
    releaseYear: z.string().optional(),
    imageUrl: z.string().url().optional(),
    product_type: z.enum(['B2B', 'B2C', 'PRT', 'RES', 'HUM', 'SUP', 'INV', 'AFF']).optional(),
    pricing: z.object({
        value: z.number(),
        currency: z.string(),
        model: z.string()
    }).optional(),

    // ODAC: Capabilities granted when this product is "owned" via WON opportunity
    // Only applicable for HUM (Human) type products representing job titles/roles
    // Pattern: 'action:resource' e.g., 'read:contacts', 'write:assets', 'admin:*'
    capabilities: z.array(z.string()).optional(),

    // Entitlements: Feature flags enabled by this product (for software products)
    entitlements: z.array(z.string()).optional()
});

// Feature Data
export const FeatureDataSchema = z.object({
    benefit: z.string().max(100).optional(),
    technicalSpecs: z.record(z.string(), z.string()).optional(),
    icon: z.string().optional(),
    entitlement: z.object({
        metric: z.string(),
        limit: z.union([z.number(), z.literal('unlimited')])
    }).optional()
});

// Solution Data
export const SolutionDataSchema = z.object({
    industry: z.string().optional(),
    challenge: z.string().max(200).optional(),
    outcome: z.string().max(200).optional(),
});

// UseCase Data
export const UseCaseDataSchema = z.object({
    customerName: z.string().optional(),
    metricImprovement: z.string().optional(),
    quote: z.string().optional(),
});

// Persona Data
export const PersonaDataSchema = z.object({
    role: z.string().optional(),
    goals: z.string().optional(),
    painPoints: z.array(z.string()).optional(),
});

// Asset Data (New)
export const AssetDataSchema = z.object({
    headline: z.string().optional(),
    content: z.string().optional(),
    url: z.string().url().optional(),
    asset_type: z.enum(['page', 'article', 'post', 'ad', 'email', 'image', 'video', 'document']).optional(),
    source: z.string().optional(),
    medium: z.string().optional(),
    channel: z.string().optional(),
});

// Opportunity Data (New)
export const OpportunityDataSchema = z.object({
    pipelineId: z.string().optional(),
    currentStage: z.string().optional(),
    probability: z.number().optional(),
    expectedCloseDate: z.string().optional(),
});

// Page Data
export const PageDataSchema = z.object({
    schemaVersion: z.number().default(1),
    pageContext: z.object({ kind: z.enum(["index", "detail"]) }),
    pageSubject: z.object({
        target: z.enum(["account", "product", "feature", "solution", "useCase", "persona"]),
        cardinality: z.enum(["one", "many"]),
    }),
    sections: z.array(z.any()).default([]), 
});


// --- Full Schemas ---

// Accounts are special (Separate Table), but we might treat them as Entities for tooling?
// For now, let's keep EntitySchemas focused on the `entities` table content.
// But wait, the previous `BrandSchema` was here. 
// If we want `createEntityTool` to work for Accounts, we need to map it.
// BUT `entities` table has foreign key to `accounts`. You cannot insert an Entity without an Account.
// So Account creation must happen BEFORE Entity creation.
// Therefore, Account is NOT an Entity in the `entities` table sense.

export const ProductSchema = BaseEntitySchema.extend({
    type: z.literal('product'),
    data: ProductDataSchema,
});

export const FeatureSchema = BaseEntitySchema.extend({
    type: z.literal('feature'),
    data: FeatureDataSchema,
});

export const SolutionSchema = BaseEntitySchema.extend({
    type: z.literal('solution'),
    data: SolutionDataSchema,
});

export const UseCaseSchema = BaseEntitySchema.extend({
    type: z.literal('useCase'),
    data: UseCaseDataSchema,
});

export const PersonaSchema = BaseEntitySchema.extend({
    type: z.literal('persona'),
    data: PersonaDataSchema,
});

export const AssetSchema = BaseEntitySchema.extend({
    type: z.literal('asset'),
    data: AssetDataSchema,
});

export const PageEntitySchema = BaseEntitySchema.extend({
    type: z.literal('page'),
    data: PageDataSchema,
});

// Registry of all Content Entity Schemas
export const EntitySchemas = {
    product: ProductSchema,
    feature: FeatureSchema,
    solution: SolutionSchema,
    useCase: UseCaseSchema,
    persona: PersonaSchema,
    asset: AssetSchema,
    page: PageEntitySchema,
};

export type EntityType = keyof typeof EntitySchemas;
