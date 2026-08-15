import logging
import hashlib
from typing import Tuple
import httpx

from app.config import settings

logger = logging.getLogger("sih.ipfs")

class IpfsClient:
    def __init__(self):
        self.api_url = settings.IPFS_API_URL

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
        If connection or upload fails, raises Exception (which API handles as 503).
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
            except httpx.RequestError as e:
                logger.error(f"IPFS add_file connection error: {e}")
                raise Exception(f"IPFS connection failure: {e}")

    async def cat_file(self, cid: str) -> bytes:
        """
        Downloads raw file bytes from IPFS by CID using the /api/v0/cat RPC endpoint.
        If connection or retrieval fails, raises Exception.
        """
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.post(f"{self.api_url}/api/v0/cat", params={"arg": cid})
                if response.status_code != 200:
                    raise Exception(f"IPFS daemon returned status {response.status_code} for cat: {response.text}")
                return response.content
            except httpx.RequestError as e:
                logger.error(f"IPFS cat_file connection error: {e}")
                raise Exception(f"IPFS connection failure: {e}")

# Global instance
ipfs_client = IpfsClient()
