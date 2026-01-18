/**
 * AWS Management Resources Index
 */

// Icon resources (all management resources are icons, not containers)
export { awsCloudwatchLogGroup } from './cloudwatch-log-group';
export { awsCloudwatchEventRule } from './eventbridge-rule';
export { awsCloudwatchMetricAlarm } from './cloudwatch-metric-alarm';
export { awsSsmParameter } from './ssm-parameter';

// Aggregate all management resources
import { awsCloudwatchLogGroup } from './cloudwatch-log-group';
import { awsCloudwatchEventRule } from './eventbridge-rule';
import { awsCloudwatchMetricAlarm } from './cloudwatch-metric-alarm';
import { awsSsmParameter } from './ssm-parameter';

export const managementResources = [
  awsCloudwatchLogGroup,
  awsCloudwatchEventRule,
  awsCloudwatchMetricAlarm,
  awsSsmParameter,
];
