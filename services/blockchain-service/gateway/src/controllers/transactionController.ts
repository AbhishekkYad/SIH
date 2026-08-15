import { Request, Response, NextFunction } from 'express';
import { fabricManager } from '../fabric/fabricManager';
import { Contract } from '@hyperledger/fabric-gateway';

const utf8Decoder = new TextDecoder();

export const submitTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const actorMsp = (req as any).actorMsp;
        const { functionName, args } = req.body;

        if (!functionName) {
            return res.status(400).json({ error: 'functionName is required' });
        }

        const contract: Contract = await fabricManager.getContract(actorMsp);

        // Submit transaction (this blocks until commit)
        const stringArgs = (args || []).map((arg: any) => 
            typeof arg === 'string' ? arg : JSON.stringify(arg)
        );

        const resultBytes = await contract.submitTransaction(functionName, ...stringArgs);
        
        let resultJson = {};
        if (resultBytes && resultBytes.length > 0) {
            const resultStr = utf8Decoder.decode(resultBytes);
            try {
                resultJson = JSON.parse(resultStr);
            } catch (err) {
                resultJson = { data: resultStr };
            }
        }

        // We don't have transaction ID directly from submitTransaction in modern SDK without lower-level API,
        // but for now we just return COMMITTED and whatever the chaincode returned.
        // Actually, in fabric-gateway, to get transaction ID we can create a proposal first,
        // but for simplicity we return the result.
        
        res.status(200).json({
            transaction_id: 'tx-id-placeholder-until-detailed-api', // Phase 1 simplify
            status: 'COMMITTED',
            result: resultJson
        });
    } catch (error) {
        next(error);
    }
};
