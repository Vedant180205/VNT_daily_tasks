import { apiClient } from './axios';
import type { TeamResponse } from '../types/team';

export const fetchTeams = async (): Promise<TeamResponse> => {
  const { data } = await apiClient.get<TeamResponse>('/api/teams');
  return data;
};

export const createTeam = async (name: string) => {
  const { data } = await apiClient.post('/api/teams', { name });
  return data;
};
