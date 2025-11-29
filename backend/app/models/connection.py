from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class ResourceConnection(Base):
    __tablename__ = "resource_connections"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("resources.id"))
    target_id = Column(Integer, ForeignKey("resources.id"))
    connection_type = Column(String)  # e.g., "network", "depends_on", "security_group"

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    source = relationship("Resource", foreign_keys=[source_id], back_populates="connections")
    target = relationship("Resource", foreign_keys=[target_id])
