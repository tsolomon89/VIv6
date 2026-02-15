// Re-export from the new Content Module for backward compatibility
export {
  createRelationship,
  getRelationshipsFrom,
  getRelationshipsTo,
  getRelationship,
  listAllRelationships,
  deleteRelationship
} from '../modules/content/services.js';
