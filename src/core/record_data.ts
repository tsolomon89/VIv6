import type { Field, FieldGroup, FieldInputType, RecordData, RecordValue } from './types.js';

export type FieldCardinality = 'single' | 'multi';

export interface FieldInput {
  name: string;
  inputType: FieldInputType;
  values?: unknown[];
  value?: unknown;
  cardinality?: FieldCardinality | 'one' | 'many';
  isSelectMany?: boolean;
  options?: string[];
  required?: boolean;
}

export interface FieldGroupInput {
  name: string;
  fields: FieldInput[];
}

function isRecordValue(value: unknown): value is RecordValue {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function toRecordValue(value: unknown): RecordValue {
  if (isRecordValue(value)) {
    return value;
  }
  return value == null ? null : String(value);
}

export function normalizeFieldValues(input: FieldInput): RecordValue[] {
  if (Array.isArray(input.values)) {
    return input.values.map(toRecordValue);
  }
  if (Array.isArray(input.value)) {
    return input.value.map(toRecordValue);
  }
  if (input.value !== undefined) {
    return [toRecordValue(input.value)];
  }
  return [];
}

export function normalizeField(input: FieldInput): Field {
  const cardinality: FieldCardinality =
    input.cardinality === 'single' || input.cardinality === 'one'
      ? 'single'
      : input.cardinality === 'multi' || input.cardinality === 'many'
        ? 'multi'
        : input.isSelectMany || input.inputType === 'multiselect'
          ? 'multi'
          : 'single';
  const values = normalizeFieldValues(input);
  assertCardinality(values, cardinality, input.name);

  return {
    name: input.name,
    inputType: input.inputType,
    values,
    cardinality,
    options: input.options,
    required: input.required,
  };
}

function mergeDefaultGroup(fieldGroups: FieldGroup[], simpleData: Record<string, unknown>): void {
  if (!simpleData || Object.keys(simpleData).length === 0) {
    return;
  }

  const defaultFields: Field[] = Object.entries(simpleData).map(([name, value]) => ({
    name,
    inputType: 'text',
    values: Array.isArray(value) ? value.map(toRecordValue) : [toRecordValue(value)],
  }));

  const existingDefault = fieldGroups.find((group) => group.name === 'Default');
  if (existingDefault) {
    existingDefault.fields.push(...defaultFields);
    return;
  }

  fieldGroups.push({
    name: 'Default',
    fields: defaultFields,
  });
}

export function normalizeRecordData(
  simpleData?: Record<string, unknown>,
  explicitFieldGroups?: FieldGroupInput[]
): RecordData {
  const fieldGroups: FieldGroup[] = (explicitFieldGroups || []).map((group) => ({
    name: group.name,
    fields: (group.fields || []).map(normalizeField),
  }));

  if (simpleData) {
    mergeDefaultGroup(fieldGroups, simpleData);
  }

  return { fieldGroups };
}

export function normalizeRecordDataPayload(input: unknown): RecordData {
  if (!input || typeof input !== 'object') {
    return { fieldGroups: [] };
  }

  const raw = input as Record<string, unknown>;
  const rawFieldGroups = raw.fieldGroups;

  const normalized = Array.isArray(rawFieldGroups)
    ? normalizeRecordData(undefined, rawFieldGroups as FieldGroupInput[])
    : normalizeRecordData(raw);

  const { fieldGroups: _ignored, ...rest } = raw;
  return {
    ...rest,
    fieldGroups: normalized.fieldGroups,
  };
}

export function isCardinalityValid(values: unknown[], cardinality: FieldCardinality): boolean {
  if (cardinality === 'multi') {
    return true;
  }
  return values.length <= 1;
}

export function assertCardinality(
  values: unknown[],
  cardinality: FieldCardinality,
  fieldName: string
): void {
  if (!isCardinalityValid(values, cardinality)) {
    throw new Error(
      `Field "${fieldName}" exceeds cardinality=${cardinality} with ${values.length} values`
    );
  }
}
