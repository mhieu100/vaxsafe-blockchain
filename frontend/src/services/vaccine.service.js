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

// Named exports for backward compatibility
export const callFetchCountry = getCountries;
export const callGetBySlug = getBySlug;
export const callGetBySku = getBySlug; // Keep for backward compatibility
