from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class StageRunStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


class StageRun(Base):
    __tablename__ = "stage_runs"

    id = Column(Integer, primary_key=True, index=True)
    pipeline_run_id = Column(Integer, ForeignKey("pipeline_runs.id"), nullable=False)
    stage_name = Column(String, nullable=False)  # validate, tfsec, terrascan, infracost, approval, apply
    status = Column(Enum(StageRunStatus), default=StageRunStatus.PENDING)

    # Logs and output
    logs = Column(Text, default="")
    output_data = Column(JSON)  # Store Infracost JSON, tfsec results, etc.

    # Timing
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    duration_seconds = Column(Integer)

    # Relationships
    run = relationship("PipelineRun", back_populates="stage_runs")
    approval = relationship("Approval", back_populates="stage_run", uselist=False)
