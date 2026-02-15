import type { FieldInputType } from './types.js';

// Helper to construct FieldGroupStructs more easily
interface SimpleField {
    name: string;
    inputType: FieldInputType;
    value?: any;
    options?: string[];
    required?: boolean;
    maxChars?: number;
    typographyRole?: string;
    readonly?: boolean;
    description?: string;
    // Metadata for Ref types
    ref_target?: string;
    // Phase 4: Dimension-based pick-lists
    dimension?: string;       // Links to dimension_values table (e.g., 'function', 'seniority', 'industry')
    dependsOn?: string[];     // Field names to watch for cascading filtering
}

interface SimpleGroup {
    name: string;
    fields: SimpleField[];
}

export const CANONICAL_SCHEMA: Record<string, SimpleGroup[]> = {
    contact: [
        {
            name: 'Identity',
            fields: [
                { name: 'Email', inputType: 'text', required: true, typographyRole: 'body-large' },
                { name: 'First Name', inputType: 'text' },
                { name: 'Last Name', inputType: 'text' },
                { name: 'Job Title', inputType: 'text', typographyRole: 'body-medium' },
                { name: 'Account', inputType: 'Record', ref_target: 'account', description: 'Associated Organization' },
                { name: 'Owner', inputType: 'Record', ref_target: 'user', description: 'Record Owner' }
            ]
        },
        {
            name: 'Segmentation',
            fields: [
                { name: 'Persona', inputType: 'select', options: ['Decision Maker', 'Influencer', 'End User', 'Champion', 'Gatekeeper'] },
                { name: 'Function', inputType: 'select', dimension: 'function', description: 'Job function/department' },
                { name: 'Seniority', inputType: 'select', dimension: 'seniority', dependsOn: ['Function'], description: 'Seniority level (filtered by function)' }
            ]
        },
        {
            name: 'Contact Info',
            fields: [
                { name: 'Phone', inputType: 'text' },
                { name: 'LinkedIn', inputType: 'url' }
            ]
        }
    ],
    account: [
        {
            name: 'Profile',
            fields: [
                { name: 'Website', inputType: 'url', required: true, description: 'Primary domain' },
                { name: 'Sector', inputType: 'select', dimension: 'sector', description: 'Industry sector' },
                { name: 'Industry', inputType: 'select', dimension: 'industry', dependsOn: ['Sector'], description: 'Specific industry (filtered by sector)' },
                { name: 'Company Size', inputType: 'select', dimension: 'company_size', description: 'Employee count range' },
                { name: 'Type', inputType: 'select', value: 'Prospect', options: ['Prospect', 'Customer', 'Partner', 'Vendor'] }
            ]
        },
        {
            name: 'Sales',
            fields: [
                 { name: 'Owner', inputType: 'Record', ref_target: 'user' },
                 { name: 'Status', inputType: 'select', options: ['Cold', 'Warm', 'Hot', 'Customer', 'Churned'] }
            ]
        }
    ],
    opportunity: [
        {
            name: 'Deal Info',
            fields: [
                { name: 'Amount', inputType: 'currency', required: true },
                { name: 'Close Date', inputType: 'date', required: true },
                { name: 'Stage', inputType: 'select', options: ['MQL', 'SQL', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] },
                { name: 'Probability', inputType: 'number', description: '%' }
            ]
        },
        {
            name: 'Relationships',
            fields: [
                { name: 'Account', inputType: 'Record', ref_target: 'account', required: true },
                { name: 'Primary Contact', inputType: 'Record', ref_target: 'contact' }
            ]
        }
    ],
    product: [
        {
            name: 'Basics',
            fields: [
                { name: 'Headline', inputType: 'text', maxChars: 60, typographyRole: 'display-large' },
                { name: 'Subheadline', inputType: 'text', maxChars: 120, typographyRole: 'title-large' },
                { name: 'Hero Image', inputType: 'image' },
            ]
        },
        {
            name: 'Pricing',
            fields: [
                { name: 'Price', inputType: 'currency', value: 0 },
                { name: 'Contract Duration', inputType: 'number', value: 12 },
                { name: 'Duration Type', inputType: 'select', value: 'Monthly', options: ['Annual', 'Monthly', 'Weekly', 'Daily', 'Per Unit'] },
                { name: 'Billing Frequency', inputType: 'select', value: 'Monthly', options: ['Annual', 'Monthly', 'Quarterly'] },
            ]
        },
        {
            name: 'Product Type',
            fields: [
                { name: 'Type', inputType: 'select', value: 'B2B', options: ['B2B', 'B2C', 'Partnership', 'Reseller', 'Investment'] },
            ]
        }
    ]
};
