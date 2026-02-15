
import { DataRecord } from '../types.js';

export interface Violation {
    field: string;
    message: string;
    actual: number | string;
    limit?: number;
}

export type ConstraintRule = {
    field: string;
    maxLen?: number;
    required?: boolean;
    pattern?: RegExp;
};

// Simple rule registry based on typical content fields
// In a real system, this might be schema-driven per Record Type
const RULES: Record<string, ConstraintRule[]> = {
    'brand': [
        { field: 'name', required: true, maxLen: 50 },
        { field: 'description', maxLen: 200 }
    ],
    'product': [
        { field: 'name', required: true, maxLen: 60 },
        { field: 'description', maxLen: 160 } // SEO Meta length
    ],
    // Virtual fields mapped to data.fieldGroups... would be complex.
    // Let's stick to top-level for now.
};

export function validateConstraints(record: DataRecord): Violation[] {
    const issues: Violation[] = [];
    const rules = RULES[record.type] || [];

    for (const rule of rules) {
        const val = (record as any)[rule.field] || (record.data as any)[rule.field];
        
        if (rule.required && !val) {
            issues.push({
                field: rule.field,
                message: 'Field is required',
                actual: 'undefined'
            });
            continue;
        }

        if (val && typeof val === 'string') {
            if (rule.maxLen && val.length > rule.maxLen) {
                issues.push({
                    field: rule.field,
                    message: `Exceeds max length of ${rule.maxLen}`,
                    actual: val.length,
                    limit: rule.maxLen
                });
            }
            if (rule.pattern && !rule.pattern.test(val)) {
                issues.push({
                    field: rule.field,
                    message: 'Format invalid',
                    actual: val
                });
            }
        }
    }

    return issues;
}
