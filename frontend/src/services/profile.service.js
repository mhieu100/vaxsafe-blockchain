import apiClient from './apiClient';

/**
 * Update profile based on user role
 * @param {string} role - User role (patient, doctor, cashier, admin)
 * @param {Object} data - Profile data to update
 * @returns {Promise} Updated profile data
 */
export const updateProfile = async (role, data) => {
  const response = await apiClient.put(`/api/profile/${role.toLowerCase()}`, data);
  return response;
};

/**
 * Update patient profile
 * @param {Object} data - Patient profile data
 */
export const updatePatientProfile = async (data) => {
  const response = await apiClient.put('/api/profile/patient', data);
  return response;
};

/**
 * Update doctor profile
 * @param {Object} data - Doctor profile data
 */
export const updateDoctorProfile = async (data) => {
  const response = await apiClient.put('/api/profile/doctor', data);
  return response;
};

/**
 * Update cashier profile
 * @param {Object} data - Cashier profile data
 */
export const updateCashierProfile = async (data) => {
  const response = await apiClient.put('/api/profile/cashier', data);
  return response;
};

/**
 * Update admin profile
 * @param {Object} data - Admin profile data
 */
export const updateAdminProfile = async (data) => {
  const response = await apiClient.put('/api/profile/admin', data);
  return response;
};

/**
 * Update user avatar
 * @param {string} avatarUrl - The full URL of the uploaded avatar
 * @returns {Promise} Updated avatar URL
 */
export const updateAvatar = async (avatarUrl) => {
  const response = await apiClient.put('/api/profile/avatar', {
    avatarUrl,
  });
  return response;
};

// Alias for consistency
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
