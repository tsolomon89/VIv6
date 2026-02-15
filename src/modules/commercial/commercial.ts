
import crypto from 'crypto';
import { DataRecord, DataRecordInput, OPPORTUNITY_STAGES, OpportunityStage, FieldStruct } from '../../core/types.js';
import { getRecord, updateRecord, createRecord } from '../../core/records.js';
import { hooks } from '../../core/hooks.js';
import { calculateDealYield, STAGE_PROBABILITY } from './rational.js';
import { setOpportunityStage } from '../../core/modifier.js';
import { traverseRecord } from '../../core/traversal.js';

// --- CANONICAL FORMAT HELPERS ---

function findField(fieldGroups: any[], fieldName: string): any | undefined {
    for (const g of fieldGroups || []) {
        const fields = g.fieldStructs || g.fields || [];
        const field = fields.find((f: any) =>
            (f.nameField === fieldName) || (f.name === fieldName)
        );
        if (field) return field;
    }
    return undefined;
}

function getFieldValue(field: any): any {
    if (!field) return undefined;
    if (field.propertyStructs && field.propertyStructs.length > 0) {
        return field.propertyStructs[0].valueProperty;
    }
    return field.value;
}

function setFieldValue(field: any, value: any): void {
    if (!field) return;
    if (!field.propertyStructs) field.propertyStructs = [];
    if (field.propertyStructs.length === 0) {
        field.propertyStructs.push({ valueProperty: value });
    } else {
        field.propertyStructs[0].valueProperty = value;
    }
    field.value = value; // Dual-write for compatibility
}

function addFieldToGroup(fieldGroups: any[], fieldName: string, inputType: string, value: any): void {
    if (fieldGroups.length === 0) {
        fieldGroups.push({
            idRefFieldGroupRecord: crypto.randomUUID(),
            nameFieldGroup: 'Commercial Details',
            fieldStructs: []
        });
    }
    const group = fieldGroups[0];
    if (!group.fieldStructs) group.fieldStructs = [];
    const newField: Partial<FieldStruct> = {
        idRefFieldRecord: crypto.randomUUID(),
        nameField: fieldName,
        inputType: inputType as any,
        displayPosition: group.fieldStructs.length,
        isSelectMany: false,
        isSystem: false,
        propertyStructs: [{ valueProperty: value }]
    };
    group.fieldStructs.push(newField as FieldStruct);
}

function setOrCreateField(fieldGroups: any[], fieldName: string, inputType: string, value: any): void {
    const field = findField(fieldGroups, fieldName);
    if (field) {
        setFieldValue(field, value);
    } else {
        addFieldToGroup(fieldGroups, fieldName, inputType, value);
    }
}

export class CommercialEngine {

    // Helper: Get Stage from Recursive Structure or Legacy
    static getStage(record: DataRecordInput | DataRecord): OpportunityStage | undefined {
        // 1. Try Recursive Field "Opportunity Stage"
        let foundStage: OpportunityStage | undefined;
        traverseRecord(record, (node, meta) => {
            if (meta.type === 'field' && node.nameField === 'Opportunity Stage') {
                 const val = node.propertyStructs?.[0]?.valueProperty;
                 if (typeof val === 'string' && OPPORTUNITY_STAGES.includes(val as any)) {
                     foundStage = val as OpportunityStage;
                 }
            }
        });
        if (foundStage) return foundStage;

        // 2. Fallback to Legacy generic data (for migration)
        const data = record.data || { fieldGroups: [] };
        return (data as any).opportunity_stage as OpportunityStage | undefined
            || (record as any).opportunity_stage as OpportunityStage | undefined;
    }

    // 1. Taxonomy Enforcement
    static validateStage(input: DataRecordInput) {
        if (input.type !== 'opportunity') return;
        
        const stage = CommercialEngine.getStage(input);

        if (stage && !OPPORTUNITY_STAGES.includes(stage)) {
            throw new Error(`Invalid Opportunity Stage: ${stage}. Must be one of: ${OPPORTUNITY_STAGES.join(', ')}`);
        }
    }

    // 2. Stage Logic
    // MQL: Verified Contact Info (Implicit on creation)
    // SQL: Intent Verified (Requires 'intent_verified' boolean in data)
    // FTP: First Time Purchase (Closed Won)
    // RTP: Retention (Renewal)

    static async transitionStage(opportunityId: string, newStage: OpportunityStage) {
        let record = getRecord(opportunityId);
        if (!record) throw new Error('Opportunity not found');
        if (record.type !== 'opportunity') throw new Error('Record is not an opportunity');

        const currentData = record.data || { fieldGroups: [] };
        const fieldGroups = currentData.fieldGroups || [];

        // Read current stage from canonical format
        const currentStage = CommercialEngine.getStage(record) || 'mql';
        console.log(`[CommercialEngine] Transitioning ${record.id} from ${currentStage} to ${newStage}`);

        // Validation Logic for Transitions
        if (newStage === 'sql') {
            // Gate: Must have intent_verified
            const intentField = findField(fieldGroups, 'Intent Verified');
            const intentVerified = getFieldValue(intentField);
            if (!intentVerified) {
                console.warn('[CommercialEngine] Warning: Moving to SQL without Verified Intent');
            }
        }

        // Calculate Attributes for New Stage
        const newProbability = STAGE_PROBABILITY[newStage];

        // Update fields in canonical format
        setOpportunityStage(record, newStage);
        setOrCreateField(fieldGroups, 'Probability', 'number', newProbability);
        setOrCreateField(fieldGroups, 'Stage Last Updated', 'date', new Date().toISOString());

        // Ensure fieldGroups is attached to data
        currentData.fieldGroups = fieldGroups;
        record.data = currentData;

        // Calculate Yield
        const newYield = calculateDealYield(record);
        setOrCreateField(fieldGroups, 'Projected Yield', 'number', newYield);

        // Apply Update
        updateRecord(opportunityId, {
            data: currentData
        });

        // Refetch to get consistent state
        const updatedRecord = getRecord(opportunityId);

        // Post-Transition Logic (Side Effects)
        if (newStage === 'ftp' && updatedRecord) {
            await CommercialEngine.handleClosedWon(updatedRecord);
        }

        return updatedRecord;
    }

    static async handleClosedWon(record: DataRecord) {
        console.log(`[CommercialEngine] Opportunity ${record.id} Closed Won (FTP).`);
        // Logic:
        // 1. Mark status as 'won'
        // 2. If this is a subscription, generate the RTP (Renewal) Opportunity immediately (Recursive Loop)

        const data = record.data || { fieldGroups: [] };
        const fieldGroups = data.fieldGroups || [];

        // Check if renewal is applicable (default true for now)
        const isRenewable = true;

        if (isRenewable) {
            // Idempotency: Check if RTP already exists
            console.log(`[CommercialEngine] Generating RTP (Retention) Opportunity...`);

            // Check if we already have an RTP linked
            const { getRelationshipsFrom } = await import('../../core/records.js');
            const existing = getRelationshipsFrom(record.id, 'renewal');
            if (existing.length > 0) {
                console.log('[CommercialEngine] RTP already exists. Skipping.');
                return;
            }

            const renewalDate = new Date();
            renewalDate.setFullYear(renewalDate.getFullYear() + 1); // +1 Year

            // Get values from canonical format or legacy properties
            const amountField = findField(fieldGroups, 'Amount');
            const amount = getFieldValue(amountField)
                || (data as any).amount
                || (data as any).projected_revenue
                || 0;

            // Create RTP with canonical format
            const rtpFieldGroups: any[] = [];
            addFieldToGroup(rtpFieldGroups, 'Opportunity Stage', 'select', 'rtp');
            addFieldToGroup(rtpFieldGroups, 'Source Opportunity ID', 'Record', record.id);
            addFieldToGroup(rtpFieldGroups, 'Amount', 'currency', amount);
            addFieldToGroup(rtpFieldGroups, 'Target Close Date', 'date', renewalDate.toISOString());
            addFieldToGroup(rtpFieldGroups, 'Probability', 'number', STAGE_PROBABILITY['rtp']);

            const rtpInput: DataRecordInput = {
                type: 'opportunity',
                name: `Renew: ${record.name}`,
                slug: `renew-${record.slug}-${Date.now()}`, // Unique Slug
                account_id: record.account_id,
                data: {
                    fieldGroups: rtpFieldGroups,
                    // Legacy properties for backward compatibility
                    opportunity_stage: 'rtp',
                    source_opportunity_id: record.id,
                    projected_revenue: amount,
                    probability: STAGE_PROBABILITY['rtp']
                }
            };

            // System Context for creation (bypass permissions)
            const systemContext = { user: { id: 'system', permission_level: 'admin' } };

            // Pre-calculate yield for the new RTP
            const rtpYield = calculateDealYield({ ...rtpInput, id: 'temp' } as DataRecord);
            addFieldToGroup(rtpFieldGroups, 'Projected Yield', 'number', rtpYield);

            const newRtp = await createRecord(rtpInput, systemContext);

            // Create Link
            await import('../../core/records.js').then(r => r.createRelationship({
                from_record_id: record.id,
                to_record_id: newRtp.id,
                relationship_type: 'renewal'
            }));
        }
    }
    static async addItem(opportunityId: string, productId: string, quantity: number = 1) {
        // 1. Fetch Opportunity
        const opportunity = getRecord(opportunityId);
        if (!opportunity) throw new Error('Opportunity not found');
        
        // 2. Fetch Product (Catalog Item)
        const product = getRecord(productId);
        if (!product) throw new Error('Product not found');

        // 3. Create Snapshot (OpportunityItem)
        // We copy price/name BY VALUE to protect against future catalog changes.
        const item: any = {
            id: crypto.randomUUID(),
            product_id: product.id,
            name: product.name,
            sku: product.data.sku || product.slug,
            // Handle different price locations (root data vs fieldGroups)
            // For now assume simple data.price or fallback to 0
            price: Number(product.data.price) || 0,
            currency: product.data.currency || 'USD',
            quantity: quantity,
            added_at: new Date().toISOString()
        };

        // 4. Update Opportunity
        const currentData = opportunity.data || {};
        const items = (currentData.line_items as any[]) || [];
        items.push(item);

        // Recalculate Totals
        const totalValue = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        
        // Update data with new amount
        const updatedData = {
            ...currentData,
            line_items: items,
            amount: totalValue
        };

        // Recalculate Yield with new Amount
        const tempRecord = { ...opportunity, data: updatedData };
        const newYield = calculateDealYield(tempRecord);

        updateRecord(opportunityId, {
            data: {
                ...updatedData,
                projected_yield: newYield
            }
        });

        return getRecord(opportunityId);
    }

    static async removeItem(opportunityId: string, itemId: string) {
        const opportunity = getRecord(opportunityId);
        if (!opportunity) throw new Error('Opportunity not found');

        const currentData = opportunity.data || {};
        const items = (currentData.line_items as any[]) || [];
        
        const newItems = items.filter(i => i.id !== itemId);
        
        if (newItems.length === items.length) return opportunity; // No change

        // Recalculate Totals
        const totalValue = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        
        const updatedData = {
            ...currentData,
            line_items: newItems,
            amount: totalValue
        };

        // Recalculate Yield
        const tempRecord = { ...opportunity, data: updatedData };
        const newYield = calculateDealYield(tempRecord);

        updateRecord(opportunityId, {
            data: {
                ...updatedData,
                projected_yield: newYield
            }
        });

        return getRecord(opportunityId);
    }

    static async updateItemQuantity(opportunityId: string, itemId: string, quantity: number) {
        const opportunity = getRecord(opportunityId);
        if (!opportunity) throw new Error('Opportunity not found');

        const currentData = opportunity.data || {};
        const items = (currentData.line_items as any[]) || [];
        
        const itemIndex = items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) throw new Error('Item not found');

        // Update Item
        const newItems = [...items];
        newItems[itemIndex] = { ...newItems[itemIndex], quantity: Math.max(0, quantity) }; // Prevent negative

        // Recalculate Totals
        const totalValue = newItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        
        const updatedData = {
            ...currentData,
            line_items: newItems,
            amount: totalValue
        };

        // Recalculate Yield
        const tempRecord = { ...opportunity, data: updatedData };
        const newYield = calculateDealYield(tempRecord);

        updateRecord(opportunityId, {
            data: {
                ...updatedData,
                projected_yield: newYield
            }
        });

        return getRecord(opportunityId);
    }
}

// --- Register Hooks ---

// 1. Enforce Taxonomy on Create
hooks.onPreCreate('opportunity', async (input: DataRecordInput) => {
    console.log('[CommercialEngine] Validating new Opportunity...');
    CommercialEngine.validateStage(input);

    // Ensure data and fieldGroups exist
    if (!input.data) input.data = { fieldGroups: [] };
    if (!input.data.fieldGroups) input.data.fieldGroups = [];
    const fieldGroups = input.data.fieldGroups;

    // Default to MQL if not set
    let stage = CommercialEngine.getStage(input);
    if (!stage) {
        setOpportunityStage(input, 'mql');
        stage = 'mql';
    }

    // Set probability in canonical format
    const probField = findField(fieldGroups, 'Probability');
    const probability = STAGE_PROBABILITY[stage];
    if (!probField || getFieldValue(probField) === undefined) {
        setOrCreateField(fieldGroups, 'Probability', 'number', probability);
    }
    // Also set legacy property for backward compatibility
    (input.data as any).probability = probability;

    // Calculate Yield
    const tempRecord = { ...input } as any;
    const yieldVal = calculateDealYield(tempRecord);
    setOrCreateField(fieldGroups, 'Projected Yield', 'number', yieldVal);
    // Also set legacy property for backward compatibility
    (input.data as any).projected_yield = yieldVal;
});

// 2. Enforce Transition Logic on Update
hooks.onPreUpdate('opportunity', async (input: DataRecordInput) => {
    // We need to fetch the current state to compare
    // input has the *new* state merged.
    if (!input.id) return;

    const current = getRecord(input.id);
    if (!current) return;

    // Ensure data and fieldGroups exist
    if (!input.data) input.data = { fieldGroups: [] };
    if (!input.data.fieldGroups) input.data.fieldGroups = [];
    const fieldGroups = input.data.fieldGroups;

    const currentStage = CommercialEngine.getStage(current) || 'mql';
    const newStage = CommercialEngine.getStage(input);

    // Detect Stage Change
    if (newStage && newStage !== currentStage) {
        console.log(`[CommercialEngine] Transitioning Opportunity ${input.id} from ${currentStage} to ${newStage}`);

        // Sync Recursive Structure if it was only updated via legacy prop
        setOpportunityStage(input, newStage);

        // Validate
        CommercialEngine.validateStage(input);

        // Transition Logic
        if (newStage === 'sql') {
            const currentFieldGroups = current.data?.fieldGroups || [];
            const intentField = findField(fieldGroups, 'Intent Verified') || findField(currentFieldGroups, 'Intent Verified');
            const intentVerified = getFieldValue(intentField);
            if (!intentVerified) {
                console.warn('[CommercialEngine] Warning: Moving to SQL without Verified Intent');
            }
        }

        // Update Probability in canonical format
        const newProbability = STAGE_PROBABILITY[newStage];
        setOrCreateField(fieldGroups, 'Probability', 'number', newProbability);
        // Also set legacy property
        (input.data as any).probability = newProbability;
    }

    // Always Recalculate Yield on Update (in case amount or date changed)
    const tempRecord = { ...input } as any;
    const newYield = calculateDealYield(tempRecord);
    setOrCreateField(fieldGroups, 'Projected Yield', 'number', newYield);
    // Also set legacy property
    (input.data as any).projected_yield = newYield;
});

// 3. Side Effects on Update
hooks.onPostUpdate('opportunity', async (record: DataRecordInput | DataRecord) => {
    const stage = CommercialEngine.getStage(record);

    if (stage === 'ftp' && (record as DataRecord).id) {
        // We only trigger if it WASN'T already processed (idempotency handled in handleClosedWon)
        await CommercialEngine.handleClosedWon(record as DataRecord);
    }
});

console.log('[CommercialEngine] Loaded.');
