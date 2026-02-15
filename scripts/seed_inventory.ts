
import fs from 'fs';
import path from 'path';
import { createEntity } from '../src/core/entities';
import { createRelationship } from '../src/core/relationships';
import { EntityInput, EntityType } from '../src/core/types';

const INVENTORY_PATH = path.join(process.cwd(), 'agent_context', 'inventory-v2.json');

// Interface mimicking the JSON structure
interface InventoryData {
  brands: any[];
  features: any[];
  solutions: any[];
  useCases: any[];
  featureSolutionEdges: { featureId: string; solutionId: string }[];
  solutionUseCaseEdges: { solutionId: string; useCaseIds: string[] }[];
  products: any[];
}

async function seed() {
  console.log('🌱 Seeding Inventory from:', INVENTORY_PATH);

  if (!fs.existsSync(INVENTORY_PATH)) {
    console.error('❌ Inventory file not found!');
    process.exit(1);
  }

  const rawData = fs.readFileSync(INVENTORY_PATH, 'utf-8');
  const inventory: InventoryData = JSON.parse(rawData);

  const idMap = new Map<string, string>(); // JSON ID -> DB UUID

  // Helper to create entity and map ID
  const seedEntity = (jsonItem: any, type: EntityType, extraData: any = {}) => {
    console.log(`Creating ${type}: ${jsonItem.name || jsonItem.id}`);
    
    // Extract generic fields
    const { id, name, summary, description, ...rest } = jsonItem;
    
    // Construct EntityInput
    const input: EntityInput = {
      type,
      name: name || id, // Use ID as name if name missing (e.g. some brands?)
      slug: rest.slug || rest.domain || `/${type}/${id}`, // Fallback slug
      description: summary || description || '',
      data: { ...rest, ...extraData }, // Store remaining fields in data
    };

    if (jsonItem.brandId && idMap.has(jsonItem.brandId)) {
        input.brand_id = idMap.get(jsonItem.brandId);
    }

    try {
      const entity = createEntity(input);
      idMap.set(id, entity.id);
      return entity;
    } catch (e) {
      console.error(`Error creating ${type} ${id}:`, e);
      return null;
    }
  };

  // 1. Brands
  for (const brand of inventory.brands) {
    // Brands in JSON have 'domain' which is good for slug or data
    seedEntity(brand, 'brand', { domain: brand.domain, primaryCTA: brand.primaryCTA, labels: brand.labels });
  }

  // 2. Features
  for (const feat of inventory.features) {
    seedEntity(feat, 'feature');
  }

  // 3. Solutions
  for (const sol of inventory.solutions) {
    seedEntity(sol, 'solution');
  }

  // 4. UseCases
  for (const uc of inventory.useCases) {
    // Label is name
    seedEntity({ ...uc, name: uc.label, summary: uc.label }, 'useCase');
  }

  // 5. Products
  for (const prod of inventory.products) {
    const entity = seedEntity(prod, 'product');
    
    if (entity) {
        // Link Product -> Features (hasFeature)
        if (prod.featureIds) {
            for (const featId of prod.featureIds) {
                if (idMap.has(featId)) {
                    createRelationship({
                        from_id: entity.id,
                        to_id: idMap.get(featId)!,
                        type: 'hasFeature'
                    });
                }
            }
        }

        // Link Product -> Solutions (offers/delivers)
        if (prod.solutionIds) {
            for (const solId of prod.solutionIds) {
                if (idMap.has(solId)) {
                    createRelationship({
                        from_id: entity.id,
                        to_id: idMap.get(solId)!,
                        type: 'offers'
                    });
                }
            }
        }
    }
  }

  // 6. Edges: Feature -> Solution
  for (const edge of inventory.featureSolutionEdges) {
    const fromId = idMap.get(edge.featureId);
    const toId = idMap.get(edge.solutionId);
    if (fromId && toId) {
        createRelationship({ from_id: fromId, to_id: toId, type: 'delivers' });
    }
  }

  // 7. Edges: Solution -> UseCase
  for (const edge of inventory.solutionUseCaseEdges) {
    const fromId = idMap.get(edge.solutionId);
    if (fromId && edge.useCaseIds) {
        for (const ucId of edge.useCaseIds) {
            const toId = idMap.get(ucId);
            if (toId) {
                createRelationship({ from_id: fromId, to_id: toId, type: 'appliesTo' });
            }
        }
    }
  }

  console.log('✅ Seeding Complete!');
}

seed().catch(console.error);
