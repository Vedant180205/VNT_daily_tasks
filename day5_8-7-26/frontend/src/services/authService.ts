import { apiClient } from '../api/axios';
import { removeToken, setToken } from '../utils/auth';
import type { User } from '../types/auth';

export const authService = {
  register: async (data: any) => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },
  
  login: async (credentials: any): Promise<{ token: string; data: User }> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    if (response.data?.token) {
      setToken(response.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    removeToken();
    window.location.href = '/login';
  },
  
  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  }
};
