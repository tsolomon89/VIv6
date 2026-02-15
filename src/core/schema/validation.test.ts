import { describe, it, expect } from 'vitest';
import { normalizeEntityData, validateEntityData } from './validation.js';

describe('Schema Validation', () => {
  
  describe('normalizeEntityData', () => {
    it('should convert simple key-value data to Default field group', () => {
      const input = {
        title: 'Hello World',
        count: 42,
        isActive: true
      };
      
      const result = normalizeEntityData(input);
      
      expect(result.fieldGroups).toHaveLength(1);
      expect(result.fieldGroups[0].name).toBe('Default');
      expect(result.fieldGroups[0].fields).toHaveLength(3);
      expect(result.fieldGroups[0].fields[0]).toEqual({
        name: 'title',
        inputType: 'text',
        value: 'Hello World'
      });
    });

    it('should respect explicit field groups', () => {
      const explicitGroups = [{
        name: 'SEO',
        fields: [{ name: 'meta_title', inputType: 'text' as const, value: 'SEO Title' }]
      }];
      
      const result = normalizeEntityData(undefined, explicitGroups);
      
      expect(result.fieldGroups).toHaveLength(1);
      expect(result.fieldGroups[0].name).toBe('SEO');
      expect(result.fieldGroups[0].fields[0].value).toBe('SEO Title');
    });

    it('should merge simple data into existing Default group if present', () => {
      const simple = { extra: 'value' };
      const groups = [{
        name: 'Default',
        fields: [{ name: 'original', inputType: 'text' as const, value: 'orig' }]
      }];
      
      const result = normalizeEntityData(simple, groups);
      
      expect(result.fieldGroups).toHaveLength(1);
      expect(result.fieldGroups[0].name).toBe('Default');
      expect(result.fieldGroups[0].fields).toHaveLength(2);
      expect(result.fieldGroups[0].fields[1].name).toBe('extra');
    });
  });

  describe('validateEntityData', () => {
    it('should pass valid empty object', () => {
      const valid = { fieldGroups: [] };
      expect(() => validateEntityData(valid)).not.toThrow();
    });

    it('should pass valid deep structure', () => {
      const valid = {
        fieldGroups: [{
          name: 'Test',
          fields: [{ name: 'f1', inputType: 'text', value: 'v1' }]
        }]
      };
      expect(() => validateEntityData(valid)).not.toThrow();
    });

    it('should throw on invalid structure', () => {
      const invalid = { fieldGroups: [{ name: 'Test' }] }; // Missing fields array
      expect(() => validateEntityData(invalid)).toThrow();
    });
  });

});
