"""
Notification workflow node types.
Provides nodes for sending notifications via various channels.
"""
from app.core.node_registry import register_node_type


@register_node_type(
    type_id="slack_notification",
    display_name="Slack Notification",
    category="notification",
    icon="message-square",
    description="Send a message to Slack channel",
    config_schema={
        "type": "object",
        "properties": {
            "webhook_url": {"type": "string", "description": "Slack webhook URL"},
            "channel": {"type": "string", "description": "Channel name (e.g., #deploys)"},
            "message": {"type": "string", "description": "Message template"},
            "include_workflow_status": {"type": "boolean", "default": True}
        },
        "required": ["webhook_url", "message"]
    }
)
async def execute_slack_notification(node_execution_id: int, config: dict, context: dict):
    """Send Slack notification"""
    import aiohttp
    import json

    webhook_url = config["webhook_url"]
    channel = config.get("channel")
    message = config["message"]
    include_status = config.get("include_workflow_status", True)

    # Build message payload
    payload = {"text": message}
    if channel:
        payload["channel"] = channel

    # Add workflow context if requested
    if include_status and context:
        workflow_name = context.get("workflow_name", "Unknown")
        run_id = context.get("run_id", "N/A")
        payload["text"] += f"\n\n*Workflow:* {workflow_name}\n*Run ID:* {run_id}"

    # Send HTTP POST to webhook
    async with aiohttp.ClientSession() as session:
        async with session.post(webhook_url, json=payload) as response:
            success = response.status == 200
            response_text = await response.text()

    return {
        "sent": success,
        "channel": channel,
        "response": response_text
    }


@register_node_type(
    type_id="email_notification",
    display_name="Email Notification",
    category="notification",
    icon="mail",
    description="Send an email notification",
    config_schema={
        "type": "object",
        "properties": {
            "to": {"type": "string", "description": "Recipient email address"},
            "subject": {"type": "string", "description": "Email subject"},
            "body": {"type": "string", "description": "Email body (supports HTML)"},
            "smtp_host": {"type": "string", "default": "smtp.gmail.com"},
            "smtp_port": {"type": "integer", "default": 587}
        },
        "required": ["to", "subject", "body"]
    }
)
async def execute_email_notification(node_execution_id: int, config: dict, context: dict):
    """Send email notification"""
    import aiosmtplib
    from email.message import EmailMessage
    import os

    to_addr = config["to"]
    subject = config["subject"]
    body = config["body"]
    smtp_host = config.get("smtp_host", "smtp.gmail.com")
    smtp_port = config.get("smtp_port", 587)

    # Get SMTP credentials from environment
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")

    # Create message
    msg = EmailMessage()
    msg["From"] = smtp_user
    msg["To"] = to_addr
    msg["Subject"] = subject
    msg.set_content(body, subtype="html")

    # Send email
    try:
        await aiosmtplib.send(
            msg,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            use_tls=True
        )
        success = True
        error = None
    except Exception as e:
        success = False
        error = str(e)

    return {
        "sent": success,
        "to": to_addr,
        "error": error
    }


@register_node_type(
    type_id="webhook_notification",
    display_name="Webhook Notification",
    category="notification",
    icon="send",
    description="Send HTTP webhook with workflow data",
    config_schema={
        "type": "object",
        "properties": {
            "url": {"type": "string", "description": "Webhook URL"},
            "method": {"type": "string", "enum": ["POST", "PUT", "PATCH"], "default": "POST"},
            "headers": {"type": "object", "description": "HTTP headers (JSON object)"},
            "payload": {"type": "object", "description": "Request payload (JSON object)"}
        },
        "required": ["url"]
    }
)
async def execute_webhook_notification(node_execution_id: int, config: dict, context: dict):
    """Send webhook notification"""
    import aiohttp
    import json

    url = config["url"]
    method = config.get("method", "POST")
    headers = config.get("headers", {})
    payload = config.get("payload", {})

    # Add context data to payload
    if context:
        payload["workflow_context"] = context

    # Send HTTP request
    async with aiohttp.ClientSession() as session:
        async with session.request(method, url, json=payload, headers=headers) as response:
            success = 200 <= response.status < 300
            response_text = await response.text()

    return {
        "sent": success,
        "status_code": response.status,
        "response": response_text
    }
