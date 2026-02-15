import { initDb } from './db.js';
import { createRecord, listRecords } from './records.js';
import { Reader } from '../contracts/Reader.js';
import { randomUUID } from 'crypto';

console.log('--- Testing Records ---');

try {
    // 1. Init DB (ensure tables exist)
    initDb();
    console.log('DB Initialized.');

    // 2. Create Record
    const newRecordId = randomUUID();
    const record = createRecord({
        id: newRecordId,
        type: 'product',
        slug: `test-product-${newRecordId}`,
        name: 'Test Product',
        account_id: 'acc_test_1',
        data: {
            fieldGroups: []
        }
    });
    console.log('Created Record:', record.id, record.slug);

    // 3. List and Project
    const records = listRecords();
    console.log('Total Records:', records.length);
    
    const fetched = records.find(r => r.id === newRecordId);
    if (fetched) {
        console.log('Fetched Record Found.');
        const projected = Reader.project(fetched.data);
        console.log('Projected Data:', projected);
        console.log('PASS');
    } else {
        console.error('FAIL: Created record not found in list.');
    }

} catch (err) {
    console.error('Error:', err);
}
