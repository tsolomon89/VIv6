import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { DataRecord, RecordStruct, ObjectStruct, FieldStruct, PropertyStruct, FieldGroupStruct, RecordRelationship, EntityType } from '../../core/types.js';
import { SYSTEM_ACCOUNT_ID } from '../../core/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Assuming this file is in src/modules/content/seeding.ts, data is in ../../../data/seeds
const DATA_ROOT = path.resolve(__dirname, '../../../data/seeds');

// --- ID REGISTRY ---
const SYSTEM_IDS: Record<string, string> = {
    // Objects
    'object_def': '00000000-0000-0000-0000-000000000001',
    'field_def': '00000000-0000-0000-0000-000000000002',
    'field_group': '00000000-0000-0000-0000-000000000003',
    'activity_def': '00000000-0000-0000-0000-000000000004',
    // Fields
    'system_name': '00000000-0000-0000-0000-000000000100',
    'system_slug': '00000000-0000-0000-0000-000000000101',
    'system_description': '00000000-0000-0000-0000-000000000102',
};

// --- TYPES ---
export interface SeedState {
    accounts: any[]; // Raw account objects
    records: DataRecord[]; // These contain the Inflated RecordStruct in their 'data' field
    relationships: RecordRelationship[];
    domains: any[]; // TBD Type
    dimensions: any[]; // DimensionStruct
    users: any[]; // System users to be inserted into users table
}

// --- HELPER ---
function readJson(filePath: string) {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// --- INFLATION LOGIC ---
// The inflateRecord function now supports two modes:
// 1. NEW: If input.data.fieldGroups exists, pass through directly (per seed_system.md spec)
// 2. LEGACY: If flat fields, use field-name mapping for backwards compatibility

// Field type mapping from seed format to FieldStruct inputType
function mapFieldType(seedType: string): string {
    const typeMap: Record<string, string> = {
        'text': 'text',
        'textarea': 'textarea',
        'number': 'number',
        'currency': 'currency',
        'date': 'date',
        'boolean': 'boolean',
        'email': 'text',      // Stored as text, validated as email
        'phone': 'text',      // Stored as text, validated as phone
        'url': 'url',
        'percentage': 'number',
        'select': 'select',
        'multiselect': 'multiselect',
        'dimension': 'select', // Dimension values become select options
        'ref': 'Record',       // References to other records
        'virtual': 'text'      // Virtual/computed fields stored as text
    };
    return typeMap[seedType] || 'text';
}

// MINIMAL SCHEMA_MAP - Only for irreducible core entities (contact, account)
// These are Tier-1 but need minimal hardcoded structure as they're foundational
// All other entities should define fieldGroups in their seed data
const SCHEMA_MAP: Record<string, any[]> = {
    contact: [
        {
            name: 'Identity',
            fields: ['Email', 'First Name', 'Last Name']
        }
    ],
    account: [
        {
            name: 'Profile',
            fields: ['Website', 'Industry']
        }
    ]
};

// Field Name Mapper (Snake -> Title)
const FIELD_NAME_MAP: Record<string, string> = {
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'job_title': 'Job Title',
    'account_id': 'Account', // Special handling
    'owner_id': 'Owner',
    'close_date': 'Close Date',
    'primary_contact_id': 'Primary Contact',
    'meta_title': 'Meta Title',
    'meta_description': 'Meta Description',
    'og_image': 'OG Image',
    'hero_image': 'Hero Image',
    'contract_duration': 'Contract Duration',
    'billing_frequency': 'Billing Frequency'
};

export function inflateRecord(input: any, accountId: string = SYSTEM_ACCOUNT_ID): RecordStruct {
    const typeSlug = input.type;
    const objectDefId = SYSTEM_IDS[typeSlug] || uuidv4();

    // --- NEW: Check for explicit fieldGroups structure (per seed_system.md spec) ---
    if (input.data?.fieldGroups && Array.isArray(input.data.fieldGroups)) {
        const fieldGroupStructs: FieldGroupStruct[] = input.data.fieldGroups.map((group: any) => ({
            idRefFieldGroupRecord: uuidv4(),
            nameFieldGroup: group.name,
            fieldStructs: (group.fields || []).map((field: any, fieldIdx: number) => ({
                idRefFieldRecord: uuidv4(),
                nameField: field.name,
                inputType: mapFieldType(field.type || 'text'),
                displayPosition: fieldIdx,
                isSelectMany: field.type === 'multiselect',
                isSystem: false,
                propertyStructs: [],
                // Preserve additional field metadata
                ...(field.required && { required: field.required }),
                ...(field.ref_target && { ref_target: field.ref_target }),
                ...(field.dimension && { dimension: field.dimension }),
                ...(field.options && { options: field.options }),
                ...(field.summary && { summary: field.summary })
            } as FieldStruct))
        }));

        return {
            idRecord: input.id || uuidv4(),
            account_id: accountId,
            objectStruct: {
                idRefObjectRecord: objectDefId,
                typeObject: typeSlug,
                fieldGroupStructs
            }
        };
    }

    // --- LEGACY: Flat field handling for backwards compatibility ---
    const schemaGroups = SCHEMA_MAP[typeSlug] || [];
    const fieldMap = new Map<string, FieldStruct>();

    // Map all flat keys to FieldStructs
    const inputData = input.data || {};
    const effectiveData = { ...inputData };

    // Fallback: If input.data is empty
    const systemKeys = ['id', 'account_id', 'type', 'slug', 'name', 'summary', 'description', 'created_at', 'updated_at', 'data'];
    if (Object.keys(inputData).length === 0) {
        for (const key of Object.keys(input)) {
            if (!systemKeys.includes(key)) {
                effectiveData[key] = input[key];
            }
        }
    }

    for (const [key, val] of Object.entries(effectiveData)) {
        if (key === 'dimension') continue;
        if (key === 'fieldGroups') continue; // Skip if already structured
        if (key === 'fields') continue; // Skip old flat fields array
        if (key === 'icon') continue; // Skip metadata
        if (key === 'is_system') continue; // Skip metadata

        // Map Key
        const titleKey = FIELD_NAME_MAP[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        const fieldDefId = SYSTEM_IDS[`field_${key}`] || uuidv4();
        const props: PropertyStruct[] = [];
        const isArray = Array.isArray(val);
        const valArr = isArray ? val as any[] : [val];
        valArr.forEach(v => props.push({ valueProperty: v as any }));

        // Detect Type
        let inputType: any = typeof val === 'number' ? 'number' : 'text';
        let refTarget: string | undefined;
        if (key.endsWith('_id') || key === 'Account' || key === 'Owner' || key === 'Primary Contact') {
            inputType = 'Record';
            if (key === 'Account' || key === 'account_id') refTarget = 'account';
            if (key === 'Owner' || key === 'owner_id') refTarget = 'user';
            if (key === 'Primary Contact' || key === 'primary_contact_id') refTarget = 'contact';
        }

        const struct: FieldStruct = {
            idRefFieldRecord: fieldDefId,
            nameField: titleKey,
            inputType: inputType,
            displayPosition: 0,
            isSelectMany: isArray,
            isSystem: false,
            propertyStructs: props
        };
        // Monkey-patch ref_target for transformer (not in official FieldStruct type yet)
        (struct as any).ref_target = refTarget;

        fieldMap.set(titleKey, struct);
    }

    // System Fields
    if (input.name && !fieldMap.has('Name')) {
        const nameStruct = {
            idRefFieldRecord: SYSTEM_IDS['system_name'],
            nameField: 'Name', inputType: 'text' as any, displayPosition: 0, isSelectMany: false, isSystem: true,
            propertyStructs: [{ valueProperty: input.name }]
        };
        fieldMap.set('Name', nameStruct);
    }

    // Construct Groups based on Schema
    const finalGroups: FieldGroupStruct[] = [];
    const usedFieldNames = new Set<string>();

    for (const schemaGroup of schemaGroups) {
        const groupFields: FieldStruct[] = [];
        for (const fieldName of schemaGroup.fields) {
            if (fieldMap.has(fieldName)) {
                groupFields.push(fieldMap.get(fieldName)!);
                usedFieldNames.add(fieldName);
            }
        }

        // Only add group if it has fields
        if (groupFields.length > 0) {
            finalGroups.push({
                idRefFieldGroupRecord: uuidv4(),
                nameFieldGroup: schemaGroup.name,
                fieldStructs: groupFields
            });
        }
    }

    // Collect Remaining Fields into 'General'
    const remainingFields: FieldStruct[] = [];
    for (const [name, struct] of fieldMap.entries()) {
        if (!usedFieldNames.has(name)) {
            remainingFields.push(struct);
        }
    }

    if (remainingFields.length > 0) {
        finalGroups.push({
            idRefFieldGroupRecord: SYSTEM_IDS['field_group'] || uuidv4(),
            nameFieldGroup: 'General',
            fieldStructs: remainingFields
        });
    }

    const objectStruct: ObjectStruct = {
        idRefObjectRecord: objectDefId,
        typeObject: input.type,
        fieldGroupStructs: finalGroups
    };

    return {
        idRecord: input.id || uuidv4(),
        account_id: accountId,
        objectStruct: objectStruct
    };
}

// --- LOADER ---
export function loadSeedState(): SeedState {
    const state: SeedState = {
        accounts: [],
        records: [],
        relationships: [],
        domains: [],
        dimensions: [],
        users: []
    };

    // 1. Tier 0: Core Accounts
    const accountsPath = path.join(DATA_ROOT, 'tier_0_core', 'accounts.json');
    const accounts = readJson(accountsPath);
    if (accounts && Array.isArray(accounts)) {
         state.accounts = accounts;
    }

    // 1.5. Tier 0: System Users
    const systemUsersPath = path.join(DATA_ROOT, 'tier_0_system', 'system_users.json');
    const systemUsers = readJson(systemUsersPath);
    if (systemUsers && Array.isArray(systemUsers)) {
        state.users = systemUsers;
    }

    // 2. Scan Directories
    const directories = [
        'tier_0_core',
        'tier_0_system',
        'tier_1_schema'
    ];

    function getJsonFiles(dir: string): string[] {
        let results: string[] = [];
        if (!fs.existsSync(dir)) return results;
        
        const list = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of list) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                results = results.concat(getJsonFiles(fullPath));
            } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'accounts.json' && entry.name !== 'system_users.json') {
                results.push(fullPath);
            }
        }
        return results;
    }

    for (const dirName of directories) {
        const rootPath = path.join(DATA_ROOT, dirName);
        const files = getJsonFiles(rootPath);

        for (const filePath of files) {
            const content = readJson(filePath);
            if (!content) continue;
            
            const list = Array.isArray(content) ? content : [content];

            for (const item of list) {
                try {
                    if (item.type === 'dimension_value') {
                        state.dimensions.push(item);
                        continue;
                    }

                    const inflated = inflateRecord(item);
                    
                    // Pass through canonical format directly - no deflation needed
                    // inflateRecord() produces fieldGroupStructs with canonical property names
                    const record: DataRecord = {
                        id: item.id || inflated.idRecord,
                        account_id: item.account_id || SYSTEM_ACCOUNT_ID,
                        type: item.type,
                        slug: item.slug,
                        name: item.name || item.slug,
                        summary: item.summary || '',
                        description: item.description || '',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        data: {
                             fieldGroups: inflated.objectStruct?.fieldGroupStructs || []
                        }
                    };

                    state.records.push(record);
                } catch (e) {
                    console.warn(`Failed to inflate ${item.slug}:`, e);
                }
            }
        }
    }

    // 3. Tenants (Tier 2)
    const tenantsDir = path.join(DATA_ROOT, 'tenants');
    if (fs.existsSync(tenantsDir)) {
        const tFiles = fs.readdirSync(tenantsDir).filter(f => f.endsWith('.json'));
        for (const file of tFiles) {
            const tenant = readJson(path.join(tenantsDir, file));
            if (!tenant) continue;
            
            // Domain
            if (tenant.domain) {
                state.domains.push({
                    account_id: tenant.account_id,
                    hostname: tenant.domain,
                    type: 'www',
                    is_primary: true
                });
            }

            // Synthesize Account if missing
            if (tenant.account_id && tenant.tenant_slug) {
                // Check if already exists in state.accounts (e.g. from accounts.json)
                const exists = state.accounts.find(a => a.id === tenant.account_id);
                if (!exists) {
                    state.accounts.push({
                        id: tenant.account_id,
                        slug: tenant.tenant_slug,
                        name: tenant.owner?.name ? `${tenant.owner.name}'s Account` : tenant.tenant_slug, // Fallback name
                        account_class: 'business', // Default
                        type: 'client', // Default
                        data: {
                            subscription: tenant.subscription || {},
                            owner: tenant.owner || {}
                        },
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                }
            }

            // Initial Records
            if (tenant.initial_records && Array.isArray(tenant.initial_records)) {
                for (const rec of tenant.initial_records) {
                     const inflated = inflateRecord(rec, tenant.account_id);
                     state.records.push({
                        id: rec.id || inflated.idRecord,
                        account_id: tenant.account_id,
                        type: rec.type,
                        slug: rec.slug,
                        name: rec.name || rec.slug,
                        summary: rec.summary || '',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        data: inflated as any
                     });
                }
            }
        }
    }

    // 4. Unify All Accounts into Records (Core + Tenants)
    // We do this last to catch any accounts added by Tenants step
    if (state.accounts.length > 0) {
         state.accounts.forEach(acc => {
             // Check if already in records (avoid dupes if we pushed earlier?)
             // We haven't pushed earlier anymore.
             // But check if slug exists in records just in case.
             if (state.records.find(r => r.id === acc.id)) return;

             try {
                const input = {
                    ...acc,
                    type: 'account'
                };
                
                const inflated = inflateRecord(input, acc.id);

                // Pass through canonical format directly
                state.records.push({
                    id: acc.id,
                    account_id: SYSTEM_ACCOUNT_ID,
                    type: 'account',
                    slug: acc.slug || acc.tenant_slug || 'unknown_account',
                    name: acc.name,
                    summary: '',
                    description: '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    data: { fieldGroups: inflated.objectStruct?.fieldGroupStructs || [] }
                });

             } catch (e) {
                 console.warn(`Failed to inflate account ${acc.slug}`, e);
             }
         });
    }

    return state;
}
