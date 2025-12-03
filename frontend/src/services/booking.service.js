import apiClient from './apiClient';

/**
 * Create a new booking
 * @param {object} payload - Booking request data
 * @param {number} payload.vaccineCenterId - ID of the vaccination center
 * @param {Array<object>} payload.cartItems - Array of cart items
 * @param {string} payload.appointmentDate - Appointment date
 * @param {string} payload.appointmentTime - Appointment time
 * @param {string} [payload.notes] - Additional notes
 * @returns {Promise} Payment response with booking details
 */
export async function callCreateBooking(payload) {
  return apiClient.post('/bookings', payload);
}

/**
 * Create walk-in booking with direct doctor assignment
 * @param {object} payload - Walk-in booking request data
 * @param {number} payload.patientId - Patient user ID
 * @param {number} payload.centerId - Center ID
 * @param {number} payload.vaccineId - Vaccine ID
 * @param {number} payload.doctorId - Doctor ID
 * @param {string} payload.appointmentDate - Appointment date (YYYY-MM-DD)
 * @param {string} payload.appointmentTime - Time slot enum (e.g., SLOT_13_00)
 * @param {string} payload.actualScheduledTime - Actual time (HH:mm:ss)
 * @param {number|null} payload.slotId - Slot ID or null for virtual slot
 * @param {string} [payload.notes] - Additional notes
 * @param {string} payload.paymentMethod - Payment method (CASH, BANK, etc.)
 * @returns {Promise} Booking response
 */
export async function callCreateWalkInBooking(payload) {
  return apiClient.post('/bookings/walk-in', payload);
}

/**
 * Get all bookings of the current user
 * @returns {Promise} List of user bookings with appointments
 */
export async function getMyBookings() {
  return apiClient.get('/auth/booking');
}

/**
 * Get booking history of the current user
 * @returns {Promise} List of historical bookings with appointments
 */
export async function getMyBookingHistory() {
  return apiClient.get('/auth/history-booking');
}

/**
 * Reschedule an appointment
 * @param {object} payload - Reschedule request data
 * @param {number} payload.appointmentId - ID of the appointment to reschedule
 * @param {string} payload.desiredDate - Desired new date
 * @param {string} payload.desiredTime - Desired new time
 * @param {string} [payload.reason] - Reason for rescheduling
 * @returns {Promise} Updated appointment information
 */
export async function rescheduleAppointment(payload) {
  return apiClient.put('/appointments/reschedule', payload);
}
