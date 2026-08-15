import logging
import json
from typing import Any, Optional
import redis.asyncio as aioredis
from redis.exceptions import RedisError

from app.config import settings

logger = logging.getLogger("sih.redis")

class RedisCache:
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
        self.url = settings.REDIS_URL

    async def connect(self):
        """
        Establishes an async connection connection to the Redis cache.
        Bypasses/shields failures gracefully if Redis is down or unreachable.
        """
        try:
            self.redis = aioredis.from_url(self.url, decode_responses=True)
            # Perform liveness probe (ping)
            await self.redis.ping()
            logger.info("Connected to Redis cache successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to Redis at {self.url}: {e}. Service will continue in DB-fallback mode.")
            self.redis = None

    async def is_ready(self) -> bool:
        """Probes current Redis client liveness status."""
        if not self.redis:
            return False
        try:
            await self.redis.ping()
            return True
        except Exception:
            return False

    async def close(self):
        """Cleanly releases Redis connection resource."""
        if self.redis:
            await self.redis.close()

    async def get(self, key: str) -> Optional[str]:
        """
        Retrieves raw string value from cache key.
        Catches RedisError exception and returns None to proceed with PostgreSQL lookup.
        """
        if not self.redis:
            return None
        try:
            return await self.redis.get(key)
        except RedisError as e:
            logger.error(f"Redis GET failed for key {key}: {e}. Falling back to DB.")
            return None

    async def set(self, key: str, value: str, expire: int = 3600) -> bool:
        """
        Sets key value with configurable Time-To-Live (TTL) expiration.
        Shields all Redis connection exceptions.
        """
        if not self.redis:
            return False
        try:
            await self.redis.set(key, value, ex=expire)
            return True
        except RedisError as e:
            logger.error(f"Redis SET failed for key {key}: {e}.")
            return False

    async def delete(self, key: str) -> bool:
        """
        Invalidates a key from the cache.
        Used to prevent stale cache views after a postgres write mutation.
        """
        if not self.redis:
            return False
        try:
            await self.redis.delete(key)
            return True
        except RedisError as e:
            logger.error(f"Redis DELETE failed for key {key}: {e}.")
            return False

    async def get_json(self, key: str) -> Optional[Any]:
        """Utility getter that parses cache string into dict representation."""
        val = await self.get(key)
        if val:
            try:
                return json.loads(val)
            except json.JSONDecodeError:
                return None
        return None

    async def set_json(self, key: str, value: Any, expire: int = 3600) -> bool:
        """Utility setter that serializes dict/list into cache string."""
        try:
            serialized = json.dumps(value)
            return await self.set(key, serialized, expire)
        except (TypeError, ValueError) as e:
            logger.error(f"Failed to serialize value for Redis key {key}: {e}.")
            return False

# Global instance
redis_cache = RedisCache()
