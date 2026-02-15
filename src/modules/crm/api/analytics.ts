
import { Router, Request, Response, NextFunction } from 'express';
import { getKineticForecast } from '../crm.js';
import { protectedRoute } from '../../auth/middleware.js';

const router = Router();

// GET /api/analytics/forecast/:accountId
router.get('/forecast/:accountId', ...protectedRoute, (req: Request, res: Response, next: NextFunction) => {
    try {
        const { accountId } = req.params;
        const result = getKineticForecast(String(accountId));
        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;
