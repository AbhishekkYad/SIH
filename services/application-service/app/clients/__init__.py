from app.config import settings
from app.clients.data_service import DataServiceClient, MockDataServiceClient
from app.clients.blockchain_service import BlockchainServiceClient, MockBlockchainServiceClient

if settings.MOCK_MODE:
    data_client = MockDataServiceClient()
    blockchain_client = MockBlockchainServiceClient()
else:
    data_client = DataServiceClient(base_url=settings.DATA_SERVICE_URL)
    blockchain_client = BlockchainServiceClient(base_url=settings.BLOCKCHAIN_SERVICE_URL)


def get_data_client():
    return data_client


def get_blockchain_client():
    return blockchain_client
