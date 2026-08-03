import React, { useEffect, useState } from 'react';
import { StatsCard } from '../ui/StatsCard';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { User } from 'lucide-react';

interface DashboardHeaderProps {
  totalPlayers: number | null;
  title?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ totalPlayers, title }) => {
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
          <h1 className="text-[48px] font-[800] text-[#111827] tracking-tight leading-none stack-sans-headline-unique">{title || "Player Management"}</h1>
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
          <StatsCard title="Total Players" value={totalPlayers} className="w-[180px] h-[90px] py-3.5" />
        )}
      </div>
    </motion.div>
  );
};
