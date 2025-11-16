from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "pipeline_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "app.tasks.orchestrator",
        "app.tasks.terraform",
        "app.tasks.security",
        "app.tasks.analysis",
        "app.tasks.workflow",
        "app.tasks.workflow_orchestrator",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)
