import apiClient from '../services/apiClient';

/**
 *
Module Permission
 */

export const callCreatePermission = (name, method, apiPath, module) => {
  return apiClient.post('/permissions', {
    name,
    method,
    apiPath,
    module,
  });
};

export const callUpdatePermission = (id, name, method, apiPath, module) => {
  return apiClient.put('/permissions', {
    id,
    name,
    method,
    apiPath,
    module,
  });
};

export const callFetchPermission = (query) => {
  return apiClient.get(`/permissions?${query}`);
};

export const callDeletePermission = (id) => {
  return apiClient.delete(`/permissions/${id}`);
};
