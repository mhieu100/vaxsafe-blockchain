import apiClient from './apiClient';

/**
 * Profile Service - Handles profile operations for all roles
 */
const profileService = {
  /**
   * Get profile based on user role
   * @param {string} role - User role (patient, doctor, cashier, admin)
   * @returns {Promise} Profile data
   */
  getProfile: async (role) => {
    const response = await apiClient.get(`/api/profile/${role.toLowerCase()}`);
    return response.data;
  },

  /**
   * Update profile based on user role
   * @param {string} role - User role (patient, doctor, cashier, admin)
   * @param {Object} data - Profile data to update
   * @returns {Promise} Updated profile data
   */
  updateProfile: async (role, data) => {
    const response = await apiClient.put(`/api/profile/${role.toLowerCase()}`, data);
    return response.data;
  },

  // Specific role methods for better type safety

  /**
   * Get patient profile
   */
  getPatientProfile: async () => {
    const response = await apiClient.get('/api/profile/patient');
    return response.data;
  },

  /**
   * Update patient profile
   * @param {Object} data - Patient profile data
   */
  updatePatientProfile: async (data) => {
    const response = await apiClient.put('/api/profile/patient', data);
    return response.data;
  },

  /**
   * Get doctor profile
   */
  getDoctorProfile: async () => {
    const response = await apiClient.get('/api/profile/doctor');
    return response.data;
  },

  /**
   * Update doctor profile
   * @param {Object} data - Doctor profile data
   */
  updateDoctorProfile: async (data) => {
    const response = await apiClient.put('/api/profile/doctor', data);
    return response.data;
  },

  /**
   * Get cashier profile
   */
  getCashierProfile: async () => {
    const response = await apiClient.get('/api/profile/cashier');
    return response.data;
  },

  /**
   * Update cashier profile
   * @param {Object} data - Cashier profile data
   */
  updateCashierProfile: async (data) => {
    const response = await apiClient.put('/api/profile/cashier', data);
    return response.data;
  },

  /**
   * Get admin profile
   */
  getAdminProfile: async () => {
    const response = await apiClient.get('/api/profile/admin');
    return response.data;
  },

  /**
   * Update admin profile
   * @param {Object} data - Admin profile data
   */
  updateAdminProfile: async (data) => {
    const response = await apiClient.put('/api/profile/admin', data);
    return response.data;
  },
};

export default profileService;
