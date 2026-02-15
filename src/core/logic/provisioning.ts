
import { createAccount, updateAccount, addUserToAccount } from '../accounts.js';
import { db } from '../db.js';

type ProvisionInput = {
    userId: string;
    slug: string;
    name: string;
    planId?: string;
};

/**
 * Provisions a new Tenant Account.
 * 1. Creates Account record.
 * 2. links User as Owner.
 * 3. Assigns Plan (if provided).
 */
export async function provisionTenant(input: ProvisionInput) {
    console.log(`[Provisioning] Starting for user ${input.userId}, slug=${input.slug}`);
    
    // Transaction?
    // SQLite: Better-sqlite3 'transaction' function.
    const runTransaction = db.transaction(() => {
        // 1. Create Account
        const account = createAccount({
            name: input.name,
            slug: input.slug,
            type: 'client',
            account_class: 'business'
        });
        
        // 2. Link User
        addUserToAccount(input.userId, account.id, 'owner');
        
        // 3. Assign Plan
        if (input.planId) {
            updateAccount(account.id, {
                active_product_ids: [input.planId]
            });
        }
        
        return account;
    });
    
    const result = runTransaction();
    console.log(`[Provisioning] Complete. Account ID: ${result.id}`);
    return result;
}
