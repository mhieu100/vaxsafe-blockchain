import apiClient from './apiClient';

export const getDoctorsWithScheduleAPI = (date = null) => {
  const params = date ? { date } : {};
  return apiClient.get('/api/doctors/my-center/with-schedule', { params });
};

export const callGetAvailableDoctorsByCenter = (centerId) => {
  return apiClient.get(`/api/doctors/center/${centerId}/available`);
};

export const getAvailableDoctorsByCenterAPI = callGetAvailableDoctorsByCenter;

export const callGetDoctorSchedules = (doctorId) => {
  return apiClient.get(`/api/doctors/${doctorId}/schedules`);
};

export const getDoctorSchedulesAPI = callGetDoctorSchedules;

export const callGetDoctorAvailableSlots = (doctorId, date) => {
  return apiClient.get(`/api/doctors/${doctorId}/slots/available`, {
    params: { date },
  });
};

export const getAvailableSlotsAPI = callGetDoctorAvailableSlots;

export const callGetAvailableSlotsByCenter = (centerId, date) => {
  return apiClient.get(`/api/doctors/center/${centerId}/slots/available`, {
    params: { date },
  });
};

export const getAvailableSlotsByCenterAPI = callGetAvailableSlotsByCenter;

export const callGetAvailableSlotsByCenterAndTimeSlot = (centerId, date, timeSlot) => {
  return apiClient.get(`/api/doctors/center/${centerId}/slots/available-by-timeslot`, {
    params: { date, timeSlot },
  });
};

export const getAvailableSlotsByCenterAndTimeSlotAPI = callGetAvailableSlotsByCenterAndTimeSlot;

export const callGetDoctorSlotsInRange = (doctorId, startDate, endDate) => {
  return apiClient.get(`/api/doctors/${doctorId}/slots`, {
    params: { startDate, endDate },
  });
};

export const getDoctorSlotsInRangeAPI = callGetDoctorSlotsInRange;

export const callGenerateDoctorSlots = (doctorId, startDate, endDate) => {
  return apiClient.post(`/api/doctors/${doctorId}/slots/generate`, {
    startDate,
    endDate,
  });
};

export const generateDoctorSlotsAPI = callGenerateDoctorSlots;

const doctorService = {
  getDoctorsWithScheduleAPI,
  callGetAvailableDoctorsByCenter,
  getAvailableDoctorsByCenterAPI,
  callGetDoctorSchedules,
  getDoctorSchedulesAPI,
  callGetDoctorAvailableSlots,
  getAvailableSlotsAPI,
  callGetAvailableSlotsByCenter,
  getAvailableSlotsByCenterAPI,
  callGetAvailableSlotsByCenterAndTimeSlot,
  getAvailableSlotsByCenterAndTimeSlotAPI,
  callGetDoctorSlotsInRange,
  getDoctorSlotsInRangeAPI,
  callGenerateDoctorSlots,
  generateDoctorSlotsAPI,
};

export default doctorService;
