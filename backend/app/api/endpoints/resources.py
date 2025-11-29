from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.endpoints.auth import get_current_user
from app.models import User, Resource, Project, ResourceConnection
from app.schemas import (
    Resource as ResourceSchema,
    ResourceCreate,
    ResourceUpdate,
    Connection as ConnectionSchema,
    ConnectionCreate
)

router = APIRouter()


@router.post("/", response_model=ResourceSchema, status_code=status.HTTP_201_CREATED)
def create_resource(
    resource_data: ResourceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new resource in a project"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == resource_data.project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Check if node_id is unique
    existing = db.query(Resource).filter(Resource.node_id == resource_data.node_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resource with this node_id already exists"
        )

    db_resource = Resource(**resource_data.dict())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)

    return db_resource


@router.get("/project/{project_id}", response_model=List[ResourceSchema])
def list_project_resources(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all resources in a project"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    resources = db.query(Resource).filter(Resource.project_id == project_id).all()
    return resources


@router.put("/{resource_id}", response_model=ResourceSchema)
def update_resource(
    resource_id: int,
    resource_update: ResourceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a resource"""
    resource = db.query(Resource).join(Project).filter(
        Resource.id == resource_id,
        Project.owner_id == current_user.id
    ).first()

    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )

    # Update fields
    update_data = resource_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resource, field, value)

    db.commit()
    db.refresh(resource)

    return resource


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a resource"""
    resource = db.query(Resource).join(Project).filter(
        Resource.id == resource_id,
        Project.owner_id == current_user.id
    ).first()

    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )

    db.delete(resource)
    db.commit()

    return None


@router.post("/connections", response_model=ConnectionSchema, status_code=status.HTTP_201_CREATED)
def create_connection(
    connection_data: ConnectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a connection between two resources"""
    # Verify both resources exist and belong to user's projects
    source = db.query(Resource).join(Project).filter(
        Resource.id == connection_data.source_id,
        Project.owner_id == current_user.id
    ).first()

    target = db.query(Resource).join(Project).filter(
        Resource.id == connection_data.target_id,
        Project.owner_id == current_user.id
    ).first()

    if not source or not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both resources not found"
        )

    db_connection = ResourceConnection(**connection_data.dict())
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)

    return db_connection


@router.get("/connections/project/{project_id}", response_model=List[ConnectionSchema])
def list_project_connections(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all connections in a project"""
    # Verify project ownership
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    connections = db.query(ResourceConnection).join(
        Resource, ResourceConnection.source_id == Resource.id
    ).filter(Resource.project_id == project_id).all()

    return connections
