/**
 * AI Credential Encryption Service
 *
 * Uses AES-256-GCM for secure API key storage.
 * Keys are derived per-tenant using account_id for isolation.
 */

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;  // GCM standard
const TAG_LENGTH = 16; // GCM auth tag
const KEY_LENGTH = 32; // 256 bits

// Master encryption key from environment
const MASTER_KEY = process.env.AI_ENCRYPTION_KEY || process.env.JWT_SECRET || 'dev-encryption-key-change-in-production';

// Validate in production
if (process.env.NODE_ENV === 'production' && !process.env.AI_ENCRYPTION_KEY) {
    console.warn('AI_ENCRYPTION_KEY not set. Using JWT_SECRET as fallback.');
}

/**
 * Derive a tenant-specific key from master key and account ID.
 * This provides per-tenant key isolation.
 */
function deriveKey(accountId: string): Buffer {
    return crypto.pbkdf2Sync(
        MASTER_KEY,
        `ai-credentials-${accountId}`,
        100000,  // iterations
        KEY_LENGTH,
        'sha256'
    );
}

/**
 * Encrypt an API key for storage.
 * Returns encrypted data and IV (both as hex strings).
 */
export function encryptApiKey(
    plaintext: string,
    accountId: string
): { encrypted: string; iv: string } {
    const key = deriveKey(accountId);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Append auth tag
    const authTag = cipher.getAuthTag();
    encrypted += authTag.toString('hex');

    return {
        encrypted,
        iv: iv.toString('hex'),
    };
}

/**
 * Decrypt an API key from storage.
 * Throws if decryption fails (wrong key, tampered data, etc.).
 */
export function decryptApiKey(
    encryptedHex: string,
    ivHex: string,
    accountId: string
): string {
    const key = deriveKey(accountId);
    const iv = Buffer.from(ivHex, 'hex');

    // Split encrypted data and auth tag
    const authTagHex = encryptedHex.slice(-TAG_LENGTH * 2);
    const dataHex = encryptedHex.slice(0, -TAG_LENGTH * 2);

    const authTag = Buffer.from(authTagHex, 'hex');
    const encryptedData = Buffer.from(dataHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Generate a key hint (last 4 characters) for display.
 * Helps users identify which key is stored without exposing the full key.
 */
export function generateKeyHint(apiKey: string): string {
    if (apiKey.length < 4) {
        return '****';
    }
    return `...${apiKey.slice(-4)}`;
}

/**
 * Mask an API key for display (show first 4 and last 4 characters).
 */
export function maskApiKey(apiKey: string): string {
    if (apiKey.length < 12) {
        return '********';
    }
    return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}
