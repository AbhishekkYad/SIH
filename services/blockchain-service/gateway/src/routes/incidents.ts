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

router.post('/', wrapper('startInvestigation', ['incidentId', 'entityId', 'reporterRef', 'evidenceCid']), submitTransaction);
router.put('/:id/status', wrapper('updateIncidentStatus', ['incidentId', 'status']), submitTransaction);
router.post('/:id/escalate', wrapper('recordEscalation', ['incidentId', 'targetOrg']), submitTransaction);
router.post('/:id/close', wrapper('closeIncident', ['incidentId']), submitTransaction);

export default router;
