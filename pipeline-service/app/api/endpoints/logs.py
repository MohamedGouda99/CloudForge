from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from redis import Redis
from app.core.config import settings
import json
import asyncio

router = APIRouter()


async def event_stream(channel: str):
    """SSE event stream for pipeline logs"""
    redis_client = Redis.from_url(settings.redis_url, decode_responses=True)
    pubsub = redis_client.pubsub()
    pubsub.subscribe(channel)

    try:
        # Send initial connection message
        yield f"data: {json.dumps({'message': 'Connected to log stream', 'level': 'info'})}\n\n"

        # Listen for messages
        for message in pubsub.listen():
            if message["type"] == "message":
                data = message["data"]
                yield f"data: {data}\n\n"

            # Allow other tasks to run
            await asyncio.sleep(0.1)

    finally:
        pubsub.unsubscribe(channel)
        pubsub.close()
        redis_client.close()


@router.get("/runs/{run_id}/logs/stream")
async def stream_run_logs(run_id: int):
    """Stream pipeline run logs via SSE"""
    channel = f"pipeline:{run_id}"
    return StreamingResponse(
        event_stream(channel),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
