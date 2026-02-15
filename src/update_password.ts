
import { db, initDb } from './core/db.js';
import { hashPassword } from './modules/auth/password.js';

async function run() {
    initDb();
    const email = 'test_admin@victory.com';
    const password = 'password123';
    
    console.log(`Updating password for ${email}...`);
    const hash = await hashPassword(password);
    
    const result = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?')
        .run(hash, email);
        
    console.log(`Updated ${result.changes} user(s).`);
}

run();
