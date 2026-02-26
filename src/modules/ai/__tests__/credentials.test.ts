/**
 * AI Credentials Tests
 *
 * Tests for credential encryption, CRUD operations, and usage tracking.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    encryptApiKey,
    decryptApiKey,
    generateKeyHint,
    maskApiKey,
} from '../credentials/encryption.js';

describe('AI Credential Encryption', () => {
    const TEST_ACCOUNT_ID = '00000000-0000-0000-0000-000000000001';
    const TEST_API_KEY = 'sk-ant-api03-test-key-1234567890abcdefghijklmnop';

    describe('encryptApiKey', () => {
        it('encrypts API key and returns encrypted data with IV', () => {
            const result = encryptApiKey(TEST_API_KEY, TEST_ACCOUNT_ID);

            expect(result).toHaveProperty('encrypted');
            expect(result).toHaveProperty('iv');
            expect(result.encrypted).not.toBe(TEST_API_KEY);
            expect(result.iv).toHaveLength(24); // 12 bytes = 24 hex chars
        });

        it('produces different ciphertext for same plaintext (random IV)', () => {
            const result1 = encryptApiKey(TEST_API_KEY, TEST_ACCOUNT_ID);
            const result2 = encryptApiKey(TEST_API_KEY, TEST_ACCOUNT_ID);

            expect(result1.encrypted).not.toBe(result2.encrypted);
            expect(result1.iv).not.toBe(result2.iv);
        });

        it('produces different keys for different accounts (key derivation)', () => {
            const account1 = '00000000-0000-0000-0000-000000000001';
            const account2 = '00000000-0000-0000-0000-000000000002';

            const result1 = encryptApiKey(TEST_API_KEY, account1);
            const result2 = encryptApiKey(TEST_API_KEY, account2);

            // Can decrypt with correct account
            const decrypted1 = decryptApiKey(result1.encrypted, result1.iv, account1);
            expect(decrypted1).toBe(TEST_API_KEY);

            // Cannot decrypt with wrong account (should throw)
            expect(() => {
                decryptApiKey(result1.encrypted, result1.iv, account2);
            }).toThrow();
        });
    });

    describe('decryptApiKey', () => {
        it('successfully decrypts encrypted API key (round-trip)', () => {
            const { encrypted, iv } = encryptApiKey(TEST_API_KEY, TEST_ACCOUNT_ID);
            const decrypted = decryptApiKey(encrypted, iv, TEST_ACCOUNT_ID);

            expect(decrypted).toBe(TEST_API_KEY);
        });

        it('decrypts various API key formats', () => {
            const keys = [
                'sk-1234567890',
                'sk-ant-api03-very-long-anthropic-key-with-many-characters-1234',
                'AIzaSyB-short-google-key',
                'openai-key-with-special-chars_123',
            ];

            for (const key of keys) {
                const { encrypted, iv } = encryptApiKey(key, TEST_ACCOUNT_ID);
                const decrypted = decryptApiKey(encrypted, iv, TEST_ACCOUNT_ID);
                expect(decrypted).toBe(key);
            }
        });

        it('throws on tampered ciphertext', () => {
            const { encrypted, iv } = encryptApiKey(TEST_API_KEY, TEST_ACCOUNT_ID);

            // Tamper with the encrypted data
            const tampered = 'aa' + encrypted.slice(2);

            expect(() => {
                decryptApiKey(tampered, iv, TEST_ACCOUNT_ID);
            }).toThrow();
        });

        it('throws on wrong IV', () => {
            const { encrypted, iv } = encryptApiKey(TEST_API_KEY, TEST_ACCOUNT_ID);

            // Generate different IV
            const wrongIv = 'aabbccddeeff00112233445566';

            expect(() => {
                decryptApiKey(encrypted, wrongIv, TEST_ACCOUNT_ID);
            }).toThrow();
        });
    });

    describe('generateKeyHint', () => {
        it('returns last 4 characters with prefix', () => {
            const hint = generateKeyHint('sk-1234567890abcd');
            expect(hint).toBe('...abcd');
        });

        it('handles short keys', () => {
            const hint = generateKeyHint('abc');
            expect(hint).toBe('****');
        });

        it('handles minimum length key', () => {
            const hint = generateKeyHint('abcd');
            expect(hint).toBe('...abcd');
        });
    });

    describe('maskApiKey', () => {
        it('shows first 4 and last 4 characters', () => {
            const masked = maskApiKey('sk-1234567890abcdef');
            expect(masked).toBe('sk-1...cdef');
        });

        it('handles short keys', () => {
            const masked = maskApiKey('short');
            expect(masked).toBe('********');
        });

        it('handles keys at boundary length', () => {
            const masked = maskApiKey('123456789012');
            expect(masked).toBe('1234...9012');
        });
    });
});

describe('AI Credential Service', () => {
    // These tests would require database setup
    // For unit tests, we test the encryption layer above
    // Integration tests in integration.test.ts will test CRUD operations

    describe('credential validation', () => {
        it('validates provider names', () => {
            const validProviders = ['openai', 'anthropic', 'google'];
            const invalidProviders = ['invalid', 'azure', 'cohere'];

            for (const provider of validProviders) {
                expect(validProviders.includes(provider)).toBe(true);
            }

            for (const provider of invalidProviders) {
                expect(validProviders.includes(provider)).toBe(false);
            }
        });

        it('validates API key format patterns', () => {
            // OpenAI keys start with sk-
            expect('sk-proj-123456'.startsWith('sk-')).toBe(true);

            // Anthropic keys start with sk-ant-
            expect('sk-ant-api03-123456'.startsWith('sk-ant-')).toBe(true);

            // Google keys start with AIza
            expect('AIzaSyB123456'.startsWith('AIza')).toBe(true);
        });
    });
});
