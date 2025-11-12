import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base


class NodeApprovalStatus(str, enum.Enum):
    """Approval status for manual approval nodes"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class NodeApproval(Base):
    """
    Tracks approval state for manual approval nodes.
    Links to a node_execution that requires human approval.
    """
    __tablename__ = "node_approvals"

    id = Column(Integer, primary_key=True, index=True)
    node_execution_id = Column(Integer, ForeignKey("node_executions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    status = Column(Enum(NodeApprovalStatus), default=NodeApprovalStatus.PENDING, nullable=False)

    # User who approved/rejected
    approved_by_user_id = Column(Integer, nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    # Optional rejection reason
    rejection_reason = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
