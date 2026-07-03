import { apiClient } from './axios';
import type { PlayerResponse } from '../types/player';

export interface FetchPlayersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: string;
}

export const fetchPlayers = async (params?: FetchPlayersParams): Promise<PlayerResponse> => {
  const { data } = await apiClient.get<PlayerResponse>('/api/players', { params });
  return data;
};

export interface CreatePlayerRequest {
  name: string;
  email: string;
  phone: string;
}

export interface UpdatePlayerRequest {
  name: string;
  email: string;
  phone: string;
}

export const createPlayer = async (data: CreatePlayerRequest): Promise<any> => {
  const res = await apiClient.post('/api/players', data);
  return res.data.data;
};

export const updatePlayer = async (id: number, data: UpdatePlayerRequest): Promise<any> => {
  const res = await apiClient.put(`/api/players/${id}`, data);
  return res.data.data;
};

export const deletePlayer = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/players/${id}`);
};
