import apiClient from '../services/apiClient';

/**
 *
Module Role
 */

export const callFetchRole = (query) => {
  return apiClient.get(`/roles?${query}`);
};

export const callUpdateRole = (role, id) => {
  return apiClient.put(`/roles/${id}`, { ...role });
};
