import apiClient from './apiClient';

export async function callLogin(username, password) {
  return await apiClient.post('/api/auth/login/password', {
    username,
    password,
  });
}

export const callLogout = () => {
  return apiClient.post('/api/auth/logout');
};

export async function callRegister(payload) {
  return await apiClient.post('/api/auth/register', payload);
}

export async function callChangePassword(payload) {
  return await apiClient.post('/api/auth/update-password', payload);
}

export async function callCompleteGoogleProfile(payload) {
  return await apiClient.post('/api/auth/complete-profile', payload);
}

export async function callCompleteProfile(payload) {
  return await apiClient.post('/api/auth/complete-profile', payload);
}

export async function callFetchAccount() {
  return await apiClient.get('/api/auth/account');
}

export async function callForgotPassword(email) {
  return await apiClient.post('/api/auth/forgot-password', { email });
}

export async function callResetPassword(payload) {
  return await apiClient.post('/api/auth/reset-password', payload);
}
