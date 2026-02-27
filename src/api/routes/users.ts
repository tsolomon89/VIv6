import { Router, Request, Response, NextFunction } from 'express';
import { protectedRoute } from '../../modules/auth/middleware.js';
import { createRecord, getRecordBySlug } from '../../core/records.js'; // Use unified records
import { addUserToAccount } from '../../modules/identity/services.js';
import { randomUUID } from 'crypto';
import { SYSTEM_ACCOUNT_ID } from '../../core/constants.js';
import { db } from '../../core/db.js';

const router = Router();

// POST /api/users/invite
router.post('/invite', ...protectedRoute, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get account from ODAC context or headers
    const accountId = req.odac?.accountId || req.headers['x-account-id'] as string;
    if (!accountId) {
        return res.status(400).json({ error: 'Account context required (X-Account-Id header)' });
    }
    const context = { accountId };

    const { email, role } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // 1. Determine Slug from Email
    // Simple sanitization: "John.Doe@Example.com" -> "john-doe-example-com"
    const slug = email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // 2. Check if user already exists (globally? or just rely on slug collision?)
    // Note: getRecordBySlug takes accountId. Users are technically "system" entities or belong to specific account?
    // In our seed, Users have account_id='00...00' (Null UUID or System/Dev Account). 
    // If we create them in the *current* account, they are local.
    // If Users are global, they should be in a global account.
    // GUIDANCE: Users usually global. Let's assume they are created in the context of the account for now, OR in a shared "User Directory" account?
    // Looking at debug_ids.ts (which read existing users), User 'jdoe' had account_id='00000000-0000-0000-0000-000000000000'.
    // Let's stick to creating them in the "System" account (0s) if we want them global, or Current Account if we want isolation.
    // For "Invite", usually implies adding an existing person OR creating new.
    
    // Strategy:
    // A. Check if user exists in users table (canonical source for auth)
    const existingAuthUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string } | undefined;

    // B. Check if user exists in records table (for display)
    let user = getRecordBySlug(SYSTEM_ACCOUNT_ID, slug);
    let isNew = !existingAuthUser;

    const now = new Date().toISOString();
    const userData = {
        fieldGroups: [
            {
                name: 'Identity',
                fields: [
                    { name: 'Email', inputType: 'text', values: [email], required: true },
                    { name: 'First Name', inputType: 'text', values: [''] },
                    { name: 'Last Name', inputType: 'text', values: [''] }
                ]
            },
            {
                name: 'Activity',
                fields: [
                    { name: 'Status', inputType: 'select', values: ['Pending'], options: ['Active', 'Suspended', 'Pending'] },
                    { name: 'Last Login', inputType: 'date', values: [null] }
                ]
            }
        ]
    };

    if (!existingAuthUser) {
        // C. New user: Create in BOTH users table (for auth/FK) and records table (for display)
        const userId = randomUUID();

        // C1. Insert into users table (for ODAC auth and user_accounts FK constraint)
        db.prepare(`
            INSERT INTO users (id, email, name, primary_account_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, email, email, context.accountId, now, now);

        // C2. Create in records table for unified data display
        user = await createRecord({
            id: userId,
            account_id: SYSTEM_ACCOUNT_ID,
            type: 'user',
            slug: slug,
            name: email,
            description: `Invited to ${context.accountId}`,
            data: userData
        });
    } else if (!user) {
        // D. User exists in users table but not in records - sync them
        user = await createRecord({
            id: existingAuthUser.id,
            account_id: SYSTEM_ACCOUNT_ID,
            type: 'user',
            slug: slug,
            name: email,
            description: `Synced from users table`,
            data: userData
        });
    }

    // 3. Link to Current Account
    // Users are now created in both users table (for FK) and records table (for display)
    try {
        await addUserToAccount(user.id, context.accountId, role || 'viewer');
    } catch (e: any) {
        // Only ignore UNIQUE constraint errors (user already linked)
        if (e.message?.includes('UNIQUE constraint')) {
            console.warn('[Users] User already linked to account:', user.id);
        } else {
            console.error('[Users] Failed to link user to account:', e.message);
            throw e;
        }
    }

    res.status(201).json({
        user,
        message: isNew ? 'User created and invited' : 'Existing user added to account',
        link: { account_id: context.accountId, role: role || 'viewer' }
    });

  } catch (err) {
    next(err);
  }
});

export default router;
