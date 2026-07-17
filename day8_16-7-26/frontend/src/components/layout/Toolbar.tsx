import React from 'react';
import { ToolbarFilters } from './ToolbarFilters';

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  order: string;
  onOrderChange: (value: string) => void;
  limit: number;
  onLimitChange: (value: number) => void;
  team: string;
  onTeamChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = (props) => {
  return (
    <div className="flex flex-col gap-6 mb-8 w-full">
      {/* Action Buttons Top Right */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto self-end">
      </div>

      {/* Filters White Card */}
      <div className="bg-white border border-gray-100 rounded-[18px] p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)] flex items-center w-full">
        <ToolbarFilters {...props} />
      </div>
    </div>
  );
};
