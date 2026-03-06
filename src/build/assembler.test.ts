import { describe, it, expect, vi } from 'vitest';
import { assemblePageContext } from './assembler.js';
import { Reader } from '../contracts/Reader.js';
import { DataRecord } from '../core/types.js';
import * as recordsModule from '../core/records.js';
import * as relationshipsModule from '../core/relationships.js';

// Mock dependencies
vi.mock('../core/records');
vi.mock('../core/relationships');

describe('Build: Assembler', () => {
    
    it('should flatten record data field groups using Reader.project', () => {
        const data: any = {
            fieldGroups: [
                {
                    name: 'SEO',
                    fields: [
                        { name: 'Meta Title', inputType: 'text', propertyStructs: [{ valueProperty: 'My Title' }] },
                        { name: 'Meta Description', inputType: 'textarea', propertyStructs: [{ valueProperty: 'My Desc' }] }
                    ]
                },
                {
                    name: 'Details',
                    fields: [
                        { name: 'price', inputType: 'number', propertyStructs: [{ valueProperty: 100 }] }
                    ]
                }
            ]
        };
        
        // Mock RecordStruct structure for Reader.project if needed, or just pass as is if it supports partials...
        // Reader.project expects UniversalRecordData.
        // Let's rely on Reader behavior. If it fails due to structure mismatch, we update the test data.
        // Based on Reader.ts, it expects `RecordStruct` which has `objectStruct` -> `fieldGroupStructs` -> `fieldStructs` -> `propertyStructs`.
        // The data above is "FrontendRecordData" format (from older flattenRecordData test).
        // Reader.project transforms RecordStruct -> Flat.
        // So we need to mock a RecordStruct here.
        
        const recordStruct: any = {
            idRecord: 'r1',
            objectStruct: {
                fieldGroupStructs: [
                    {
                        nameFieldGroup: 'SEO',
                        fieldStructs: [
                            { nameField: 'Meta Title', propertyStructs: [{ valueProperty: 'My Title' }] },
                        ]
                    }
                ]
            }
        };

        const flat = Reader.project(recordStruct);
        expect(flat['Meta Title']).toBe('My Title');
    });

    it('should assemble page context with relationships', () => {
        const mockRecord: DataRecord = {
            id: 'e1',
            type: 'product',
            slug: 'product-1',
            name: 'Product 1',
            description: 'Desc',
            created_at: '',
            updated_at: '',
            account_id: 'acc-1',
            data: { fieldGroups: [] }
        };

        const mockRelatedRecord: DataRecord = {
            id: 'e2',
            type: 'feature',
            slug: 'feature-1',
            name: 'Feature 1',
            created_at: '',
            updated_at: '',
            account_id: 'acc-1',
            data: { fieldGroups: [] }
        };

        // Mock return values
        vi.spyOn(relationshipsModule, 'getRelationshipsFrom').mockReturnValue([
            { id: 'r1', from_record_id: 'e1', to_record_id: 'e2', relationship_type: 'has_feature', data: {}, created_at: '' }
        ] as any);
        
        vi.spyOn(recordsModule, 'getRecord').mockReturnValue(mockRelatedRecord);

        const context = assemblePageContext(mockRecord);

        expect(context.record.id).toBe('e1');
        expect(context.related['has_feature']).toHaveLength(1);
        expect(context.related['has_feature'][0].slug).toBe('feature-1');
        expect(context.meta.title).toBe('Product 1'); // Fallback to name
    });
});
