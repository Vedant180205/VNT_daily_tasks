import React from 'react';
import { StatsCard } from '../ui/StatsCard';
import { motion } from 'framer-motion';

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
      
      {totalPlayers !== null && (
        <div className="self-start sm:self-auto">
          <StatsCard title="Total Players" value={totalPlayers} />
        </div>
      )}
    </motion.div>
  );
};
