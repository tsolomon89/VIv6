
// Phase 14: Test Add Item API
import fs from 'fs';

async function test() {
  const ids = JSON.parse(fs.readFileSync('test_ids.json', 'utf8'));
  
  if (!ids.opp_id) {
      console.log('No Opportunity ID found in test_ids.json');
      return;
  }

  // 1. Create a Product via API (to get an ID)
  // We'll just assume we can find one or create one.
  // Let's create one first to be sure.
  
  const prodRes = await fetch('http://127.0.0.1:3006/api/records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': ids.contact_id,
      'x-account-id': '00000000-0000-0000-0000-000000000000',
      'x-api-key': 'secret'
    },
    body: JSON.stringify({
      type: 'product',
      slug: 'api-test-prod-' + Date.now(),
      name: 'API Test Product',
      data: {
          price: 500
      }
    })
  });
  
  const product = await prodRes.json();
  console.log('Created Product:', product.id);

  // 2. Add Item to Opportunity
  const res = await fetch(`http://127.0.0.1:3006/api/commercial/opportunities/${ids.opp_id}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': ids.contact_id,
      'x-account-id': '00000000-0000-0000-0000-000000000000',
      'x-api-key': 'secret'
    },
    body: JSON.stringify({
      productId: product.id,
      quantity: 3
    })
  });

  console.log('Add Item Status:', res.status);
  const json = await res.json();
  console.log('Updated Opportunity:', JSON.stringify(json, null, 2));

  // Check if amount is updated (500 * 3 = 1500)
  if (json.data.amount === 1500) {
      console.log('SUCCESS: Amount updated correctly.');
  } else {
      console.log('FAILURE: Amount mismatch.', json.data.amount);
  }
}

test().catch(console.error);
