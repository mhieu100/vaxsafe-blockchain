import apiClient from './apiClient';

/**
 * Module Doctor & Doctor Schedule
 */

/**
 * Get doctors with schedule in current user's center
 * @param {string|null} date - Optional date to filter
 * @returns {Promise} List of doctors with schedules
 */
export const getDoctorsWithScheduleAPI = (date = null) => {
  const params = date ? { date } : {};
  return apiClient.get('/api/v1/doctors/my-center/with-schedule', { params });
};

/**
 * Get all available doctors by center
 * @param {string|number} centerId - Center ID
 * @returns {Promise} List of available doctors
 */
export const callGetAvailableDoctorsByCenter = (centerId) => {
  return apiClient.get(`/api/v1/doctors/center/${centerId}/available`);
};

// Alias for consistency
export const getAvailableDoctorsByCenterAPI = callGetAvailableDoctorsByCenter;

/**
 * Get doctor's weekly schedule template
 * @param {string|number} doctorId - Doctor ID
 * @returns {Promise} Doctor's weekly schedule
 */
export const callGetDoctorSchedules = (doctorId) => {
  return apiClient.get(`/api/v1/doctors/${doctorId}/schedules`);
};

// Alias for consistency
export const getDoctorSchedulesAPI = callGetDoctorSchedules;

/**
 * Get available slots for a doctor on a specific date
 * @param {string|number} doctorId - Doctor ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise} Available time slots
 */
export const callGetDoctorAvailableSlots = (doctorId, date) => {
  return apiClient.get(`/api/v1/doctors/${doctorId}/slots/available`, {
    params: { date },
  });
};

// Alias for consistency
export const getAvailableSlotsAPI = callGetDoctorAvailableSlots;

/**
 * Get all available slots for a center on a specific date
 * @param {string|number} centerId - Center ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise} Available time slots for all doctors in center
 */
export const callGetAvailableSlotsByCenter = (centerId, date) => {
  return apiClient.get(`/api/v1/doctors/center/${centerId}/slots/available`, {
    params: { date },
  });
};

// Alias for consistency
export const getAvailableSlotsByCenterAPI = callGetAvailableSlotsByCenter;

/**
 * Get all available slots for a center filtered by date and time slot
 * @param {string|number} centerId - Center ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} timeSlot - Time slot enum (e.g., 'SLOT_07_00')
 * @returns {Promise} Available time slots for all doctors in center within time slot
 */
export const callGetAvailableSlotsByCenterAndTimeSlot = (centerId, date, timeSlot) => {
  return apiClient.get(`/api/v1/doctors/center/${centerId}/slots/available-by-timeslot`, {
    params: { date, timeSlot },
  });
};

// Alias for consistency
export const getAvailableSlotsByCenterAndTimeSlotAPI = callGetAvailableSlotsByCenterAndTimeSlot;

/**
 * Get doctor's slots in a date range (for calendar view)
 * @param {string|number} doctorId - Doctor ID
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise} Doctor's slots in date range
 */
export const callGetDoctorSlotsInRange = (doctorId, startDate, endDate) => {
  return apiClient.get(`/api/v1/doctors/${doctorId}/slots`, {
    params: { startDate, endDate },
  });
};

// Alias for consistency
export const getDoctorSlotsInRangeAPI = callGetDoctorSlotsInRange;

/**
 * Generate slots for a doctor in a date range
 * @param {string|number} doctorId - Doctor ID
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise} Generated slots
 */
export const callGenerateDoctorSlots = (doctorId, startDate, endDate) => {
  return apiClient.post(`/api/v1/doctors/${doctorId}/slots/generate`, {
    startDate,
    endDate,
  });
};

// Alias for consistency
export const generateDoctorSlotsAPI = callGenerateDoctorSlots;

// Default export for convenience
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
