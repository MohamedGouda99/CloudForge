from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://cloudforge:cloudforge_dev_password@localhost:5433/cloudforge"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Infracost
    infracost_api_key: str = "ico-4xqc9bXXsEoViseD6A7kMjdns7d4LStZ"

    # Main API
    main_api_url: str = "http://localhost:8000"

    # Terraform workspace
    terraform_workspace_dir: str = "/app/terraform_workspaces"

    # Environment
    environment: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
