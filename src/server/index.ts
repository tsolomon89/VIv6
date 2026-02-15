
import express from 'express';
import cors from 'cors';
import { 
    listEntities, 
    getEntity, 
    createEntity, 
    updateEntity, 
    deleteEntity 
} from '../core/entities.js';

const app = express();
const PORT = 3001; // API Port (Changed from 3000 to avoid Vite conflict)

app.use(cors()); // Allow all for local dev
app.use(express.json());

// List Entities
app.get('/api/entities', (req, res) => {
    const { type, brandId } = req.query;
    try {
        const entities = listEntities(type as any, brandId as string);
        res.json(entities);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Get Entity
app.get('/api/entities/:id', (req, res) => {
    try {
        const entity = getEntity(req.params.id);
        if (!entity) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json(entity);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Create Entity
app.post('/api/entities', (req, res) => {
    try {
        const entity = createEntity(req.body);
        res.status(201).json(entity);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// Update Entity
app.put('/api/entities/:id', (req, res) => {
    try {
        const updated = updateEntity(req.params.id, req.body);
        if (!updated) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json(updated);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// Delete Entity
app.delete('/api/entities/:id', (req, res) => {
    try {
        const success = deleteEntity(req.params.id);
        if (!success) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// Mock Agent Rewrite Endpoint
app.post('/api/agent/rewrite', (req, res) => {
    const { text, context } = req.body;
    // Simulate AI delay
    setTimeout(() => {
        res.json({ suggested: `✨ Optimized: ${text} (AI)` });
    }, 1000);
});

app.listen(PORT, () => {
    console.log(`🚀 API Server running at http://localhost:${PORT}`);
});
