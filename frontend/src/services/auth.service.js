import apiClient from './apiClient';

/**
 * Login with username and password
 * @param {string} username - User's username or email
 * @param {string} password - User's password
 * @returns {Promise} Login response with user account data
 */
export async function callLogin(username, password) {
  return await apiClient.post('/auth/login/password', {
    username,
    password,
  });
}

/**
 * Logout current user
 * @returns {Promise} Logout response
 */
export const callLogout = () => {
  return apiClient.post('/auth/logout');
};

/**
 * Register new user account
 * @param {object} payload - Registration data
 * @param {string} payload.username - Username
 * @param {string} payload.email - Email address
 * @param {string} payload.password - Password
 * @param {object} payload.user - User details
 * @param {string} payload.user.fullName - Full name
 * @param {object} payload.patientProfile - Patient profile details
 * @returns {Promise} Registration response with account data
 */
export async function callRegister(payload) {
  return await apiClient.post('/auth/register', payload);
}

/**
 * Change user password
 * @param {object} payload - Password change data
 * @param {string} payload.oldPassword - Current password
 * @param {string} payload.newPassword - New password
 * @returns {Promise} Password change response
 */
export async function callChangePassword(payload) {
  return await apiClient.post('/auth/update-password', payload);
}

/**
 * Update user avatar
 * @param {string} avatarUrl - The full URL of the uploaded avatar
 * @returns {Promise} Updated user account information
 */
export async function updateAvatar(avatarUrl) {
  return await apiClient.post('/auth/avatar', {
    avatarUrl,
  });
}

// Alias for consistency
export const callUpdateAvatar = updateAvatar;

/**
 * Update user account and patient profile
 * @param {object} payload - User and patient profile data to update
 * @param {object} payload.user - User details
 * @param {string} payload.user.fullName - Full name
 * @param {object} payload.patientProfile - Patient profile details
 * @param {string} [payload.patientProfile.address] - Address
 * @param {string} [payload.patientProfile.phone] - Phone number
 * @param {string} [payload.patientProfile.birthday] - Birthday in YYYY-MM-DD format
 * @param {string} [payload.patientProfile.gender] - Gender (MALE, FEMALE, OTHER)
 * @param {string} [payload.patientProfile.identityNumber] - Identity number
 * @param {string} [payload.patientProfile.bloodType] - Blood type (A, B, AB, O)
 * @param {number} [payload.patientProfile.heightCm] - Height in cm
 * @param {number} [payload.patientProfile.weightKg] - Weight in kg
 * @param {string} [payload.patientProfile.occupation] - Occupation
 * @param {string} [payload.patientProfile.lifestyleNotes] - Lifestyle notes
 * @param {string} [payload.patientProfile.insuranceNumber] - Insurance number
 * @returns {Promise} Updated user information
 */
export async function updateAccount(payload) {
  return await apiClient.post('/auth/update-account', payload);
}

/**
 * Complete Google profile with patient information
 * @param {object} payload - Patient profile data
 * @param {object} payload.patientProfile - Patient profile details
 * @param {string} payload.patientProfile.phone - Phone number (required)
 * @param {string} payload.patientProfile.address - Address (required)
 * @param {string} payload.patientProfile.birthday - Birthday in YYYY-MM-DD format (required)
 * @param {string} payload.patientProfile.gender - Gender: MALE, FEMALE, OTHER (required)
 * @param {string} payload.patientProfile.identityNumber - Identity number (required)
 * @param {string} payload.patientProfile.bloodType - Blood type: A, B, AB, O, A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE (required)
 * @param {number} [payload.patientProfile.heightCm] - Height in cm
 * @param {number} [payload.patientProfile.weightKg] - Weight in kg
 * @param {string} [payload.patientProfile.occupation] - Occupation
 * @param {string} [payload.patientProfile.lifestyleNotes] - Lifestyle notes
 * @param {string} [payload.patientProfile.insuranceNumber] - Insurance number
 * @param {boolean} [payload.patientProfile.consentForAIAnalysis] - AI analysis consent
 * @returns {Promise} Updated user information
 */
export async function callCompleteGoogleProfile(payload) {
  return await apiClient.post('/auth/complete-profile', payload);
}

/**
 * Complete user profile with patient information (for both password and Google registration)
 * @param {object} payload - Patient profile data
 * @param {object} payload.patientProfile - Patient profile details
 * @param {string} payload.patientProfile.address - Address (required)
 * @param {string} payload.patientProfile.phone - Phone number (required)
 * @param {string} payload.patientProfile.birthday - Birthday in YYYY-MM-DD format (required)
 * @param {string} payload.patientProfile.gender - Gender: MALE, FEMALE, OTHER (required)
 * @param {string} payload.patientProfile.identityNumber - Identity number (required)
 * @param {string} payload.patientProfile.bloodType - Blood type: A, B, AB, O (required)
 * @param {number} [payload.patientProfile.heightCm] - Height in cm
 * @param {number} [payload.patientProfile.weightKg] - Weight in kg
 * @param {string} [payload.patientProfile.occupation] - Occupation
 * @param {string} [payload.patientProfile.lifestyleNotes] - Lifestyle notes
 * @param {string} [payload.patientProfile.insuranceNumber] - Insurance number
 * @param {boolean} [payload.patientProfile.consentForAIAnalysis] - AI analysis consent
 * @returns {Promise} Updated user information
 */
export async function callCompleteProfile(payload) {
  return await apiClient.post('/auth/complete-profile', payload);
}

/**
 * Fetch current user account information
 * @returns {Promise} Current user account data
 */
export async function callFetchAccount() {
  return await apiClient.get('/auth/account');
}

/**
 * Get my appointments
 * @returns {Promise} List of user's appointments
 */
export async function callMyAppointments() {
  return await apiClient.get('/auth/my-appointments');
}
