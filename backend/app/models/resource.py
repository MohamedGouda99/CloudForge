from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))

    # Resource identification
    resource_type = Column(String, nullable=False)  # e.g., aws_instance, azure_vm, gcp_compute_instance
    resource_name = Column(String, nullable=False)  # User-defined name
    node_id = Column(String, unique=True, nullable=False)  # Unique ID in the visual diagram

    # Position in visual designer
    position_x = Column(Integer)
    position_y = Column(Integer)

    # Resource configuration (stored as JSON)
    config = Column(JSON, default=dict)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="resources")
    connections = relationship("ResourceConnection",
                              foreign_keys="ResourceConnection.source_id",
                              back_populates="source")
