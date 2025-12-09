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

export async function callGetMyFamilyMembers() {
  return await apiClient.post('/api/family-members/my-members');
}

export async function callGetPatientFamilyMembers(id) {
  return await apiClient.post('/api/family-members/patient-members', { id });
}

export async function callGetFamilyMemberDetail(id) {
  return await apiClient.post('/api/family-members/detail', { id });
}

export async function callGetFamilyMemberRecords(id) {
  return await apiClient.post('/api/vaccine-records/family-records', { id });
}

export async function callGetFamilyBookingHistoryGrouped(id) {
  return await apiClient.post('/api/family-members/booking-history-grouped', { id });
}
