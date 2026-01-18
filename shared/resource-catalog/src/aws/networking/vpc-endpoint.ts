/**
 * AWS VPC Endpoint Resource Definition
 *
 * Based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc_endpoint
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsVpcEndpoint: ServiceDefinition = {
  id: 'vpc_endpoint',
  terraform_resource: 'aws_vpc_endpoint',
  name: 'VPC Endpoint',
  description: 'Enables private connectivity to AWS services without requiring an internet gateway or NAT device',
  icon: NETWORKING_ICONS.VPC_ENDPOINT,
  category: 'networking',
  classification: 'icon',

  inputs: {
    required: [
      {
        name: 'vpc_id',
        type: 'string',
        description: 'VPC in which to create the endpoint',
        reference: 'aws_vpc.id',
        group: 'basic',
      },
      {
        name: 'service_name',
        type: 'string',
        description: 'AWS service name (e.g., com.amazonaws.us-east-1.s3)',
        example: 'com.amazonaws.us-east-1.s3',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'vpc_endpoint_type',
        type: 'string',
        description: 'Type of VPC endpoint',
        default: 'Gateway',
        options: ['Gateway', 'Interface', 'GatewayLoadBalancer'],
        group: 'basic',
      },
      {
        name: 'auto_accept',
        type: 'bool',
        description: 'Accept endpoint connection request automatically',
        default: false,
        group: 'basic',
      },
      {
        name: 'policy',
        type: 'string',
        description: 'Policy to attach to the endpoint (JSON)',
        group: 'advanced',
      },
      {
        name: 'private_dns_enabled',
        type: 'bool',
        description: 'Enable private DNS for the endpoint (Interface endpoints only)',
        default: false,
        group: 'advanced',
      },
      {
        name: 'route_table_ids',
        type: 'set(string)',
        description: 'Route table IDs (Gateway endpoints only)',
        reference: 'aws_route_table.id',
        group: 'basic',
      },
      {
        name: 'subnet_ids',
        type: 'set(string)',
        description: 'Subnet IDs (Interface and GatewayLoadBalancer endpoints)',
        reference: 'aws_subnet.id',
        group: 'basic',
      },
      {
        name: 'security_group_ids',
        type: 'set(string)',
        description: 'Security group IDs (Interface endpoints only)',
        reference: 'aws_security_group.id',
        group: 'basic',
      },
      {
        name: 'ip_address_type',
        type: 'string',
        description: 'IP address type for the endpoint',
        options: ['ipv4', 'dualstack', 'ipv6'],
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the endpoint',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'dns_options',
        description: 'DNS options for the endpoint',
        required: false,
        multiple: false,
        attributes: [
          {
            name: 'dns_record_ip_type',
            type: 'string',
            description: 'DNS records created for the endpoint',
            options: ['ipv4', 'dualstack', 'service-defined', 'ipv6'],
          },
          {
            name: 'private_dns_only_for_inbound_resolver_endpoint',
            type: 'bool',
            description: 'Whether to enable private DNS only for inbound resolver endpoint',
            default: false,
          },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'VPC endpoint ID' },
    { name: 'arn', type: 'string', description: 'ARN of the VPC endpoint' },
    { name: 'state', type: 'string', description: 'State of the VPC endpoint' },
    { name: 'prefix_list_id', type: 'string', description: 'Prefix list ID (Gateway endpoints)' },
    { name: 'cidr_blocks', type: 'list(string)', description: 'CIDR blocks for the service (Gateway endpoints)' },
    { name: 'dns_entry', type: 'list', description: 'DNS entries for the VPC endpoint' },
    { name: 'network_interface_ids', type: 'set(string)', description: 'Network interface IDs' },
    { name: 'owner_id', type: 'string', description: 'AWS account ID of the owner' },
    { name: 'requester_managed', type: 'bool', description: 'Whether the endpoint is managed by the requester' },
  ],

  terraform: {
    resourceType: 'aws_vpc_endpoint',
    requiredArgs: ['vpc_id', 'service_name'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      prefix_list_id: 'prefix_list_id',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_vpc',
        apply: [{ setArg: 'vpc_id', toParentAttr: 'id' }],
      },
    ],
    edgeRules: [
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_route_table',
        apply: [{ pushToListArg: 'route_table_ids', toTargetAttr: 'id' }],
      },
      {
        whenEdgeKind: 'attach',
        direction: 'outbound',
        toResourceType: 'aws_security_group',
        apply: [{ pushToListArg: 'security_group_ids', toTargetAttr: 'id' }],
      },
    ],
  },
};
