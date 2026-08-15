import { Request, Response, NextFunction } from 'express';

/**
 * Phase 1 Limitation: In-Memory Idempotency Storage
 * --------------------------------------------------
 * Currently, idempotency keys are stored in a simple in-memory Set.
 * This effectively prevents duplicate Fabric submissions for the same idempotency
 * key while this single Gateway instance is running. 
 * 
 * However, this does NOT provide durable idempotency. If the Gateway restarts,
 * or if multiple Gateway replicas are running, the state is lost/split.
 * 
 * Future Phase Requirement: Replace this Set with a shared persistent store
 * (like Redis) to ensure durable, cross-replica idempotency.
 */
const processedKeys = new Set<string>();

export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Only apply to POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const idempotencyKey = req.headers['x-idempotency-key'];

        if (!idempotencyKey || typeof idempotencyKey !== 'string') {
            return res.status(400).json({ error: 'Bad Request: Missing X-Idempotency-Key header' });
        }

        if (processedKeys.has(idempotencyKey)) {
            return res.status(409).json({ 
                error: 'Conflict: Request with this idempotency key has already been processed' 
            });
        }

        // Mark as processed
        processedKeys.add(idempotencyKey);
    }

    next();
};
