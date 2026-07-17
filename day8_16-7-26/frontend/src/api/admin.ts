import { apiClient } from './axios';

export const adminApi = {
  getPendingOrganizers: async () => {
    const response = await apiClient.get('/api/admin/organizers/pending');
    return response.data;
  },

  getOrganizers: async () => {
    const response = await apiClient.get('/api/admin/organizers');
    return response.data;
  },

  approveOrganizer: async (id: number) => {
    const response = await apiClient.patch(`/api/admin/organizers/${id}/approve`);
    return response.data;
  }
};
