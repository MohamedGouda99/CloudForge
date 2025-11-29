from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import field_validator


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "CloudForge"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://cloudforge:cloudforge_dev_password@localhost:5432/cloudforge"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    INITIAL_ADMIN_USERNAME: str = "admin"
    INITIAL_ADMIN_PASSWORD: str = "admin123"
    INITIAL_ADMIN_EMAIL: str = "admin@cloudforge.dev"

    # CORS
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:5000", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:5173"]

    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(',')]
        return v

    # Cloud Providers
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

    # Terraform
    TERRAFORM_WORKSPACE_DIR: str = "./generated_terraform"

    # Infracost
    INFRACOST_API_KEY: str = ""

    # LLMs
    GEMINI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # Git
    GIT_DEFAULT_BRANCH: str = "main"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
