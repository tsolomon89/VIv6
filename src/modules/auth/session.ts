/**
 * Session management using JWT
 *
 * Stateless sessions with server-side revocation support.
 * Tokens include a JTI (JWT ID) for revocation tracking.
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../../core/db.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const EXPIRY = '7d';

// Validate JWT_SECRET in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required in production');
}

export interface SessionPayload {
    userId: string;
    email: string;
    jti?: string;  // JWT ID for revocation tracking
    iat?: number;
    exp?: number;
}

/**
 * Create a new session token with JTI for revocation tracking
 */
export function createSession(userId: string, email: string): string {
    const jti = crypto.randomUUID();
    return jwt.sign({ userId, email, jti }, SECRET, { expiresIn: EXPIRY });
}

/**
 * Check if a session is revoked (by JTI)
 */
export function isSessionRevoked(jti: string): boolean {
    try {
        const revoked = db.prepare(
            'SELECT 1 FROM revoked_sessions WHERE jti = ?'
        ).get(jti);
        return !!revoked;
    } catch (err) {
        console.error('[Session] Revocation check error:', err instanceof Error ? err.message : String(err));
        return false; // Fail open for availability (change to true for stricter security)
    }
}

/**
 * Verify and decode a session token
 * Returns null if invalid, expired, or revoked
 */
export function verifySession(token: string): SessionPayload | null {
    try {
        const payload = jwt.verify(token, SECRET) as SessionPayload;

        // Check revocation list if JTI exists
        if (payload.jti && isSessionRevoked(payload.jti)) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

/**
 * Decode a token without verification (for debugging)
 */
export function decodeSession(token: string): SessionPayload | null {
    try {
        return jwt.decode(token) as SessionPayload;
    } catch {
        return null;
    }
}

/**
 * Hash a token for secure storage
 */
function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export type RevocationReason = 'logout' | 'password_change' | 'admin_revoke' | 'security';

/**
 * Revoke a session token
 */
export function revokeSession(
    token: string,
    reason: RevocationReason = 'logout',
    revokedBy?: string
): boolean {
    try {
        const payload = jwt.decode(token) as SessionPayload;
        if (!payload || !payload.jti || !payload.exp) {
            // Token without JTI (old format) - can't revoke but that's OK
            return false;
        }

        const id = crypto.randomUUID();
        const tokenHash = hashToken(token);
        const revokedAt = new Date().toISOString();
        const expiresAt = new Date(payload.exp * 1000).toISOString();

        db.prepare(`
            INSERT OR IGNORE INTO revoked_sessions
            (id, jti, token_hash, user_id, revoked_at, expires_at, reason, revoked_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, payload.jti, tokenHash, payload.userId, revokedAt, expiresAt, reason, revokedBy || null);

        return true;
    } catch (err) {
        console.error('[Session] Revocation error:', err instanceof Error ? err.message : String(err));
        return false;
    }
}

/**
 * Revoke all sessions for a user (password change, security incident)
 * Note: This creates a marker; for full tracking, would need active session registry.
 */
export function revokeAllUserSessions(
    userId: string,
    reason: 'password_change' | 'admin_revoke' | 'security',
    revokedBy?: string
): number {
    try {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        // Set expires_at to 7 days from now (max token lifetime)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        db.prepare(`
            INSERT INTO revoked_sessions
            (id, jti, token_hash, user_id, revoked_at, expires_at, reason, revoked_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, `all:${userId}:${Date.now()}`, 'all_sessions', userId, now, expiresAt, reason, revokedBy || null);

        return 1;
    } catch (err) {
        console.error('[Session] Revoke all error:', err instanceof Error ? err.message : String(err));
        return 0;
    }
}

/**
 * Cleanup expired revoked sessions
 * Call periodically or on startup
 */
export function cleanupExpiredRevocations(limit: number = 100): number {
    try {
        const now = new Date().toISOString();
        const result = db.prepare(
            'DELETE FROM revoked_sessions WHERE id IN (SELECT id FROM revoked_sessions WHERE expires_at < ? LIMIT ?)'
        ).run(now, limit);
        return result.changes;
    } catch (err) {
        console.error('[Session] Cleanup error:', err instanceof Error ? err.message : String(err));
        return 0;
    }
}
