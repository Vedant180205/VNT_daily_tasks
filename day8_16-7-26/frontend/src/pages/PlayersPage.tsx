import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { Toolbar } from '../components/layout/Toolbar';
import { PlayerGrid } from '../components/players/PlayerGrid';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { usePlayers } from '../hooks/usePlayers';
import { useDebounce } from '../hooks/useDebounce';
import { motion } from 'framer-motion';

export const PlayersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const team = searchParams.get('team') || '';
  const date = searchParams.get('date') || '';

  // Debounce the search term to avoid spamming the API
  const debouncedSearch = useDebounce(search, 400);

  const setParam = (key: string, value: string | number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(key, String(value));
    
    // Reset to page 1 whenever filters change (unless the param being changed IS the page)
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const { players, total, loading, isFetching, error, refetch } = usePlayers({
    page,
    limit,
    search: debouncedSearch,
    sort,
    order,
    team,
    date
  });

  const isInitialLoad = loading && players.length === 0;

  return (
    <PageContainer>
      <DashboardHeader totalPlayers={total} />
      
      <Toolbar 
        search={search}
        onSearchChange={(v) => {
          if (v) setParam('search', v);
          else handleClearSearch();
        }}
        sort={sort}
        onSortChange={(v) => setParam('sort', v)}
        order={order}
        onOrderChange={(v) => setParam('order', v)}
        limit={limit}
        onLimitChange={(v) => setParam('limit', v)}
        team={team}
        onTeamChange={(v) => {
          if (v) setParam('team', v);
          else {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('team');
            newParams.set('page', '1');
            setSearchParams(newParams);
          }
        }}
        date={date}
        onDateChange={(v) => {
          if (v) setParam('date', v);
          else {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('date');
            newParams.set('page', '1');
            setSearchParams(newParams);
          }
        }}
      />
      
      {isInitialLoad ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : players.length === 0 ? (
        <EmptyState 
          isSearchActive={debouncedSearch.length > 0} 
          onClearSearch={handleClearSearch} 
        />
      ) : (
        <motion.div 
          animate={{ opacity: isFetching ? 0.6 : 1 }} 
          transition={{ duration: 0.2 }}
        >
          <PlayerGrid players={players} />
          
          <Pagination 
            currentPage={page} 
            totalItems={total || 0} 
            limit={limit} 
            onPageChange={(p) => setParam('page', p)} 
          />
        </motion.div>
      )}
    </PageContainer>
  );
};
