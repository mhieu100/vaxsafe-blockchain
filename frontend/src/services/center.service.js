import apiClient from '../services/apiClient';

export const callCreateCenter = (data) => {
  return apiClient.post('/api/centers', data);
};

export const callUpdateCenter = (id, data) => {
  return apiClient.put(`/api/centers/${id}`, data);
};

export const callFetchCenter = (query) => {
  return apiClient.get(`/api/centers?${query}`);
};

export const callFetchCenterBySlug = (slug) => {
  return apiClient.get(`/api/centers/${slug}`);
};

export const callDeleteCenter = (id) => {
  return apiClient.delete(`/api/centers/${id}`);
};
