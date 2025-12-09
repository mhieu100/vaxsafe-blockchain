import apiClient from './apiClient';

export async function callCreateBooking(payload) {
  return apiClient.post('/api/bookings', payload);
}

export async function callCreateWalkInBooking(payload) {
  return apiClient.post('/api/bookings/walk-in', payload);
}

export async function getMyBookings() {
  return apiClient.get('/api/bookings/my-bookings');
}

export async function getMyBookingHistory() {
  return apiClient.get('/api/bookings/history');
}

export async function getGroupedBookingHistory() {
  return apiClient.get('/api/bookings/history/grouped');
}

export async function rescheduleAppointment(payload) {
  return apiClient.put('/api/appointments/reschedule', payload);
}

export async function checkAvailability(centerId, date) {
  return apiClient.get('/api/bookings/availability', {
    params: { centerId, date },
  });
}
