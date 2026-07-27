export interface Player {
  id: number;
  name: string;
  email: string;
  phone: string;
  team_id?: number | null;
  team_name?: string | null;
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
