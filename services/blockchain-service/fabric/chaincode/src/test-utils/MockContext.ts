import { Context } from 'fabric-contract-api';

export class MockStub {
    public states: Map<string, Buffer>;
    public events: Map<string, Buffer>;

    constructor() {
        this.states = new Map<string, Buffer>();
        this.events = new Map<string, Buffer>();
    }

    public async getState(key: string): Promise<Buffer | null> {
        return this.states.get(key) || Buffer.from('');
    }

    public async putState(key: string, value: Buffer): Promise<void> {
        this.states.set(key, value);
    }

    public setEvent(name: string, payload: Buffer): void {
        this.events.set(name, payload);
    }

    public getTxID(): string {
        return 'mock-tx-id';
    }

    public getDateTimestamp(): Date {
        return new Date('2026-08-15T00:00:00.000Z');
    }
}

export class MockClientIdentity {
    public mspId: string;

    constructor(mspId: string) {
        this.mspId = mspId;
    }

    public getMSPID(): string {
        return this.mspId;
    }
}

export class MockContext {
    public stub: MockStub;
    public clientIdentity: MockClientIdentity;

    constructor(mspId: string = 'Org1MSP') {
        this.stub = new MockStub();
        this.clientIdentity = new MockClientIdentity(mspId);
    }
}
