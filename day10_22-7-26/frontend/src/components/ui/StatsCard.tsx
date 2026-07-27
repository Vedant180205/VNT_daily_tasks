import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-[18px] p-4 flex flex-col min-w-[200px] shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[13px] text-muted font-semibold">{title}</span>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[32px] font-extrabold text-primary leading-none">{value}</span>
        {/* Subtle decorative graph SVG */}
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 15C5 15 10 5 15 5C20 5 25 18 30 18C35 18 40 10 45 10C50 10 55 16 60 16" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};
