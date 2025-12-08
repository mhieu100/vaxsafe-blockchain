import apiClient from './apiClient';

export async function getCountries() {
  return apiClient.get('/api/vaccines/countries');
}

export async function getBySlug(slug) {
  return apiClient.get(`/api/vaccines/${slug}`);
}

export async function callCreateVaccine(data) {
  return apiClient.post('/api/vaccines', data);
}

export async function callUpdateVaccine(vaccineId, data) {
  return apiClient.put(`/api/vaccines/${vaccineId}`, data);
}

export async function callFetchVaccine(query) {
  return apiClient.get(`/api/vaccines?${query}`);
}

export async function callDeleteVaccine(id) {
  return apiClient.delete(`/api/vaccines/${id}`);
}

export const callFetchCountry = getCountries;
export const callGetAllCountries = getCountries;
export const callGetBySlug = getBySlug;
export const callGetBySku = getBySlug;
export const callFetchVaccineBySlug = getBySlug;
