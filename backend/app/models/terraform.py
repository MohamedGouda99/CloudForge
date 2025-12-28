from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class TerraformOutput(Base):
    __tablename__ = "terraform_outputs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))

    # Generated Terraform code
    main_tf = Column(Text)
    variables_tf = Column(Text)
    outputs_tf = Column(Text)
    providers_tf = Column(Text)

    # Version tracking
    version = Column(Integer, default=1)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="terraform_outputs")


class DriftScanStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class DriftScan(Base):
    __tablename__ = "drift_scans"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))

    status = Column(Enum(DriftScanStatus), default=DriftScanStatus.PENDING)
    result = Column(Text)  # JSON string with drift details
    error_message = Column(Text)

    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    # Relationships
    project = relationship("Project", back_populates="drift_scans")


class CostEstimate(Base):
    """Store Infracost estimates per project for dashboard aggregation"""
    __tablename__ = "cost_estimates"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True)

    # Cost data
    monthly_cost = Column(String, default="0")  # Store as string to preserve precision
    currency = Column(String, default="USD")
    resources_count = Column(Integer, default=0)  # Number of cost-bearing resources

    # Full Infracost JSON output for detailed views
    cost_breakdown = Column(Text)  # JSON string with full breakdown

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="cost_estimates")
