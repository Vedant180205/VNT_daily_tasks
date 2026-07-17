import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { motion } from 'framer-motion';
import { useTeams } from '../hooks/useTeams';
import { Shield, Calendar } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { ErrorState } from '../components/ui/ErrorState';
import { CreateTeamDialog } from '../components/teams/CreateTeamDialog';
import { DeleteTeamDialog } from '../components/teams/DeleteTeamDialog';
import type { Team } from '../types/team';

export const TeamsPage: React.FC = () => {
  const { teams, loading, error } = useTeams();
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  return (
    <PageContainer>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10"
      >
        <div>
          <h1 className="text-[48px] font-[800] text-[#111827] tracking-tight leading-none stack-sans-headline-unique mb-2">Teams Management</h1>
          <p className="text-muted text-base">View and manage all active teams.</p>
        </div>
        <div className="flex justify-end">
          <CreateTeamDialog />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[76px] bg-white rounded-xl border border-gray-100 flex items-center px-6">
              <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse mr-4"></div>
              <div className="w-48 h-4 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh] bg-white rounded-[18px] border border-gray-100 shadow-sm">
          <Shield size={48} className="text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-text mb-1">No Teams Found</h3>
          <p className="text-sm text-muted">There are currently no teams in the system.</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="w-full bg-white rounded-[18px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.05)] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider">Team Name</th>
                  <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider text-right">Created At</th>
                  <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr 
                    key={team.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors h-[80px] group"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-[42px] h-[42px] rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Shield size={20} strokeWidth={2} />
                        </div>
                        <div className="font-bold text-[15px] text-text">{team.name}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 text-[14px] text-muted font-medium">
                        <Calendar size={14} className="stroke-[2]" />
                        {formatDate(team.created_at)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-3 text-right w-[100px]">
                      <div className="flex items-center justify-end">
                        <button 
                          onClick={() => setDeletingTeam(team)}
                          className="px-3 py-1.5 rounded-md text-[13px] font-semibold text-danger bg-danger/5 hover:bg-danger/10 transition-colors border border-danger/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {deletingTeam && (
            <DeleteTeamDialog 
              team={deletingTeam} 
              open={!!deletingTeam} 
              onOpenChange={(open) => !open && setDeletingTeam(null)} 
            />
          )}
        </motion.div>
      )}
    </PageContainer>
  );
};
