export interface Player {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface PlayerResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  data: Player[];
}
