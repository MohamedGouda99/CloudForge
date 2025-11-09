FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Terraform
RUN wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip && \
    unzip terraform_1.6.0_linux_amd64.zip && \
    mv terraform /usr/local/bin/ && \
    rm terraform_1.6.0_linux_amd64.zip && \
    terraform --version

# Install tfsec
RUN wget https://github.com/aquasecurity/tfsec/releases/download/v1.28.1/tfsec-linux-amd64 && \
    chmod +x tfsec-linux-amd64 && \
    mv tfsec-linux-amd64 /usr/local/bin/tfsec && \
    tfsec --version

# Install Terrascan
RUN wget https://github.com/tenable/terrascan/releases/download/v1.18.3/terrascan_1.18.3_Linux_x86_64.tar.gz && \
    tar -xzf terrascan_1.18.3_Linux_x86_64.tar.gz && \
    mv terrascan /usr/local/bin/ && \
    rm terrascan_1.18.3_Linux_x86_64.tar.gz && \
    terrascan version

# Install Infracost
RUN curl -fsSL https://raw.githubusercontent.com/infracost/infracost/master/scripts/install.sh | sh && \
    infracost --version

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create terraform workspace directory
RUN mkdir -p /app/terraform_workspaces

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV INFRACOST_API_KEY=ico-4xqc9bXXsEoViseD6A7kMjdns7d4LStZ

# Expose API port
EXPOSE 8001

# Default command (will be overridden in docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
