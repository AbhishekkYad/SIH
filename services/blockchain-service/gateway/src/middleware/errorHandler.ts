import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Gateway Error:', err);

    let statusCode = 500;
    let message = 'Internal Server Error';
    let errorCode = 'INTERNAL_ERROR';

    // Handle standard Fabric Gateway errors
    if (err.name === 'EndorseError') {
        statusCode = 400; // Often validation errors in chaincode
        message = err.message || 'Transaction endorsement failed';
        errorCode = 'ENDORSEMENT_FAILED';
    } else if (err.name === 'SubmitError') {
        statusCode = 500;
        message = err.message || 'Transaction submission failed to orderer';
        errorCode = 'SUBMIT_FAILED';
    } else if (err.name === 'CommitStatusError') {
        statusCode = 504; // Timeout
        message = err.message || 'Timeout waiting for commit confirmation';
        errorCode = 'COMMIT_TIMEOUT';
    } else if (err.details && err.details.length > 0) {
        // Detailed error from chaincode throw
        statusCode = 400;
        message = err.details[0].message || err.message;
        errorCode = 'CHAINCODE_REJECTION';
    } else if (err.message) {
        message = err.message;
    }

    res.status(statusCode).json({
        error_code: errorCode,
        message: message,
        transaction_id: null,
        status: 'FAILED'
    });
};
