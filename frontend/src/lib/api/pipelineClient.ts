import apiClient from './client';

export const pipelineClient = {
  getPipelines: () => apiClient.get('/pipelines'),
  getPipeline: (id: string) => apiClient.get(`/pipelines/${id}`),
  createPipeline: (data: any) => apiClient.post('/pipelines', data),
  updatePipeline: (id: string, data: any) => apiClient.put(`/pipelines/${id}`, data),
  deletePipeline: (id: string) => apiClient.delete(`/pipelines/${id}`),
};

export default pipelineClient;
