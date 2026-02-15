
import { 
    LayoutDashboard, 
    Contact, 
    Building2, 
    Activity, 
    DollarSign, 
    Package, 
    Megaphone, 
    GitMerge,
    Workflow,
    Database,

    Phone,
    Mail,
    Share2,
    Calendar,
    Search,
    Monitor,
    AlertTriangle,
    Facebook,
    Linkedin,
    Twitter,
    Globe,
    Layers,
    type LucideIcon
} from 'lucide-react';

export const WORKSPACE_NAV_ITEMS = {
    '': [
        { route: '/dashboard', icon: LayoutDashboard, name: 'Dashboard' },
    ],
    'CRM': [
        { route: '/records/contact', icon: Contact, name: 'Contacts' },
        { route: '/records/account', icon: Building2, name: 'Accounts' },
        { route: '/records/opportunity', icon: DollarSign, name: 'Opportunities' },
        { route: '/records/product', icon: Package, name: 'Products' },
        { route: '/records/activity', icon: Activity, name: 'Activities' },
    ],
    'CREATIVE': [
        { route: '/records/asset', icon: Share2, name: 'Assets' },
        { route: '/records/page', icon: Monitor, name: 'Pages' },
    ],
    'GROWTH': [
        { route: '/records/campaign', icon: Megaphone, name: 'Campaigns' },
        { route: '/records/pipeline', icon: GitMerge, name: 'Pipelines' }, 
        { route: '/records/workflow', icon: Workflow, name: 'Workflows' },
    ],
};

export const BUILDER_NAV_ITEMS = {
    '': [
         // Placeholder for Builder Dashboard
    ],
    'ONTOLOGY': [
        { route: '/records/object_def', icon: Database, name: 'Objects / Schemas' },
        { route: '/records/field_def', icon: Database, name: 'Fields' },
        { route: '/records/dimension_def', icon: Layers, name: 'Taxonomies' },
    ],
    'SYSTEM': [
        { route: '/records/role', icon: AlertTriangle, name: 'Roles & Permissions' },
        { route: '/records/user', icon: Contact, name: 'Users' },
    ]
};

// Deprecated: kept temporarily if needed to avoid breaking imports immediately, but verified usage usually comes from Sidebar.
// Actually, we should remove it to force errors if we missed any usage.
// export const STUDIO_NAV_ITEMS = ... 


export const RECORD_COLUMNS: Record<string, Record<string, { name: string, size: number }>> = {
    'campaign': {
        'name': { name: 'Name', size: 0 },
        'performanceMetrics': { name: 'Performance', size: 0 }
    },
    'pipeline': {
        'actualDeals': { name: 'Actual Deals', size: 0 },
        'dealCapacity': { name: 'Capacity', size: 0 }
    },

    'asset': {
        'name': { name: 'Name', size: 0 },
        'type': { name: 'Type', size: 0 },
        'status': { name: 'Status', size: 0 }
    },
    'content': {
        'title': { name: 'Title', size: 0 },
        'slug': { name: 'Slug', size: 0 },
        'status': { name: 'Status', size: 0 },
        'updated_at': { name: 'Last Updated', size: 0 }
    },
    'contact': {
        'avatar': { name: '', size: 60 },
        'first_name': { name: 'First Name', size: 0 },
        'last_name': { name: 'Last Name', size: 0 },
        'job_title': { name: 'Job Title', size: 0 },
        'email': { name: 'Email', size: 0 },
        'account': { name: 'Account', size: 0 },
        'persona': { name: 'Persona', size: 0 }
    },
    'account': {
        'name': { name: 'Account Name', size: 0 },
        'industry': { name: 'Industry', size: 0 },
        'size': { name: 'Size', size: 0 },
        'revenue': { name: 'Revenue', size: 0 },
        'website': { name: 'Website', size: 0 },
        'primary_contact': { name: 'Primary Contact', size: 0 }
    },
    'activity': {
        'subject': { name: 'Subject', size: 0 },
        'type': { name: 'Type', size: 0 },
        'status': { name: 'Status', size: 0 },
        'quadrance': { name: 'Quadrance', size: 0 }
    },
    'product': {
        'name': { name: 'Product Name', size: 0 },
        'pipeline': { name: 'Pipeline', size: 0 },
        'price': { name: 'Price', size: 0 },
        'contract_duration': { name: 'Duration', size: 0 }
    },
    'opportunity': {
        'name': { name: 'Name', size: 0 },
        'amount': { name: 'Amount', size: 0 },
        'stage': { name: 'Stage', size: 0 },
        'probability': { name: 'Prob', size: 0 },
        'close_date': { name: 'Close Date', size: 0 },
        'account': { name: 'Account', size: 0 }
    },
    'subscription': {
        'Product': { name: 'Product', size: 0 },
        'Tenant': { name: 'Tenant', size: 0 },
        'Status': { name: 'Status', size: 0 }
    },
    'user': {
        'Email': { name: 'Email', size: 0 },
        'Role': { name: 'Role', size: 0 }
    },
    'role': {
        'name': { name: 'Role Name', size: 0 },
        'Level': { name: 'Level', size: 0 },
        'Permissions': { name: 'Permissions', size: 0 }
    },
    'tenant': {
        'Plan': { name: 'Plan', size: 0 },
        'Account Ref': { name: 'Account', size: 0 }
    },
    'object_def': {
        'name': { name: 'Name', size: 0 },
        'slug': { name: 'Slug', size: 0 },
        'summary': { name: 'Summary', size: 0 }
    },
    'field_def': {
        'name': { name: 'Name', size: 0 },
        'type': { name: 'Type', size: 0 },
        'object_def': { name: 'Object', size: 0 },
        'ref_target': { name: 'Target Schema', size: 0 }
    }
};

export const RECORD_FIELD_MAPPINGS = {
    'contact': {
        'title': ['first_name', 'last_name'],
        'subtitle': 'job_title',
        'body': ['account', 'email', 'phone'],
        'image': 'avatar',
        'health': 'health',
        'contact': {'phone': 'icon', 'email': 'icon'},
        'social': {
            'linkedin_url': 'linkedin',
            'website': 'website'
        }
    },
    'asset': {
        'title': ['name'],
        'subtitle': 'type',
        'body': ['status']
    },
    'content': {
        'title': ['title'],
        'subtitle': 'slug',
        'body': ['status', 'updated_at']
    },

    'user': {
        'title': ['department', 'experience', 'stage'],
        'subtitle': 'fullName',
        'image': 'profilePicture',
    },
    'opportunity': {
        'title': ['amount', 'stage'],
        'subtitle': 'name',
        'body': ['account', 'close_date'], 
    },
    'activity': {
        'title': ['type', 'actual_duration_seconds'], 
        'subtitle': 'subject', 
        'body': ['description'],
    },
    'account': {
        'title': ['industry', 'size'], 
        'subtitle': 'name', 
        'body': ['website', 'revenue'],
    },
    'product': {
        'title': ['price', 'pricing_frequency'],
        'subtitle': 'name',
        'body': ['pipeline']
    },
    'subscription': {
        'title': ['Status'],
        'subtitle': 'name', // Fallback, usually auto-generated
        'body': ['Product', 'Tenant']
    },
};

export const RECORD_ICON_MAPPING: Record<string, { icon: LucideIcon, color: string }> = {
    'linkedin': { icon: Linkedin, color: '#2086bd' },
    'facebook': { icon: Facebook, color: '#1877f2' },
    'twitter': { icon: Twitter, color: '#2daae1' },
    'website': { icon: Globe, color: '#34ca87' },
    'email': { icon: Mail, color: '#9c5ff4' },
    'phone': { icon: Phone, color: '#fdb653' },
    'call': { icon: Phone, color: '#fdb653' },
    'social': { icon: Share2, color: '#f479af' },
    'event': { icon: Calendar, color: '#f8bd08' },
    'search': { icon: Search, color: '#f93682' },
    'display': { icon: Monitor, color: '#4c6dda' },
    'admin': { icon: AlertTriangle, color: '#ff3939' },
    'object_def': { icon: Database, color: '#6366f1' },
    'field_def': { icon: Database, color: '#818cf8' },
    'role': { icon: AlertTriangle, color: '#f59e0b' }
};

export interface RecordChartConfig {
    type: 'donut' | 'bar' | 'area';
    dataKey: string;
    categoryKey: string;
    valueKey: string;
    colors?: string[];
}

export interface RecordProjectionConfig {
    currentKey: string;
    targetKey: string;
    label: string;
}

export interface RecordTileConfig {
    leading: 'image' | 'icon' | 'progress' | 'none';
    title: string[]; 
    subtitle?: string;
    body?: string[]; 
    health?: string; 
    action?: 'expand' | 'link';
    type?: 'text' | 'chart' | 'projection';
    chart?: RecordChartConfig;
    projection?: RecordProjectionConfig;
}

export interface RecordRelationConfig {
    targetType: string; 
    foreignKey: string; 
    sortBy?: 'persona_power' | 'created_at';
    tile: RecordTileConfig;
}

export interface RecordCardConfig {
    id: string;
    type: 'dynamic' | 'campaigns' | 'pipelines' | 'relation' | 'algo3';
    title: string;
    tiles?: RecordTileConfig[]; 
    relation?: RecordRelationConfig;
    isExpandable?: boolean;
}

export const RECORD_DETAIL_CONFIG: Record<string, RecordCardConfig[]> = {
    'contact': [
        {
            id: 'info',
            type: 'dynamic',
            title: 'Contact Information',
            isExpandable: true,
            tiles: [
                { leading: 'none', title: ['email'], subtitle: 'Email', type: 'text' },
                { leading: 'none', title: ['phone'], subtitle: 'Phone', type: 'text' },
                { leading: 'icon', title: ['account'], subtitle: 'Account', type: 'text' },
                { leading: 'icon', title: ['persona'], subtitle: 'Persona', type: 'text' }
            ]
        }
    ],

    'opportunity': [
        {
            id: 'info',
            type: 'dynamic',
            title: 'Opportunity Details',
            isExpandable: true,
            tiles: [
                { leading: 'none', title: ['amount'], subtitle: 'Amount', type: 'text' },
                { leading: 'none', title: ['close_date'], subtitle: 'Close Date', type: 'text' },
                { leading: 'icon', title: ['account'], subtitle: 'Account', type: 'text' },
                { leading: 'icon', title: ['primary_contact'], subtitle: 'Primary Contact', type: 'text' }
            ]
        },
        {
            id: 'stage_tracking',
            type: 'dynamic',
            title: 'Stage Progression',
            isExpandable: true,
            tiles: [
                { leading: 'progress', title: ['stage'], subtitle: 'Current Stage', type: 'text' } 
            ]
        }
    ],
    'activity': [
        {
            id: 'details',
            type: 'dynamic',
            title: 'Activity Metadata',
            isExpandable: true,
            tiles: [
                { leading: 'none', title: ['type'], subtitle: 'Activity Type', type: 'text' },
                { leading: 'none', title: ['actual_duration_seconds'], subtitle: 'Duration (sec)', type: 'text' },
                { leading: 'none', title: ['quadrance'], subtitle: 'Quadrance', type: 'text' }
            ]
        }
    ],
    'account': [
        {
            id: 'overview',
            type: 'dynamic',
            title: 'Account Overview',
            isExpandable: true,
            tiles: [
                { leading: 'none', title: ['industry'], subtitle: 'Industry', type: 'text' },
                { leading: 'none', title: ['website'], subtitle: 'Website', type: 'text' },
                { leading: 'none', title: ['revenue'], subtitle: 'Revenue', type: 'text' }
            ]
        },
        {
            id: 'contacts',
            type: 'relation',
            title: 'Key Stakeholders',
            isExpandable: true,
            relation: {
                targetType: 'contact',
                foreignKey: 'account',
                sortBy: 'persona_power', // Critical for Kinetic Routing
                tile: { leading: 'icon', title: ['first_name', 'last_name'], subtitle: 'job_title', body: ['persona'] }
            }
        },
        {
            id: 'opportunities',
            type: 'relation',
            title: 'Active Opportunities',
            isExpandable: true,
            relation: {
                targetType: 'opportunity',
                foreignKey: 'account',
                tile: { leading: 'icon', title: ['name'], subtitle: 'stage', body: ['amount'] }
            }
        }
    ],
    'campaign': [
        {
            id: 'performance',
            type: 'dynamic',
            title: 'Campaign Performance',
            isExpandable: true,
            tiles: [
                {
                    leading: 'none',
                    title: [],
                    type: 'chart',
                    chart: {
                        type: 'donut',
                        dataKey: 'performanceMetrics', 
                        categoryKey: 'label',
                        valueKey: 'value',
                        colors: ['#8b5cf6', '#ef4444', '#f59e0b']
                    }
                }
            ]
        }
    ],
    'pipeline': [
         {
            id: 'goals',
            type: 'dynamic',
            title: 'Physics Projection (Actual vs Capacity)',
            isExpandable: true,
            tiles: [
                {
                    leading: 'none',
                    title: [],
                    type: 'projection',
                    projection: {
                        label: 'Weekly Deal Capacity (c)',
                        currentKey: 'actualDeals', 
                        targetKey: 'dealCapacity' 
                    }
                }
            ]
        }
    ],

    'assetGroup': [
        {
            id: 'generator',
            type: 'algo3',
            title: 'Asset Generator',
            isExpandable: true
        },
        {
            id: 'assets',
            type: 'relation',
            title: 'Generated Assets',
            isExpandable: true,
            relation: {
                targetType: 'asset',
                foreignKey: 'Group',
                tile: { leading: 'icon', title: ['name'], subtitle: 'Type', body: ['status'] }
            }
        }
    ],
    'subscription': [
        {
            id: 'details',
            type: 'dynamic',
            title: 'Subscription Details',
            isExpandable: true,
            tiles: [
                { leading: 'none', title: ['Status'], subtitle: 'Status', type: 'text' },
                { leading: 'icon', title: ['Product'], subtitle: 'Product', type: 'text' },
                { leading: 'icon', title: ['Tenant'], subtitle: 'Tenant', type: 'text' }
            ]
        }
    ],
    'content': [
        {
            id: 'info',
            type: 'dynamic',
            title: 'Content Details',
            isExpandable: true,
            tiles: [
                { leading: 'none', title: ['title'], subtitle: 'Title', type: 'text' },
                { leading: 'none', title: ['slug'], subtitle: 'Slug', type: 'text' },
                { leading: 'none', title: ['status'], subtitle: 'Status', type: 'text' },
                { leading: 'none', title: ['meta_title'], subtitle: 'SEO Title', type: 'text' }
            ]
        }
    ],
    'object_def': [
        {
            id: 'info',
            type: 'dynamic',
            title: 'Object Definition',
            isExpandable: true,
            tiles: [
                { leading: 'none', title: ['name'], subtitle: 'Name', type: 'text' },
                { leading: 'none', title: ['slug'], subtitle: 'Slug', type: 'text' },
                { leading: 'none', title: ['summary'], subtitle: 'Summary', type: 'text' }
            ]
        }
    ],
    'field_def': [
        {
            id: 'info',
            type: 'dynamic',
            title: 'Field Definition',
            isExpandable: true,
            tiles: [
                { leading: 'none', title: ['name'], subtitle: 'Name', type: 'text' },
                { leading: 'none', title: ['type'], subtitle: 'Input Type', type: 'text' },
                { leading: 'none', title: ['ref_target'], subtitle: 'Target Schema (Refs Only)', type: 'text' }
            ]
        }
    ],
    'user': [
        {
            id: 'info',
            type: 'dynamic',
            title: 'User Profile',
            isExpandable: true,
            tiles: [
                { leading: 'none', title: ['first_name', 'last_name'], subtitle: 'Full Name', type: 'text' },
                { leading: 'none', title: ['email'], subtitle: 'Email', type: 'text' },
                { leading: 'none', title: ['capacity_minutes'], subtitle: 'Daily Capacity (min)', type: 'text' },
                { leading: 'none', title: ['hourly_rate'], subtitle: 'Hourly Rate', type: 'text' },
                { leading: 'icon', title: ['role'], subtitle: 'Assigned Role', type: 'text' }
            ]
        }
    ],
    'role': [
        {
            id: 'info',
            type: 'dynamic',
            title: 'Role Definition',
            isExpandable: true,
            tiles: [
                { leading: 'none', title: ['name'], subtitle: 'Role Name', type: 'text' },
                { leading: 'none', title: ['permissions'], subtitle: 'Permissions', type: 'text' }
            ]
        }
    ]
};

/**
 * Generate card configuration dynamically from object_def.data.fieldGroups
 * This enables the UI to render forms based on schema data (Tier-1)
 * rather than hardcoded configuration (anti-hardcoding rule)
 *
 * @param objectDef - The object definition with data.fieldGroups
 * @param recordType - The record type slug (e.g., 'contact', 'opportunity')
 * @returns Array of RecordCardConfig for rendering
 */
export function getConfigFromSchema(
    objectDef: { data?: { fieldGroups?: any[] } } | null,
    recordType: string
): RecordCardConfig[] {
    // Irreducible entities: Use hardcoded config if available
    // These are Tier-1 but need minimal structure as they're foundational
    const irreducibleTypes = ['contact', 'account', 'opportunity', 'campaign', 'pipeline', 'activity'];

    if (irreducibleTypes.includes(recordType) && RECORD_DETAIL_CONFIG[recordType]) {
        return RECORD_DETAIL_CONFIG[recordType];
    }

    // Check if objectDef has fieldGroups
    const fieldGroups = objectDef?.data?.fieldGroups;

    if (!fieldGroups || !Array.isArray(fieldGroups) || fieldGroups.length === 0) {
        // Fall back to hardcoded config if exists
        return RECORD_DETAIL_CONFIG[recordType] || [];
    }

    // Generate config from fieldGroups (per seed_system.md spec)
    return fieldGroups.map((group: any, index: number) => {
        const groupId = group.name?.toLowerCase().replace(/\s+/g, '-') || `group-${index}`;
        const fields = group.fields || [];

        // Generate tiles from fields
        // Use the original field name for value lookup (getRecordValue matches by name)
        const tiles: RecordTileConfig[] = fields.map((field: any) => {
            const fieldName = field.name || 'unknown';

            // Determine leading type based on field type
            let leading: 'image' | 'icon' | 'progress' | 'none' = 'none';
            if (field.type === 'ref' || field.ref_target) {
                leading = 'icon';
            } else if (field.type === 'image') {
                leading = 'image';
            }

            return {
                leading,
                title: [fieldName],  // Use original name for getRecordValue lookup
                subtitle: fieldName,
                type: 'text' as const
            };
        });

        return {
            id: groupId,
            type: 'dynamic' as const,
            title: group.name || 'General',
            isExpandable: true,
            tiles
        };
    });
}

/**
 * Map field type from schema to tile display type
 */
export function mapFieldTypeToTileType(fieldType: string): 'text' | 'chart' | 'projection' {
    // Most fields render as text
    // Special cases for virtual/computed fields can be expanded later
    if (fieldType === 'virtual') {
        return 'text'; // Could be 'chart' or 'projection' based on additional metadata
    }
    return 'text';
}
