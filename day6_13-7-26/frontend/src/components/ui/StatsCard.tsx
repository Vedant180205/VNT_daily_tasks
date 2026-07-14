import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value }) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col items-start justify-center min-w-[160px] shadow-sm">
      <span className="text-xs text-muted font-semibold uppercase tracking-wider mb-2">{title}</span>
      <span className="text-3xl font-bold text-text">{value}</span>
    </div>
  );
};
