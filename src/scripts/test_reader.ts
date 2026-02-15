import { Reader } from '../contracts/Reader';
import { RecordStruct } from '../core/types.js';

// Mock Data
const mockRecordStruct: RecordStruct = {
    idRecord: 'rec_123',
    account_id: 'acc_1',
    objectStruct: {
        idRefObjectRecord: 'obj_1',
        typeObject: 'Product',
        fieldGroupStructs: [
            {
                idRefFieldGroupRecord: 'fg_1',
                nameFieldGroup: 'General',
                fieldStructs: [
                    {
                        idRefFieldRecord: 'f_1',
                        nameField: 'title',
                        inputType: 'text',
                        displayPosition: 0,
                        isSelectMany: false,
                        isSystem: false,
                        propertyStructs: [
                            { valueProperty: 'Super Widget', recordSnapshotStruct: undefined }
                        ]
                    },
                    {
                        idRefFieldRecord: 'f_2',
                        nameField: 'tags',
                        inputType: 'text',
                        displayPosition: 1,
                        isSelectMany: true,
                        isSystem: false,
                        propertyStructs: [
                            { valueProperty: 'new', recordSnapshotStruct: undefined },
                            { valueProperty: 'sale', recordSnapshotStruct: undefined }
                        ]
                    }
                ]
            }
        ]
    }
};

const flat = Reader.project(mockRecordStruct);
console.log('Projected Output:', JSON.stringify(flat, null, 2));

const expected = {
    title: 'Super Widget',
    tags: ['new', 'sale']
};

if (JSON.stringify(flat) === JSON.stringify(expected)) {
    console.log('PASS');
} else {
    console.error('FAIL');
}
