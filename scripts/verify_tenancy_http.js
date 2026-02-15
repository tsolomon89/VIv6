
async function verify() {
  const USER_ID = '11111111-1111-1111-1111-111111111111';
  const ACC_VALID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const ACC_INVALID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const headers = { 
    'Content-Type': 'application/json',
    'x-user-id': USER_ID
  };

  console.log('--- Verifying Contextual Tenancy (UUIDs) ---');

  // Test 1: Valid Account
  try {
    const res1 = await fetch(`http://localhost:3001/api/records?account_id=${ACC_VALID}`, { headers });
    console.log(`Test 1 (Valid Access): ${res1.status === 200 ? 'PASS' : 'FAIL'} (${res1.status})`);
    if (res1.status !== 200) {
        const txt = await res1.text();
        console.log('Error:', txt);
    }
  } catch (e) {
    console.error('Test 1 Exception:', e);
  }

  // Test 2: Forbidden Account
  try {
    const res2 = await fetch(`http://localhost:3001/api/records?account_id=${ACC_INVALID}`, { headers });
    console.log(`Test 2 (Forbidden Access): ${res2.status === 403 ? 'PASS' : 'FAIL'} (${res2.status})`);
    if (res2.status !== 403) {
        const txt = await res2.text();
        console.log('Error:', txt);
    }
  } catch (e) {
    console.error('Test 2 Exception:', e);
  }
}

verify();
