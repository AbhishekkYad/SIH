import { Object, Property } from 'fabric-contract-api';

export enum EventType {
    SCAN = 'SCAN',
    VERIFICATION = 'VERIFICATION'
}

@Object()
export class AuditEvent {
    @Property()
    public readonly docType: string = 'audit';

    @Property()
    public event_id: string;

    @Property()
    public event_type: EventType;

    @Property()
    public entity_id: string;

    @Property()
    public actor_id: string;

    @Property()
    public timestamp: string;

    @Property()
    public verification_result?: string;

    constructor(
        event_id: string,
        event_type: EventType,
        entity_id: string,
        actor_id: string,
        timestamp: string,
        verification_result?: string
    ) {
        this.event_id = event_id;
        this.event_type = event_type;
        this.entity_id = entity_id;
        this.actor_id = actor_id;
        this.timestamp = timestamp;
        if (verification_result) {
            this.verification_result = verification_result;
        }
    }
}
