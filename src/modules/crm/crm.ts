import { hooks } from '../../core/hooks.js';
import { db } from '../../core/db.js';
import { listRecords, createRelationship, getRecord, getRecordBySlug } from '../../core/records.js';
import { EntityType, FieldGroupStruct, FieldStruct, PropertyStruct } from '../../core/types.js';

// ============================================================================
// PERSONA DATA LOADING FROM DB
// ============================================================================

interface KineticRoutingConfig {
    routing_target: string;
    decay_rate: number;
}

interface PersonaData {
    slug: string;
    label: string;
    power_level: number;
    initial_health: number;
    kinetic_routing?: KineticRoutingConfig;
}

// Cache for persona data (loaded once from DB)
let personaDataCache: Map<string, PersonaData> | null = null;

/**
 * Load persona data from dimension_values table.
 * Results are cached after first load.
 */
function loadPersonaData(): Map<string, PersonaData> {
    if (personaDataCache) return personaDataCache;

    const rows = db.prepare(`
        SELECT slug, label, metadata
        FROM dimension_values
        WHERE dimension = 'persona' AND account_id IS NULL
    `).all() as Array<{ slug: string; label: string; metadata: string | null }>;

    personaDataCache = new Map();

    for (const row of rows) {
        const metadata = row.metadata ? JSON.parse(row.metadata) : {};

        // Extract slug without 'persona_' prefix if present
        const normalizedSlug = row.slug.replace(/^persona_/, '');

        personaDataCache.set(normalizedSlug, {
            slug: normalizedSlug,
            label: row.label,
            power_level: metadata.power_level ?? 1,
            initial_health: metadata.initial_health ?? 30,
            kinetic_routing: metadata.kinetic_routing,
        });
    }

    console.log(`[CRM] Loaded ${personaDataCache.size} persona definitions from DB`);
    return personaDataCache;
}

/**
 * Get persona data by slug. Returns undefined if not found.
 */
function getPersonaData(slug: string): PersonaData | undefined {
    const data = loadPersonaData();
    return data.get(slug);
}

/**
 * Get initial health score for a persona. Returns default (30) if not found.
 */
function getPersonaInitialHealth(slug: string | undefined): number {
    if (!slug) return 30;
    const persona = getPersonaData(slug);
    return persona?.initial_health ?? 30;
}

/**
 * Clear the persona cache (useful for testing or after seed updates)
 */
export function clearPersonaCache(): void {
    personaDataCache = null;
}

// --- CANONICAL FORMAT HELPERS ---
// These helpers abstract field access using canonical property names (nameField, fieldStructs, propertyStructs)

/**
 * Find a field by name within canonical fieldGroups.
 * Supports both canonical (fieldStructs/nameField) and legacy (fields/name) formats.
 */
function findField(fieldGroups: any[], fieldName: string): any | undefined {
    for (const g of fieldGroups) {
        // Try canonical format first (fieldStructs / nameField)
        const canonicalFields = g.fieldStructs || g.fields || [];
        const field = canonicalFields.find((f: any) =>
            (f.nameField === fieldName) || (f.name === fieldName)
        );
        if (field) return field;
    }
    return undefined;
}

/**
 * Get the value from a field (canonical propertyStructs or legacy value).
 */
function getFieldValue(field: any): any {
    if (!field) return undefined;
    // Canonical format: propertyStructs[0].valueProperty
    if (field.propertyStructs && field.propertyStructs.length > 0) {
        return field.propertyStructs[0].valueProperty;
    }
    // Legacy format: direct value
    return field.value;
}

/**
 * Set the value on a field (updates both formats for compatibility).
 */
function setFieldValue(field: any, value: any): void {
    if (!field) return;
    // Update canonical format
    if (!field.propertyStructs) {
        field.propertyStructs = [];
    }
    if (field.propertyStructs.length === 0) {
        field.propertyStructs.push({ valueProperty: value });
    } else {
        field.propertyStructs[0].valueProperty = value;
    }
    // Also update legacy for compatibility during migration
    field.value = value;
}

/**
 * Add a new field to the first fieldGroup in canonical format.
 */
function addFieldToGroup(fieldGroups: any[], fieldName: string, inputType: string, value: any): void {
    if (fieldGroups.length === 0) return;
    const group = fieldGroups[0];
    // Use canonical format (fieldStructs)
    if (!group.fieldStructs) group.fieldStructs = [];
    const newField: Partial<FieldStruct> = {
        idRefFieldRecord: crypto.randomUUID ? crypto.randomUUID() : `field_${Date.now()}`,
        nameField: fieldName,
        inputType: inputType as any,
        displayPosition: group.fieldStructs.length,
        isSelectMany: false,
        isSystem: false,
        propertyStructs: [{ valueProperty: value }]
    };
    group.fieldStructs.push(newField as FieldStruct);
}

// Helper: Extract domain
function getDomainFromEmail(email: string): string | null {
  const match = email.match(/@([^>]+)/);
  return match ? match[1].toLowerCase().trim() : null;
}

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- ALGO 0: EMAIL VALIDATION & NORMALIZATION ---
// First hook in the chain - validates and normalizes email before any other processing
hooks.onPreCreate('contact', async (input: any) => {
    const groups = (input.data?.fieldGroups || []) as any[];
    const emailField = findField(groups, 'Email');

    if (emailField) {
        const email = String(getFieldValue(emailField) || '');

        // Validate format
        if (email && !EMAIL_REGEX.test(email)) {
            throw new Error(`Invalid email format: ${email}`);
        }

        // Normalize to lowercase
        if (email) {
            setFieldValue(emailField, email.toLowerCase().trim());
        }
    }

    // Also check legacy data.email field (non-canonical format)
    if (input.data?.email) {
        if (!EMAIL_REGEX.test(input.data.email)) {
            throw new Error(`Invalid email format: ${input.data.email}`);
        }
        input.data.email = input.data.email.toLowerCase().trim();
    }
});

// --- ALGO 0.5: TAXONOMY VALIDATION (No Free Text Rule) ---
// Validates that constrained fields match dimension_values
hooks.onPreCreate('contact', async (input: any) => {
    const groups = (input.data?.fieldGroups || []) as any[];

    // Check job_title field (canonical format)
    const jobTitleField = findField(groups, 'Job Title') || findField(groups, 'job_title');
    const jobTitle = jobTitleField ? String(getFieldValue(jobTitleField) || '') : '';

    // Also check legacy data.job_title field
    const legacyJobTitle = input.data?.job_title;

    const titleToValidate = jobTitle || legacyJobTitle;

    if (titleToValidate) {
        // Normalize to slug format for lookup
        const slug = titleToValidate.toLowerCase().replace(/\s+/g, '-');

        // Check if value exists in dimension_values
        const exists = db.prepare(`
            SELECT id FROM dimension_values
            WHERE dimension = 'job_title' AND (slug = ? OR label = ?)
        `).get(slug, titleToValidate);

        if (!exists) {
            // Flag as invalid - add validation warning to metadata
            if (!input.metadata) input.metadata = {};
            input.metadata.validation_warnings = input.metadata.validation_warnings || [];
            input.metadata.validation_warnings.push({
                field: 'job_title',
                value: titleToValidate,
                reason: 'Value not found in taxonomy',
                requires_cleanup: true
            });

            // Store flag in data for later Data Activity creation
            if (!input.data) input.data = {};
            input.data.requires_data_cleanup = true;
            input.data.invalid_fields = input.data.invalid_fields || [];
            input.data.invalid_fields.push('job_title');

            console.log(`[CRM] Taxonomy Warning: job_title "${titleToValidate}" not in dimension_values`);
        }
    }
});

// --- ALGO 2.1: ACCOUNT RESOLUTION (Resolution Logic) ---
// (Formerly Algo 2, renamed to free "Algo 2" for Entropy)
hooks.onPreCreate('contact', async (input: any) => {
    try {
        const groups = (input.data?.fieldGroups || []) as any[];

        // 1. Extract Email
        const emailField = findField(groups, 'Email');
        const email = emailField ? String(getFieldValue(emailField) || '') : '';

        if (email) {
            const domain = getDomainFromEmail(email);
            if (domain) {
                // 2. Query Accounts
                const allAccounts = listRecords(input.account_id, 'account' as EntityType);
                const match = allAccounts.find(acc => {
                    const accGroups = (acc.data?.fieldGroups || []) as any[];
                    const websiteField = findField(accGroups, 'Website');
                    const websiteVal = getFieldValue(websiteField);
                    return websiteVal && String(websiteVal).includes(domain);
                });

                if (match) {
                    // Store resolved ID for post-create linking
                    input.metadata = { ...input.metadata, resolvedAccountId: match.id, resolvedAccountName: match.name };
                    console.log(`[CRM] Resolved Account for ${email}: ${match.name}`);

                    // 3. Update 'Account' field for UI
                    const accField = findField(groups, 'Account');
                    if (accField) {
                        setFieldValue(accField, match.name);
                    }
                }
            }
        }
    } catch (e) {
        console.warn('[CRM] Account Resolution Failed:', e);
    }
});

// --- ALGO 2.0: ENTROPY DAEMON ---
// "Entropy is a dynamic, decaying energetic state."
// Formula: H(t) = H0 * e^(-γt)
// Where: H0 = initial health score, γ = decay rate, t = time in days

// Default decay rate (γ) per day - higher = faster decay
const DEFAULT_DECAY_RATE = 0.05; // ~5% decay per day without interaction

/**
 * Calculate the decayed health score for a record.
 * Health decays exponentially based on time since last interaction.
 *
 * @param record - The record to calculate entropy for
 * @param options - Optional parameters
 * @returns The decayed health score (0-100)
 */
export function calculateEntropy(
    record: any,
    options: { decayRate?: number; referenceDate?: Date } = {}
): number {
    const { decayRate = DEFAULT_DECAY_RATE, referenceDate = new Date() } = options;

    // 1. Get current Health Score (H0)
    let healthScore = 100; // Default starting health
    const groups = (record.data?.fieldGroups || []) as any[];

    // Try both canonical and legacy field names
    let healthField = findField(groups, 'Health Score');
    if (!healthField) healthField = findField(groups, 'health_score');
    const healthValue = getFieldValue(healthField);
    if (healthValue !== undefined) {
        healthScore = Number(healthValue) || 100;
    }

    // 2. Calculate time delta since last interaction (in days)
    // Use updated_at as proxy for last interaction, or a dedicated field
    let lastInteractionDate: Date;

    // Try to find explicit last_interaction field
    let interactionField = findField(groups, 'Last Interaction');
    if (!interactionField) interactionField = findField(groups, 'last_interaction');
    const interactionValue = getFieldValue(interactionField);
    if (interactionValue) {
        lastInteractionDate = new Date(interactionValue);
    }

    // Fall back to updated_at
    if (!lastInteractionDate!) {
        lastInteractionDate = new Date(record.updated_at || record.created_at || referenceDate);
    }

    const timeDeltaMs = referenceDate.getTime() - lastInteractionDate.getTime();
    const timeDeltaDays = timeDeltaMs / (1000 * 60 * 60 * 24);

    // Only decay if time has passed
    if (timeDeltaDays <= 0) {
        return healthScore;
    }

    // 3. Apply Decay: H(t) = H0 * e^(-γt)
    const decayedScore = healthScore * Math.exp(-decayRate * timeDeltaDays);

    // Round to 2 decimal places and clamp to 0-100
    return Math.max(0, Math.min(100, Math.round(decayedScore * 100) / 100));
}

/**
 * Apply entropy decay to a record and update it.
 * Can be called on-demand or via scheduled job.
 *
 * @param record - The record to apply entropy to
 * @param options - Optional parameters including decay rate
 * @returns Updated health score
 */
export function applyEntropy(
    record: any,
    options: { decayRate?: number; dryRun?: boolean } = {}
): { originalScore: number; decayedScore: number; daysSinceInteraction: number } {
    const groups = (record.data?.fieldGroups || []) as any[];

    // Get original health score
    let originalScore = 100;
    let healthField = findField(groups, 'Health Score');
    if (!healthField) healthField = findField(groups, 'health_score');
    const healthValue = getFieldValue(healthField);
    if (healthValue !== undefined) {
        originalScore = Number(healthValue) || 100;
    }

    // Calculate decayed score
    const decayedScore = calculateEntropy(record, options);

    // Calculate days since interaction for reporting
    let lastInteractionDate = new Date(record.updated_at || record.created_at || new Date());
    let interactionField = findField(groups, 'Last Interaction');
    if (!interactionField) interactionField = findField(groups, 'last_interaction');
    const interactionValue = getFieldValue(interactionField);
    if (interactionValue) {
        lastInteractionDate = new Date(interactionValue);
    }
    const daysSinceInteraction = Math.floor(
        (new Date().getTime() - lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Update record if not dry run
    if (!options.dryRun) {
        // Re-find the health field for update
        let healthFieldToUpdate = findField(groups, 'Health Score');
        if (!healthFieldToUpdate) healthFieldToUpdate = findField(groups, 'health_score');

        if (healthFieldToUpdate) {
            setFieldValue(healthFieldToUpdate, decayedScore);
        } else if (groups.length > 0) {
            // If no health field exists, add one using canonical format
            addFieldToGroup(groups, 'Health Score', 'number', decayedScore);
        }

        console.log(`[CRM] Entropy Applied: ${record.name || record.slug} - Health ${originalScore} -> ${decayedScore} (${daysSinceInteraction} days since interaction)`);
    }

    return { originalScore, decayedScore, daysSinceInteraction };
}

/**
 * Batch apply entropy to all records of a given type.
 * Designed to be called by a scheduled job.
 *
 * @param accountId - The account to process
 * @param recordType - The type of records to process (e.g., 'contact', 'account')
 * @param options - Processing options
 */
export function runEntropyDaemon(
    accountId: string,
    recordType: EntityType,
    options: { decayRate?: number; dryRun?: boolean } = {}
): { processed: number; updated: number; results: any[] } {
    const records = listRecords(accountId, recordType);
    const results: any[] = [];
    let updated = 0;

    console.log(`[CRM] Entropy Daemon: Processing ${records.length} ${recordType} records...`);

    for (const record of records) {
        const result = applyEntropy(record, options);
        results.push({
            id: record.id,
            name: record.name,
            ...result
        });

        if (result.decayedScore !== result.originalScore) {
            updated++;
        }
    }

    console.log(`[CRM] Entropy Daemon: Complete. ${updated}/${records.length} records updated.`);

    return { processed: records.length, updated, results };
}

// --- ALGO 4: KINETIC ROUTING (GENERIC INTERPRETER) ---
import { PersonaType } from './types.js';

// NOTE: Persona data is now loaded from the dimension_values table at runtime.
// See loadPersonaData() at the top of this file for the implementation.
// The previous PERSONA_MEMORY and PERSONA_HEALTH_SCORES constants have been removed
// and replaced with database-driven configuration.

hooks.onPreCreate('contact', async (input: any) => {
    try {
        const groups = (input.data?.fieldGroups || []) as any[];
        let personaSlug = '';

        // 1. Extract Persona Signal
        const personaField = findField(groups, 'Persona');
        const personaValue = getFieldValue(personaField);
        if (personaValue) {
            // Normalization
            const val = String(personaValue);
            if (val === 'Decision Maker') personaSlug = PersonaType.DecisionMaker;
            else if (val === 'End User') personaSlug = PersonaType.EndUser;
            else if (val === 'Influencer') personaSlug = PersonaType.Influencer;
            else personaSlug = val.toLowerCase().replace(/ /g, '_'); // Fallback
        }

        // Calculate initial health score based on persona (loaded from DB)
        const initialHealth = getPersonaInitialHealth(personaSlug);

        let healthField = findField(groups, 'Health Score');
        if (!healthField) healthField = findField(groups, 'health_score');

        if (healthField) {
            setFieldValue(healthField, initialHealth);
        } else {
            addFieldToGroup(groups, 'Health Score', 'number', initialHealth);
        }

        // Also set in legacy data format for test compatibility
        if (!input.data) input.data = {};
        input.data.health_score = initialHealth;

        console.log(`[CRM] Initial Health Score: ${initialHealth} (persona: ${personaSlug || 'unknown'})`);

        const personaData = personaSlug ? getPersonaData(personaSlug) : undefined;
        if (personaData?.kinetic_routing) {
            const rule = personaData.kinetic_routing;

            // 2. Execute Routing Rule (Soft-Coded)
            const requiredRole = rule.routing_target.replace('role_', '');

            const agent = db.prepare(`
                SELECT user_id FROM user_accounts
                WHERE account_id = ? AND permission_level = ?
                LIMIT 1
            `).get(input.account_id, requiredRole) as any;

            if (agent) {
                const ownerField = findField(groups, 'Owner');
                if (ownerField) {
                    setFieldValue(ownerField, agent.user_id);
                } else {
                    addFieldToGroup(groups, 'Owner', 'Record', agent.user_id);
                }
                console.log(`[CRM] Kinetic Routing: ${personaSlug} (${personaData.power_level}) -> Assigned to ${requiredRole} (${agent.user_id})`);
            } else {
                console.log(`[CRM] Kinetic Routing: No agent found for role ${requiredRole}`);
            }
        }
    } catch (e) {
        console.warn('[CRM] Kinetic Routing Failed:', e);
    }
});

// --- ALGO 10.3: KINETIC INTEGRATION (ACTIVITY ROUTING) ---
hooks.onPreCreate('activity', async (input: any) => {
    try {
        const groups = (input.data?.fieldGroups || []) as any[];

        // 1. Find Contact Reference
        const contactField = findField(groups, 'Contact');
        const contactRef = getFieldValue(contactField);

        if (contactRef) {
            // 2. Resolve Contact
            let contact = getRecordBySlug(input.account_id, String(contactRef)) || getRecord(String(contactRef));

            if (contact) {
                // 3. Check Persona Power
                const contactGroups = (contact.data?.fieldGroups || []) as any[];
                const personaField = findField(contactGroups, 'Persona');
                const personaValue = getFieldValue(personaField);
                let personaSlug = '';

                if (personaValue) {
                    const val = String(personaValue);
                    if (val === 'Decision Maker') personaSlug = PersonaType.DecisionMaker;
                    else if (val === 'End User') personaSlug = PersonaType.EndUser;
                    else if (val === 'Influencer') personaSlug = PersonaType.Influencer;
                    else personaSlug = val.toLowerCase().replace(/ /g, '_');
                }

                const activityPersonaData = personaSlug ? getPersonaData(personaSlug) : undefined;
                if (activityPersonaData) {
                    const powerLevel = activityPersonaData.power_level;

                    // 4. Kinetic Surge Rule
                    if (powerLevel >= 3) { // Decision Maker
                        // Route to Senior/Admin (Simulate Surge)
                        const targetRole = 'role_admin';
                        const requiredRole = targetRole.replace('role_', '');

                        const agent = db.prepare(`
                            SELECT user_id FROM user_accounts
                            WHERE account_id = ? AND permission_level = ?
                            LIMIT 1
                        `).get(input.account_id, requiredRole) as any;

                        if (agent) {
                            // Assign Owner
                            const ownerField = findField(groups, 'Owner');
                            if (ownerField) {
                                setFieldValue(ownerField, agent.user_id);
                            } else {
                                addFieldToGroup(groups, 'Owner', 'Record', agent.user_id);
                            }
                            console.log(`[CRM] Kinetic Surge: Activity with ${personaSlug} (Power ${powerLevel}) routed to ${requiredRole} (${agent.user_id})`);
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.warn('[CRM] Activity Routing Failed:', e);
    }
});

// --- LINKAGE: CREATE RELATIONSHIP (Domain-based Auto-linking) ---
hooks.onPostCreate('contact', async (record: any) => {
    const groups = (record.data?.fieldGroups || []) as any[];

    // Try field-based account link first
    const accountField = findField(groups, 'Account');
    const accountName = getFieldValue(accountField);

    // Get email domain for domain-based matching
    const emailField = findField(groups, 'Email');
    const email = getFieldValue(emailField) || record.data?.email;
    const domain = email ? getDomainFromEmail(String(email)) : null;

    // Check for resolved account from PreCreate hook (ALGO 2.1)
    const resolvedAccountId = record.metadata?.resolvedAccountId;

    const allAccounts = listRecords(record.account_id, 'account' as EntityType);
    let matchedAccount: any = null;

    // Priority 1: Pre-resolved account from ALGO 2.1
    if (resolvedAccountId) {
        matchedAccount = allAccounts.find(acc => acc.id === resolvedAccountId);
    }
    // Priority 2: Name match from Account field
    if (!matchedAccount && accountName) {
        matchedAccount = allAccounts.find(acc => acc.name === String(accountName));
    }
    // Priority 3: Domain match from email
    if (!matchedAccount && domain) {
        matchedAccount = allAccounts.find(acc => {
            const accDomain = acc.data?.domain || acc.data?.website;
            if (!accDomain) return false;
            const accDomainLower = String(accDomain).toLowerCase();
            return accDomainLower === domain || accDomainLower.includes(domain);
        });
    }

    if (matchedAccount) {
        try {
            createRelationship({
                from_record_id: record.id,
                to_record_id: matchedAccount.id,
                relationship_type: 'works_at',
                data: {
                    linked_by: 'auto',
                    linked_at: new Date().toISOString()
                }
            });
            console.log(`[CRM] Auto-linked ${record.name} to ${matchedAccount.name} (domain: ${domain})`);
        } catch (e) {
            console.warn('[CRM] Auto-link failed:', e);
        }
    }
});

// --- DATA CLEANUP: Create Activity when taxonomy violations detected ---
hooks.onPostCreate('contact', async (record: any) => {
    // Check if record was flagged for data cleanup during pre-create validation
    if (record.data?.requires_data_cleanup && record.data?.invalid_fields?.length > 0) {
        try {
            const { createDataCleanupActivity } = await import('../activities/generation.js');
            await createDataCleanupActivity(
                record.id,
                'contact',
                record.data.invalid_fields,
                record.account_id
            );
            console.log(`[CRM] Created data cleanup activity for contact ${record.id}`);
        } catch (err) {
            console.warn('[CRM] Failed to create data cleanup activity:', err instanceof Error ? err.message : String(err));
        }
    }
});

// --- ANALYTICS: KINETIC FORECAST ---
export function getKineticForecast(accountId: string) {
    // 1. Get all Opportunities
    const opportunities = listRecords(accountId, 'opportunity' as EntityType);
    let totalKineticValue = 0;

    for (const opp of opportunities) {
        // Extract Value and Probability and Contact
        const groups = (opp.data?.fieldGroups || []) as any[];

        // Get Value
        const valueField = findField(groups, 'Value');
        const value = Number(getFieldValue(valueField) || 0);

        // Get Probability
        const probField = findField(groups, 'Probability');
        let probability = 0.5; // Default
        const probValue = getFieldValue(probField);
        if (probValue !== undefined) {
            let prob = Number(probValue || 0);
            // Handle both 50 and 0.5
            if (prob > 1) prob = prob / 100;
            probability = prob;
        }

        // Get Contact Reference
        const contactField = findField(groups, 'Contact');
        const contactRef = getFieldValue(contactField);

        // 2. Resolve Contact & Power
        let powerLevel = 1; // Default
        if (contactRef) {
            const contact = getRecordBySlug(accountId, String(contactRef)) || getRecord(String(contactRef));
            if (contact) {
                // Extract Persona
                const contactGroups = (contact.data?.fieldGroups || []) as any[];
                const personaField = findField(contactGroups, 'Persona');
                const personaValue = getFieldValue(personaField);

                if (personaValue) {
                    const val = String(personaValue);
                    let pSlug = '';
                    if (val === 'Decision Maker') pSlug = PersonaType.DecisionMaker;
                    else if (val === 'End User') pSlug = PersonaType.EndUser;
                    else if (val === 'Influencer') pSlug = PersonaType.Influencer;

                    const forecastPersonaData = pSlug ? getPersonaData(pSlug) : undefined;
                    if (forecastPersonaData) {
                        powerLevel = forecastPersonaData.power_level;
                    }
                }
            }
        }

        // 3. Integral Calculation
        // Kinetic Value = (Money * Probability) * (Persona Power)
        const weightedValue = (value * probability) * powerLevel;
        totalKineticValue += weightedValue;
    }

    return {
        account_id: accountId,
        kinetic_forecast: totalKineticValue,
        opportunity_count: opportunities.length
    };
}
