import apiClient from './apiClient';

export const updateProfile = async (role, data) => {
  const response = await apiClient.put(`/api/profile/${role.toLowerCase()}`, data);
  return response;
};

export const updatePatientProfile = async (data) => {
  const response = await apiClient.put('/api/profile/patient', data);
  return response;
};

export const updateDoctorProfile = async (data) => {
  const response = await apiClient.put('/api/profile/doctor', data);
  return response;
};

export const updateCashierProfile = async (data) => {
  const response = await apiClient.put('/api/profile/cashier', data);
  return response;
};

export const updateAdminProfile = async (data) => {
  const response = await apiClient.put('/api/profile/admin', data);
  return response;
};

export const updateAvatar = async (avatarUrl) => {
  const response = await apiClient.put('/api/profile/avatar', {
    avatarUrl,
  });
  return response;
};

export const callUpdateAvatar = updateAvatar;

const profileService = {
  updateProfile,
  updatePatientProfile,
  updateDoctorProfile,
  updateCashierProfile,
  updateAdminProfile,
  updateAvatar,
  callUpdateAvatar,
};

export default profileService;
