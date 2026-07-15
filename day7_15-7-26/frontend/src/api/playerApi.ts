import { apiClient } from './axios';
import type { PlayerResponse } from '../types/player';

export interface FetchPlayersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: string;
  team?: string;
  date?: string;
}

export const fetchPlayers = async (params?: FetchPlayersParams): Promise<PlayerResponse> => {
  const { data } = await apiClient.get<PlayerResponse>('/api/players', { params });
  return data;
};

export const createPlayer = async (data: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<any> => {
  const res = await apiClient.post('/api/players', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
  return res.data.data;
};

export const updatePlayer = async (id: number, data: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<any> => {
  const res = await apiClient.put(`/api/players/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
  return res.data.data;
};

export const deletePlayer = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/players/${id}`);
};

export const uploadCsv = async (data: FormData): Promise<{ uploadId: string, message: string }> => {
  const res = await apiClient.post('/api/players/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getUploadStatus = async (uploadId: string): Promise<{ total: number, completed: number, failed: number, errors?: { name: string, email: string, reason: string }[] }> => {
  const res = await apiClient.get(`/api/players/upload/${uploadId}/status`);
  return res.data.data;
};
