import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { useTeams } from '../hooks/useTeams';
import { useCreateTeam } from '../hooks/useMutations';
import { motion } from 'framer-motion';
import { Shield, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/Dialog';

export const TeamsPage: React.FC = () => {
  const { teams, loading, error } = useTeams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <PageContainer>
      <DashboardHeader totalPlayers={null} />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="text-blue-500" />
          Teams Overview
        </h2>
        
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Create Team
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
          Failed to load teams.
        </div>
      ) : teams.length === 0 ? (
        <div className="p-12 text-center bg-gray-900 rounded-xl border border-gray-800">
          <Shield className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-medium text-white mb-2">No Teams Found</h3>
          <p className="text-gray-400">There are no teams available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={team.id} 
              className="bg-gray-900 border border-gray-800 p-5 rounded-xl hover:border-gray-700 transition-colors flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-lg text-white">{team.name}</h3>
                <p className="text-xs text-gray-500 mt-1">ID: {team.id}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center font-bold text-lg">
                {team.name.charAt(0)}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <CreateTeamModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      )}
    </PageContainer>
  );
};

const CreateTeamModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const createTeam = useCreateTeam(() => onClose());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createTeam.mutate(name);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Create New Team</DialogTitle>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Team Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Thunderbolts"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createTeam.isPending || !name.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {createTeam.isPending ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
