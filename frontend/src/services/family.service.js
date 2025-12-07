import apiClient from './apiClient';

/**
 * Create a new family member
 * @param {object} data - Family member data
 * @param {string} data.fullName - Full name
 * @param {string} data.dateOfBirth - Date of birth
 * @param {string} data.relationship - Relationship to user
 * @param {string} [data.phone] - Phone number
 * @param {string} data.gender - Gender (MALE or FEMALE)
 * @param {string} data.identityNumber - Identity number
 * @returns {Promise} Created family member data
 */
export async function callCreateMember(data) {
  return await apiClient.post('/api/family-members', data);
}

/**
 * Update an existing family member
 * @param {object} data - Family member update data
 * @param {number} data.id - Family member ID
 * @param {string} data.fullName - Full name
 * @param {string} data.dateOfBirth - Date of birth
 * @param {string} data.relationship - Relationship to user
 * @param {string} [data.phone] - Phone number
 * @param {string} data.gender - Gender (MALE or FEMALE)
 * @param {string} data.identityNumber - Identity number
 * @returns {Promise} Updated family member data
 */
export async function callUpdateMember(data) {
  return await apiClient.put('/api/family-members', data);
}

/**
 * Delete a family member
 * @param {number} id - Family member ID to delete
 * @returns {Promise} Deletion confirmation
 */
export async function callDeleteMember(id) {
  return await apiClient.delete(`/api/family-members/${id}`);
}

/**
 * Get family members by user ID (for staff usage)
 * @param {number} userId - User ID
 * @returns {Promise} List of family members
 */
export async function callGetFamilyMembersByUserId(userId) {
  return await apiClient.get(`/api/family-members/user/${userId}`);
}
