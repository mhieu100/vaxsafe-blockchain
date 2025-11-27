import apiClient from '../services/apiClient';

/**
 * Center API Module
 */

export const callCreateCenter = (data) => {
  return apiClient.post('/centers', data);
};

export const callUpdateCenter = (id, data) => {
  return apiClient.put(`/centers/${id}`, data);
};

export const callFetchCenter = (query) => {
  return apiClient.get(`/centers?${query}`);
};

export const callFetchCenterBySlug = (slug) => {
  return apiClient.get(`/centers/${slug}`);
};

export const callDeleteCenter = (id) => {
  return apiClient.delete(`/centers/${id}`);
};
