
import { db } from '../src/core/db.js';
import fs from 'fs';

const opp = db.prepare(`
  SELECT 
    c.id as contact_id, 
    c.email, 
    o.owner_account_id as account_id,
    o.id as opp_id
  FROM opportunities o
  JOIN contacts c ON o.contact_id = c.id
  WHERE o.opp_type = 'employment' AND o.status = 'active'
  LIMIT 1
`).get();

if (opp) {
  // console.log(JSON.stringify(opp, null, 2));
  fs.writeFileSync('test_ids.json', JSON.stringify(opp, null, 2));
  console.log('Written to test_ids.json');
} else {
  console.log('No HR Opportunities found.');
}
