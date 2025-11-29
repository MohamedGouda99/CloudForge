from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class CloudProvider(str, enum.Enum):
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    cloud_provider = Column(Enum(CloudProvider), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Visual designer data (stored as JSON)
    diagram_data = Column(JSON, default=dict)

    # Git integration
    git_repo_url = Column(String)
    git_branch = Column(String, default="main")

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="projects")
    resources = relationship("Resource", back_populates="project", cascade="all, delete-orphan")
    terraform_outputs = relationship("TerraformOutput", back_populates="project", cascade="all, delete-orphan")
    drift_scans = relationship("DriftScan", back_populates="project", cascade="all, delete-orphan")
