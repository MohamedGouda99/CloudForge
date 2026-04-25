# Production Dockerfile for Render deployment.
# Build context is the repo root so we can include the shared resource catalog
# alongside the backend. For local dev, docker-compose continues to use
# backend/Dockerfile with context=./backend.

FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# System deps: build tools, postgres client, Node 20, Terraform, tfsec,
# terrascan, infracost. Required because the backend shells out to these
# CLIs for generation, security scans, and cost estimation.
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        postgresql-client \
        git \
        wget \
        unzip \
        curl \
        ca-certificates \
        gnupg \
        bash \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Terraform 1.6.6
RUN wget -q https://releases.hashicorp.com/terraform/1.6.6/terraform_1.6.6_linux_amd64.zip \
    && unzip terraform_1.6.6_linux_amd64.zip \
    && mv terraform /usr/local/bin/ \
    && rm terraform_1.6.6_linux_amd64.zip

# TFSec
RUN wget -q https://github.com/aquasecurity/tfsec/releases/download/v1.28.1/tfsec-linux-amd64 \
    && chmod +x tfsec-linux-amd64 \
    && mv tfsec-linux-amd64 /usr/local/bin/tfsec

# Terrascan
RUN wget -q https://github.com/tenable/terrascan/releases/download/v1.18.3/terrascan_1.18.3_Linux_x86_64.tar.gz \
    && tar -xzf terrascan_1.18.3_Linux_x86_64.tar.gz \
    && mv terrascan /usr/local/bin/ \
    && rm terrascan_1.18.3_Linux_x86_64.tar.gz

# Infracost
RUN curl -fsSL https://raw.githubusercontent.com/infracost/infracost/master/scripts/install.sh | sh

# Python deps (copied first for better layer caching)
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Backend app source
COPY backend/ /app/

# Shared resource catalog source + build it inside the image.
# The backend's schema_loader.py walks five levels up from itself and
# reads dist/schemas/*.schema.json, so we mount the catalog at /shared
# (which is five levels up from /app/app/services/terraform/).
COPY shared/resource-catalog/ /shared/resource-catalog/
RUN cd /shared/resource-catalog \
    && npm install --no-audit --no-fund \
    && npm run build \
    && npm prune --omit=dev

# Runtime dirs
RUN mkdir -p /app/generated_terraform

EXPOSE 8000

# Render sets $PORT; start-combined.sh runs celery in the background and
# uvicorn in the foreground.
CMD ["bash", "/app/start-combined.sh"]
