
// Phase 15: Test Template Persistence
import fs from 'fs';

async function test() {
  const ids = JSON.parse(fs.readFileSync('test_ids.json', 'utf8'));
  
  const templateKey = `product-default-test-${Date.now()}`;
  const payload = {
      key: templateKey,
      name: "Product Default Test",
      description: "Automated Test Template",
      subject_target: "product",
      subject_cardinality: "one",
      sections: [
          {
              id: "sec_1",
              placement: "start",
              binding: { kind: "self", target: "self", cardinality: "one" },
              presentationKey: "section.hero.v1",
              overrides: { title: "Hello World" }
          }
      ]
  };

  console.log('1. Creating Template...');
  const createRes = await fetch('http://127.0.0.1:3006/api/templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': ids.contact_id,
      'x-account-id': '00000000-0000-0000-0000-000000000000',
      'x-api-key': 'secret'
    },
    body: JSON.stringify(payload)
  });
  
  console.log('Create Status:', createRes.status);
  const created = await createRes.json();
  console.log('Created Template ID:', created.id);

  console.log('2. Updating Template (Upsert Logic)...');
  // Simulate the Editor's Shell.tsx logic where it tries to create, fails, then updates
  // Here we just go straight to update to verify the endpoint
  payload.sections[0].overrides = { title: "Hello World Updated" };

  const updateRes = await fetch(`http://127.0.0.1:3006/api/templates/${templateKey}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': ids.contact_id,
      'x-account-id': '00000000-0000-0000-0000-000000000000',
      'x-api-key': 'secret'
    },
    body: JSON.stringify(payload)
  });

  console.log('Update Status:', updateRes.status);
  const updated = await updateRes.json();
  
  // Verify persistent change
  const section = updated.sections ? updated.sections[0] : JSON.parse(updated.sections_json)[0];
  if (section.overrides.title === "Hello World Updated") {
      console.log('SUCCESS: Template updated successfully.');
  } else {
      console.log('FAILURE: Template update failed.', section);
  }
}

test().catch(console.error);
