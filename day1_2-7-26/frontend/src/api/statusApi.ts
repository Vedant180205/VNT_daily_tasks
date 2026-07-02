import type { StatusResponse } from '../types/status.types';

export const getStatus = async (): Promise<StatusResponse> => {
  const response = await fetch('/api/internal/status');
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};
