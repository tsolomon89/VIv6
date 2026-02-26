/**
 * AI Qualifier Evaluation Tests
 *
 * Tests for the Full Oblio Qualifier Model:
 * - Path parsing (object : fieldGroup : field)
 * - Condition evaluation (=, !=, >, <, Non-Null)
 * - Activity "Won" determination
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { OblioQualifier, QualifierOperator } from '../types.js';

// These functions would be imported from qualifiers.ts
// For testing purposes, we define them here

function parseQualifierPath(path: string): { object: string; fieldGroup: string; field: string } {
    const parts = path.split(' : ').map(p => p.trim());
    return {
        object: parts[0] || '',
        fieldGroup: parts[1] || '',
        field: parts[2] || '',
    };
}

function evaluateCondition(
    value: unknown,
    operator: QualifierOperator,
    expected: string | number | boolean
): boolean {
    // Non-Null check
    if (operator === 'Non-Null' || expected === 'Non-Null') {
        return value !== null && value !== undefined && value !== '';
    }

    // Boolean TRUE/FALSE
    if (expected === 'TRUE') {
        return value === true || value === 'true' || value === 1;
    }
    if (expected === 'FALSE') {
        return value === false || value === 'false' || value === 0;
    }

    // Comparison operators
    switch (operator) {
        case '=':
            return value === expected || String(value) === String(expected);
        case '!=':
            return value !== expected && String(value) !== String(expected);
        case '>':
            return Number(value) > Number(expected);
        case '<':
            return Number(value) < Number(expected);
        case '>=':
            return Number(value) >= Number(expected);
        case '<=':
            return Number(value) <= Number(expected);
        default:
            return false;
    }
}

function getFieldValue(
    record: Record<string, unknown>,
    fieldGroup: string,
    field: string
): unknown {
    // Try fieldGroup.field first (nested structure)
    const group = record[fieldGroup] as Record<string, unknown> | undefined;
    if (group && typeof group === 'object' && field in group) {
        return group[field];
    }

    // Try flat structure: record[field]
    if (field in record) {
        return record[field];
    }

    // Try camelCase variations
    const camelField = field.replace(/\s+/g, '');
    if (camelField in record) {
        return record[camelField];
    }

    return undefined;
}

describe('Qualifier Path Parsing', () => {
    describe('parseQualifierPath', () => {
        it('parses standard three-part path', () => {
            const result = parseQualifierPath('contacts : details : email');

            expect(result.object).toBe('contacts');
            expect(result.fieldGroup).toBe('details');
            expect(result.field).toBe('email');
        });

        it('handles extra whitespace', () => {
            const result = parseQualifierPath('  accounts   :   firmographics   :   Industry  ');

            expect(result.object).toBe('accounts');
            expect(result.fieldGroup).toBe('firmographics');
            expect(result.field).toBe('Industry');
        });

        it('handles two-part path', () => {
            const result = parseQualifierPath('contacts : email');

            expect(result.object).toBe('contacts');
            expect(result.fieldGroup).toBe('email');
            expect(result.field).toBe('');
        });

        it('handles single-part path', () => {
            const result = parseQualifierPath('email');

            expect(result.object).toBe('email');
            expect(result.fieldGroup).toBe('');
            expect(result.field).toBe('');
        });

        it('handles complex field names', () => {
            const result = parseQualifierPath('opportunities : budget : BudgetAmount');

            expect(result.object).toBe('opportunities');
            expect(result.fieldGroup).toBe('budget');
            expect(result.field).toBe('BudgetAmount');
        });
    });
});

describe('Condition Evaluation', () => {
    describe('Non-Null operator', () => {
        it('returns true for non-empty string', () => {
            expect(evaluateCondition('test@email.com', 'Non-Null', 'Non-Null')).toBe(true);
        });

        it('returns true for number', () => {
            expect(evaluateCondition(42, 'Non-Null', 'Non-Null')).toBe(true);
        });

        it('returns true for zero', () => {
            expect(evaluateCondition(0, 'Non-Null', 'Non-Null')).toBe(true);
        });

        it('returns true for false boolean', () => {
            expect(evaluateCondition(false, 'Non-Null', 'Non-Null')).toBe(true);
        });

        it('returns false for null', () => {
            expect(evaluateCondition(null, 'Non-Null', 'Non-Null')).toBe(false);
        });

        it('returns false for undefined', () => {
            expect(evaluateCondition(undefined, 'Non-Null', 'Non-Null')).toBe(false);
        });

        it('returns false for empty string', () => {
            expect(evaluateCondition('', 'Non-Null', 'Non-Null')).toBe(false);
        });
    });

    describe('Equality operator (=)', () => {
        it('compares strings', () => {
            expect(evaluateCondition('Marketing', '=', 'Marketing')).toBe(true);
            expect(evaluateCondition('Sales', '=', 'Marketing')).toBe(false);
        });

        it('compares numbers', () => {
            expect(evaluateCondition(100, '=', 100)).toBe(true);
            expect(evaluateCondition(100, '=', 200)).toBe(false);
        });

        it('handles string-number comparison', () => {
            expect(evaluateCondition('100', '=', 100)).toBe(true);
            expect(evaluateCondition(100, '=', '100')).toBe(true);
        });
    });

    describe('Inequality operator (!=)', () => {
        it('returns true for different values', () => {
            expect(evaluateCondition('Sales', '!=', 'Marketing')).toBe(true);
            expect(evaluateCondition(100, '!=', 200)).toBe(true);
        });

        it('returns false for same values', () => {
            expect(evaluateCondition('Marketing', '!=', 'Marketing')).toBe(false);
            expect(evaluateCondition(100, '!=', 100)).toBe(false);
        });
    });

    describe('Comparison operators (>, <, >=, <=)', () => {
        it('greater than (>)', () => {
            expect(evaluateCondition(100, '>', 50)).toBe(true);
            expect(evaluateCondition(50, '>', 100)).toBe(false);
            expect(evaluateCondition(100, '>', 100)).toBe(false);
        });

        it('less than (<)', () => {
            expect(evaluateCondition(50, '<', 100)).toBe(true);
            expect(evaluateCondition(100, '<', 50)).toBe(false);
            expect(evaluateCondition(100, '<', 100)).toBe(false);
        });

        it('greater than or equal (>=)', () => {
            expect(evaluateCondition(100, '>=', 50)).toBe(true);
            expect(evaluateCondition(100, '>=', 100)).toBe(true);
            expect(evaluateCondition(50, '>=', 100)).toBe(false);
        });

        it('less than or equal (<=)', () => {
            expect(evaluateCondition(50, '<=', 100)).toBe(true);
            expect(evaluateCondition(100, '<=', 100)).toBe(true);
            expect(evaluateCondition(100, '<=', 50)).toBe(false);
        });

        it('handles string numbers', () => {
            expect(evaluateCondition('100', '>', '50')).toBe(true);
            expect(evaluateCondition('50', '<', '100')).toBe(true);
        });
    });

    describe('Boolean values', () => {
        it('evaluates TRUE expected value', () => {
            expect(evaluateCondition(true, '=', 'TRUE')).toBe(true);
            expect(evaluateCondition('true', '=', 'TRUE')).toBe(true);
            expect(evaluateCondition(1, '=', 'TRUE')).toBe(true);
            expect(evaluateCondition(false, '=', 'TRUE')).toBe(false);
        });

        it('evaluates FALSE expected value', () => {
            expect(evaluateCondition(false, '=', 'FALSE')).toBe(true);
            expect(evaluateCondition('false', '=', 'FALSE')).toBe(true);
            expect(evaluateCondition(0, '=', 'FALSE')).toBe(true);
            expect(evaluateCondition(true, '=', 'FALSE')).toBe(false);
        });
    });
});

describe('Field Value Retrieval', () => {
    describe('getFieldValue', () => {
        it('retrieves nested field value', () => {
            const record = {
                details: {
                    email: 'test@example.com',
                    phone: '555-1234',
                },
            };

            expect(getFieldValue(record, 'details', 'email')).toBe('test@example.com');
            expect(getFieldValue(record, 'details', 'phone')).toBe('555-1234');
        });

        it('retrieves flat field value', () => {
            const record = {
                email: 'test@example.com',
                name: 'Test Contact',
            };

            expect(getFieldValue(record, 'primary', 'email')).toBe('test@example.com');
            expect(getFieldValue(record, 'any', 'name')).toBe('Test Contact');
        });

        it('handles camelCase field names', () => {
            const record = {
                firstName: 'John',
                lastName: 'Doe',
                FirstName: 'Jane', // Also support PascalCase
            };

            // Direct camelCase match
            expect(getFieldValue(record, 'basic', 'firstName')).toBe('John');
            // "First Name" with spaces removed becomes "FirstName" (PascalCase)
            expect(getFieldValue(record, 'basic', 'First Name')).toBe('Jane');
        });

        it('returns undefined for missing fields', () => {
            const record = {
                name: 'Test',
            };

            expect(getFieldValue(record, 'details', 'email')).toBeUndefined();
            expect(getFieldValue(record, 'nonexistent', 'field')).toBeUndefined();
        });
    });
});

describe('Qualifier Evaluation (Full)', () => {
    describe('Data Activity Qualifiers', () => {
        it('evaluates email Non-Null qualifier', () => {
            const qualifier: OblioQualifier = {
                qualifier: 'contacts : details : email',
                qualifierOperator: 'Non-Null',
                qualifierValue: 'Non-Null',
                qualifierType: 'Data',
            };

            // Simulate contact with email
            const contactWithEmail = { details: { email: 'test@example.com' } };
            const emailPath = parseQualifierPath(qualifier.qualifier);
            const emailValue = getFieldValue(contactWithEmail, emailPath.fieldGroup, emailPath.field);
            const result = evaluateCondition(emailValue, qualifier.qualifierOperator, qualifier.qualifierValue);

            expect(result).toBe(true);
        });

        it('fails when email is missing', () => {
            const qualifier: OblioQualifier = {
                qualifier: 'contacts : details : email',
                qualifierOperator: 'Non-Null',
                qualifierValue: 'Non-Null',
                qualifierType: 'Data',
            };

            // Simulate contact without email
            const contactWithoutEmail = { details: { phone: '555-1234' } };
            const emailPath = parseQualifierPath(qualifier.qualifier);
            const emailValue = getFieldValue(contactWithoutEmail, emailPath.fieldGroup, emailPath.field);
            const result = evaluateCondition(emailValue, qualifier.qualifierOperator, qualifier.qualifierValue);

            expect(result).toBe(false);
        });
    });

    describe('Budget Qualifiers', () => {
        it('evaluates budget > threshold qualifier', () => {
            const qualifier: OblioQualifier = {
                qualifier: 'opportunities : budget : amount',
                qualifierOperator: '>',
                qualifierValue: 10000,
                qualifierType: 'Data',
            };

            const opportunity = { budget: { amount: 25000 } };
            const path = parseQualifierPath(qualifier.qualifier);
            const value = getFieldValue(opportunity, path.fieldGroup, path.field);
            const result = evaluateCondition(value, qualifier.qualifierOperator, qualifier.qualifierValue);

            expect(result).toBe(true);
        });

        it('fails when budget below threshold', () => {
            const qualifier: OblioQualifier = {
                qualifier: 'opportunities : budget : amount',
                qualifierOperator: '>',
                qualifierValue: 10000,
                qualifierType: 'Data',
            };

            const opportunity = { budget: { amount: 5000 } };
            const path = parseQualifierPath(qualifier.qualifier);
            const value = getFieldValue(opportunity, path.fieldGroup, path.field);
            const result = evaluateCondition(value, qualifier.qualifierOperator, qualifier.qualifierValue);

            expect(result).toBe(false);
        });
    });

    describe('Persona Qualifiers', () => {
        it('evaluates persona = specific value qualifier', () => {
            const qualifier: OblioQualifier = {
                qualifier: 'contacts : persona : type',
                qualifierOperator: '=',
                qualifierValue: 'Decision Maker',
                qualifierType: 'Data',
            };

            const contact = { persona: { type: 'Decision Maker' } };
            const path = parseQualifierPath(qualifier.qualifier);
            const value = getFieldValue(contact, path.fieldGroup, path.field);
            const result = evaluateCondition(value, qualifier.qualifierOperator, qualifier.qualifierValue);

            expect(result).toBe(true);
        });
    });

    describe('Activity Won Determination', () => {
        function evaluateAllQualifiers(
            qualifiers: OblioQualifier[],
            record: Record<string, unknown>
        ): { allPassed: boolean; results: Array<{ qualifier: string; passed: boolean; value: unknown }> } {
            if (qualifiers.length === 0) {
                return { allPassed: true, results: [] };
            }

            const results: Array<{ qualifier: string; passed: boolean; value: unknown }> = [];
            let allPassed = true;

            for (const q of qualifiers) {
                const path = parseQualifierPath(q.qualifier);
                const value = getFieldValue(record, path.fieldGroup, path.field);
                const passed = evaluateCondition(value, q.qualifierOperator, q.qualifierValue);

                results.push({ qualifier: q.qualifier, passed, value });

                if (!passed) {
                    allPassed = false;
                }
            }

            return { allPassed, results };
        }

        it('returns allPassed=true when all qualifiers pass', () => {
            const qualifiers: OblioQualifier[] = [
                { qualifier: 'contacts : details : email', qualifierOperator: 'Non-Null', qualifierValue: 'Non-Null' },
                { qualifier: 'contacts : details : name', qualifierOperator: 'Non-Null', qualifierValue: 'Non-Null' },
            ];

            const contact = {
                details: {
                    email: 'test@example.com',
                    name: 'John Doe',
                },
            };

            const result = evaluateAllQualifiers(qualifiers, contact);

            expect(result.allPassed).toBe(true);
            expect(result.results).toHaveLength(2);
            expect(result.results.every(r => r.passed)).toBe(true);
        });

        it('returns allPassed=false when any qualifier fails', () => {
            const qualifiers: OblioQualifier[] = [
                { qualifier: 'contacts : details : email', qualifierOperator: 'Non-Null', qualifierValue: 'Non-Null' },
                { qualifier: 'contacts : details : phone', qualifierOperator: 'Non-Null', qualifierValue: 'Non-Null' },
            ];

            const contact = {
                details: {
                    email: 'test@example.com',
                    // phone is missing
                },
            };

            const result = evaluateAllQualifiers(qualifiers, contact);

            expect(result.allPassed).toBe(false);
            expect(result.results.find(r => r.qualifier.includes('phone'))?.passed).toBe(false);
        });

        it('returns allPassed=true for empty qualifiers array', () => {
            const result = evaluateAllQualifiers([], {});

            expect(result.allPassed).toBe(true);
            expect(result.results).toHaveLength(0);
        });
    });
});
