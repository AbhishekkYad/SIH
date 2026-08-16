import * as dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { startEventListener } from './fabric/eventListener';

if (!process.env.PORT) {
    console.error('CRITICAL: PORT environment variable is not defined.');
    process.exit(1);
}

const PORT = process.env.PORT;

async function startServer() {
    try {
        app.listen(PORT, () => {
            console.log(`Gateway service listening on port ${PORT}`);
        });

        // Start listening to Fabric events in the background
        await startEventListener();
    } catch (error) {
        console.error('Failed to start Gateway server:', error);
        process.exit(1);
    }
}

startServer();
