/**
 * Mounted API routes that are intentionally excluded from public OpenAPI coverage checks.
 * These are operational/internal surfaces, not part of the external API contract.
 */

export const OPENAPI_INTERNAL_EXCLUSIONS = [
  '/api/docs',
  '/api/metrics',
] as const;
