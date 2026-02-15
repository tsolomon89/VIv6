
import { db } from '../src/core/db.js';

try {
  console.log('Checking columns...');
  const info = db.prepare("PRAGMA table_info(opportunities)").all();
  const cols = info.map((c: any) => c.name);
  console.log('Columns:', cols);

  const missing = ['owner_account_id', 'target_account_id', 'contact_id', 'name'].filter(c => !cols.includes(c));
  
  if (missing.length > 0) {
    console.log('Missing columns:', missing);
    for (const m of missing) {
        db.prepare(`ALTER TABLE opportunities ADD COLUMN ${m} TEXT`).run();
        console.log(`Added ${m}`);
    }
  } else {
    console.log('All columns present.');
  }

  // Try INSERT
  console.log('Attempting INSERT...');
  const stmt = db.prepare(`
    INSERT INTO opportunities (id, owner_account_id, contact_id, opp_type, stage, status, name, created_at)
    VALUES (?, ?, ?, 'test_opp_manual', 'active', 'active', ?, ?)
  `);
  
  stmt.run('test_opp_id_' + Date.now(), 'test_acc', 'test_contact', 'Test Opp', new Date().toISOString());
  console.log('INSERT Success!');

} catch (e: any) {
  console.error('Manual Test Failed:', e.message);
  process.exit(1);
}
