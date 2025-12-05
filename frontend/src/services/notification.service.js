import apiClient from './apiClient';

/**
 * Get current user's notification settings
 * GET /api/api/notification-settings
 */
export async function getNotificationSettings() {
  return apiClient.get('/api/notification-settings');
}

/**
 * Update notification settings
 * PUT /api/api/notification-settings
 */
export async function updateNotificationSettings(settings) {
  return apiClient.put('/api/notification-settings', settings);
}
