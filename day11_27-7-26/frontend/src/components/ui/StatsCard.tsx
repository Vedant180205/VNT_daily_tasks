import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, trendUp = true, icon }) => {
  return (
    <div className="bg-surface border border-border rounded-[20px] p-5 flex flex-col justify-between h-[140px] shadow-soft">
      <div className="flex justify-between items-start">
        <span className="text-[14px] text-muted font-medium">{title}</span>
        {icon && (
          <div className="w-8 h-8 rounded-[8px] bg-secondary flex items-center justify-center text-text border border-border">
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="text-[32px] font-bold text-text leading-tight mb-1">{value}</div>
        {trend && (
          <div className="flex items-center gap-1.5">
            <span className={`text-[12px] font-semibold ${trendUp ? 'text-success' : 'text-danger'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
            <span className="text-[12px] text-muted">since last month</span>
          </div>
        )}
      </div>
    </div>
  );
};
