import { Router, Request, Response, NextFunction } from 'express';
import { submitTransaction } from '../controllers/transactionController';
import { idempotencyMiddleware } from '../middleware/idempotency';

const router = Router();
router.use(idempotencyMiddleware);

const wrapper = (functionName: string, argNames: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const args = argNames.map(name => {
            const val = req.body[name];
            return val !== undefined ? val : '';
        });
        req.body = { functionName, args };
        next();
    };
};

router.post('/', wrapper('createRecallAction', ['recallId', 'scopeRef']), submitTransaction);

export default router;
