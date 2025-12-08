import apiClient from '../services/apiClient';

/**
 * Module Appointment
 */

// Duplicate APIs removed - use these services instead:
// - callCreateOrder -> use order.service.js
// - callCreateBooking -> use booking.service.js

export const callGetAppointment = (hash) => {
  return apiClient.get(`/api/appointments/${hash}`);
};

export const callGetOrder = () => {
  return apiClient.get('/api/orders');
};

export const updatePaymentPaypal = (bookingId, paymentId) => {
  return apiClient.post('/api/payments/paypal', {
    bookingId,
    paymentId,
  });
};

export const updatePaymentMetaMask = (paymentId, bookingId) => {
  return apiClient.post('/api/payments/meta-mask', {
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
  return apiClient.post('/api/appointments/meta-mark', {
    vaccineId,
    centerId,
    time,
    firstDoseDate,
    price,
    doseSchedules,
  });
};

export const callAllBookings = () => {
  return apiClient.get('/api/bookings');
};

export const callUpdateAppointment = (appointmentId, doctorId, slotId, actualScheduledTime) => {
  return apiClient.put('/api/appointments', {
    appointmentId,
    doctorId,
    slotId,
    actualScheduledTime,
  });
};

export const callCancelAppointment = (appointmentId) => {
  return apiClient.put(`/api/appointments/${appointmentId}/cancel`);
};

export const callCompleteAppointment = (appointmentId, data) => {
  return apiClient.put(`/api/appointments/${appointmentId}/complete`, data);
};

export const callFetchAppointment = () => {
  return apiClient.get('/api/appointments');
};

export const callFetchAppointmentOfCenter = (queryOrFilter) => {
  // If it contains '=' or '&', treat as full query string
  if (
    typeof queryOrFilter === 'string' &&
    (queryOrFilter.includes('=') || queryOrFilter.includes('&'))
  ) {
    return apiClient.get(`/api/appointments/center?${queryOrFilter}`);
  }
  // Otherwise, treat as filter value and use params
  return apiClient.get('/api/appointments/center', {
    params: queryOrFilter ? { filter: queryOrFilter } : {},
  });
};

export const callMySchedule = () => {
  return apiClient.get('/api/appointments/my-schedules');
};

export const callVerifyAppointment = (appointmentHash, paymentHash) => {
  return apiClient.post('/api/appointments/verify', {
    appointmentHash,
    paymentHash,
  });
};

// export const callCreateAppointment = (data) => {
//   return apiClient.post('/appointments', data);
// };

export const callListAppointment = (params) => {
  return apiClient.get('/api/appointments', { params });
};

export const callConfirmAppointment = (id) => {
  return apiClient.patch(`/api/appointments/${id}/confirm`);
};

export const callBookAppointment = (id) => {
  return apiClient.post(`/api/appointments/${id}/book`);
};

export const callFinishAppointment = (id) => {
  return apiClient.post(`/api/appointments/${id}/finish`);
};

export const callRefundAppointment = (appointmentId) => {
  return apiClient.get(`/api/appointments/${appointmentId}/refund`);
};

export const callVerifyId = (id) => {
  return apiClient.get(`/api/appointments/${id}/verify`);
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
  return apiClient.get('/api/appointments/urgent');
};

/**
 * Get today's appointments for doctor dashboard
 * Returns all appointments scheduled for today for the logged-in doctor
 */
export const callGetTodayAppointments = () => {
  return apiClient.get('/api/appointments/today');
};
