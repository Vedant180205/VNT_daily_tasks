import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchPlayers } from '../api/playerApi';
import type { FetchPlayersParams } from '../api/playerApi';

export const usePlayers = (params: FetchPlayersParams) => {
  const query = useQuery({
    queryKey: ['players', params.page, params.limit, params.search, params.sort, params.order],
    queryFn: () => fetchPlayers(params),
    placeholderData: keepPreviousData,
  });

  return {
    players: query.data?.data || [],
    total: query.data?.total || null,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.isError,
    refetch: query.refetch
  };
};
