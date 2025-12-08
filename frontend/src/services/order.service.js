import apiClient from './apiClient';

export async function callCreateOrder(payload) {
  return apiClient.post('/api/orders', payload);
}
