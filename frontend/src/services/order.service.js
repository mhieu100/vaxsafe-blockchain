import apiClient from './apiClient';

/**
 * Create a new order
 * @param {object} payload - Order request data
 * @param {Array<object>} payload.cartItems - Array of cart items with vaccine details
 * @param {string} [payload.notes] - Additional notes for the order
 * @returns {Promise} Payment response with order details
 */
export async function callCreateOrder(payload) {
  return apiClient.post('/orders', payload);
}
