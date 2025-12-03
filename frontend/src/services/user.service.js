import apiClient from '../services/apiClient';
/**
 *
Module User
 */

export const callUpdateUser = (id, fullName, email, phone, birthday, address) => {
  return apiClient.put('/users', {
    id,
    fullName,
    email,
    phone,
    birthday,
    address,
  });
};

export const callFetchPatients = (query) => {
  return apiClient.get(`/users/patients?${query}`);
};

export const callFetchCashiers = (query) => {
  return apiClient.get(`/users/cashiers?${query}`);
};

export const callFetchDoctors = (query) => {
  return apiClient.get(`/users/doctors?${query}`);
};

export const callDeleteUser = (id) => {
  return apiClient.delete(`/users/${id}`);
};

export const callFetchDoctor = () => {
  return apiClient.get('/users/doctors');
};
