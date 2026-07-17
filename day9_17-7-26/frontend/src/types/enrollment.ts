export interface Enrollment {
  id: number;
  name: string;
  phone: string;
  team_id: number;
  team_name?: string | null;
  status: number;
  invite_type: number;
  role: number;
  enrolled_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EnrollmentsResponse {
  success: boolean;
  data: Enrollment[];
  pagination: PaginationMeta;
}
