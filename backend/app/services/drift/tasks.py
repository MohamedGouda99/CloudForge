from app.core.celery import celery_app


@celery_app.task(name="drift.placeholder")
def drift_placeholder():
    """
    Temporary task to keep the Celery worker alive.

    Replace this with real drift-detection work when available.
    """
    return {"status": "ok", "detail": "drift task stub"}
