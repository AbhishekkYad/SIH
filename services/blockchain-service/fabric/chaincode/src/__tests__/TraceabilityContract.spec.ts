import { TraceabilityContract } from '../TraceabilityContract';
import { MockContext } from '../test-utils/MockContext';
import { BatchState } from '../models/Batch';

describe('TraceabilityContract', () => {
    let contract: TraceabilityContract;

    beforeEach(() => {
        contract = new TraceabilityContract();
    });

    describe('registerProduct', () => {
        it('should register a product successfully', async () => {
            const ctx = new MockContext('FarmerOrg');
            await contract.registerProduct(ctx as any, 'P001', 'Apple', 'Fruit');
            
            const productBytes = await ctx.stub.getState('PRODUCT_P001');
            expect(productBytes).not.toBeNull();
            const product = JSON.parse(productBytes!.toString());
            expect(product.product_id).toEqual('P001');
            expect(product.created_by_org).toEqual('FarmerOrg');
        });

        it('should fail if product already exists', async () => {
            const ctx = new MockContext('FarmerOrg');
            await contract.registerProduct(ctx as any, 'P001', 'Apple', 'Fruit');
            
            await expect(contract.registerProduct(ctx as any, 'P001', 'Apple', 'Fruit')).rejects.toThrow('Product P001 already exists');
        });
    });

    describe('registerBatch', () => {
        it('should register a batch successfully', async () => {
            const ctx = new MockContext('FarmerOrg');
            await contract.registerProduct(ctx as any, 'P001', 'Apple', 'Fruit');
            await contract.registerBatch(ctx as any, 'B001', 'P001', 100);
            
            const batchBytes = await ctx.stub.getState('BATCH_B001');
            const batch = JSON.parse(batchBytes!.toString());
            expect(batch.batch_id).toEqual('B001');
            expect(batch.current_custodian).toEqual('FarmerOrg');
            expect(batch.state).toEqual(BatchState.REGISTERED);
        });

        it('should fail if product is missing', async () => {
            const ctx = new MockContext('FarmerOrg');
            await expect(contract.registerBatch(ctx as any, 'B001', 'MISSING_PROD', 100)).rejects.toThrow('Product MISSING_PROD does not exist');
        });
    });

    describe('validateBatch', () => {
        it('should change state from REGISTERED to VALIDATED', async () => {
            const ctx = new MockContext('FarmerOrg');
            await contract.registerProduct(ctx as any, 'P001', 'Apple', 'Fruit');
            await contract.registerBatch(ctx as any, 'B001', 'P001', 100);
            
            await contract.validateBatch(ctx as any, 'B001', 'Passed');
            
            const batchBytes = await ctx.stub.getState('BATCH_B001');
            const batch = JSON.parse(batchBytes!.toString());
            expect(batch.state).toEqual(BatchState.VALIDATED);
        });

        it('should fail if unauthorized validator', async () => {
            const ctx1 = new MockContext('FarmerOrg');
            await contract.registerProduct(ctx1 as any, 'P001', 'Apple', 'Fruit');
            await contract.registerBatch(ctx1 as any, 'B001', 'P001', 100);
            
            const ctx2 = new MockContext('RetailerOrg');
            ctx2.stub = ctx1.stub;
            await expect(contract.validateBatch(ctx2 as any, 'B001', 'Passed')).rejects.toThrow('Organization RetailerOrg is not authorized to validate this batch');
        });

        it('should fail on invalid state', async () => {
            const ctx = new MockContext('FarmerOrg');
            await contract.registerProduct(ctx as any, 'P001', 'Apple', 'Fruit');
            await contract.registerBatch(ctx as any, 'B001', 'P001', 100);
            await contract.validateBatch(ctx as any, 'B001', 'Passed');
            
            await expect(contract.validateBatch(ctx as any, 'B001', 'Passed')).rejects.toThrow('Invalid state transition');
        });
    });

    describe('Transfer & Receive', () => {
        it('should transfer from current custodian and receive by pending recipient', async () => {
            const ctx = new MockContext('FarmerOrg');
            await contract.registerProduct(ctx as any, 'P001', 'Apple', 'Fruit');
            await contract.registerBatch(ctx as any, 'B001', 'P001', 100);
            await contract.validateBatch(ctx as any, 'B001', 'Passed');
            
            await contract.transferBatch(ctx as any, 'B001', 'ProcessorOrg');
            
            let batch = JSON.parse((await ctx.stub.getState('BATCH_B001'))!.toString());
            expect(batch.state).toEqual(BatchState.IN_TRANSIT);
            expect(batch.pending_custodian).toEqual('ProcessorOrg');
            
            const ctxProcessor = new MockContext('ProcessorOrg');
            ctxProcessor.stub = ctx.stub; // Share ledger state
            
            await contract.receiveBatch(ctxProcessor as any, 'B001');
            
            batch = JSON.parse((await ctx.stub.getState('BATCH_B001'))!.toString());
            expect(batch.state).toEqual(BatchState.RECEIVED);
            expect(batch.current_custodian).toEqual('ProcessorOrg');
            expect(batch.pending_custodian).toBeUndefined();
        });

        it('should fail if non-custodian tries to transfer', async () => {
            const ctx = new MockContext('FarmerOrg');
            await contract.registerProduct(ctx as any, 'P001', 'Apple', 'Fruit');
            await contract.registerBatch(ctx as any, 'B001', 'P001', 100);
            await contract.validateBatch(ctx as any, 'B001', 'Passed');
            
            const ctxThief = new MockContext('ThiefOrg');
            ctxThief.stub = ctx.stub;
            await expect(contract.transferBatch(ctxThief as any, 'B001', 'ThiefOrg')).rejects.toThrow('Organization ThiefOrg is not the current custodian');
        });

        it('should fail if wrong organization tries to receive', async () => {
            const ctx = new MockContext('FarmerOrg');
            await contract.registerProduct(ctx as any, 'P001', 'Apple', 'Fruit');
            await contract.registerBatch(ctx as any, 'B001', 'P001', 100);
            await contract.validateBatch(ctx as any, 'B001', 'Passed');
            
            await contract.transferBatch(ctx as any, 'B001', 'ProcessorOrg');
            
            const ctxThief = new MockContext('ThiefOrg');
            ctxThief.stub = ctx.stub;
            await expect(contract.receiveBatch(ctxThief as any, 'B001')).rejects.toThrow('Organization ThiefOrg is not the intended recipient of this batch');
        });
        
        it('should fail if trying to receive with no pending transfer', async () => {
            const ctx = new MockContext('FarmerOrg');
            await contract.registerProduct(ctx as any, 'P001', 'Apple', 'Fruit');
            await contract.registerBatch(ctx as any, 'B001', 'P001', 100);
            await contract.validateBatch(ctx as any, 'B001', 'Passed');
            
            await expect(contract.receiveBatch(ctx as any, 'B001')).rejects.toThrow('Invalid state transition: Cannot receive batch in state VALIDATED');
        });
    });

    describe('createTransformation', () => {
        it('should transform successfully for valid parents in PROCESSED state', async () => {
            const ctx = new MockContext('ProcessorOrg');
            
            // Mock parents
            const parent1 = { batch_id: 'B001', state: BatchState.PROCESSED, current_custodian: 'ProcessorOrg' };
            const parent2 = { batch_id: 'B002', state: BatchState.PROCESSED, current_custodian: 'ProcessorOrg' };
            await ctx.stub.putState('BATCH_B001', Buffer.from(JSON.stringify(parent1)));
            await ctx.stub.putState('BATCH_B002', Buffer.from(JSON.stringify(parent2)));
            
            await contract.createTransformation(ctx as any, JSON.stringify(['B001', 'B002']), 'B003', 'P002');
            
            const childBytes = await ctx.stub.getState('BATCH_B003');
            const child = JSON.parse(childBytes!.toString());
            expect(child.batch_id).toEqual('B003');
            expect(child.state).toEqual(BatchState.PROCESSED);
            expect(child.current_custodian).toEqual('ProcessorOrg');
            expect(child.parent_refs).toEqual(['B001', 'B002']);
        });

        it('should fail if parent is missing', async () => {
            const ctx = new MockContext('ProcessorOrg');
            await expect(contract.createTransformation(ctx as any, JSON.stringify(['MISSING']), 'B003', 'P002')).rejects.toThrow('Parent batch MISSING does not exist');
        });

        it('should fail if wrong custodian', async () => {
            const ctx = new MockContext('ProcessorOrg');
            const parent1 = { batch_id: 'B001', state: BatchState.PROCESSED, current_custodian: 'FarmerOrg' };
            await ctx.stub.putState('BATCH_B001', Buffer.from(JSON.stringify(parent1)));
            
            await expect(contract.createTransformation(ctx as any, JSON.stringify(['B001']), 'B003', 'P002')).rejects.toThrow('Organization ProcessorOrg does not own parent batch B001');
        });

        it('should fail if invalid parent state', async () => {
            const ctx = new MockContext('ProcessorOrg');
            const parent1 = { batch_id: 'B001', state: BatchState.RECEIVED, current_custodian: 'ProcessorOrg' }; // Only PROCESSED is allowed now
            await ctx.stub.putState('BATCH_B001', Buffer.from(JSON.stringify(parent1)));
            
            await expect(contract.createTransformation(ctx as any, JSON.stringify(['B001']), 'B003', 'P002')).rejects.toThrow('Parent batch B001 is in state RECEIVED, which cannot be transformed');
        });
    });

    describe('createUnit & Blocking', () => {
        it('should create unit successfully', async () => {
            const ctx = new MockContext('RetailerOrg');
            const batch = { batch_id: 'B001', state: BatchState.RECEIVED, current_custodian: 'RetailerOrg' };
            await ctx.stub.putState('BATCH_B001', Buffer.from(JSON.stringify(batch)));
            
            await contract.createUnit(ctx as any, 'B001', 'U001');
            
            const unitBytes = await ctx.stub.getState('UNIT_U001');
            expect(unitBytes).not.toBeNull();
        });

        it('should block batch successfully by regulator', async () => {
            const ctx = new MockContext('RegulatorOrg');
            const batch = { batch_id: 'B001', state: BatchState.RECEIVED, current_custodian: 'RetailerOrg' };
            await ctx.stub.putState('BATCH_B001', Buffer.from(JSON.stringify(batch)));
            
            await contract.blockEntity(ctx as any, 'BATCH', 'B001', 'Health Hazard');
            
            const batchBytes = await ctx.stub.getState('BATCH_B001');
            expect(JSON.parse(batchBytes!.toString()).state).toEqual(BatchState.BLOCKED);
        });

        it('should block batch successfully by custodian', async () => {
            const ctx = new MockContext('RetailerOrg');
            const batch = { batch_id: 'B001', state: BatchState.RECEIVED, current_custodian: 'RetailerOrg' };
            await ctx.stub.putState('BATCH_B001', Buffer.from(JSON.stringify(batch)));
            
            await contract.blockEntity(ctx as any, 'BATCH', 'B001', 'Found damage');
            
            const batchBytes = await ctx.stub.getState('BATCH_B001');
            expect(JSON.parse(batchBytes!.toString()).state).toEqual(BatchState.BLOCKED);
        });

        it('should fail unauthorized block', async () => {
            const ctx = new MockContext('ThiefOrg');
            const batch = { batch_id: 'B001', state: BatchState.RECEIVED, current_custodian: 'RetailerOrg' };
            await ctx.stub.putState('BATCH_B001', Buffer.from(JSON.stringify(batch)));
            
            await expect(contract.blockEntity(ctx as any, 'BATCH', 'B001', 'Malice')).rejects.toThrow('Organization ThiefOrg is not authorized to block this entity');
        });
    });
});
