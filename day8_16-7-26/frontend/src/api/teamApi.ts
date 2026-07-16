import { apiClient } from './axios';
import type { TeamResponse } from '../types/team';

export const fetchTeams = async (): Promise<TeamResponse> => {
  const { data } = await apiClient.get<TeamResponse>('/api/teams');
  return data;
};
