from redis import Redis
from app.core.config import settings
from typing import Optional
import json

# Redis client for pub/sub
redis_client = Redis.from_url(settings.redis_url, decode_responses=True)


def broadcast_log(channel: str, message: str, level: str = "info"):
    """Broadcast log message to Redis channel for SSE streaming"""
    try:
        log_entry = {
            "message": message,
            "level": level,
            "timestamp": None,  # Could add timestamp if needed
        }
        redis_client.publish(channel, json.dumps(log_entry))
    except Exception as e:
        print(f"Failed to broadcast log: {e}")


def stream_log(run_id: int, stage_run_id: Optional[int], message: str):
    """Stream log to pipeline run channel"""
    channel = f"pipeline:{run_id}"

    # Format message with stage info
    if stage_run_id:
        formatted_msg = f"[Stage {stage_run_id}] {message}"
    else:
        formatted_msg = message

    broadcast_log(channel, formatted_msg)
