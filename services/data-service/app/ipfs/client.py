import logging
import hashlib
from typing import Tuple
import httpx

from app.config import settings

logger = logging.getLogger("sih.ipfs")

class IpfsClient:
    def __init__(self):
        self.api_url = settings.IPFS_API_URL
        self._mock_storage = {} # Fallback storage

    async def is_ready(self) -> bool:
        """
        Probes the IPFS daemon API connection readiness by calling the /api/v0/version endpoint.
        """
        async with httpx.AsyncClient(timeout=3.0) as client:
            try:
                response = await client.post(f"{self.api_url}/api/v0/version")
                return response.status_code == 200
            except Exception:
                return False

    async def add_file(self, content: bytes) -> Tuple[str, str]:
        """
        Uploads raw file content to Kubo IPFS via the /api/v0/add RPC endpoint.
        Returns a tuple of (CID, SHA-256 content hash).
        If connection fails, falls back to in-memory mock storage for the Base Model demo.
        """
        content_hash = hashlib.sha256(content).hexdigest()
        files = {"file": ("upload", content)}
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(f"{self.api_url}/api/v0/add", files=files)
                if response.status_code != 200:
                    raise Exception(f"IPFS daemon returned status {response.status_code}: {response.text}")
                
                result = response.json()
                cid = result.get("Hash")
                if not cid:
                    raise Exception(f"IPFS response missing 'Hash' field: {response.text}")
                
                logger.info(f"File uploaded to IPFS successfully. CID: {cid}")
                return cid, content_hash
            except Exception as e:
                logger.warning(f"IPFS connection failure: {e}. Falling back to mock IPFS storage.")
                import uuid
                mock_cid = f"QmMock{uuid.uuid4().hex[:26]}"
                self._mock_storage[mock_cid] = content
                return mock_cid, content_hash

    async def cat_file(self, cid: str) -> bytes:
        """
        Downloads raw file bytes from IPFS by CID using the /api/v0/cat RPC endpoint.
        If connection fails or CID is mock, retrieves from mock storage.
        """
        if cid in self._mock_storage:
            return self._mock_storage[cid]
            
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.post(f"{self.api_url}/api/v0/cat", params={"arg": cid})
                if response.status_code != 200:
                    raise Exception(f"IPFS daemon returned status {response.status_code} for cat: {response.text}")
                return response.content
            except Exception as e:
                logger.error(f"IPFS cat_file connection error: {e}")
                raise Exception(f"IPFS connection failure and CID not found in mock storage: {e}")

# Global instance
ipfs_client = IpfsClient()
