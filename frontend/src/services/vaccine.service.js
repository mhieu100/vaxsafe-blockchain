import apiClient from './apiClient';

/**
 * Get list of available countries for vaccines
 * @returns {Promise} Array of country names
 */
export async function getCountries() {
  return apiClient.get('/vaccines/countries');
}

/**
 * Get vaccine details by slug
 * @param {string} slug - Vaccine slug identifier
 * @returns {Promise} Vaccine details
 */
export async function getBySlug(slug) {
  return apiClient.get(`/vaccines/${slug}`);
}

/**
 * Create a new vaccine
 * @param {object} data - Vaccine data
 * @returns {Promise} Created vaccine data
 */
export async function callCreateVaccine(data) {
  return apiClient.post('/vaccines', data);
}

/**
 * Update vaccine by ID
 * @param {string|number} vaccineId - Vaccine ID
 * @param {object} data - Updated vaccine data
 * @returns {Promise} Updated vaccine data
 */
export async function callUpdateVaccine(vaccineId, data) {
  return apiClient.put(`/vaccines/${vaccineId}`, data);
}

/**
 * Fetch vaccines with query
 * @param {string} query - Query string for filtering/pagination
 * @returns {Promise} List of vaccines
 */
export async function callFetchVaccine(query) {
  return apiClient.get(`/vaccines?${query}`);
}

/**
 * Delete vaccine by ID
 * @param {string|number} id - Vaccine ID to delete
 * @returns {Promise} Deletion confirmation
 */
export async function callDeleteVaccine(id) {
  return apiClient.delete(`/vaccines/${id}`);
}

// Named exports for backward compatibility
export const callFetchCountry = getCountries;
export const callGetAllCountries = getCountries;
export const callGetBySlug = getBySlug;
export const callGetBySku = getBySlug;
export const callFetchVaccineBySlug = getBySlug;
