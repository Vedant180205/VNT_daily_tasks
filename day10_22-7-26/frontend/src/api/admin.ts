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

  approveOrganizer: async (id: number, expiresInHours: number) => {
    const response = await apiClient.patch(`/api/admin/organizers/${id}/approve`, { expiresInHours });
    return response.data;
  },

  rejectOrganizer: async (id: number, reason?: string) => {
    const response = await apiClient.patch(`/api/admin/organizers/${id}/reject`, { reason });
    return response.data;
  },

  verifyOrganizerDocuments: async (id: number) => {
    const response = await apiClient.patch(`/api/admin/organizers/${id}/verify-docs`);
    return response.data;
  },

  activateOrganizer: async (id: number) => {
    const response = await apiClient.patch(`/api/admin/organizers/${id}/activate`);
    return response.data;
  }
};
