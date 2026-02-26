/**
 * seed_ai.ts
 *
 * Seeds AI Agent integration data:
 * 1. AI Agent fields for Contact object_def
 * 2. approval_rule object_def and seed data
 *
 * This script is idempotent and can be run multiple times.
 */

import { db, initDb } from '../core/db.js';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

const SYSTEM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

// Type Definitions
type FieldInputType = 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'select' | 'multiselect' | 'image' | 'url' | 'boolean' | 'ref' | 'Record';

interface FieldSeed {
    slug: string;
    name: string;
    type: FieldInputType;
    options?: string[];
    ref_target?: string;
    required?: boolean;
    summary?: string;
    group?: string;  // Field group for UI organization
}

// AI Agent fields to add to Contact object_def
const AI_AGENT_FIELDS: FieldSeed[] = [
    {
        slug: 'is_ai_agent',
        name: 'AI Agent',
        type: 'boolean',
        summary: 'Toggle to mark this contact as an AI agent',
        group: 'AI Config'
    },
    {
        slug: 'ai_provider',
        name: 'AI Provider',
        type: 'select',
        options: ['openai', 'anthropic', 'google'],
        summary: 'The AI provider for this agent',
        group: 'AI Config'
    },
    {
        slug: 'ai_model',
        name: 'AI Model',
        type: 'text',
        summary: 'Model identifier (e.g., claude-opus-4-5, gpt-4o)',
        group: 'AI Config'
    },
    {
        slug: 'ai_credential_id',
        name: 'AI Credential',
        type: 'text',  // References ai_credentials table
        summary: 'ID of the credential to use',
        group: 'AI Config'
    },
    {
        slug: 'ai_system_prompt',
        name: 'System Prompt',
        type: 'textarea',
        summary: 'Base instructions defining persona and purpose',
        group: 'AI Config'
    },
    {
        slug: 'ai_allowed_tools',
        name: 'Allowed Tools',
        type: 'multiselect',
        options: [
            'create_entity', 'get_entity', 'list_entities', 'update_entity', 'delete_entity',
            'link_entities', 'get_relationships',
            'list_dimension_types', 'list_dimension_values',
            'execute_view', 'compute_derivation', 'compute_metric'
        ],
        summary: 'MCP tools this agent is allowed to use',
        group: 'AI Config'
    },
    {
        slug: 'ai_max_iterations',
        name: 'Max Iterations',
        type: 'number',
        summary: 'Maximum tool call iterations per execution',
        group: 'AI Config'
    },
    {
        slug: 'ai_token_budget',
        name: 'Token Budget',
        type: 'number',
        summary: 'Per-job token limit',
        group: 'AI Config'
    }
];

// Approval Rule object definition
const APPROVAL_RULE_OBJECT = {
    slug: 'approval_rule',
    name: 'Approval Rule',
    summary: 'Tier-1 configuration for when AI work requires human approval',
    icon: 'shield-check',
    fields: [
        { slug: 'name', name: 'Rule Name', type: 'text' as FieldInputType, required: true },
        {
            slug: 'trigger',
            name: 'Trigger Type',
            type: 'select' as FieldInputType,
            options: ['field_change', 'record_create', 'confidence_below'],
            required: true,
            summary: 'What triggers this approval rule'
        },
        {
            slug: 'trigger_fields',
            name: 'Trigger Fields',
            type: 'multiselect' as FieldInputType,
            options: ['persona', 'linkage', 'budget', 'stage', 'amount', 'status'],
            summary: 'Fields that trigger approval (for field_change trigger)'
        },
        {
            slug: 'target_types',
            name: 'Target Types',
            type: 'multiselect' as FieldInputType,
            options: ['contact', 'account', 'opportunity', 'activity', 'product'],
            summary: 'Record types that trigger approval (for record_create trigger)'
        },
        {
            slug: 'confidence_threshold',
            name: 'Confidence Threshold',
            type: 'number',
            summary: 'Minimum confidence (0-1) before requiring approval'
        },
        {
            slug: 'requires_role',
            name: 'Requires Role',
            type: 'select' as FieldInputType,
            options: ['any', 'Admin', 'Senior', 'Manager'],
            required: true,
            summary: 'Role required to approve'
        },
        { slug: 'is_active', name: 'Active', type: 'boolean' as FieldInputType, summary: 'Whether this rule is active' }
    ]
};

// Default approval rules to seed
const DEFAULT_APPROVAL_RULES = [
    {
        slug: 'persona-change-requires-senior',
        name: 'Persona Change Requires Senior',
        trigger: 'field_change',
        trigger_fields: ['persona', 'linkage'],
        requires_role: 'Senior',
        is_active: true,
        summary: 'Changes to persona or linkage fields require Senior approval'
    },
    {
        slug: 'opportunity-create-requires-admin',
        name: 'Opportunity Create Requires Admin',
        trigger: 'record_create',
        target_types: ['opportunity'],
        requires_role: 'Admin',
        is_active: true,
        summary: 'AI-created opportunities require Admin approval'
    },
    {
        slug: 'low-confidence-requires-review',
        name: 'Low Confidence Requires Review',
        trigger: 'confidence_below',
        confidence_threshold: 0.8,
        requires_role: 'any',
        is_active: true,
        summary: 'Changes with confidence below 80% require human review'
    }
];

export function seedAI() {
    console.log('🤖 Seeding AI Agent Integration Data...');

    // 1. Get Contact object_def ID
    const contactObj = db.prepare(`
        SELECT id FROM records
        WHERE type = 'object_def' AND slug = 'contact' AND account_id = ?
    `).get(SYSTEM_ACCOUNT_ID) as { id: string } | undefined;

    if (!contactObj) {
        console.error('❌ Contact object_def not found. Run seed_schema.ts first.');
        return;
    }

    // 2. Seed AI Agent fields for Contact
    const upsertField = db.prepare(`
        INSERT INTO records (id, type, slug, name, summary, account_id, data, created_at, updated_at)
        VALUES (@id, 'field_def', @slug, @name, @summary, @account_id, @data, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(account_id, slug) DO UPDATE SET
            name = excluded.name,
            summary = excluded.summary,
            data = excluded.data,
            updated_at = CURRENT_TIMESTAMP
    `);

    let fieldCount = 0;
    db.transaction(() => {
        for (const field of AI_AGENT_FIELDS) {
            const fieldSlug = `contact_${field.slug}`;
            const fieldData = {
                type: field.type,
                object_def_id: contactObj.id,
                options: field.options,
                required: field.required,
                group: field.group || 'AI Config',
                is_ai_field: true  // Mark as AI-specific field
            };

            upsertField.run({
                id: randomUUID(),
                slug: fieldSlug,
                name: field.name,
                summary: field.summary || '',
                account_id: SYSTEM_ACCOUNT_ID,
                data: JSON.stringify(fieldData)
            });
            fieldCount++;
        }
    })();
    console.log(`   ✅ Added ${fieldCount} AI Agent fields to Contact`);

    // 3. Seed approval_rule object_def
    const upsertObject = db.prepare(`
        INSERT INTO records (id, type, slug, name, summary, account_id, data, created_at, updated_at)
        VALUES (@id, 'object_def', @slug, @name, @summary, @account_id, @data, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(account_id, slug) DO UPDATE SET
            name = excluded.name,
            summary = excluded.summary,
            data = excluded.data,
            updated_at = CURRENT_TIMESTAMP
    `);

    const findObjectBySlug = db.prepare(`
        SELECT id FROM records WHERE slug = ? AND type = 'object_def' AND account_id = ?
    `);

    let approvalObjId: string;
    db.transaction(() => {
        const existing = findObjectBySlug.get(APPROVAL_RULE_OBJECT.slug, SYSTEM_ACCOUNT_ID) as { id: string } | undefined;
        approvalObjId = existing?.id || randomUUID();

        upsertObject.run({
            id: approvalObjId,
            slug: APPROVAL_RULE_OBJECT.slug,
            name: APPROVAL_RULE_OBJECT.name,
            summary: APPROVAL_RULE_OBJECT.summary,
            account_id: SYSTEM_ACCOUNT_ID,
            data: JSON.stringify({ category: 'system', icon: APPROVAL_RULE_OBJECT.icon, is_system: true })
        });

        // Seed approval_rule fields
        for (const field of APPROVAL_RULE_OBJECT.fields) {
            const fieldSlug = `approval_rule_${field.slug}`;
            const fieldData = {
                type: field.type,
                object_def_id: approvalObjId,
                options: field.options,
                required: field.required
            };

            upsertField.run({
                id: randomUUID(),
                slug: fieldSlug,
                name: field.name,
                summary: field.summary || '',
                account_id: SYSTEM_ACCOUNT_ID,
                data: JSON.stringify(fieldData)
            });
        }
    })();
    console.log(`   ✅ Created approval_rule object_def with ${APPROVAL_RULE_OBJECT.fields.length} fields`);

    // 4. Seed default approval rules
    const upsertRule = db.prepare(`
        INSERT INTO records (id, type, slug, name, summary, account_id, data, created_at, updated_at)
        VALUES (@id, 'approval_rule', @slug, @name, @summary, @account_id, @data, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(account_id, slug) DO UPDATE SET
            name = excluded.name,
            summary = excluded.summary,
            data = excluded.data,
            updated_at = CURRENT_TIMESTAMP
    `);

    let ruleCount = 0;
    db.transaction(() => {
        for (const rule of DEFAULT_APPROVAL_RULES) {
            const ruleData = {
                trigger: rule.trigger,
                trigger_fields: rule.trigger_fields,
                target_types: rule.target_types,
                confidence_threshold: rule.confidence_threshold,
                requires_role: rule.requires_role,
                is_active: rule.is_active
            };

            upsertRule.run({
                id: randomUUID(),
                slug: rule.slug,
                name: rule.name,
                summary: rule.summary,
                account_id: SYSTEM_ACCOUNT_ID,
                data: JSON.stringify(ruleData)
            });
            ruleCount++;
        }
    })();
    console.log(`   ✅ Seeded ${ruleCount} default approval rules`);

    console.log('✅ AI Agent Integration Seeding Complete.');
}

// Auto-run if executed directly
const nodePath = process.argv[1];
const modulePath = fileURLToPath(import.meta.url);

if (nodePath === modulePath) {
    initDb();
    seedAI();
}
