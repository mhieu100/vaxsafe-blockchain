import apiClient from '../services/apiClient';

/**
 * Module Appointment
 */

// Duplicate APIs removed - use these services instead:
// - callCreateOrder -> use order.service.js
// - callCreateBooking -> use booking.service.js

export const callGetAppointment = (hash) => {
  return apiClient.get(`/appointments/${hash}`);
};

export const callGetOrder = () => {
  return apiClient.get('/orders');
};

export const updatePaymentPaypal = (bookingId, paymentId) => {
  return apiClient.post('/payments/paypal', {
    bookingId,
    paymentId,
  });
};

export const updatePaymentMetaMask = (paymentId, bookingId) => {
  return apiClient.post('/payments/meta-mask', {
    paymentId,
    bookingId,
  });
};

export const callAddAppointmentMetaMark = (
  vaccineId,
  centerId,
  time,
  firstDoseDate,
  price,
  doseSchedules
) => {
  return apiClient.post('/appointments/meta-mark', {
    vaccineId,
    centerId,
    time,
    firstDoseDate,
    price,
    doseSchedules,
  });
};

export const callAllBookings = () => {
  return apiClient.get('/bookings');
};

export const callUpdateAppointment = (appointmentId, doctorId, slotId, actualScheduledTime) => {
  return apiClient.put('/appointments', {
    appointmentId,
    doctorId,
    slotId,
    actualScheduledTime,
  });
};

export const callCancelAppointment = (appointmentId) => {
  return apiClient.put(`/appointments/${appointmentId}/cancel`);
};

export const callCompleteAppointment = (appointmentId) => {
  return apiClient.put(`/appointments/${appointmentId}/complete`);
};

export const callFetchAppointment = () => {
  return apiClient.get('/appointments');
};

export const callFetchAppointmentOfCenter = (query) => {
  return apiClient.get(`/appointments/center?${query}`);
};

export const callMySchedule = () => {
  return apiClient.get('/appointments/my-schedules');
};

export const callVerifyAppointment = (appointmentHash, paymentHash) => {
  return apiClient.post('/appointments/verify', {
    appointmentHash,
    paymentHash,
  });
};

// export const callCreateAppointment = (data) => {
//   return apiClient.post('/appointments', data);
// };

export const callListAppointment = (params) => {
  return apiClient.get('/appointments', { params });
};

export const callConfirmAppointment = (id) => {
  return apiClient.patch(`/appointments/${id}/confirm`);
};

export const callBookAppointment = (id) => {
  return apiClient.post(`/appointments/${id}/book`);
};

export const callFinishAppointment = (id) => {
  return apiClient.post(`/appointments/${id}/finish`);
};

export const callRefundAppointment = (appointmentId) => {
  return apiClient.get(`/appointments/${appointmentId}/refund`);
};

export const callVerifyId = (id) => {
  return apiClient.get(`/appointments/${id}/verify`);
};

/**
 * Get urgent appointments for cashier dashboard
 * Returns appointments that need immediate attention:
 * - Pending reschedule requests
 * - Appointments without doctor assigned
 * - Appointments coming soon
 * - Overdue appointments
 */
export const callGetUrgentAppointments = () => {
  return apiClient.get('/appointments/urgent');
};

/**
 * Get today's appointments for doctor dashboard
 * Returns all appointments scheduled for today for the logged-in doctor
 */
export const callGetTodayAppointments = () => {
  return apiClient.get('/appointments/today');
};
