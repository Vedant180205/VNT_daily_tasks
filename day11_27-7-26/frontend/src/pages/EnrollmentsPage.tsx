import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { EnrollmentsToolbar } from '../components/enrollments/EnrollmentsToolbar';
import { EnrollmentsTable } from '../components/enrollments/EnrollmentsTable';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { useEnrollments } from '../hooks/useEnrollments';
import { useDebounce } from '../hooks/useDebounce';
import { motion } from 'framer-motion';

export const EnrollmentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 50;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const invite_type = searchParams.get('invite_type') || '';
  const role = searchParams.get('role') || '';
  const team_id = searchParams.get('team_id') || '';

  // Debounce the search term
  const debouncedSearch = useDebounce(search, 400);

  const setParam = (key: string, value: string | number) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    
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

  const { enrollments, pagination, loading, isFetching, error, refetch, exportCSV } = useEnrollments({
    page,
    limit,
    search: debouncedSearch,
    ...(status !== '' && { status: Number(status) }),
    ...(invite_type !== '' && { invite_type: Number(invite_type) }),
    ...(role !== '' && { role: Number(role) }),
    ...(team_id !== '' && { team_id: Number(team_id) })
  });

  const isInitialLoad = loading && enrollments.length === 0;

  return (
    <PageContainer>
      <DashboardHeader totalPlayers={pagination?.total || 0} />
      
      <EnrollmentsToolbar
        search={search}
        onSearchChange={(v) => setParam('search', v)}
        status={status}
        onStatusChange={(v) => setParam('status', v)}
        invite_type={invite_type}
        onInviteTypeChange={(v) => setParam('invite_type', v)}
        role={role}
        onRoleChange={(v) => setParam('role', v)}
        team_id={team_id}
        onTeamIdChange={(v) => setParam('team_id', v)}
        limit={limit}
        onLimitChange={(v) => setParam('limit', v)}
        onExport={() => exportCSV({
          search: debouncedSearch,
          ...(status !== '' && { status: Number(status) }),
          ...(invite_type !== '' && { invite_type: Number(invite_type) }),
          ...(role !== '' && { role: Number(role) }),
          ...(team_id !== '' && { team_id: Number(team_id) })
        })}
      />
      
      {isInitialLoad ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-[72px] bg-white rounded-xl border border-gray-100 flex items-center px-6">
              <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse mr-4"></div>
              <div className="w-48 h-4 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : enrollments.length === 0 ? (
        <EmptyState 
          isSearchActive={debouncedSearch.length > 0} 
          onClearSearch={handleClearSearch} 
        />
      ) : (
        <motion.div 
          animate={{ opacity: isFetching ? 0.6 : 1 }} 
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4"
        >
          <EnrollmentsTable enrollments={enrollments} />
          
          <Pagination 
            currentPage={page} 
            totalItems={pagination?.total || 0} 
            limit={limit} 
            onPageChange={(p) => setParam('page', p)} 
          />
        </motion.div>
      )}
    </PageContainer>
  );
};
