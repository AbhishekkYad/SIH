import { Object as DataType, Property } from 'fabric-contract-api';

export enum RecallStatus {
    ACTIVE = 'ACTIVE',
    RESOLVED = 'RESOLVED'
}

@DataType()
export class Recall {
    @Property()
    public readonly docType: string = 'recall';

    @Property()
    public recall_id: string;

    @Property()
    public affected_scope_ref: string;

    @Property()
    public authority: string;

    @Property()
    public status: RecallStatus;

    @Property()
    public timestamp: string;

    constructor(
        recall_id: string,
        affected_scope_ref: string,
        authority: string,
        status: RecallStatus,
        timestamp: string
    ) {
        this.recall_id = recall_id;
        this.affected_scope_ref = affected_scope_ref;
        this.authority = authority;
        this.status = status;
        this.timestamp = timestamp;
    }
}
