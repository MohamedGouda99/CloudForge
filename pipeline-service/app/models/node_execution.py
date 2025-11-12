import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text, JSON, Float
from sqlalchemy.sql import func
from app.core.database import Base


class NodeExecutionStatus(str, enum.Enum):
    """Status of a single node execution"""
    PENDING = "pending"
    RUNNING = "running"
    WAITING_APPROVAL = "waiting_approval"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"
    CANCELLED = "cancelled"


class NodeExecution(Base):
    """
    Represents the execution of a single node within a workflow run.
    Tracks node-level status, logs, container info, and results.
    """
    __tablename__ = "node_executions"

    id = Column(Integer, primary_key=True, index=True)
    workflow_run_id = Column(Integer, ForeignKey("workflow_runs.id", ondelete="CASCADE"), nullable=False, index=True)

    # Reference to the workflow node definition
    node_id = Column(String, ForeignKey("workflow_nodes.node_id", ondelete="CASCADE"), nullable=False)

    status = Column(Enum(NodeExecutionStatus), default=NodeExecutionStatus.PENDING, nullable=False)

    # Docker container ID if this node runs in a container
    container_id = Column(String, nullable=True)

    # Accumulated logs from container/task execution
    logs = Column(Text, default="")

    # Structured output data (e.g., scan results, cost estimates)
    output_data = Column(JSON, nullable=True)

    # Timestamps
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Duration in seconds
    duration_seconds = Column(Float, nullable=True)

    # Error message if failed
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
