/**
 * ConstraintEngine Tests
 *
 * Tests for data-driven validation constraints including:
 * - Pattern constraints (email, phone, URL, slug)
 * - Required field constraints
 * - Wildcard entity_type matching
 * - allow_empty behavior
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, resetDb } from '../../core/db.js';
import { evaluateConstraint, enforceConstraints, getConstraintsForTrigger } from './constraints.js';
import type { DataRecord, DataRecordInput } from '../../core/types.js';

// Seed system account for FK constraints
function seedSystemAccount() {
    db.prepare(`
        INSERT OR IGNORE INTO accounts (id, slug, name, account_class, type, data, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000000', 'system', 'System Account', 'business', 'admin', '{}', datetime('now'), datetime('now'))
    `).run();
}

// Seed a validation constraint
function seedConstraint(data: {
    slug: string;
    entity_type: string;
    trigger: string;
    constraint_type: string;
    field?: string;
    pattern?: string;
    allow_empty?: boolean;
    error_code: string;
    error_message: string;
}) {
    const id = `constraint-${crypto.randomUUID()}`;
    db.prepare(`
        INSERT INTO records (id, type, slug, name, account_id, data, created_at, updated_at)
        VALUES (?, 'validation_constraint', ?, ?, '00000000-0000-0000-0000-000000000000', ?, datetime('now'), datetime('now'))
    `).run(
        id,
        data.slug,
        data.slug,
        JSON.stringify({
            entity_type: data.entity_type,
            trigger: data.trigger,
            constraint_type: data.constraint_type,
            field: data.field,
            pattern: data.pattern,
            allow_empty: data.allow_empty,
            error_code: data.error_code,
            error_message: data.error_message,
        })
    );
    return id;
}

describe('ConstraintEngine', () => {
    beforeEach(() => {
        resetDb();
        seedSystemAccount();
    });

    describe('Pattern Constraints', () => {
        describe('Email validation', () => {
            beforeEach(() => {
                seedConstraint({
                    slug: 'test_email_format',
                    entity_type: 'contact',
                    trigger: 'pre_create',
                    constraint_type: 'pattern',
                    field: 'email',
                    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                    allow_empty: true,
                    error_code: 'INV-EMAIL',
                    error_message: 'Invalid email format',
                });
            });

            it('passes for valid email', async () => {
                const record: DataRecordInput = {
                    type: 'contact',
                    name: 'Test Contact',
                    slug: 'test-contact',
                    data: { email: 'user@example.com' },
                };

                const result = await enforceConstraints({ record, trigger: 'pre_create' });
                expect(result.passed).toBe(true);
            });

            it('fails for invalid email', async () => {
                const record: DataRecordInput = {
                    type: 'contact',
                    name: 'Test Contact',
                    slug: 'test-contact',
                    data: { email: 'not-an-email' },
                };

                const result = await enforceConstraints({ record, trigger: 'pre_create' });
                expect(result.passed).toBe(false);
                expect(result.violations[0].errorCode).toBe('INV-EMAIL');
            });

            it('passes for empty email when allow_empty is true', async () => {
                const record: DataRecordInput = {
                    type: 'contact',
                    name: 'Test Contact',
                    slug: 'test-contact',
                    data: { email: '' },
                };

                const result = await enforceConstraints({ record, trigger: 'pre_create' });
                expect(result.passed).toBe(true);
            });

            it('passes for null email when allow_empty is true', async () => {
                const record: DataRecordInput = {
                    type: 'contact',
                    name: 'Test Contact',
                    slug: 'test-contact',
                    data: { email: null },
                };

                const result = await enforceConstraints({ record, trigger: 'pre_create' });
                expect(result.passed).toBe(true);
            });

            it('passes for missing email when allow_empty is true', async () => {
                const record: DataRecordInput = {
                    type: 'contact',
                    name: 'Test Contact',
                    slug: 'test-contact',
                    data: {},
                };

                const result = await enforceConstraints({ record, trigger: 'pre_create' });
                expect(result.passed).toBe(true);
            });
        });

        describe('Phone validation', () => {
            beforeEach(() => {
                seedConstraint({
                    slug: 'test_phone_format',
                    entity_type: 'contact',
                    trigger: 'pre_create',
                    constraint_type: 'pattern',
                    field: 'phone',
                    pattern: '^[+]?[0-9\\s\\-().ext]+$',
                    allow_empty: true,
                    error_code: 'INV-PHONE',
                    error_message: 'Invalid phone format',
                });
            });

            it('passes for valid phone numbers', async () => {
                const validPhones = [
                    '+1-555-555-5555',
                    '(555) 555-5555',
                    '555.555.5555',
                    '+44 20 7123 4567',
                    '555-555-5555 ext. 123',
                ];

                for (const phone of validPhones) {
                    const record: DataRecordInput = {
                        type: 'contact',
                        name: 'Test',
                        slug: 'test',
                        data: { phone },
                    };
                    const result = await enforceConstraints({ record, trigger: 'pre_create' });
                    expect(result.passed).toBe(true);
                }
            });

            it('fails for invalid phone', async () => {
                const record: DataRecordInput = {
                    type: 'contact',
                    name: 'Test',
                    slug: 'test',
                    data: { phone: 'call me maybe' },
                };

                const result = await enforceConstraints({ record, trigger: 'pre_create' });
                expect(result.passed).toBe(false);
            });
        });

        describe('URL validation', () => {
            beforeEach(() => {
                seedConstraint({
                    slug: 'test_url_format',
                    entity_type: 'account',
                    trigger: 'pre_create',
                    constraint_type: 'pattern',
                    field: 'website',
                    pattern: '^https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/.*)?$',
                    allow_empty: true,
                    error_code: 'INV-URL',
                    error_message: 'Invalid URL format',
                });
            });

            it('passes for valid URLs', async () => {
                const validUrls = [
                    'https://example.com',
                    'http://www.example.co.uk',
                    'https://sub.domain.example.com/path/to/page',
                ];

                for (const website of validUrls) {
                    const record: DataRecordInput = {
                        type: 'account',
                        name: 'Test',
                        slug: 'test',
                        data: { website },
                    };
                    const result = await enforceConstraints({ record, trigger: 'pre_create' });
                    expect(result.passed).toBe(true);
                }
            });

            it('fails for invalid URLs', async () => {
                const invalidUrls = [
                    'not-a-url',
                    'ftp://example.com',
                    'example.com', // missing protocol
                ];

                for (const website of invalidUrls) {
                    const record: DataRecordInput = {
                        type: 'account',
                        name: 'Test',
                        slug: 'test',
                        data: { website },
                    };
                    const result = await enforceConstraints({ record, trigger: 'pre_create' });
                    expect(result.passed).toBe(false);
                }
            });
        });

        describe('Slug validation', () => {
            beforeEach(() => {
                seedConstraint({
                    slug: 'test_slug_format',
                    entity_type: '*', // Wildcard - applies to all types
                    trigger: 'pre_create',
                    constraint_type: 'pattern',
                    field: 'slug',
                    pattern: '^[a-z0-9]+(?:[-_][a-z0-9]+)*$',
                    error_code: 'INV-SLUG',
                    error_message: 'Invalid slug format',
                });
            });

            it('passes for valid slugs', async () => {
                const validSlugs = [
                    'simple',
                    'with-hyphen',
                    'with_underscore',
                    'mixed-slug_format',
                    'a1b2c3',
                ];

                for (const slug of validSlugs) {
                    const record: DataRecordInput = {
                        type: 'product', // Any type should work with wildcard
                        name: 'Test',
                        slug,
                        data: {},
                    };
                    const result = await enforceConstraints({ record, trigger: 'pre_create' });
                    expect(result.passed).toBe(true);
                }
            });

            it('fails for invalid slugs', async () => {
                const invalidSlugs = [
                    'Has-Uppercase',
                    'has spaces',
                    'has.dots',
                    '-starts-with-hyphen',
                    'ends-with-hyphen-',
                ];

                for (const slug of invalidSlugs) {
                    const record: DataRecordInput = {
                        type: 'product',
                        name: 'Test',
                        slug,
                        data: {},
                    };
                    const result = await enforceConstraints({ record, trigger: 'pre_create' });
                    expect(result.passed).toBe(false);
                }
            });

            it('applies to any entity type (wildcard)', async () => {
                const types = ['contact', 'account', 'opportunity', 'custom_type'];

                for (const type of types) {
                    const record: DataRecordInput = {
                        type,
                        name: 'Test',
                        slug: 'valid-slug',
                        data: {},
                    };
                    const constraints = getConstraintsForTrigger(type as any, 'pre_create');
                    expect(constraints.length).toBeGreaterThan(0);
                }
            });
        });
    });

    describe('Wildcard Entity Type', () => {
        it('includes wildcard constraints for any entity type', () => {
            seedConstraint({
                slug: 'wildcard_constraint',
                entity_type: '*',
                trigger: 'pre_create',
                constraint_type: 'pattern',
                field: 'test_field',
                pattern: '.*',
                error_code: 'TEST',
                error_message: 'Test error',
            });

            const contactConstraints = getConstraintsForTrigger('contact', 'pre_create');
            const accountConstraints = getConstraintsForTrigger('account', 'pre_create');
            const customConstraints = getConstraintsForTrigger('custom_type' as any, 'pre_create');

            expect(contactConstraints.some(c => c.slug === 'wildcard_constraint')).toBe(true);
            expect(accountConstraints.some(c => c.slug === 'wildcard_constraint')).toBe(true);
            expect(customConstraints.some(c => c.slug === 'wildcard_constraint')).toBe(true);
        });

        it('combines type-specific and wildcard constraints', () => {
            seedConstraint({
                slug: 'contact_specific',
                entity_type: 'contact',
                trigger: 'pre_create',
                constraint_type: 'required_field',
                field: 'email',
                error_code: 'REQ-EMAIL',
                error_message: 'Email required',
            });

            seedConstraint({
                slug: 'universal_slug',
                entity_type: '*',
                trigger: 'pre_create',
                constraint_type: 'pattern',
                field: 'slug',
                pattern: '^[a-z]+$',
                error_code: 'INV-SLUG',
                error_message: 'Invalid slug',
            });

            const constraints = getConstraintsForTrigger('contact', 'pre_create');
            expect(constraints.length).toBe(2);
            expect(constraints.some(c => c.slug === 'contact_specific')).toBe(true);
            expect(constraints.some(c => c.slug === 'universal_slug')).toBe(true);
        });
    });

    describe('allow_empty Behavior', () => {
        it('passes when allow_empty=true and field is empty string', async () => {
            seedConstraint({
                slug: 'test_allow_empty',
                entity_type: 'contact',
                trigger: 'pre_create',
                constraint_type: 'pattern',
                field: 'optional_field',
                pattern: '^[A-Z]+$', // Only uppercase - would fail for empty
                allow_empty: true,
                error_code: 'INV-FIELD',
                error_message: 'Invalid field',
            });

            const record: DataRecordInput = {
                type: 'contact',
                name: 'Test',
                slug: 'test',
                data: { optional_field: '' },
            };

            const result = await enforceConstraints({ record, trigger: 'pre_create' });
            expect(result.passed).toBe(true);
        });

        it('validates when allow_empty=true and field has value', async () => {
            seedConstraint({
                slug: 'test_allow_empty_with_value',
                entity_type: 'contact',
                trigger: 'pre_create',
                constraint_type: 'pattern',
                field: 'optional_field',
                pattern: '^[A-Z]+$',
                allow_empty: true,
                error_code: 'INV-FIELD',
                error_message: 'Invalid field',
            });

            const validRecord: DataRecordInput = {
                type: 'contact',
                name: 'Test',
                slug: 'test',
                data: { optional_field: 'VALID' },
            };

            const invalidRecord: DataRecordInput = {
                type: 'contact',
                name: 'Test',
                slug: 'test',
                data: { optional_field: 'invalid' },
            };

            expect((await enforceConstraints({ record: validRecord, trigger: 'pre_create' })).passed).toBe(true);
            expect((await enforceConstraints({ record: invalidRecord, trigger: 'pre_create' })).passed).toBe(false);
        });

        it('fails when allow_empty=false and field is empty', async () => {
            seedConstraint({
                slug: 'test_no_allow_empty',
                entity_type: 'contact',
                trigger: 'pre_create',
                constraint_type: 'pattern',
                field: 'required_format',
                pattern: '^[A-Z]+$',
                allow_empty: false,
                error_code: 'INV-FIELD',
                error_message: 'Invalid field',
            });

            const record: DataRecordInput = {
                type: 'contact',
                name: 'Test',
                slug: 'test',
                data: { required_format: '' },
            };

            const result = await enforceConstraints({ record, trigger: 'pre_create' });
            expect(result.passed).toBe(false);
        });
    });
});
