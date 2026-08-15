import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { Product } from './models/Product';
import { Batch, BatchState } from './models/Batch';
import { Unit } from './models/Unit';

@Info({ title: 'TraceabilityContract', description: 'Smart contract for managing custody and lifecycle of food batches' })
export class TraceabilityContract extends Contract {

    @Transaction()
    public async registerProduct(ctx: Context, productId: string, name: string, productType: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        
        const existing = await ctx.stub.getState(`PRODUCT_${productId}`);
        if (existing && existing.length > 0) {
            throw new Error(`Product ${productId} already exists`);
        }

        const product = new Product(productId, name, productType, mspId, ctx.stub.getDateTimestamp().toISOString());
        
        await ctx.stub.putState(`PRODUCT_${productId}`, Buffer.from(JSON.stringify(product)));
        ctx.stub.setEvent('PRODUCT_REGISTERED', Buffer.from(JSON.stringify(product)));
    }

    @Transaction()
    public async registerBatch(ctx: Context, batchId: string, productId: string, quantity: number): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        
        const productBytes = await ctx.stub.getState(`PRODUCT_${productId}`);
        if (!productBytes || productBytes.length === 0) {
            throw new Error(`Product ${productId} does not exist`);
        }

        const existingBatch = await ctx.stub.getState(`BATCH_${batchId}`);
        if (existingBatch && existingBatch.length > 0) {
            throw new Error(`Batch ${batchId} already exists`);
        }

        const batch = new Batch(
            batchId,
            productId,
            BatchState.REGISTERED,
            mspId,
            [],
            ctx.stub.getDateTimestamp().toISOString(),
            ctx.stub.getDateTimestamp().toISOString()
        );

        await ctx.stub.putState(`BATCH_${batchId}`, Buffer.from(JSON.stringify(batch)));
        ctx.stub.setEvent('BATCH_REGISTERED', Buffer.from(JSON.stringify(batch)));
    }

    @Transaction()
    public async validateBatch(ctx: Context, batchId: string, validationResult: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        
        const batchBytes = await ctx.stub.getState(`BATCH_${batchId}`);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }
        const batch: Batch = JSON.parse(batchBytes.toString());

        if (batch.current_custodian !== mspId) {
            throw new Error(`Organization ${mspId} is not authorized to validate this batch`);
        }

        if (batch.state !== BatchState.REGISTERED) {
            throw new Error(`Invalid state transition: Cannot validate batch in state ${batch.state}`);
        }

        batch.state = BatchState.VALIDATED;
        batch.updated_at = ctx.stub.getDateTimestamp().toISOString();

        await ctx.stub.putState(`BATCH_${batchId}`, Buffer.from(JSON.stringify(batch)));
        ctx.stub.setEvent('BATCH_VALIDATED', Buffer.from(JSON.stringify(batch)));
    }

    @Transaction()
    public async transferBatch(ctx: Context, batchId: string, targetOrg: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        
        const batchBytes = await ctx.stub.getState(`BATCH_${batchId}`);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }
        const batch: Batch = JSON.parse(batchBytes.toString());

        if (batch.current_custodian !== mspId) {
            throw new Error(`Organization ${mspId} is not the current custodian`);
        }

        const allowedStates = [BatchState.VALIDATED, BatchState.AVAILABLE, BatchState.PROCESSED];
        if (!allowedStates.includes(batch.state)) {
            throw new Error(`Invalid state transition: Cannot transfer batch in state ${batch.state}`);
        }

        batch.state = BatchState.IN_TRANSIT;
        batch.updated_at = ctx.stub.getDateTimestamp().toISOString();
        (batch as any).pending_custodian = targetOrg;

        await ctx.stub.putState(`BATCH_${batchId}`, Buffer.from(JSON.stringify(batch)));
        ctx.stub.setEvent('BATCH_TRANSFERRED', Buffer.from(JSON.stringify(batch)));
    }

    @Transaction()
    public async receiveBatch(ctx: Context, batchId: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        
        const batchBytes = await ctx.stub.getState(`BATCH_${batchId}`);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }
        const batch: Batch = JSON.parse(batchBytes.toString());

        if (batch.state !== BatchState.IN_TRANSIT) {
            throw new Error(`Invalid state transition: Cannot receive batch in state ${batch.state}`);
        }

        if ((batch as any).pending_custodian !== mspId) {
            throw new Error(`Organization ${mspId} is not the intended recipient of this batch`);
        }

        batch.state = BatchState.RECEIVED;
        batch.current_custodian = mspId;
        delete (batch as any).pending_custodian;
        batch.updated_at = ctx.stub.getDateTimestamp().toISOString();

        await ctx.stub.putState(`BATCH_${batchId}`, Buffer.from(JSON.stringify(batch)));
        ctx.stub.setEvent('BATCH_RECEIVED', Buffer.from(JSON.stringify(batch)));
    }

    @Transaction()
    public async processBatch(ctx: Context, batchId: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        
        const batchBytes = await ctx.stub.getState(`BATCH_${batchId}`);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }
        const batch: Batch = JSON.parse(batchBytes.toString());

        if (batch.current_custodian !== mspId) {
            throw new Error(`Organization ${mspId} is not the current custodian`);
        }

        if (batch.state !== BatchState.RECEIVED) {
            throw new Error(`Invalid state transition: Cannot process batch in state ${batch.state}`);
        }

        batch.state = BatchState.PROCESSED;
        batch.updated_at = ctx.stub.getDateTimestamp().toISOString();

        await ctx.stub.putState(`BATCH_${batchId}`, Buffer.from(JSON.stringify(batch)));
        ctx.stub.setEvent('BATCH_PROCESSED', Buffer.from(JSON.stringify(batch)));
    }

    @Transaction()
    public async createTransformation(ctx: Context, parentBatchIdsStr: string, childBatchId: string, newProductId: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        
        const parentBatchIds = JSON.parse(parentBatchIdsStr);
        
        for (const parentId of parentBatchIds) {
            const parentBytes = await ctx.stub.getState(`BATCH_${parentId}`);
            if (!parentBytes || parentBytes.length === 0) {
                throw new Error(`Parent batch ${parentId} does not exist`);
            }
            const parent: Batch = JSON.parse(parentBytes.toString());
            
            if (parent.current_custodian !== mspId) {
                throw new Error(`Organization ${mspId} does not own parent batch ${parentId}`);
            }
            
            const validParentStates = [BatchState.PROCESSED];
            if (!validParentStates.includes(parent.state)) {
                throw new Error(`Parent batch ${parentId} is in state ${parent.state}, which cannot be transformed`);
            }
        }
        
        const existingChild = await ctx.stub.getState(`BATCH_${childBatchId}`);
        if (existingChild && existingChild.length > 0) {
            throw new Error(`Batch ${childBatchId} already exists`);
        }

        const childBatch = new Batch(
            childBatchId,
            newProductId,
            BatchState.PROCESSED,
            mspId,
            parentBatchIds,
            ctx.stub.getDateTimestamp().toISOString(),
            ctx.stub.getDateTimestamp().toISOString()
        );

        await ctx.stub.putState(`BATCH_${childBatchId}`, Buffer.from(JSON.stringify(childBatch)));
        ctx.stub.setEvent('BATCH_TRANSFORMED', Buffer.from(JSON.stringify(childBatch)));
    }

    @Transaction()
    public async createUnit(ctx: Context, batchId: string, unitId: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        
        const batchBytes = await ctx.stub.getState(`BATCH_${batchId}`);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }
        const batch: Batch = JSON.parse(batchBytes.toString());

        if (batch.current_custodian !== mspId) {
            throw new Error(`Organization ${mspId} is not the current custodian`);
        }

        if (batch.state === BatchState.BLOCKED || batch.state === BatchState.RECALLED) {
            throw new Error(`Cannot create unit from batch in state ${batch.state}`);
        }

        const existingUnit = await ctx.stub.getState(`UNIT_${unitId}`);
        if (existingUnit && existingUnit.length > 0) {
            throw new Error(`Unit ${unitId} already exists`);
        }

        const unit = new Unit(
            unitId,
            batchId,
            batch.state,
            mspId,
            ctx.stub.getDateTimestamp().toISOString(),
            ctx.stub.getDateTimestamp().toISOString()
        );

        await ctx.stub.putState(`UNIT_${unitId}`, Buffer.from(JSON.stringify(unit)));
        ctx.stub.setEvent('UNIT_CREATED', Buffer.from(JSON.stringify(unit)));
    }

    @Transaction()
    public async blockEntity(ctx: Context, entityType: string, entityId: string, reason: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        
        const key = `${entityType.toUpperCase()}_${entityId}`;
        const entityBytes = await ctx.stub.getState(key);
        if (!entityBytes || entityBytes.length === 0) {
            throw new Error(`${entityType} ${entityId} does not exist`);
        }
        
        const entity = JSON.parse(entityBytes.toString());
        
        if (entity.current_custodian !== mspId && mspId !== 'RegulatorOrg') {
            throw new Error(`Organization ${mspId} is not authorized to block this entity`);
        }
        
        entity.state = BatchState.BLOCKED;
        entity.updated_at = ctx.stub.getDateTimestamp().toISOString();
        
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(entity)));
        ctx.stub.setEvent('ENTITY_BLOCKED', Buffer.from(JSON.stringify({ entityType, entityId, reason })));
    }
}
