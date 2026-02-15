
import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const COMPONENTS_PATH = path.resolve(process.cwd(), 'data/components.json');

// GET /api/components
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!fs.existsSync(COMPONENTS_PATH)) {
            return res.status(503).json({ error: 'Component registry not generated. Run npm run build or extract_registry script.' });
        }
        
        const data = fs.readFileSync(COMPONENTS_PATH, 'utf-8');
        const components = JSON.parse(data);
        res.json(components);
    } catch (err) {
        next(err);
    }
});

export default router;
