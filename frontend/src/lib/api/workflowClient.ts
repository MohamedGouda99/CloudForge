import apiClient from './client';

export interface NodeType {
  id: string;
  type: string;
  data: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface Workflow {
  id: string;
  name: string;
  nodes: NodeType[];
  edges: Array<{ id: string; source: string; target: string }>;
  created_at?: string;
  updated_at?: string;
}

export const workflowApi = {
  getWorkflows: () => apiClient.get<Workflow[]>('/workflows'),
  getWorkflow: (id: string) => apiClient.get<Workflow>(`/workflows/${id}`),
  createWorkflow: (data: Partial<Workflow>) => apiClient.post<Workflow>('/workflows', data),
  updateWorkflow: (id: string, data: Partial<Workflow>) => apiClient.put<Workflow>(`/workflows/${id}`, data),
  deleteWorkflow: (id: string) => apiClient.delete(`/workflows/${id}`),
};

export const workflowClient = workflowApi;

export default workflowClient;
