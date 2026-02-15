import { DataRecordInput, EntityType } from '../core/types.js';
import { randomUUID } from 'crypto';

export const Factory = {
    createRecordInput: (overrides: Partial<DataRecordInput> = {}): DataRecordInput => {
        const type = overrides.type || 'product';
        const slug = overrides.slug || `${type}-${randomUUID().slice(0, 8)}`;
        
        return {
            type,
            slug,
            name: overrides.name || `Test ${type} ${slug}`,
            account_id: overrides.account_id || '00000000-0000-0000-0000-000000000000',
            data: overrides.data || { fieldGroups: [] },
            ...overrides
        };
    },
    
    // specialized factories
    createProduct: (overrides: Partial<DataRecordInput> = {}) => {
        return Factory.createRecordInput({ type: 'product', ...overrides });
    },

    createAccount: (overrides: Partial<{ id: string, slug: string, name: string }> = {}) => {
        return {
            id: overrides.id || randomUUID(),
            slug: overrides.slug || `acc-${randomUUID().slice(0, 8)}`,
            name: overrides.name || 'Test Account',
            account_class: 'business',
            type: 'client'
        };
    }
};
