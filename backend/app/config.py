import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "SIH 2026 Food Traceability - FastAPI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Mode flag: Mock integrations or Direct DB/Redis/IPFS/Fabric connections
    MOCK_MODE: bool = True
    
    # Direct Database / Cache / IPFS / Fabric Connection URIs
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "food_traceability_db"
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    IPFS_GATEWAY_URL: str = "http://localhost:5001"
    FABRIC_GATEWAY_URL: str = "http://localhost:7051"
    
    # Auth / JWT Config
    JWT_SECRET: str = "sih-2026-super-secret-jwt-key-food-traceability-platform"
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
