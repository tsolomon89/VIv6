import { describe, it, expect } from 'vitest';
import type { EntityData, FieldGroupStruct, FieldStruct, PropertyStruct } from '../../src/core/types.js';

/**
 * Extract values from EntityData - mirror of the function in DynamicSchemaForm
 */
function extractValuesFromEntityData(
  entityData: EntityData
): Record<string, PropertyStruct[]> {
  const values: Record<string, PropertyStruct[]> = {};

  if (!entityData.fieldGroups) {
    return values;
  }

  for (const group of entityData.fieldGroups) {
    for (const field of group.fieldStructs) {
      values[field.idRefFieldRecord] = field.propertyStructs || [];
    }
  }

  return values;
}

/**
 * Merge values back into EntityData - mirror of the function in DynamicSchemaForm
 */
function mergeValuesToEntityData(
  entityData: EntityData,
  values: Record<string, PropertyStruct[]>
): EntityData {
  if (!entityData.fieldGroups) {
    return entityData;
  }

  const updatedFieldGroups = entityData.fieldGroups.map(group => ({
    ...group,
    fieldStructs: group.fieldStructs.map(field => ({
      ...field,
      propertyStructs: values[field.idRefFieldRecord] || field.propertyStructs
    }))
  }));

  return {
    ...entityData,
    fieldGroups: updatedFieldGroups
  };
}

/**
 * Extract options from field's propertyStructs - mirror of function in FieldDynamic
 */
function extractOptionsFromField(field: FieldStruct): { value: string; label: string }[] {
  if (!field.propertyStructs || field.propertyStructs.length === 0) {
    return [];
  }

  return field.propertyStructs
    .filter(p => typeof p.valueProperty === 'string' && p.valueProperty)
    .map(p => ({
      value: String(p.valueProperty),
      label: String(p.valueProperty)
    }));
}

describe('Form Helper Functions', () => {
  // Test fixtures
  const createTestField = (overrides: Partial<FieldStruct> = {}): FieldStruct => ({
    idRefFieldRecord: 'field-1',
    nameField: 'Test Field',
    inputType: 'text',
    displayPosition: 0,
    isSelectMany: false,
    isSystem: false,
    propertyStructs: [],
    ...overrides
  });

  const createTestFieldGroup = (
    fields: FieldStruct[],
    overrides: Partial<FieldGroupStruct> = {}
  ): FieldGroupStruct => ({
    idRefFieldGroupRecord: 'group-1',
    nameFieldGroup: 'Test Group',
    fieldStructs: fields,
    ...overrides
  });

  describe('extractValuesFromEntityData', () => {
    it('should extract values from nested field groups', () => {
      const entityData: EntityData = {
        fieldGroups: [
          createTestFieldGroup([
            createTestField({
              idRefFieldRecord: 'field-1',
              propertyStructs: [{ valueProperty: 'value1' }]
            }),
            createTestField({
              idRefFieldRecord: 'field-2',
              propertyStructs: [{ valueProperty: 'value2' }]
            })
          ])
        ]
      };

      const values = extractValuesFromEntityData(entityData);

      expect(values['field-1']).toEqual([{ valueProperty: 'value1' }]);
      expect(values['field-2']).toEqual([{ valueProperty: 'value2' }]);
    });

    it('should handle multiple field groups', () => {
      const entityData: EntityData = {
        fieldGroups: [
          createTestFieldGroup([
            createTestField({ idRefFieldRecord: 'field-1', propertyStructs: [{ valueProperty: 'a' }] })
          ], { idRefFieldGroupRecord: 'group-1' }),
          createTestFieldGroup([
            createTestField({ idRefFieldRecord: 'field-2', propertyStructs: [{ valueProperty: 'b' }] })
          ], { idRefFieldGroupRecord: 'group-2' })
        ]
      };

      const values = extractValuesFromEntityData(entityData);

      expect(Object.keys(values)).toHaveLength(2);
      expect(values['field-1']).toEqual([{ valueProperty: 'a' }]);
      expect(values['field-2']).toEqual([{ valueProperty: 'b' }]);
    });

    it('should return empty object for missing fieldGroups', () => {
      const entityData: EntityData = {} as EntityData;
      expect(extractValuesFromEntityData(entityData)).toEqual({});
    });

    it('should handle empty propertyStructs', () => {
      const entityData: EntityData = {
        fieldGroups: [
          createTestFieldGroup([
            createTestField({ idRefFieldRecord: 'field-1', propertyStructs: undefined as any })
          ])
        ]
      };

      const values = extractValuesFromEntityData(entityData);
      expect(values['field-1']).toEqual([]);
    });
  });

  describe('mergeValuesToEntityData', () => {
    it('should merge updated values back into entity data', () => {
      const originalData: EntityData = {
        fieldGroups: [
          createTestFieldGroup([
            createTestField({
              idRefFieldRecord: 'field-1',
              propertyStructs: [{ valueProperty: 'original' }]
            })
          ])
        ]
      };

      const newValues: Record<string, PropertyStruct[]> = {
        'field-1': [{ valueProperty: 'updated' }]
      };

      const result = mergeValuesToEntityData(originalData, newValues);

      expect(result.fieldGroups[0].fieldStructs[0].propertyStructs).toEqual([
        { valueProperty: 'updated' }
      ]);
    });

    it('should preserve other entity data properties', () => {
      const originalData: EntityData = {
        fieldGroups: [createTestFieldGroup([createTestField()])],
        customProp: 'preserved'
      };

      const result = mergeValuesToEntityData(originalData, {});

      expect(result.customProp).toBe('preserved');
    });

    it('should not modify original data', () => {
      const originalData: EntityData = {
        fieldGroups: [
          createTestFieldGroup([
            createTestField({
              idRefFieldRecord: 'field-1',
              propertyStructs: [{ valueProperty: 'original' }]
            })
          ])
        ]
      };

      mergeValuesToEntityData(originalData, {
        'field-1': [{ valueProperty: 'new' }]
      });

      expect(originalData.fieldGroups[0].fieldStructs[0].propertyStructs).toEqual([
        { valueProperty: 'original' }
      ]);
    });

    it('should handle missing fieldGroups', () => {
      const originalData: EntityData = {} as EntityData;
      const result = mergeValuesToEntityData(originalData, {});
      expect(result).toEqual({});
    });

    it('should fall back to original propertyStructs if no new value', () => {
      const originalData: EntityData = {
        fieldGroups: [
          createTestFieldGroup([
            createTestField({
              idRefFieldRecord: 'field-1',
              propertyStructs: [{ valueProperty: 'original' }]
            })
          ])
        ]
      };

      const result = mergeValuesToEntityData(originalData, {
        'other-field': [{ valueProperty: 'new' }]
      });

      expect(result.fieldGroups[0].fieldStructs[0].propertyStructs).toEqual([
        { valueProperty: 'original' }
      ]);
    });
  });

  describe('extractOptionsFromField', () => {
    it('should extract string values as options', () => {
      const field = createTestField({
        propertyStructs: [
          { valueProperty: 'option1' },
          { valueProperty: 'option2' },
          { valueProperty: 'option3' }
        ]
      });

      const options = extractOptionsFromField(field);

      expect(options).toHaveLength(3);
      expect(options[0]).toEqual({ value: 'option1', label: 'option1' });
      expect(options[1]).toEqual({ value: 'option2', label: 'option2' });
    });

    it('should filter out non-string values', () => {
      const field = createTestField({
        propertyStructs: [
          { valueProperty: 'valid' },
          { valueProperty: 123 },
          { valueProperty: true },
          { valueProperty: null }
        ]
      });

      const options = extractOptionsFromField(field);

      expect(options).toHaveLength(1);
      expect(options[0].value).toBe('valid');
    });

    it('should filter out empty strings', () => {
      const field = createTestField({
        propertyStructs: [
          { valueProperty: '' },
          { valueProperty: 'valid' }
        ]
      });

      const options = extractOptionsFromField(field);

      expect(options).toHaveLength(1);
    });

    it('should return empty array for missing propertyStructs', () => {
      const field = createTestField({ propertyStructs: undefined as any });
      expect(extractOptionsFromField(field)).toEqual([]);
    });

    it('should return empty array for empty propertyStructs', () => {
      const field = createTestField({ propertyStructs: [] });
      expect(extractOptionsFromField(field)).toEqual([]);
    });
  });
});

describe('FieldStruct Value Helpers', () => {
  describe('scalar value operations', () => {
    it('should get first scalar value from properties', () => {
      const getScalarValue = (value: PropertyStruct[]): string | number | boolean | null => {
        if (value.length === 0) return null;
        return value[0].valueProperty;
      };

      expect(getScalarValue([])).toBeNull();
      expect(getScalarValue([{ valueProperty: 'test' }])).toBe('test');
      expect(getScalarValue([{ valueProperty: 42 }])).toBe(42);
      expect(getScalarValue([{ valueProperty: true }])).toBe(true);
    });

    it('should get all string values for multiselect', () => {
      const getStringValues = (value: PropertyStruct[]): string[] => {
        return value
          .map(p => p.valueProperty)
          .filter((v): v is string => typeof v === 'string');
      };

      const props: PropertyStruct[] = [
        { valueProperty: 'a' },
        { valueProperty: 'b' },
        { valueProperty: 123 }, // filtered out
        { valueProperty: 'c' }
      ];

      expect(getStringValues(props)).toEqual(['a', 'b', 'c']);
    });

    it('should set scalar value as single property', () => {
      const setScalarValue = (val: string | number | boolean | null): PropertyStruct[] => {
        return [{ valueProperty: val }];
      };

      expect(setScalarValue('test')).toEqual([{ valueProperty: 'test' }]);
      expect(setScalarValue(null)).toEqual([{ valueProperty: null }]);
    });

    it('should set multiple string values', () => {
      const setStringValues = (vals: string[]): PropertyStruct[] => {
        return vals.map(v => ({ valueProperty: v }));
      };

      expect(setStringValues(['a', 'b'])).toEqual([
        { valueProperty: 'a' },
        { valueProperty: 'b' }
      ]);
    });
  });
});
