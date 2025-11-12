import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base


class WorkflowRunStatus(str, enum.Enum):
    """Status of a workflow run execution"""
    PENDING = "pending"
    RUNNING = "running"
    WAITING_APPROVAL = "waiting_approval"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class WorkflowRun(Base):
    """
    Represents a single execution of a workflow DAG.
    Tracks overall run status and metadata.
    """
    __tablename__ = "workflow_runs"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)

    status = Column(Enum(WorkflowRunStatus), default=WorkflowRunStatus.PENDING, nullable=False)

    # User who triggered this run
    triggered_by_user_id = Column(Integer, nullable=True)

    # Timestamps
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Error message if failed
    error_message = Column(Text, nullable=True)
