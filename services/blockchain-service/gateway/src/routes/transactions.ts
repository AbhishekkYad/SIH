import { Router, Request, Response, NextFunction } from 'express';
import { submitTransaction } from '../controllers/transactionController';
import { idempotencyMiddleware } from '../middleware/idempotency';

const router = Router();

// Apply idempotency check to all transactions
router.use(idempotencyMiddleware);

// Helper to wrap body properties into args array for chaincode
const wrapper = (functionName: string, argNames: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const args = argNames.map(name => {
            const val = req.body[name];
            // If it's undefined or null, we pass empty string or handle properly.
            // For parentBatchIds which is an array, we'll keep it as array, the controller will stringify it.
            return val !== undefined ? val : '';
        });
        req.body = { functionName, args };
        next();
    };
};

router.post('/products', wrapper('registerProduct', ['productId', 'name', 'productType']), submitTransaction);
router.post('/batches', wrapper('registerBatch', ['batchId', 'productId', 'quantity', 'metadataJson']), submitTransaction);
router.post('/batches/:id/validate', wrapper('validateBatch', ['batchId', 'validationResult', 'metadataJson']), submitTransaction);
router.post('/transfer', wrapper('transferBatch', ['batchId', 'targetOrg', 'metadataJson']), submitTransaction);
router.post('/receive', wrapper('receiveBatch', ['batchId', 'metadataJson']), submitTransaction);
router.post('/batches/:id/process', wrapper('processBatch', ['batchId', 'metadataJson']), submitTransaction);
router.post('/transform', wrapper('createTransformation', ['parentBatchIds', 'childBatchId', 'newProductId', 'metadataJson']), submitTransaction);
router.post('/units', wrapper('createUnit', ['batchId', 'unitId']), submitTransaction);

export default router;
