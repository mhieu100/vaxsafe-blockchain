import apiClient from '../services/apiClient';

/**
 * Service for managing medical observations (vitals, reactions, etc.)
 */

export const createObservationForPatient = (patientId, data) => {
  return apiClient.post(`/api/observations/patient/${patientId}`, data);
};

export const getMyObservations = () => {
  return apiClient.get('/api/observations/me');
};
