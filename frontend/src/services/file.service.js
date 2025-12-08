import apiClient from './apiClient';

export async function callUploadSingleFile(file, folder = 'user') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  return apiClient.post('/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
