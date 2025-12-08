import apiClient from './apiClient';

export async function getNotificationSettings() {
  return apiClient.get('/api/notification-settings');
}

export async function updateNotificationSettings(settings) {
  return apiClient.put('/api/notification-settings', settings);
}
