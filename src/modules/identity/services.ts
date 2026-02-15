import { db } from '../../core/db.js';
import { randomUUID } from 'crypto';
import { z } from 'zod';
// Assuming AccountDataSchema is a shared type or also moving. For now import from core to avoid breaking too much at once.
// Ideally, schema definitions should also move to modules/identity/models.ts
import { AccountDataSchema } from '../../core/schema/definitions.js';

// Schema for Account Creation
export const CreateAccountSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  account_class: z.enum(['free', 'professional', 'business']).default('business'),
  type: z.enum(['admin', 'client']).default('client'),
  data: AccountDataSchema.optional(),
});

export type AccountInput = z.infer<typeof CreateAccountSchema>;

export interface Account {
  id: string;
  slug: string;
  name: string;
  account_class: string;
  type: string;
  data: z.infer<typeof AccountDataSchema>;
  created_at: string;
  updated_at: string;
}

export function createAccount(input: AccountInput): Account {
  const id = input.id || randomUUID();
  const now = new Date().toISOString();
  
  if (!input.slug.match(/^[a-z0-9-]+$/)) throw new Error("Invalid slug");

  const account: Account = {
    id,
    slug: input.slug,
    name: input.name,
    account_class: input.account_class || 'business',
    type: input.type || 'client',
    data: input.data || {},
    created_at: now,
    updated_at: now
  };

  const stmt = db.prepare(`
    INSERT INTO accounts (id, slug, name, account_class, type, data, created_at, updated_at)
    VALUES (@id, @slug, @name, @account_class, @type, @data, @created_at, @updated_at)
  `);

  stmt.run({
    ...account,
    data: JSON.stringify(account.data)
  });

  return account;
}

export function getAccount(id: string): Account | undefined {
  const stmt = db.prepare('SELECT * FROM accounts WHERE id = ?');
  const result = stmt.get(id) as any;
  if (!result) return undefined;
  
  return {
    ...result,
    data: JSON.parse(result.data)
  };
}

export function getAccountBySlug(slug: string): Account | undefined {
  const stmt = db.prepare('SELECT * FROM accounts WHERE slug = ?');
  const result = stmt.get(slug) as any;
  if (!result) return undefined;

  return {
    ...result,
    data: JSON.parse(result.data)
  };
}

export function updateAccount(id: string, partialData: Partial<z.infer<typeof AccountDataSchema>>): Account {
    const current = getAccount(id);
    if (!current) throw new Error(`Account ${id} not found`);

    const newData = {
        ...current.data,
        ...partialData
    };

    const stmt = db.prepare('UPDATE accounts SET data = ?, updated_at = ? WHERE id = ?');
    stmt.run(JSON.stringify(newData), new Date().toISOString(), id);

    return {
        ...current,
        data: newData
    };
}


import { createRecord, getRecordBySlug } from '../../core/records.js';

export async function addUserToAccount(userId: string, accountId: string, role: string = 'member'): Promise<void> {
    // 1. Link User to Account
    const stmt = db.prepare(`
        INSERT INTO user_accounts (id, user_id, account_id, permission_level, joined_at)
        VALUES (@id, @user_id, @account_id, @role, @joined_at)
    `);
    
    try {
        stmt.run({
            id: randomUUID(),
            user_id: userId,
            account_id: accountId,
            role: role, 
            joined_at: new Date().toISOString()
        });
    } catch (e: any) {
        // Ignore UNIQUE constraint if already linked, but ensure contact sync proceeds
        if (!e.message.includes('UNIQUE constraint failed')) {
            throw e;
        }
    }

    // 2. Identity Flattening: Ensure a 'Contact' record exists for this User in this Account
    try {
        const userStmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = userStmt.get(userId) as any;

        if (user && user.email) {
            const email = user.email;
            // Slug strategy: email-based
            const slug = email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            
            const existingContact = getRecordBySlug(accountId, slug);
            
            if (!existingContact) {
                // Create Contact
                // This is now async
                await createRecord({
                    account_id: accountId,
                    type: 'contact',
                    slug: slug,
                    name: user.name || email.split('@')[0],
                    data: {
                        email: email,
                        fullName: user.name,
                        profilePicture: user.avatar_url,
                        // Add other fields as needed by schema
                        firstName: user.name ? user.name.split(' ')[0] : '',
                        lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
                        role: role,
                        fieldGroups: []
                    }
                });
            }
        }
    } catch (e) {
        console.error("Failed to sync User to Contact:", e);
        // Do not fail the whole operation if sync fails, but log it
    }
}

