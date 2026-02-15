import { initDb, db } from '../src/core/db.js';
import { createRecord, updateRecord, getRecord } from '../src/modules/content/services.js';
import { DataRecordInput, FieldStruct, FieldGroupStruct } from '../src/core/types.js';
import { randomUUID } from 'crypto';

// Initialize DB
initDb();

async function migrate() {
    console.log('Starting Migration to Recursive Record Model...');

    // 1. Ensure Tier 1 Definitions exist
    // Field: Opportunity Stage
    let stageFieldId = await ensureField('Opportunity Stage', 'select', ['mql', 'sql', 'ftp', 'rtp']);
    
    // Field: Owner Account (Reference)
    let accountFieldId = await ensureField('Owner Account', 'Record'); // InputType=Record for relation

    // 2. Iterate Opportunities
    const opportunities = db.prepare("SELECT * FROM records WHERE type = 'opportunity'").all() as any[];
    
    console.log(`Found ${opportunities.length} opportunities to migrate.`);

    for (const row of opportunities) {
        const record = { ...row, data: JSON.parse(row.data) };
        const data = record.data || {};
        
        // 2a. Migrate Stage
        if (data.opportunity_stage) {
            console.log(`Migrating stage for ${record.id}: ${data.opportunity_stage}`);
            
            // Create Field Placement
            const fieldStruct: FieldStruct = {
                idRefFieldRecord: stageFieldId,
                nameField: 'Opportunity Stage',
                inputType: 'select',
                displayPosition: 0,
                isSelectMany: false,
                isSystem: true,
                propertyStructs: [{
                    valueProperty: data.opportunity_stage
                }]
            };
            
            // Add to a FieldGroup
            addToFieldGroup(record, 'Commercial Details', fieldStruct);
        }

        // 2b. Migrate Account ID (if strictly mapping to field)
        if (record.account_id) {
             const fieldStruct: FieldStruct = {
                idRefFieldRecord: accountFieldId,
                nameField: 'Owner Account',
                inputType: 'Record',
                displayPosition: 1,
                isSelectMany: false,
                isSystem: true,
                propertyStructs: [{
                    valueProperty: record.account_id,
                    recordSnapshotStruct: {
                        idRefRecord: record.account_id, // Authoritative ID
                        data: {}, // Snapshot data (empty for now)
                        created_at: new Date().toISOString()
                    }
                }]
            };
            addToFieldGroup(record, 'System Details', fieldStruct);
        }

        // Save
        await updateRecord(record.id, {
            data: record.data
        });
    }

    console.log('Migration Complete.');
}

// --- Helpers ---

const FIELD_CACHE: Record<string, string> = {};

async function ensureField(name: string, inputType: string, options: string[] = []): Promise<string> {
    if (FIELD_CACHE[name]) return FIELD_CACHE[name];

    // Check DB
    const existing = db.prepare("SELECT id FROM records WHERE type = 'field_def' AND name = ?").get(name) as any;
    if (existing) {
        FIELD_CACHE[name] = existing.id;
        return existing.id;
    }

    // Create
    const input: DataRecordInput = {
        type: 'field_def', // Tier 1
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, '_'),
        account_id: 'system', // Shared/System field
        data: {
            inputType,
            options,
            fieldGroups: []
        }
    };
    
    const created = await createRecord(input);
    console.log(`Created Field Definition: ${name} (${created.id})`);
    FIELD_CACHE[name] = created.id;
    return created.id;
}

function addToFieldGroup(record: any, groupName: string, field: FieldStruct) {
    if (!record.data.fieldGroups) record.data.fieldGroups = [];
    
    let group = record.data.fieldGroups.find((g: FieldGroupStruct) => g.nameFieldGroup === groupName);
    if (!group) {
        group = {
            idRefFieldGroupRecord: randomUUID(), // Technically should reference a FieldGroup definition, but for ad-hoc we gen ID
            nameFieldGroup: groupName,
            fieldStructs: []
        };
        record.data.fieldGroups.push(group);
    }
    
    // Check if field already exists in group
    const existingIdx = group.fieldStructs.findIndex((f: FieldStruct) => f.idRefFieldRecord === field.idRefFieldRecord);
    if (existingIdx >= 0) {
        group.fieldStructs[existingIdx] = field; // Update
    } else {
        group.fieldStructs.push(field);
    }
}

migrate().catch(console.error);
