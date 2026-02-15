
import { initDb } from '../src/core/db.js';
import { createEntity, listEntities } from '../src/core/entities.js';
import { createRelationship, getRelationshipsFrom } from '../src/core/relationships.js';
import { checkIdempotency } from '../src/core/idempotency.js';

console.log('Initializing DB...');
initDb();

// 1. Create Brand
console.log('\nCreating Brand...');
const brandInput = {
  type: 'brand' as const,
  slug: 'test-brand',
  name: 'Test Brand',
  description: 'A test brand',
  data: { color: 'blue' }
};

const idempotency = checkIdempotency(brandInput);
console.log('Idempotency check:', idempotency);

let brand;
if (idempotency === 'create') {
  brand = createEntity(brandInput);
  console.log('Created Brand:', brand.id);
} else {
  console.log('Brand already exists, skipping create');
  // fetching hypothetical existing one not implemented in script for brevity, assuming fresh DB or just relying on "skip" log
}

// 2. Create Product
console.log('\nCreating Product...');
const productInput = {
  type: 'product' as const,
  slug: 'test-product',
  name: 'Test Product',
  data: { price: 100 }
};

const product = createEntity(productInput); // Ignoring idempotency for simplicity in this run
console.log('Created Product:', product.id);

// 3. Create Relationship
console.log('\nCreating Relationship...');
if (brand) {
    try {
        const rel = createRelationship({
            from_id: brand.id,
            to_id: product.id,
            type: 'offers'
        });
        console.log('Created Relationship:', rel.id);
    } catch (e: any) {
        console.log('Relationship creation failed (maybe duplicate?):', e.message);
    }
}

// 4. Query
console.log('\nQuerying Relationships from Brand...');
if (brand) {
    const rels = getRelationshipsFrom(brand.id);
    console.log('Found relationships:', rels.length);
    rels.forEach(r => console.log(`- ${r.type} -> ${r.to_type} (${r.to_id})`));
}

console.log('\nDone.');
