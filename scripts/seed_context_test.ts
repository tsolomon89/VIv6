
import { db } from '../src/core/db.js';

console.log('Seeding Contextual Tenancy Test Data...');

// 1. Create User
const USER_ID = '11111111-1111-1111-1111-111111111111'; // Valid UUID for User too, just in case
db.prepare('INSERT OR REPLACE INTO users (id, email, name) VALUES (?, ?, ?)').run(USER_ID, 'test@example.com', 'Test User');

// 2. Create Accounts (Must be UUIDs)
const ACC_VALID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const ACC_INVALID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

db.prepare('INSERT OR REPLACE INTO accounts (id, slug, name) VALUES (?, ?, ?)').run(ACC_VALID, 'valid-acc', 'Valid Account');
db.prepare('INSERT OR REPLACE INTO accounts (id, slug, name) VALUES (?, ?, ?)').run(ACC_INVALID, 'invalid-acc', 'Forbidden Account');

// 3. Link User to Valid Account
db.prepare('INSERT OR REPLACE INTO user_accounts (id, user_id, account_id, permission_level, is_active) VALUES (?, ?, ?, ?, ?)')
  .run('link-uuid-001', USER_ID, ACC_VALID, 'owner', 1);

console.log('✅ Seeding Complete.');
console.log(`User: ${USER_ID}`);
console.log(`Valid Account: ${ACC_VALID}`);
console.log(`Forbidden Account: ${ACC_INVALID}`);
