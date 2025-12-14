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

    # If diagram_data is being updated, sync resources with intelligent dependency detection
    if 'diagram_data' in update_data:
        diagram_data = update_data['diagram_data']
        if diagram_data and 'nodes' in diagram_data:
            # Delete existing resources
            db.query(Resource).filter(Resource.project_id == project_id).delete()

            # Build node and edge maps for dependency resolution
            nodes = diagram_data.get('nodes', [])
            edges = diagram_data.get('edges', [])

            # Create lookup maps
            node_map = {node['id']: node for node in nodes}
            edge_map = {}  # target_node_id -> [source_node_ids]
            for edge in edges:
                target = edge.get('target')
                source = edge.get('source')
                if target and source:
                    if target not in edge_map:
                        edge_map[target] = []
                    edge_map[target].append(source)

            # Create resources from nodes with dependency-aware config enhancement
            for node in nodes:
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

                    # Get base config from node
                    config = dict(node_data.get('config', {}))

                    # BRAINBOARD-STYLE: Enhance config with intelligent dependency resolution
                    node_id = node['id']
                    if node_id in edge_map:
                        source_nodes = edge_map[node_id]

                        # Auto-wire dependencies based on resource types
                        for source_node_id in source_nodes:
                            source_node = node_map.get(source_node_id)
                            if not source_node or not source_node.get('data'):
                                continue

                            source_data = source_node['data']
                            source_type = source_data.get('resourceType', '')
                            source_name = (source_data.get('displayName') or
                                         source_data.get('resourceLabel') or
                                         f"resource_{source_node_id}")

                            # Sanitize name for Terraform
                            source_tf_name = ''.join(c if c.isalnum() or c == '_' else '_' for c in source_name.lower())

                            # Auto-wire common dependency patterns (like Brainboard)
                            if resource_type == 'aws_instance':
                                if source_type == 'aws_subnet':
                                    config['subnet_id'] = f"aws_subnet.{source_tf_name}.id"
                                elif source_type == 'aws_security_group':
                                    if 'vpc_security_group_ids' not in config:
                                        config['vpc_security_group_ids'] = []
                                    config['vpc_security_group_ids'].append(f"aws_security_group.{source_tf_name}.id")
                                elif source_type == 'aws_key_pair':
                                    config['key_name'] = f"aws_key_pair.{source_tf_name}.key_name"

                            elif resource_type == 'aws_subnet':
                                if source_type == 'aws_vpc':
                                    config['vpc_id'] = f"aws_vpc.{source_tf_name}.id"

                            elif resource_type == 'aws_security_group':
                                if source_type == 'aws_vpc':
                                    config['vpc_id'] = f"aws_vpc.{source_tf_name}.id"

                            elif resource_type == 'aws_rds_instance' or resource_type == 'aws_db_instance':
                                if source_type == 'aws_subnet':
                                    if 'db_subnet_group_name' not in config:
                                        config['db_subnet_group_name'] = f"aws_db_subnet_group.default.name"
                                elif source_type == 'aws_security_group':
                                    if 'vpc_security_group_ids' not in config:
                                        config['vpc_security_group_ids'] = []
                                    config['vpc_security_group_ids'].append(f"aws_security_group.{source_tf_name}.id")

                            elif resource_type == 'aws_lambda_function':
                                if source_type == 'aws_subnet':
                                    if 'vpc_config' not in config:
                                        config['vpc_config'] = {}
                                    if 'subnet_ids' not in config['vpc_config']:
                                        config['vpc_config']['subnet_ids'] = []
                                    config['vpc_config']['subnet_ids'].append(f"aws_subnet.{source_tf_name}.id")
                                elif source_type == 'aws_security_group':
                                    if 'vpc_config' not in config:
                                        config['vpc_config'] = {}
                                    if 'security_group_ids' not in config['vpc_config']:
                                        config['vpc_config']['security_group_ids'] = []
                                    config['vpc_config']['security_group_ids'].append(f"aws_security_group.{source_tf_name}.id")

                            elif resource_type == 'aws_nat_gateway':
                                if source_type == 'aws_subnet':
                                    config['subnet_id'] = f"aws_subnet.{source_tf_name}.id"
                                elif source_type == 'aws_eip':
                                    config['allocation_id'] = f"aws_eip.{source_tf_name}.id"

                            elif resource_type == 'aws_route_table_association':
                                if source_type == 'aws_subnet':
                                    config['subnet_id'] = f"aws_subnet.{source_tf_name}.id"
                                elif source_type == 'aws_route_table':
                                    config['route_table_id'] = f"aws_route_table.{source_tf_name}.id"

                            elif resource_type == 'aws_route':
                                if source_type == 'aws_route_table':
                                    config['route_table_id'] = f"aws_route_table.{source_tf_name}.id"
                                elif source_type == 'aws_internet_gateway':
                                    config['gateway_id'] = f"aws_internet_gateway.{source_tf_name}.id"
                                elif source_type == 'aws_nat_gateway':
                                    config['nat_gateway_id'] = f"aws_nat_gateway.{source_tf_name}.id"

                            logger.info(f"Auto-wired dependency: {resource_type}.{source_tf_name} -> {resource_type}")

                    resource = Resource(
                        project_id=project_id,
                        node_id=node['id'],
                        resource_type=resource_type,
                        resource_name=resource_name,
                        config=config,
                        position_x=node['position']['x'],
                        position_y=node['position']['y']
                    )
                    db.add(resource)
                    logger.info(f"Added resource: type={resource_type}, name={resource_name}, config={config}")

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
