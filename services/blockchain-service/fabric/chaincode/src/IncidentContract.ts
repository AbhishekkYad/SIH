import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { Incident, IncidentStatus } from './models/Incident';
import { Recall, RecallStatus } from './models/Recall';
import { BatchState } from './models/Batch';

@Info({ title: 'IncidentContract', description: 'Smart contract for incident reporting and recall orchestration' })
export class IncidentContract extends Contract {

    @Transaction()
    public async startInvestigation(ctx: Context, incidentId: string, entityId: string, reporterRef: string, evidenceCid: string): Promise<void> {
        // Typically invoked by RegulatorOrg or Application Service acting on verified feedback
        const existing = await ctx.stub.getState(`INCIDENT_${incidentId}`);
        if (existing && existing.length > 0) {
            throw new Error(`Incident ${incidentId} already exists`);
        }

        const incident = new Incident(
            incidentId,
            entityId,
            IncidentStatus.UNDER_INVESTIGATION,
            reporterRef,
            ctx.stub.getDateTimestamp().toISOString(),
            evidenceCid
        );

        await ctx.stub.putState(`INCIDENT_${incidentId}`, Buffer.from(JSON.stringify(incident)));
        ctx.stub.setEvent('INCIDENT_CREATED', Buffer.from(JSON.stringify(incident)));
    }

    @Transaction()
    public async updateIncidentStatus(ctx: Context, incidentId: string, statusStr: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        // Assume only regulators can update incidents globally for now
        if (mspId !== 'RegulatorOrg') {
            throw new Error(`Organization ${mspId} is not authorized to update incidents`);
        }

        const incidentBytes = await ctx.stub.getState(`INCIDENT_${incidentId}`);
        if (!incidentBytes || incidentBytes.length === 0) {
            throw new Error(`Incident ${incidentId} does not exist`);
        }
        
        const incident: Incident = JSON.parse(incidentBytes.toString());
        
        if (!Object.values(IncidentStatus).includes(statusStr as IncidentStatus)) {
            throw new Error(`Invalid incident status: ${statusStr}`);
        }
        
        incident.status = statusStr as IncidentStatus;
        
        await ctx.stub.putState(`INCIDENT_${incidentId}`, Buffer.from(JSON.stringify(incident)));
        ctx.stub.setEvent('INCIDENT_UPDATED', Buffer.from(JSON.stringify(incident)));
    }

    @Transaction()
    public async recordEscalation(ctx: Context, incidentId: string, targetOrg: string): Promise<void> {
        const incidentBytes = await ctx.stub.getState(`INCIDENT_${incidentId}`);
        if (!incidentBytes || incidentBytes.length === 0) {
            throw new Error(`Incident ${incidentId} does not exist`);
        }
        
        const incident: Incident = JSON.parse(incidentBytes.toString());
        incident.status = IncidentStatus.ESCALATED;
        
        await ctx.stub.putState(`INCIDENT_${incidentId}`, Buffer.from(JSON.stringify(incident)));
        ctx.stub.setEvent('INCIDENT_ESCALATED', Buffer.from(JSON.stringify({ incident, targetOrg })));
    }

    @Transaction()
    public async createRecallAction(ctx: Context, recallId: string, scopeRef: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        
        if (mspId !== 'RegulatorOrg') {
            throw new Error(`Organization ${mspId} is not authorized to issue a recall`);
        }

        const existing = await ctx.stub.getState(`RECALL_${recallId}`);
        if (existing && existing.length > 0) {
            throw new Error(`Recall ${recallId} already exists`);
        }

        const recall = new Recall(
            recallId,
            scopeRef,
            mspId,
            RecallStatus.ACTIVE,
            ctx.stub.getDateTimestamp().toISOString()
        );

        await ctx.stub.putState(`RECALL_${recallId}`, Buffer.from(JSON.stringify(recall)));
        ctx.stub.setEvent('RECALL_CREATED', Buffer.from(JSON.stringify(recall)));
    }

    @Transaction()
    public async closeIncident(ctx: Context, incidentId: string): Promise<void> {
        const mspId = ctx.clientIdentity.getMSPID();
        if (mspId !== 'RegulatorOrg') {
            throw new Error(`Organization ${mspId} is not authorized to close incidents`);
        }

        const incidentBytes = await ctx.stub.getState(`INCIDENT_${incidentId}`);
        if (!incidentBytes || incidentBytes.length === 0) {
            throw new Error(`Incident ${incidentId} does not exist`);
        }
        
        const incident: Incident = JSON.parse(incidentBytes.toString());
        incident.status = IncidentStatus.RESOLVED;
        
        await ctx.stub.putState(`INCIDENT_${incidentId}`, Buffer.from(JSON.stringify(incident)));
        ctx.stub.setEvent('INCIDENT_CLOSED', Buffer.from(JSON.stringify(incident)));
    }
}
