import { notification } from 'antd';
import { Mutex } from 'async-mutex';
import axios from 'axios';

const mutex = new Mutex();
const NO_RETRY_HEADER = 'x-no-retry';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const handleRefreshToken = async () => {
  return await mutex.runExclusive(async () => {
    try {
      const response = await apiClient.get('/api/auth/refresh');
      if (response?.data?.accessToken) {
        return response.data.accessToken;
      }
      return null;
    } catch {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return null;
    }
  });
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.headers.Accept && config.headers['Content-Type']) {
      config.headers.Accept = 'application/json';
      config.headers['Content-Type'] = 'application/json; charset=utf-8';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest.url !== '/api/auth/login' &&
      originalRequest.url !== '/api/auth/login/password' &&
      !originalRequest.headers[NO_RETRY_HEADER]
    ) {
      originalRequest.headers[NO_RETRY_HEADER] = 'true';

      const newToken = await handleRefreshToken();

      if (newToken) {
        localStorage.setItem('token', newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(originalRequest);
      }
    }

    if (error.response && error.response.status === 403) {
      notification.error({
        message: error?.response?.data?.message || 'Forbidden',
        description:
          error?.response?.data?.error || 'You do not have permission to access this resource.',
      });
    }

    return error?.response?.data ?? Promise.reject(error);
  }
);

export default apiClient;
