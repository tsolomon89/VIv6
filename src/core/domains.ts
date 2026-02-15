// Re-export from the new Delivery Module for backward compatibility
export {
  createDomain,
  getDomain,
  getDomainByHostname,
  listDomains,
  getPrimaryDomain,
  updateDomain,
  deleteDomain,
} from '../modules/delivery/domains.js';
export type { Domain, DomainType, DomainInput, DomainStatus } from '../modules/delivery/domains.js';
