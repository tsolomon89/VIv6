/**
 * Auth API Routes
 *
 * Endpoints:
 * - POST /auth/register - Create new user
 * - POST /auth/login - Authenticate and get token
 * - GET /auth/me - Get current user and accounts
 * - POST /auth/logout - Logout (client-side token discard)
 * - POST /auth/grant-access - Grant user access to account (admin)
 * - POST /auth/revoke-access - Revoke user access (admin)
 */

import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../../../core/db.js';
import { hashPassword, verifyPassword } from '../password.js';
import { createSession } from '../session.js';
import { getUserAccounts, getUserCapabilities, grantAccess, revokeAccess } from '../odac.js';
import { parseSession, requireSession, loadODAC, requireCapability } from '../middleware.js';


console.log('--- AUTH ROUTES LOADING ---');

const router = Router();
router.use((req, res, next) => {
    console.log('[AuthMiddleware] Request:', req.method, req.path);
    next();
});


/**
 * POST /auth/register
 * Create a new user account
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Check if user already exists
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        const userId = crypto.randomUUID();
        const passwordHash = await hashPassword(password);
        const now = new Date().toISOString();

        db.prepare(`
            INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            userId,
            email.toLowerCase(),
            passwordHash,
            name || email.split('@')[0],
            now,
            now
        );

        const token = createSession(userId, email);

        res.status(201).json({
            token,
            user: {
                id: userId,
                email: email.toLowerCase(),
                name: name || email.split('@')[0]
            }
        });
    } catch (error) {
        console.error('[Auth] Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * POST /auth/login
 * Authenticate with email/password and get session token
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any;
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = createSession(user.id, user.email);

        // Get accounts this user has access to via ODAC
        const accounts = getUserAccounts(user.id);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            accounts
        });
    } catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * GET /auth/me
 * Get current user info and accessible accounts
 */
router.get('/me', parseSession, requireSession, loadODAC, (req, res) => {
    try {
        const user = db.prepare('SELECT id, email, name, avatar_url FROM users WHERE id = ?')
            .get(req.user!.userId) as any;

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const accounts = getUserAccounts(req.user!.userId);

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatar_url
            },
            accounts,
            // Include current account context if X-Account-Id was provided
            currentAccount: req.odac || null
        });
    } catch (error) {
        console.error('[Auth] Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

/**
 * POST /auth/logout
 * Logout (for JWT, this is primarily a client-side operation)
 */
router.post('/logout', (req, res) => {
    // For JWT, logout is client-side (discard token)
    // Future: could add token to revocation list in Redis/DB
    res.json({ success: true });
});

/**
 * GET /auth/capabilities
 * Get capabilities for current user in specified account
 */
router.get('/capabilities', parseSession, requireSession, loadODAC, (req, res) => {
    try {
        const accountId = req.headers['x-account-id'] as string || req.query.account_id as string;

        if (!accountId) {
            return res.status(400).json({ error: 'Account ID required (X-Account-Id header or account_id query)' });
        }

        const capabilities = getUserCapabilities(req.user!.userId, accountId);
        res.json(capabilities);
    } catch (error) {
        console.error('[Auth] Get capabilities error:', error);
        res.status(500).json({ error: 'Failed to get capabilities' });
    }
});

/**
 * POST /auth/grant-access
 * Grant user access to account via ODAC (creates employment opportunity)
 *
 * Requires admin:* capability in the target account
 */
router.post('/grant-access',
    parseSession,
    requireSession,
    requireCapability('admin:*'),
    async (req, res) => {
        try {
            const { userId, accountId, hrProductId, startDate, endDate, opportunityName } = req.body;

            if (!userId || !accountId || !hrProductId) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['userId', 'accountId', 'hrProductId']
                });
            }

            // Verify user exists
            const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const opportunityId = await grantAccess(userId, accountId, hrProductId, {
                startDate,
                endDate,
                opportunityName
            });

            res.status(201).json({
                success: true,
                opportunityId,
                message: 'Access granted via employment opportunity'
            });
        } catch (error) {
            console.error('[Auth] Grant access error:', error);
            res.status(500).json({
                error: 'Failed to grant access',
                message: error instanceof Error ? error.message : String(error)
            });
        }
    }
);

/**
 * POST /auth/revoke-access
 * Revoke user access (ends employment opportunity)
 *
 * Requires admin:* capability
 */
router.post('/revoke-access',
    parseSession,
    requireSession,
    requireCapability('admin:*'),
    async (req, res) => {
        try {
            const { opportunityId } = req.body;

            if (!opportunityId) {
                return res.status(400).json({ error: 'opportunityId required' });
            }

            await revokeAccess(opportunityId);

            res.json({
                success: true,
                message: 'Access revoked (employment ended)'
            });
        } catch (error) {
            console.error('[Auth] Revoke access error:', error);
            res.status(500).json({
                error: 'Failed to revoke access',
                message: error instanceof Error ? error.message : String(error)
            });
        }
    }
);

/**
 * PUT /auth/primary-account
 * Set user's primary account preference
 */
router.put('/primary-account', parseSession, requireSession, loadODAC, (req, res) => {
    try {
        const { accountId } = req.body;

        if (!accountId) {
            return res.status(400).json({ error: 'accountId required' });
        }

        // Verify user has access to this account
        const caps = getUserCapabilities(req.user!.userId, accountId);
        if (caps.capabilities.length === 0) {
            return res.status(403).json({ error: 'No access to this account' });
        }

        db.prepare('UPDATE users SET primary_account_id = ?, updated_at = ? WHERE id = ?')
            .run(accountId, new Date().toISOString(), req.user!.userId);

        res.json({ success: true, primaryAccountId: accountId });
    } catch (error) {
        console.error('[Auth] Set primary account error:', error);
        res.status(500).json({ error: 'Failed to set primary account' });
    }
});

export default router;
