import axios from './axios-customize';

/**
 *
Module Auth
 */

export const callRegister = (payload) => {
  return axios.post('/auth/register', payload);
};

export const callLoginWithPassword = (username, password) => {
  return axios.post('/auth/login/password', { username, password });
};

export const callLoginWithGoogle = (googleToken) => {
  return axios.post('/auth/login/google', { token: googleToken });
};

export const callFetchAccount = () => {
  return axios.get('/auth/account');
};

export const callLogout = () => {
  return axios.post('/auth/logout');
};

export const callMyAppointments = () => {
  return axios.get('/auth/my-appointments');
};

export const updateAccount = (payload) => {
  return axios.post('/auth/update-account', payload);
};

export const updateAvatar = (avatarUrl) => {
  return axios.post('/auth/avatar', { avatarUrl });
};

export const callChangePassword = (payload) => {
  return axios.post('/auth/update-password', payload);
};

// export const callRefreshToken = () => {
//   return axios.get('/auth/refresh');
// };
