import apiClient from './apiClient';

const ragService = {
  chat: async (query) => {
    const response = await apiClient.post(`/api/rag/chat?query=${encodeURIComponent(query)}`);
    return response;
  },
  consult: async (data) => {
    const response = await apiClient.post('/api/rag/consult', data);
    return response;
  },
  ingest: async (contents) => {
    const response = await apiClient.post('/api/rag/ingest', contents);
    return response;
  },
  search: async (query) => {
    const response = await apiClient.get(`/api/rag/search?query=${encodeURIComponent(query)}`);
    return response;
  },
  sync: async () => {
    const response = await apiClient.post('/api/rag/sync');
    return response;
  },
};

export default ragService;
