import axios from './axios-customize';

/**
 * Module Vaccine
 */

export const callCreateVaccine = (data) => {
  return axios.post('/vaccines', data);
};

export const callUpdateVaccine = (vaccineId, data) => {
  return axios.put(`/vaccines/${vaccineId}`, data);
};

export const callFetchVaccine = (query) => {
  return axios.get(`/vaccines?${query}`);
};

export const callFetchVaccineBySlug = (slug) => {
  return axios.get(`/vaccines/${slug}`);
};

export const callDeleteVaccine = (id) => {
  return axios.delete(`/vaccines/${id}`);
};

export const callGetAllCountries = () => {
  return axios.get('/vaccines/countries');
};
