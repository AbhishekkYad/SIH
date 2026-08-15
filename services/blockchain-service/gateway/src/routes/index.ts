import { Router } from 'express';
import healthRoutes from './health';
import transactionRoutes from './transactions';
import incidentRoutes from './incidents';
import recallRoutes from './recalls';
import blockRoutes from './blocks';
import auditRoutes from './audit';

const internalRouter = Router();

internalRouter.use('/transactions', transactionRoutes);
internalRouter.use('/incidents', incidentRoutes);
internalRouter.use('/recalls', recallRoutes);
internalRouter.use('/blocks', blockRoutes);
internalRouter.use('/audit', auditRoutes);

export default {
    health: healthRoutes,
    internal: internalRouter
};
