import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app: Express = express();

app.use(cors());
app.use(express.json());

// Public routes (Health)
app.use('/health', routes.health);

// Protected internal routes
app.use('/internal', authMiddleware, routes.internal);

// Global Error Handler
app.use(errorHandler);

export default app;
