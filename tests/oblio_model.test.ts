
import { createRecord, createRelationship, getRecord, deleteRelationship } from '../src/modules/content/services.js';
import { db } from '../src/core/db.js';


async function runTest() {
    console.log('--- Oblio Model Verification ---');

    const accountId = 'acc_test_' + Date.now();
    
    // 0. Create Account Record (Oblio Model)
    console.log('0. Creating Account Record...');
    await createRecord({
        id: accountId,
        type: 'account',
        slug: 'account-' + Date.now(),
        name: 'Test Account',
        account_id: 'system', // Root or self-reference? For now 'system'
        data: { fieldGroups: [] }
    });

    // 1. Create Source and Target
    console.log('1. Creating records...');
    const source = await createRecord({
        type: 'opportunity',
        slug: 'opp-source-' + Date.now(),
        name: 'Source Opportunity',
        account_id: accountId,
        data: { fieldGroups: [] }
    });

    const target = await createRecord({
        type: 'contact',
        slug: 'contact-target-' + Date.now(),
        name: 'Target Contact',
        account_id: accountId,
        data: { fieldGroups: [] }
    });

    // 2. Create Relationship
    console.log('2. Creating relationship (Source -> Target)...');
    const rel = await createRelationship({
        from_record_id: source.id,
        to_record_id: target.id,
        relationship_type: 'primary_contact'
    });

    // 3. Verify Dual-Write
    console.log('3. Verifying dual-write...');
    
    // 3a. Check Table
    const tableEntry = db.prepare('SELECT * FROM record_relationships WHERE id = ?').get(rel.id);
    if (!tableEntry) console.error('FAIL: Relationship not in SQL table.');
    else console.log('PASS: Relationship in SQL table.');

    // 3b. Check Record Data
    const updatedSource = getRecord(source.id);
    const links = (updatedSource?.data as any).links || {};
    const targets = links['primary_contact'] || [];
    
    if (targets.includes(target.id)) console.log('PASS: link found in record.data.links');
    else console.error('FAIL: link NOT found in record.data.links:', JSON.stringify(links));

    // 4. Verify Delete
    console.log('4. Deleting relationship...');
    await deleteRelationship(rel.id);

    // 4a. Check Table (Should be gone)
    const tableEntryDeleted = db.prepare('SELECT * FROM record_relationships WHERE id = ?').get(rel.id);
    if (!tableEntryDeleted) console.log('PASS: Relationship removed from SQL table.');
    else console.error('FAIL: Relationship still in SQL table.');

    // 4b. Check Record Data (Should be gone)
    const storedSource = getRecord(source.id);
    const storedLinks = (storedSource?.data as any).links || {};
    const storedTargets = storedLinks['primary_contact'] || [];
    
    if (!storedTargets.includes(target.id)) console.log('PASS: link removed from record.data.links');
    else console.error('FAIL: link STILL in record.data.links:', JSON.stringify(storedLinks));

    // 5. Verify Reader Injection (Read-Side)
    console.log('5. Verifying Reader Injection...');
    
    // Re-create relationship for test
    await createRelationship({
        from_record_id: source.id,
        to_record_id: target.id,
        relationship_type: 'primary_contact'
    });
    
    // Fetch and Project
    const rawRecord = getRecord(source.id);
    // Dynamic import to avoid top-level dependency issues if Reader uses DOM types (though it shouldn't)
    const { Reader } = await import('../src/contracts/Reader.js');
    
    const projected = Reader.toEntityData(rawRecord || {} as any);
    
    console.log('[DEBUG] Projected:', JSON.stringify(projected, null, 2));

    const connections = (projected.fieldGroups || []).find((g: any) => g.name === 'Connections');
    if (connections) {
        const field = connections.fields.find((f: any) => f.name === 'Primary Contact');
        if (field && field.inputType === 'Record' && Array.isArray(field.value) && field.value.includes(target.id)) {
             console.log('PASS: Reader injected relationship as FieldStruct.');
        } else {
             console.error('FAIL: Reader injection malformed:', JSON.stringify(field), field ? field.value : 'N/A');
        }
    } else {
        console.error('FAIL: Reader did not create "Connections" group.', JSON.stringify(projected));
    }

}

runTest().catch(console.error);
