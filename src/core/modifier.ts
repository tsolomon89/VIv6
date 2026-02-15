import { DataRecordInput, FieldStruct, FieldGroupStruct } from './types.js';
import { findField } from './traversal.js';
import { randomUUID } from 'crypto';

/**
 * Updates or creates a field value in the record's recursive structure.
 * This is a high-level helper that abstracts the FieldGroup/FieldStruct complexity.
 */
export function setFieldValue(
    record: DataRecordInput, 
    fieldDefIdOrName: string, 
    value: any, 
    groupName: string = 'General'
) {
    if (!record.data) record.data = { fieldGroups: [] };
    if (!record.data.fieldGroups) record.data.fieldGroups = [];

    // 1. Try to find existing field by ID (preferred) or Name
    // We can't easily find by Name if we don't know the ID, unless we traverse.
    // traversal.findField searches by ID.
    // If we have a name, we might need to assume a convention or look up the definition (which is async).
    // For synchronous updates here, we assume if we pass a Name, we look for a field struct with that name (denormalized).
    
    let field: FieldStruct | undefined;
    
    // Simple traversal for find-by-name if needed, or use findField if ID
    for (const group of record.data.fieldGroups) {
        field = group.fieldStructs.find(f => f.idRefFieldRecord === fieldDefIdOrName || f.nameField === fieldDefIdOrName);
        if (field) break;
    }

    if (field) {
        // Update existing
        field.propertyStructs = [{
            valueProperty: value
        }];
        return;
    }

    // 2. Create New
    // We need to know the Field Definition ID. If we only have name, we are in trouble unless we look it up.
    // This function assumes fieldDefIdOrName IS the ID if we are creating, OR we are using loose mode.
    // For the migration/commercial engine, we might not have the ID handy synchronously.
    // We'll assume the caller passes the Def ID if creating.
    
    const newField: FieldStruct = {
        idRefFieldRecord: fieldDefIdOrName, 
        nameField: 'Unknown', // Caller should ideally provide this or we fetch it
        inputType: 'text', // Default, caller needs to refine
        displayPosition: 0,
        isSelectMany: false,
        isSystem: true,
        propertyStructs: [{
            valueProperty: value
        }]
    };

    // Find or Create Group
    let group = record.data.fieldGroups.find(g => g.nameFieldGroup === groupName);
    if (!group) {
        group = {
            idRefFieldGroupRecord: randomUUID(),
            nameFieldGroup: groupName,
            fieldStructs: []
        };
        record.data.fieldGroups.push(group);
    }
    
    group.fieldStructs.push(newField);
}

/**
 * Helper to specifically update Opportunity Stage (which is known to be in 'Commercial Details')
 */
export function setOpportunityStage(record: DataRecordInput, stage: string) {
    // We look for the field named "Opportunity Stage"
    const groupName = 'Commercial Details';
    const fieldName = 'Opportunity Stage';

    if (!record.data) record.data = { fieldGroups: [] };
    if (!record.data.fieldGroups) record.data.fieldGroups = [];

    // ALWAYS set the legacy property for backward compatibility
    (record.data as any).opportunity_stage = stage;

    // Also try to set the canonical fieldStruct if it exists
    const group = record.data.fieldGroups.find(g => g.nameFieldGroup === groupName);
    if (!group) return; // Group doesn't exist, but legacy prop is already set

    const field = group.fieldStructs?.find(f => f.nameField === fieldName);
    if (field) {
        field.propertyStructs = [{ valueProperty: stage }];
    }
}
