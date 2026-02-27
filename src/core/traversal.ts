import { DataRecordInput, FieldStruct, RecordStruct, RecordData } from './types.js';

// --- Types ---
type Visitor = (node: any, metadata: { type: 'record' | 'group' | 'field' | 'value', path: string[] }) => void;

// --- Traversal Logic ---

/**
 * Canonical Traversal: Record -> Object -> FieldGroups -> Fields -> Values
 */
export function traverseRecord(record: RecordStruct | DataRecordInput, visitor: Visitor) {
    if (!record) return;

    // 1. Visit Record
    visitor(record, { type: 'record', path: ['record'] });

    // Adapt DataRecord -> RecordStruct shape if needed
    // logic to extract fieldGroups from record.data or record.objectStruct
    const fieldGroups = (record as any).objectStruct?.fieldGroupStructs || (record as any).data?.fieldGroups || [];

    // 2. Visit Groups
    fieldGroups.forEach((group: any, gIdx: number) => {
        visitor(group, { type: 'group', path: ['record', `group_${gIdx}`] });

        // 3. Visit Fields
        const fields = group.fieldStructs || [];
        fields.forEach((field: FieldStruct, fIdx: number) => {
            visitor(field, { type: 'field', path: ['record', `group_${gIdx}`, `field_${fIdx}`] });

            // 4. Visit Values
            const values = field.propertyStructs || [];
            values.forEach((value: any, vIdx: number) => {
                visitor(value, { type: 'value', path: ['record', `group_${gIdx}`, `field_${fIdx}`, `value_${vIdx}`] });
                
                // Recursion: If value has a snapshot, traverse it?
                if (value.recordSnapshotStruct) {
                    // Decide if we traverse snapshots. Usually yes, but watch for cycles.
                    // For now, we just visit the node.
                }
            });
        });
    });
}

/**
 * Helper to find a specific field definition within a record
 */
export function findField(record: RecordStruct | DataRecordInput, fieldRefId: string): FieldStruct | undefined {
    let internalResult: FieldStruct | undefined;
    
    traverseRecord(record, (node, meta) => {
        if (meta.type === 'field' && node.idRefFieldRecord === fieldRefId) {
            internalResult = node as FieldStruct;
        }
    });

    return internalResult;
}

/**
 * Helper to get values for a specific field
 */
export function getFieldValues(record: RecordStruct | DataRecordInput, fieldRefId: string): any[] {
    const field = findField(record, fieldRefId);
    if (!field || !field.propertyStructs) return [];
    
    return field.propertyStructs.map(p => {
        if (field.inputType === 'Record' || field.inputType === 'ref') {
             // Return ID or Snapshot?
             // Return the PropertyStruct itself or the value?
             // Usually we want the raw values
             return p.recordSnapshotStruct?.idRefRecord || p.valueProperty;
        }
        return p.valueProperty;
    });
}

