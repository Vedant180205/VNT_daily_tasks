import React from 'react';
import { StatsCard } from '../ui/StatsCard';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { UserInfoCard } from '../auth/UserInfoCard';
import { LogOut, Users, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface DashboardHeaderProps {
  totalPlayers: number | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ totalPlayers }) => {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8"
    >
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-text tracking-tight mb-2">Management Console</h1>
          <p className="text-muted text-base">Manage players and teams efficiently from a single dashboard.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link 
            to="/players" 
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 border ${location.pathname === '/players' ? 'bg-primary text-white border-primary' : 'bg-surface text-muted border-border hover:bg-border/50'}`}
          >
            <Users size={16} /> Players
          </Link>
          <Link 
            to="/teams" 
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 border ${location.pathname === '/teams' ? 'bg-primary text-white border-primary' : 'bg-surface text-muted border-border hover:bg-border/50'}`}
          >
            <Shield size={16} /> Teams
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
        <UserInfoCard />
        
        <div className="flex items-center gap-4">
          {totalPlayers !== null && (
            <StatsCard title="Total Players" value={totalPlayers} />
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 h-[52px] bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-colors cursor-pointer"
            title="Logout"
          >
          <LogOut size={20} />
            <span className="hidden sm:inline font-medium">Logout</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
