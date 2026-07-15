export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  role_name: string | null;
  permissions?: string[];
}
