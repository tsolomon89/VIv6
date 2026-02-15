
// Phase 14 Audit Test
import fs from 'fs';

async function test() {
  const ids = JSON.parse(fs.readFileSync('test_ids.json', 'utf8'));
  
  console.log('Testing with Contact:', ids.contact_id);
  
  const res = await fetch('http://127.0.0.1:3005/api/records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': ids.contact_id,
      'x-account-id': '00000000-0000-0000-0000-000000000000',
      'x-api-key': 'secret'
    },
    body: JSON.stringify({
      type: 'product',
      slug: 'audit-test-node-fetch',
      name: 'Audit Test Node Fetch'
    })
  });

  console.log('Status:', res.status);
  const json = await res.json();
  console.log('Response:', JSON.stringify(json, null, 2));
}

test().catch(console.error);
