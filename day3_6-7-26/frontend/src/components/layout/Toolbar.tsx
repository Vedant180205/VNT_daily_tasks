import React from 'react';
import { ToolbarFilters } from './ToolbarFilters';
import { CreatePlayerDialog } from '../players/CreatePlayerDialog';

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
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-8 w-full border-b border-border/50 pb-6">
      <ToolbarFilters {...props} />
      
      <CreatePlayerDialog />
    </div>
  );
};
