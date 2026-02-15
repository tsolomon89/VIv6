
import { db, initDb } from '../core/db.js';

export function scopeRecords() {
  console.log('🏗️ Scoping existing records to Default Account...');
  
  // 1. Get Default Brand ("Victory Initiative")
  const brand = db.prepare("SELECT id FROM records WHERE type = 'brand' AND slug = 'brand'").get() as { id: string };
  
  if (!brand) {
    console.error('❌ Default Brand record not found! Seed data first.');
    return;
  }
  
  // 2. Update all non-brand records to belong to this account
  const stmt = db.prepare(`
    UPDATE records 
    SET account_id = @accountId 
    WHERE account_id IS NULL AND type != 'brand'
  `);
  
  const info = stmt.run({ accountId: brand.id });
  console.log(`✅ Scoped ${info.changes} records to account: ${brand.id}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  initDb();
  scopeRecords();
}
