"""
Workflow Run REST API Endpoints

Provides endpoints for querying workflow runs, node executions, and approvals.
"""
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import asyncio
import json

from app.core.database import get_db
from app.models.workflow import WorkflowRun, WorkflowRunStatus
from app.models.node_execution import NodeExecution
from app.models.node_approval import NodeApproval, NodeApprovalStatus
from app.core.log_streaming import get_redis_pubsub


router = APIRouter()


# Pydantic schemas
class ApprovalAction(BaseModel):
    user_id: int
    reason: str | None = None


@router.get("/workflow-runs/{run_id}")
def get_workflow_run(run_id: int, db: Session = Depends(get_db)):
    """Get workflow run details with all node executions"""
    run = db.query(WorkflowRun).filter(WorkflowRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Workflow run not found")

    # Get all node executions
    node_executions = db.query(NodeExecution).filter(NodeExecution.workflow_run_id == run_id).all()

    return {
        "id": run.id,
        "workflow_id": run.workflow_id,
        "status": run.status,
        "triggered_by_user_id": run.triggered_by_user_id,
        "started_at": run.started_at,
        "completed_at": run.completed_at,
        "error_message": run.error_message,
        "node_executions": [
            {
                "id": node_exec.id,
                "node_id": node_exec.node_id,
                "status": node_exec.status,
                "container_id": node_exec.container_id,
                "logs": node_exec.logs,
                "output_data": node_exec.output_data,
                "started_at": node_exec.started_at,
                "completed_at": node_exec.completed_at,
                "duration_seconds": node_exec.duration_seconds,
                "error_message": node_exec.error_message
            }
            for node_exec in node_executions
        ]
    }


@router.get("/workflow-runs/{run_id}/logs/stream")
async def stream_workflow_logs(run_id: int, db: Session = Depends(get_db)):
    """
    Stream workflow logs via Server-Sent Events (SSE).
    Client can listen to real-time log updates.
    """
    # Verify run exists
    run = db.query(WorkflowRun).filter(WorkflowRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Workflow run not found")

    async def event_generator():
        """Generate SSE events from Redis pub/sub"""
        pubsub = get_redis_pubsub()
        channel = f"workflow_run:{run_id}"
        pubsub.subscribe(channel)

        try:
            # Send initial connection message
            yield f"data: {json.dumps({'type': 'connected', 'run_id': run_id})}\n\n"

            # Listen for messages
            for message in pubsub.listen():
                if message['type'] == 'message':
                    data = message['data']
                    yield f"data: {data}\n\n"

                # Check if workflow is completed
                db.refresh(run)
                if run.status in ['success', 'failed', 'cancelled']:
                    yield f"data: {json.dumps({'type': 'completed', 'status': run.status})}\n\n"
                    break

                await asyncio.sleep(0.1)

        finally:
            pubsub.unsubscribe(channel)
            pubsub.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.get("/node-executions/{node_execution_id}")
def get_node_execution(node_execution_id: int, db: Session = Depends(get_db)):
    """Get node execution details"""
    node_exec = db.query(NodeExecution).filter(NodeExecution.id == node_execution_id).first()
    if not node_exec:
        raise HTTPException(status_code=404, detail="Node execution not found")

    # Check if it has an approval
    approval = db.query(NodeApproval).filter(NodeApproval.node_execution_id == node_execution_id).first()

    return {
        "id": node_exec.id,
        "workflow_run_id": node_exec.workflow_run_id,
        "node_id": node_exec.node_id,
        "status": node_exec.status,
        "container_id": node_exec.container_id,
        "logs": node_exec.logs,
        "output_data": node_exec.output_data,
        "started_at": node_exec.started_at,
        "completed_at": node_exec.completed_at,
        "duration_seconds": node_exec.duration_seconds,
        "error_message": node_exec.error_message,
        "approval": {
            "id": approval.id,
            "status": approval.status,
            "approved_by_user_id": approval.approved_by_user_id,
            "approved_at": approval.approved_at,
            "rejection_reason": approval.rejection_reason
        } if approval else None
    }


@router.post("/node-executions/{node_execution_id}/approve")
def approve_node_execution(
    node_execution_id: int,
    action: ApprovalAction,
    db: Session = Depends(get_db)
):
    """Approve a node execution (for manual approval nodes)"""
    # Get node execution
    node_exec = db.query(NodeExecution).filter(NodeExecution.id == node_execution_id).first()
    if not node_exec:
        raise HTTPException(status_code=404, detail="Node execution not found")

    # Get approval
    approval = db.query(NodeApproval).filter(NodeApproval.node_execution_id == node_execution_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="No approval required for this node")

    if approval.status != NodeApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Approval already {approval.status}")

    # Update approval
    from datetime import datetime
    approval.status = NodeApprovalStatus.APPROVED
    approval.approved_by_user_id = action.user_id
    approval.approved_at = datetime.utcnow()

    db.commit()

    return {"message": "Node execution approved successfully"}


@router.post("/node-executions/{node_execution_id}/reject")
def reject_node_execution(
    node_execution_id: int,
    action: ApprovalAction,
    db: Session = Depends(get_db)
):
    """Reject a node execution (for manual approval nodes)"""
    # Get node execution
    node_exec = db.query(NodeExecution).filter(NodeExecution.id == node_execution_id).first()
    if not node_exec:
        raise HTTPException(status_code=404, detail="Node execution not found")

    # Get approval
    approval = db.query(NodeApproval).filter(NodeApproval.node_execution_id == node_execution_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="No approval required for this node")

    if approval.status != NodeApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Approval already {approval.status}")

    # Update approval
    from datetime import datetime
    approval.status = NodeApprovalStatus.REJECTED
    approval.approved_by_user_id = action.user_id
    approval.approved_at = datetime.utcnow()
    approval.rejection_reason = action.reason or "Rejected by user"

    db.commit()

    return {"message": "Node execution rejected successfully"}


@router.post("/workflow-runs/{run_id}/cancel")
def cancel_workflow_run(run_id: int, db: Session = Depends(get_db)):
    """Cancel a running workflow"""
    run = db.query(WorkflowRun).filter(WorkflowRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Workflow run not found")

    if run.status not in ['pending', 'running', 'waiting_approval']:
        raise HTTPException(status_code=400, detail=f"Cannot cancel workflow in status: {run.status}")

    # Update status
    from datetime import datetime
    run.status = WorkflowRunStatus.CANCELLED
    run.completed_at = datetime.utcnow()
    run.error_message = "Cancelled by user"

    # Cancel all pending/running node executions
    from app.models.node_execution import NodeExecutionStatus
    node_executions = db.query(NodeExecution).filter(
        NodeExecution.workflow_run_id == run_id,
        NodeExecution.status.in_(['pending', 'running', 'waiting_approval'])
    ).all()

    for node_exec in node_executions:
        node_exec.status = NodeExecutionStatus.CANCELLED
        node_exec.completed_at = datetime.utcnow()
        node_exec.error_message = "Workflow cancelled"

    db.commit()

    return {"message": "Workflow run cancelled successfully"}
