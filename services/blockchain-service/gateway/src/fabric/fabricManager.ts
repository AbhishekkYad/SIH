import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers, Gateway, Network } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

if (!process.env.CHANNEL_NAME) {
    throw new Error('CRITICAL: CHANNEL_NAME environment variable is not defined.');
}
if (!process.env.CHAINCODE_NAME) {
    throw new Error('CRITICAL: CHAINCODE_NAME environment variable is not defined.');
}
if (!process.env.CRYPTO_PATH) {
    throw new Error('CRITICAL: CRYPTO_PATH environment variable is not defined.');
}

const channelName = process.env.CHANNEL_NAME;
const chaincodeName = process.env.CHAINCODE_NAME;
const cryptoPath = process.env.CRYPTO_PATH;

export class FabricConnectionManager {
    private gateways: Map<string, Gateway> = new Map();

    public async getContract(mspId: string): Promise<Contract> {
        const gateway = await this.getGateway(mspId);
        const network = gateway.getNetwork(channelName);
        return network.getContract(chaincodeName);
    }

    public async getNetwork(mspId: string): Promise<Network> {
        const gateway = await this.getGateway(mspId);
        return gateway.getNetwork(channelName);
    }

    private async getGateway(mspId: string): Promise<Gateway> {
        if (this.gateways.has(mspId)) {
            return this.gateways.get(mspId)!;
        }

        // Configuration based on MSP ID
        let orgName = '';
        let peerEndpoint = '';
        let peerHostAlias = '';

        if (mspId === 'Org1MSP') {
            orgName = 'org1.example.com';
            peerEndpoint = 'localhost:7051';
            peerHostAlias = 'peer0.org1.example.com';
        } else if (mspId === 'Org2MSP') {
            orgName = 'org2.example.com';
            peerEndpoint = 'localhost:9051';
            peerHostAlias = 'peer0.org2.example.com';
        } else {
            throw new Error(`Unsupported MSP ID: ${mspId}`);
        }

        const orgPath = path.resolve(cryptoPath, orgName);
        const certPath = path.resolve(orgPath, 'users', `User1@${orgName}`, 'msp', 'signcerts', 'cert.pem');
        const keyDirectoryPath = path.resolve(orgPath, 'users', `User1@${orgName}`, 'msp', 'keystore');
        const tlsCertPath = path.resolve(orgPath, 'peers', peerHostAlias, 'tls', 'ca.crt');

        try {
            const credentials = await fs.readFile(certPath);
            const identity: Identity = { mspId, credentials };

            const keyFiles = await fs.readdir(keyDirectoryPath);
            const keyPath = path.resolve(keyDirectoryPath, keyFiles[0]);
            const privateKeyPem = await fs.readFile(keyPath);
            const privateKey = crypto.createPrivateKey(privateKeyPem);
            const signer: Signer = signers.newPrivateKeySigner(privateKey);

            const tlsRootCert = await fs.readFile(tlsCertPath);
            const client = new grpc.Client(peerEndpoint, grpc.credentials.createSsl(tlsRootCert), {
                'grpc.ssl_target_name_override': peerHostAlias,
            });

            const gateway = connect({
                client,
                identity,
                signer,
                evaluateOptions: () => {
                    return { deadline: Date.now() + 5000 }; // 5 seconds
                },
                endorseOptions: () => {
                    return { deadline: Date.now() + 15000 }; // 15 seconds
                },
                submitOptions: () => {
                    return { deadline: Date.now() + 5000 }; // 5 seconds
                },
                commitStatusOptions: () => {
                    return { deadline: Date.now() + 60000 }; // 1 minute
                },
            });

            this.gateways.set(mspId, gateway);
            return gateway;
        } catch (error) {
            console.error(`Failed to connect to gateway for ${mspId}:`, error);
            throw error;
        }
    }
}

export const fabricManager = new FabricConnectionManager();
