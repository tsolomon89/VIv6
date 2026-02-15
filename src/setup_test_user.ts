
import { db, initDb } from './core/db.js';
import { hashPassword } from './modules/auth/password.js';
import { randomUUID } from 'crypto';

async function run() {
    initDb();
    
    const email = 'test_admin@victory.com';
    const password = 'password123';
    const hashy = await hashPassword(password);
    const userId = 'usr_test_000000000000000001';
    
    // Check exist
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    
    if (user) {
        console.log('User exists. Updating password...');
        db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hashy, email);
    } else {
        console.log('User does not exist. Creating...');
        db.prepare(`
            INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(userId, email, hashy, 'Test Admin');
    }
    
    // Ensure account link
    // We assume account 'acc_vi_000000000000000001' exists or we need to check accounts table
    const account = db.prepare('SELECT id FROM accounts LIMIT 1').get() as { id: string };
    
    if (account) {
        console.log(`Linking to account ${account.id}...`);
        try {
            db.prepare(`
                INSERT INTO user_accounts (id, user_id, account_id, permission_level, joined_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).run(randomUUID(), userId, account.id, 'admin');
             console.log('Linked.');
        } catch (e: any) {
            if (e.message.includes('UNIQUE')) console.log('Already linked.');
            else console.error('Link failed:', e.message);
        }
    } else {
        console.log('No accounts found. Create an account first via seed.');
    }
    
    console.log('Done.');
}

run();
