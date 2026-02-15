
import { Router } from 'express';
import { ActivityEngine } from '../activities.js';
import { protectedRoute } from '../../auth/middleware.js';

const router = Router();

// POST /api/activities/:id/start
router.post('/:id/start', ...protectedRoute, async (req, res, next) => {
    try {
        const { id } = req.params as { id: string };
        const userId = req.user?.userId || 'system_user';
        const record = await ActivityEngine.startActivity(id, userId);
        res.json(record);
    } catch (err) {
        next(err);
    }
});

// POST /api/activities/:id/pause
router.post('/:id/pause', ...protectedRoute, async (req, res, next) => {
    try {
        const { id } = req.params as { id: string };
        const record = await ActivityEngine.pauseActivity(id);
        res.json(record);
    } catch (err) {
        next(err);
    }
});

// POST /api/activities/:id/resume
router.post('/:id/resume', ...protectedRoute, async (req, res, next) => {
    try {
        const { id } = req.params as { id: string };
        const record = await ActivityEngine.resumeActivity(id);
        res.json(record);
    } catch (err) {
        next(err);
    }
});

// POST /api/activities/:id/complete
router.post('/:id/complete', ...protectedRoute, async (req, res, next) => {
    try {
        const { id } = req.params as { id: string };
        const record = await ActivityEngine.completeActivity(id);
        res.json(record);
    } catch (err) {
        next(err);
    }
});

export default router;
