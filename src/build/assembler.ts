import { DataRecord } from '../core/types.js';
import { getRecord, listRecords } from '../core/records.js';
import { getRelationshipsFrom } from '../core/relationships.js';
import { Reader } from '../contracts/Reader.js';

export interface PageContext {
  record: DataRecord;
  data: Record<string, any>; // Flattened data
  related: Record<string, any[]>; // Grouped relationships
  meta: {
    title: string;
    description: string;
  };
}

export function assemblePageContext(record: DataRecord): PageContext {
  const flatData = Reader.project(record.data);
  
  // Fetch relationships
  const relationships = getRelationshipsFrom(record.id);
  const related: Record<string, any[]> = {};

  // Group related OBJECT_TYPES_LIST by relationship type
  for (const rel of relationships) {
    if (!related[rel.relationship_type]) {
      related[rel.relationship_type] = [];
    }
    
    // Resolve the target record
    // OPTIMIZATION: In a real build, we'd batch these or cache them
    const target = getRecord(rel.to_record_id);
    if (target) {
      related[rel.relationship_type].push({
        ...target,
        data: Reader.project(target.data)
      });
    }
  }

  return {
    record,
    data: flatData,
    related,
    meta: {
      title: flatData['Meta Title'] || record.name,
      description: flatData['Meta Description'] || record.description || `Learn more about ${record.name}`
    }
  };
}
