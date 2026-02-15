/**
 * Auth Module - ODAC (Opportunity-Driven Access Control)
 *
 * Identity and access are derived from active business relationships (Opportunities),
 * not static membership tables.
 *
 * Key concept:
 * - Products (type: HUM) represent Job Titles with capabilities
 * - Opportunities represent Employment Contracts
 * - Access granted when Opportunity stage = 'ftp' (WON)
 * - Permissions come from Product.capabilities field
 */

export * from './password.js';
export * from './session.js';
export * from './odac.js';
export * from './middleware.js';
