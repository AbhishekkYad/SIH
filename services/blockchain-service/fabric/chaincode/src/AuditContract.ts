import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { AuditEvent, EventType } from './models/AuditEvent';

@Info({ title: 'AuditContract', description: 'Smart contract for logging auditable interactions like scans and verification' })
export class AuditContract extends Contract {

    @Transaction()
    public async recordScan(ctx: Context, eventId: string, entityId: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        
        // Emphasizing architecture requirement: Scanning DOES NOT transfer custody.
        // It merely appends a highly trusted auditable event on the ledger.
        
        const existing = await ctx.stub.getState(`AUDIT_${eventId}`);
        if (existing && existing.length > 0) {
            throw new Error(`Audit event ${eventId} already exists`);
        }

        const auditEvent = new AuditEvent(
            eventId,
            EventType.SCAN,
            entityId,
            mspId,
            ctx.stub.getDateTimestamp().toISOString()
        );

        await ctx.stub.putState(`AUDIT_${eventId}`, Buffer.from(JSON.stringify(auditEvent)));
        ctx.stub.setEvent('AUDIT_SCAN_RECORDED', Buffer.from(JSON.stringify(auditEvent)));
    }

    @Transaction()
    public async recordVerification(ctx: Context, eventId: string, entityId: string, verificationResult: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        
        const existing = await ctx.stub.getState(`AUDIT_${eventId}`);
        if (existing && existing.length > 0) {
            throw new Error(`Audit event ${eventId} already exists`);
        }

        const auditEvent = new AuditEvent(
            eventId,
            EventType.VERIFICATION,
            entityId,
            mspId,
            ctx.stub.getDateTimestamp().toISOString(),
            verificationResult
        );

        await ctx.stub.putState(`AUDIT_${eventId}`, Buffer.from(JSON.stringify(auditEvent)));
        ctx.stub.setEvent('AUDIT_VERIFICATION_RECORDED', Buffer.from(JSON.stringify(auditEvent)));
    }
}
