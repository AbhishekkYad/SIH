import { Object, Property } from 'fabric-contract-api';

export enum IncidentStatus {
    UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
    ESCALATED = 'ESCALATED',
    RESOLVED = 'RESOLVED'
}

@Object()
export class Incident {
    @Property()
    public readonly docType: string = 'incident';

    @Property()
    public incident_id: string;

    @Property()
    public entity_id: string;

    @Property()
    public status: IncidentStatus;

    @Property()
    public reporter_ref: string;

    @Property()
    public evidence_cid?: string;

    @Property()
    public created_at: string;

    constructor(
        incident_id: string,
        entity_id: string,
        status: IncidentStatus,
        reporter_ref: string,
        created_at: string,
        evidence_cid?: string
    ) {
        this.incident_id = incident_id;
        this.entity_id = entity_id;
        this.status = status;
        this.reporter_ref = reporter_ref;
        this.created_at = created_at;
        if (evidence_cid) {
            this.evidence_cid = evidence_cid;
        }
    }
}
