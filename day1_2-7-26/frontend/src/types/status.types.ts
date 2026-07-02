export interface StatusResponse {
  api: string;
  database: string;
  environment: string;
  timestamp: string;        // ISO date string, e.g., "2026-07-02T10:00:00Z"
  lastSuccessfulApiResponseAt: string | null;
}
