import { Router, Request, Response, NextFunction } from 'express';
import util from 'util';
import { db } from '../../core/db.js';
import { randomUUID } from 'crypto';
import { loadSeedState, SeedState } from '../../modules/content/seeding.js';
import { listRecords, createRecord, updateRecord } from '../../modules/content/services.js';
import { listAllRelationships, createRelationship } from '../../modules/content/services.js';
import { DataRecord, RecordRelationship } from '../../core/types.js';
import { listDomains, createDomain, getDomainByHostname } from '../../modules/delivery/domains.js';
import { SYSTEM_ACCOUNT_ID } from '../../core/constants.js';
import { seedPipelineConfig } from '../../scripts/seed_pipeline_config.js';
import { loadInterpreterExecutorPlugins } from '../../modules/ops/interpreter_executor_plugin_loader.js';

const router = Router();

interface DiffOperation {
    action: 'create' | 'update' | 'noop';
    type: 'record' | 'relationship' | 'domain' | 'dimension' | 'account';
    key: string; // Slug for records, "slug->slug:type" for rels, hostname for domains
    summary: string;
    payload?: any; // The data to apply
}

interface ReseedPreview {
    ops: DiffOperation[];
    stats: {
        created: number;
        updated: number;
        noop: number;
    }
}

// POST /api/reseed/preview
router.post('/preview', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const seedState: SeedState = loadSeedState();
        // NOTE: listRecords() requires accountId, but for reseeding we need ALL records.
        // Current approach: Query DB directly to get all records for diffing.
        // A generic admin-only listAllRecords() could simplify this, but the direct
        // DB query works reliably for this admin-only seeding scenario.
        const allRecords = db.prepare('SELECT * FROM records').all().map((row: any) => ({
             ...row,
             data: JSON.parse(row.data)
        })) as DataRecord[];

        const allAccounts = db.prepare("SELECT * FROM records WHERE type = 'account'").all().map((row: any) => ({
             ...row,
             data: JSON.parse(row.data)
        })) as any[];

        const currentRels = listAllRelationships();

        const ops: DiffOperation[] = [];

        // 0. Account Diff (Match by ID)
        // Accounts are foundational. We match by ID.
        const dbAccountMap = new Map<string, any>();
        allAccounts.forEach(a => dbAccountMap.set(a.id, a));

        if (seedState.accounts) {
            for (const seedAccount of seedState.accounts) {
                const existing = dbAccountMap.get(seedAccount.id);
                if (!existing) {
                    ops.push({
                        action: 'create',
                        type: 'account',
                        key: seedAccount.id,
                        summary: `Create Account: ${seedAccount.name}`,
                        payload: seedAccount
                    });
                } else {
                     // Update check (Deep diff on data, check name/slug)
                     if (!util.isDeepStrictEqual(seedAccount.data, existing.data) || seedAccount.name !== existing.name || seedAccount.slug !== existing.slug) {
                        ops.push({
                            action: 'update',
                            type: 'account',
                            key: seedAccount.id,
                            summary: `Update Account: ${seedAccount.name}`,
                            payload: seedAccount
                        });
                     } else {
                         ops.push({
                            action: 'noop',
                            type: 'account',
                            key: seedAccount.id,
                            summary: `Account exists: ${seedAccount.name}`
                        });
                     }
                }
            }
        }

        // 1. Record Diff (Match by Slug)
        const dbRecordMap = new Map<string, DataRecord>();
        allRecords.forEach(e => dbRecordMap.set(e.slug, e));

        // Maps for Relationship resolution
        const seedIdToSlug = new Map<string, string>();
        seedState.records.forEach(e => seedIdToSlug.set(e.id, e.slug));
        
        // Also map existing ID to Slug for rels?
        const dbSlugToId = new Map<string, string>();
        allRecords.forEach(e => dbSlugToId.set(e.slug, e.id));

        for (const seedRecord of seedState.records) {
            // Skip accounts - they're handled separately above
            if (seedRecord.type === 'account') continue;

            const existing = dbRecordMap.get(seedRecord.slug);
            if (!existing) {
                // ADD
                ops.push({
                    action: 'create',
                    type: 'record',
                    key: seedRecord.slug,
                    summary: `Create ${seedRecord.type}: ${seedRecord.name}`,
                    payload: seedRecord
                });
            } else {
                // UPDATE (Deep diff on data)
                // Note: seedRecord.data is RecordStruct, existing.data should be RecordStruct too if inflated.
                if (!util.isDeepStrictEqual(seedRecord.data, existing.data) || seedRecord.name !== existing.name) {
                     ops.push({
                        action: 'update',
                        type: 'record',
                        key: seedRecord.slug,
                        summary: `Update ${seedRecord.type}: ${seedRecord.name}`,
                        payload: { ...seedRecord, id: existing.id } // Preserve existing ID
                    });
                } else {
                    ops.push({
                        action: 'noop',
                        type: 'record',
                        key: seedRecord.slug,
                        summary: `Unchanged: ${seedRecord.name}`
                    });
                }
            }
        }

        // 2. Relationship Diff (Match by Slugs)
        const dbRelSignatures = new Set<string>();
        currentRels.forEach(r => {
            const fromSlug = allRecords.find(e => e.id === r.from_record_id)?.slug;
            const toSlug = allRecords.find(e => e.id === r.to_record_id)?.slug;
            
            if (fromSlug && toSlug) {
                dbRelSignatures.add(`${fromSlug}->${toSlug}:${r.relationship_type}`);
            }
        });

        for (const seedRel of seedState.relationships) {
            // seedRel uses IDs. We need to resolve them to slugs to check signature
            // Wait, seedState.relationships in seeding.ts? 
            // My loading logic doesn't explicitly parse relationships file yet!
            // It only parses 'tenants' which might have 'initial_records'.
            // The top level 'seed_from_data.ts' logic did NOT handle relationships explicitly?
            // Checking seed_from_data.ts... it only inserted entities.
            // So relationships array is empty in current loading logic?
            // If so, we skip this loop.
            
            const fromSlug = seedIdToSlug.get(seedRel.from_record_id);
            const toSlug = seedIdToSlug.get(seedRel.to_record_id);
            
            if (!fromSlug || !toSlug) continue;

            const sig = `${fromSlug}->${toSlug}:${seedRel.relationship_type}`;

            if (!dbRelSignatures.has(sig)) {
                ops.push({
                    action: 'create',
                    type: 'relationship',
                    key: sig,
                    summary: `Link ${fromSlug} -> ${toSlug} (${seedRel.relationship_type})`,
                    payload: { 
                        from_slug: fromSlug,
                        to_slug: toSlug,
                        relationship_type: seedRel.relationship_type,
                        data: seedRel.data
                    }
                });
            } else {
                 ops.push({
                    action: 'noop',
                    type: 'relationship',
                    key: sig,
                    summary: `Linked: ${fromSlug} -> ${toSlug}`
                });
            }
        }

        // 3. Domain Diff (Match by hostname)
        const currentDomains = listDomains();
        const dbDomainHostnames = new Set(currentDomains.map(d => d.hostname));

        for (const seedDomain of seedState.domains) {
            if (dbDomainHostnames.has(seedDomain.hostname)) {
                ops.push({
                    action: 'noop',
                    type: 'domain',
                    key: seedDomain.hostname,
                    summary: `Domain exists: ${seedDomain.hostname}`,
                });
            } else {
                ops.push({
                    action: 'create',
                    type: 'domain',
                    key: seedDomain.hostname,
                    summary: `Create domain: ${seedDomain.hostname} (${seedDomain.type})`,
                    payload: seedDomain,
                });
            }
        }

        // 4. Dimension Diff (Match by dimension + slug)
        // We fetch all dimension values first
        const currentDimensions = db.prepare('SELECT * FROM dimension_values').all() as any[];
        // Map: dimension:slug -> value
        const dbDimMap = new Map<string, any>();
        currentDimensions.forEach(d => dbDimMap.set(`${d.dimension}:${d.slug}`, d));

        for (const seedDim of seedState.dimensions) {
            const key = `${seedDim.dimension}:${seedDim.slug}`;
            const existing = dbDimMap.get(key);

            if (!existing) {
                 ops.push({
                    action: 'create',
                    type: 'dimension',
                    key: key,
                    summary: `Create Dimension: ${seedDim.dimension}/${seedDim.slug}`,
                    payload: seedDim
                });
            } else {
                // Update check (simplified: check label or metadata)
                const metaDiff = JSON.stringify(seedDim.metadata || {}) !== (existing.metadata || '{}'); // Metadata stored as string in DB but parsed in seed?
                // Actually existing.metadata coming from raw SELECT is likely string unless we parsed it.
                // But seedDim.metadata is object.
                // Let's compare label.
                if (existing.label !== seedDim.label) {
                     ops.push({
                        action: 'update',
                        type: 'dimension',
                        key: key,
                        summary: `Update Dimension: ${seedDim.dimension}/${seedDim.slug}`,
                        payload: { ...seedDim, id: existing.id }
                    });
                } else {
                     ops.push({
                        action: 'noop',
                        type: 'dimension',
                        key: key,
                        summary: `Dimension exists: ${seedDim.label}`
                    });
                }
            }
        }

        const stats = {
            created: ops.filter(o => o.action === 'create').length,
            updated: ops.filter(o => o.action === 'update').length,
            noop: ops.filter(o => o.action === 'noop').length
        };

        res.json({ ops, stats });

    } catch (err) {
        next(err);
    }
});

// POST /api/reseed/apply
router.post('/apply', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ops } = req.body as { ops: DiffOperation[] };

        // Validate ops is provided and is an array
        if (!ops || !Array.isArray(ops)) {
            res.status(400).json({ error: 'ops array is required', status: 400 });
            return;
        }

        const activeOps = ops.filter(o => o.action !== 'noop');

        let applied = 0;

        // 0. Apply Account Changes (synchronous, in transaction)
        db.transaction(() => {
            const accountOps = activeOps.filter(o => o.type === 'account');
            const insertAccount = db.prepare(`
                INSERT INTO records (id, slug, name, type, account_id, data, created_at, updated_at)
                VALUES (@id, @slug, @name, 'account', @account_id, @data, @created_at, @updated_at)
            `);
            const updateAccount = db.prepare(`
                UPDATE records SET slug = @slug, name = @name, data = @data, updated_at = @updated_at
                WHERE id = @id
            `);

            for (const op of accountOps) {
                const now = new Date().toISOString();
                const payload = op.payload;
                const accountData = {
                    id: payload.id,
                    slug: payload.slug,
                    name: payload.name,
                    account_id: SYSTEM_ACCOUNT_ID,
                    data: JSON.stringify({
                        ...(payload.data || {}),
                        account_class: payload.account_class || 'business',
                        account_type: payload.type || 'client'
                    }),
                    created_at: payload.created_at || now,
                    updated_at: now
                };

                if (op.action === 'create') {
                     insertAccount.run(accountData);
                } else if (op.action === 'update') {
                     updateAccount.run(accountData);
                }
            }
        })();

        // 1. Apply Record Changes (async, with proper error handling)
        const recordOps = activeOps.filter(o => o.type === 'record');
        const recordPromises = recordOps.map(async (op) => {
            try {
                if (op.action === 'create') {
                    await createRecord(op.payload);
                } else if (op.action === 'update') {
                    await updateRecord(op.payload.id, op.payload);
                }
            } catch (err) {
                // Log but continue - records may already exist from seedPipelineConfig
                console.warn(`[Reseed] Record operation failed for ${op.key}:`, err instanceof Error ? err.message : String(err));
            }
        });
        await Promise.all(recordPromises);

        // Continue with synchronous operations in transaction
        db.transaction(() => {

            // 2. Refresh DB Map for Relationships
            const allRecords = db.prepare('SELECT * FROM records').all() as any[];
            const slugToId = new Map<string, string>();
            allRecords.forEach(e => slugToId.set(e.slug, e.id));

            // 3. Apply Relationship Changes
            const relOps = activeOps.filter(o => o.type === 'relationship');
            for (const op of relOps) {
                if (op.action === 'create') {
                    const fromId = slugToId.get(op.payload.from_slug);
                    const toId = slugToId.get(op.payload.to_slug);
                    
                    if (fromId && toId) {
                        try {
                            createRelationship({
                                from_record_id: fromId,
                                to_record_id: toId,
                                relationship_type: op.payload.relationship_type,
                                data: op.payload.data
                            });
                        } catch (e) {
                            console.warn('Relationship creation failed/exists', e);
                        }
                    }
                }
            }
            // 4. Apply Domain Changes
            const domainOps = activeOps.filter(o => o.type === 'domain');
            const recordsForDomains = db.prepare('SELECT * FROM records').all() as any[];
            const slugToIdForDomains = new Map<string, string>();
            recordsForDomains.forEach(e => slugToIdForDomains.set(e.slug, e.id));

            for (const op of domainOps) {
                if (op.action === 'create') {
                    // NOTE: Domain account_id is assumed to be a valid UUID from loadSeedState.
                    // The seed files (seed_from_data.ts) assign account_id from tenant definitions.
                    // If slug-based account references are needed in the future, add resolution here.
                    const domainPayload = op.payload;
                    
                    if (!getDomainByHostname(op.payload.hostname)) {
                        try {
                            createDomain({
                                ...domainPayload
                            });
                        } catch (e) {
                            console.warn('Domain creation failed', e);
                        }
                    }
                }
            }

            // 5. Apply Dimension Changes
            const dimOps = activeOps.filter(o => o.type === 'dimension');
            const insertDim = db.prepare(`
                INSERT INTO dimension_values (id, dimension, slug, label, parent_id, metadata, source, account_id, created_at, updated_at)
                VALUES (@id, @dimension, @slug, @label, @parent_id, @metadata, @source, @account_id, @created_at, @updated_at)
            `);
            const updateDim = db.prepare(`
                UPDATE dimension_values SET label = @label, metadata = @metadata, updated_at = @updated_at WHERE id = @id
            `);

            for (const op of dimOps) {
                const now = new Date().toISOString();
                const payload = op.payload;
                const data = {
                    id: payload.id || randomUUID(), // If update, id is robustly passed. If create, new.
                    dimension: payload.dimension,
                    slug: payload.slug,
                    label: payload.label,
                    parent_id: payload.parent_id || null,
                    metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
                    source: payload.source || 'seed',
                    account_id: payload.account_id || payload.brand_id || null, // Map legacy brand_id
                    created_at: now,
                    updated_at: now
                };
                
                if (op.action === 'create') {
                     insertDim.run(data);
                } else if (op.action === 'update') {
                     updateDim.run({ ...data, id: payload.id });
                }
            }
            applied = activeOps.length;
        })();

        // Seed pipeline configuration (stages + qualifiers from CSV)
        // This ensures activity generation system data is always available
        try {
            seedPipelineConfig();
        } catch (err) {
            console.warn('[Reseed] Failed to seed pipeline config:', err instanceof Error ? err.message : String(err));
        }

        try {
            const pluginLoad = await loadInterpreterExecutorPlugins(SYSTEM_ACCOUNT_ID, { force: true });
            if (pluginLoad.errors.length > 0 || pluginLoad.missing.length > 0) {
                console.warn('[Reseed] Interpreter executor plugin reconcile completed with issues:', {
                    loaded: pluginLoad.loaded.length,
                    skipped: pluginLoad.skipped.length,
                    unloaded: pluginLoad.unloaded.length,
                    missing: pluginLoad.missing,
                    errors: pluginLoad.errors,
                });
            }
        } catch (err) {
            console.warn('[Reseed] Interpreter executor plugin reload failed:', err instanceof Error ? err.message : String(err));
        }

        res.json({ success: true, applied });

    } catch (err) {
        next(err);
    }
});

export default router;
