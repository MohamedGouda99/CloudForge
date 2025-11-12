"""
Security scanning workflow node types.
Provides nodes for various IaC security tools.
"""
from app.core.node_registry import register_node_type


@register_node_type(
    type_id="tfsec_scan",
    display_name="tfsec Security Scan",
    category="security",
    icon="shield",
    description="Scan Terraform code for security issues using tfsec",
    docker_image="aquasec/tfsec:latest",
    config_schema={
        "type": "object",
        "properties": {
            "working_directory": {"type": "string", "default": "."},
            "format": {"type": "string", "enum": ["default", "json", "junit"], "default": "json"},
            "minimum_severity": {"type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"], "default": "MEDIUM"}
        }
    }
)
async def execute_tfsec_scan(node_execution_id: int, config: dict, context: dict):
    """Execute tfsec security scan"""
    from app.core.docker_executor import run_in_container
    import json

    working_dir = config.get("working_directory", ".")
    format_type = config.get("format", "json")
    min_severity = config.get("minimum_severity", "MEDIUM")

    command = ["tfsec", ".", f"--format={format_type}", f"--minimum-severity={min_severity}"]

    result = await run_in_container(
        node_execution_id=node_execution_id,
        image="aquasec/tfsec:latest",
        command=command,
        working_dir=working_dir,
        context=context
    )

    # Parse JSON output if available
    findings = []
    if format_type == "json" and result["stdout"]:
        try:
            scan_data = json.loads(result["stdout"])
            findings = scan_data.get("results", [])
        except json.JSONDecodeError:
            pass

    return {
        "findings_count": len(findings),
        "findings": findings,
        "passed": result["exit_code"] == 0,
        "raw_output": result["stdout"]
    }


@register_node_type(
    type_id="terrascan_scan",
    display_name="Terrascan Compliance Scan",
    category="security",
    icon="file-check",
    description="Scan Terraform code for compliance violations using Terrascan",
    docker_image="tenable/terrascan:latest",
    config_schema={
        "type": "object",
        "properties": {
            "working_directory": {"type": "string", "default": "."},
            "policy_type": {"type": "string", "enum": ["aws", "azure", "gcp", "kubernetes"], "default": "aws"}
        }
    }
)
async def execute_terrascan_scan(node_execution_id: int, config: dict, context: dict):
    """Execute Terrascan compliance scan"""
    from app.core.docker_executor import run_in_container
    import json

    working_dir = config.get("working_directory", ".")
    policy_type = config.get("policy_type", "aws")

    command = ["terrascan", "scan", "-i", "terraform", "-t", policy_type, "-o", "json"]

    result = await run_in_container(
        node_execution_id=node_execution_id,
        image="tenable/terrascan:latest",
        command=command,
        working_dir=working_dir,
        context=context
    )

    # Parse JSON output
    violations = []
    if result["stdout"]:
        try:
            scan_data = json.loads(result["stdout"])
            violations = scan_data.get("results", {}).get("violations", [])
        except json.JSONDecodeError:
            pass

    return {
        "violations_count": len(violations),
        "violations": violations,
        "passed": len(violations) == 0,
        "raw_output": result["stdout"]
    }


@register_node_type(
    type_id="checkov_scan",
    display_name="Checkov Policy Scan",
    category="security",
    icon="alert-triangle",
    description="Scan IaC for policy violations using Checkov",
    docker_image="bridgecrew/checkov:latest",
    config_schema={
        "type": "object",
        "properties": {
            "working_directory": {"type": "string", "default": "."},
            "framework": {"type": "string", "enum": ["terraform", "cloudformation", "kubernetes"], "default": "terraform"}
        }
    }
)
async def execute_checkov_scan(node_execution_id: int, config: dict, context: dict):
    """Execute Checkov policy scan"""
    from app.core.docker_executor import run_in_container
    import json

    working_dir = config.get("working_directory", ".")
    framework = config.get("framework", "terraform")

    command = ["checkov", "-d", ".", "--framework", framework, "-o", "json"]

    result = await run_in_container(
        node_execution_id=node_execution_id,
        image="bridgecrew/checkov:latest",
        command=command,
        working_dir=working_dir,
        context=context
    )

    # Parse JSON output
    failed_checks = []
    if result["stdout"]:
        try:
            scan_data = json.loads(result["stdout"])
            failed_checks = scan_data.get("results", {}).get("failed_checks", [])
        except json.JSONDecodeError:
            pass

    return {
        "failed_checks_count": len(failed_checks),
        "failed_checks": failed_checks,
        "passed": len(failed_checks) == 0,
        "raw_output": result["stdout"]
    }
