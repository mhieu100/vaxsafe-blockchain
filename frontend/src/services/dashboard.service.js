import apiClient from './apiClient';

const dashboardService = {
  getStats: async () => {
    const response = await apiClient.get('/api/admin/dashboard/stats');
    return response.data;
  },
  getDoctorStats: async () => {
    const response = await apiClient.get('/api/admin/dashboard/doctor-stats');
    return response.data;
  },
  getCashierStats: async () => {
    const response = await apiClient.get('/api/admin/dashboard/cashier-stats');
    return response.data;
  },
};

export default dashboardService;
