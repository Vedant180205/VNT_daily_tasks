import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchPlayers, fetchPlayer } from '../api/playerApi';
import type { FetchPlayersParams } from '../api/playerApi';

export const usePlayers = (params: FetchPlayersParams) => {
  const query = useQuery({
    queryKey: ['players', params.page, params.limit, params.search, params.sort, params.order, params.team, params.date, params.status],
    queryFn: () => fetchPlayers(params),
    placeholderData: keepPreviousData,
  });

  return {
    players: query.data?.data || [],
    total: query.data?.total || null,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.isError,
    errorObject: query.error,
    refetch: query.refetch
  };
};

export const usePlayer = (id: number | null) => {
  return useQuery({
    queryKey: ['player', id],
    queryFn: () => fetchPlayer(id as number),
    enabled: !!id,
  });
};
