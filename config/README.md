# Configuration Files

This directory contains environment configuration templates for CloudForge.

## Files

- `development.env` - Local development configuration
- `staging.env` - Staging environment configuration
- `production.env` - Production environment configuration

## Usage

1. Copy the appropriate file to the project root as `.env`:
   ```bash
   cp config/development.env .env
   ```

2. Fill in the required values for your environment.

3. For staging/production, use environment variables or secrets management:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Kubernetes Secrets
   - Docker Secrets

## Required Variables

The following environment variables are **required** for the application to start:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing key (min 32 characters) |
| `REDIS_URL` | Redis connection string |

## Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging level | `INFO` |
| `LOG_FORMAT` | `text` or `json` | `json` |
| `CORS_ORIGINS` | Allowed CORS origins | None |
| `JWT_EXPIRE_MINUTES` | Token expiration | 60 |

## Security Notes

- **Never** commit `.env` files with real credentials
- Use `${VAR_NAME}` syntax for values that should be injected at runtime
- Rotate `SECRET_KEY` periodically
- Use separate credentials for each environment
