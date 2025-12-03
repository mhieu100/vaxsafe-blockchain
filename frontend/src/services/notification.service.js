import apiClient from './apiClient';

/**
 * Get current user's notification settings
 * GET /api/notification-settings
 */
export async function getNotificationSettings() {
  return apiClient.get('/notification-settings');
}

/**
 * Update notification settings
 * PUT /api/notification-settings
 */
export async function updateNotificationSettings(settings) {
  return apiClient.put('/notification-settings', settings);
}
