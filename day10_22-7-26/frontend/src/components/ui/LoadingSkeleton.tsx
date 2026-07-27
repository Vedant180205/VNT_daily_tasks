import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-5 animate-pulse shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-border/60 rounded-full shrink-0"></div>
        <div className="space-y-2 w-full">
          <div className="h-5 bg-border/60 rounded w-1/2"></div>
          <div className="h-4 bg-border/60 rounded w-1/3"></div>
        </div>
      </div>
      <div className="space-y-3 mt-2">
        <div className="h-4 bg-border/60 rounded flex-1"></div>
        <div className="h-4 bg-border/60 rounded w-3/4"></div>
      </div>
    </div>
  );
};
