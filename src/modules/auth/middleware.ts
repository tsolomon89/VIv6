/**
 * Auth Middleware for Express
 *
 * Provides middleware functions for:
 * - Parsing session tokens
 * - Loading ODAC capabilities
 * - Enforcing access control
 * - API key bypass for scripts/MCP
 */

import { Request, Response, NextFunction } from 'express';
import { verifySession, SessionPayload } from './session.js';
import { getUserCapabilities, hasCapability, UserCapabilities } from './odac.js';
import { executeMatchingRules, createRuleContext, TriggerEvent } from '../ops/rules.js';
import { db } from '../../core/db.js';
import { errors } from '../../api/middleware/validation.js';

// Extend Express Request with auth fields
declare global {
    namespace Express {
        interface Request {
            user?: SessionPayload;
            odac?: UserCapabilities;
        }
    }
}

/**
 * Parse session token from Authorization header or cookies
 * Does not enforce - use requireSession for that
 */
export function parseSession(req: Request, res: Response, next: NextFunction) {
    // Try Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const payload = verifySession(token);
        if (payload) {
            req.user = payload;
        }
    }

    // Fallback to cookie
    if (!req.user && req.cookies?.session) {
        const payload = verifySession(req.cookies.session);
        if (payload) {
            req.user = payload;
        }
    }

    next();
}

/**
 * Require valid session (401 if missing/invalid)
 */
export function requireSession(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.status(401).json(errors.unauthorized());
    }
    next();
}

/**
 * Load ODAC capabilities for current account context
 * Requires X-Account-Id header or account_id query param
 */
export function loadODAC(req: Request, res: Response, next: NextFunction) {
    if (!req.user) return next();

    const accountId = req.headers['x-account-id'] as string
                   || req.query.account_id as string;

    if (!accountId) return next();

    req.odac = getUserCapabilities(req.user.userId, accountId);
    next();
}

/**
 * Require specific capability (403 if missing)
 *
 * Usage: router.get('/', requireCapability('read:records'), handler)
 */
export function requireCapability(capability: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json(errors.unauthorized());
        }

        const accountId = req.headers['x-account-id'] as string;
        if (!accountId) {
            return res.status(400).json(errors.badRequest('Account context required', 'Set X-Account-Id header'));
        }

        if (!hasCapability(req.user.userId, accountId, capability)) {
            return res.status(403).json(errors.forbidden(`Insufficient permissions for ${capability}`));
        }

        next();
    };
}

/**
 * Require ANY of the specified capabilities
 */
export function requireAnyCapability(...capabilities: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json(errors.unauthorized());
        }

        const accountId = req.headers['x-account-id'] as string;
        if (!accountId) {
            return res.status(400).json(errors.badRequest('Account context required', 'Set X-Account-Id header'));
        }

        const hasAny = capabilities.some(cap =>
            hasCapability(req.user!.userId, accountId, cap)
        );

        if (!hasAny) {
            return res.status(403).json(errors.forbidden('Need at least one of the required capabilities'));
        }

        next();
    };
}

/**
 * Legacy: Allow API key as admin bypass (for scripts, MCP)
 *
 * If X-Api-Key header matches ADMIN_KEY env var, grants full admin access.
 * This maintains backward compatibility with existing tooling.
 */
export function allowApiKeyBypass(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.ADMIN_KEY;

    if (apiKey && validKey && apiKey === validKey) {
        // Create synthetic user for API key access
        req.user = {
            userId: 'system',
            email: 'system@localhost'
        };

        // Grant all capabilities
        const accountId = req.headers['x-account-id'] as string;
        if (accountId) {
            req.odac = {
                userId: 'system',
                accountId,
                capabilities: ['*:*'], // Wildcard = all permissions
                roles: ['system-admin'],
                opportunityIds: []
            };
        }
    }

    next();
}

/**
 * Map HTTP method to trigger event
 */
function mapMethodToEvent(method: string): TriggerEvent | null {
    switch (method.toUpperCase()) {
        case 'GET': return 'pre_read' as TriggerEvent;
        case 'POST': return 'pre_create';
        case 'PUT':
        case 'PATCH': return 'pre_update';
        case 'DELETE': return 'pre_delete';
        default: return null;
    }
}

/**
 * Data-Driven Policy Enforcement
 *
 * Executes access policy rules from the Rules engine.
 * Policies are stored as rule records (Tier 1 seeds).
 *
 * The rule context includes:
 * - User capabilities (from ODAC)
 * - Request method → event type
 * - Record type being accessed
 *
 * Rules with Actions containing { type: 'allow' } permit access.
 */
export async function enforcePolicy(req: Request, res: Response, next: NextFunction) {
    // Skip if already allowed by API key bypass
    if (req.odac?.capabilities.includes('*:*')) {
        return next();
    }

    const event = mapMethodToEvent(req.method);
    if (!event) {
        return next(); // Unknown method, let it through
    }

    const accountId = req.headers['x-account-id'] as string;
    if (!accountId) {
        return next(); // No account context, can't evaluate policies
    }

    // Build record type from route params or query
    const recordType = req.params.type || req.query.type || '*';

    // Capabilities from ODAC (or empty if not loaded)
    const capabilities = req.odac?.capabilities || [];

    try {
        // Create minimal record for policy evaluation
        const minimalRecord: any = {
            id: 'policy-check',
            type: recordType,
            slug: 'policy-check',
            name: 'Policy Check',
            account_id: accountId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            data: { fieldGroups: [] }
        };

        // Create rule context with capability information
        const ruleContext = createRuleContext(
            accountId,
            event,
            minimalRecord,
            undefined,
            req.user?.userId
        );

        // Inject capabilities into context for policy rules to check
        (ruleContext as any).context = {
            userId: req.user?.userId,
            accountId,
            capabilities,
            event,
            recordType
        };

        const results = await executeMatchingRules(ruleContext);

        // Check if any policy rule explicitly allowed the action
        const allowed = results.some(r =>
            r.triggered &&
            r.conditionsMet &&
            r.actionResults?.some((a: any) => a.type === 'allow')
        );

        if (allowed) {
            return next();
        }

        // If no policy rules matched, fall back to capability check
        // This provides a safety net during migration to full policy-based auth
        const fallbackCapability = `${event.replace('pre_', '')}:${recordType}`;
        if (hasCapability(req.user?.userId || '', accountId, fallbackCapability)) {
            return next();
        }

        // No access granted
        return res.status(403).json(errors.forbidden('Access denied by policy'));
    } catch (error) {
        console.error('[Auth] Policy enforcement error:', error);
        // On error, deny by default (fail-secure)
        return res.status(500).json(errors.internal('Policy evaluation failed'));
    }
}

/**
 * Validate user has access to the requested account
 *
 * Checks user_accounts table to verify membership.
 * Skips validation for system users (API key bypass).
 * Returns 403 if user lacks access to the account.
 */
export function validateAccountAccess(req: Request, res: Response, next: NextFunction) {
    // Skip if already allowed by API key bypass (system user)
    if (req.user?.userId === 'system') {
        return next();
    }

    // Skip if no user authenticated
    if (!req.user) {
        return next();
    }

    const accountId = req.headers['x-account-id'] as string
                   || req.query.account_id as string;

    // Skip if no account context (some routes don't require it)
    if (!accountId) {
        return next();
    }

    try {
        // Check if user has access to this account
        const membership = db.prepare(`
            SELECT id FROM user_accounts
            WHERE user_id = ? AND account_id = ? AND is_active = 1
        `).get(req.user.userId, accountId);

        if (!membership) {
            return res.status(403).json(errors.forbidden('You do not have access to this account'));
        }

        next();
    } catch (error) {
        console.error('[Auth] Account access validation error:', error);
        return res.status(500).json(errors.internal('Account validation failed'));
    }
}

/**
 * Combined middleware stack for protected routes
 *
 * Usage: app.use('/api/records', protectedRoute, recordRoutes)
 */
export const protectedRoute = [
    allowApiKeyBypass,
    parseSession,
    requireSession,
    loadODAC
];

/**
 * Combined middleware stack with tenancy enforcement
 *
 * Usage: app.use('/api/records', tenantProtectedRoute, recordRoutes)
 */
export const tenantProtectedRoute = [
    allowApiKeyBypass,
    parseSession,
    requireSession,
    loadODAC,
    validateAccountAccess
];

/**
 * Combined middleware stack with policy enforcement
 *
 * Usage: app.use('/api/records', policyProtectedRoute, recordRoutes)
 */
export const policyProtectedRoute = [
    allowApiKeyBypass,
    parseSession,
    requireSession,
    loadODAC,
    enforcePolicy
];
