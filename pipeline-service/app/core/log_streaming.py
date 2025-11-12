"""
Log Streaming Utilities

Provides real-time log streaming from workflow executions to frontend via Redis pub/sub and SSE.
"""
import redis
import os
import json
from typing import Optional


# Redis client for pub/sub
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(redis_url, decode_responses=True)


def stream_node_log(run_id: int, node_execution_id: int, log_message: str):
    """
    Stream a log message for a node execution.

    Args:
        run_id: Workflow run ID
        node_execution_id: Node execution ID
        log_message: Log message to stream
    """
    channel = f"workflow_run:{run_id}"
    payload = {
        "type": "node_log",
        "node_execution_id": node_execution_id,
        "message": log_message,
        "timestamp": None  # Could add timestamp if needed
    }

    redis_client.publish(channel, json.dumps(payload))


def stream_workflow_status(run_id: int, status: str, message: Optional[str] = None):
    """
    Stream a workflow status update.

    Args:
        run_id: Workflow run ID
        status: Status string (pending, running, success, failed, etc.)
        message: Optional status message
    """
    channel = f"workflow_run:{run_id}"
    payload = {
        "type": "status_update",
        "status": status,
        "message": message
    }

    redis_client.publish(channel, json.dumps(payload))


def stream_node_status(run_id: int, node_execution_id: int, status: str):
    """
    Stream a node execution status update.

    Args:
        run_id: Workflow run ID
        node_execution_id: Node execution ID
        status: Status string (pending, running, success, failed, etc.)
    """
    channel = f"workflow_run:{run_id}"
    payload = {
        "type": "node_status",
        "node_execution_id": node_execution_id,
        "status": status
    }

    redis_client.publish(channel, json.dumps(payload))


def get_redis_pubsub():
    """Get a Redis pub/sub instance for subscribing to channels"""
    return redis_client.pubsub()
