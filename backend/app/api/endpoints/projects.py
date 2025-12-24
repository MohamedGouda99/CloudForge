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

            # Build node_id -> sanitized_resource_name map for Terraform references
            node_id_to_tf_name = {}
            for node in nodes:
                if node.get('data'):
                    node_data = node['data']
                    resource_name = (node_data.get('displayName') or
                                   node_data.get('resourceLabel') or
                                   node_data.get('label') or
                                   f"resource_{node['id']}")
                    # Sanitize the same way Terraform generator will
                    sanitized = ''.join(c if c.isalnum() or c == '_' else '_' for c in resource_name.lower())
                    node_id_to_tf_name[node['id']] = sanitized

            # Create resources from nodes with dependency-aware config enhancement
            for node in nodes:
                # Process ANY node type that has data (not just 'default')
                if node.get('data'):
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

                    # RESOLVE STRUCTURED REFERENCES (ID-based references to terraform strings)
                    # This allows references to auto-update when resource names change
                    for key, value in list(config.items()):
                        if isinstance(value, dict) and value.get('__ref') is True:
                            # This is a structured reference with nodeId
                            ref_node_id = value.get('nodeId')
                            ref_resource_type = value.get('resourceType', '')
                            ref_output_name = value.get('outputName', 'id')

                            if ref_node_id and ref_node_id in node_id_to_tf_name:
                                # Resolve to terraform reference using current name
                                ref_tf_name = node_id_to_tf_name[ref_node_id]
                                config[key] = f"{ref_resource_type}.{ref_tf_name}.{ref_output_name}"
                                logger.info(f"Resolved structured reference: {key} = {config[key]}")
                            else:
                                # Reference not found, clear it
                                config[key] = ''
                                logger.warning(f"Could not resolve reference for {key}: nodeId={ref_node_id} not found")

                    # INTELLIGENT CONTAINMENT-BASED AUTO-WIRING
                    # When resources are nested inside containers (VPC, Subnet, etc.), auto-wire references
                    parent_id = node.get('parentId')
                    if parent_id and parent_id in node_map:
                        parent_node = node_map[parent_id]
                        if parent_node and parent_node.get('data'):
                            parent_data = parent_node['data']
                            parent_type = parent_data.get('resourceType', '')
                            parent_tf_name = node_id_to_tf_name.get(parent_id, f"resource_{parent_id}")

                            # =====================================================
                            # NETWORKING CONTAINMENT RULES
                            # =====================================================

                            # VPC containment rules - resources that need vpc_id
                            if parent_type == 'aws_vpc':
                                vpc_resources = [
                                    'aws_subnet', 'aws_security_group', 'aws_internet_gateway',
                                    'aws_route_table', 'aws_network_acl', 'aws_vpn_gateway',
                                    'aws_nat_gateway', 'aws_vpc_endpoint', 'aws_db_subnet_group',
                                    'aws_elasticache_subnet_group', 'aws_redshift_subnet_group',
                                    'aws_lb', 'aws_lb_target_group', 'aws_efs_mount_target',
                                    'aws_directory_service_directory', 'aws_customer_gateway'
                                ]
                                if resource_type in vpc_resources:
                                    if 'vpc_id' not in config or not config['vpc_id']:
                                        config['vpc_id'] = f"aws_vpc.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.vpc_id = aws_vpc.{parent_tf_name}.id")

                            # Subnet containment rules - resources that need subnet_id
                            elif parent_type == 'aws_subnet':
                                subnet_resources = [
                                    'aws_instance', 'aws_nat_gateway', 'aws_network_interface',
                                    'aws_lambda_function', 'aws_db_instance', 'aws_rds_cluster',
                                    'aws_elasticache_cluster', 'aws_redshift_cluster',
                                    'aws_efs_mount_target', 'aws_directory_service_directory',
                                    'aws_eks_node_group', 'aws_ecs_service', 'aws_batch_compute_environment',
                                    'aws_mq_broker', 'aws_elasticsearch_domain', 'aws_opensearch_domain',
                                    'aws_msk_cluster', 'aws_dms_replication_instance'
                                ]
                                if resource_type in subnet_resources:
                                    if 'subnet_id' not in config or not config['subnet_id']:
                                        config['subnet_id'] = f"aws_subnet.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.subnet_id = aws_subnet.{parent_tf_name}.id")
                                    # Also wire subnet_ids for resources that use list
                                    if resource_type in ['aws_eks_node_group', 'aws_msk_cluster', 'aws_dms_replication_instance']:
                                        if 'subnet_ids' not in config or not config['subnet_ids']:
                                            config['subnet_ids'] = [f"aws_subnet.{parent_tf_name}.id"]

                                # Get VPC from subnet's parent for resources that also need vpc_id
                                subnet_parent_id = parent_node.get('parentId')
                                if subnet_parent_id and subnet_parent_id in node_map:
                                    subnet_parent = node_map[subnet_parent_id]
                                    if subnet_parent and subnet_parent.get('data', {}).get('resourceType') == 'aws_vpc':
                                        vpc_tf_name = node_id_to_tf_name.get(subnet_parent_id)
                                        vpc_needing_resources = ['aws_security_group', 'aws_lb', 'aws_lb_target_group']
                                        if resource_type in vpc_needing_resources and ('vpc_id' not in config or not config['vpc_id']):
                                            config['vpc_id'] = f"aws_vpc.{vpc_tf_name}.id"
                                            logger.info(f"Containment auto-wire (grandparent): {resource_type}.vpc_id = aws_vpc.{vpc_tf_name}.id")

                            # Security Group containment rules
                            elif parent_type == 'aws_security_group':
                                if resource_type == 'aws_security_group_rule':
                                    if 'security_group_id' not in config or not config['security_group_id']:
                                        config['security_group_id'] = f"aws_security_group.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.security_group_id = aws_security_group.{parent_tf_name}.id")

                            # Route Table containment rules
                            elif parent_type == 'aws_route_table':
                                if resource_type == 'aws_route':
                                    if 'route_table_id' not in config or not config['route_table_id']:
                                        config['route_table_id'] = f"aws_route_table.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.route_table_id = aws_route_table.{parent_tf_name}.id")

                            # Network ACL containment rules
                            elif parent_type == 'aws_network_acl':
                                if resource_type == 'aws_network_acl_rule':
                                    if 'network_acl_id' not in config or not config['network_acl_id']:
                                        config['network_acl_id'] = f"aws_network_acl.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.network_acl_id = aws_network_acl.{parent_tf_name}.id")

                            # Load Balancer containment rules
                            elif parent_type == 'aws_lb':
                                if resource_type == 'aws_lb_listener':
                                    if 'load_balancer_arn' not in config or not config['load_balancer_arn']:
                                        config['load_balancer_arn'] = f"aws_lb.{parent_tf_name}.arn"
                                        logger.info(f"Containment auto-wire: {resource_type}.load_balancer_arn = aws_lb.{parent_tf_name}.arn")

                            # LB Listener containment rules
                            elif parent_type == 'aws_lb_listener':
                                if resource_type == 'aws_lb_listener_rule':
                                    if 'listener_arn' not in config or not config['listener_arn']:
                                        config['listener_arn'] = f"aws_lb_listener.{parent_tf_name}.arn"
                                        logger.info(f"Containment auto-wire: {resource_type}.listener_arn = aws_lb_listener.{parent_tf_name}.arn")

                            # Target Group containment rules
                            elif parent_type == 'aws_lb_target_group':
                                if resource_type == 'aws_lb_target_group_attachment':
                                    if 'target_group_arn' not in config or not config['target_group_arn']:
                                        config['target_group_arn'] = f"aws_lb_target_group.{parent_tf_name}.arn"
                                        logger.info(f"Containment auto-wire: {resource_type}.target_group_arn = aws_lb_target_group.{parent_tf_name}.arn")

                            # Transit Gateway containment rules
                            elif parent_type == 'aws_ec2_transit_gateway':
                                tgw_resources = ['aws_ec2_transit_gateway_vpc_attachment', 'aws_ec2_transit_gateway_route_table']
                                if resource_type in tgw_resources:
                                    if 'transit_gateway_id' not in config or not config['transit_gateway_id']:
                                        config['transit_gateway_id'] = f"aws_ec2_transit_gateway.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.transit_gateway_id = aws_ec2_transit_gateway.{parent_tf_name}.id")

                            # Route53 Zone containment rules
                            elif parent_type == 'aws_route53_zone':
                                if resource_type == 'aws_route53_record':
                                    if 'zone_id' not in config or not config['zone_id']:
                                        config['zone_id'] = f"aws_route53_zone.{parent_tf_name}.zone_id"
                                        logger.info(f"Containment auto-wire: {resource_type}.zone_id = aws_route53_zone.{parent_tf_name}.zone_id")

                            # API Gateway REST API containment rules
                            elif parent_type == 'aws_api_gateway_rest_api':
                                api_resources = ['aws_api_gateway_resource', 'aws_api_gateway_method',
                                                'aws_api_gateway_integration', 'aws_api_gateway_deployment',
                                                'aws_api_gateway_stage', 'aws_api_gateway_authorizer']
                                if resource_type in api_resources:
                                    if 'rest_api_id' not in config or not config['rest_api_id']:
                                        config['rest_api_id'] = f"aws_api_gateway_rest_api.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.rest_api_id = aws_api_gateway_rest_api.{parent_tf_name}.id")

                            # API Gateway V2 (HTTP API) containment rules
                            elif parent_type == 'aws_apigatewayv2_api':
                                apiv2_resources = ['aws_apigatewayv2_route', 'aws_apigatewayv2_integration',
                                                  'aws_apigatewayv2_stage', 'aws_apigatewayv2_authorizer',
                                                  'aws_apigatewayv2_deployment']
                                if resource_type in apiv2_resources:
                                    if 'api_id' not in config or not config['api_id']:
                                        config['api_id'] = f"aws_apigatewayv2_api.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.api_id = aws_apigatewayv2_api.{parent_tf_name}.id")

                            # =====================================================
                            # COMPUTE CONTAINMENT RULES
                            # =====================================================

                            # ECS Cluster containment rules
                            elif parent_type == 'aws_ecs_cluster':
                                ecs_resources = ['aws_ecs_service', 'aws_ecs_capacity_provider']
                                if resource_type in ecs_resources:
                                    if 'cluster' not in config or not config['cluster']:
                                        config['cluster'] = f"aws_ecs_cluster.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.cluster = aws_ecs_cluster.{parent_tf_name}.id")

                            # EKS Cluster containment rules
                            elif parent_type == 'aws_eks_cluster':
                                eks_resources = ['aws_eks_node_group', 'aws_eks_fargate_profile', 'aws_eks_addon']
                                if resource_type in eks_resources:
                                    if 'cluster_name' not in config or not config['cluster_name']:
                                        config['cluster_name'] = f"aws_eks_cluster.{parent_tf_name}.name"
                                        logger.info(f"Containment auto-wire: {resource_type}.cluster_name = aws_eks_cluster.{parent_tf_name}.name")

                            # Auto Scaling Group containment rules
                            elif parent_type == 'aws_autoscaling_group':
                                asg_resources = ['aws_autoscaling_policy', 'aws_autoscaling_schedule',
                                                'aws_autoscaling_lifecycle_hook', 'aws_autoscaling_notification']
                                if resource_type in asg_resources:
                                    if 'autoscaling_group_name' not in config or not config['autoscaling_group_name']:
                                        config['autoscaling_group_name'] = f"aws_autoscaling_group.{parent_tf_name}.name"
                                        logger.info(f"Containment auto-wire: {resource_type}.autoscaling_group_name = aws_autoscaling_group.{parent_tf_name}.name")

                            # Launch Template containment rules
                            elif parent_type == 'aws_launch_template':
                                if resource_type == 'aws_autoscaling_group':
                                    if 'launch_template' not in config:
                                        config['launch_template'] = {'id': f"aws_launch_template.{parent_tf_name}.id"}
                                        logger.info(f"Containment auto-wire: {resource_type}.launch_template.id = aws_launch_template.{parent_tf_name}.id")

                            # CodePipeline containment rules
                            elif parent_type == 'aws_codepipeline':
                                if resource_type == 'aws_codepipeline_webhook':
                                    if 'target_pipeline' not in config or not config['target_pipeline']:
                                        config['target_pipeline'] = f"aws_codepipeline.{parent_tf_name}.name"
                                        logger.info(f"Containment auto-wire: {resource_type}.target_pipeline = aws_codepipeline.{parent_tf_name}.name")

                            # CodeBuild Project containment rules
                            elif parent_type == 'aws_codebuild_project':
                                if resource_type == 'aws_codebuild_webhook':
                                    if 'project_name' not in config or not config['project_name']:
                                        config['project_name'] = f"aws_codebuild_project.{parent_tf_name}.name"
                                        logger.info(f"Containment auto-wire: {resource_type}.project_name = aws_codebuild_project.{parent_tf_name}.name")

                            # =====================================================
                            # DATABASE CONTAINMENT RULES
                            # =====================================================

                            # RDS Cluster containment rules
                            elif parent_type == 'aws_rds_cluster':
                                if resource_type == 'aws_rds_cluster_instance':
                                    if 'cluster_identifier' not in config or not config['cluster_identifier']:
                                        config['cluster_identifier'] = f"aws_rds_cluster.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.cluster_identifier = aws_rds_cluster.{parent_tf_name}.id")

                            # DynamoDB Table containment rules
                            elif parent_type == 'aws_dynamodb_table':
                                dynamodb_resources = ['aws_dynamodb_table_item', 'aws_dynamodb_global_table']
                                if resource_type in dynamodb_resources:
                                    if 'table_name' not in config or not config['table_name']:
                                        config['table_name'] = f"aws_dynamodb_table.{parent_tf_name}.name"
                                        logger.info(f"Containment auto-wire: {resource_type}.table_name = aws_dynamodb_table.{parent_tf_name}.name")

                            # =====================================================
                            # STORAGE CONTAINMENT RULES
                            # =====================================================

                            # S3 Bucket containment rules
                            elif parent_type == 'aws_s3_bucket':
                                s3_resources = ['aws_s3_bucket_policy', 'aws_s3_bucket_versioning',
                                               'aws_s3_bucket_acl', 'aws_s3_bucket_cors_configuration',
                                               'aws_s3_bucket_lifecycle_configuration', 'aws_s3_bucket_notification',
                                               'aws_s3_bucket_public_access_block', 'aws_s3_bucket_server_side_encryption_configuration',
                                               'aws_s3_object']
                                if resource_type in s3_resources:
                                    if 'bucket' not in config or not config['bucket']:
                                        config['bucket'] = f"aws_s3_bucket.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.bucket = aws_s3_bucket.{parent_tf_name}.id")

                            # EFS File System containment rules
                            elif parent_type == 'aws_efs_file_system':
                                efs_resources = ['aws_efs_mount_target', 'aws_efs_access_point', 'aws_efs_file_system_policy']
                                if resource_type in efs_resources:
                                    if 'file_system_id' not in config or not config['file_system_id']:
                                        config['file_system_id'] = f"aws_efs_file_system.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.file_system_id = aws_efs_file_system.{parent_tf_name}.id")

                            # =====================================================
                            # SERVERLESS CONTAINMENT RULES
                            # =====================================================

                            # Lambda Function containment rules
                            elif parent_type == 'aws_lambda_function':
                                lambda_resources = ['aws_lambda_permission', 'aws_lambda_alias',
                                                   'aws_lambda_provisioned_concurrency_config', 'aws_lambda_event_source_mapping']
                                if resource_type in lambda_resources:
                                    if 'function_name' not in config or not config['function_name']:
                                        config['function_name'] = f"aws_lambda_function.{parent_tf_name}.function_name"
                                        logger.info(f"Containment auto-wire: {resource_type}.function_name = aws_lambda_function.{parent_tf_name}.function_name")

                            # Step Functions State Machine containment rules
                            elif parent_type == 'aws_sfn_state_machine':
                                if resource_type == 'aws_sfn_activity':
                                    pass  # Activities are standalone, but could be logically grouped

                            # =====================================================
                            # MESSAGING CONTAINMENT RULES
                            # =====================================================

                            # SNS Topic containment rules
                            elif parent_type == 'aws_sns_topic':
                                sns_resources = ['aws_sns_topic_subscription', 'aws_sns_topic_policy']
                                if resource_type in sns_resources:
                                    if 'topic_arn' not in config or not config['topic_arn']:
                                        config['topic_arn'] = f"aws_sns_topic.{parent_tf_name}.arn"
                                        logger.info(f"Containment auto-wire: {resource_type}.topic_arn = aws_sns_topic.{parent_tf_name}.arn")

                            # SQS Queue containment rules
                            elif parent_type == 'aws_sqs_queue':
                                sqs_resources = ['aws_sqs_queue_policy']
                                if resource_type in sqs_resources:
                                    if 'queue_url' not in config or not config['queue_url']:
                                        config['queue_url'] = f"aws_sqs_queue.{parent_tf_name}.id"
                                        logger.info(f"Containment auto-wire: {resource_type}.queue_url = aws_sqs_queue.{parent_tf_name}.id")

                            # EventBridge Rule containment rules
                            elif parent_type == 'aws_cloudwatch_event_rule':
                                if resource_type == 'aws_cloudwatch_event_target':
                                    if 'rule' not in config or not config['rule']:
                                        config['rule'] = f"aws_cloudwatch_event_rule.{parent_tf_name}.name"
                                        logger.info(f"Containment auto-wire: {resource_type}.rule = aws_cloudwatch_event_rule.{parent_tf_name}.name")

                            # =====================================================
                            # IAM CONTAINMENT RULES
                            # =====================================================

                            # IAM Role containment rules
                            elif parent_type == 'aws_iam_role':
                                iam_role_resources = ['aws_iam_role_policy', 'aws_iam_role_policy_attachment',
                                                     'aws_iam_instance_profile']
                                if resource_type in iam_role_resources:
                                    if resource_type == 'aws_iam_instance_profile':
                                        if 'role' not in config or not config['role']:
                                            config['role'] = f"aws_iam_role.{parent_tf_name}.name"
                                            logger.info(f"Containment auto-wire: {resource_type}.role = aws_iam_role.{parent_tf_name}.name")
                                    else:
                                        if 'role' not in config or not config['role']:
                                            config['role'] = f"aws_iam_role.{parent_tf_name}.name"
                                            logger.info(f"Containment auto-wire: {resource_type}.role = aws_iam_role.{parent_tf_name}.name")

                            # IAM User containment rules
                            elif parent_type == 'aws_iam_user':
                                iam_user_resources = ['aws_iam_user_policy', 'aws_iam_user_policy_attachment',
                                                     'aws_iam_access_key', 'aws_iam_user_group_membership']
                                if resource_type in iam_user_resources:
                                    if 'user' not in config or not config['user']:
                                        config['user'] = f"aws_iam_user.{parent_tf_name}.name"
                                        logger.info(f"Containment auto-wire: {resource_type}.user = aws_iam_user.{parent_tf_name}.name")

                            # IAM Group containment rules
                            elif parent_type == 'aws_iam_group':
                                iam_group_resources = ['aws_iam_group_policy', 'aws_iam_group_policy_attachment',
                                                      'aws_iam_group_membership']
                                if resource_type in iam_group_resources:
                                    if 'group' not in config or not config['group']:
                                        config['group'] = f"aws_iam_group.{parent_tf_name}.name"
                                        logger.info(f"Containment auto-wire: {resource_type}.group = aws_iam_group.{parent_tf_name}.name")

                            # =====================================================
                            # MONITORING CONTAINMENT RULES
                            # =====================================================

                            # CloudWatch Log Group containment rules
                            elif parent_type == 'aws_cloudwatch_log_group':
                                cw_log_resources = ['aws_cloudwatch_log_stream', 'aws_cloudwatch_log_metric_filter',
                                                   'aws_cloudwatch_log_subscription_filter']
                                if resource_type in cw_log_resources:
                                    if 'log_group_name' not in config or not config['log_group_name']:
                                        config['log_group_name'] = f"aws_cloudwatch_log_group.{parent_tf_name}.name"
                                        logger.info(f"Containment auto-wire: {resource_type}.log_group_name = aws_cloudwatch_log_group.{parent_tf_name}.name")

                    # EDGE-BASED AUTO-WIRING (Brainboard-style)
                    # When resources are connected via edges, auto-wire references
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

                            # Use pre-computed sanitized name for consistent Terraform references
                            source_tf_name = node_id_to_tf_name.get(source_node_id, f"resource_{source_node_id}")

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
