export interface Team {
  id: number;
  name: string;
  created_at: string;
}

export interface TeamResponse {
  success: boolean;
  count: number;
  data: Team[];
}
