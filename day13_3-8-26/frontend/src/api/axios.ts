import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';
import { toast } from 'sonner';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach the token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to automatically handle 401 and 403 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        removeToken();
        // Only redirect if we are not already on login/register to avoid loops
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      } else if (error.response.status === 403) {
        const method = error.config?.method?.toUpperCase();
        
        // Non-GET requests are actions (edit, delete, create) -> show toaster alert
        if (method && method !== 'GET') {
          toast.error("Action Denied: You do not have the required permissions to perform this action.");
        }
      }
    }
    return Promise.reject(error);
  }
);
