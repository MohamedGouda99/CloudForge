from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class ApprovalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    stage_run_id = Column(Integer, ForeignKey("stage_runs.id"), nullable=False)
    status = Column(Enum(ApprovalStatus), default=ApprovalStatus.PENDING)

    approved_by_user_id = Column(Integer)
    approved_at = Column(DateTime)
    rejection_reason = Column(Text)

    # Relationships
    stage_run = relationship("StageRun", back_populates="approval")
