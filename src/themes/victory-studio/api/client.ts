import { DataRecord, DataRecordInput, EntityType, EntityData } from '../../../core/types';

// Re-export for backward compatibility
export type Entity = DataRecord;
export type { EntityData };

const API_BASE = 'http://localhost:3001/api';

export const apiClient = {
    async listEntities(type?: string, accountId?: string): Promise<DataRecord[]> {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (accountId) params.append('account_id', accountId);

        const res = await fetch(`${API_BASE}/records?${params}`);
        if (!res.ok) throw new Error('Failed to fetch records');
        return res.json();
    },

    async getEntity(id: string): Promise<DataRecord> {
        const res = await fetch(`${API_BASE}/records/${id}`);
        if (!res.ok) throw new Error('Failed to fetch record');
        return res.json();
    },

    async createEntity(input: Partial<DataRecordInput>): Promise<DataRecord> {
        const res = await fetch(`${API_BASE}/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });
        if (!res.ok) throw new Error('Failed to create record');
        return res.json();
    },

    async updateEntity(id: string, updates: Partial<DataRecordInput>): Promise<DataRecord> {
        const res = await fetch(`${API_BASE}/records/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update record');
        return res.json();
    },

    async deleteEntity(id: string): Promise<void> {
        const res = await fetch(`${API_BASE}/records/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete record');
    },

    async rewriteContent(text: string, context?: any): Promise<string> {
        const res = await fetch(`${API_BASE}/agent/rewrite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, context })
        });
        if (!res.ok) throw new Error('Rewrite failed');
        const data = await res.json();
        return data.suggested;
    },

    /**
     * Upload an image file to the server.
     * Returns the URL of the uploaded image.
     */
    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Failed to upload image');
        const data = await res.json();
        return data.url;
    },

    // =========================================================================
    // Pages API (Webbuilder Integration)
    // =========================================================================

    /**
     * List all page assets
     */
    async listPages(accountId?: string, subjectType?: string): Promise<PageAsset[]> {
        const params = new URLSearchParams();
        if (accountId) params.append('account_id', accountId);
        if (subjectType) params.append('subject_type', subjectType);

        const res = await fetch(`${API_BASE}/pages?${params}`);
        if (!res.ok) throw new Error('Failed to fetch pages');
        return res.json();
    },

    /**
     * Get a page by ID or slug, optionally with resolved bindings
     */
    async getPage(idOrSlug: string, resolve = false): Promise<PageAsset> {
        const res = await fetch(`${API_BASE}/pages/${idOrSlug}?resolve=${resolve}`);
        if (!res.ok) throw new Error('Failed to fetch page');
        return res.json();
    },

    /**
     * Update a page
     */
    async updatePage(id: string, updates: Partial<PageAsset>): Promise<PageAsset> {
        const res = await fetch(`${API_BASE}/pages/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update page');
        return res.json();
    },

    // =========================================================================
    // Presets API
    // =========================================================================

    /**
     * List all presentation presets
     */
    async listPresets(): Promise<PresentationPresetAPI[]> {
        const res = await fetch(`${API_BASE}/presets`);
        if (!res.ok) throw new Error('Failed to fetch presets');
        return res.json();
    },

    /**
     * Get a preset by key
     */
    async getPreset(key: string): Promise<PresentationPresetAPI> {
        const res = await fetch(`${API_BASE}/presets/${key}`);
        if (!res.ok) throw new Error('Failed to fetch preset');
        return res.json();
    }
};

// =========================================================================
// Types for Pages/Presets API
// =========================================================================

export interface PageAsset {
    id: string;
    slug: string;
    name: string;
    type: string;
    account_id: string;
    data: {
        attribution?: {
            channel: string;
            medium: string;
            source: string;
            referralType: string;
            version: string;
        };
        pageConfig?: {
            schemaVersion: number;
            pageContext: { kind: string };
            pageSubject: { target: string; cardinality: string };
            templateKey?: string;
        };
        sections?: SectionInstanceAPI[];
        fieldGroups?: unknown[];
    };
    compiledSections?: CompiledSectionAPI[];
    created_at: string;
    updated_at: string;
}

export interface SectionInstanceAPI {
    id: string;
    binding: {
        kind: 'self' | 'related' | 'view';
        target?: string;
        cardinality?: 'one' | 'many';
        relationKey?: string;
    };
    presentationKey: string;
    placement: { slot: string; order?: number };
    overrides?: Record<string, unknown>;
}

export interface CompiledSectionAPI {
    id: string;
    binding: SectionInstanceAPI['binding'];
    presentationKey?: string;
    placement: { slot: string; order?: number };
    config: Record<string, unknown>;
    resolvedData: Array<{
        id: string;
        slug: string;
        name: string;
        type: string;
        data?: Record<string, unknown>;
    }>;
}

export interface PresentationPresetAPI {
    id: string;
    key: string;
    name: string;
    signature: {
        kind: 'self' | 'related';
        target?: string;
        cardinality?: 'one' | 'many';
    };
    config: Record<string, unknown>;
    version: number;
}
