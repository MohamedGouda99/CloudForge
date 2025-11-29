from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.endpoints.auth import get_current_user
from app.models import User, Project, Resource
from app.schemas import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate
)

router = APIRouter()


@router.post("/", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new infrastructure project"""
    db_project = Project(
        name=project_data.name,
        description=project_data.description,
        cloud_provider=project_data.cloud_provider,
        owner_id=current_user.id
    )

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return db_project


@router.get("/", response_model=List[ProjectSchema])
def list_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all projects for the current user"""
    projects = db.query(Project).filter(
        Project.owner_id == current_user.id
    ).offset(skip).limit(limit).all()

    return projects


@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific project"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return project


@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a project"""
    import logging
    logger = logging.getLogger(__name__)

    try:
        logger.info(f"Received update for project {project_id}")
        logger.info(f"Update data: {project_update.dict(exclude_unset=True)}")
    except Exception as e:
        logger.error(f"Error logging update data: {e}")

    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Update fields
    update_data = project_update.dict(exclude_unset=True)

    # If diagram_data is being updated, sync resources
    if 'diagram_data' in update_data:
        diagram_data = update_data['diagram_data']
        if diagram_data and 'nodes' in diagram_data:
            # Delete existing resources
            db.query(Resource).filter(Resource.project_id == project_id).delete()

            # Create resources from nodes
            for node in diagram_data['nodes']:
                if node.get('type') == 'default' and node.get('data'):
                    node_data = node['data']

                    # Extract resource type - try 'resourceType' first (camelCase from frontend), then 'type'
                    resource_type = node_data.get('resourceType') or node_data.get('type', '')

                    # Skip if no valid resource type
                    if not resource_type or resource_type == '':
                        logger.warning(f"Skipping node {node['id']} - missing resource type. Node data: {node_data}")
                        continue

                    # Get resource name - try 'displayName', 'resourceLabel', or 'label'
                    resource_name = (node_data.get('displayName') or
                                   node_data.get('resourceLabel') or
                                   node_data.get('label') or
                                   f"resource_{node['id']}")

                    resource = Resource(
                        project_id=project_id,
                        node_id=node['id'],
                        resource_type=resource_type,
                        resource_name=resource_name,
                        config=node_data.get('config', {}),
                        position_x=node['position']['x'],
                        position_y=node['position']['y']
                    )
                    db.add(resource)
                    logger.info(f"Added resource: type={resource_type}, name={resource_name}")

    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a project and all its resources"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    db.delete(project)
    db.commit()

    return None
