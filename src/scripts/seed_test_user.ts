import { addUserToAccount } from '../modules/identity/services.js';
import { db, initDb } from '../core/db.js';
import bcrypt from 'bcrypt';

const VICTORY_ACCOUNT_ID = 'acc_vi_000000000000000001';
const TEST_USER_ID = 'usr_test_000000000000000001';

// Generate proper bcrypt hash for test password
// Password: 'test-password-123' (for local testing only)
const TEST_PASSWORD_HASH = bcrypt.hashSync('test-password-123', 10);

async function main() {
    console.log('Initializing DB...');
    initDb();

    console.log('Seeding Test User...');
    try {
        // Check if user exists
        const exists = db.prepare('SELECT id FROM user_accounts WHERE user_id = ? AND account_id = ?').get(TEST_USER_ID, VICTORY_ACCOUNT_ID);
        
        if (exists) {
            console.log('Test user already exists.');
        } else {
            // 1. Create User Record
            console.log('Creating User Record...');
            const insertUser = db.prepare(`
                INSERT INTO users (id, email, name, password_hash, created_at, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT(id) DO NOTHING
            `);
            
            insertUser.run(TEST_USER_ID, 'test_admin@victory.com', 'Test Admin', TEST_PASSWORD_HASH);

            // 2. Add user as admin
            // Note: addUserToAccount takes (userId, accountId, role)
            // We want 'admin' role to test Decision Maker routing (which maps to role_owner/admin?)
            // Let's seed 'admin' and 'member' to test routing.
            
            try {
                addUserToAccount(TEST_USER_ID, VICTORY_ACCOUNT_ID, 'admin');
                console.log(`User ${TEST_USER_ID} added as admin.`);
            } catch (err: any) {
                if (err.message.includes('UNIQUE constraint')) {
                     console.log('User already in account (admin).');
                } else throw err;
            }

            // Create Member User
            const MEMBER_ID = 'usr_member_000000000000000001';
            insertUser.run(MEMBER_ID, 'test_member@victory.com', 'Test Member', TEST_PASSWORD_HASH);
            
            try {
                addUserToAccount(MEMBER_ID, VICTORY_ACCOUNT_ID, 'member');
                console.log(`User ${MEMBER_ID} added as member.`);
            } catch (err: any) {
                 if (err.message.includes('UNIQUE constraint')) {
                     console.log('User already in account (member).');
                } else throw err;
            }
        }
        
    } catch (e) {
        console.error('Error seeding user:', e);
    }
}

main();
