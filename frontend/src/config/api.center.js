import axios from './axios-customize';

/**
 * Center API Module
 */

export const callCreateCenter = (data) => {
  return axios.post('/centers', data);
};

export const callUpdateCenter = (id, data) => {
  return axios.put(`/centers/${id}`, data);
};

export const callFetchCenter = (query) => {
  return axios.get(`/centers?${query}`);
};

export const callFetchCenterBySlug = (slug) => {
  return axios.get(`/centers/${slug}`);
};

export const callDeleteCenter = (id) => {
  return axios.delete(`/centers/${id}`);
};
