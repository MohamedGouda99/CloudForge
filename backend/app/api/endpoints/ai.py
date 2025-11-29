from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.celery import celery_app


router = APIRouter()


class BuildRequest(BaseModel):
    guide_text: str
    cloud_provider: str | None = None


@router.post("/api/ai/frameworks/build")
def build_framework(req: BuildRequest):
    try:
        task = celery_app.send_task(
            "ai.build_framework_from_guide",
            args=[req.guide_text, req.cloud_provider],
        )
        return {"task_id": task.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/ai/tasks/{task_id}")
def get_task(task_id: str):
    async_result = celery_app.AsyncResult(task_id)
    state = async_result.state
    info = None
    if async_result.ready():
        try:
            info = async_result.get(propagate=False)
        except Exception as e:
            info = {"error": str(e)}
    return {"state": state, "result": info}
