import { Object as DataType, Property } from 'fabric-contract-api';
import { BatchState } from './Batch';

@DataType()
export class Unit {
    @Property()
    public readonly docType: string = 'unit';

    @Property()
    public unit_id: string;

    @Property()
    public batch_id: string;

    @Property()
    public state: BatchState;

    @Property()
    public current_custodian: string;

    @Property()
    public created_at: string;

    @Property()
    public updated_at: string;

    constructor(
        unit_id: string,
        batch_id: string,
        state: BatchState,
        current_custodian: string,
        created_at: string,
        updated_at: string
    ) {
        this.unit_id = unit_id;
        this.batch_id = batch_id;
        this.state = state;
        this.current_custodian = current_custodian;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
