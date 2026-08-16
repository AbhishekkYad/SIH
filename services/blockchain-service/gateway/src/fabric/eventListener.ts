import { fabricManager } from './fabricManager';
import axios from 'axios';
import { ChaincodeEvent } from '@hyperledger/fabric-gateway';

if (!process.env.WEBHOOK_URL) throw new Error('CRITICAL: WEBHOOK_URL environment variable is not defined.');
if (!process.env.INTERNAL_API_KEY) throw new Error('CRITICAL: INTERNAL_API_KEY environment variable is not defined.');
if (!process.env.EVENT_LISTENER_MSP) throw new Error('CRITICAL: EVENT_LISTENER_MSP environment variable is not defined.');

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const EVENT_LISTENER_MSP = process.env.EVENT_LISTENER_MSP;
const MAX_RETRIES = 5;

const utf8Decoder = new TextDecoder();

export async function startEventListener() {
    try {
        const network = await fabricManager.getNetwork(EVENT_LISTENER_MSP);
        
        console.log(`Starting Fabric event listener using ${EVENT_LISTENER_MSP}...`);
        
        const eventIterator = await network.getChaincodeEvents('traceability');
        
        // This loop runs continuously in the background
        for await (const event of eventIterator) {
            await processEvent(event);
        }
    } catch (error) {
        console.error('Event listener encountered an error. Restarting in 5s...', error);
        setTimeout(startEventListener, 5000);
    }
}

async function processEvent(event: ChaincodeEvent) {
    const eventName = event.eventName;
    const payloadBytes = event.payload;
    const blockNumber = event.blockNumber;
    const transactionId = event.transactionId;

    let payloadStr = '';
    let payloadJson = null;

    if (payloadBytes && payloadBytes.length > 0) {
        payloadStr = utf8Decoder.decode(payloadBytes);
        try {
            payloadJson = JSON.parse(payloadStr);
        } catch {
            payloadJson = payloadStr;
        }
    }

    const webhookPayload = {
        transaction_id: transactionId,
        block_number: Number(blockNumber),
        event_name: eventName,
        payload: payloadJson,
        emitted_at: new Date().toISOString()
    };

    console.log(`Dispatching event ${eventName} (Tx: ${transactionId}) to D3...`);

    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            await axios.post(WEBHOOK_URL, webhookPayload, {
                headers: {
                    'Authorization': `Bearer ${INTERNAL_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });
            console.log(`Successfully dispatched ${eventName}`);
            break; // Success
        } catch (error: any) {
            retries++;
            console.error(`Webhook delivery failed (Attempt ${retries}/${MAX_RETRIES}): ${error.message}`);
            if (retries >= MAX_RETRIES) {
                console.error(`CRITICAL: Dropped event ${eventName} after ${MAX_RETRIES} failed attempts.`);
            } else {
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            }
        }
    }
}
