import apiClient from './apiClient';

const ragService = {
  chat: async (query) => {
    // The backend expects a query parameter 'query'
    const response = await apiClient.post(`/api/rag/chat?query=${encodeURIComponent(query)}`);
    return response;
  },
};

export default ragService;
