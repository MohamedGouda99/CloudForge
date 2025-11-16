"""
Terraform workflow node types.
Provides nodes for Terraform CLI operations.
"""
from app.core.node_registry import register_node_type


@register_node_type(
    type_id="terraform",
    display_name="Terraform",
    category="terraform",
    icon="terraform",
    description="Execute Terraform commands (validate, plan, apply, destroy)",
    docker_image="hashicorp/terraform:1.6.0",
    config_schema={
        "type": "object",
        "properties": {
            "command": {
                "type": "string",
                "enum": ["validate", "plan", "apply", "destroy"],
                "default": "plan",
                "description": "Terraform command to execute"
            },
            "working_directory": {
                "type": "string",
                "description": "Path to Terraform configuration directory",
                "default": "."
            },
            "var_file": {
                "type": "string",
                "description": "Variables file (optional)"
            },
            "auto_approve": {
                "type": "boolean",
                "default": False,
                "description": "Auto-approve changes (for apply/destroy)"
            },
            "target": {
                "type": "string",
                "description": "Specific resource to target (optional)"
            }
        },
        "required": ["command"]
    }
)
async def execute_terraform(node_execution_id: int, config: dict, context: dict):
    """Execute terraform command based on config"""
    from app.core.docker_executor import run_in_container

    command_type = config.get("command", "plan")
    working_dir = config.get("working_directory", ".")
    var_file = config.get("var_file")
    auto_approve = config.get("auto_approve", False)
    target = config.get("target")

    # Build command based on type
    if command_type == "validate":
        command = ["terraform", "validate"]

    elif command_type == "plan":
        out_file = config.get("out_file", "tfplan")
        command = ["terraform", "plan", "-out=" + out_file]
        if var_file:
            command.extend(["-var-file=" + var_file])
        if target:
            command.extend(["-target=" + target])

    elif command_type == "apply":
        plan_file = config.get("plan_file")
        command = ["terraform", "apply"]
        if plan_file:
            command.append(plan_file)
        elif auto_approve:
            command.append("-auto-approve")
        if var_file and not plan_file:
            command.extend(["-var-file=" + var_file])
        if target:
            command.extend(["-target=" + target])

    elif command_type == "destroy":
        command = ["terraform", "destroy"]
        if auto_approve:
            command.append("-auto-approve")
        if var_file:
            command.extend(["-var-file=" + var_file])
        if target:
            command.extend(["-target=" + target])

    else:
        raise ValueError(f"Unknown terraform command: {command_type}")

    # Execute in container
    result = await run_in_container(
        node_execution_id=node_execution_id,
        image="hashicorp/terraform:1.6.0",
        command=command,
        working_dir=working_dir,
        context=context
    )

    return {
        "command": command_type,
        "success": result["exit_code"] == 0,
        "output": result["stdout"],
        "errors": result["stderr"],
        "exit_code": result["exit_code"]
    }
