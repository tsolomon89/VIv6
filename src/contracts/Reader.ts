import { UniversalRecordData, RecordStruct, FieldStruct, DataRecord } from '../core/types.js';
import { computeAllDerivations } from '../modules/ops/derivations.js';

// Matches src/ui/src/lib/api.ts
interface FrontendField {
    name: string;
    inputType: string;
    value?: any;
    options?: string[];
    required?: boolean;
}

interface FrontendFieldGroup {
    name: string;
    fields: FrontendField[];
}

interface FrontendEntityData {
    fieldGroups: FrontendFieldGroup[];
    [key: string]: any; // Allow other props
}

export class Reader {
    /**
     * Projects a UniversalRecordData (RecordStruct or legacy JSON) into a flat UI-consumable object.
     * Used by the Delivery API (Rendering).
     * 
     * @param data The UniversalRecordData to project
     * @returns A flat Record<string, any>
     */
    static project(data: UniversalRecordData): Record<string, any> {
        // 1. Handle Legacy JSON (or null/undefined)
        if (!data) return {};
        
        // If it doesn't look like a RecordStruct (missing idRecord), assume it's already flat
        if (!this.isRecordStruct(data)) {
            return data;
        }

        // 2. Handle RecordStruct
        const recordStruct = data as RecordStruct;
        const result: Record<string, any> = {};

        // Recurse through structure
        if (recordStruct.objectStruct && recordStruct.objectStruct.fieldGroupStructs) {
            for (const group of recordStruct.objectStruct.fieldGroupStructs) {
                if (group.fieldStructs) {
                    for (const field of group.fieldStructs) {
                        this.projectField(field, result);
                    }
                }
            }
        }

        return result;
    }

    /**
     * Transforms a RecordStruct into the Frontend EntityData format (FieldGroups).
     * Used by the Management API (Editing).
     */
    static toEntityData(data: UniversalRecordData): FrontendEntityData | any {
         // 1. Handle Legacy / Null
         if (!data) return { fieldGroups: [] };
 
         let fieldGroups: FrontendFieldGroup[] = [];
 
         // Case A: RecordStruct (Canonical Tier 0)
         if (this.isRecordStruct(data)) {
             const recordStruct = data as RecordStruct;
             if (recordStruct.objectStruct && recordStruct.objectStruct.fieldGroupStructs) {
                 for (const groupStruct of recordStruct.objectStruct.fieldGroupStructs) {
                     const fields: FrontendField[] = [];
                     if (groupStruct.fieldStructs) {
                         for (const fieldStruct of groupStruct.fieldStructs) {
                             // Extract Value
                             let value: any = null;
                             if (fieldStruct.propertyStructs && fieldStruct.propertyStructs.length > 0) {
                                  if (fieldStruct.isSelectMany) {
                                       value = fieldStruct.propertyStructs.map(p => this.extractValue(p)).filter(v => v !== null);
                                  } else {
                                       value = this.extractValue(fieldStruct.propertyStructs[0]);
                                  }
                             }
     
                             fields.push({
                                 name: fieldStruct.nameField,
                                 inputType: fieldStruct.inputType,
                                 value: value
                             });
                         }
                     }
                     fieldGroups.push({
                         name: groupStruct.nameFieldGroup,
                         fields: fields
                     });
                 }
             }
         } 
         // Case B: DataRecord (Implementation Tier 2 / SQL Row)
         else if ((data as any).data && Array.isArray((data as any).data.fieldGroups)) {
             // It's a DataRecord, so we just pass through the fieldGroups (already in FE format?)
             // Or we might need to map them? Usually they are stored as JSON matching FE format.
             fieldGroups = (data as any).data.fieldGroups;
         }
 
         // Inject Virtual Relationship Fields (Works for both)
         // For RecordStruct, links would be in a property? No, Invariant says they are PropertyStructs.
         // But for Hybrid, we check data.links if available.

         const linksSource = (data as any).data || data; // Handle if data is at root or nested
         this.injectRelationships(linksSource, fieldGroups);

         // Preserve legacy properties from the data object (e.g., opportunity_stage)
         // These are properties at the root level that aren't part of fieldGroups
         const legacyProps: Record<string, any> = {};
         const dataObj = (data as any).data || data;
         if (typeof dataObj === 'object' && dataObj !== null) {
             for (const key of Object.keys(dataObj)) {
                 if (key !== 'fieldGroups' && key !== 'links') {
                     legacyProps[key] = dataObj[key];
                 }
             }
         }

         return { fieldGroups, ...legacyProps };
    }

    private static isRecordStruct(data: any): data is RecordStruct {
        return typeof data === 'object' && data !== null && 'idRecord' in data && 'objectStruct' in data;
    }

    private static projectField(field: FieldStruct, result: Record<string, any>) {
        const key = field.nameField;
        
        if (!field.propertyStructs || field.propertyStructs.length === 0) {
            result[key] = null;
            return;
        }

        // Logic for extracting value based on Field Type or cardinality
        // For now, we take the primary value.
        // If isSelectMany is true, we might want to return an array of values.
        
        if (field.isSelectMany) {
            // Collect all values
            result[key] = field.propertyStructs.map(p => this.extractValue(p)).filter(v => v !== null);
        } else {
            // Single value (take first)
            result[key] = this.extractValue(field.propertyStructs[0]);
        }
    }

    private static extractValue(property: any): any {
        // property is PropertyStruct
        
        if (property.recordSnapshotStruct) {
            // It's a nested record (Recursion Level 2+)
            // Return data directly?
            return property.recordSnapshotStruct.data;
        }

        return property.valueProperty;
    }

    /**
     * Injects Relationships (stored in data.links) as FieldStructs.
     * This bridges the "Dual-Write" gap: SQL/JSON Links -> UI Field Representation.
     */
    private static injectRelationships(data: any, fieldGroups: FrontendFieldGroup[]) {
        const links = (data.links as Record<string, string[]>) || {};
        
        // Find or Create "Relations" Field Group
        // In Tier 1 Blueprint, this might be configured.
        // For now, we append a virtual group "Connections" if links exist.
        
        const relationFields: FrontendField[] = [];

        Object.entries(links).forEach(([relType, targetIds]) => {
             // We treat the Relationship Type as the Field Name (e.g., "Works At", "Has Item")
             // Value is the array of IDs (ref)
             
             if (Array.isArray(targetIds) && targetIds.length > 0) {
                 relationFields.push({
                     name: this.formatRelType(relType),
                     inputType: 'Record', // Canonical Type
                     value: targetIds, // Array of IDs
                     // In a real implementation, we'd fetch the snapshots here or let the UI fetch by ID
                 });
             }
        });

        if (relationFields.length > 0) {
            // Check if "Connections" group exists
            let group = fieldGroups.find(g => g.name === 'Connections');
            if (!group) {
                group = { name: 'Connections', fields: [] };
                fieldGroups.push(group);
            }
            group.fields.push(...relationFields);
        }
    }

    private static formatRelType(type: string): string {
        // snake_case -> Title Case
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    /**
     * Projects record data with computed derivation fields.
     * This extends the basic project() method to include Ops layer derivations.
     *
     * @param record The full DataRecord (needed for accountId and type)
     * @returns A flat Record<string, any> including computed fields
     */
    static projectWithDerivations(record: DataRecord): Record<string, any> {
        // Get base projection
        const projected = this.project(record.data);

        // Compute derivations for this record's entity type
        try {
            const derivedFields = computeAllDerivations(record.account_id, record);

            // Merge derived fields into projection
            // Derivations are prefixed to distinguish from base fields
            for (const [fieldName, value] of Object.entries(derivedFields)) {
                // Don't overwrite existing fields - derivations are additive
                if (!(fieldName in projected)) {
                    projected[fieldName] = value;
                }
                // Also store under a namespaced key for explicit access
                projected[`_derived.${fieldName}`] = value;
            }
        } catch (error) {
            // Derivation errors shouldn't break projection
            console.error('[Reader] Error computing derivations:', error);
        }

        return projected;
    }

    /**
     * Projects record data with computed metrics.
     * Metrics require relationship traversal so are more expensive.
     *
     * @param record The full DataRecord
     * @param includeMetrics Whether to compute metrics (default: false for performance)
     * @returns A flat Record<string, any> including computed fields
     */
    static projectFull(record: DataRecord, includeMetrics: boolean = false): Record<string, any> {
        const projected = this.projectWithDerivations(record);

        if (includeMetrics) {
            try {
                // Import dynamically to avoid circular dependency
                const { computeAllMetrics } = require('../modules/ops/metrics.js');
                const metricResults = computeAllMetrics(record.account_id, record);

                for (const [fieldName, result] of Object.entries(metricResults)) {
                    const metricResult = result as any;
                    if (metricResult.success) {
                        projected[fieldName] = metricResult.value;
                        projected[`_metric.${fieldName}`] = metricResult;
                    }
                }
            } catch (error) {
                console.error('[Reader] Error computing metrics:', error);
            }
        }

        return projected;
    }
}
