import { apiClient } from './axios';
import type { EnrollmentsResponse } from '../types/enrollment';

export interface FetchEnrollmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: number | string;
  invite_type?: number | string;
  role?: number | string;
  team_id?: number | string;
}

export const fetchEnrollments = async (params?: FetchEnrollmentsParams): Promise<EnrollmentsResponse> => {
  const { data } = await apiClient.get<EnrollmentsResponse>('/api/enrollments', { params });
  return data;
};
