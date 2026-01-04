"""
CloudForge AI Assistant Service using Claude (Anthropic)
"""

import json
from typing import Optional, List, Dict, Any
from anthropic import Anthropic
from app.core.config import settings

# Initialize Anthropic client
client: Optional[Anthropic] = None

def get_client() -> Anthropic:
    """Get or create Anthropic client."""
    global client
    if client is None:
        if not settings.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
        client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return client


# System prompt that teaches Claude about CloudForge
SYSTEM_PROMPT = """You are CloudForge AI Assistant, an expert cloud infrastructure architect integrated into the CloudForge platform - a visual Terraform Infrastructure as Code (IaC) designer.

## About CloudForge
CloudForge is a web-based platform that allows users to:
- Visually design cloud infrastructure using drag-and-drop
- Generate Terraform code automatically from visual diagrams
- Deploy infrastructure to AWS, Azure, and GCP
- Validate, plan, apply, and destroy Terraform configurations
- Run security scans (tfsec, terrascan) and cost estimation (infracost)

## Your Capabilities
You help users:
1. **Design Architecture**: Suggest cloud resources and how to connect them
2. **Best Practices**: Recommend security, scalability, and cost optimization
3. **Terraform Help**: Explain Terraform concepts and configurations
4. **Troubleshoot**: Help debug deployment issues and errors

## Available Resources by Provider

### AWS Resources
- **Networking**: VPC, Subnet, Internet Gateway, NAT Gateway, Route Table, Security Group, Network ACL, Elastic IP, VPC Endpoint
- **Compute**: EC2 Instance, Auto Scaling Group, Launch Template, ECS Cluster, ECS Service, EKS Cluster, Lambda Function
- **Storage**: S3 Bucket, EBS Volume, EFS File System, FSx
- **Database**: RDS Instance, DynamoDB Table, ElastiCache, Aurora Cluster, DocumentDB
- **Load Balancing**: ALB, NLB, Target Group
- **DNS & CDN**: Route53 Zone, CloudFront Distribution
- **Security**: IAM Role, IAM Policy, KMS Key, Secrets Manager, WAF
- **Monitoring**: CloudWatch Alarm, CloudWatch Log Group, SNS Topic, SQS Queue

### Azure Resources
- **Networking**: Virtual Network, Subnet, Network Security Group, Public IP, Load Balancer, Application Gateway, VPN Gateway
- **Compute**: Virtual Machine, VM Scale Set, AKS Cluster, Container Instance, Function App
- **Storage**: Storage Account, Blob Container, File Share, Managed Disk
- **Database**: SQL Database, Cosmos DB, Redis Cache, PostgreSQL, MySQL
- **Security**: Key Vault, Managed Identity

### GCP Resources
- **Networking**: VPC Network, Subnet, Firewall Rule, Cloud NAT, Cloud Router, Load Balancer
- **Compute**: Compute Instance, Instance Group, GKE Cluster, Cloud Run, Cloud Functions
- **Storage**: Cloud Storage Bucket, Persistent Disk, Filestore
- **Database**: Cloud SQL, Cloud Spanner, Firestore, Bigtable, Memorystore
- **Security**: IAM, Secret Manager, KMS

## Response Format
When suggesting architecture, provide:
1. **Resources needed** with their types
2. **Connections** between resources
3. **Key configurations** to set
4. **Security considerations**
5. **Estimated costs** (if relevant)

When the user asks to create or modify architecture, respond with a structured JSON block that can be imported into the canvas:

```json
{
  "action": "add_resources",
  "resources": [
    {
      "type": "aws_vpc",
      "name": "main_vpc",
      "config": {
        "cidr_block": "10.0.0.0/16",
        "enable_dns_hostnames": true,
        "enable_dns_support": true
      }
    }
  ],
  "connections": [
    {"from": "public_subnet", "to": "main_vpc"}
  ],
  "explanation": "Brief explanation of the architecture"
}
```

## Important Guidelines
- Always prioritize security (least privilege, encryption, private subnets for databases)
- Consider high availability (multi-AZ, auto-scaling)
- Optimize for cost (right-sizing, reserved instances suggestions)
- Follow cloud provider best practices
- Use descriptive resource names with prefixes (e.g., prod_, dev_)
- Always include proper tagging for resources

Be concise, practical, and focus on actionable advice. When users describe what they want to build, translate it into specific cloud resources and configurations."""


def chat_completion(
    messages: List[Dict[str, str]],
    model: str = "claude-sonnet-4-20250514",
    max_tokens: int = 4096,
    canvas_context: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Send a chat completion request to Claude.

    Args:
        messages: List of message dicts with 'role' and 'content'
        model: Claude model to use (claude-sonnet-4-20250514 or claude-opus-4-20250514)
        max_tokens: Maximum tokens in response
        canvas_context: Optional current canvas state (nodes, edges) for context

    Returns:
        Assistant's response text
    """
    anthropic = get_client()

    # Build system prompt with optional canvas context
    system = SYSTEM_PROMPT
    if canvas_context:
        system += f"\n\n## Current Canvas State\nThe user's current diagram has the following resources:\n```json\n{json.dumps(canvas_context, indent=2)}\n```"

    # Convert messages to Anthropic format
    anthropic_messages = []
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ["user", "assistant"]:
            anthropic_messages.append({"role": role, "content": content})

    response = anthropic.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=anthropic_messages,
    )

    # Extract text from response
    if response.content and len(response.content) > 0:
        return response.content[0].text
    return ""


def generate_architecture(
    prompt: str,
    provider: str = "aws",
    model: str = "claude-sonnet-4-20250514",
    current_canvas: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Generate architecture suggestion from a natural language prompt.

    Args:
        prompt: User's description of what they want to build
        provider: Cloud provider (aws, azure, gcp)
        model: Claude model to use
        current_canvas: Current canvas state for context

    Returns:
        Dict with resources, connections, and explanation
    """
    system = SYSTEM_PROMPT + f"""

## Current Task
The user is designing for {provider.upper()}. Generate a JSON response with:
1. "resources": Array of resources to add
2. "connections": Array of connections between resources
3. "explanation": Brief explanation

Respond ONLY with valid JSON, no markdown code blocks or extra text."""

    if current_canvas:
        system += f"\n\nCurrent canvas state:\n{json.dumps(current_canvas, indent=2)}"

    anthropic = get_client()

    response = anthropic.messages.create(
        model=model,
        max_tokens=4096,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = ""
    if response.content and len(response.content) > 0:
        response_text = response.content[0].text

    # Try to parse JSON from response
    try:
        # Remove markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]

        return json.loads(response_text.strip())
    except json.JSONDecodeError:
        # Return as explanation if not valid JSON
        return {
            "resources": [],
            "connections": [],
            "explanation": response_text
        }
