/**
 * Derivations - Computed field formulas (Ops Layer)
 *
 * Derivations are pure functions that compute values from record data.
 * They enable formula fields without hardcoding calculations.
 *
 * A Derivation is a record that can be CRUDed via MCP/UI, and executed
 * to compute a value for a given record.
 *
 * Expression Language:
 * - Field references: `amount`, `data.price`, `probability`
 * - Arithmetic: `amount * probability`, `price + tax`
 * - Comparisons: `amount > 10000`, `status == 'active'`
 * - Logical: `isActive && hasContract`, `!isExpired`
 * - Ternary: `amount > 10000 ? 'Enterprise' : 'SMB'`
 * - Functions: `round(amount * 0.1)`, `max(price, 100)`
 */

import { DataRecord, EntityType } from '../../core/types.js';
import { listRecords, getRecordBySlug } from '../content/services.js';

// --- Types ---

export type DerivationReturnType = 'text' | 'number' | 'boolean' | 'date' | 'currency';

export interface DerivationDefinition {
    targetEntityType: EntityType;
    fieldName: string;
    expression: string;
    returnType: DerivationReturnType;
    dependencies?: string[];
}

export interface DerivationResult {
    fieldName: string;
    value: any;
    returnType: DerivationReturnType;
    success: boolean;
    error?: string;
}

// --- Expression Evaluator ---

/**
 * Tokenize an expression string into tokens
 */
function tokenize(expr: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < expr.length; i++) {
        const char = expr[i];

        // Handle strings
        if ((char === '"' || char === "'") && (i === 0 || expr[i - 1] !== '\\')) {
            if (!inString) {
                if (current.trim()) tokens.push(current.trim());
                current = char;
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                current += char;
                tokens.push(current);
                current = '';
                inString = false;
            } else {
                current += char;
            }
            continue;
        }

        if (inString) {
            current += char;
            continue;
        }

        // Handle operators and delimiters
        const twoChar = expr.slice(i, i + 2);
        if (['==', '!=', '>=', '<=', '&&', '||'].includes(twoChar)) {
            if (current.trim()) tokens.push(current.trim());
            tokens.push(twoChar);
            current = '';
            i++; // Skip next char
            continue;
        }

        if ('+-*/%()?,:<>!'.includes(char)) {
            if (current.trim()) tokens.push(current.trim());
            tokens.push(char);
            current = '';
            continue;
        }

        if (char === ' ' || char === '\t' || char === '\n') {
            if (current.trim()) tokens.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    if (current.trim()) tokens.push(current.trim());
    return tokens;
}

/**
 * Parse and evaluate an expression against a record context
 */
function evaluateExpression(expr: string, context: Record<string, any>): any {
    const tokens = tokenize(expr);
    let pos = 0;

    function peek(): string | undefined {
        return tokens[pos];
    }

    function consume(): string {
        return tokens[pos++];
    }

    function parseValue(): any {
        const token = peek();
        if (!token) throw new Error('Unexpected end of expression');

        // Number literal
        if (/^-?\d+(\.\d+)?$/.test(token)) {
            consume();
            return parseFloat(token);
        }

        // String literal
        if ((token.startsWith('"') && token.endsWith('"')) ||
            (token.startsWith("'") && token.endsWith("'"))) {
            consume();
            return token.slice(1, -1);
        }

        // Boolean literals
        if (token === 'true') { consume(); return true; }
        if (token === 'false') { consume(); return false; }
        if (token === 'null') { consume(); return null; }

        // Parenthesized expression
        if (token === '(') {
            consume(); // (
            const result = parseExpression();
            if (peek() === ')') consume(); // )
            return result;
        }

        // Unary not
        if (token === '!') {
            consume();
            return !parseValue();
        }

        // Function call or field reference
        if (/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(token)) {
            consume();

            // Check if it's a function call
            if (peek() === '(') {
                return parseFunction(token);
            }

            // Field reference - resolve from context
            return resolveFieldPath(token, context);
        }

        throw new Error(`Unexpected token: ${token}`);
    }

    function parseFunction(name: string): any {
        consume(); // (
        const args: any[] = [];

        while (peek() && peek() !== ')') {
            args.push(parseExpression());
            if (peek() === ',') consume();
        }
        if (peek() === ')') consume();

        // Built-in functions
        switch (name.toLowerCase()) {
            case 'round': return Math.round(args[0] ?? 0);
            case 'floor': return Math.floor(args[0] ?? 0);
            case 'ceil': return Math.ceil(args[0] ?? 0);
            case 'abs': return Math.abs(args[0] ?? 0);
            case 'min': return Math.min(...args);
            case 'max': return Math.max(...args);
            case 'sum': return args.reduce((a, b) => (a ?? 0) + (b ?? 0), 0);
            case 'avg': return args.length > 0 ? args.reduce((a, b) => a + b, 0) / args.length : 0;
            case 'len': return Array.isArray(args[0]) ? args[0].length : String(args[0] ?? '').length;
            case 'upper': return String(args[0] ?? '').toUpperCase();
            case 'lower': return String(args[0] ?? '').toLowerCase();
            case 'concat': return args.map(a => String(a ?? '')).join('');
            case 'coalesce': return args.find(a => a !== null && a !== undefined) ?? null;
            case 'if': return args[0] ? args[1] : args[2];
            case 'now': return new Date().toISOString();
            case 'year': return new Date(args[0]).getFullYear();
            case 'month': return new Date(args[0]).getMonth() + 1;
            case 'day': return new Date(args[0]).getDate();
            case 'daysdiff': {
                const d1 = new Date(args[0]);
                const d2 = new Date(args[1] ?? new Date());
                return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
            }
            default:
                throw new Error(`Unknown function: ${name}`);
        }
    }

    function parseTerm(): any {
        let left = parseValue();

        while (peek() === '*' || peek() === '/' || peek() === '%') {
            const op = consume();
            const right = parseValue();
            if (op === '*') left = (left ?? 0) * (right ?? 0);
            else if (op === '/') left = right !== 0 ? (left ?? 0) / right : 0;
            else if (op === '%') left = right !== 0 ? (left ?? 0) % right : 0;
        }

        return left;
    }

    function parseArithmetic(): any {
        let left = parseTerm();

        while (peek() === '+' || peek() === '-') {
            const op = consume();
            const right = parseTerm();
            if (op === '+') {
                // String concatenation or number addition
                if (typeof left === 'string' || typeof right === 'string') {
                    left = String(left ?? '') + String(right ?? '');
                } else {
                    left = (left ?? 0) + (right ?? 0);
                }
            } else {
                left = (left ?? 0) - (right ?? 0);
            }
        }

        return left;
    }

    function parseComparison(): any {
        let left = parseArithmetic();

        const compOps = ['==', '!=', '>', '<', '>=', '<='];
        while (peek() && compOps.includes(peek()!)) {
            const op = consume();
            const right = parseArithmetic();

            switch (op) {
                case '==': left = left == right; break;
                case '!=': left = left != right; break;
                case '>': left = left > right; break;
                case '<': left = left < right; break;
                case '>=': left = left >= right; break;
                case '<=': left = left <= right; break;
            }
        }

        return left;
    }

    function parseLogical(): any {
        let left = parseComparison();

        while (peek() === '&&' || peek() === '||') {
            const op = consume();
            const right = parseComparison();
            if (op === '&&') left = left && right;
            else left = left || right;
        }

        return left;
    }

    function parseTernary(): any {
        const condition = parseLogical();

        if (peek() === '?') {
            consume(); // ?
            const trueVal = parseExpression();
            if (peek() === ':') consume(); // :
            const falseVal = parseExpression();
            return condition ? trueVal : falseVal;
        }

        return condition;
    }

    function parseExpression(): any {
        return parseTernary();
    }

    return parseExpression();
}

/**
 * Resolve a dotted field path from a context object
 */
function resolveFieldPath(path: string, context: Record<string, any>): any {
    const parts = path.split('.');
    let value: any = context;

    for (const part of parts) {
        if (value === null || value === undefined) return undefined;
        value = value[part];
    }

    return value;
}

/**
 * Build a flat context object from a DataRecord for expression evaluation
 */
function buildExpressionContext(record: DataRecord): Record<string, any> {
    const context: Record<string, any> = {
        // Top-level record fields
        id: record.id,
        slug: record.slug,
        name: record.name,
        type: record.type,
        summary: record.summary,
        description: record.description,
        created_at: record.created_at,
        updated_at: record.updated_at,
        account_id: record.account_id,
    };

    // Flatten data fields
    if (record.data) {
        for (const [key, value] of Object.entries(record.data)) {
            if (key !== 'fieldGroups') {
                context[key] = value;
            }
        }

        // Also extract from fieldGroups if present
        const fieldGroups = (record.data as any).fieldGroups;
        if (fieldGroups && Array.isArray(fieldGroups)) {
            for (const fg of fieldGroups) {
                const fieldStructs = fg.fieldStructs || [];
                for (const field of fieldStructs) {
                    const name = field.nameField;
                    const prop = field.propertyStructs?.[0];
                    if (name && prop) {
                        // Convert to camelCase for expression access
                        const camelName = name.replace(/\s+(.)/g, (_: any, c: string) => c.toUpperCase())
                            .replace(/\s+/g, '')
                            .replace(/^(.)/, (c: string) => c.toLowerCase());
                        context[camelName] = prop.valueProperty;
                        // Also keep original name for explicit access
                        context[name] = prop.valueProperty;
                    }
                }
            }
        }
    }

    // Add data namespace for explicit access
    context.data = record.data;

    return context;
}

// --- Derivation Resolution ---

/**
 * Parse a Derivation record's data into a structured DerivationDefinition
 */
export function parseDerivationDefinition(derivationRecord: DataRecord): DerivationDefinition {
    const data = derivationRecord.data || {};

    const getField = (name: string): any => {
        if (data[name] !== undefined) return data[name];

        const fieldGroups = (data as any).fieldGroups;
        if (fieldGroups && Array.isArray(fieldGroups)) {
            for (const fg of fieldGroups) {
                const fieldStructs = fg.fieldStructs || [];
                for (const field of fieldStructs) {
                    if (field.nameField === name) {
                        const prop = field.propertyStructs?.[0];
                        return prop?.valueProperty;
                    }
                }
            }
        }
        return undefined;
    };

    const parseJson = (value: any): any => {
        if (typeof value === 'string') {
            try { return JSON.parse(value); } catch { return undefined; }
        }
        return value;
    };

    return {
        targetEntityType: getField('Target Entity Type') as EntityType,
        fieldName: getField('Field Name') || derivationRecord.slug,
        expression: getField('Expression') || '',
        returnType: (getField('Return Type') || 'text') as DerivationReturnType,
        dependencies: parseJson(getField('Dependencies'))
    };
}

/**
 * Compute a single derivation for a record
 */
export function computeDerivation(
    derivationDef: DerivationDefinition,
    record: DataRecord
): DerivationResult {
    try {
        const context = buildExpressionContext(record);
        const rawValue = evaluateExpression(derivationDef.expression, context);

        // Type coercion based on return type
        let value: any = rawValue;
        switch (derivationDef.returnType) {
            case 'number':
            case 'currency':
                value = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue)) || 0;
                break;
            case 'boolean':
                value = Boolean(rawValue);
                break;
            case 'text':
                value = rawValue === null || rawValue === undefined ? '' : String(rawValue);
                break;
            case 'date':
                value = rawValue instanceof Date ? rawValue.toISOString() : String(rawValue);
                break;
        }

        return {
            fieldName: derivationDef.fieldName,
            value,
            returnType: derivationDef.returnType,
            success: true
        };
    } catch (error) {
        return {
            fieldName: derivationDef.fieldName,
            value: null,
            returnType: derivationDef.returnType,
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Compute all derivations for a record based on its entity type
 */
export function computeAllDerivations(
    accountId: string,
    record: DataRecord
): Record<string, any> {
    const derivations = listDerivationsForType(accountId, record.type);
    const results: Record<string, any> = {};

    for (const derivationRecord of derivations) {
        const def = parseDerivationDefinition(derivationRecord);
        const result = computeDerivation(def, record);

        if (result.success) {
            results[result.fieldName] = result.value;
        }
    }

    return results;
}

/**
 * List all Derivation records for a specific entity type
 */
export function listDerivationsForType(accountId: string, entityType: EntityType): DataRecord[] {
    const allDerivations = listRecords(accountId, 'derivation');

    return allDerivations.filter(d => {
        const def = parseDerivationDefinition(d);
        return def.targetEntityType === entityType;
    });
}

/**
 * List all Derivation records for an account
 */
export function listDerivations(accountId: string): DataRecord[] {
    return listRecords(accountId, 'derivation');
}

/**
 * Get a Derivation by slug
 */
export function getDerivation(accountId: string, slug: string): DataRecord | undefined {
    const record = getRecordBySlug(accountId, slug);
    if (record && record.type === 'derivation') {
        return record;
    }
    return undefined;
}

/**
 * Evaluate a derivation expression directly (for testing/preview)
 */
export function evaluateDerivationExpression(
    expression: string,
    testData: Record<string, any>
): { value: any; error?: string } {
    try {
        const value = evaluateExpression(expression, testData);
        return { value };
    } catch (error) {
        return {
            value: null,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Extract field dependencies from an expression
 */
export function extractDependencies(expression: string): string[] {
    const tokens = tokenize(expression);
    const dependencies: Set<string> = new Set();

    const builtins = new Set([
        'round', 'floor', 'ceil', 'abs', 'min', 'max', 'sum', 'avg',
        'len', 'upper', 'lower', 'concat', 'coalesce', 'if', 'now',
        'year', 'month', 'day', 'daysdiff', 'true', 'false', 'null'
    ]);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // Skip operators, numbers, strings
        if (/^-?\d+(\.\d+)?$/.test(token)) continue;
        if (token.startsWith('"') || token.startsWith("'")) continue;
        if ('+-*/%()?,:<>!'.includes(token)) continue;
        if (['==', '!=', '>=', '<=', '&&', '||'].includes(token)) continue;

        // Check if it's a field reference (not a function call)
        if (/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(token)) {
            const nextToken = tokens[i + 1];
            if (nextToken !== '(' && !builtins.has(token.toLowerCase())) {
                dependencies.add(token);
            }
        }
    }

    return Array.from(dependencies);
}
