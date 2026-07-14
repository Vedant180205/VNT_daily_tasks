import React from 'react';
import { StatsCard } from '../ui/StatsCard';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  totalPlayers: number | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ totalPlayers }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8"
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-text tracking-tight mb-2">Player Management</h1>
        <p className="text-muted text-base">Manage players efficiently from a single dashboard.</p>
      </div>
      
      <div className="flex items-center gap-4 self-start sm:self-auto">
        {totalPlayers !== null && (
          <StatsCard title="Total Players" value={totalPlayers} />
        )}
        <button
          onClick={() => authService.logout()}
          className="flex items-center gap-2 px-4 py-2 h-[52px] bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-colors cursor-pointer"
          title="Logout"
        >
          <LogOut size={20} />
          <span className="hidden sm:inline font-medium">Logout</span>
        </button>
      </div>
    </motion.div>
  );
};
