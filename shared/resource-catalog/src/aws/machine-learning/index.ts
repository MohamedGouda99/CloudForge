/**
 * AWS Machine Learning Resources Index
 */

// Icon resources
export { awsSagemakerNotebookInstance } from './sagemaker-notebook';
export { awsSagemakerEndpoint } from './sagemaker-endpoint';

// Aggregate all machine-learning resources
import { awsSagemakerNotebookInstance } from './sagemaker-notebook';
import { awsSagemakerEndpoint } from './sagemaker-endpoint';

export const machineLearningResources = [
  awsSagemakerNotebookInstance,
  awsSagemakerEndpoint,
];
