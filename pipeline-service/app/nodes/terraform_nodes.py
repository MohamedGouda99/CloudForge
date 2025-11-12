"""
Terraform workflow node types.
Provides nodes for Terraform CLI operations.
"""
from app.core.node_registry import register_node_type


@register_node_type(
    type_id="terraform_validate",
    display_name="Terraform Validate",
    category="terraform",
    icon="check-circle",
    description="Validate Terraform configuration files for syntax errors",
    docker_image="hashicorp/terraform:1.6.0",
    config_schema={
        "type": "object",
        "properties": {
            "working_directory": {
                "type": "string",
                "description": "Path to Terraform configuration directory",
                "default": "."
            }
        }
    }
)
async def execute_terraform_validate(node_execution_id: int, config: dict, context: dict):
    """Execute terraform validate command"""
    from app.core.docker_executor import run_in_container
    from app.models.node_execution import NodeExecution
    from app.core.database import SessionLocal

    working_dir = config.get("working_directory", ".")

    # Run terraform validate in container
    result = await run_in_container(
        node_execution_id=node_execution_id,
        image="hashicorp/terraform:1.6.0",
        command=["terraform", "validate"],
        working_dir=working_dir,
        context=context
    )

    return {
        "valid": result["exit_code"] == 0,
        "output": result["stdout"],
        "errors": result["stderr"]
    }


@register_node_type(
    type_id="terraform_plan",
    display_name="Terraform Plan",
    category="terraform",
    icon="file-text",
    description="Generate Terraform execution plan",
    docker_image="hashicorp/terraform:1.6.0",
    config_schema={
        "type": "object",
        "properties": {
            "working_directory": {"type": "string", "default": "."},
            "var_file": {"type": "string", "description": "Variables file (optional)"},
            "out_file": {"type": "string", "default": "tfplan", "description": "Output plan file"}
        }
    }
)
async def execute_terraform_plan(node_execution_id: int, config: dict, context: dict):
    """Execute terraform plan command"""
    from app.core.docker_executor import run_in_container

    working_dir = config.get("working_directory", ".")
    var_file = config.get("var_file")
    out_file = config.get("out_file", "tfplan")

    command = ["terraform", "plan", "-out=" + out_file]
    if var_file:
        command.extend(["-var-file=" + var_file])

    result = await run_in_container(
        node_execution_id=node_execution_id,
        image="hashicorp/terraform:1.6.0",
        command=command,
        working_dir=working_dir,
        context=context
    )

    return {
        "plan_file": out_file,
        "has_changes": "No changes" not in result["stdout"],
        "output": result["stdout"]
    }


@register_node_type(
    type_id="terraform_apply",
    display_name="Terraform Apply",
    category="terraform",
    icon="play",
    description="Apply Terraform changes to infrastructure",
    docker_image="hashicorp/terraform:1.6.0",
    config_schema={
        "type": "object",
        "properties": {
            "working_directory": {"type": "string", "default": "."},
            "plan_file": {"type": "string", "description": "Plan file to apply (optional)"},
            "auto_approve": {"type": "boolean", "default": False}
        }
    }
)
async def execute_terraform_apply(node_execution_id: int, config: dict, context: dict):
    """Execute terraform apply command"""
    from app.core.docker_executor import run_in_container

    working_dir = config.get("working_directory", ".")
    plan_file = config.get("plan_file")
    auto_approve = config.get("auto_approve", False)

    command = ["terraform", "apply"]
    if plan_file:
        command.append(plan_file)
    elif auto_approve:
        command.append("-auto-approve")

    result = await run_in_container(
        node_execution_id=node_execution_id,
        image="hashicorp/terraform:1.6.0",
        command=command,
        working_dir=working_dir,
        context=context
    )

    return {
        "applied": result["exit_code"] == 0,
        "output": result["stdout"]
    }


@register_node_type(
    type_id="terraform_destroy",
    display_name="Terraform Destroy",
    category="terraform",
    icon="trash",
    description="Destroy Terraform-managed infrastructure",
    docker_image="hashicorp/terraform:1.6.0",
    config_schema={
        "type": "object",
        "properties": {
            "working_directory": {"type": "string", "default": "."},
            "auto_approve": {"type": "boolean", "default": False}
        }
    }
)
async def execute_terraform_destroy(node_execution_id: int, config: dict, context: dict):
    """Execute terraform destroy command"""
    from app.core.docker_executor import run_in_container

    working_dir = config.get("working_directory", ".")
    auto_approve = config.get("auto_approve", False)

    command = ["terraform", "destroy"]
    if auto_approve:
        command.append("-auto-approve")

    result = await run_in_container(
        node_execution_id=node_execution_id,
        image="hashicorp/terraform:1.6.0",
        command=command,
        working_dir=working_dir,
        context=context
    )

    return {
        "destroyed": result["exit_code"] == 0,
        "output": result["stdout"]
    }
