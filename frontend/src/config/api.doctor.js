import axios from './axios-customize';

/**
 * Module Doctor & Doctor Schedule
 */

/**
 * Get all available doctors by center
 * GET /api/v1/doctors/center/{centerId}/available
 */
export const callGetAvailableDoctorsByCenter = (centerId) => {
  return axios.get(`/api/v1/doctors/center/${centerId}/available`);
};

/**
 * Get doctor's weekly schedule template
 * GET /api/v1/doctors/{doctorId}/schedules
 */
export const callGetDoctorSchedules = (doctorId) => {
  return axios.get(`/api/v1/doctors/${doctorId}/schedules`);
};

/**
 * Get available slots for a doctor on a specific date
 * GET /api/v1/doctors/{doctorId}/slots/available?date=2025-11-20
 */
export const callGetDoctorAvailableSlots = (doctorId, date) => {
  return axios.get(`/api/v1/doctors/${doctorId}/slots/available`, {
    params: { date },
  });
};

/**
 * Get all available slots for a center on a specific date
 * GET /api/v1/doctors/center/{centerId}/slots/available?date=2025-11-20
 */
export const callGetAvailableSlotsByCenter = (centerId, date) => {
  return axios.get(`/api/v1/doctors/center/${centerId}/slots/available`, {
    params: { date },
  });
};

/**
 * Get doctor's slots in a date range (for calendar view)
 * GET /api/v1/doctors/{doctorId}/slots?startDate=2025-11-01&endDate=2025-11-30
 */
export const callGetDoctorSlotsInRange = (doctorId, startDate, endDate) => {
  return axios.get(`/api/v1/doctors/${doctorId}/slots`, {
    params: { startDate, endDate },
  });
};

/**
 * Generate slots for a doctor in a date range
 * POST /api/v1/doctors/{doctorId}/slots/generate
 */
export const callGenerateDoctorSlots = (doctorId, startDate, endDate) => {
  return axios.post(`/api/v1/doctors/${doctorId}/slots/generate`, {
    startDate,
    endDate,
  });
};
