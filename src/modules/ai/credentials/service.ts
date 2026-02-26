/**
 * AI Credential Service
 *
 * CRUD operations for AI provider API keys.
 * Keys are encrypted at rest using AES-256-GCM.
 */

import { v4 as uuid } from 'uuid';
import { db } from '../../../core/db.js';
import { encryptApiKey, decryptApiKey, generateKeyHint } from './encryption.js';
import type {
    AICredential,
    AIProviderName,
    CreateCredentialInput,
    CredentialTestResult,
} from '../types.js';

/**
 * List all credentials for an account (keys are NOT decrypted).
 */
export function listCredentials(accountId: string): AICredential[] {
    const rows = db.prepare(`
        SELECT * FROM ai_credentials
        WHERE account_id = ? AND deleted_at IS NULL
        ORDER BY provider, name
    `).all(accountId) as Array<{
        id: string;
        account_id: string;
        provider: string;
        encrypted_key: string;
        key_iv: string;
        key_hint: string | null;
        name: string | null;
        is_default: number;
        token_budget_daily: number | null;
        cost_budget_daily: number | null;
        usage_tokens_today: number;
        last_used_at: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
    }>;

    return rows.map(row => ({
        id: row.id,
        accountId: row.account_id,
        provider: row.provider as AIProviderName,
        encryptedKey: row.encrypted_key,
        keyIv: row.key_iv,
        keyHint: row.key_hint,
        name: row.name,
        isDefault: row.is_default === 1,
        tokenBudgetDaily: row.token_budget_daily,
        costBudgetDaily: row.cost_budget_daily,
        usageTokensToday: row.usage_tokens_today,
        lastUsedAt: row.last_used_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
    }));
}

/**
 * Get a credential by ID (key is NOT decrypted).
 */
export function getCredential(id: string): AICredential | null {
    const row = db.prepare(`
        SELECT * FROM ai_credentials WHERE id = ? AND deleted_at IS NULL
    `).get(id) as {
        id: string;
        account_id: string;
        provider: string;
        encrypted_key: string;
        key_iv: string;
        key_hint: string | null;
        name: string | null;
        is_default: number;
        token_budget_daily: number | null;
        cost_budget_daily: number | null;
        usage_tokens_today: number;
        last_used_at: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
    } | undefined;

    if (!row) return null;

    return {
        id: row.id,
        accountId: row.account_id,
        provider: row.provider as AIProviderName,
        encryptedKey: row.encrypted_key,
        keyIv: row.key_iv,
        keyHint: row.key_hint,
        name: row.name,
        isDefault: row.is_default === 1,
        tokenBudgetDaily: row.token_budget_daily,
        costBudgetDaily: row.cost_budget_daily,
        usageTokensToday: row.usage_tokens_today,
        lastUsedAt: row.last_used_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
    };
}

/**
 * Get the default credential for a provider.
 */
export function getDefaultCredential(
    accountId: string,
    provider: AIProviderName
): AICredential | null {
    const row = db.prepare(`
        SELECT * FROM ai_credentials
        WHERE account_id = ? AND provider = ? AND is_default = 1 AND deleted_at IS NULL
    `).get(accountId, provider) as {
        id: string;
        account_id: string;
        provider: string;
        encrypted_key: string;
        key_iv: string;
        key_hint: string | null;
        name: string | null;
        is_default: number;
        token_budget_daily: number | null;
        cost_budget_daily: number | null;
        usage_tokens_today: number;
        last_used_at: string | null;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
    } | undefined;

    if (!row) return null;

    return {
        id: row.id,
        accountId: row.account_id,
        provider: row.provider as AIProviderName,
        encryptedKey: row.encrypted_key,
        keyIv: row.key_iv,
        keyHint: row.key_hint,
        name: row.name,
        isDefault: row.is_default === 1,
        tokenBudgetDaily: row.token_budget_daily,
        costBudgetDaily: row.cost_budget_daily,
        usageTokensToday: row.usage_tokens_today,
        lastUsedAt: row.last_used_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
    };
}

/**
 * Decrypt and return the API key for a credential.
 * Only call this when actually needed for API calls.
 */
export function getDecryptedKey(credential: AICredential): string {
    return decryptApiKey(credential.encryptedKey, credential.keyIv, credential.accountId);
}

/**
 * Create a new credential.
 */
export function createCredential(input: CreateCredentialInput): AICredential {
    const id = uuid();
    const now = new Date().toISOString();

    // Encrypt the API key
    const { encrypted, iv } = encryptApiKey(input.apiKey, input.accountId);
    const keyHint = generateKeyHint(input.apiKey);

    // If this is set as default, unset other defaults for this provider
    if (input.isDefault) {
        db.prepare(`
            UPDATE ai_credentials
            SET is_default = 0, updated_at = ?
            WHERE account_id = ? AND provider = ? AND deleted_at IS NULL
        `).run(now, input.accountId, input.provider);
    }

    db.prepare(`
        INSERT INTO ai_credentials (
            id, account_id, provider, encrypted_key, key_iv, key_hint,
            name, is_default, token_budget_daily, cost_budget_daily,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        id,
        input.accountId,
        input.provider,
        encrypted,
        iv,
        keyHint,
        input.name || null,
        input.isDefault ? 1 : 0,
        input.tokenBudgetDaily || null,
        input.costBudgetDaily || null,
        now,
        now
    );

    return getCredential(id)!;
}

/**
 * Update a credential's metadata (NOT the key itself).
 */
export function updateCredential(
    id: string,
    updates: {
        name?: string;
        isDefault?: boolean;
        tokenBudgetDaily?: number | null;
        costBudgetDaily?: number | null;
    }
): AICredential | null {
    const credential = getCredential(id);
    if (!credential) return null;

    const now = new Date().toISOString();

    // If setting as default, unset other defaults
    if (updates.isDefault) {
        db.prepare(`
            UPDATE ai_credentials
            SET is_default = 0, updated_at = ?
            WHERE account_id = ? AND provider = ? AND id != ? AND deleted_at IS NULL
        `).run(now, credential.accountId, credential.provider, id);
    }

    const setClauses: string[] = ['updated_at = ?'];
    const params: unknown[] = [now];

    if (updates.name !== undefined) {
        setClauses.push('name = ?');
        params.push(updates.name);
    }
    if (updates.isDefault !== undefined) {
        setClauses.push('is_default = ?');
        params.push(updates.isDefault ? 1 : 0);
    }
    if (updates.tokenBudgetDaily !== undefined) {
        setClauses.push('token_budget_daily = ?');
        params.push(updates.tokenBudgetDaily);
    }
    if (updates.costBudgetDaily !== undefined) {
        setClauses.push('cost_budget_daily = ?');
        params.push(updates.costBudgetDaily);
    }

    params.push(id);

    db.prepare(`
        UPDATE ai_credentials
        SET ${setClauses.join(', ')}
        WHERE id = ?
    `).run(...params);

    return getCredential(id);
}

/**
 * Rotate (replace) the API key for a credential.
 */
export function rotateCredentialKey(id: string, newApiKey: string): AICredential | null {
    const credential = getCredential(id);
    if (!credential) return null;

    const now = new Date().toISOString();
    const { encrypted, iv } = encryptApiKey(newApiKey, credential.accountId);
    const keyHint = generateKeyHint(newApiKey);

    db.prepare(`
        UPDATE ai_credentials
        SET encrypted_key = ?, key_iv = ?, key_hint = ?, updated_at = ?
        WHERE id = ?
    `).run(encrypted, iv, keyHint, now, id);

    return getCredential(id);
}

/**
 * Soft-delete a credential.
 */
export function deleteCredential(id: string): boolean {
    const now = new Date().toISOString();
    const result = db.prepare(`
        UPDATE ai_credentials
        SET deleted_at = ?, updated_at = ?
        WHERE id = ? AND deleted_at IS NULL
    `).run(now, now, id);

    return result.changes > 0;
}

/**
 * Update usage tracking after an AI call.
 */
export function recordUsage(id: string, tokensUsed: number): void {
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // Check if we need to reset daily usage (new day)
    const credential = getCredential(id);
    if (!credential) return;

    const lastUsedDay = credential.lastUsedAt?.split('T')[0];
    const usageToAdd = lastUsedDay === today ? tokensUsed : tokensUsed;  // Reset if new day

    if (lastUsedDay !== today) {
        // New day - reset counter
        db.prepare(`
            UPDATE ai_credentials
            SET usage_tokens_today = ?, last_used_at = ?, updated_at = ?
            WHERE id = ?
        `).run(tokensUsed, now, now, id);
    } else {
        // Same day - increment counter
        db.prepare(`
            UPDATE ai_credentials
            SET usage_tokens_today = usage_tokens_today + ?, last_used_at = ?, updated_at = ?
            WHERE id = ?
        `).run(tokensUsed, now, now, id);
    }
}

/**
 * Check if a credential has exceeded its daily budget.
 */
export function isOverBudget(credential: AICredential): boolean {
    if (!credential.tokenBudgetDaily) return false;
    return credential.usageTokensToday >= credential.tokenBudgetDaily;
}
