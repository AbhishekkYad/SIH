import { IncidentContract } from '../IncidentContract';
import { MockContext } from '../test-utils/MockContext';
import { IncidentStatus } from '../models/Incident';
import { RecallStatus } from '../models/Recall';

describe('IncidentContract', () => {
    let contract: IncidentContract;

    beforeEach(() => {
        contract = new IncidentContract();
    });

    describe('startInvestigation', () => {
        it('should start investigation successfully', async () => {
            const ctx = new MockContext('RegulatorOrg');
            await contract.startInvestigation(ctx as any, 'INC001', 'B001', 'UserReport', 'CID123');
            
            const incBytes = await ctx.stub.getState('INCIDENT_INC001');
            const incident = JSON.parse(incBytes!.toString());
            expect(incident.status).toEqual(IncidentStatus.UNDER_INVESTIGATION);
            expect(incident.incident_id).toEqual('INC001');
        });
    });

    describe('updateIncidentStatus', () => {
        it('should update status successfully if RegulatorOrg', async () => {
            const ctx = new MockContext('RegulatorOrg');
            await contract.startInvestigation(ctx as any, 'INC001', 'B001', 'UserReport', 'CID123');
            
            await contract.updateIncidentStatus(ctx as any, 'INC001', IncidentStatus.ESCALATED);
            
            const incBytes = await ctx.stub.getState('INCIDENT_INC001');
            expect(JSON.parse(incBytes!.toString()).status).toEqual(IncidentStatus.ESCALATED);
        });

        it('should fail update if not RegulatorOrg', async () => {
            const ctx = new MockContext('FarmerOrg');
            await expect(contract.updateIncidentStatus(ctx as any, 'INC001', IncidentStatus.ESCALATED)).rejects.toThrow('Organization FarmerOrg is not authorized to update incidents');
        });

        it('should fail update if invalid status transition', async () => {
            const ctx = new MockContext('RegulatorOrg');
            await contract.startInvestigation(ctx as any, 'INC001', 'B001', 'UserReport', 'CID123');
            
            await expect(contract.updateIncidentStatus(ctx as any, 'INC001', 'MAGIC_STATUS')).rejects.toThrow('Invalid incident status: MAGIC_STATUS');
        });
    });

    describe('Recall', () => {
        it('should create recall action successfully', async () => {
            const ctx = new MockContext('RegulatorOrg');
            await contract.createRecallAction(ctx as any, 'REC001', 'P001');
            
            const recBytes = await ctx.stub.getState('RECALL_REC001');
            expect(JSON.parse(recBytes!.toString()).status).toEqual(RecallStatus.ACTIVE);
        });

        it('should fail to create recall if not RegulatorOrg', async () => {
            const ctx = new MockContext('RetailerOrg');
            await expect(contract.createRecallAction(ctx as any, 'REC001', 'P001')).rejects.toThrow('Organization RetailerOrg is not authorized to issue a recall');
        });
    });

    describe('closeIncident', () => {
        it('should close incident successfully', async () => {
            const ctx = new MockContext('RegulatorOrg');
            await contract.startInvestigation(ctx as any, 'INC001', 'B001', 'UserReport', 'CID123');
            await contract.closeIncident(ctx as any, 'INC001');
            
            const incBytes = await ctx.stub.getState('INCIDENT_INC001');
            expect(JSON.parse(incBytes!.toString()).status).toEqual(IncidentStatus.RESOLVED);
        });
    });
});
