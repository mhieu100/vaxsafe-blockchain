import apiClient from './apiClient';

export const getTransactionResult = async (paymentId) => {
  const response = await apiClient.get(`/payments/${paymentId}/result`);
  return response.data;
};
