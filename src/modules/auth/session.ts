/**
 * Session management using JWT
 *
 * Stateless sessions - easy to migrate to cloud later
 */

import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const EXPIRY = '7d';

// Validate JWT_SECRET in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required in production');
}

export interface SessionPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

/**
 * Create a new session token
 */
export function createSession(userId: string, email: string): string {
    return jwt.sign({ userId, email }, SECRET, { expiresIn: EXPIRY });
}

/**
 * Verify and decode a session token
 * Returns null if invalid/expired
 */
export function verifySession(token: string): SessionPayload | null {
    try {
        return jwt.verify(token, SECRET) as SessionPayload;
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
