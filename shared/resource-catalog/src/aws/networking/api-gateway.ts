/**
 * AWS API Gateway REST API Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsApiGatewayRestApi: ServiceDefinition = {
  id: 'api_gateway_rest_api',
  terraform_resource: 'aws_api_gateway_rest_api',
  name: 'API Gateway REST API',
  description: 'REST API for API Gateway',
  icon: NETWORKING_ICONS.API_GATEWAY,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the REST API',
        group: 'basic',
      },
    ],

    optional: [
      {
        name: 'description',
        type: 'string',
        description: 'Description of the API',
        group: 'basic',
      },
      {
        name: 'api_key_source',
        type: 'string',
        description: 'Source of the API key',
        default: 'HEADER',
        options: ['HEADER', 'AUTHORIZER'],
        group: 'advanced',
      },
      {
        name: 'binary_media_types',
        type: 'list(string)',
        description: 'Binary media types',
        group: 'advanced',
      },
      {
        name: 'minimum_compression_size',
        type: 'number',
        description: 'Minimum compression size (bytes)',
        validation: { min: 0, max: 10485760 },
        group: 'advanced',
      },
      {
        name: 'tags',
        type: 'map(string)',
        description: 'Tags to apply',
        default: {},
        group: 'basic',
      },
    ],

    blocks: [
      {
        name: 'endpoint_configuration',
        description: 'Endpoint configuration',
        required: false,
        multiple: false,
        attributes: [
          { name: 'types', type: 'list(string)', description: 'Endpoint types', options: ['EDGE', 'REGIONAL', 'PRIVATE'] },
          { name: 'vpc_endpoint_ids', type: 'list(string)', description: 'VPC endpoint IDs' },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'REST API ID' },
    { name: 'arn', type: 'string', description: 'ARN of the REST API' },
    { name: 'root_resource_id', type: 'string', description: 'Root resource ID' },
    { name: 'execution_arn', type: 'string', description: 'Execution ARN' },
  ],

  terraform: {
    resourceType: 'aws_api_gateway_rest_api',
    requiredArgs: ['name'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      root_resource_id: 'root_resource_id',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
    validChildren: [
      {
        childTypes: ['aws_api_gateway_resource', 'aws_api_gateway_method', 'aws_api_gateway_deployment'],
        description: 'API Gateway resources, methods, and deployments',
      },
    ],
  },
};
