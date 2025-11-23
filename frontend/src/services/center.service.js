import apiClient from './apiClient';

/**
 * Get all vaccination centers
 * @returns {Promise} List of all vaccination centers
 */
export async function callGetCenters() {
  return apiClient.get('/centers');
}

/**
 * Get vaccination center by ID
 * @param {string|number} id - Center ID
 * @returns {Promise} Vaccination center details
 */
export async function callGetCenterById(id) {
  return apiClient.get(`/centers/${id}`);
}
