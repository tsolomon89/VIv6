import { Router, Request, Response, NextFunction } from 'express';
import { protectedRoute } from '../../modules/auth/middleware.js';
import { createRecord, getRecordBySlug } from '../../core/records.js'; // Use unified records
import { addUserToAccount } from '../../modules/identity/services.js';
import { randomUUID } from 'crypto';
import { SYSTEM_ACCOUNT_ID } from '../../core/constants.js';

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
    // A. Try to find user by slug in System Account (00..00).
    let user = getRecordBySlug(SYSTEM_ACCOUNT_ID, slug);
    let isNew = false;
    
    if (!user) {
        // B. Create new User Record in System Account
        isNew = true;
        const now = new Date().toISOString();
        const userData = {
            fieldGroups: [
                {
                    name: 'Identity',
                    fields: [
                        { name: 'Email', inputType: 'text', value: email, required: true },
                        { name: 'First Name', inputType: 'text', value: '' }, // To be filled
                        { name: 'Last Name', inputType: 'text', value: '' }
                    ]
                },
                {
                    name: 'Activity',
                    fields: [
                        { name: 'Status', inputType: 'select', value: 'Pending', options: ['Active', 'Suspended', 'Pending'] },
                        { name: 'Last Login', inputType: 'date', value: null }
                    ]
                }
            ]
        };

        user = createRecord({
            id: randomUUID(),
            account_id: SYSTEM_ACCOUNT_ID, // Users owned by System
            type: 'user',
            slug: slug,
            name: email, // Default name to email
            description: `Invited to ${context.accountId}`,
            data: userData
        });
    }

    // 3. Link to Current Account
    try {
        addUserToAccount(user.id, context.accountId, role || 'viewer');
    } catch (e: any) {
        // Ignore UNIQUE constraint if already linked, otherwise throw
        if (!e.message.includes('UNIQUE constraint failed')) {
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
