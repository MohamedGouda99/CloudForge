"""
Cost analysis workflow node types.
Provides nodes for cloud cost estimation.
"""
from app.core.node_registry import register_node_type


@register_node_type(
    type_id="infracost_estimate",
    display_name="Cost Estimation",
    category="cost",
    icon="dollar-sign",
    description="Estimate infrastructure costs using Infracost",
    docker_image="infracost/infracost:latest",
    config_schema={
        "type": "object",
        "properties": {
            "working_directory": {"type": "string", "default": "."},
            "terraform_plan_file": {"type": "string", "description": "Path to Terraform plan JSON (optional)"},
            "format": {"type": "string", "enum": ["json", "table", "html"], "default": "json"},
            "infracost_api_key": {
                "type": "string",
                "description": "Personal infracost API key (overrides workspace value)",
                "format": "password"
            }
        }
    }
)
async def execute_infracost_estimate(node_execution_id: int, config: dict, context: dict):
    """Execute Infracost cost estimation"""
    from app.core.docker_executor import run_in_container
    import json
    import os

    working_dir = config.get("working_directory", ".")
    plan_file = config.get("terraform_plan_file")
    format_type = config.get("format", "json")

    # Get Infracost API key from environment
    api_key = config.get("infracost_api_key") or os.getenv("INFRACOST_API_KEY") or os.environ.get("INFRACOST_DEFAULT_API_KEY", "")

    command = ["infracost", "breakdown", "--format", format_type]
    if plan_file:
        command.extend(["--path", plan_file])
    else:
        command.extend(["--path", "."])

    result = await run_in_container(
        node_execution_id=node_execution_id,
        image="infracost/infracost:latest",
        command=command,
        working_dir=working_dir,
        context=context,
        environment={"INFRACOST_API_KEY": api_key} if api_key else None
    )

    # Parse JSON output
    cost_data = {}
    if format_type == "json" and result["stdout"]:
        try:
            cost_data = json.loads(result["stdout"])
        except json.JSONDecodeError:
            pass

    total_monthly_cost = 0.0
    if cost_data and "totalMonthlyCost" in cost_data:
        total_monthly_cost = float(cost_data.get("totalMonthlyCost", 0))

    return {
        "total_monthly_cost": total_monthly_cost,
        "currency": "USD",
        "cost_breakdown": cost_data,
        "raw_output": result["stdout"]
    }
