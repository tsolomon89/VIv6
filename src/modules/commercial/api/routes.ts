
import { Router } from 'express';
import { CommercialEngine } from '../commercial.js';
import { protectedRoute } from '../../auth/middleware.js';
import { OpportunityStage } from '../../../core/types.js';

const router = Router();

// POST /api/commercial/opportunities/:id/stage
// Body: { stage: 'sql' }
router.post('/opportunities/:id/stage', ...protectedRoute, async (req, res, next) => {
    try {
        const { id } = req.params as { id: string };
        const { stage } = req.body;
        
        if (!stage) {
             res.status(400).json({ error: 'Stage is required' });
             return;
        }

        const record = await CommercialEngine.transitionStage(id, stage as OpportunityStage);
        res.json(record);
    } catch (err) {
        next(err);
    }
});

// POST /api/commercial/opportunities/:id/items
// Body: { productId: string, quantity?: number }
router.post('/opportunities/:id/items', ...protectedRoute, async (req, res, next) => {
    try {
        const { id } = req.params as { id: string };
        const { productId, quantity } = req.body;
        
        if (!productId) {
             res.status(400).json({ error: 'ProductId is required' });
             return;
        }

        const record = await CommercialEngine.addItem(id, productId, quantity || 1);
        res.json(record);
    } catch (err) {
        next(err);
    }
});

// POST /api/commercial/opportunities/:id/items/remove
// Body: { itemId: string }
router.post('/opportunities/:id/items/remove', ...protectedRoute, async (req, res, next) => {
    try {
        const { id } = req.params as { id: string };
        const { itemId } = req.body;
        
        if (!itemId) {
             res.status(400).json({ error: 'ItemID is required' });
             return;
        }

        const record = await CommercialEngine.removeItem(id, itemId);
        res.json(record);
    } catch (err) {
        next(err);
    }
});

// POST /api/commercial/opportunities/:id/items/update
// Body: { itemId: string, quantity: number }
router.post('/opportunities/:id/items/update', ...protectedRoute, async (req, res, next) => {
    try {
        const { id } = req.params as { id: string };
        const { itemId, quantity } = req.body;
        
        if (!itemId || quantity === undefined) {
             res.status(400).json({ error: 'ItemID and Quantity are required' });
             return;
        }

        const record = await CommercialEngine.updateItemQuantity(id, itemId, quantity);
        res.json(record);
    } catch (err) {
        next(err);
    }
});

export default router;
