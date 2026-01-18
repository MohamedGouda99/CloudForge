/**
 * AWS Security Group Resource Definition
 *
 * Complete schema based on Terraform AWS Provider 5.x
 * https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsSecurityGroup: ServiceDefinition = {
  id: 'security_group',
  terraform_resource: 'aws_security_group',
  name: 'Security Group',
  description: 'Virtual firewall for controlling inbound and outbound traffic to AWS resources',
  icon: NETWORKING_ICONS.SECURITY_GROUP,
  category: 'networking',
  classification: 'icon',

  inputs: {
    required: [],

    optional: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the security group (conflicts with name_prefix)',
        validation: {
          pattern: '^[a-zA-Z0-9 ._\\-:/()#,@[\\]+=&;{}!$*]+$',
          maxLength: 255,
        },
        group: 'basic',
      },
      {
        name: 'name_prefix',
        type: 'string',
        description: 'Prefix for auto-generated name (conflicts with name)',
        validation: { maxLength: 100 },
        group: 'basic',
      },
      {
        name: 'description',
        type: 'string',
        description: 'Description of the security group (cannot be empty)',
        default: 'Managed by Terraform',
        validation: { maxLength: 255 },
        group: 'basic',
      },
      {
        name: 'vpc_id',
        type: 'string',
        description: 'VPC ID to create the security group in (uses default VPC if omitted)',
        reference: 'aws_vpc.id',
        group: 'basic',
      },
      {
        name: 'revoke_rules_on_delete',
        type: 'bool',
        description: 'Revoke all rules before deletion to avoid dependency errors',
        default: false,
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply to the security group',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'ingress',
        description: 'Ingress (inbound) rules - use aws_security_group_rule for separate management',
        required: false,
        multiple: true,
        attributes: [
          { name: 'from_port', type: 'number', description: 'Start port (use 0 for all ICMP)' },
          { name: 'to_port', type: 'number', description: 'End port (use 0 for all ICMP)' },
          { name: 'protocol', type: 'string', description: 'Protocol (-1 for all, tcp, udp, icmp, icmpv6)' },
          { name: 'cidr_blocks', type: 'list(string)', description: 'IPv4 CIDR blocks' },
          { name: 'ipv6_cidr_blocks', type: 'list(string)', description: 'IPv6 CIDR blocks' },
          { name: 'prefix_list_ids', type: 'list(string)', description: 'Prefix list IDs' },
          { name: 'security_groups', type: 'set(string)', description: 'Security group IDs' },
          { name: 'self', type: 'bool', description: 'Allow traffic from the security group itself' },
          { name: 'description', type: 'string', description: 'Rule description' },
        ],
      },
      {
        name: 'egress',
        description: 'Egress (outbound) rules - use aws_security_group_rule for separate management',
        required: false,
        multiple: true,
        attributes: [
          { name: 'from_port', type: 'number', description: 'Start port (use 0 for all ICMP)' },
          { name: 'to_port', type: 'number', description: 'End port (use 0 for all ICMP)' },
          { name: 'protocol', type: 'string', description: 'Protocol (-1 for all, tcp, udp, icmp, icmpv6)' },
          { name: 'cidr_blocks', type: 'list(string)', description: 'IPv4 CIDR blocks' },
          { name: 'ipv6_cidr_blocks', type: 'list(string)', description: 'IPv6 CIDR blocks' },
          { name: 'prefix_list_ids', type: 'list(string)', description: 'Prefix list IDs' },
          { name: 'security_groups', type: 'set(string)', description: 'Security group IDs' },
          { name: 'self', type: 'bool', description: 'Allow traffic to the security group itself' },
          { name: 'description', type: 'string', description: 'Rule description' },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'Security group ID' },
    { name: 'arn', type: 'string', description: 'ARN of the security group' },
    { name: 'name', type: 'string', description: 'Name of the security group' },
    { name: 'vpc_id', type: 'string', description: 'VPC ID' },
    { name: 'owner_id', type: 'string', description: 'AWS account ID of the owner' },
    { name: 'tags_all', type: 'map(string)', description: 'All tags including provider defaults' },
  ],

  terraform: {
    resourceType: 'aws_security_group',
    requiredArgs: [],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      name: 'name',
    },
  },

  relations: {
    containmentRules: [
      {
        whenParentResourceType: 'aws_vpc',
        apply: [{ setArg: 'vpc_id', toParentAttr: 'id' }],
      },
    ],
    edgeRules: [],
  },
};
