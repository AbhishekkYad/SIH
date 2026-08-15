import app from './app';
import { startEventListener } from './fabric/eventListener';

const PORT = process.env.PORT || 7051;

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
