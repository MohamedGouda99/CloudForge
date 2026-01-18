import { useState, useMemo, useCallback } from 'react';
import { Node } from 'reactflow';
import {
  ChevronRight,
  ChevronDown,
  FileCode,
  AlertCircle,
  Plus,
  Layers,
} from 'lucide-react';
import CloudIcon from '../CloudIcon';
import { getCloudIconPath } from '../../lib/resources/cloudIconsComplete';
import { ResourceGroup } from './types';

// Resource descriptions for professional display
const RESOURCE_DESCRIPTIONS: Record<string, string> = {
  // AWS Compute
  aws_instance: 'Virtual server in the AWS cloud with configurable compute capacity',
  aws_launch_template: 'Template for launching EC2 instances with predefined configurations',
  aws_autoscaling_group: 'Automatically scales EC2 instances based on demand',
  aws_lambda_function: 'Serverless compute service that runs code in response to events',
  aws_ecs_cluster: 'Logical grouping of ECS tasks and services',
  aws_ecs_service: 'Runs and maintains specified number of task instances',
  aws_eks_cluster: 'Managed Kubernetes control plane for container orchestration',
  // AWS Networking
  aws_vpc: 'Isolated virtual network for your AWS resources',
  aws_subnet: 'Range of IP addresses in your VPC for resource placement',
  aws_security_group: 'Virtual firewall controlling inbound and outbound traffic',
  aws_internet_gateway: 'Enables communication between VPC and the internet',
  aws_nat_gateway: 'Enables private subnet instances to access the internet',
  aws_route_table: 'Contains rules for routing network traffic',
  aws_lb: 'Distributes incoming traffic across multiple targets',
  aws_lb_listener: 'Checks for connection requests on specified port and protocol',
  aws_lb_target_group: 'Routes requests to registered targets',
  aws_api_gateway_rest_api: 'RESTful API endpoint for serverless applications',
  aws_route53_zone: 'DNS hosted zone for domain name resolution',
  aws_cloudfront_distribution: 'Content delivery network for low-latency distribution',
  // AWS Storage
  aws_s3_bucket: 'Object storage with industry-leading scalability and durability',
  aws_ebs_volume: 'Block-level storage volume for EC2 instances',
  aws_efs_file_system: 'Scalable elastic file storage for EC2 instances',
  // AWS Database
  aws_db_instance: 'Managed relational database service (RDS)',
  aws_rds_cluster: 'Amazon Aurora database cluster',
  aws_dynamodb_table: 'Fully managed NoSQL database service',
  aws_elasticache_cluster: 'In-memory caching service (Redis/Memcached)',
  // AWS Security
  aws_iam_role: 'IAM role for granting permissions to AWS services',
  aws_iam_policy: 'Policy document defining permissions',
  aws_kms_key: 'Encryption key for data protection',
  aws_secretsmanager_secret: 'Securely stores and manages secrets',
  // AWS Messaging
  aws_sqs_queue: 'Fully managed message queuing service',
  aws_sns_topic: 'Pub/sub messaging and mobile notifications',
  // Azure
  azurerm_resource_group: 'Logical container for Azure resources',
  azurerm_virtual_network: 'Isolated network in Azure cloud',
  azurerm_subnet: 'Segment of virtual network IP addresses',
  azurerm_network_security_group: 'Filters network traffic to resources',
  azurerm_virtual_machine: 'On-demand scalable computing resource',
  azurerm_storage_account: 'Durable and highly available cloud storage',
  azurerm_sql_database: 'Managed SQL database service',
  azurerm_app_service: 'Platform for building web apps and APIs',
  azurerm_function_app: 'Serverless compute service',
  azurerm_kubernetes_cluster: 'Managed Kubernetes service (AKS)',
  // GCP
  google_compute_instance: 'Virtual machine running in Google Cloud',
  google_compute_network: 'Virtual network for GCP resources',
  google_compute_subnetwork: 'Regional resource within a VPC network',
  google_compute_firewall: 'Firewall rules for network traffic',
  google_storage_bucket: 'Object storage with global edge-caching',
  google_sql_database_instance: 'Managed MySQL/PostgreSQL database',
  google_container_cluster: 'Managed Kubernetes cluster (GKE)',
  google_cloudfunctions_function: 'Event-driven serverless functions',
};

interface ResourceListProps {
  nodes: Node[];
  selectedNode: Node | null;
  onNodeSelect: (nodeId: string) => void;
}

export default function ResourceList({
  nodes,
  selectedNode,
  onNodeSelect,
}: ResourceListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['compute', 'network', 'storage']));
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());

  // Only 'region' and 'container' are pure containers; VPC and Subnet are networking resources
  const containerNodes = nodes.filter(n => ['region', 'container'].includes(n.type || ''));

  // Group resources by category
  const groupedResources = useMemo(() => {
    const groups: Record<string, ResourceGroup> = {};

    nodes.forEach((node) => {
      const data = node.data as any;
      const resourceType = data?.resourceType || '';
      const nodeType = node.type || 'default';

      // Skip pure container nodes (region, container) - VPC and Subnet are networking resources
      if (['region', 'container'].includes(nodeType)) return;

      // Determine group based on resource type
      let groupKey = 'other';
      let groupLabel = 'Other';
      let groupIcon = 'lucide:box';

      if (resourceType.includes('region') || resourceType.includes('availability_zone')) {
        groupKey = 'region';
        groupLabel = 'Regions & Zones';
        groupIcon = 'lucide:map-pin';
      } else if (resourceType.includes('vpc') || resourceType.includes('subnet') ||
                 resourceType.includes('security_group') || resourceType.includes('gateway') ||
                 resourceType.includes('route') || resourceType.includes('network') ||
                 resourceType.includes('cloudfront') || resourceType.includes('route53') ||
                 resourceType.includes('elb') || resourceType.includes('alb') || resourceType.includes('nlb') ||
                 resourceType.includes('elastic_ip') || resourceType.includes('eip') ||
                 resourceType.includes('vpn') || resourceType.includes('transit_gateway') ||
                 resourceType.includes('endpoint') || resourceType.includes('nacl') ||
                 resourceType.includes('virtual_network') || resourceType.includes('vnet')) {
        groupKey = 'network';
        groupLabel = 'Networking';
        groupIcon = 'lucide:network';
      } else if (resourceType.includes('instance') || resourceType.includes('lambda') ||
                 resourceType.includes('compute') || resourceType.includes('autoscaling') ||
                 resourceType.includes('launch_template') || resourceType.includes('ami') ||
                 resourceType.includes('batch') || resourceType.includes('lightsail') ||
                 resourceType.includes('function') || resourceType.includes('app_runner')) {
        groupKey = 'compute';
        groupLabel = 'Compute';
        groupIcon = 'lucide:cpu';
      } else if (resourceType.includes('ecs') || resourceType.includes('eks') ||
                 resourceType.includes('ecr') || resourceType.includes('fargate') ||
                 resourceType.includes('kubernetes') || resourceType.includes('aks') ||
                 resourceType.includes('gke') || resourceType.includes('container')) {
        groupKey = 'containers';
        groupLabel = 'Containers';
        groupIcon = 'lucide:box';
      } else if (resourceType.includes('s3') || resourceType.includes('ebs') ||
                 resourceType.includes('efs') || resourceType.includes('storage') ||
                 resourceType.includes('glacier') || resourceType.includes('fsx') ||
                 resourceType.includes('backup') || resourceType.includes('blob')) {
        groupKey = 'storage';
        groupLabel = 'Storage';
        groupIcon = 'lucide:hard-drive';
      } else if (resourceType.includes('rds') || resourceType.includes('dynamodb') ||
                 resourceType.includes('database') || resourceType.includes('aurora') ||
                 resourceType.includes('documentdb') || resourceType.includes('neptune') ||
                 resourceType.includes('elasticache') || resourceType.includes('redis') ||
                 resourceType.includes('memcached') || resourceType.includes('timestream') ||
                 resourceType.includes('keyspaces') || resourceType.includes('cosmos') ||
                 resourceType.includes('sql') || resourceType.includes('mongo')) {
        groupKey = 'database';
        groupLabel = 'Database';
        groupIcon = 'lucide:database';
      } else if (resourceType.includes('iam') || resourceType.includes('cognito') ||
                 resourceType.includes('kms') || resourceType.includes('secret') ||
                 resourceType.includes('acm') || resourceType.includes('certificate') ||
                 resourceType.includes('waf') || resourceType.includes('shield') ||
                 resourceType.includes('guardduty') || resourceType.includes('inspector') ||
                 resourceType.includes('macie') || resourceType.includes('firewall') ||
                 resourceType.includes('security_hub') || resourceType.includes('key_vault')) {
        groupKey = 'security';
        groupLabel = 'Security & Identity';
        groupIcon = 'lucide:shield';
      } else if (resourceType.includes('sns') || resourceType.includes('sqs') ||
                 resourceType.includes('eventbridge') || resourceType.includes('mq') ||
                 resourceType.includes('kinesis') || resourceType.includes('kafka') ||
                 resourceType.includes('msk') || resourceType.includes('event_hub') ||
                 resourceType.includes('service_bus') || resourceType.includes('pub_sub')) {
        groupKey = 'messaging';
        groupLabel = 'Messaging';
        groupIcon = 'lucide:mail';
      } else if (resourceType.includes('cloudwatch') || resourceType.includes('cloudtrail') ||
                 resourceType.includes('log') || resourceType.includes('metric') ||
                 resourceType.includes('xray') || resourceType.includes('monitor') ||
                 resourceType.includes('alarm') || resourceType.includes('dashboard') ||
                 resourceType.includes('insight') || resourceType.includes('application_insights')) {
        groupKey = 'monitoring';
        groupLabel = 'Monitoring';
        groupIcon = 'lucide:activity';
      } else if (resourceType.includes('api_gateway') || resourceType.includes('appsync') ||
                 resourceType.includes('step_function') || resourceType.includes('sfn') ||
                 resourceType.includes('appflow') || resourceType.includes('glue') ||
                 resourceType.includes('data_pipeline') || resourceType.includes('logic_app') ||
                 resourceType.includes('api_management')) {
        groupKey = 'integration';
        groupLabel = 'Integration';
        groupIcon = 'lucide:git-branch';
      } else if (resourceType.includes('athena') || resourceType.includes('emr') ||
                 resourceType.includes('redshift') || resourceType.includes('quicksight') ||
                 resourceType.includes('data_lake') || resourceType.includes('lake_formation') ||
                 resourceType.includes('synapse') || resourceType.includes('databricks') ||
                 resourceType.includes('bigquery') || resourceType.includes('dataflow')) {
        groupKey = 'analytics';
        groupLabel = 'Analytics';
        groupIcon = 'lucide:bar-chart-2';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          type: groupKey,
          label: groupLabel,
          icon: groupIcon,
          resources: [],
        };
      }

      groups[groupKey].resources.push(node);
    });

    // Sort groups by priority
    const order = ['compute', 'containers', 'network', 'storage', 'database', 'messaging', 'integration', 'monitoring', 'analytics', 'security', 'region', 'other'];
    return Object.values(groups).sort((a, b) => {
      return order.indexOf(a.type) - order.indexOf(b.type);
    });
  }, [nodes]);

  const toggleGroup = useCallback((groupType: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupType)) {
        next.delete(groupType);
      } else {
        next.add(groupType);
      }
      return next;
    });
  }, []);

  const toggleResource = useCallback((nodeId: string) => {
    setExpandedResources((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const renderResourceProperties = useCallback((node: Node) => {
    const data = node.data as any;
    const config = data?.config || {};

    const properties = Object.entries(config).filter(([_, value]) => {
      return value !== null && value !== undefined && value !== '' && typeof value !== 'object';
    });

    if (properties.length === 0) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
          <AlertCircle className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400 italic">No properties configured</span>
        </div>
      );
    }

    const visibleProperties = properties.slice(0, 5);
    const remainingCount = properties.length - 5;

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {visibleProperties.map(([key, value]) => {
            const displayValue = String(value);
            const isBoolean = displayValue === 'true' || displayValue === 'false';
            const isLongValue = displayValue.length > 30;

            return (
              <div
                key={key}
                className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-2.5 hover:border-[#714EFF]/30 transition-colors ${
                  isLongValue ? 'col-span-2' : ''
                }`}
              >
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                  {key.replace(/_/g, ' ')}
                </p>
                {isBoolean ? (
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${displayValue === 'true' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <span className={`text-xs font-semibold ${displayValue === 'true' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                      {displayValue}
                    </span>
                  </div>
                ) : (
                  <p
                    className="text-sm font-semibold text-gray-800 dark:text-gray-100 font-mono truncate"
                    title={displayValue}
                  >
                    {displayValue}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {remainingCount > 0 && (
          <div className="flex items-center justify-center gap-1 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
            <Plus className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400">{remainingCount} more properties</span>
          </div>
        )}
      </div>
    );
  }, []);

  return (
    <div className="p-3 space-y-3 h-full overflow-y-auto">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-[#714EFF]/10 to-purple-500/10 rounded-xl p-3 border border-[#714EFF]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#714EFF]/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#714EFF]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Infrastructure Resources</p>
              <p className="text-[10px] text-gray-500">{nodes.length} total resources configured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Regions/Containers Section */}
      {containerNodes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
            <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Network Topology ({containerNodes.length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {containerNodes.map(node => {
              const data = node.data as any;
              const icon = data?.icon || getCloudIconPath(data?.resourceType);
              const displayName = data?.displayName || data?.resourceLabel || data?.resourceType;
              const isSelected = selectedNode?.id === node.id;
              const description = RESOURCE_DESCRIPTIONS[data?.resourceType] || 'Network container resource';

              return (
                <button
                  key={node.id}
                  onClick={() => onNodeSelect(node.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 shadow-sm'
                      : 'bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <CloudIcon icon={icon} size={24} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mb-1">
                      {data?.resourceType}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-2">
                      {description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Resources by Group */}
      {groupedResources.length === 0 && containerNodes.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <FileCode className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No resources yet</p>
          <p className="text-xs mt-2 text-gray-400 dark:text-gray-500 max-w-[200px] mx-auto">
            Drag and drop resources from the left panel to start building your infrastructure
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedResources.map((group) => (
            <div key={group.type} className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleGroup(group.type)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  expandedGroups.has(group.type)
                    ? 'bg-[#714EFF]/20 text-[#714EFF]'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}>
                  {expandedGroups.has(group.type) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{group.label}</span>
                <span className="ml-auto text-[10px] font-bold text-white bg-[#714EFF] px-2 py-0.5 rounded-full">
                  {group.resources.length}
                </span>
              </button>

              {expandedGroups.has(group.type) && (
                <div className="border-t border-gray-100 dark:border-gray-700">
                  {group.resources.map((node, index) => {
                    const data = node.data as any;
                    const icon = data?.icon || getCloudIconPath(data?.resourceType);
                    const displayName = data?.displayName || data?.resourceLabel || data?.resourceType;
                    const isExpanded = expandedResources.has(node.id);
                    const isSelected = selectedNode?.id === node.id;
                    const description = RESOURCE_DESCRIPTIONS[data?.resourceType] || 'Cloud infrastructure resource';
                    const isLast = index === group.resources.length - 1;

                    return (
                      <div key={node.id} className={!isLast ? 'border-b border-gray-50 dark:border-gray-700/50' : ''}>
                        <button
                          onClick={() => {
                            toggleResource(node.id);
                            onNodeSelect(node.id);
                          }}
                          className={`w-full flex items-start gap-3 p-3 transition-all duration-200 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#714EFF]/10 to-purple-500/5 border-l-3 border-[#714EFF]'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-3 border-transparent'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'bg-[#714EFF]/20' : 'bg-gray-50 dark:bg-gray-700/50'
                          }`}>
                            <CloudIcon icon={icon} size={24} />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                {displayName}
                              </p>
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-[#714EFF] dark:text-purple-400 font-mono mb-1">
                              {data?.resourceType}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-2">
                              {description}
                            </p>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-3 pb-3 pt-2 bg-gradient-to-b from-gray-50/80 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/30 border-t border-gray-100 dark:border-gray-700/50">
                            {renderResourceProperties(node)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
