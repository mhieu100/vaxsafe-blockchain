import apiClient from './apiClient';

export async function callCreateBooking(payload) {
  return apiClient.post('/api/bookings', payload);
}

export async function callCreateWalkInBooking(payload) {
  return apiClient.post('/api/bookings/walk-in', payload);
}

export async function getMyBookings() {
  return apiClient.get('/api/auth/my-bookings');
}

export async function getGroupedBookingHistory() {
  return apiClient.get('/api/auth/booking-history-grouped');
}

export async function rescheduleAppointment(payload) {
  return apiClient.put('/api/appointments/reschedule', payload);
}

export async function checkAvailability(centerId, date) {
  return apiClient.get('/api/bookings/availability', {
    params: { centerId, date },
  });
}

export async function callBookNextDose(payload) {
  return apiClient.post('/api/bookings/next-dose', payload);
}
