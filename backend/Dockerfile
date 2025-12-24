FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including Node.js for TypeScript generator
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    git \
    wget \
    unzip \
    curl \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Terraform
RUN wget https://releases.hashicorp.com/terraform/1.6.6/terraform_1.6.6_linux_amd64.zip \
    && unzip terraform_1.6.6_linux_amd64.zip \
    && mv terraform /usr/local/bin/ \
    && rm terraform_1.6.6_linux_amd64.zip

# Install tfsec
RUN wget https://github.com/aquasecurity/tfsec/releases/download/v1.28.1/tfsec-linux-amd64 \
    && chmod +x tfsec-linux-amd64 \
    && mv tfsec-linux-amd64 /usr/local/bin/tfsec

# Install terrascan
RUN wget https://github.com/tenable/terrascan/releases/download/v1.18.3/terrascan_1.18.3_Linux_x86_64.tar.gz \
    && tar -xzf terrascan_1.18.3_Linux_x86_64.tar.gz \
    && mv terrascan /usr/local/bin/ \
    && rm terrascan_1.18.3_Linux_x86_64.tar.gz

# Install infracost
RUN curl -fsSL https://raw.githubusercontent.com/infracost/infracost/master/scripts/install.sh | sh

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Install TypeScript generator dependencies
RUN if [ -d "/app/src/terraform" ]; then \
    cd /app/src/terraform && \
    npm install --production && \
    npm install -g tsx; \
    fi

# Create directory for generated Terraform files
RUN mkdir -p /app/generated_terraform

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
