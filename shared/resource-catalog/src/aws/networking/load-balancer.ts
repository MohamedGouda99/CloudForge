/**
 * AWS Load Balancer Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsLb: ServiceDefinition = {
  id: 'lb',
  terraform_resource: 'aws_lb',
  name: 'Load Balancer',
  description: 'Elastic Load Balancer supporting Application, Network, and Gateway types',
  icon: NETWORKING_ICONS.ALB,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [],

    optional: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the load balancer (max 32 chars, unique per account)',
        validation: {
          pattern: '^[a-zA-Z0-9-]+$',
          maxLength: 32,
        },
        group: 'basic',
      },
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Prefix for auto-generated load balancer name',
        group: 'basic',
      },
      {
        name: 'internal',
        type: 'bool',
        description: 'Create an internal load balancer (not internet-facing)',
        default: false,
        group: 'basic',
      },
      {
        name: 'load_balancer_type',
        type: 'string',
        description: 'Type of load balancer to create',
        default: 'application',
        options: ['application', 'network', 'gateway'],
        group: 'basic',
      },
      {
        name: 'security_groups',
        type: 'list(string)',
        description: 'Security group IDs to associate (Application/Network LB only)',
        reference: 'aws_security_group.id',
        group: 'networking',
      },
      {
        name: 'subnets',
        type: 'list(string)',
        description: 'Subnet IDs to attach the load balancer',
        reference: 'aws_subnet.id',
        group: 'networking',
      },
      {
        name: 'ip_address_type',
        type: 'string',
        description: 'Type of IP addresses used by subnets',
        default: 'ipv4',
        options: ['ipv4', 'dualstack', 'dualstack-without-public-ipv4'],
        group: 'networking',
      },
      {
        name: 'customer_owned_ipv4_pool',
        type: 'string',
        description: 'Customer-owned IPv4 address pool ID',
        group: 'advanced',
      },
      {
        name: 'enable_deletion_protection',
        type: 'bool',
        description: 'Prevent load balancer from being deleted via API',
        default: false,
        group: 'security',
      },
      {
        name: 'enable_cross_zone_load_balancing',
        type: 'bool',
        description: 'Enable cross-zone load balancing',
        default: false,
        group: 'advanced',
      },
      {
        name: 'enable_http2',
        type: 'bool',
        description: 'Enable HTTP/2 support (Application LB only)',
        default: true,
        group: 'advanced',
      },
      {
        name: 'enable_waf_fail_open',
        type: 'bool',
        description: 'Route requests when WAF is unavailable',
        default: false,
        group: 'security',
      },
      {
        name: 'enable_zonal_shift',
        type: 'bool',
        description: 'Enable zonal shift capability',
        default: false,
        group: 'advanced',
      },
      {
        name: 'idle_timeout',
        type: 'number',
        description: 'Connection idle timeout in seconds (Application LB only)',
        default: 60,
        validation: { min: 1, max: 4000 },
        group: 'advanced',
      },
      {
        name: 'client_keep_alive',
        type: 'number',
        description: 'Client keep-alive value in seconds',
        default: 3600,
        validation: { min: 60, max: 604800 },
        group: 'advanced',
      },
      {
        name: 'desync_mitigation_mode',
        type: 'string',
        description: 'HTTP desync handling mode',
        default: 'defensive',
        options: ['monitor', 'defensive', 'strictest'],
        group: 'security',
      },
      {
        name: 'dns_record_client_routing_policy',
        type: 'string',
        description: 'Traffic distribution policy across AZs',
        default: 'any_availability_zone',
        options: ['any_availability_zone', 'availability_zone_affinity', 'partial_availability_zone_affinity'],
        group: 'advanced',
      },
      {
        name: 'drop_invalid_header_fields',
        type: 'bool',
        description: 'Remove invalid HTTP headers (Application LB only)',
        default: false,
        group: 'security',
      },
      {
        name: 'preserve_host_header',
        type: 'bool',
        description: 'Preserve Host header unchanged (Application LB only)',
        default: false,
        group: 'advanced',
      },
      {
        name: 'enable_tls_version_and_cipher_suite_headers',
        type: 'bool',
        description: 'Add TLS negotiation headers (Application LB only)',
        default: false,
        group: 'advanced',
      },
      {
        name: 'enable_xff_client_port',
        type: 'bool',
        description: 'Preserve source port in X-Forwarded-For (Application LB only)',
        default: false,
        group: 'advanced',
      },
      {
        name: 'xff_header_processing_mode',
        type: 'string',
        description: 'X-Forwarded-For header modification mode (Application LB only)',
        default: 'append',
        options: ['append', 'preserve', 'remove'],
        group: 'advanced',
      },
      {
        name: 'enforce_security_group_inbound_rules_on_private_link_traffic',
        type: 'string',
        description: 'Enforce inbound rules on PrivateLink traffic (Network LB only)',
        options: ['on', 'off'],
        group: 'security',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the load balancer',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'access_logs',
        description: 'S3 access logs configuration',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'bucket',
            type: 'string',
            description: 'S3 bucket name for access logs',
          },
          {
            name: 'prefix',
            type: 'string',
            description: 'S3 key prefix for access logs',
          },
          {
            name: 'enabled',
            type: 'bool',
            description: 'Enable access logging',
            default: false,
          },
        ],
      },
      {
        name: 'connection_logs',
        description: 'S3 connection logs configuration (Application LB only)',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'bucket',
            type: 'string',
            description: 'S3 bucket name for connection logs',
          },
          {
            name: 'prefix',
            type: 'string',
            description: 'S3 key prefix for connection logs',
          },
          {
            name: 'enabled',
            type: 'bool',
            description: 'Enable connection logging',
            default: false,
          },
        ],
      },
      {
        name: 'subnet_mapping',
        description: 'Explicit subnet/IP mapping configuration',
        required: false,
        multiple: true,
        attributes: [
          {
            name: 'subnet_id',
            type: 'string',
            description: 'Subnet ID to attach',
          },
          {
            name: 'allocation_id',
            type: 'string',
            description: 'Elastic IP allocation ID',
          },
          {
            name: 'ipv6_address',
            type: 'string',
            description: 'IPv6 address to assign',
          },
          {
            name: 'private_ipv4_address',
            type: 'string',
            description: 'Private IPv4 address to assign',
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Load Balancer ID' },
    { name: 'arn', type: 'string', description: 'ARN of the load balancer' },
    { name: 'arn_suffix', type: 'string', description: 'ARN suffix for CloudWatch metrics' },
    { name: 'dns_name', type: 'string', description: 'DNS name of the load balancer' },
    { name: 'zone_id', type: 'string', description: 'Route 53 hosted zone ID' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_lb',
    requiredArgs: [],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      arn_suffix: 'arn_suffix',
      dns_name: 'dns_name',
      zone_id: 'zone_id',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_vpc',
        apply: [],
      },
    ],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_security_group',
        apply: [{ pushToListArg: 'security_groups', toTargetAttr: 'id' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_subnet',
        apply: [{ pushToListArg: 'subnets', toTargetAttr: 'id' }],
      },
    ],
    validChildren: [
      {
        childTypes: ['aws_lb_listener'],
        description: 'Load balancer listeners',
      },
    ],
  },
};
