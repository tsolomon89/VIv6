/**
 * Seed Field Library
 *
 * This script scans all object_def records, extracts unique fields from their
 * fieldGroups, and creates field_def records for the reusable field library.
 *
 * Each field_def will track which objects use it via `used_by_objects` array.
 *
 * ## Format Notes (IMPORTANT)
 *
 * There are TWO field formats in this system:
 *
 * 1. **Canonical Format** (used in object_def.data after inflateRecord):
 *    - Field groups: `fieldGroupStructs` with `nameFieldGroup`
 *    - Fields: `fieldStructs` with `nameField`, `inputType`
 *    - Values: `propertyStructs: [{ key, value }]`
 *
 * 2. **Seed Format** (used in JSON files and field_def.data):
 *    - Field groups: `fieldGroups` with `name`
 *    - Fields: `fields` with `name`, `type`
 *    - Values: Direct properties (e.g., `required: true`)
 *
 * This script reads CANONICAL format from object_def and writes SEED format to field_def.
 * The UI components (FieldRow, ObjectDefEditor, RecordField) handle both formats.
 */

import { db } from '../core/db.js';
import { SYSTEM_ACCOUNT_ID } from '../core/constants.js';
import { randomUUID } from 'crypto';

interface FieldStruct {
    idRefFieldRecord: string;
    nameField: string;
    inputType: string;
    displayPosition: number;
    isSelectMany: boolean;
    isSystem: boolean;
    propertyStructs: any[];
    required?: boolean;
    ref_target?: string;
    dimension?: string;
    options?: string[];
    summary?: string;
}

interface FieldGroupStruct {
    idRefFieldGroupRecord: string;
    nameFieldGroup: string;
    fieldStructs: FieldStruct[];
}

interface ObjectDefData {
    category?: string;
    icon?: string;
    is_system?: boolean;
    fieldGroups?: FieldGroupStruct[];
}

interface FieldTemplate {
    name: string;
    type: string;
    required?: boolean;
    ref_target?: string;
    dimension?: string;
    options?: string[];
    summary?: string;
    used_by_objects: string[]; // Array of object_def slugs
}

export function seedFieldLibrary() {
    console.log('📚 Seeding Field Library...');

    // 1. Fetch all object_def records
    const objectDefs = db.prepare(`
        SELECT id, slug, name, data FROM records
        WHERE type = 'object_def' AND account_id = ?
    `).all(SYSTEM_ACCOUNT_ID) as { id: string; slug: string; name: string; data: string }[];

    // 2. Extract unique fields and track which objects use them
    const fieldMap = new Map<string, FieldTemplate>();

    for (const objDef of objectDefs) {
        let data: ObjectDefData;
        try {
            data = JSON.parse(objDef.data);
        } catch {
            continue;
        }

        if (!data.fieldGroups || !Array.isArray(data.fieldGroups)) continue;

        for (const group of data.fieldGroups) {
            if (!group.fieldStructs) continue;

            for (const field of group.fieldStructs) {
                const fieldName = field.nameField;
                if (!fieldName) continue;

                // Create a normalized key for the field (lowercase name)
                const fieldKey = fieldName.toLowerCase().replace(/\s+/g, '_');

                if (fieldMap.has(fieldKey)) {
                    // Add this object to the existing field's used_by list
                    const existing = fieldMap.get(fieldKey)!;
                    if (!existing.used_by_objects.includes(objDef.slug)) {
                        existing.used_by_objects.push(objDef.slug);
                    }
                } else {
                    // Create new field template
                    fieldMap.set(fieldKey, {
                        name: fieldName,
                        type: mapInputTypeToSeedType(field.inputType),
                        required: field.required,
                        ref_target: field.ref_target,
                        dimension: field.dimension,
                        options: field.options,
                        summary: field.summary,
                        used_by_objects: [objDef.slug]
                    });
                }
            }
        }
    }

    // 3. Insert or update field_def records
    const upsertField = db.prepare(`
        INSERT INTO records (id, account_id, type, slug, name, summary, data, created_at, updated_at)
        VALUES (@id, @account_id, 'field_def', @slug, @name, @summary, @data, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(account_id, slug) DO UPDATE SET
            name = excluded.name,
            summary = excluded.summary,
            data = excluded.data,
            updated_at = CURRENT_TIMESTAMP
    `);

    const findExisting = db.prepare(`
        SELECT id FROM records WHERE type = 'field_def' AND slug = ? AND account_id = ?
    `);

    let created = 0;
    let updated = 0;

    db.transaction(() => {
        for (const [fieldKey, template] of fieldMap) {
            // Skip system/internal fields
            if (template.name === 'Name' || template.name === 'Slug') continue;

            const slug = `field_${fieldKey}`;
            const existing = findExisting.get(slug, SYSTEM_ACCOUNT_ID) as { id: string } | undefined;

            const fieldData = {
                type: template.type,
                required: template.required || false,
                ref_target: template.ref_target,
                dimension: template.dimension,
                options: template.options,
                summary: template.summary,
                used_by_objects: template.used_by_objects
            };

            // Clean up undefined values
            Object.keys(fieldData).forEach(key => {
                if ((fieldData as any)[key] === undefined) {
                    delete (fieldData as any)[key];
                }
            });

            upsertField.run({
                id: existing?.id || randomUUID(),
                account_id: SYSTEM_ACCOUNT_ID,
                slug,
                name: template.name,
                summary: template.summary || `${template.name} field (${template.type})`,
                data: JSON.stringify(fieldData)
            });

            if (existing) {
                updated++;
            } else {
                created++;
            }
        }
    })();

    console.log(`✅ Field Library: ${created} created, ${updated} updated (${fieldMap.size} total unique fields)`);
}

/**
 * Map internal inputType to seed-friendly type name
 */
function mapInputTypeToSeedType(inputType: string): string {
    const typeMap: Record<string, string> = {
        'text': 'text',
        'textarea': 'textarea',
        'number': 'number',
        'currency': 'currency',
        'date': 'date',
        'boolean': 'boolean',
        'select': 'select',
        'multiselect': 'multiselect',
        'Record': 'ref',
        'url': 'url',
        'email': 'email',
        'phone': 'phone'
    };
    return typeMap[inputType] || inputType;
}

// CLI entry point
import { fileURLToPath } from 'url';
import { initDb } from '../core/db.js';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        initDb();
        seedFieldLibrary();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
