
import { db } from '../src/core/db.js';
import { randomUUID } from 'crypto';

function migrate() {
  console.log('--- START: Identity Flattening Migration ---');

  // 1. Add Columns to Contacts if not exist
  try {
    db.prepare("ALTER TABLE contacts ADD COLUMN password_hash TEXT").run();
    console.log('[+] Added password_hash to contacts');
  } catch (e: any) {
    if (!e.message.includes('duplicate column')) console.error(e.message);
  }

  try {
    db.prepare("ALTER TABLE contacts ADD COLUMN avatar_url TEXT").run();
    console.log('[+] Added avatar_url to contacts');
  } catch (e: any) {
    if (!e.message.includes('duplicate column')) console.error(e.message);
  }

    // 2. Schema Repair for Opportunities (If needed)
    try {
        const oppInfo = db.prepare("PRAGMA table_info(opportunities)").all() as any[];
        const hasOwner = oppInfo.find(c => c.name === 'owner_account_id');
        const hasTarget = oppInfo.find(c => c.name === 'target_account_id');
        
        if (!hasOwner) {
            console.log('[+] Adding owner_account_id to opportunities');
            db.prepare("ALTER TABLE opportunities ADD COLUMN owner_account_id TEXT").run();
            // Backfill default? Maybe use account_id if it exists?
            // For now, let's just add it. The migration below INSERTs new records with it.
        }
        if (!hasTarget) {
             console.log('[+] Adding target_account_id to opportunities');
             db.prepare("ALTER TABLE opportunities ADD COLUMN target_account_id TEXT").run();
        }

        // Fix contact_id if missing?
        const hasContact = oppInfo.find(c => c.name === 'contact_id');
        if (!hasContact) {
             console.log('[+] Adding contact_id to opportunities');
             db.prepare("ALTER TABLE opportunities ADD COLUMN contact_id TEXT").run();
        }

    } catch (e: any) {
        console.error('Schema repair error:', e.message);
    }

    // 3. Migrate Users to Contacts + HR Opportunity
    const users = db.prepare("SELECT * FROM users").all() as any[];
  console.log(`Found ${users.length} users to migrate.`);

  for (const user of users) {
    console.log(`Migrating User: ${user.email}`);

    // Check if Contact exists for this email in Primary Account
    // If no primary account, assume System Account or create one? 
    // Existing users usually have primary_account_id.
    const accountId = user.primary_account_id || '00000000-0000-0000-0000-000000000000';
    let contactId = randomUUID();

    // Check existing contact
    const existing = db.prepare("SELECT * FROM contacts WHERE email = ? AND account_id = ?").get(user.email, accountId) as any;
    
    if (existing) {
      console.log(`  - Found existing contact ${existing.id}. Updating auth.`);
      contactId = existing.id;
      db.prepare("UPDATE contacts SET password_hash = ?, avatar_url = ? WHERE id = ?").run(user.password_hash, user.avatar_url, contactId);
    } else {
      console.log(`  - Creating new contact.`);
      db.prepare(`
        INSERT INTO contacts (id, account_id, email, name, password_hash, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(contactId, accountId, user.email, user.name, user.password_hash, user.avatar_url);
    }

    // 3. Create HR Opportunity (Employment Contract)
    // Check if exists
    const existingOpp = db.prepare("SELECT * FROM opportunities WHERE contact_id = ? AND opp_type = 'employment' AND status = 'active'").get(contactId) as any;
    
    if (!existingOpp) {
      console.log(`  - Creating HR Opportunity (Employment).`);
      const oppId = randomUUID();
      db.prepare(`
        INSERT INTO opportunities (id, owner_account_id, contact_id, opp_type, stage, status, name, created_at)
        VALUES (?, ?, ?, 'employment', 'active', 'active', ?, ?)
      `).run(oppId, accountId, contactId, `Employment - ${user.name}`, new Date().toISOString());
      
      // Also log Activity
      db.prepare(`
        INSERT INTO activities (id, account_id, contact_id, activity_type, opportunity_id, data)
        VALUES (?, ?, ?, 'admin', ?, ?)
      `).run(randomUUID(), accountId, contactId, oppId, JSON.stringify({ note: 'Migrated from User' }));
    } else {
      console.log(`  - HR Opportunity already exists.`);
    }
  }

  console.log('--- DONE: Identity Flattening Migration ---');
}

try {
  migrate();
} catch (error: any) {
  // console.error('Migration Failed:', error);
  const fs = require('fs');
  fs.writeFileSync('migration_error.txt', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  fs.appendFileSync('migration_error.txt', `\nMessage: ${error.message}\nStack: ${error.stack}`);
  process.exit(1);
}
