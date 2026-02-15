
import { RecordQuerySchema } from '../src/api/schemas.js';

const validUUID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const invalidUUID = 'account-001';

console.log('Testing RecordQuerySchema...');

const result1 = RecordQuerySchema.safeParse({ account_id: validUUID });
console.log(`Valid UUID: ${result1.success ? 'PASS' : 'FAIL'}`);
if (!result1.success) console.log(result1.error);

const result2 = RecordQuerySchema.safeParse({ account_id: invalidUUID });
console.log(`Invalid UUID: ${!result2.success ? 'PASS' : 'FAIL'}`);
if (result2.success) console.log('Wait, invalid should fail!');
