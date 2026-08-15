import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "SIH 2026 Food Traceability - Application Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Mock Mode: when True, uses Mock DataServiceClient and Mock BlockchainServiceClient
    MOCK_MODE: bool = False
    
    # Service URLs for real inter-service REST communication
    DATA_SERVICE_URL: str = "http://localhost:8001"
    BLOCKCHAIN_SERVICE_URL: str = "http://localhost:3005"
    
    # Internal Auth
    INTERNAL_API_KEY: str = "sih_super_secret_internal_key_2026"
    
    # Auth / JWT Config
    JWT_SECRET: str = "sih-2026-super-secret-jwt-key-food-traceability-platform-change-in-prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
