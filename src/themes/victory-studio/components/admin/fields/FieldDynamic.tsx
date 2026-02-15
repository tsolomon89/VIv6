import React from 'react';
import { FieldStruct, PropertyStruct, FieldInputType } from '../../../../../core/types';
import { FieldText } from './FieldText';
import { FieldNumber } from './FieldNumber';
import { FieldBoolean } from './FieldBoolean';
import { FieldCheckboxGroup } from './FieldCheckboxGroup';
import { FieldRadioGroup } from './FieldRadioGroup';
import { FieldDateTime } from './FieldDateTime';
import { FieldImage } from './FieldImage';
import { FieldRelation } from './FieldRelation';

interface Option {
  value: string;
  label: string;
}

interface FieldDynamicProps {
  field: FieldStruct;
  value: PropertyStruct[];
  onChange: (value: PropertyStruct[]) => void;
  /** Explicit options override. If not provided, options are extracted from field.propertyStructs */
  options?: Option[];
  error?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

/**
 * Extract options from a FieldStruct's propertyStructs.
 * This allows predefined options to be stored as part of the field definition.
 * Each PropertyStruct with a string valueProperty becomes an option.
 */
function extractOptionsFromField(field: FieldStruct): Option[] {
  if (!field.propertyStructs || field.propertyStructs.length === 0) {
    return [];
  }

  return field.propertyStructs
    .filter(p => typeof p.valueProperty === 'string' && p.valueProperty)
    .map(p => ({
      value: String(p.valueProperty),
      label: String(p.valueProperty) // Use value as label, could enhance with metadata
    }));
}

/**
 * Dynamic field dispatcher that renders the appropriate field component
 * based on the field's inputType and isSelectMany properties.
 */
export function FieldDynamic({
  field,
  value,
  onChange,
  options: explicitOptions,
  error,
  onImageUpload
}: FieldDynamicProps) {
  // Use explicit options if provided, otherwise extract from field definition
  const options = explicitOptions ?? extractOptionsFromField(field);
  // Helper to get first scalar value from properties
  const getScalarValue = (): string | number | boolean | null => {
    if (value.length === 0) return null;
    return value[0].valueProperty;
  };

  // Helper to set a single scalar value
  const setScalarValue = (val: string | number | boolean | null) => {
    onChange([{ valueProperty: val }]);
  };

  // Helper to get all string values (for multi-select)
  const getStringValues = (): string[] => {
    return value
      .map(p => p.valueProperty)
      .filter((v): v is string => typeof v === 'string');
  };

  // Helper to set multiple string values
  const setStringValues = (vals: string[]) => {
    onChange(vals.map(v => ({ valueProperty: v })));
  };

  // Render based on inputType
  switch (field.inputType) {
    case 'text':
      return (
        <FieldText
          field={field}
          value={String(getScalarValue() || '')}
          onChange={(v) => setScalarValue(v)}
          error={error}
        />
      );

    case 'textarea':
      return (
        <FieldText
          field={field}
          value={String(getScalarValue() || '')}
          onChange={(v) => setScalarValue(v)}
          error={error}
          multiline
        />
      );

    case 'number':
    case 'currency':
      const numValue = getScalarValue();
      return (
        <FieldNumber
          field={field}
          value={typeof numValue === 'number' ? numValue : null}
          onChange={(v) => setScalarValue(v)}
          error={error}
          step={field.inputType === 'currency' ? 0.01 : 1}
        />
      );

    case 'boolean':
      return (
        <FieldBoolean
          field={field}
          value={Boolean(getScalarValue())}
          onChange={(v) => setScalarValue(v)}
          error={error}
        />
      );

    case 'select':
      if (field.isSelectMany) {
        return (
          <FieldCheckboxGroup
            field={field}
            options={options}
            selectedValues={getStringValues()}
            onChange={setStringValues}
            error={error}
          />
        );
      } else {
        return (
          <FieldRadioGroup
            field={field}
            options={options}
            selectedValue={String(getScalarValue() || '')}
            onChange={(v) => setScalarValue(v)}
            error={error}
          />
        );
      }

    case 'multiselect':
      return (
        <FieldCheckboxGroup
          field={field}
          options={options}
          selectedValues={getStringValues()}
          onChange={setStringValues}
          error={error}
        />
      );

    case 'date':
      return (
        <FieldDateTime
          field={field}
          value={String(getScalarValue() || '')}
          onChange={(v) => setScalarValue(v)}
          error={error}
          includeTime={false}
        />
      );

    case 'image':
    case 'url':
      if (field.inputType === 'image') {
        return (
          <FieldImage
            field={field}
            value={String(getScalarValue() || '')}
            onChange={(v) => setScalarValue(v)}
            onUpload={onImageUpload}
            error={error}
          />
        );
      }
      // URL field falls through to text
      return (
        <FieldText
          field={field}
          value={String(getScalarValue() || '')}
          onChange={(v) => setScalarValue(v)}
          error={error}
          placeholder="https://..."
        />
      );

    case 'ref':
    case 'Record':
      return (
        <FieldRelation
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      );

    default:
      // Fallback to text input for unknown types
      return (
        <FieldText
          field={field}
          value={String(getScalarValue() || '')}
          onChange={(v) => setScalarValue(v)}
          error={error}
        />
      );
  }
}
