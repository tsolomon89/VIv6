
import { db } from '../db.js';
import { getAccount } from '../accounts.js';

/**
 * Checks if an Account has sufficient entitlement for a specific metric.
 * 
 * Logic:
 * 1. Fetch Account Usage (e.g., data.usage.storage_gb)
 * 2. Fetch Active Entitlements (Account -> has_product -> Product -> has_feature -> Feature)
 * 3. Aggregate Limits (Max of all active features for this metric)
 * 4. Compare
 * 
 * @param accountId 
 * @param metric e.g., 'storage_gb', 'seats', 'api_calls'
 * @param cost How much is being requested (default 1)
 */
export async function checkEntitlement(accountId: string, metric: string, cost: number = 1): Promise<boolean> {
    // 1. Get Usage
    const account = getAccount(accountId);
    if (!account) throw new Error(`Account ${accountId} not found`);

    const usageData = account.data?.usage || {};
    const currentUsage = usageData[metric] || 0;
    const projectedUsage = currentUsage + cost;

    // 2. Get Limits
    // Query: Find Features linked to Products linked to this Account
    // Assuming Relationship: Account -[uses_product]-> Product -[has_feature]-> Feature
    // Or simplified: Account -[has_feature]-> Feature (direct assignment)
    
    // SQL for aggregating limits:
    // Join EntityRelationships to find Features
    const query = `
        SELECT 
            json_extract(f.data, '$.entitlement.limit') as limit_val,
            json_extract(f.data, '$.entitlement.metric') as f_metric
        FROM entity_relationships er1
        JOIN entities p ON er1.to_entity_id = p.id -- Product
        JOIN entity_relationships er2 ON p.id = er2.from_entity_id -- Product -> Feature
        JOIN entities f ON er2.to_entity_id = f.id -- Feature
        WHERE 
            er1.from_entity_id = ? -- Account ID (as Entity? No, Account is table. Need to unify or use string ID)
            AND er1.relationship_type = 'uses_product'
            AND er2.relationship_type = 'has_feature'
            AND json_extract(f.data, '$.entitlement.metric') = ?
    `;
    
    // Note: Accounts are NOT in 'entities' table in Universal Schema v2 (they are in 'accounts' table).
    // BUT relationships table links 'from_entity_id' which is TEXT. It CAN point to an account ID.
    // Our relationships table schema: from_entity_id TEXT. Foreign Key points to entities(id).
    // WAIT. If Foreign Key points to entities(id), we CANNOT use account_id there if Account is not in Entities.
    // Schema Check:
    // FOREIGN KEY (from_entity_id) REFERENCES entities(id)
    // This implies Accounts CANNOT be in 'entity_relationships' as 'from' IF we enforce FK.
    // SQLite enforces FK if enabled.
    
    // Workaround/Architectural Pivot: 
    // IF Accounts are separate, we need 'account_links' or 'account_products' table OR 
    // Accounts must ALSO be mirrored in Entities (Shadow Entity) OR 
    // We relax the FK (Account ID is just a string).
    
    // Phase 2 migration created 'accounts' table.
    // It also kept 'entity_relationships'.
    // Did it add 'account_id' to relationships?
    // Let's check Schema again.
    
    // Schema says:
    // user_accounts table.
    // account_links table (owner_account_id, target_account_id).
    // entity_relationships links entities.
    
    // How do we link Account -> Product?
    // Option A: Product is an Asset? No, Entity.
    // Option B: 'account_links' is for Account<->Account.
    // Option C: New table 'account_entities'? OR 'entitlements'?
    // Option D: Store list of Product IDs in `account.data`.
    
    // DECISION: For Phase 3, we will use `account.data.active_product_ids` array for simplicity,
    // avoiding the "Account vs Entity FK" conflict in the relationships table.
    
    const activeProductIds: string[] = account.data?.active_product_ids || [];
    let maxLimit = 0;
    
    if (activeProductIds.length > 0) {
        // Find features for these products
        const placeholders = activeProductIds.map(() => '?').join(',');
        const featureQuery = `
            SELECT 
                json_extract(e.data, '$.entitlement.limit') as val
            FROM entity_relationships er
            JOIN entities e ON er.to_entity_id = e.id
            WHERE 
                er.from_entity_id IN (${placeholders})
                AND er.relationship_type = 'has_feature'
                AND json_extract(e.data, '$.entitlement.metric') = ?
        `;
        
        const results = db.prepare(featureQuery).all(...activeProductIds, metric) as Array<{val: number}>;
        for (const row of results) {
            if (row.val > maxLimit) maxLimit = row.val;
        }
    }
    
    // 3. Fallback: Check System Global Defaults (e.g. Free Tier) if no products
    if (activeProductIds.length === 0) {
        // Hardcoded Free Tier
        if (metric === 'storage_gb') maxLimit = 1;
        if (metric === 'seats') maxLimit = 1;
    }

    return projectedUsage <= maxLimit;
}
