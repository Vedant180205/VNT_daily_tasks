import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatsCard } from '../components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/axios';


export const DashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/api/dashboard');
      return response.data.data;
    }
  });

  if (isLoading) {
    return <PageContainer><div className="p-8 text-muted">Loading Mission Control...</div></PageContainer>;
  }

  const { kpis, topPlayers, recentActivity } = data;





  return (
    <PageContainer>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-[48px] font-[800] text-[#111827] tracking-tight leading-none">Analytics</h1>
            <div className="text-[13px] text-muted bg-white border border-border px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
              01.08.2022 - 31.08.2022
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex bg-secondary p-1 rounded-full items-center">
              <button className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              </button>
              <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20"></div>
              <span className="text-[14px] font-semibold">Admin User</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Players" 
            value={kpis?.totalPlayers || "0"} 
            trend="12.5%" 
            trendUp={true} 
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>}
          />
          <StatsCard 
            title="Total Enrollments" 
            value={kpis?.totalEnrollments || "0"} 
            trend="8.4%" 
            trendUp={true} 
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
          />
          <StatsCard 
            title="Total Teams" 
            value={kpis?.totalTeams || "0"} 
            trend="5.2%" 
            trendUp={true}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>}
          />
          <StatsCard 
            title="Total Organizers" 
            value={kpis?.totalOrganizers || "0"} 
            trend="2.1%" 
            trendUp={true}
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
          />
        </div>



        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="flex justify-between items-center pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-text flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Recent Activity Logs
                </CardTitle>
                <span className="text-xs text-muted">Latest performance updates</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-[11px] text-muted uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="pb-3 font-medium">Player Name</th>
                      <th className="pb-3 font-medium text-center">Batting</th>
                      <th className="pb-3 font-medium text-center">Bowling</th>
                      <th className="pb-3 font-medium text-center">Fielding</th>
                      <th className="pb-3 font-medium text-center">Total Points</th>
                      <th className="pb-3 font-medium text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentActivity && recentActivity.length > 0 ? (
                      recentActivity.map((log: any) => {
                        const totalPoints = log.batting_points + log.bowling_points + log.fielding_points;
                        return (
                          <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 font-semibold text-text">
                              <div>{log.player_full_name}</div>
                              <span className="text-[10px] text-muted font-normal">ID: {log.player_id}</span>
                            </td>
                            <td className="py-3 text-center text-gray-600">{log.batting_points}</td>
                            <td className="py-3 text-center text-gray-600">{log.bowling_points}</td>
                            <td className="py-3 text-center text-gray-600">{log.fielding_points}</td>
                            <td className="py-3 text-center">
                              <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
                                {totalPoints} pts
                              </span>
                            </td>
                            <td className="py-3 text-right text-gray-500 text-xs">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted">
                          No recent activity logs.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader className="flex justify-between items-center pb-2">
              <div>
                <CardTitle className="text-lg font-bold text-text flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                  MVP Leaderboard - Top 3
                </CardTitle>
                <span className="text-xs text-muted">Overall top match performers</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-[11px] text-muted uppercase tracking-wider border-b border-border">
                    <tr>
                      <th className="pb-3 font-medium w-12 text-center">Rank</th>
                      <th className="pb-3 font-medium">Player</th>
                      <th className="pb-3 font-medium text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topPlayers && topPlayers.length > 0 ? (
                      topPlayers.map((player: any, index: number) => {
                        const rank = index + 1;
                        let rankIcon = <span className="font-bold text-muted">{rank}</span>;
                        let rowBg = "";
                        if (rank === 1) {
                          rankIcon = <span className="text-xl">🏆</span>;
                          rowBg = "bg-yellow-50/40 hover:bg-yellow-50/70";
                        } else if (rank === 2) {
                          rankIcon = <span className="text-xl">🥈</span>;
                          rowBg = "bg-slate-50/50 hover:bg-slate-50/80";
                        } else if (rank === 3) {
                          rankIcon = <span className="text-xl">🥉</span>;
                          rowBg = "bg-amber-50/30 hover:bg-amber-50/60";
                        }
                        
                        return (
                          <tr key={player.id} className={`transition-colors ${rowBg}`}>
                            <td className="py-3 text-center">{rankIcon}</td>
                            <td className="py-3 font-semibold text-text">
                              <div>{player.name}</div>
                              <span className="text-[10px] text-muted font-normal">ID: {player.id}</span>
                            </td>
                            <td className="py-3 text-right font-bold text-primary">{player.points} pts</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted">
                          No players ranked yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </PageContainer>
  );
};
