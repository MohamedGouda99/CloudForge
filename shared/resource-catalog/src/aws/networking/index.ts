/**
 * AWS Networking Resources Index
 *
 * Exports all networking-related resource definitions.
 */

// Container resources
export { awsVpc } from './vpc';
export { awsSubnet } from './subnet';
export { awsSecurityGroup } from './security-group';
export { awsRouteTable } from './route-table';
export { awsNetworkAcl } from './network-acl';
export { awsLb } from './load-balancer';
export { awsLbListener } from './lb-listener';
export { awsLbTargetGroup } from './target-group';
export { awsRoute53Zone } from './route53-zone';
export { awsApiGatewayRestApi } from './api-gateway';
export { awsApiGatewayV2Api } from './api-gateway-v2';
export { awsTransitGateway } from './transit-gateway';

// Icon resources
export { awsInternetGateway } from './internet-gateway';
export { awsNatGateway } from './nat-gateway';
export { awsEip } from './eip';
export { awsRoute } from './route';
export { awsSecurityGroupRule } from './security-group-rule';
export { awsFlowLog } from './vpc-flow-log';
export { awsVpcEndpoint } from './vpc-endpoint';
export { awsNetworkInterface } from './network-interface';
export { awsRouteTableAssociation } from './route-table-association';

// Aggregate all networking resources
import { awsVpc } from './vpc';
import { awsSubnet } from './subnet';
import { awsSecurityGroup } from './security-group';
import { awsRouteTable } from './route-table';
import { awsNetworkAcl } from './network-acl';
import { awsLb } from './load-balancer';
import { awsLbListener } from './lb-listener';
import { awsLbTargetGroup } from './target-group';
import { awsRoute53Zone } from './route53-zone';
import { awsApiGatewayRestApi } from './api-gateway';
import { awsApiGatewayV2Api } from './api-gateway-v2';
import { awsTransitGateway } from './transit-gateway';
import { awsInternetGateway } from './internet-gateway';
import { awsNatGateway } from './nat-gateway';
import { awsEip } from './eip';
import { awsRoute } from './route';
import { awsSecurityGroupRule } from './security-group-rule';
import { awsFlowLog } from './vpc-flow-log';
import { awsVpcEndpoint } from './vpc-endpoint';
import { awsNetworkInterface } from './network-interface';
import { awsRouteTableAssociation } from './route-table-association';

export const networkingResources = [
  awsVpc,
  awsSubnet,
  awsSecurityGroup,
  awsRouteTable,
  awsNetworkAcl,
  awsLb,
  awsLbListener,
  awsLbTargetGroup,
  awsRoute53Zone,
  awsApiGatewayRestApi,
  awsApiGatewayV2Api,
  awsTransitGateway,
  awsInternetGateway,
  awsNatGateway,
  awsEip,
  awsRoute,
  awsSecurityGroupRule,
  awsFlowLog,
  awsVpcEndpoint,
  awsNetworkInterface,
  awsRouteTableAssociation,
];
