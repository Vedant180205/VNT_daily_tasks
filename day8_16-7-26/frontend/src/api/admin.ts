import { apiClient } from './axios';

export const adminApi = {
  getPendingOrganizers: async () => {
    const response = await apiClient.get('/api/admin/organizers?status=pending');
    return response.data;
  },

  approveOrganizer: async (id: number) => {
    const response = await apiClient.patch(`/api/admin/organizers/${id}/approve`);
    return response.data;
  }
};
