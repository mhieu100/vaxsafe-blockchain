import apiClient from './apiClient';

/**
 * Upload a single file to the server
 * @param {File} file - The file to upload
 * @param {string} [folder='user'] - The folder to store the file (e.g., "user", "vaccine")
 * @returns {Promise} The uploaded file URL and timestamp
 */
export async function uploadFile(file, folder = 'user') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  return apiClient.post('/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
