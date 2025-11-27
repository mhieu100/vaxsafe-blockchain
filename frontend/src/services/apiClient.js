import { notification } from 'antd';
import { Mutex } from 'async-mutex';
import axios from 'axios';

const mutex = new Mutex();
const NO_RETRY_HEADER = 'x-no-retry';

/**
 * Main API client instance with token refresh interceptor
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://52.197.232.53:8080',
  withCredentials: true,
});

/**
 * Handle token refresh with mutex to prevent multiple simultaneous refresh calls
 * @returns {Promise<string|null>} New access token or null if refresh fails
 */
const handleRefreshToken = async () => {
  return await mutex.runExclusive(async () => {
    try {
      const response = await apiClient.get('/auth/refresh');
      if (response?.data?.accessToken) {
        return response.data.accessToken;
      }
      return null;
    } catch {
      // If refresh fails, logout user
      localStorage.removeItem('token');
      window.location.href = '/login';
      return null;
    }
  });
};

/**
 * Request interceptor - add authorization token to every request
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set default content type if not specified
    if (!config.headers.Accept && config.headers['Content-Type']) {
      config.headers.Accept = 'application/json';
      config.headers['Content-Type'] = 'application/json; charset=utf-8';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - handle 401 errors with token refresh
 */
apiClient.interceptors.response.use(
  (response) => response.data, // Automatically unwrap data
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors - attempt token refresh
    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/login/password' &&
      !originalRequest.headers[NO_RETRY_HEADER]
    ) {
      originalRequest.headers[NO_RETRY_HEADER] = 'true';

      const newToken = await handleRefreshToken();

      if (newToken) {
        // Update token in localStorage
        localStorage.setItem('token', newToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(originalRequest);
      }
    }

    // Handle 403 Forbidden errors - show notification
    if (error.response && error.response.status === 403) {
      notification.error({
        message: error?.response?.data?.message || 'Forbidden',
        description:
          error?.response?.data?.error || 'You do not have permission to access this resource.',
      });
    }

    // Return error response data or reject
    return error?.response?.data ?? Promise.reject(error);
  }
);

export default apiClient;
