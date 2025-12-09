import apiClient from '../services/apiClient';

export const callGetAppointment = (hash) => {
  return apiClient.get(`/api/appointments/${hash}`);
};

export const callGetOrder = () => {
  return apiClient.get('/api/orders');
};

export const updatePaymentPaypal = (referenceId, paymentId) => {
  return apiClient.post('/api/payments/paypal', {
    referenceId,
    paymentId,
  });
};

export const updatePaymentMetaMask = (paymentId, referenceId) => {
  return apiClient.post('/api/payments/meta-mask', {
    paymentId,
    referenceId,
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
  if (
    typeof queryOrFilter === 'string' &&
    (queryOrFilter.includes('=') || queryOrFilter.includes('&'))
  ) {
    return apiClient.get(`/api/appointments/center?${queryOrFilter}`);
  }

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

export const callGetUrgentAppointments = () => {
  return apiClient.get('/api/appointments/urgent');
};

export const callGetTodayAppointments = () => {
  return apiClient.get('/api/appointments/today');
};
