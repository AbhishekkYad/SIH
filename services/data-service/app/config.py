from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="postgresql+asyncpg://sih_user:sih_password@localhost:5432/sih_db")
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    IPFS_API_URL: str = Field(default="http://localhost:5001")
    INTERNAL_API_KEY: str = Field(default="sih_super_secret_internal_key_2026")
    HOST: str = "127.0.0.1"
    PORT: int = 8001

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
