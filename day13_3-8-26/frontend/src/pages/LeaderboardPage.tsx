import React, { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Trophy, Medal, Award, Clock } from 'lucide-react';
import { apiClient as api } from '../api/axios';
import { Card, CardContent } from '../components/ui/Card';

interface LeaderboardEntry {
  rank: number;
  playerId: number;
  name: string;
  points: number;
}

interface LeaderboardResponse {
  success: boolean;
  lastSynced: string;
  data: LeaderboardEntry[];
}

export const LeaderboardPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [lastSynced, setLastSynced] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<LeaderboardResponse>('/api/mvp/leaderboard');
      
      if (response.data.success) {
        setEntries(response.data.data);
        setLastSynced(response.data.lastSynced);
      } else {
        setError('Failed to load leaderboard data.');
      }
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.response?.data?.message || 'Error fetching leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Award className="text-amber-600" size={24} />;
      default:
        return <span className="font-bold text-gray-500 ml-2">{rank}</span>;
    }
  };

  const getRowStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 hover:bg-yellow-200 border-l-4 border-yellow-500 font-semibold shadow-sm";
      case 2:
        return "bg-slate-100 hover:bg-slate-200 border-l-4 border-slate-400 font-semibold shadow-sm";
      case 3:
        return "bg-orange-100 hover:bg-orange-200 border-l-4 border-orange-500 font-semibold shadow-sm";
      default:
        return "hover:bg-gray-50 border-l-4 border-transparent";
    }
  };

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[48px] font-[800] text-[#111827] tracking-tight leading-none mb-2 flex items-center gap-3">
              <Trophy className="text-primary" size={36} />
              MVP Leaderboard
            </h1>
            <p className="text-gray-500 mt-1">Live standings based on overall match performances.</p>
          </div>
          
          {lastSynced && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <Clock size={16} />
              Last updated: {new Date(lastSynced).toLocaleString()}
            </div>
          )}
        </div>

        {/* Content Section */}
        <Card className="w-full">
          
          {loading ? (
            <div className="p-12 flex justify-center items-center flex-col gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-gray-500 font-medium">Loading rankings...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p className="font-semibold">{error}</p>
              <button 
                onClick={fetchLeaderboard}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Try Again
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="font-medium text-lg">No player data available yet.</p>
            </div>
          ) : (
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-border text-muted text-sm font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6 w-24 text-center">Rank</th>
                    <th className="py-4 px-6">Player Name</th>
                    <th className="py-4 px-6 text-right w-48">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((player) => (
                    <tr key={player.playerId} className={`transition-colors ${getRowStyle(player.rank)}`}>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center">
                          {getRankIcon(player.rank)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{player.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">ID: {player.playerId}</div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center justify-center bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-sm">
                          {player.points} pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          )}
        </Card>
      </div>
    </PageContainer>
  );
};
