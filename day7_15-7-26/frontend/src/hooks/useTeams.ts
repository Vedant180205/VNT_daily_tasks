import { useQuery } from '@tanstack/react-query';
import { fetchTeams } from '../api/teamApi';

export const useTeams = () => {
  const query = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    teams: query.data?.data || [],
    loading: query.isLoading,
    error: query.isError,
  };
};
