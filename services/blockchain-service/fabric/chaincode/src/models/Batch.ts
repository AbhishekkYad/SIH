import { Object, Property } from 'fabric-contract-api';

export enum BatchState {
    REGISTERED = 'REGISTERED',
    VALIDATED = 'VALIDATED',
    IN_TRANSIT = 'IN_TRANSIT',
    RECEIVED = 'RECEIVED',
    PROCESSED = 'PROCESSED',
    AVAILABLE = 'AVAILABLE',
    BLOCKED = 'BLOCKED',
    RECALLED = 'RECALLED'
}

@Object()
export class Batch {
    @Property()
    public readonly docType: string = 'batch';

    @Property()
    public batch_id: string;

    @Property()
    public product_id: string;

    @Property()
    public state: BatchState;

    @Property()
    public current_custodian: string;

    @Property()
    public parent_refs: string[];

    @Property()
    public created_at: string;

    @Property()
    public updated_at: string;

    constructor(
        batch_id: string,
        product_id: string,
        state: BatchState,
        current_custodian: string,
        parent_refs: string[],
        created_at: string,
        updated_at: string
    ) {
        this.batch_id = batch_id;
        this.product_id = product_id;
        this.state = state;
        this.current_custodian = current_custodian;
        this.parent_refs = parent_refs;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
