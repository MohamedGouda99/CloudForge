/**
 * AWS API Gateway V2 (HTTP/WebSocket) Resource Definition
 */

import type { ServiceDefinition } from '../../types';
import { NETWORKING_ICONS } from '../icons';

export const awsApiGatewayV2Api: ServiceDefinition = {
  id: 'apigatewayv2_api',
  terraform_resource: 'aws_apigatewayv2_api',
  name: 'API Gateway V2',
  description: 'HTTP or WebSocket API for API Gateway',
  icon: NETWORKING_ICONS.API_GATEWAY_V2,
  category: 'networking',
  classification: 'container',

  inputs: {
    required: [
      {
        name: 'name',
        type: 'string',
        description: 'Name of the API',
        group: 'basic',
      },
      {
        name: 'protocol_type',
        type: 'string',
        description: 'Protocol type',
        options: ['HTTP', 'WEBSOCKET'],
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
        name: 'api_key_selection_expression',
        type: 'string',
        description: 'API key selection expression (WebSocket only)',
        group: 'advanced',
      },
      {
        name: 'route_selection_expression',
        type: 'string',
        description: 'Route selection expression (WebSocket only)',
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
        name: 'cors_configuration',
        description: 'CORS configuration (HTTP only)',
        required: false,
        multiple: false,
        attributes: [
          { name: 'allow_credentials', type: 'bool', description: 'Allow credentials' },
          { name: 'allow_headers', type: 'list(string)', description: 'Allowed headers' },
          { name: 'allow_methods', type: 'list(string)', description: 'Allowed methods' },
          { name: 'allow_origins', type: 'list(string)', description: 'Allowed origins' },
          { name: 'expose_headers', type: 'list(string)', description: 'Exposed headers' },
          { name: 'max_age', type: 'number', description: 'Max age in seconds' },
        ],
      },
    ],
  },

  outputs: [
    { name: 'id', type: 'string', description: 'API ID' },
    { name: 'arn', type: 'string', description: 'ARN of the API' },
    { name: 'api_endpoint', type: 'string', description: 'API endpoint URL' },
    { name: 'execution_arn', type: 'string', description: 'Execution ARN' },
  ],

  terraform: {
    resourceType: 'aws_apigatewayv2_api',
    requiredArgs: ['name', 'protocol_type'],
    referenceableAttrs: {
      id: 'id',
      arn: 'arn',
      api_endpoint: 'api_endpoint',
    },
  },

  relations: {
    containmentRules: [],
    edgeRules: [],
    validChildren: [
      {
        childTypes: ['aws_apigatewayv2_route', 'aws_apigatewayv2_integration', 'aws_apigatewayv2_stage'],
        description: 'API Gateway V2 routes, integrations, and stages',
      },
    ],
  },
};
