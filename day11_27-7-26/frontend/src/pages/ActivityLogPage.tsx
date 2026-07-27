import React, { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Activity, Clock } from 'lucide-react';
import { apiClient as api } from '../api/axios';
import { Card, CardContent } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';

interface PerformanceLog {
  id: number;
  player_id: number;
  player_full_name: string;
  batting_points: number;
  bowling_points: number;
  fielding_points: number;
  created_at: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LogsResponse {
  success: boolean;
  data: PerformanceLog[];
  pagination: PaginationData;
}

export const ActivityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<PerformanceLog[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs(pagination.page);
  }, [pagination.page]);

  const fetchLogs = async (pageToFetch: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<LogsResponse>(`/api/mvp/logs?page=${pageToFetch}&limit=${pagination.limit}`);
      
      if (response.data.success) {
        setLogs(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to load performance logs.');
      }
    } catch (err: any) {
      console.error('Error fetching logs:', err);
      setError(err.response?.data?.message || 'Error fetching performance logs');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-8 px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <Activity className="text-primary" size={32} />
              Activity Logs
            </h1>
            <p className="text-gray-500 mt-1">Detailed MVP performance logs and player match history.</p>
          </div>
        </div>

        {/* Content Section */}
        <Card className="w-full">
          
          {loading && logs.length === 0 ? (
            <div className="p-12 flex justify-center items-center flex-col gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-gray-500 font-medium">Loading logs...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p className="font-semibold">{error}</p>
              <button 
                onClick={() => fetchLogs(pagination.page)}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Try Again
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Clock size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="font-medium text-lg">No activity logs found.</p>
            </div>
          ) : (
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-border text-muted text-sm font-semibold uppercase tracking-wider">
                      <th className="py-4 px-6">Player Name</th>
                      <th className="py-4 px-6 text-center">Batting</th>
                      <th className="py-4 px-6 text-center">Bowling</th>
                      <th className="py-4 px-6 text-center">Fielding</th>
                      <th className="py-4 px-6 text-center">Total Points</th>
                      <th className="py-4 px-6 text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border relative">
                    {loading && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    )}
                    {logs.map((log) => {
                      const totalPoints = log.batting_points + log.bowling_points + log.fielding_points;
                      return (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-gray-900">{log.player_full_name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">ID: {log.player_id}</div>
                          </td>
                          <td className="py-4 px-6 text-center text-gray-600">{log.batting_points}</td>
                          <td className="py-4 px-6 text-center text-gray-600">{log.bowling_points}</td>
                          <td className="py-4 px-6 text-center text-gray-600">{log.fielding_points}</td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
                              {totalPoints} pts
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right text-gray-500 text-sm">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 pb-6">
                <Pagination 
                  currentPage={pagination.page}
                  totalItems={pagination.total}
                  limit={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </PageContainer>
  );
};
