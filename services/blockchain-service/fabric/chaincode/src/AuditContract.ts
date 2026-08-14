import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { AuditEvent, EventType } from './models/AuditEvent';

@Info({ title: 'AuditContract', description: 'Smart contract for logging auditable interactions like scans and verification' })
export class AuditContract extends Contract {

    @Transaction()
    public async recordScan(ctx: Context, entityId: string, scanContext: string): Promise<void> {
        // TODO: Implementation
    }

    @Transaction()
    public async recordVerification(ctx: Context, entityId: string, verificationResult: string): Promise<void> {
        // TODO: Implementation
    }
}
