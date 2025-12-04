import apiClient from './apiClient';

const ragService = {
  chat: async (query) => {
    // The backend expects a query parameter 'query'
    const response = await apiClient.post(`/api/rag/chat?query=${encodeURIComponent(query)}`);
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
};

export default ragService;
