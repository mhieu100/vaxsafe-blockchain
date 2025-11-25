import instance from './axios-customize';

// Get doctors with schedule in current user's center
export const getDoctorsWithScheduleAPI = (date = null) => {
  const params = date ? { date } : {};
  return instance.get('/api/v1/doctors/my-center/with-schedule', { params });
};

// Get available doctors by center
export const getAvailableDoctorsByCenterAPI = (centerId) => {
  return instance.get(`/api/v1/doctors/center/${centerId}/available`);
};

// Get doctor's weekly schedule template
export const getDoctorSchedulesAPI = (doctorId) => {
  return instance.get(`/api/v1/doctors/${doctorId}/schedules`);
};

// Get available slots for a doctor on a specific date
export const getAvailableSlotsAPI = (doctorId, date) => {
  return instance.get(`/api/v1/doctors/${doctorId}/slots/available`, {
    params: { date },
  });
};

// Get all available slots for a center on a specific date
export const getAvailableSlotsByCenterAPI = (centerId, date) => {
  return instance.get(`/api/v1/doctors/center/${centerId}/slots/available`, {
    params: { date },
  });
};

// Get doctor's slots in a date range (for calendar view)
export const getDoctorSlotsInRangeAPI = (doctorId, startDate, endDate) => {
  return instance.get(`/api/v1/doctors/${doctorId}/slots`, {
    params: { startDate, endDate },
  });
};

// Generate slots for a doctor in a date range
export const generateDoctorSlotsAPI = (doctorId, startDate, endDate) => {
  return instance.post(`/api/v1/doctors/${doctorId}/slots/generate`, {
    startDate,
    endDate,
  });
};
