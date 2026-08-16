import { Request, Response, NextFunction } from 'express';

if (!process.env.INTERNAL_API_KEY) throw new Error('CRITICAL: INTERNAL_API_KEY environment variable is not defined.');
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (token !== INTERNAL_API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid internal API key' });
    }

    const actorMsp = req.headers['x-actor-msp'];
    if (!actorMsp || typeof actorMsp !== 'string') {
        return res.status(400).json({ error: 'Bad Request: Missing X-Actor-MSP header' });
    }

    // Attach identity context to request for downstream controllers
    (req as any).actorMsp = actorMsp;

    next();
};
