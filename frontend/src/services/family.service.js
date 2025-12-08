import apiClient from './apiClient';

export async function callCreateMember(data) {
  return await apiClient.post('/api/family-members', data);
}

export async function callUpdateMember(data) {
  return await apiClient.put('/api/family-members', data);
}

export async function callDeleteMember(id) {
  return await apiClient.delete(`/api/family-members/${id}`);
}

export async function callGetFamilyMembersByUserId(userId) {
  return await apiClient.get(`/api/family-members/user/${userId}`);
}
