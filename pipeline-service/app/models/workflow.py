from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Text,
    ForeignKey,
    JSON,
    Enum,
    Boolean,
    Float,
)
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    nodes = relationship("WorkflowNode", back_populates="workflow", cascade="all, delete-orphan")
    edges = relationship("WorkflowEdge", back_populates="workflow", cascade="all, delete-orphan")
    runs = relationship("WorkflowRun", back_populates="workflow", cascade="all, delete-orphan")


class NodeType(str, enum.Enum):
    TERRAFORM_VALIDATE = "terraform_validate"
    TERRAFORM_PLAN = "terraform_plan"
    TERRAFORM_APPLY = "terraform_apply"
    TERRAFORM_DESTROY = "terraform_destroy"
    INFRACOST_ESTIMATE = "infracost_estimate"
    TFSEC_SCAN = "tfsec_scan"
    TERRASCAN_SCAN = "terrascan_scan"
    CHECKOV_SCAN = "checkov_scan"
    SLACK_NOTIFICATION = "slack_notification"
    EMAIL_NOTIFICATION = "email_notification"
    WEBHOOK_NOTIFICATION = "webhook_notification"
    MANUAL_APPROVAL = "manual_approval"
    CONDITIONAL = "conditional"
    CUSTOM_SCRIPT = "custom_script"
    HTTP_REQUEST = "http_request"


class WorkflowNode(Base):
    """
    Workflow designer node persisted with absolute coordinates and configuration.
    """

    __tablename__ = "workflow_nodes"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)

    # React Flow identifier (stored globally unique for simplicity)
    node_id = Column(String, nullable=False, unique=True, index=True)

    node_type = Column(Enum(NodeType), nullable=False)
    label = Column(String, nullable=False)
    position_x = Column(Float, nullable=False, default=0)
    position_y = Column(Float, nullable=False, default=0)
    config = Column(JSON, default={})

    workflow = relationship("Workflow", back_populates="nodes")
    downstream_edges = relationship(
        "WorkflowEdge",
        foreign_keys="WorkflowEdge.source_node_id",
        cascade="all, delete-orphan",
        primaryjoin="WorkflowNode.node_id == WorkflowEdge.source_node_id",
    )
    upstream_edges = relationship(
        "WorkflowEdge",
        foreign_keys="WorkflowEdge.target_node_id",
        cascade="all, delete-orphan",
        primaryjoin="WorkflowNode.node_id == WorkflowEdge.target_node_id",
    )


class WorkflowEdge(Base):
    """
    Connection between two workflow nodes using their string node IDs.
    """

    __tablename__ = "workflow_edges"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False, index=True)

    edge_id = Column(String, nullable=False, unique=True, index=True)
    source_node_id = Column(String, ForeignKey("workflow_nodes.node_id", ondelete="CASCADE"), nullable=False)
    target_node_id = Column(String, ForeignKey("workflow_nodes.node_id", ondelete="CASCADE"), nullable=False)
    label = Column(String, nullable=True)

    workflow = relationship("Workflow", back_populates="edges")


class WorkflowRunStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"


class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id = Column(Integer, primary_key=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    triggered_by_user_id = Column(Integer, nullable=True)
    status = Column(Enum(WorkflowRunStatus), default=WorkflowRunStatus.PENDING)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    error_message = Column(Text, nullable=True)

    workflow = relationship("Workflow", back_populates="runs")
    node_runs = relationship("WorkflowNodeRun", back_populates="workflow_run", cascade="all, delete-orphan")


class WorkflowNodeRunStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


class WorkflowNodeRun(Base):
    __tablename__ = "workflow_node_runs"

    id = Column(Integer, primary_key=True)
    workflow_run_id = Column(Integer, ForeignKey("workflow_runs.id", ondelete="CASCADE"), nullable=False)
    workflow_node_id = Column(Integer, ForeignKey("workflow_nodes.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(WorkflowNodeRunStatus), default=WorkflowNodeRunStatus.PENDING)
    logs = Column(Text, default="")
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    duration_seconds = Column(Integer)

    workflow_run = relationship("WorkflowRun", back_populates="node_runs")
