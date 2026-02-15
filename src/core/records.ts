// Re-export from the new Content Module for backward compatibility
// Renamed from entities.ts to records.ts

export {
  createRecord,
  getRecord,
  getRecordBySlug,
  updateRecord,
  deleteRecord,
  listRecords,
  createRelationship,
  getRelationshipsFrom,
  getRelationshipsTo,
  getRelationship,
  listAllRelationships,
  deleteRelationship
} from '../modules/content/services.js';
