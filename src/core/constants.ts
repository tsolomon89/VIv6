/**
 * System Constants - Tier 0 Hardcoded Values
 *
 * These are intentionally hardcoded as they define the root of the system.
 * See: agent_context/active/bootstrap/tier_0_hardcoded.md
 */

/** The Oblio root tenant/system account UUID */
export const SYSTEM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';

/** Alias for backwards compatibility with existing code */
export const OBLIO_ACCOUNT_ID = SYSTEM_ACCOUNT_ID;
export const DEFAULT_ACCOUNT_ID = SYSTEM_ACCOUNT_ID;
