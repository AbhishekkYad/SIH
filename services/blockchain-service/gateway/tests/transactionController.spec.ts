import request from 'supertest';
import app from '../src/app';

jest.mock('../src/fabric/fabricManager', () => {
    return {
        fabricManager: {
            getContract: jest.fn().mockResolvedValue({
                submitTransaction: jest.fn().mockResolvedValue(Buffer.from(JSON.stringify({ status: 'success' })))
            }),
            getNetwork: jest.fn().mockResolvedValue({
                getChaincodeEvents: jest.fn().mockResolvedValue([])
            })
        }
    };
});

describe('Gateway Transactions API', () => {
    const validHeaders = {
        'Authorization': 'Bearer sih_super_secret_internal_key_2026',
        'X-Actor-MSP': 'Org1MSP',
        'X-Idempotency-Key': 'test-key-123'
    };

    it('should reject requests without authorization', async () => {
        const response = await request(app)
            .post('/internal/transactions/products')
            .set('X-Actor-MSP', 'Org1MSP')
            .send({});
        expect(response.status).toBe(401);
    });

    it('should reject requests with wrong internal key', async () => {
        const response = await request(app)
            .post('/internal/transactions/products')
            .set('Authorization', 'Bearer WRONG_KEY')
            .set('X-Actor-MSP', 'Org1MSP')
            .send({});
        expect(response.status).toBe(403);
    });

    it('should submit transaction and return COMMITTED status', async () => {
        const response = await request(app)
            .post('/internal/transactions/products')
            .set(validHeaders)
            .send({
                productId: 'PROD-1',
                name: 'Test Product',
                productType: 'Raw'
            });
            
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('COMMITTED');
        expect(response.body.result).toEqual({ status: 'success' });
    });

    it('should reject requests with duplicate idempotency key', async () => {
        const duplicateHeaders = { ...validHeaders, 'X-Idempotency-Key': 'duplicate-key-456' };

        // First request should succeed
        const res1 = await request(app)
            .post('/internal/transactions/products')
            .set(duplicateHeaders)
            .send({ productId: 'PROD-2' });
        expect(res1.status).toBe(200);

        // Second request with same idempotency key should conflict
        const res2 = await request(app)
            .post('/internal/transactions/products')
            .set(duplicateHeaders)
            .send({ productId: 'PROD-3' });
        expect(res2.status).toBe(409);
    });
});
