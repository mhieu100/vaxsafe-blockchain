import apiClient from './apiClient';

export const verifyRecord = async (id) => {
  try {
    const response = await apiClient.get(`/api/public/verify-vaccine/${id}`);
    // apiClient interceptors return response.data (the full backend response body)
    // Body format: { statusCode: 200, data: { ... } }
    return response.data;
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
};
