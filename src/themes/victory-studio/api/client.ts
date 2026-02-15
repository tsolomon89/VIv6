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
    }
};
