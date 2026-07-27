import React, { useEffect, useState } from 'react';
import { StatsCard } from '../ui/StatsCard';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { LogOut, User } from 'lucide-react';

interface DashboardHeaderProps {
  totalPlayers: number | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ totalPlayers }) => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authService.getCurrentUser();
        setRole(res.data?.role || 'User');
      } catch (err) {
        console.error('Failed to get user role', err);
      }
    };
    fetchUser();
  }, []);
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10"
    >
      <div>
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-[48px] font-[800] text-[#111827] tracking-tight leading-none stack-sans-headline-unique">Player Management</h1>
          {role && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 mt-2">
              <User size={14} strokeWidth={2.5} />
              {role}
            </span>
          )}
        </div>
        <p className="text-muted text-base">Manage players efficiently from a single dashboard.</p>
      </div>
      
      <div className="flex items-center gap-4 self-start sm:self-auto">
        {totalPlayers !== null && (
          <StatsCard title="Total Players" value={totalPlayers} />
        )}
        <button
          onClick={() => authService.logout()}
          className="flex items-center gap-2 px-5 h-[52px] bg-white hover:bg-gray-50 text-danger border border-[#ECECEC] rounded-[14px] transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-[1px] hover:shadow-md font-medium"
          title="Logout"
        >
          <LogOut size={18} strokeWidth={2} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </motion.div>
  );
};
