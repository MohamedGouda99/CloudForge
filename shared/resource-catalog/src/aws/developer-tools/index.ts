/**
 * AWS Developer Tools Resources Index
 */

// Icon resources (all developer-tools resources are icons, not containers)
export { awsCodepipeline } from './codepipeline';
export { awsCodebuildProject } from './codebuild';

// Aggregate all developer-tools resources
import { awsCodepipeline } from './codepipeline';
import { awsCodebuildProject } from './codebuild';

export const developerToolsResources = [
  awsCodepipeline,
  awsCodebuildProject,
];
