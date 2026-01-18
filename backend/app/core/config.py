from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import field_validator
import os


class Settings(BaseSettings):
    APP_NAME: str = "CloudForge"
    VERSION: str = "0.1.0"
    APP_VERSION: str = "0.1.0"  # Alias for VERSION used in health checks
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    DATABASE_URL: str = "postgresql://cloudforge:cloudforge_dev_password@localhost:5432/cloudforge"

    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days
    INITIAL_ADMIN_USERNAME: str = "admin"
    INITIAL_ADMIN_PASSWORD: str = "admin123"
    INITIAL_ADMIN_EMAIL: str = "admin@cloudforge.dev"

    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:5000", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:5173"]

    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(',')]
        return v

    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_DEFAULT_REGION: str = "us-east-1"

    AZURE_SUBSCRIPTION_ID: str = ""
    AZURE_TENANT_ID: str = ""
    AZURE_CLIENT_ID: str = ""
    AZURE_CLIENT_SECRET: str = ""

    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    GOOGLE_CLOUD_PROJECT: str = ""
    GOOGLE_OAUTH_CLIENT_ID: str = ""

    TERRAFORM_WORKSPACE_DIR: str = "./generated_terraform"

    INFRACOST_API_KEY: str = ""

    # AI Assistant (Claude)
    ANTHROPIC_API_KEY: str = ""

    GIT_DEFAULT_BRANCH: str = "main"

    RATE_LIMIT_DEFAULT: str = "100/minute"
    RATE_LIMIT_AUTH: str = "10/minute"
    RATE_LIMIT_TERRAFORM: str = "5/minute"

    GUNICORN_WORKERS: int = 4
    GUNICORN_THREADS: int = 2
    GUNICORN_TIMEOUT: int = 120
    GUNICORN_KEEPALIVE: int = 5
    GUNICORN_MAX_REQUESTS: int = 1000
    GUNICORN_MAX_REQUESTS_JITTER: int = 50

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() in ("development", "dev")

    @classmethod
    def get_environment(cls) -> str:
        return os.getenv("ENVIRONMENT", "development").lower()


settings = Settings()
