/**
 * Qualifier CSV Parser
 *
 * Parses the Oblio qualifier CSV files and returns structured qualifier definitions.
 * Used by the pipeline config seeder to dynamically load qualifiers at seed time.
 */

import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname || __dirname, '../../');
const CSV_DIR = path.join(PROJECT_ROOT, 'agent_context/archive/data_models');

export interface QualifierDefinition {
    id: string;
    type: 'qualifier_def';
    slug: string;
    name: string;
    summary: string;
    account_id: string;
    data: {
        object: string;
        fieldGroup: string;
        field: string;
        path: string;
        qualifierType: string;
        defaultOperator?: string;
        defaultValue?: string | number | boolean;
    };
}

export interface PipelineQualifier {
    pipeline: string;
    stage: string;
    qualifier: string;
    qualifierOperator: string;
    qualifierValue: string | number;
    qualifierType: string;
    qualifierActivity?: string;
    activityCondition?: string;
    activityValue?: string;
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

/**
 * Parse the Object_Qualifiers CSV to get all qualifier paths
 */
export function parseObjectQualifiersCSV(): QualifierDefinition[] {
    const filePath = path.join(CSV_DIR, 'Oblio Documentation - 9.) Oblio Data Asset  - Object _ Qualifers (1).csv');

    if (!fs.existsSync(filePath)) {
        console.warn(`[parseQualifiersCSV] File not found: ${filePath}`);
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    // Skip header
    const dataLines = lines.slice(1);
    const qualifiers: QualifierDefinition[] = [];
    let counter = 1;

    for (const line of dataLines) {
        const [qualifierName, object, map, field] = parseCSVLine(line);

        if (!object || !map || !field) continue;

        const slug = `${object}_${map}_${field}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const path = `${object} : ${map} : ${field}`;

        qualifiers.push({
            id: `qual-00000000-0000-0000-0000-${String(counter).padStart(12, '0')}`,
            type: 'qualifier_def',
            slug,
            name: qualifierName || `${object} ${map} ${field}`,
            summary: `Qualifier for ${object}.${map}.${field}`,
            account_id: '00000000-0000-0000-0000-000000000000',
            data: {
                object,
                fieldGroup: map,
                field,
                path,
                qualifierType: 'Data'
            }
        });

        counter++;
    }

    return qualifiers;
}

/**
 * Parse the Qualifiers CSV to get pipeline-specific qualifier rules
 */
export function parsePipelineQualifiersCSV(): PipelineQualifier[] {
    const filePath = path.join(CSV_DIR, 'Oblio Documentation - 9.) Oblio Data Asset  - Qualifiers.csv');

    if (!fs.existsSync(filePath)) {
        console.warn(`[parseQualifiersCSV] File not found: ${filePath}`);
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    // Skip header
    const dataLines = lines.slice(1);
    const qualifiers: PipelineQualifier[] = [];

    for (const line of dataLines) {
        const fields = parseCSVLine(line);

        // Expected columns:
        // 0: Full name (e.g., "B2B - MQL - contacts : score : persona > 0.6")
        // 1: Product Name
        // 2: Opportunity Types (stage)
        // 3: qualifierType
        // 4: qualifierRequired
        // 5: qualifierPipeline (e.g., "B2B - MQL")
        // 6: qualifier (e.g., "contacts : score : persona")
        // 7: qualifierOperator
        // 8: qualifierValue
        // 9: qualifierActivity
        // 10: Activity Condition
        // 11: Activity Value

        const qualifierPipeline = fields[5];
        const qualifier = fields[6];
        const qualifierOperator = fields[7];
        const qualifierValue = fields[8];
        const qualifierType = fields[3] || 'Data';

        if (!qualifierPipeline || !qualifier || !qualifierOperator) continue;

        // Parse pipeline string like "B2B - MQL" into pipeline type and stage
        const pipelineParts = qualifierPipeline.split(' - ');
        if (pipelineParts.length < 2) continue;

        const pipeline = pipelineParts[0].toLowerCase();
        const stage = pipelineParts[1].toLowerCase();

        // Parse value
        let parsedValue: string | number = qualifierValue;
        if (qualifierValue.endsWith('%')) {
            parsedValue = parseInt(qualifierValue.replace('%', ''), 10);
        } else if (!isNaN(Number(qualifierValue))) {
            parsedValue = Number(qualifierValue);
        }

        qualifiers.push({
            pipeline,
            stage,
            qualifier,
            qualifierOperator,
            qualifierValue: parsedValue,
            qualifierType,
            qualifierActivity: fields[9] || undefined,
            activityCondition: fields[10] || undefined,
            activityValue: fields[11] || undefined
        });
    }

    return qualifiers;
}

/**
 * Get all qualifier definitions (for seeding)
 */
export function getAllQualifierDefinitions(): QualifierDefinition[] {
    return parseObjectQualifiersCSV();
}

/**
 * Get pipeline qualifiers grouped by pipeline and stage
 */
export function getQualifiersByPipelineStage(): Map<string, PipelineQualifier[]> {
    const qualifiers = parsePipelineQualifiersCSV();
    const grouped = new Map<string, PipelineQualifier[]>();

    for (const q of qualifiers) {
        const key = `${q.pipeline}_${q.stage}`;
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        grouped.get(key)!.push(q);
    }

    return grouped;
}

// CLI usage for testing
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Parsing qualifier CSVs...');

    const defs = getAllQualifierDefinitions();
    console.log(`Found ${defs.length} qualifier definitions`);

    const pipelineQuals = parsePipelineQualifiersCSV();
    console.log(`Found ${pipelineQuals.length} pipeline qualifier rules`);

    const grouped = getQualifiersByPipelineStage();
    console.log('\nQualifiers by pipeline/stage:');
    for (const [key, quals] of grouped) {
        console.log(`  ${key}: ${quals.length} qualifiers`);
    }
}
