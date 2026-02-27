import { describe, it, expect } from 'vitest';
import { normalizeRecordData, validateRecordData } from './validation.js';

describe('Schema Validation', () => {
  
  describe('normalizeRecordData', () => {
    it('should convert simple key-value data to Default field group', () => {
      const input = {
        title: 'Hello World',
        count: 42,
        isActive: true
      };
      
      const result = normalizeRecordData(input);
      
      expect(result.fieldGroups).toHaveLength(1);
      expect(result.fieldGroups[0].name).toBe('Default');
      expect(result.fieldGroups[0].fields).toHaveLength(3);
      expect(result.fieldGroups[0].fields[0]).toMatchObject({
        name: 'title',
        inputType: 'text',
        values: ['Hello World']
      });
    });

    it('should respect explicit field groups', () => {
      const explicitGroups = [{
        name: 'SEO',
        fields: [{ name: 'meta_title', inputType: 'text' as const, values: ['SEO Title'] }]
      }];
      
      const result = normalizeRecordData(undefined, explicitGroups);
      
      expect(result.fieldGroups).toHaveLength(1);
      expect(result.fieldGroups[0].name).toBe('SEO');
      expect(result.fieldGroups[0].fields[0].values[0]).toBe('SEO Title');
    });

    it('should merge simple data into existing Default group if present', () => {
      const simple = { extra: 'value' };
      const groups = [{
        name: 'Default',
        fields: [{ name: 'original', inputType: 'text' as const, values: ['orig'] }]
      }];
      
      const result = normalizeRecordData(simple, groups);
      
      expect(result.fieldGroups).toHaveLength(1);
      expect(result.fieldGroups[0].name).toBe('Default');
      expect(result.fieldGroups[0].fields).toHaveLength(2);
      expect(result.fieldGroups[0].fields[1].name).toBe('extra');
    });
  });

  describe('validateRecordData', () => {
    it('should pass valid empty object', () => {
      const valid = { fieldGroups: [] };
      expect(() => validateRecordData(valid)).not.toThrow();
    });

    it('should pass valid deep structure', () => {
      const valid = {
        fieldGroups: [{
          name: 'Test',
          fields: [{ name: 'f1', inputType: 'text', values: ['v1'] }]
        }]
      };
      expect(() => validateRecordData(valid)).not.toThrow();
    });

    it('should throw on invalid structure', () => {
      const invalid = { fieldGroups: [{ name: 'Test' }] }; // Missing fields array
      expect(() => validateRecordData(invalid)).toThrow();
    });
  });

});
