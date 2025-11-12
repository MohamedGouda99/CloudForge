"""
Control flow workflow node types.
Provides nodes for approvals, conditionals, and custom execution.
"""
from app.core.node_registry import register_node_type


@register_node_type(
    type_id="manual_approval",
    display_name="Manual Approval",
    category="control",
    icon="pause",
    description="Pause workflow for manual approval",
    config_schema={
        "type": "object",
        "properties": {
            "timeout_minutes": {"type": "integer", "default": 60, "description": "Auto-reject after timeout"},
            "required_approvers": {"type": "integer", "default": 1, "description": "Number of approvals needed"},
            "message": {"type": "string", "description": "Approval prompt message"}
        }
    }
)
async def execute_manual_approval(node_execution_id: int, config: dict, context: dict):
    """
    Wait for manual approval.
    This node pauses execution until a user approves/rejects via API.
    """
    from app.models.node_approval import NodeApproval, NodeApprovalStatus
    from app.models.node_execution import NodeExecution, NodeExecutionStatus
    from app.core.database import SessionLocal
    import asyncio
    from datetime import datetime, timedelta

    timeout_minutes = config.get("timeout_minutes", 60)
    required_approvers = config.get("required_approvers", 1)
    message = config.get("message", "Approval required to continue workflow")

    db = SessionLocal()
    try:
        # Create approval record
        approval = NodeApproval(
            node_execution_id=node_execution_id,
            status=NodeApprovalStatus.PENDING
        )
        db.add(approval)
        db.commit()

        # Update node execution status
        node_exec = db.query(NodeExecution).filter(NodeExecution.id == node_execution_id).first()
        node_exec.status = NodeExecutionStatus.WAITING_APPROVAL
        db.commit()

        # Wait for approval with timeout
        timeout_time = datetime.utcnow() + timedelta(minutes=timeout_minutes)
        while datetime.utcnow() < timeout_time:
            # Refresh approval status from DB
            db.refresh(approval)

            if approval.status == NodeApprovalStatus.APPROVED:
                return {
                    "approved": True,
                    "approved_by": approval.approved_by_user_id,
                    "approved_at": approval.approved_at.isoformat() if approval.approved_at else None
                }
            elif approval.status == NodeApprovalStatus.REJECTED:
                raise Exception(f"Approval rejected: {approval.rejection_reason or 'No reason provided'}")

            # Poll every 5 seconds
            await asyncio.sleep(5)

        # Timeout reached
        approval.status = NodeApprovalStatus.REJECTED
        approval.rejection_reason = f"Timeout after {timeout_minutes} minutes"
        db.commit()
        raise Exception(f"Approval timeout after {timeout_minutes} minutes")

    finally:
        db.close()


@register_node_type(
    type_id="conditional",
    display_name="Conditional Branch",
    category="control",
    icon="git-branch",
    description="Branch workflow based on condition",
    config_schema={
        "type": "object",
        "properties": {
            "condition": {
                "type": "string",
                "description": "Python expression to evaluate (e.g., 'cost > 100')",
            },
            "variables": {
                "type": "object",
                "description": "Variables available in condition (from previous nodes)"
            }
        },
        "required": ["condition"]
    }
)
async def execute_conditional(node_execution_id: int, config: dict, context: dict):
    """
    Evaluate a condition and determine which branch to take.
    Uses safe evaluation of Python expressions.
    """
    condition = config["condition"]
    variables = config.get("variables", {})

    # Add context variables
    variables.update(context.get("node_outputs", {}))

    # Safe evaluation (restricted namespace)
    allowed_names = {
        "True": True,
        "False": False,
        "None": None,
        **variables
    }

    try:
        result = eval(condition, {"__builtins__": {}}, allowed_names)
        condition_met = bool(result)
    except Exception as e:
        raise Exception(f"Condition evaluation failed: {str(e)}")

    return {
        "condition": condition,
        "result": condition_met,
        "variables": variables
    }


@register_node_type(
    type_id="custom_script",
    display_name="Custom Shell Script",
    category="custom",
    icon="terminal",
    description="Execute custom shell script",
    docker_image="alpine:latest",
    config_schema={
        "type": "object",
        "properties": {
            "script": {
                "type": "string",
                "description": "Shell script to execute (multiline supported)"
            },
            "interpreter": {
                "type": "string",
                "enum": ["sh", "bash", "python", "node"],
                "default": "sh"
            }
        },
        "required": ["script"]
    }
)
async def execute_custom_script(node_execution_id: int, config: dict, context: dict):
    """Execute custom shell script in container"""
    from app.core.docker_executor import run_in_container
    import tempfile
    import os

    script = config["script"]
    interpreter = config.get("interpreter", "sh")

    # Write script to temporary file
    script_file = f"/tmp/workflow_script_{node_execution_id}.sh"

    # Determine Docker image based on interpreter
    image_map = {
        "sh": "alpine:latest",
        "bash": "bash:latest",
        "python": "python:3.11-alpine",
        "node": "node:18-alpine"
    }
    image = image_map.get(interpreter, "alpine:latest")

    result = await run_in_container(
        node_execution_id=node_execution_id,
        image=image,
        command=[interpreter, "-c", script],
        working_dir="/workspace",
        context=context
    )

    return {
        "exit_code": result["exit_code"],
        "stdout": result["stdout"],
        "stderr": result["stderr"],
        "success": result["exit_code"] == 0
    }


@register_node_type(
    type_id="http_request",
    display_name="HTTP Request",
    category="custom",
    icon="globe",
    description="Make HTTP request to external API",
    config_schema={
        "type": "object",
        "properties": {
            "url": {"type": "string", "description": "Request URL"},
            "method": {"type": "string", "enum": ["GET", "POST", "PUT", "PATCH", "DELETE"], "default": "GET"},
            "headers": {"type": "object", "description": "HTTP headers"},
            "body": {"type": "object", "description": "Request body (for POST/PUT/PATCH)"},
            "timeout": {"type": "integer", "default": 30, "description": "Request timeout in seconds"}
        },
        "required": ["url"]
    }
)
async def execute_http_request(node_execution_id: int, config: dict, context: dict):
    """Execute HTTP request"""
    import aiohttp
    import json

    url = config["url"]
    method = config.get("method", "GET")
    headers = config.get("headers", {})
    body = config.get("body")
    timeout = config.get("timeout", 30)

    async with aiohttp.ClientSession() as session:
        async with session.request(
            method,
            url,
            headers=headers,
            json=body if body else None,
            timeout=aiohttp.ClientTimeout(total=timeout)
        ) as response:
            status_code = response.status
            response_text = await response.text()

            # Try to parse as JSON
            try:
                response_data = json.loads(response_text)
            except json.JSONDecodeError:
                response_data = response_text

    return {
        "status_code": status_code,
        "success": 200 <= status_code < 300,
        "response": response_data,
        "headers": dict(response.headers)
    }
