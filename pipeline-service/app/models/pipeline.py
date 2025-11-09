from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False, index=True)
    name = Column(String, default="Default Pipeline")
    enabled = Column(Boolean, default=True)

    # Configuration for pipeline stages
    stages_config = Column(
        JSON,
        default={
            "validate": {"enabled": True, "order": 1},
            "tfsec": {"enabled": True, "order": 2, "parallel_group": "analysis"},
            "terrascan": {"enabled": True, "order": 2, "parallel_group": "analysis"},
            "infracost": {"enabled": True, "order": 2, "parallel_group": "analysis"},
            "approval": {"enabled": True, "order": 3, "require_manual": True},
            "apply": {"enabled": True, "order": 4},
        },
    )

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    runs = relationship("PipelineRun", back_populates="pipeline", cascade="all, delete-orphan")
