
// Phase 16: Test Build Pipeline
import fs from 'fs';
import path from 'path';

async function test() {
  const templateKey = `build-test-${Date.now()}`;
  
  // 1. Create Template (Triggers Build)
  console.log('[Test] Creating Template to trigger build...');
  const payload = {
      key: templateKey,
      name: "Build Test Template",
      subject_target: "product",
      subject_cardinality: "one",
      sections: []
  };

  await fetch('http://localhost:3006/api/templates', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'x-user-id': 'aaad4527-5173-4407-a1b8-f62a9f73f9a6',
        'x-account-id': '00000000-0000-0000-0000-000000000000',
        'x-api-key': 'secret' 
    },
    body: JSON.stringify(payload)
  });

  console.log('[Test] Template created. Waiting for BuildQueue (Debounce 1s)...');
  
  // 2. Wait for IO
  await new Promise(r => setTimeout(r, 5000));

  // 3. Verify Output
  // Note: The Mock Implementation in delivery/index.ts just logs for now because we didn't implement the reverse lookup.
  // HOWEVER, BuildQueue.enqueue is real.
  // To truly test the queue, we need to manually enqueue an entity, or mock the lookup.
  
  // Let's manually trigger a record update to test the queue directly
  // fetching a known entity
  const entitiesRes = await fetch('http://localhost:3006/api/records?type=product', {
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': 'aaad4527-5173-4407-a1b8-f62a9f73f9a6',
        'x-account-id': '00000000-0000-0000-0000-000000000000',
        'x-api-key': 'secret' 
    }
  });
  const entities = await entitiesRes.json();
  if (!Array.isArray(entities)) {
      console.error('[Test] API returned non-array. See api_response.json');
      fs.writeFileSync('api_response.json', JSON.stringify(entities, null, 2));
      throw new Error('API returned non-array');
  }
  if (entities.length === 0) {
      console.log('[Test] No products found to build. Creating one...');
      // Create a dummy product
      const productRes = await fetch('http://localhost:3006/api/records', {
          method: 'POST',
          headers: { 
        'Content-Type': 'application/json',
        'x-user-id': 'aaad4527-5173-4407-a1b8-f62a9f73f9a6',
        'x-account-id': '00000000-0000-0000-0000-000000000000',
        'x-api-key': 'secret' 
    },
          body: JSON.stringify({
              type: 'product',
              slug: `test-product-${Date.now()}`,
              name: 'Test Product',
              data: { fieldGroups: [] }
          })
      });
      const newProduct = await productRes.json();
      entities.push(newProduct);
  }
  const entity = entities[0];
  console.log(`[Test] Manually triggering build for ${entity.slug} (${entity.id}) via internal event simulation...`);
  
  // We can't easily emit an event from here to the server process.
  // We rely on the server logs to see if it picked up the template event.
  // But to verify the WRITER, we can call the build endpoint which uses the same logic?
  // No, let's use the build endpoint to verify the WRITER.
  
  console.log(`[Test] Calling POST /api/builds/${entity.id} to force a build and check static output...`);
  const buildRes = await fetch(`http://localhost:3006/api/builds/${entity.id}`, { 
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': 'aaad4527-5173-4407-a1b8-f62a9f73f9a6',
        'x-account-id': '00000000-0000-0000-0000-000000000000',
        'x-api-key': 'secret' 
    }
  });
  const buildResult = await buildRes.json();
  console.log('[Test] Build Result:', buildResult);

  // 4. Check Disk
  const distPath = path.resolve(process.cwd(), 'dist_test', entity.slug, 'index.html');
  if (fs.existsSync(distPath)) {
      console.log(`[Test] SUCCESS: File exists at ${distPath}`);
      const content = fs.readFileSync(distPath, 'utf8');
      if (content.includes('window.__KEIMENON_DATA__')) {
           console.log('[Test] SUCCESS: Hydration data found.');
      } else {
           console.log('[Test] FAILURE: Hydration data missing.');
      }
  } else {
      console.log(`[Test] FAILURE: File not found at ${distPath}`);
  }
}



test().catch(err => {
    console.error(err);
    fs.writeFileSync('test_error.log', err.stack || String(err));
});
