import { describe, it, expect, beforeEach } from 'vitest';
import { syncTargetingRelationships, getEntitiesTargeting } from './targeting-sync.js';
import { createRecord } from './records.js';
import { db } from './db.js';
import { randomUUID } from 'crypto';

describe('Core: Targeting Sync', () => {
  let productId: string;

  beforeEach(async () => {
    try {
        db.pragma('foreign_keys = OFF');
        // create table if not exists for testing
        db.prepare(`
          CREATE TABLE IF NOT EXISTS entity_targeting (
            entity_id TEXT NOT NULL,
            dimension TEXT NOT NULL,
            slug TEXT NOT NULL,
            persona TEXT NOT NULL,
            UNIQUE(entity_id, dimension, slug, persona)
          )
        `).run();
        
        db.prepare('DELETE FROM entity_targeting').run();
        db.prepare('DELETE FROM dimension_values').run();
        db.prepare('DELETE FROM records').run();
        db.prepare('DELETE FROM records').run();
        // db.prepare('DELETE FROM accounts').run(); // Accounts are records now
        db.pragma('foreign_keys = ON');

        // Create Account
        await createRecord({
            id: 'acc-1',
            type: 'account',
            slug: 'acc-1',
            name: 'Test',
            account_id: 'system',
            data: { 
                account_class: 'business', 
                type: 'client',
                fieldGroups: [] 
            }
        });

        const product = await createRecord({
        type: 'product',
        slug: `product-${randomUUID().slice(0, 8)}`,
        name: 'Test Product',
        account_id: 'acc-1'
        } as any);
        productId = product.id;

        // Seed dimension values
        const now = new Date().toISOString();
        db.prepare(
        'INSERT INTO dimension_values (id, dimension, slug, label, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(randomUUID(), 'department', 'marketing', 'Marketing', now, now);
        db.prepare(
        'INSERT INTO dimension_values (id, dimension, slug, label, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(randomUUID(), 'companySize', 'smb', 'SMB', now, now); // Fixed missing line
    } catch (e) {
        console.error('DB Setup failed:', e);
        throw e;
    }
  });

  it('should sync personas to entity_targeting table', () => {
    syncTargetingRelationships(productId, {
      DM: { department: ['marketing', 'sales'] },
      EU: { companySize: ['smb'] },
      IN: {},
    });

    const rows = db.prepare('SELECT * FROM entity_targeting WHERE entity_id = ?').all(productId) as any[];
    expect(rows).toHaveLength(3);

    const dmDept = rows.filter((r: any) => r.persona === 'DM' && r.dimension === 'department');
    expect(dmDept).toHaveLength(2);

    const euSize = rows.filter((r: any) => r.persona === 'EU' && r.dimension === 'companySize');
    expect(euSize).toHaveLength(1);
  });

  it('should replace previous targeting on re-sync', () => {
    syncTargetingRelationships(productId, {
      DM: { department: ['marketing', 'sales'] },
      EU: {},
      IN: {},
    });

    // Re-sync with fewer values
    syncTargetingRelationships(productId, {
      DM: { department: ['marketing'] },
      EU: {},
      IN: {},
    });

    const rows = db.prepare('SELECT * FROM entity_targeting WHERE entity_id = ?').all(productId) as any[];
    expect(rows).toHaveLength(1);
    expect((rows[0] as any).slug).toBe('marketing');
  });

  it('should reverse-query entities targeting a dimension value', () => {
    syncTargetingRelationships(productId, {
      DM: { department: ['marketing'] },
      EU: {},
      IN: {},
    });

    const hits = getEntitiesTargeting('department', 'marketing');
    expect(hits).toHaveLength(1);
    expect(hits[0].entity_id).toBe(productId);
    expect(hits[0].persona).toBe('DM');
    expect(hits[0].name).toBe('Test Product');
  });

  it('should filter reverse query by persona', () => {
    syncTargetingRelationships(productId, {
      DM: { department: ['marketing'] },
      EU: { department: ['marketing'] },
      IN: {},
    });

    const dmOnly = getEntitiesTargeting('department', 'marketing', 'DM');
    expect(dmOnly).toHaveLength(1);
    expect(dmOnly[0].persona).toBe('DM');

    const all = getEntitiesTargeting('department', 'marketing');
    expect(all).toHaveLength(2);
  });
});
