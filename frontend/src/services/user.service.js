import apiClient from '../services/apiClient';
/**
 *
Module User
 */

export const callUpdateUser = (
  walletAddress,
  fullname,
  email,
  phoneNumber,
  birthday,
  address,
  centerName
) => {
  return apiClient.put(`/users/${walletAddress}`, {
    fullname,
    email,
    phoneNumber,
    birthday,
    address,
    centerName,
  });
};

export const callFetchUser = (query) => {
  return apiClient.get(`/users?${query}`);
};

export const callDeleteUser = (id) => {
  return apiClient.delete(`/users/${id}`);
};

export const callFetchDoctor = () => {
  return apiClient.get('/users/doctors');
};
