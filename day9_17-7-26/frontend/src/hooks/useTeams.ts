import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTeams, createTeam, deleteTeam } from '../api/teamApi';

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

export const useCreateTeam = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      if (onSuccess) onSuccess();
    }
  });
};

export const useDeleteTeam = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      if (onSuccess) onSuccess();
    }
  });
};
