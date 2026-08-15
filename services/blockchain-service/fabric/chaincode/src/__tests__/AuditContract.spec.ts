import { AuditContract } from '../AuditContract';
import { TraceabilityContract } from '../TraceabilityContract';
import { MockContext } from '../test-utils/MockContext';
import { EventType } from '../models/AuditEvent';
import { BatchState } from '../models/Batch';

describe('AuditContract', () => {
    let auditContract: AuditContract;
    let traceContract: TraceabilityContract;

    beforeEach(() => {
        auditContract = new AuditContract();
        traceContract = new TraceabilityContract();
    });

    describe('recordScan', () => {
        it('should record scan without modifying batch state or custody', async () => {
            const ctx = new MockContext('RetailerOrg');
            
            // Set up a batch
            const batch = { batch_id: 'B001', state: BatchState.AVAILABLE, current_custodian: 'RetailerOrg' };
            await ctx.stub.putState('BATCH_B001', Buffer.from(JSON.stringify(batch)));
            
            // Record a scan by a Consumer
            const consumerCtx = new MockContext('ConsumerOrg');
            consumerCtx.stub = ctx.stub;
            await auditContract.recordScan(consumerCtx as any, 'EVT001', 'B001');
            
            // Verify event is logged
            const evtBytes = await ctx.stub.getState('AUDIT_EVT001');
            const evt = JSON.parse(evtBytes!.toString());
            expect(evt.event_type).toEqual(EventType.SCAN);
            expect(evt.actor_id).toEqual('ConsumerOrg');
            
            // Verify batch is completely unchanged
            const batchBytes = await ctx.stub.getState('BATCH_B001');
            const updatedBatch = JSON.parse(batchBytes!.toString());
            expect(updatedBatch.state).toEqual(BatchState.AVAILABLE);
            expect(updatedBatch.current_custodian).toEqual('RetailerOrg');
        });
    });

    describe('recordVerification', () => {
        it('should record verification without modifying batch state or custody', async () => {
            const ctx = new MockContext('RetailerOrg');
            
            // Set up a batch
            const batch = { batch_id: 'B001', state: BatchState.AVAILABLE, current_custodian: 'RetailerOrg' };
            await ctx.stub.putState('BATCH_B001', Buffer.from(JSON.stringify(batch)));
            
            // Record verification
            const verifierCtx = new MockContext('CertifierOrg');
            verifierCtx.stub = ctx.stub;
            await auditContract.recordVerification(verifierCtx as any, 'EVT002', 'B001', 'Valid Organic');
            
            // Verify event is logged
            const evtBytes = await ctx.stub.getState('AUDIT_EVT002');
            const evt = JSON.parse(evtBytes!.toString());
            expect(evt.event_type).toEqual(EventType.VERIFICATION);
            expect(evt.actor_id).toEqual('CertifierOrg');
            
            // Verify batch is completely unchanged
            const batchBytes = await ctx.stub.getState('BATCH_B001');
            const updatedBatch = JSON.parse(batchBytes!.toString());
            expect(updatedBatch.state).toEqual(BatchState.AVAILABLE);
            expect(updatedBatch.current_custodian).toEqual('RetailerOrg');
        });
    });
});
